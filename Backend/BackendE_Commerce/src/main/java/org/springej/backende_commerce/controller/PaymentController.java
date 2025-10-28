package org.springej.backende_commerce.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springej.backende_commerce.dto.CreateOrderRequestDTO;
import org.springej.backende_commerce.dto.VentaCreationResult;
import org.springej.backende_commerce.dto.VentaDTO;
import org.springej.backende_commerce.entity.Usuario;
import org.springej.backende_commerce.entity.Venta;
import org.springej.backende_commerce.service.AuthService;
import org.springej.backende_commerce.service.PaymentService;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.*;
import com.mercadopago.resources.payment.Payment;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.net.URI;
import org.springej.backende_commerce.service.RegistroPagoService;
import org.springej.backende_commerce.service.VentaService;
import org.springframework.beans.factory.annotation.Value;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://127.0.0.1:5500") // Allow requests from your frontend
public class PaymentController {

    private static final Logger logger = LoggerFactory.getLogger(PaymentController.class);
    private final PaymentService paymentService;
    private final VentaService ventaService;
    private final RegistroPagoService registroPagoService;
    private final AuthService authService; // Inyectar AuthService

    @Value("${mercadopago.base.url}")
    private String baseUrl;

    // URLs de redirecciÃ³n para el frontend
    @Value("${frontend.url.success}")
    private String frontendSuccessUrl;

    @Value("${frontend.url.failure}")
    private String frontendFailureUrl;

    @Value("${frontend.url.pending}")
    private String frontendPendingUrl;

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequestDTO orderRequest) {
        try {
            // Obtener el usuario autenticado
            Usuario usuario = authService.getUsuarioLogeado();

            // Adaptar el DTO de la solicitud al DTO que espera el servicio de Venta
            VentaDTO ventaDTO = new VentaDTO();
            ventaDTO.setFechaVenta(LocalDate.now()); // La fecha se establece en el backend
            ventaDTO.setProductos(
                    orderRequest.getProductos().stream()
                            .map(p -> new VentaDTO.ProductoVentaDTO(
                                    p.getIdProducto(),
                                    p.getCantidad(),
                                    null)) // precio_unitario se calcula en el servicio
                            .collect(Collectors.toList()));

            // Registrar la venta con sus productos y obtener el total calculado
            VentaCreationResult result = ventaService.registrarVenta(ventaDTO, usuario); // Llamar a VentaService
            Venta venta = result.getVenta();
            BigDecimal totalCalculado = result.getTotalCalculado();
    
            String externalRef = String.valueOf(venta.getId());
            String notificationUrl = baseUrl + "/api/payments/webhook";
    
            String initPoint = paymentService.createPreference(
                    "Compra en E-commerce Yacomo",
                    totalCalculado, // Usar el total calculado por VentaService
                    externalRef,
                    notificationUrl
            );
    
            return ResponseEntity.ok(Map.of("init_point", initPoint));
        } catch (MPApiException e) {
            logger.error("Error de API de Mercado Pago al crear preferencia (Status: {}, Response: {}): {}", e.getStatusCode(), e.getApiResponse().getContent(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.valueOf(e.getStatusCode())).body(Map.of("error", "Error del proveedor de pagos: " + e.getApiResponse().getContent()));
        } catch (MPException e) {
            logger.error("Error de SDK de Mercado Pago al crear preferencia: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Error al contactar al proveedor de pagos."));
        }
        // Captura excepciones de negocio (ej. stock insuficiente) y otras inesperadas
        catch (Exception e) {
            // Loggear cualquier otro error
            logger.error("Error al crear la orden de pago: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload) {
        logger.info("Webhook de Mercado Pago recibido: {}", payload);

        String type = (String) payload.get("type");
        if (!"payment".equals(type)) {
            return ResponseEntity.ok("NotificaciÃ³n ignorada (no es de tipo 'payment').");
        }

        try {
            Object dataObj = payload.get("data");
            if (!(dataObj instanceof Map)) {
                throw new IllegalArgumentException("El payload del webhook no contiene un objeto 'data' vÃ¡lido.");
            }
            Map<?, ?> dataMap = (Map<?, ?>) dataObj;

            // El ID puede venir como String o Long, lo manejamos de forma segura.
            Long paymentId = Optional.ofNullable(dataMap.get("id")).map(String::valueOf).map(Long::parseLong)
                    .orElseThrow(() -> new IllegalArgumentException("El payload del webhook no contiene el ID del pago."));

            Payment payment = paymentService.getPayment(paymentId);

            String externalReference = payment.getExternalReference();
            if (externalReference == null || externalReference.isBlank()) {
                logger.warn("El pago {} no tiene una referencia externa (ID de venta).", paymentId);
                return ResponseEntity.badRequest().body("El pago no tiene una referencia externa.");
            }

            Long ventaId = Long.valueOf(externalReference);

            // Usar servicios para manejar la lÃ³gica de negocio
            registroPagoService.procesarPago(payment, ventaId);

            logger.info("Webhook para el pago {} procesado correctamente.", paymentId);
            return ResponseEntity.ok("Webhook procesado");
        } catch (MPApiException | MPException e) {
            logger.error("Error al consultar la API de Mercado Pago: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Error al consultar el servicio de pago.");
        } catch (Exception e) {
            logger.error("Error procesando webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error procesando webhook: " + e.getMessage());
        }
    }

    // Redirecciones al Frontend
    @GetMapping("/success")
    public ResponseEntity<Void> pagoExitoso(HttpServletRequest request) {
        String qs = request.getQueryString();
        String url = frontendSuccessUrl + (qs != null && !qs.isBlank() ? (frontendSuccessUrl.contains("?") ? "&" : "?") + qs : "");
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(url));
        return new ResponseEntity<>(headers, HttpStatus.FOUND); // 302 Found
    }

    @GetMapping("/failure")
    public ResponseEntity<Void> pagoFallido(HttpServletRequest request) {
        String qs = request.getQueryString();
        String url = frontendFailureUrl + (qs != null && !qs.isBlank() ? (frontendFailureUrl.contains("?") ? "&" : "?") + qs : "");
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(url));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }

    @GetMapping("/pending")
    public ResponseEntity<Void> pagoPendiente(HttpServletRequest request) {
        String qs = request.getQueryString();
        String url = frontendPendingUrl + (qs != null && !qs.isBlank() ? (frontendPendingUrl.contains("?") ? "&" : "?") + qs : "");
        HttpHeaders headers = new HttpHeaders();
        headers.setLocation(URI.create(url));
        return new ResponseEntity<>(headers, HttpStatus.FOUND);
    }
}
