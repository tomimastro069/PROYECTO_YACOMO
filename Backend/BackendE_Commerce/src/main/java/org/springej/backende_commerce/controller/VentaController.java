package org.springej.backende_commerce.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springej.backende_commerce.dto.VentaDTO;
import org.springej.backende_commerce.entity.Usuario;
import org.springej.backende_commerce.entity.Venta;
import org.springej.backende_commerce.service.AuthService;
import org.springej.backende_commerce.service.VentaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5500")
@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private static final Logger logger = LoggerFactory.getLogger(VentaController.class);

    private final VentaService ventaService;
    private final AuthService authService;

    // POST /api/ventas -> Registrar una venta para el usuario logeado
    @PostMapping
    public ResponseEntity<Venta> registrarVenta(@RequestBody @Valid VentaDTO ventaDTO) {
        Usuario usuarioLogeado = authService.getUsuarioLogeado();
        logger.info("Registrando venta para usuario ID: {}", usuarioLogeado.getId());
        Venta nuevaVenta = ventaService.registrarVenta(ventaDTO, usuarioLogeado);
        logger.info("Venta registrada con ID: {}", nuevaVenta.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaVenta);
    }

    // GET /api/ventas/mis-compras -> Obtener las ventas del usuario logeado
    @GetMapping("/mis-compras")
    public ResponseEntity<List<Venta>> obtenerMisCompras() {
        Usuario usuarioLogeado = authService.getUsuarioLogeado();
        logger.info("Obteniendo mis compras para usuario ID: {}", usuarioLogeado.getId());
        List<Venta> ventas = ventaService.obtenerVentasPorUsuario(usuarioLogeado.getId());
        if (ventas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(ventas);
    }

    // GET /api/ventas -> Obtener TODAS las ventas (SOLO ADMIN)
    @GetMapping
    public ResponseEntity<List<Venta>> listarTodasLasVentas() {
        logger.info("Obteniendo todas las ventas del sistema (ADMIN)");
        List<Venta> ventas = ventaService.listarTodasLasVentas();
        return ResponseEntity.ok(ventas);
    }


    // GET /api/ventas/usuario/{idUsuario} -> Obtener todas las ventas de un usuario (SOLO ADMIN)
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<Venta>> obtenerVentasPorUsuario(@PathVariable Long idUsuario) {
        logger.info("Obteniendo ventas para usuario ID: {} (ADMIN)", idUsuario);
        List<Venta> ventas = ventaService.obtenerVentasPorUsuario(idUsuario);
        if (ventas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(ventas);
    }
}
