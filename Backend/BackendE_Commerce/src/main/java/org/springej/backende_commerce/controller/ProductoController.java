package org.springej.backende_commerce.controller;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springej.backende_commerce.entity.Producto;
import org.springej.backende_commerce.service.ProductoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:5500")
@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private static final Logger logger = LoggerFactory.getLogger(ProductoController.class);

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<Producto>> listarTodos() {
        logger.info("Iniciando búsqueda de todos los productos");
        List<Producto> productos = productoService.listarTodos();
        logger.info("Se encontraron {} productos", productos.size());
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> buscarPorId(@PathVariable Long id) {
        logger.info("Buscando producto con ID: {}", id);
        return productoService.buscarPorId(id)
                .map(producto -> {
                    logger.info("Producto encontrado: {}", producto.getNombre());
                    return ResponseEntity.ok(producto);
                })
                .orElseGet(() -> {
                    logger.info("Producto con ID {} no encontrado", id);
                    return ResponseEntity.notFound().build();
                });
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
            @PathVariable Long id,
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
            @PathVariable Long id,
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
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
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
}