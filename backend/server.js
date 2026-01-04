import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
    const { message, gender, role } = req.body;

    // ===============================
    // 🔒 STEP 1: LOW-EFFORT GUARD
    // ===============================
    const trimmed = message.trim().toLowerCase();

    const lowEffort = [
        "hi", "hii", "hello", "hey", "hlo", "yo", "hlooo"
    ];

    if (trimmed.length <= 3 || lowEffort.includes(trimmed)) {
        return res.json({ reply: "hii" }); // 👈 NO GEMINI CALL
    }

    // ===============================
    // STEP 2: AI CONFIG
    // ===============================
    let aiGender = "neutral";
    if (role === "girlfriend") aiGender = "female";
    if (role === "boyfriend") aiGender = "male";

    const prompt = `
You are an AI ${role}.
Your gender is ${aiGender}.
The user's gender is ${gender}.

Behave like a REAL human.
Do NOT over-invest.
Do NOT escalate emotionally.
Keep replies short and casual.
Speak Hinglish if girlfriend.
Never be poetic or dramatic.

User message:
${message}
`;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );

        const data = await response.json();

        let reply = null;

        if (
            data?.candidates?.length &&
            data.candidates[0]?.content?.parts?.length
        ) {
            reply = data.candidates[0].content.parts[0].text;
        }

        // ===============================
        // STEP 3: HUMAN FALLBACK
        // ===============================
        if (!reply || reply.trim() === "") {
            reply = "hmm";
        }

        res.json({ reply });

    } catch (err) {
        console.error("Backend error:", err);
        res.json({ reply: "hmm" });
    }
});

app.listen(3000, () => {
    console.log("✅ Backend running on http://localhost:3000");
});
