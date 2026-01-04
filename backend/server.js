import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/chat", async (req, res) => {
    const userMessage = req.body.message;
    const rolePrompt = req.body.prompt;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [
                        { parts: [{ text: rolePrompt + userMessage }] }
                    ]
                })
            }
        );

        const data = await response.json();
        res.json({ reply: data.candidates[0].content.parts[0].text });

    } catch (err) {
        res.status(500).json({ error: "AI error" });
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
