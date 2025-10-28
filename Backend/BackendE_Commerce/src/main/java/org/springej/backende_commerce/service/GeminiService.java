package org.springej.backende_commerce.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springej.backende_commerce.entity.Producto;
import org.springej.backende_commerce.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private final RestTemplate http;
    private final ProductoRepository productoRepository;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.0-flash-exp}")
    private String model;

    public GeminiService(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
        this.http = new RestTemplateBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .readTimeout(Duration.ofSeconds(30))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Genera respuesta CON historial de conversación
     */
    public String generateWithHistory(String systemPrompt, String userMessage,
                                      String contexto, List<ConversationService.Message> history) {
        try {
            String url = String.format(
                    "https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    model, apiKey
            );

            // Construir el array de contents con historial
            StringBuilder contentsJson = new StringBuilder();
            contentsJson.append("\"contents\": [\n");

            // Agregar mensaje del sistema como primer mensaje
            contentsJson.append("""
                {
                  "parts": [{"text": "%s\\n\\nContexto de productos:\\n%s"}],
                  "role": "user"
                },
                {
                  "parts": [{"text": "Entendido. Soy el asistente de Script G y responderé según las instrucciones."}],
                  "role": "model"
                }
                """.formatted(escapeJson(systemPrompt), escapeJson(contexto)));

            // Agregar historial
            if (history != null && !history.isEmpty()) {
                for (ConversationService.Message msg : history) {
                    contentsJson.append(",\n");
                    String role = msg.getRole().equals("user") ? "user" : "model";
                    contentsJson.append("""
                        {
                          "parts": [{"text": "%s"}],
                          "role": "%s"
                        }
                        """.formatted(escapeJson(msg.getContent()), role));
                }
            }

            // Agregar mensaje actual del usuario
            contentsJson.append(",\n");
            contentsJson.append("""
                {
                  "parts": [{"text": "%s"}],
                  "role": "user"
                }
                """.formatted(escapeJson(userMessage)));

            contentsJson.append("]");

            // Construir JSON completo
            String body = String.format("""
                {
                  %s,
                  "generationConfig": {
                    "temperature": 0.7,
                    "maxOutputTokens": 2048
                  }
                }
                """, contentsJson.toString());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> request = new HttpEntity<>(body, headers);

            log.info("Llamando a Gemini con modelo: {} (historial: {} mensajes)",
                    model, history != null ? history.size() : 0);

            ResponseEntity<String> response = http.exchange(url, HttpMethod.POST, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("Respuesta recibida de Gemini. Status: {}", response.getStatusCode());
                return extractTextFromResponse(response.getBody());
            } else {
                log.error("Respuesta no exitosa de Gemini: {}", response.getStatusCode());
                return "No recibí respuesta de Gemini.";
            }

        } catch (Exception e) {
            log.error("Error llamando a Gemini", e);
            return "Error llamando a Gemini: " + e.getMessage();
        }
    }

    /**
     * Método legacy sin historial (mantener para compatibilidad)
     */
    public String generateWithContext(String systemPrompt, String userMessage, String contexto) {
        return generateWithHistory(systemPrompt, userMessage, contexto, null);
    }

    private String extractTextFromResponse(String jsonResponse) {
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);

            if (root.has("error")) {
                String errorMsg = root.path("error").path("message").asText("Error desconocido");
                log.error("Error en respuesta de Gemini: {}", errorMsg);
                return "Error de Gemini: " + errorMsg;
            }

            JsonNode candidates = root.path("candidates");

            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode firstCandidate = candidates.get(0);

                String finishReason = firstCandidate.path("finishReason").asText("");
                if ("MAX_TOKENS".equals(finishReason)) {
                    log.warn("Respuesta truncada por MAX_TOKENS");
                }

                JsonNode content = firstCandidate.path("content");
                JsonNode parts = content.path("parts");

                if (parts.isArray() && parts.size() > 0) {
                    String text = parts.get(0).path("text").asText("");
                    if (!text.isEmpty()) {
                        log.info("Texto extraído exitosamente. Longitud: {}", text.length());
                        return text;
                    }
                }

                log.error("La respuesta no contiene texto. FinishReason: {}", finishReason);
                return "La IA no pudo generar una respuesta completa. Intentá reformular tu consulta.";
            }

            log.error("No se encontraron candidates en la respuesta");
            return "No se pudo procesar la respuesta de la IA.";

        } catch (Exception e) {
            log.error("Error parseando respuesta JSON", e);
            return "Error parseando respuesta: " + e.getMessage();
        }
    }

    private String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    public String generarContextoProductos() {
        List<Producto> productos = productoRepository.findAll();
        return productos.stream()
                .map(p -> {
                    double precioK = p.getPrecio() / 1000.0;
                    String promo = (p.getPromocion() != null && !p.getPromocion().isBlank())
                            ? " — Promo: " + p.getPromocion()
                            : "";
                    return String.format("- %s — $%.0fK — Stock: %d%s",
                            p.getNombre(), precioK, p.getStock(), promo);
                })
                .collect(Collectors.joining("\n"));
    }
}