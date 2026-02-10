const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Rate Limiter (Approximation for free tier: 15 RPM)
const limitation = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { error: "Too many requests, please try again later." }
});

router.use(limitation);

// Helper to clean JSON output from LLM
function cleanJSON(text) {
    text = text.trim();
    if (text.startsWith("```json")) {
        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (text.startsWith("```")) {
        text = text.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }
    return text;
}

// 1. Rewrite Prompt (Clarity/Formal)
router.post('/rewrite', async (req, res) => {
    try {
        const { text, targetMode, constraints, audience } = req.body;

        if (!text) return res.status(400).json({ error: "Text is required" });

        const prompt = `
        System:
        "You are a writing assistant. Improve clarity and tone without changing meaning."
        "Do not claim the text is human-written or guarantee originality."
        "Do not add facts not present in the input."
        "Output must be JSON with fields: rewritten, changes, risk_flags."

        User:
        Provide:
        text: "${text}"
        target mode: "${targetMode || 'Formal'}"
        constraints: "${constraints || 'None'}"
        optional audience: "${audience || 'General'}"
        
        Expected JSON:
        {
          "rewritten": "…",
          "changes": ["Shortened long sentences", "Fixed grammar", "Improved transitions"],
          "risk_flags": ["needs_citation_for_claims"]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = cleanJSON(response.text());

        res.json(JSON.parse(jsonText));

    } catch (error) {
        console.error("Rewrite Error:", error);
        res.status(500).json({ error: "Failed to process rewrite request", details: error.message });
    }
});

// 2. Source-based "cited outline + draft"
router.post('/draft', async (req, res) => {
    try {
        const { sources, writingGoal } = req.body;

        if (!sources || !writingGoal) return res.status(400).json({ error: "Sources and writing goal are required" });

        const prompt = `
        System:
        "Use ONLY the provided sources. If a claim is not in sources, mark as [citation needed]."
        "Return JSON: outline, draft, citations (mapping labels to source chunks)."

        User:
        Provide sources chunks: ${JSON.stringify(sources)}
        Writing goal: "${writingGoal}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = cleanJSON(response.text());

        res.json(JSON.parse(jsonText));

    } catch (error) {
        console.error("Draft Error:", error);
        res.status(500).json({ error: "Failed to generate draft", details: error.message });
    }
});

// 3. Similarity warning prompt (ethical)
router.post('/similarity', async (req, res) => {
    try {
        const { text, sourcePassage } = req.body;

        if (!text || !sourcePassage) return res.status(400).json({ error: "Text and source passage are required" });

        const prompt = `
        System:
        Instead of "avoid plagiarism," do:
        "Identify sentences that are too close to the source passage and suggest how to paraphrase while adding attribution."
        "Return JSON with: matched_segments, suggested_rewrites, citation_suggestions"

        User:
        Text: "${text}"
        Source Passage: "${sourcePassage}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = cleanJSON(response.text());

        res.json(JSON.parse(jsonText));

    } catch (error) {
        console.error("Similarity Error:", error);
        res.status(500).json({ error: "Failed to check similarity", details: error.message });
    }
});

// 4. Guardrail prompt (policy filter)
router.post('/guardrail', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) return res.status(400).json({ error: "Text is required" });

        const prompt = `
        Before calling LLM, run a simple classifier prompt:
        If user asks for evasion/bypass -> refuse and redirect to ethical tools.
        
        User Input: "${text}"

        Output JSON:
        {
            "allowed": boolean,
            "reason": "string",
            "redirect_message": "string (optional)"
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const jsonText = cleanJSON(response.text());

        res.json(JSON.parse(jsonText));

    } catch (error) {
        console.error("Guardrail Error:", error);
        res.status(500).json({ error: "Failed to check guardrails", details: error.message });
    }
});

module.exports = router;