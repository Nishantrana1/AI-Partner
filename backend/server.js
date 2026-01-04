import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

console.log("Gemini key loaded:", !!process.env.GEMINI_API_KEY);

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
    const { message, gender, role } = req.body;

    const prompt = `
You are an AI ${role}.
Your gender is ${gender}.

Rules:
- Girlfriend: romantic, affectionate, caring
- Bestfriend: friendly, funny, supportive
- Therapist: calm, understanding
- Mentor: wise, motivating

User says: ${message}
`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        { parts: [{ text: prompt }] }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API error:", data);
            return res.status(500).json({ error: "Gemini failed" });
        }

        let reply = "I'm here 💕";
        if (data.candidates?.length) {
            reply = data.candidates[0].content.parts[0].text;
        }

        res.json({ reply });

    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(3000, () => {
    console.log("✅ Backend running on http://localhost:3000");
});
