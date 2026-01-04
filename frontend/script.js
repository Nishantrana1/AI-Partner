let selectedGender = "";
let selectedRole = "";

const response = await fetch("/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        message,
        prompt: personalityPrompt
    })
});

const data = await response.json();
addMessage(data.reply, "ai");

function selectGender(gender) {
    selectedGender = gender;
    document.getElementById("genderScreen").classList.add("hidden");
    document.getElementById("roleScreen").classList.remove("hidden");
}

function selectRole(role) {
    selectedRole = role;
    document.getElementById("roleScreen").classList.add("hidden");
    document.getElementById("chatScreen").classList.remove("hidden");

    const titleMap = {
        girlfriend: "💖 Your AI Girlfriend",
        bestfriend: "🤝 Your AI Best Friend",
        therapist: "🧠 Your AI Therapist",
        mentor: "🎓 Your AI Mentor"
    };

    document.getElementById("chatTitle").innerText =
        titleMap[role] || "AI Companion";
}
