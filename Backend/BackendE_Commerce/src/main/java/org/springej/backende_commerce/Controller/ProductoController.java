package org.springej.backende_commerce.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/producto")
public class ProductoController {

    @GetMapping("/listar")
    public ResponseEntity<List<String>> listarProductos() {
        // Ejemplo de productos
        List<String> productos = List.of("Camiseta", "Pantalón", "Zapatos");
        return ResponseEntity.ok(productos);
    }
}
