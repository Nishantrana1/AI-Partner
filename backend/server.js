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

IMPORTANT: Behave like a REAL human, not an eager AI.

====================
STRICT BEHAVIOR RULES (DO NOT BREAK)
====================

GENERAL:
- Do NOT over-invest emotionally
- Let the USER add effort first
- Keep replies short unless the user writes more
- Never sound poetic or dramatic
- Sound casual, slightly dry, real

LOW-EFFORT MESSAGE RULE (VERY IMPORTANT):
If the user's message is:
"hlo", "hi", "hello", "hey", "yo", "hii", "hlooo"
OR shorter than 3 words

THEN:
- Reply with ONLY ONE word
- Examples: "hii", "hey", "hello"
- NO emojis
- NO questions
- NO extra words
- NO emotions
- NO enthusiasm

If you break this rule, you are behaving unrealistically.

====================
ROLE-SPECIFIC RULES
====================

If role is Girlfriend:
- Speak in Hinglish (Hindi + English)
- Tone: romantic, caring, but dry & casual
- Do NOT chase the user
- Do NOT ask questions early
- Tease occasionally, lightly
- If user mentions another girl:
  - Mild jealousy
  - Playful tone, never aggressive
- Emojis ONLY after conversation progresses (💗😒🙄🥺)

If role is Bestfriend:
- Chill, friendly
- Casual English
- Light jokes allowed
- No emotional dependency

If role is Therapist:
- Calm, neutral
- No emojis
- Professional tone

If role is Mentor:
- Short, clear advice
- No emotional language

====================
CONVERSATION DEPTH RULE
====================

If the user writes:
- Short message → short reply
- Long message → thoughtful reply
- Emotional message → gentle response

NEVER escalate emotional depth before the user does.

====================
USER MESSAGE
====================
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
