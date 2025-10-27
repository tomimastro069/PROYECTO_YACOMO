document.addEventListener("DOMContentLoaded", () => {
  const bubble = document.getElementById("chatbot-bubble");
  const windowChat = document.getElementById("chatbot-window");
  const sendBtn = document.getElementById("chatbot-send");
  const input = document.getElementById("chatbot-text");
  const messages = document.getElementById("chatbot-messages");

  // Mostrar / ocultar chat
  bubble.addEventListener("click", () => {
    if (windowChat.classList.contains("show")) {
      // Ocultar con animación
      windowChat.classList.remove("show");
      setTimeout(() => {
        windowChat.style.display = "none";
      }, 300); // coincide con la duración de la animación CSS
    } else {
      // Mostrar con animación
      windowChat.style.display = "flex";
      setTimeout(() => {
        windowChat.classList.add("show");
      }, 10); // permite que el navegador procese el display antes de animar
    }
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

    fetch("http://localhost:8080/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    })
      .then((res) => res.json())
      .then((data) => appendMessage("bot", data.answer))
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
