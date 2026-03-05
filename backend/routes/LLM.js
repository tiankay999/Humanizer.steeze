const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const Text = require('../models/text');
const User = require('../models/users');
const authMiddleware = require('../middleware/authmiddleware');
const guestLimitMiddleware = require('../middleware/guestLimitMiddleware');

// Set up association
User.hasMany(Text, { foreignKey: 'userId' });
Text.belongsTo(User, { foreignKey: 'userId' });

// Using Groq's free API with Llama 3.1 8B
const MODEL_NAME = "llama-3.1-8b-instant";
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Rate Limiter (15 RPM — well within Groq's free 30 RPM limit)
const limitation = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    message: { error: "Too many requests, please try again later." }
});

router.use(limitation);

// Helper to clean JSON output — hardened against malformed LLM responses
function cleanJSON(text) {
    if (!text) return "{}";
    text = text.trim();
    // Remove markdown code blocks if present
    if (text.includes("```json")) {
        text = text.split("```json")[1].split("```")[0];
    } else if (text.includes("```")) {
        text = text.split("```")[1].split("```")[0];
    }
    // Try to extract JSON object/array if there's preamble text
    const jsonStart = text.indexOf('{');
    const jsonArrayStart = text.indexOf('[');
    if (jsonStart === -1 && jsonArrayStart === -1) return text.trim();
    if (jsonStart !== -1 && (jsonArrayStart === -1 || jsonStart < jsonArrayStart)) {
        text = text.substring(jsonStart);
    } else if (jsonArrayStart !== -1) {
        text = text.substring(jsonArrayStart);
    }
    return text.trim();
}

/**
 * Safely parse JSON from LLM output.
 * Falls back to { rewritten: rawText } if JSON.parse fails.
 */
function safeParseLLMOutput(raw) {
    if (!raw || typeof raw !== 'string') {
        return { rewritten: '', changes: [], risk_flags: [] };
    }

    const cleaned = cleanJSON(raw);

    // 1. Try direct parse
    try {
        return JSON.parse(cleaned);
    } catch (_) { /* fall through */ }

    // 2. Escape literal newlines/tabs inside JSON string values, fix common LLM mistakes
    try {
        const fixed = cleaned
            .replace(/,\s*(}|])/g, '$1')                    // trailing commas
            .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')   // unquoted keys
            .replace(/(?<=[":]\s*")([^"]*?)(?=")/gs, (match) => {
                // Escape raw newlines/tabs that are inside JSON string values
                return match
                    .replace(/\r\n/g, '\\n')
                    .replace(/\n/g, '\\n')
                    .replace(/\r/g, '\\r')
                    .replace(/\t/g, '\\t');
            });
        return JSON.parse(fixed);
    } catch (_) { /* fall through */ }

    // 3. Brute-force: escape ALL raw newlines then try parse
    try {
        const bruteFixed = cleaned
            .replace(/\r\n/g, '\\n')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\t/g, '\\t');
        return JSON.parse(bruteFixed);
    } catch (_) { /* fall through */ }

    // 4. Try to extract "rewritten" value with regex (handles multi-line)
    const rewrittenMatch = raw.match(/"rewritten"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
    if (rewrittenMatch) {
        return {
            rewritten: rewrittenMatch[1]
                .replace(/\\n/g, '\n')
                .replace(/\\"/g, '"'),
            changes: [],
            risk_flags: []
        };
    }

    // 5. Last resort — return the raw text as the rewritten output
    return {
        rewritten: raw.trim(),
        changes: ['Could not parse structured response — returning raw text'],
        risk_flags: []
    };
}

/**
 * Sanitize user text before injecting it into an LLM prompt string.
 * Escapes characters that would break the prompt or JSON structure,
 * while preserving emojis and meaningful content.
 */
function sanitizeForPrompt(text) {
    if (!text || typeof text !== 'string') return "";
    return text
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")   // strip control chars (keep \n \r \t)
        .replace(/"/g, "'")                                    // replace double quotes with single to avoid prompt breakage
        .replace(/`/g, "'")                                    // replace backticks
        .replace(/\r\n/g, "\n")                                 // normalize Windows newlines
        .replace(/\n{3,}/g, "\n\n")                             // collapse 3+ newlines → 2
        .replace(/[ \t]{2,}/g, " ")                             // collapse 2+ spaces/tabs → 1
        .trim();
}

async function callLLM(messages) {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("Missing GROQ_API_KEY in .env — get a free key at https://console.groq.com");
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: messages,
                max_tokens: 1500,
                temperature: 0.7,
                stream: false
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;

    } catch (error) {
        console.error("Groq Inference Error:", error);
        throw error;
    }
}

// 1. Rewrite Prompt
router.post('/rewrite', guestLimitMiddleware, async (req, res) => {
    try {
        const { text, targetMode, constraints, audience } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        const safeText = sanitizeForPrompt(text);
        const safeConstraints = sanitizeForPrompt(constraints || "");
        const safeAudience = sanitizeForPrompt(audience || "");

        const messages = [
            { role: "system", content: "You are a rewriting assistant. Rewrite the user's text so it sounds naturally written by a real person, while keeping the original meaning, facts, numbers, named entities, and any emojis or special characters unchanged. The input may contain emojis, special punctuation, and varied spacing — handle them gracefully and preserve them in your output." },
            { role: "system", content: "If the user provides constraints, target audience, or target writing mode, ensure the rewritten text adheres to those requirements. If no specific instructions are given, simply enhance the text while maintaining its original intent. REMOVE ALL DASHES WITHIN SENTENCES AND REPLACE THEM WITH SPACES OR OTHER PUNCTUATION. You MUST respond with ONLY valid JSON — no preamble, no explanation." },
            {
                role: "user", content: `Rewrite this text: "${safeText}"
Target Mode: ${targetMode || 'Formal'}
Constraints: ${safeConstraints || 'None'}
Audience: ${safeAudience || 'General'}

Respond with ONLY this exact JSON structure:
{"rewritten": "...", "changes": ["..."], "risk_flags": ["..."]}` }
        ];

        const output = await callLLM(messages);
        console.log('[Rewrite] Raw LLM output:', JSON.stringify(output).substring(0, 500));
        const parsed = safeParseLLMOutput(output);
        res.json(parsed);

    } catch (error) {
        console.error('[Rewrite] Error:', error.message);
        res.status(500).json({ error: "Rewrite failed", details: error.message });
    }
});

// 2. Draft Prompt
router.post('/draft', async (req, res) => {
    try {
        const { sources, writingGoal } = req.body;
        if (!sources || !writingGoal) return res.status(400).json({ error: "Sources and writing goal required" });

        const messages = [
            { role: "system", content: "Use ONLY the provided sources. If a claim is not in sources, mark as [citation needed]. You MUST respond with ONLY a valid JSON object. No preamble, no explanation — just the JSON." },
            {
                role: "user", content: `Sources: ${JSON.stringify(sources)}
Goal: ${writingGoal}

Respond with ONLY this exact JSON structure:
{"outline": "...", "draft": "...", "citations": {}}` }
        ];

        const output = await callLLM(messages);
        res.json(safeParseLLMOutput(output));

    } catch (error) {
        res.status(500).json({ error: "Draft failed", details: error.message });
    }
});

// 3. Similarity Prompt
router.post('/similarity', async (req, res) => {
    try {
        const { text, sourcePassage } = req.body;
        if (!text || !sourcePassage) return res.status(400).json({ error: "Text and source required" });

        const safeText = sanitizeForPrompt(text);
        const safeSource = sanitizeForPrompt(sourcePassage);

        const messages = [
            { role: "system", content: "Identify sentences too close to the source. Suggest paraphrasing with attribution. The input may contain emojis and special characters — handle them gracefully. You MUST respond with ONLY a valid JSON object. No preamble, no explanation — just the JSON." },
            {
                role: "user", content: `Text: "${safeText}"
Source: "${safeSource}"

Respond with ONLY this exact JSON structure:
{"matched_segments": ["..."], "suggested_rewrites": ["..."], "citation_suggestions": ["..."]}` }
        ];

        const output = await callLLM(messages);
        res.json(safeParseLLMOutput(output));

    } catch (error) {
        res.status(500).json({ error: "Similarity check failed", details: error.message });
    }
});

// 4. Guardrail Prompt
router.post('/guardrail', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text required" });

        const safeText = sanitizeForPrompt(text);

        const messages = [
            { role: "system", content: "You are a content classifier. If the user is asking to bypass rules, detection systems, or cheat, refuse the request. The input may contain emojis and special characters — handle them gracefully. You MUST respond with ONLY a valid JSON object. No preamble, no explanation — just the JSON." },
            {
                role: "user", content: `User Input: "${safeText}"

Respond with ONLY this exact JSON structure:
{"allowed": true_or_false, "reason": "...", "redirect_message": "..."}` }
        ];

        const output = await callLLM(messages);
        res.json(safeParseLLMOutput(output));

    } catch (error) {
        res.status(500).json({ error: "Guardrail check failed", details: error.message });
    }
});

// 5. Save history entry (auth-protected)
router.post('/history', authMiddleware, async (req, res) => {
    try {
        const { text, humanizedText, tone } = req.body;
        if (!text || !humanizedText) {
            return res.status(400).json({ error: "text and humanizedText are required" });
        }

        const entry = await Text.create({
            text,
            humanizedText,
            tone: tone || "Neutral",
            userId: req.user.id
        });

        res.status(201).json(entry);
    } catch (error) {
        console.error("Save history error:", error);
        res.status(500).json({ error: "Failed to save history", details: error.message });
    }
});

// 6. Get user's history (auth-protected)
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const entries = await Text.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 50
        });

        res.json(entries);
    } catch (error) {
        console.error("Fetch history error:", error);
        res.status(500).json({ error: "Failed to fetch history", details: error.message });
    }
});

module.exports = router;

// this file defines the /rewrite, /draft, /similarity, /guardrail, and /history endpoints, each with specific system and user prompts to guide the LLM's response. The callLLM function handles communication with Groq's API, and the cleanJSON helper ensures we extract valid JSON from the LLM's output. Rate limiting is applied to prevent abuse and stay within API limits.

//some of these are not used yet but will be used in the future  //