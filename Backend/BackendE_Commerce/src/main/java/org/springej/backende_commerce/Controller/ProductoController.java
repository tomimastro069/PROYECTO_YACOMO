package org.springej.backende_commerce.Controller;

import org.springej.backende_commerce.Model.Producto;
import org.springej.backende_commerce.Service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/productos")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    // GET /productos - Listar todos los productos
    @GetMapping
    public ResponseEntity<List<Producto>> listarTodos() {
        List<Producto> productos = productoService.listarTodos();
        return ResponseEntity.ok(productos);
    }

    // GET /productos/paginado - Listar productos con paginación
    @GetMapping("/paginado")
    public ResponseEntity<Page<Producto>> listarPaginado(Pageable pageable) {
        Page<Producto> productos = productoService.listarPaginado(pageable);
        return ResponseEntity.ok(productos);
    }

    // GET /productos/{id} - Buscar producto por ID
    @GetMapping("/{id}")
    public ResponseEntity<Producto> buscarPorId(@PathVariable Long id) {
        return productoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /productos/buscar - Buscar productos por diferentes criterios
    @GetMapping("/buscar")
    public ResponseEntity<List<Producto>> buscarProductos(
            @RequestParam(required = false) String nombre,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) Double precioMin,
            @RequestParam(required = false) Double precioMax) {

        List<Producto> productos = productoService.buscarProductos(nombre, categoria, precioMin, precioMax);
        return ResponseEntity.ok(productos);
    }

    // GET /productos/categoria/{categoria} - Buscar por categoría específica
    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<Producto>> buscarPorCategoria(@PathVariable String categoria) {
        List<Producto> productos = productoService.buscarPorCategoria(categoria);
        return ResponseEntity.ok(productos);
    }

    // POST /productos - Crear nuevo producto
    @PostMapping
    public ResponseEntity<Producto> crearProducto(@RequestBody @Valid Producto producto) {
        try {
            Producto nuevoProducto = productoService.guardar(producto);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevoProducto);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // PUT /productos/{id} - Actualizar producto existente
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizarProducto(
            @PathVariable Long id,
            @RequestBody @Valid Producto producto) {

        return productoService.buscarPorId(id)
                .map(productoExistente -> {
                    producto.setId(id);
                    Producto productoActualizado = productoService.guardar(producto);
                    return ResponseEntity.ok(productoActualizado);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // PATCH /productos/{id} - Actualización parcial
    @PatchMapping("/{id}")
    public ResponseEntity<Producto> actualizarParcial(
            @PathVariable Long id,
            @RequestBody Map<String, Object> campos) {

        return productoService.actualizarParcial(id, campos)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /productos/{id} - Eliminar producto
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        return productoService.buscarPorId(id)
                .map(producto -> {
                    productoService.eliminar(id);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /productos/disponibles - Listar solo productos disponibles
    @GetMapping("/disponibles")
    public ResponseEntity<List<Producto>> listarDisponibles() {
        List<Producto> productos = productoService.listarDisponibles();
        return ResponseEntity.ok(productos);
    }

    // GET /productos/destacados - Listar productos destacados
    @GetMapping("/destacados")
    public ResponseEntity<List<Producto>> listarDestacados() {
        List<Producto> productos = productoService.listarDestacados();
        return ResponseEntity.ok(productos);
    }
}