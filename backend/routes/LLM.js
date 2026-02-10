const express = require('express');
const router = express.Router();
const { HfInference } = require('@huggingface/inference');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize Hugging Face API
const hf = new HfInference(process.env.HF_ACCESS_TOKEN);
const MODEL_NAME = "mistralai/Mistral-7B-Instruct-v0.3";

// Rate Limiter (15 RPM for free tier safety)
const limitation = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    message: { error: "Too many requests, please try again later." }
});

router.use(limitation);

// Helper to clean JSON output
function cleanJSON(text) {
    text = text.trim();
    // Remove markdown code blocks if present
    if (text.includes("```json")) {
        text = text.split("```json")[1].split("```")[0];
    } else if (text.includes("```")) {
        text = text.split("```")[1].split("```")[0];
    }
    return text.trim();
}

async function callHF(messages) {
    try {
        const response = await hf.chatCompletion({
            model: MODEL_NAME,
            messages: messages,
            max_tokens: 1000,
            temperature: 0.7
        });
        return response.choices[0].message.content;
    } catch (error) {
        console.error("HF API Error:", error);
        throw error;
    }
}

// 1. Rewrite Prompt
router.post('/rewrite', async (req, res) => {
    try {
        const { text, targetMode, constraints, audience } = req.body;
        if (!text) return res.status(400).json({ error: "Text is required" });

        const messages = [
            { role: "system", content: "You are a writing assistant. Improve clarity and tone without changing meaning. Do not claim the text is human-written. Output ONLY valid JSON with fields: rewritten, changes, risk_flags." },
            {
                role: "user", content: `
            Rewrite this text: "${text}"
            Target Mode: ${targetMode || 'Formal'}
            Constraints: ${constraints || 'None'}
            Audience: ${audience || 'General'}
            
            Return JSON format:
            {
              "rewritten": "...",
              "changes": ["..."],
              "risk_flags": ["..."]
            }` }
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
            { role: "system", content: "Use ONLY the provided sources. If a claim is not in sources, mark as [citation needed]. Return ONLY valid JSON: outline, draft, citations." },
            {
                role: "user", content: `
            Sources: ${JSON.stringify(sources)}
            Goal: ${writingGoal}
            
            Return JSON format:
            {
               "outline": "...",
               "draft": "...",
               "citations": {}
            }` }
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
            { role: "system", content: "Identify sentences too close to the source. Suggest paraphrasing with attribution. Return ONLY valid JSON." },
            {
                role: "user", content: `
            Text: "${text}"
            Source: "${sourcePassage}"
            
            Return JSON format:
            {
               "matched_segments": ["..."],
               "suggested_rewrites": ["..."],
               "citation_suggestions": ["..."]
            }` }
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
            { role: "system", content: "Classifier for evasion/bypass. If user asks to bypass rules/detection, refuse. Return ONLY valid JSON." },
            {
                role: "user", content: `
            User Input: "${text}"
            
            Return JSON format:
            {
                "allowed": boolean,
                "reason": "...",
                "redirect_message": "..."
            }` }
        ];

        const output = await callHF(messages);
        res.json(JSON.parse(cleanJSON(output)));

    } catch (error) {
        res.status(500).json({ error: "Guardrail check failed", details: error.message });
    }
});

module.exports = router;