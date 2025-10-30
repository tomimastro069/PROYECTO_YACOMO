document.addEventListener("DOMContentLoaded", () => {
  const bubble = document.getElementById("chatbot-bubble");
  const windowChat = document.getElementById("chatbot-window");
  const sendBtn = document.getElementById("chatbot-send");
  const input = document.getElementById("chatbot-text");
  const messages = document.getElementById("chatbot-messages");
  const sidebar = document.getElementById("chat-sidebar");
  const newChatBtn = document.getElementById("new-chat-btn");
  const closeBtn = document.getElementById("close-chat-btn");

  // Cargar chats o crear uno inicial
  let chats = JSON.parse(localStorage.getItem("chatHistories") || "{}");
  if (Object.keys(chats).length === 0) {
    chats["Chat 1"] = [
      { sender: "bot", text: "👋 ¡Hola! Soy el asistente virtual de SCRIPT-G. ¿En qué puedo ayudarte hoy?" }
    ];
  }

  let currentChat = localStorage.getItem("currentChat") || Object.keys(chats)[0];

  updateSidebar();
  renderMessages();

  // Mostrar / ocultar ventana del chat
  bubble.addEventListener("click", () => {
    if (windowChat.classList.contains("show")) {
      windowChat.classList.remove("show");
      setTimeout(() => (windowChat.style.display = "none"), 300);
    } else {
      windowChat.style.display = "flex";
      setTimeout(() => windowChat.classList.add("show"), 10);
    }
  });

  // Cerrar desde el botón de la cabecera (útil en móvil)
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      if (windowChat.classList.contains("show")) {
        windowChat.classList.remove("show");
        setTimeout(() => (windowChat.style.display = "none"), 300);
      }
    });
  }

  // Crear nuevo chat con mensaje inicial
  newChatBtn.addEventListener("click", () => {
    let i = 1;
    let newName = `Chat ${i}`;
    while (chats[newName]) i++, (newName = `Chat ${i}`);
    chats[newName] = [
      { sender: "bot", text: "👋 ¡Hola! Soy el asistente virtual de SCRIPT-G. ¿En qué puedo ayudarte hoy?" }
    ];
    currentChat = newName;
    saveChats();
    updateSidebar();
    renderMessages();
    showToast(`Nuevo chat "${newName}" creado.`, "success");
  });

  // Enviar mensaje
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keypress", e => { if (e.key === "Enter") sendMessage(); });

  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    appendMessage("user", text);
    input.value = "";

    // Cambiar nombre del chat según primer mensaje del usuario si es nuevo
    if (chats[currentChat].length === 1) {
      const firstWord = text.split(" ").slice(0,3).join(" ");
      renameChat(currentChat, firstWord);
    }

    const typingMsg = document.createElement("div");
    typingMsg.classList.add("typing");
    typingMsg.innerHTML = `<span></span><span></span><span></span>`;
    messages.appendChild(typingMsg);
    messages.scrollTop = messages.scrollHeight;

    // Llamada al backend
    fetch("http://localhost:8080/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    })
      .then(res => res.json())
      .then(data => {
        typingMsg.remove();
        appendMessage("bot", data.answer || "Respuesta del bot.");
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
      const container = document.createElement("div");
      container.classList.add("chat-btn");
      if (chatName === currentChat) container.classList.add("active");

      const name = document.createElement("span");
      name.textContent = chatName;
      container.appendChild(name);

      const delBtn = document.createElement("button");
      delBtn.textContent = "✖";
      delBtn.classList.add("delete-btn");

      delBtn.addEventListener("click", e => {
        e.stopPropagation();
        if (Object.keys(chats).length === 1) {
          showToast("No se puede eliminar el único chat.", "error");
          return;
        }
        delete chats[chatName];
        currentChat = Object.keys(chats)[0];
        updateSidebar();
        renderMessages();
        saveChats();
        showToast(`Chat "${chatName}" eliminado.`, "success");
      });

      container.addEventListener("click", () => {
        currentChat = chatName;
        updateSidebar();
        renderMessages();
        saveChats();
      });

      container.appendChild(delBtn);
      sidebar.appendChild(container);
    });
  }

  function renameChat(oldName, newName) {
    if (chats[newName]) return; // evitar duplicados
    chats[newName] = chats[oldName];
    delete chats[oldName];
    currentChat = newName;
    updateSidebar();
    saveChats();
  }

  function saveChats() {
    localStorage.setItem("chatHistories", JSON.stringify(chats));
    localStorage.setItem("currentChat", currentChat);
  }

  // === TOAST ===
  function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.style.position = "fixed";
      container.style.bottom = "20px";
      container.style.left = "20px";
      container.style.zIndex = 2000;
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.background = type === "success" ? "#4caf50" : "#f44336";
    toast.style.color = "#fff";
    toast.style.padding = "8px 12px";
    toast.style.borderRadius = "8px";
    toast.style.marginTop = "5px";
    toast.style.opacity = "1";
    toast.style.transition = "all 0.3s ease";

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }
});
