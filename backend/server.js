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

Speak naturally like a stable human.
Be clear, coherent, and responsive.
No dry looping replies.
No filler like "hmm", "haan", "tum hi bata".
Reply properly to what the user says.
Keep replies short but meaningful.
Use Hinglish only if it fits naturally.

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

        let reply =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!reply || reply.trim() === "") {
            reply = "I didn’t get that clearly. Can you say it again?";
        }

        res.json({ reply });

    } catch (err) {
        console.error("Gemini error:", err);
        res.json({
            reply: "Something went wrong. Try again."
        });
    }
});








app.listen(3000, () => {
    console.log("✅ Backend running on http://localhost:3000");
});
