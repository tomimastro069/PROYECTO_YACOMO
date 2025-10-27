document.addEventListener("DOMContentLoaded", () => {
  const bubble = document.getElementById("chatbot-bubble");
  const windowChat = document.getElementById("chatbot-window");
  const sendBtn = document.getElementById("chatbot-send");
  const input = document.getElementById("chatbot-text");
  const messages = document.getElementById("chatbot-messages");
  const sidebar = document.getElementById("chat-sidebar");
  const newChatBtn = document.getElementById("new-chat-btn");

  // Inicializar chats
  let chats = JSON.parse(localStorage.getItem("chatHistories") || "{}");
  if (Object.keys(chats).length === 0) chats["Chat 1"] = [];
  let currentChat = localStorage.getItem("currentChat") || Object.keys(chats)[0];

  updateSidebar();
  renderMessages();

  // Mostrar / ocultar ventana
  bubble.addEventListener("click", () => {
    if (windowChat.classList.contains("show")) {
      windowChat.classList.remove("show");
      setTimeout(() => windowChat.style.display = "none", 300);
    } else {
      windowChat.style.display = "flex";
      setTimeout(() => windowChat.classList.add("show"), 10);
    }
  });

  // Crear nuevo chat
  newChatBtn.addEventListener("click", () => {
    let i = 1;
    let newName = `Chat ${i}`;
    while (chats[newName]) i++, newName = `Chat ${i}`;
    chats[newName] = [];
    currentChat = newName;
    saveChats();
    updateSidebar();
    renderMessages();
  });

  // Enviar mensaje
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    appendMessage("user", text);
    input.value = "";

    const typingMsg = document.createElement("div");
    typingMsg.classList.add("typing");
    typingMsg.innerHTML = `<span></span><span></span><span></span>`;
    messages.appendChild(typingMsg);
    messages.scrollTop = messages.scrollHeight;

    fetch("http://localhost:8080/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    })
    .then(res => res.json())
    .then(data => {
      typingMsg.remove();
      appendMessage("bot", data.answer);
    })
    .catch(() => {
      typingMsg.remove();
      appendMessage("bot", "Error al conectar con el chatbot.");
    });
  }

  function appendMessage(sender, text) {
    const msg = document.createElement("div");
    msg.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;

    chats[currentChat].push({ sender, text });
    saveChats();
  }

  function renderMessages() {
    messages.innerHTML = "";
    chats[currentChat].forEach(m => {
      const msg = document.createElement("div");
      msg.classList.add("message", m.sender === "user" ? "user-message" : "bot-message");
      msg.textContent = m.text;
      messages.appendChild(msg);
    });
    messages.scrollTop = messages.scrollHeight;
  }

  function updateSidebar() {
    sidebar.innerHTML = "";
    Object.keys(chats).forEach(chatName => {
      const btn = document.createElement("button");
      btn.classList.add("chat-btn");
      if (chatName === currentChat) btn.classList.add("active");
      btn.textContent = chatName;

      // Seleccionar chat al hacer clic
      btn.addEventListener("click", () => {
        currentChat = chatName;
        updateSidebar();
        renderMessages();
        saveChats();
      });

      // Botón de eliminar chat
      const delBtn = document.createElement("button");
      delBtn.textContent = "✖";
      delBtn.classList.add("delete-btn");
      delBtn.addEventListener("click", e => {
        e.stopPropagation();
        if (confirm(`¿Eliminar chat "${chatName}"?`)) {
          delete chats[chatName];
          if (currentChat === chatName) currentChat = Object.keys(chats)[0];
          updateSidebar();
          renderMessages();
          saveChats();
        }
      });

      btn.appendChild(delBtn);
      sidebar.appendChild(btn);
    });
  }

  function saveChats() {
    localStorage.setItem("chatHistories", JSON.stringify(chats));
    localStorage.setItem("currentChat", currentChat);
  }
});
