package org.springej.backende_commerce.controller;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springej.backende_commerce.dto.ProductoDTO;
import org.springej.backende_commerce.entity.Imagen;
import org.springej.backende_commerce.entity.Producto;
import org.springej.backende_commerce.entity.ProductoImagen;
import org.springej.backende_commerce.repository.ImagenRepository;
import org.springej.backende_commerce.repository.ProductoImagenRepository;
import org.springej.backende_commerce.repository.ProductoRepository;
import org.springej.backende_commerce.service.CloudinaryService;
import org.springej.backende_commerce.service.ProductoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:5500")
@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor

public class ProductoController {

    private static final Logger logger = LoggerFactory.getLogger(ProductoController.class);
    private final ProductoService productoService;
    private final ProductoRepository productoRepository;
    private final ImagenRepository imagenRepository;
    private final ProductoImagenRepository productoImagenRepository;
    private final CloudinaryService cloudinaryService; 


    // ✅ DEVUELVE DTOs (sin referencias circulares)
    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listarTodos() {
        logger.info("Iniciando búsqueda de todos los productos");
        List<ProductoDTO> productos = productoService.listarTodos();
        logger.info("Se encontraron {} productos", productos.size());
        return ResponseEntity.ok(productos);
    }

    // ✅ DEVUELVE DTO
    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> buscarPorId(@PathVariable Long id) {
        logger.info("Buscando producto con ID: {}", id);
        return productoService.buscarPorId(id)
                .map(productoDTO -> {
                    logger.info("Producto encontrado: {}", productoDTO.getNombre());
                    return ResponseEntity.ok(productoDTO);
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
        return productoRepository.findById(id)
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
    Optional<Producto> optProducto = productoRepository.findById(id);
    if (optProducto.isEmpty()) {
        return ResponseEntity.notFound().build();
    }
    Producto producto = optProducto.get();

    // Primero eliminamos todas las imágenes asociadas
    if (producto.getProductoImagenes() != null) {
        for (ProductoImagen pi : producto.getProductoImagenes()) {
            Imagen imagen = pi.getImagen();
            // lógica de eliminación que tenías en tu endpoint de ProductoImagenController
            try {
                if (imagen.getPublicId() != null) {
                    cloudinaryService.destroy(imagen.getPublicId());
                }
                productoImagenRepository.delete(pi);
                imagenRepository.delete(imagen);
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(500).build();
            }
        }
    }

    // Ahora eliminamos el producto
    productoService.eliminar(id);
    return ResponseEntity.noContent().build();
}


    @GetMapping("/buscar-id")
    public ResponseEntity<?> buscarIdPorNombre(@RequestParam(required = false) String nombre) {
        logger.info("Buscando ID del producto con nombre: {}", nombre);

        if (nombre == null || nombre.trim().isEmpty()) {
            logger.warn("Parámetro nombre vacío o nulo");
            return ResponseEntity.badRequest().body(Map.of("error", "El parámetro 'nombre' es requerido"));
        }

        return productoService.buscarPorNombre(nombre.trim())
                .map(producto -> {
                    logger.info("Producto encontrado: {} con ID: {}", producto.getNombre(), producto.getId());
                    return ResponseEntity.ok(Map.of(
                            "id", producto.getId(),
                            "nombre", producto.getNombre()
                    ));
                })
                .orElseGet(() -> {
                    logger.info("Producto con nombre '{}' no encontrado", nombre);
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("error", "Producto no encontrado con nombre: " + nombre));
                });
    }
    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoDTO>> buscar(@RequestParam String termino) {
        logger.info("Solicitud de búsqueda recibida: {}", termino);
        List<ProductoDTO> resultados = productoService.buscar(termino);
        return ResponseEntity.ok(resultados);
    }


}