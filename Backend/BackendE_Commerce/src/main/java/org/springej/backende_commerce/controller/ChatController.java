package org.springej.backende_commerce.controller;

import lombok.RequiredArgsConstructor;
import org.springej.backende_commerce.entity.Producto;
import org.springej.backende_commerce.repository.ProductoRepository;
import org.springej.backende_commerce.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5500", "http://localhost:5173"})
@RequiredArgsConstructor
public class ChatController {

    private final GeminiService gemini;
    private final ProductoRepository productoRepo;

    private String baseInstructions() {
        return """
            Sos el asistente de Script G (e-commerce argentino de PCs y componentes).
            - Habla en español argentino(no forzado), breve y directo.
            - Moneda: ARS (formato: $830K para miles).
            - No inventes productos ni precios.
            - Solo usá la información del contexto de base de datos.
            - Si no encontrás datos relacionados a la base de datos, respondé "No tengo información sobre eso y recomendale algun producto de la base de datos ", en cambio si hay algun producto q no este en la base de datos pero si tenga relacion, responde "no tenemos stock de ese producto".
            - Componentes: specs clave + 1-2 alternativas del contexto.
            - Presupuestos: tabla corta (pieza, precio, total) y aclarar stock.
            - Builds: 2-3 opciones por uso (gaming 1080/1440/4K, edición, oficina).
            - Pedí aclaraciones solo si faltan datos críticos (presupuesto, uso).
            - Si un producto tiene promoción, mencionala.
            - IMPORTANTE: Máximo 350 caracteres. Sé conciso.
        """;
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, Object>> chat(@RequestBody Map<String, Object> body) {
        String message = String.valueOf(body.getOrDefault("message", ""));

        if (message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "message vacío"));
        }

        List<Producto> productos = productoRepo.findAll();

        if (productos.isEmpty()) {
            return ResponseEntity.ok(Map.of("answer", "No hay productos cargados en la base de datos."));
        }

        // FILTRAR productos relevantes según el mensaje
        List<Producto> productosRelevantes = filtrarProductosRelevantes(productos, message);

        // Contexto simplificado con productos filtrados
        String contexto = productosRelevantes.stream()
                .map(p -> {
                    double precioK = p.getPrecio() / 1000.0;
                    String promo = (p.getPromocion() != null && !p.getPromocion().isBlank())
                            ? " — Promo: " + p.getPromocion()
                            : "";
                    return String.format("- %s — $%.0fK — Stock: %d%s",
                            p.getNombre(), precioK, p.getStock(), promo);
                })
                .collect(Collectors.joining("\n"));

        // Llamar a Gemini
        String answer = gemini.generateWithContext(baseInstructions(), message, contexto);

        return ResponseEntity.ok(Map.of("answer", answer));
    }

    /**
     * Filtra productos relevantes según el mensaje del usuario
     */
    private List<Producto> filtrarProductosRelevantes(List<Producto> productos, String mensaje) {
        String mensajeLower = mensaje.toLowerCase();

        // Si pide productos baratos/económicos, ordenar por precio
        boolean pideBudget = mensajeLower.contains("barato") || mensajeLower.contains("económico") ||
                mensajeLower.contains("presupuesto bajo") || mensajeLower.contains("accesible") ||
                mensajeLower.contains("económica");

        // Palabras clave por categoría
        Set<String> keywords = new HashSet<>();

        // Gaming
        if (mensajeLower.contains("gaming") || mensajeLower.contains("juego") || mensajeLower.contains("gamer")) {
            keywords.addAll(List.of("rtx", "radeon", "geforce", "rx ", "nvidia", "amd", "gaming", "rog", "tuf",
                    "ryzen", "intel", "core", "i7", "i5", "i9", "monitor", "hz", "odyssey", "msi"));
        }

        // Notebooks/Laptops
        if (mensajeLower.contains("notebook") || mensajeLower.contains("laptop") || mensajeLower.contains("portátil")) {
            keywords.addAll(List.of("legion", "asus", "alienware", "macbook", "predator", "rog", "laptop", "notebook"));
        }

        // Periféricos
        if (mensajeLower.contains("mouse") || mensajeLower.contains("teclado") || mensajeLower.contains("auricular") ||
                mensajeLower.contains("headset") || mensajeLower.contains("periférico")) {
            keywords.addAll(List.of("logitech", "razer", "corsair", "hyperx", "mouse", "teclado", "g502", "keyboard",
                    "huntsman", "cloud", "arctis", "rgb", "steelseries"));
        }

        // Almacenamiento
        if (mensajeLower.contains("ssd") || mensajeLower.contains("disco") || mensajeLower.contains("almacenamiento") ||
                mensajeLower.contains("nvme") || mensajeLower.contains("storage")) {
            keywords.addAll(List.of("ssd", "nvme", "samsung", "kingston", "wd ", "seagate", "990", "evo", "tb", "firecuda"));
        }

        // Monitores
        if (mensajeLower.contains("monitor") || mensajeLower.contains("pantalla") || mensajeLower.contains("display")) {
            keywords.addAll(List.of("monitor", "odyssey", "asus", "msi", "acer", "hz", "4k", "qhd", "ips", "vg28", "mag"));
        }

        // RAM
        if (mensajeLower.contains("ram") || mensajeLower.contains("memoria")) {
            keywords.addAll(List.of("ram", "ddr", "memory", "kingston", "fury", "corsair", "vengeance", "gb", "adata"));
        }

        // Motherboard
        if (mensajeLower.contains("mother") || mensajeLower.contains("placa madre") || mensajeLower.contains("chipset")) {
            keywords.addAll(List.of("b760", "b650", "z790", "motherboard", "carbon", "strix", "gigabyte", "wifi", "mpg"));
        }

        // Cooler/Refrigeración
        if (mensajeLower.contains("cooler") || mensajeLower.contains("refriger") || mensajeLower.contains("temperatura")) {
            keywords.addAll(List.of("cooler", "kraken", "nzxt", "corsair", "icue", "liquid", "dark rock", "quiet"));
        }

        // Gabinetes/Cases
        if (mensajeLower.contains("gabinete") || mensajeLower.contains("case") || mensajeLower.contains("caja")) {
            keywords.addAll(List.of("case", "gabinete", "hyte", "masterbox", "h510", "nzxt", "cooler master", "td500"));
        }

        // Fuentes de poder
        if (mensajeLower.contains("fuente") || mensajeLower.contains("psu") || mensajeLower.contains("power")) {
            keywords.addAll(List.of("psu", "power", "fuente", "thermaltake", "toughpower", "watts", "850w", "750w"));
        }

        // Si no hay keywords específicas, es una consulta general
        if (keywords.isEmpty()) {
            // Devolver variedad de productos limitados
            return productos.stream()
                    .limit(25)
                    .collect(Collectors.toList());
        }

        // Filtrar productos por keywords
        List<Producto> filtrados = productos.stream()
                .filter(p -> {
                    String nombreLower = p.getNombre().toLowerCase();
                    return keywords.stream().anyMatch(nombreLower::contains);
                })
                .collect(Collectors.toList());

        // Si pidió baratos, ordenar por precio ascendente
        if (pideBudget) {
            filtrados = filtrados.stream()
                    .sorted(Comparator.comparingDouble(Producto::getPrecio))
                    .limit(20)
                    .collect(Collectors.toList());
        } else {
            // Limitar a 25 productos
            filtrados = filtrados.stream()
                    .limit(25)
                    .collect(Collectors.toList());
        }

        // Si no encontró nada, devolver productos más populares/baratos
        if (filtrados.isEmpty()) {
            return productos.stream()
                    .sorted(Comparator.comparingDouble(Producto::getPrecio))
                    .limit(20)
                    .collect(Collectors.toList());
        }

        return filtrados;
    }

    @GetMapping("/price")
    public ResponseEntity<?> price(@RequestParam("q") String q) {
        if (q == null || q.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "q vacío"));
        }

        List<Producto> porNombre = productoRepo.findByNombreContainingIgnoreCase(q);
        Producto match = porNombre.stream().findFirst().orElse(null);

        if (match == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Sin precio para esa búsqueda"));
        }

        return ResponseEntity.ok(Map.of(
                "id", match.getId(),
                "title", match.getNombre(),
                "price", match.getPrecio(),
                "priceK", String.format("$%.0fK", match.getPrecio() / 1000.0),
                "source", "db"
        ));
    }
}