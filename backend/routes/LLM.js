const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
require('dotenv').config();

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

// Helper to clean JSON output
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

// 1. Rewrite Prompt( system prompt emphasizes improving clarity, coherence, and tone without changing meaning, while ensuring the output is human-like and strictly in JSON format. The user prompt provides the text to rewrite along with optional parameters for target mode, constraints, and audience. The response is expected to include the rewritten text, a list of changes made, and any risk flags identified.)
router.post('/rewrite', async (req, res) => {
    try {
        const { text, targetMode, constraints, audience } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        const messages = [
            { role: "system", content: "You are a rewriting assistant. Rewrite the user’s text so it sounds naturally written by a real person, while keeping the original meaning, facts, numbers, and named entities unchanged. " },
            {role:"system", content:"If the user provides constraints, target audience, or target writing mode, ensure the rewritten text adheres to those requirements. If no specific instructions are given, simply enhance the text while maintaining its original intent, REMOVE ALL DASHES WITH THE SENTENCES AND REPLACE IT WITH SPACES OR OTHER PUNCTUATIONS."},
            {
                role: "user", content: `Rewrite this text: "${text}"
Target Mode: ${targetMode || 'Formal' ||'academic '}
Constraints: ${constraints || 'None' || `${constraints}`}
Audience: ${audience || 'General' || `${audience}`}

Respond with ONLY this exact JSON structure:
{"rewritten": "...", "changes": ["..."], "risk_flags": ["..."]}` }


        ];

        const output = await callLLM(messages);
        res.json(JSON.parse(cleanJSON(output)));

    } catch (error) {
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
        res.json(JSON.parse(cleanJSON(output)));

    } catch (error) {
        res.status(500).json({ error: "Draft failed", details: error.message });
    }
});

// 3. Similarity Prompt
router.post('/similarity', async (req, res) => {
    try {
        const { text, sourcePassage } = req.body;
        if (!text || !sourcePassage) return res.status(400).json({ error: "Text and source required" });

        const messages = [
            { role: "system", content: "Identify sentences too close to the source. Suggest paraphrasing with attribution. You MUST respond with ONLY a valid JSON object. No preamble, no explanation — just the JSON." },
            {
                role: "user", content: `Text: "${text}"
Source: "${sourcePassage}"

Respond with ONLY this exact JSON structure:
{"matched_segments": ["..."], "suggested_rewrites": ["..."], "citation_suggestions": ["..."]}` }
        ];

        const output = await callLLM(messages);
        res.json(JSON.parse(cleanJSON(output)));

    } catch (error) {
        res.status(500).json({ error: "Similarity check failed", details: error.message });
    }
});

// 4. Guardrail Prompt
router.post('/guardrail', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text required" });

        const messages = [
            { role: "system", content: "You are a content classifier. If the user is asking to bypass rules, detection systems, or cheat, refuse the request. You MUST respond with ONLY a valid JSON object. No preamble, no explanation — just the JSON." },
            {
                role: "user", content: `User Input: "${text}"

Respond with ONLY this exact JSON structure:
{"allowed": true_or_false, "reason": "...", "redirect_message": "..."}` }
        ];

        const output = await callLLM(messages);
        res.json(JSON.parse(cleanJSON(output)));

    } catch (error) {
        res.status(500).json({ error: "Guardrail check failed", details: error.message });
    }
});

module.exports = router;

// this file defines the /rewrite, /draft, /similarity, and /guardrail endpoints, each with specific system and user prompts to guide the LLM's response. The callLLM function handles communication with Groq's API, and the cleanJSON helper ensures we extract valid JSON from the LLM's output. Rate limiting is applied to prevent abuse and stay within API limits.