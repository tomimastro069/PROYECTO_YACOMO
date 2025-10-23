package org.springej.backende_commerce.controller;

//import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
//import org.springej.backende_commerce.dto.VentaCreationResult;
//import org.springej.backende_commerce.dto.VentaDTO;
import org.springej.backende_commerce.dto.UsuarioDTO;
import org.springej.backende_commerce.dto.VentaDTO;
import org.springej.backende_commerce.entity.Usuario;
import org.springej.backende_commerce.entity.Venta;
import org.springej.backende_commerce.service.AuthService;
import org.springej.backende_commerce.service.VentaService;
//import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5500") // Asegurarse que esta anotación esté presente
@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private static final Logger logger = LoggerFactory.getLogger(VentaController.class);

    private final VentaService ventaService;
    private final AuthService authService;

    /*
     * El endpoint POST para registrar una venta se elimina de este controlador.
     * La creación de la venta ahora es manejada por PaymentController (/api/payments/create-order)
     * para asegurar que cada venta esté asociada a un intento de pago.
     */
    @GetMapping("/mis-compras")
    public ResponseEntity<List<VentaDTO>> obtenerMisCompras() {
        Usuario usuarioLogeado = authService.getUsuarioLogeado();
        logger.info("Obteniendo mis compras para usuario ID: {}", usuarioLogeado.getId());

        List<Venta> ventas = ventaService.obtenerVentasPorUsuario(usuarioLogeado.getId());

        if (ventas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }


        List<VentaDTO> respuesta = ventas.stream().map(venta -> {
            UsuarioDTO usuarioDTO = new UsuarioDTO(
                    venta.getUsuario().getId(),
                    venta.getUsuario().getNombre(),
                    venta.getUsuario().getApellido(),
                    venta.getUsuario().getEmail(),
                    venta.getUsuario().getFechaRegistro()
            );

            VentaDTO dto = new VentaDTO();
            dto.setFechaVenta(venta.getFechaVenta());
            dto.setEstado(venta.getEstado());
            dto.setUsuario(usuarioDTO);

            dto.setProductos(
                    venta.getProductos().stream()
                            .map(pv -> new VentaDTO.ProductoVentaDTO(
                                    pv.getProducto().getId(),
                                    pv.getCantidad(),
                                    pv.getPrecioUnitario()
                            ))
                            .toList()
            );

            return dto;
        }).toList();


        return ResponseEntity.ok(respuesta);
    }



    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VentaDTO>> listarTodasLasVentas() {
        logger.info("Obteniendo todas las ventas del sistema (ADMIN)");
        List<Venta> ventas = ventaService.listarTodasLasVentas();

        if (ventas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        List<VentaDTO> respuesta = ventas.stream().map(venta -> {
            UsuarioDTO usuarioDTO = new UsuarioDTO(
                    venta.getUsuario().getId(),
                    venta.getUsuario().getNombre(),
                    venta.getUsuario().getApellido(),
                    venta.getUsuario().getEmail(),
                    venta.getUsuario().getFechaRegistro()
            );

            VentaDTO dto = new VentaDTO();
            dto.setFechaVenta(venta.getFechaVenta());
            dto.setEstado(venta.getEstado());
            dto.setUsuario(usuarioDTO);
            dto.setProductos(
                    venta.getProductos().stream()
                            .map(pv -> new VentaDTO.ProductoVentaDTO(
                                    pv.getProducto().getId(),
                                    pv.getCantidad(),
                                    pv.getPrecioUnitario()
                            ))
                            .toList()
            );
            return dto;
        }).toList();

        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/usuario/{idUsuario}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VentaDTO>> obtenerVentasPorUsuario(@PathVariable Long idUsuario) {
        logger.info("Obteniendo ventas para usuario ID: {} (ADMIN)", idUsuario);
        List<Venta> ventas = ventaService.obtenerVentasPorUsuario(idUsuario);
        if (ventas.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        List<VentaDTO> dtos = ventas.stream().map(venta -> {
            UsuarioDTO usuarioDTO = new UsuarioDTO(
                    venta.getUsuario().getId(),
                    venta.getUsuario().getNombre(),
                    venta.getUsuario().getApellido(),
                    venta.getUsuario().getEmail(),
                    venta.getUsuario().getFechaRegistro()
            );

            VentaDTO dto = new VentaDTO();
            dto.setFechaVenta(venta.getFechaVenta());
            dto.setEstado(venta.getEstado());
            dto.setUsuario(usuarioDTO);

            dto.setProductos(
                    venta.getProductos().stream()
                            .map(pv -> new VentaDTO.ProductoVentaDTO(
                                    pv.getProducto().getId(),
                                    pv.getCantidad(),
                                    pv.getPrecioUnitario()
                            ))
                            .toList()
            );

            return dto;
        }).toList();

        return ResponseEntity.ok(dtos);
    }

}