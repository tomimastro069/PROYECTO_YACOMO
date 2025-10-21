package org.springej.backende_commerce.controller;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.resources.payment.Payment;
import org.springej.backende_commerce.dto.VentaCreationResult;
import org.springej.backende_commerce.dto.VentaDTO;
import org.springej.backende_commerce.entity.RegistroPago;
import org.springej.backende_commerce.entity.Usuario;
import org.springej.backende_commerce.entity.Venta;
import org.springej.backende_commerce.service.AuthService;
import org.springej.backende_commerce.repository.RegistroPagoRepository;
import org.springej.backende_commerce.repository.UsuarioRepository;
import org.springej.backende_commerce.repository.VentaRepository;
import org.springej.backende_commerce.service.PaymentService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.view.RedirectView;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final VentaRepository ventaRepository;
    private final RegistroPagoRepository registroPagoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AuthService authService; // Inyectar AuthService

    @Value("${mercadopago.base.url}")
    private String baseUrl;

    // URLs de redirección para el frontend
    @Value("${frontend.url.success}")
    private String frontendSuccessUrl;

    @Value("${frontend.url.failure}")
    private String frontendFailureUrl;

    @Value("${frontend.url.pending}")
    private String frontendPendingUrl;

    public PaymentController(PaymentService paymentService,
                             VentaRepository ventaRepository,
                             RegistroPagoRepository registroPagoRepository,
                             UsuarioRepository usuarioRepository,
                             AuthService authService) { // Añadir AuthService al constructor
        this.paymentService = paymentService;
        this.ventaRepository = ventaRepository;
        this.registroPagoRepository = registroPagoRepository;
        this.usuarioRepository = usuarioRepository;
        this.authService = authService;
    }

    @PostMapping("/create-order")
    public ResponseEntity<Map<String, String>> createOrder(@Valid @RequestBody VentaDTO ventaDTO) throws Exception {
        // Obtener el usuario autenticado
        Usuario usuario = authService.getUsuarioLogeado();

        // Registrar la venta con sus productos y obtener el total calculado
        VentaCreationResult result = ventaService.registrarVenta(ventaDTO, usuario); // Llamar a VentaService
        Venta venta = result.getVenta();
        BigDecimal totalCalculado = result.getTotalCalculado();

        String externalRef = String.valueOf(venta.getId());
        String notificationUrl = baseUrl + "/api/payments/webhook";

        String initPoint = paymentService.createPreference(
                "Compra en E-commerce Yacomo",
                totalCalculado, // Usar el total calculado por VentaService
                1,
                externalRef,
                notificationUrl
        );

        return ResponseEntity.ok(Map.of("init_point", initPoint));
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload) {
        try {
            if (payload.get("type").equals("payment")) {
                Long paymentId = Long.valueOf(((Map<String, Object>) payload.get("data")).get("id").toString());

                PaymentClient paymentClient = new PaymentClient();
                Payment payment = paymentClient.get(paymentId);

                Long ventaId = Long.valueOf(payment.getExternalReference());
                Venta venta = ventaRepository.findById(ventaId)
                        .orElseThrow(() -> new RuntimeException("Venta no encontrada con ID: " + ventaId));

                RegistroPago registro = registroPagoRepository.findByMpPaymentId(String.valueOf(paymentId))
                        .orElseGet(RegistroPago::new);

                registro.setMpPaymentId(String.valueOf(paymentId));
                registro.setStatus(payment.getStatus());
                registro.setAmount(payment.getTransactionAmount());
                registro.setPaymentMethod(payment.getPaymentMethodId());
                if (payment.getDateApproved() != null) {
                    registro.setDateApproved(payment.getDateApproved().toLocalDateTime());
                }
                registro.setVenta(venta);
                registroPagoRepository.save(registro);

                switch (payment.getStatus()) {
                    case "approved" -> venta.setEstado("APROBADA");
                    case "in_process", "pending" -> venta.setEstado("PENDIENTE");
                    case "rejected" -> venta.setEstado("RECHAZADA");
                    default -> venta.setEstado("DESCONOCIDO");
                }
                ventaRepository.save(venta);
            }
            return ResponseEntity.ok("Webhook procesado");
        } catch (Exception e) {
            // Loggear el error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error procesando webhook: " + e.getMessage());
        }
    }

    // Redirecciones al Frontend
    @GetMapping("/success")
    public RedirectView pagoExitoso() { return new RedirectView(frontendSuccessUrl); }

    @GetMapping("/failure")
    public RedirectView pagoFallido() { return new RedirectView(frontendFailureUrl); }

    @GetMapping("/pending")
    public RedirectView pagoPendiente() { return new RedirectView(frontendPendingUrl); }
}