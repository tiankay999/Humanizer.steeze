const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const MODEL_NAME = "meta-llama/Llama-3.1-8B-Instruct";
const API_URL = `https://api-inference.huggingface.co/models/${MODEL_NAME}/v1/chat/completions`;

// Rate Limiter (15 RPM for free tier safety)
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

async function callHF(messages, retries = 1) {
    if (!process.env.HF_ACCESS_TOKEN) {
        throw new Error("Missing HF_ACCESS_TOKEN in .env");
    }

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.HF_ACCESS_TOKEN}`,
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
                // If model is loading (503), wait and retry
                if (response.status === 503 && attempt < retries) {
                    console.log("Model is loading, waiting 20s before retry...");
                    await new Promise(r => setTimeout(r, 20000));
                    continue;
                }
                throw new Error(`HF API Error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            if (attempt < retries && error.message?.includes('503')) {
                console.log("Model is loading, waiting 20s before retry...");
                await new Promise(r => setTimeout(r, 20000));
                continue;
            }
            console.error("HF Inference Error:", error);
            throw error;
        }
    }
}

// 1. Rewrite Prompt
router.post('/rewrite', async (req, res) => {
    try {
        const { text, targetMode, constraints, audience } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        const messages = [
            { role: "system", content: "You are a writing assistant. Improve clarity and tone without changing meaning. Do not claim the text is human-written. You MUST respond with ONLY a valid JSON object. No preamble, no explanation — just the JSON." },
            {
                role: "user", content: `Rewrite this text: "${text}"
Target Mode: ${targetMode || 'Formal'}
Constraints: ${constraints || 'None'}
Audience: ${audience || 'General'}

Respond with ONLY this exact JSON structure:
{"rewritten": "...", "changes": ["..."], "risk_flags": ["..."]}` }
        ];

        const output = await callHF(messages);
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

        const output = await callHF(messages);
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

        const output = await callHF(messages);
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

        const output = await callHF(messages);
        res.json(JSON.parse(cleanJSON(output)));

    } catch (error) {
        res.status(500).json({ error: "Guardrail check failed", details: error.message });
    }
});

module.exports = router;