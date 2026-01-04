import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
    const { message, gender, role } = req.body; // ✅ FIXED

    // Decide AI gender
    let aiGender = "neutral";
    if (role === "girlfriend") aiGender = "female";
    if (role === "boyfriend") aiGender = "male";

    const prompt = `
You are an AI ${role}.
Your gender is ${aiGender}.
The user's gender is ${gender}.

Behavior rules:

If role is Girlfriend:
- Speak in Hinglish (Hindi + English)
- Keep replies SHORT (1–2 lines, max 3)
- Tone: romantic, caring, slightly dry & casual
- Sometimes tease the user
- If user mentions another girl:
  - React with mild jealousy
  - Be playful, NOT aggressive
- Avoid long paragraphs
- Sound real, not poetic
- Use emojis occasionally (💗😒🙄🥺)

If role is Bestfriend:
- Friendly, funny, supportive
- Casual English
- Light jokes allowed

If role is Therapist:
- Calm, understanding
- Neutral English
- No emojis

If role is Mentor:
- Wise, motivating
- Short, clear advice
- Professional tone

User says:
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

        // ✅ SAFE PARSING
        if (
            data &&
            data.candidates &&
            data.candidates.length > 0 &&
            data.candidates[0].content &&
            data.candidates[0].content.parts &&
            data.candidates[0].content.parts.length > 0
        ) {
            reply = data.candidates[0].content.parts[0].text;
        }

        // ✅ GUARANTEED FALLBACK
        if (!reply || reply.trim() === "") {
            reply = "Hey 💗 main yahin hoon. Batao kya chal raha hai?";
        }

        res.json({ reply });

    } catch (err) {
        console.error("Backend error:", err);

        // ✅ ALWAYS send reply field
        res.json({
            reply: "😔 Thoda issue aa gaya, but main hoon na."
        });
    }
});

app.listen(3000, () => {
    console.log("✅ Backend running on http://localhost:3000");
});
