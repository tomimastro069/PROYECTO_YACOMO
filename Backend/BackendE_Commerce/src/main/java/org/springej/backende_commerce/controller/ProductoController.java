package org.springej.backende_commerce.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springej.backende_commerce.entity.Producto;
import org.springej.backende_commerce.repository.ProductoRepository;
import org.springej.backende_commerce.service.ProductoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@CrossOrigin(origins = "http://localhost:5500")
@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private static final Logger logger = LoggerFactory.getLogger(ProductoController.class);

    private final ProductoService productoService;
    private final ProductoRepository productoRepository;

    //constructor manual
    public ProductoController(ProductoService productoService, ProductoRepository productoRepository) {
        this.productoService = productoService;
        this.productoRepository = productoRepository;
    }

    @GetMapping
    public ResponseEntity<List<Producto>> listarTodos() {
        logger.info("Iniciando búsqueda de todos los productos");
        List<Producto> productos = productoService.listarTodos();
        logger.info("Se encontraron {} productos", productos.size());
        return ResponseEntity.ok(productos);
    }

    // ENDPOINT ORIGINAL CORREGIDO - Con @PathVariable explícito
    @GetMapping("/{id}")
    public ResponseEntity<Producto> buscarPorId(@PathVariable("id") Long id) {
        logger.info("✅ ENDPOINT /{id} LLAMADO - Buscando producto con ID: {}", id);
        System.out.println("🔍 DEBUG - ID recibido en /{id}: " + id);
        
        return productoService.buscarPorId(id)
                .map(producto -> {
                    logger.info("Producto encontrado: {}", producto.getNombre());
                    // Debug: mostrar qué datos se están enviando
                    System.out.println("📦 Producto a enviar: " + producto.getNombre());
                    System.out.println("🖼️ Tiene imágenes: " + (producto.getProductoImagenes() != null ? producto.getProductoImagenes().size() : 0));
                    return ResponseEntity.ok(producto);
                })
                .orElseGet(() -> {
                    logger.info("Producto con ID {} no encontrado", id);
                    return ResponseEntity.notFound().build();
                });
    }

    // ENDPOINT TEMPORAL CON @RequestParam - Para evitar problemas de parámetros
    @GetMapping("/by-id")
    public ResponseEntity<Producto> buscarPorIdParam(@RequestParam("id") Long id) {
        logger.info("🔧 ENDPOINT TEMPORAL /by-id - Buscando producto con ID: {}", id);
        System.out.println("🔍 DEBUG - ID recibido en /by-id: " + id);
        
        return productoService.buscarPorId(id)
                .map(producto -> {
                    logger.info("Producto encontrado: {}", producto.getNombre());
                    System.out.println("📦 Producto encontrado: " + producto.getNombre());
                    return ResponseEntity.ok(producto);
                })
                .orElseGet(() -> {
                    logger.info("Producto con ID {} no encontrado", id);
                    return ResponseEntity.notFound().build();
                });
    }

    // ENDPOINT ALTERNATIVO - Para detalles completos
    @GetMapping("/detalles/{id}")
    public ResponseEntity<Producto> obtenerDetallesProducto(@PathVariable("id") Long id) {
        logger.info("📋 ENDPOINT /detalles/{id} - Obteniendo detalles completos del producto con ID: {}", id);
        
        return productoService.buscarPorId(id)
                .map(producto -> {
                    logger.info("Detalles del producto encontrado: {}", producto.getNombre());
                    
                    // Forzar carga de relaciones si es necesario
                    if (producto.getProductoImagenes() != null) {
                        producto.getProductoImagenes().size(); // Esto fuerza la carga lazy
                        System.out.println("🖼️ Imágenes cargadas: " + producto.getProductoImagenes().size());
                    }
                    
                    return ResponseEntity.ok(producto);
                })
                .orElseGet(() -> {
                    logger.info("Producto con ID {} no encontrado", id);
                    return ResponseEntity.notFound().build();
                });
    }

    // ENDPOINT DE FALLBACK - Si todo lo demás falla
    @GetMapping("/fallback/{id}")
    public ResponseEntity<Producto> buscarPorIdFallback(@PathVariable("id") Long id) {
        logger.info("🔄 ENDPOINT FALLBACK - Buscando producto con ID: {}", id);
        
        try {
            return productoService.buscarPorId(id)
                    .map(producto -> {
                        logger.info("Producto encontrado en fallback: {}", producto.getNombre());
                        return ResponseEntity.ok(producto);
                    })
                    .orElseGet(() -> {
                        logger.info("Producto con ID {} no encontrado en fallback", id);
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            logger.error("❌ Error en endpoint fallback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<Producto> crearProducto(@Valid @RequestBody Producto producto) {
        logger.info("Iniciando creación de producto: {}", producto.getNombre());
        Producto nuevoProducto = productoService.guardar(producto);
        logger.info("Producto creado exitosamente con ID: {}", nuevoProducto.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(
            @PathVariable("id") Long id,
            @Valid @RequestBody Producto producto) {

        logger.info("Iniciando actualización completa del producto con ID: {}", id);
        return productoService.buscarPorId(id)
                .map(productoExistente -> {
                    producto.setId(id);
                    Producto productoActualizado = productoService.guardar(producto);
                    logger.info("Producto actualizado exitosamente");
                    return ResponseEntity.ok(productoActualizado);
                })
                .orElseGet(() -> {
                    logger.info("No se puede actualizar. Producto con ID {} no encontrado", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Producto> actualizarParcial(
            @PathVariable("id") Long id,
            @RequestBody Map<String, Object> campos) {

        logger.info("Iniciando actualización parcial del producto con ID: {}", id);
        logger.debug("Campos a actualizar: {}", campos);

        return productoService.actualizarParcial(id, campos)
                .map(producto -> {
                    logger.info("Producto actualizado parcialmente exitosamente");
                    return ResponseEntity.ok(producto);
                })
                .orElseGet(() -> {
                    logger.info("No se puede actualizar parcialmente. Producto con ID {} no encontrado", id);
                    return ResponseEntity.notFound().build();
                });
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable("id") Long id) {
        logger.info("Iniciando eliminación del producto con ID: {}", id);
        return productoService.buscarPorId(id)
                .map(producto -> {
                    logger.info("Eliminando producto: {}", producto.getNombre());
                    productoService.eliminar(id);
                    logger.info("Producto eliminado exitosamente");
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElseGet(() -> {
                    logger.info("No se puede eliminar. Producto con ID {} no encontrado", id);
                    return ResponseEntity.notFound().build();
                });
    }

    // Controller de la barra de búsqueda
    @GetMapping("/buscar")
    public ResponseEntity<List<Producto>> buscarProductos(@RequestParam("q") String q) {
        logger.info("Buscando productos con término: {}", q);
        
        if (q == null || q.trim().isEmpty() || q.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        
        try {
            // Método temporal que funciona sin el repository
            List<Producto> todos = productoService.listarTodos();
            String queryLower = q.trim().toLowerCase();
            
            List<Producto> resultados = todos.stream()
                .filter(p -> p.getNombre().toLowerCase().contains(queryLower))
                .collect(Collectors.toList());
                
            logger.info("Se encontraron {} productos para: {}", resultados.size(), q);
            return ResponseEntity.ok(resultados);
            
        } catch (Exception e) {
            logger.error("Error en búsqueda: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ENDPOINT DE PRUEBA - Para verificar que el controlador funciona
    @GetMapping("/test")
    public ResponseEntity<String> testEndpoint() {
        logger.info("✅ ENDPOINT TEST LLAMADO - Controlador funcionando correctamente");
        return ResponseEntity.ok("✅ ProductoController está funcionando correctamente. Timestamp: " + System.currentTimeMillis());
    }

    // ENDPOINT PARA OBTENER PRODUCTOS CON IMÁGENES
    @GetMapping("/con-imagenes")
    public ResponseEntity<List<Producto>> listarTodosConImagenes() {
        logger.info("Obteniendo todos los productos con información de imágenes");
        List<Producto> productos = productoService.listarTodos();
        
        // Forzar carga de imágenes para cada producto
        productos.forEach(producto -> {
            if (producto.getProductoImagenes() != null) {
                producto.getProductoImagenes().size(); // Fuerza carga lazy
            }
        });
        
        logger.info("Se obtuvieron {} productos con imágenes", productos.size());
        return ResponseEntity.ok(productos);
    }
}