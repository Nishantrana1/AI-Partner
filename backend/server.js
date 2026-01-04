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
    const trimmed = message.trim().toLowerCase();

    // ===============================
    // 1️⃣ GREETINGS (NO GEMINI)
    // ===============================
    const greetings = ["hi", "hii", "hello", "hey", "hlo", "yo"];
    if (trimmed.length <= 3 || greetings.includes(trimmed)) {
        return res.json({ reply: "hii" });
    }

    // ===============================
    // 2️⃣ QUESTION DETECTION
    // ===============================
    const isQuestion =
        trimmed.endsWith("?") ||
        trimmed.startsWith("kya") ||
        trimmed.startsWith("kyu") ||
        trimmed.startsWith("kaise");

    // ===============================
    // 3️⃣ SHORT / LOW-DEPTH MESSAGES
    // ===============================
    if (trimmed.length < 10) {
        const neutral = ["acha", "haan", "theek"];
        const question = ["tum hi bato", "shayad", "ho sakta hai"];
        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

        return res.json({
            reply: isQuestion ? pick(question) : pick(neutral)
        });
    }

    // ===============================
    // 4️⃣ GEMINI (ONLY FOR REAL MESSAGES)
    // ===============================
    let aiGender = "neutral";
    if (role === "girlfriend") aiGender = "female";
    if (role === "boyfriend") aiGender = "male";

    const prompt = `
You are an AI ${role}.
Your gender is ${aiGender}.
The user's gender is ${gender}.

Behave like a real human.
respect,romantic, casual, Hinglish if girlfriend.
Do NOT over-invest.
Keep replies short (1–3 lines max).
No poetic language.

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
        // 4️⃣ SMART FALLBACKS
        // ===============================
        const neutralFallbacks = ["acha", "haan", "bol", "theek"];
        const questionFallbacks = ["kya lagta hai", "shayad", "tu hi bata"];

        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

        if (!reply || reply.trim() === "") {
            reply = isQuestion ? pick(questionFallbacks) : pick(neutralFallbacks);
        }

        res.json({ reply });

    } catch (err) {
        console.error("Backend error:", err);
        res.json({ reply: "acha" });
    }
});








app.listen(3000, () => {
    console.log("✅ Backend running on http://localhost:3000");
});
