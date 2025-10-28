package org.springej.backende_commerce.service;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ConversationService {

    // Guarda el historial por sessionId
    private final Map<String, List<Message>> sessions = new ConcurrentHashMap<>();

    public static class Message {
        private String role; // "user" o "assistant"
        private String content;

        public Message(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public String getRole() { return role; }
        public String getContent() { return content; }
    }

    /**
     * Obtiene el historial de una sesión (últimos 6 mensajes)
     */
    public List<Message> getHistory(String sessionId) {
        List<Message> history = sessions.getOrDefault(sessionId, new ArrayList<>());

        // Retornar solo los últimos 6 mensajes (3 intercambios)
        int start = Math.max(0, history.size() - 6);
        return new ArrayList<>(history.subList(start, history.size()));
    }

    /**
     * Agrega un mensaje al historial
     */
    public void addMessage(String sessionId, String role, String content) {
        sessions.computeIfAbsent(sessionId, k -> new ArrayList<>())
                .add(new Message(role, content));
    }

    /**
     * Limpia el historial de una sesión
     */
    public void clearHistory(String sessionId) {
        sessions.remove(sessionId);
    }

    /**
     * Limpia sesiones antiguas (para no llenar memoria)
     * Llamar periódicamente o cuando haya muchas sesiones
     */
    public void cleanOldSessions() {
        if (sessions.size() > 1000) {
            // Limpiar la mitad de las sesiones más antiguas
            List<String> keys = new ArrayList<>(sessions.keySet());
            keys.subList(0, keys.size() / 2).forEach(sessions::remove);
        }
    }
}