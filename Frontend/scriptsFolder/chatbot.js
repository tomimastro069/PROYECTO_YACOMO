document.addEventListener("DOMContentLoaded", () => {
  const bubble = document.getElementById("chatbot-bubble");
  const windowChat = document.getElementById("chatbot-window");
  const closeBtn = document.getElementById("chatbot-close");
  const sendBtn = document.getElementById("chatbot-send");
  const input = document.getElementById("chatbot-text");
  const messages = document.getElementById("chatbot-messages");

  // Mostrar/Ocultar chat
  bubble.addEventListener("click", () => {
    windowChat.classList.toggle("show");
  });

  closeBtn.addEventListener("click", () => {
    windowChat.classList.add("show");
  });

  // Enviar mensaje
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;
    appendMessage("user", text);
    input.value = "";

    // Petición al backend (ajustá la URL según tu API)
    fetch("http://localhost:8080/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: text })
    })
    .then(res => res.json())
    .then(data => appendMessage("bot", data.answer))
    .catch(() => appendMessage("bot", "Error al conectar con el chatbot."));

  }

  function appendMessage(sender, text) {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }
});
