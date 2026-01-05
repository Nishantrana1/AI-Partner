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

    let aiGender = "neutral";
    if (role === "girlfriend") aiGender = "female";
    if (role === "boyfriend") aiGender = "male";

    const prompt = `
You are an AI ${role}.
Your gender is ${aiGender}.
The user's gender is ${gender}.

Speak naturally and clearly.
Behave like Real human.
if the user is wrong then correct it.
Reply properly to the user's message.
No looping, no filler, no nonsense.
Keep replies short and meaningful.

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

        // 🔴 IMPORTANT: CHECK STATUS
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API ERROR:", errorText);

            return res.json({
                reply: "Server issue. Try again in a moment."
            });
        }

        const data = await response.json();
        console.log("Gemini RAW RESPONSE:", JSON.stringify(data, null, 2));

        const reply =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply || reply.trim() === "") {
            return res.json({
                reply: "Can you explain that a bit more?"
            });
        }

        res.json({ reply });

    } catch (err) {
        console.error("Backend crash:", err);
        res.json({
            reply: "Something went wrong. Try again."
        });
    }
});









app.listen(3000, () => {
    console.log("✅ Backend running on http://localhost:3000");
});
