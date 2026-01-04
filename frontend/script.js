let selectedGender = "";
let selectedRole = "";

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");

// STEP 1
function selectGender(gender) {
    selectedGender = gender;
    document.getElementById("genderScreen").classList.add("hidden");
    document.getElementById("roleScreen").classList.remove("hidden");
}

// STEP 2
function selectRole(role) {
    selectedRole = role;
    document.getElementById("roleScreen").classList.add("hidden");
    document.getElementById("chatScreen").classList.remove("hidden");

    const titles = {
        girlfriend: "💖 Your AI Girlfriend",
        bestfriend: "🤝 Your AI Best Friend",
        therapist: "🧠 Your AI Therapist",
        mentor: "🎓 Your AI Mentor"
    };

    document.getElementById("chatTitle").innerText =
        titles[role] || "AI Companion";
}

let typingInterval = null;
// Typing animation
function showTyping() {
    hideTyping(); // 🔥 ensure no duplicate typing bubble

    const typingDiv = document.createElement("div");
    typingDiv.className = "message ai typing";
    typingDiv.id = "typingIndicator";
    typingDiv.innerHTML = `
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
    `;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}


function hideTyping() {
    const typing = document.getElementById("typingIndicator");
    if (typing && typing.parentNode) {
        typing.parentNode.removeChild(typing);
    }
}


// CHAT
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, "user");
    userInput.value = "";
    showTyping();


    try {
     const response = await fetch(
    "https://ai-partner-evvf.onrender.com/chat",
    {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            message,
            gender: selectedGender,   // ✅ FIXED
            role: selectedRole
        })
    }
);


const rawText = await response.text();
console.log("RAW BACKEND RESPONSE:", rawText);

let data;
try {
    data = JSON.parse(rawText);
} catch (e) {
    console.error("JSON parse failed");
    data = {};
}


hideTyping();

if (data && data.reply && data.reply.trim() !== "") {
    addMessage(data.reply, "ai");
} else {
    addMessage("💔 Sorry, I couldn’t think of a reply.", "ai");
}

    } catch (error) {
    console.error(error);
    hideTyping();
    addMessage("😔 Sorry, something went wrong.", "ai");
}

}

// REQUIRED for onclick
window.sendMessage = sendMessage;
window.selectGender = selectGender;
window.selectRole = selectRole;

function addMessage(text, sender) {
    const div = document.createElement("div");
    div.className = `message ${sender}`;
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}


userInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

const themeToggle = document.getElementById("themeToggle");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    if (document.body.classList.contains("dark")) {
        localStorage.setItem("theme", "dark");
        themeToggle.textContent = "☀️";
    } else {
        localStorage.setItem("theme", "light");
        themeToggle.textContent = "🌙";
    }
});
