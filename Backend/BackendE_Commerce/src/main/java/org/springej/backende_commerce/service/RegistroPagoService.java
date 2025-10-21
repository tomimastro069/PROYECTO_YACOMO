package org.springej.backende_commerce.service;

import com.mercadopago.resources.payment.Payment;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springej.backende_commerce.entity.RegistroPago;
import org.springej.backende_commerce.entity.Venta;
import org.springej.backende_commerce.exception.ResourceNotFoundException;
import org.springej.backende_commerce.repository.RegistroPagoRepository;
import org.springej.backende_commerce.repository.VentaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RegistroPagoService {

    private static final Logger logger = LoggerFactory.getLogger(RegistroPagoService.class);

    private final RegistroPagoRepository registroPagoRepository;
    private final VentaRepository ventaRepository;

    /**
     * Procesa la notificación de pago de Mercado Pago, guarda el registro de pago
     * y actualiza el estado de la venta asociada.
     *
     * @param payment El objeto Payment de Mercado Pago con los detalles del pago.
     * @param ventaId El ID de la venta asociada a este pago.
     * @throws ResourceNotFoundException si la venta no se encuentra.
     */
    @Transactional
    public void procesarPago(Payment payment, Long ventaId) {
        logger.info("Procesando pago ID {} para venta ID {}", payment.getId(), ventaId);

        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con ID: " + ventaId));

        RegistroPago registro = registroPagoRepository.findByMpPaymentId(String.valueOf(payment.getId()))
                .orElseGet(RegistroPago::new);

        registro.setMpPaymentId(String.valueOf(payment.getId()));
        registro.setStatus(payment.getStatus());
        registro.setAmount(payment.getTransactionAmount());
        registro.setPaymentMethod(payment.getPaymentMethodId());
        if (payment.getDateApproved() != null) {
            registro.setDateApproved(payment.getDateApproved().toLocalDateTime());
        }
        registro.setVenta(venta);
        registroPagoRepository.save(registro);

        // Actualizar el estado de la venta
        venta.setEstado(mapMercadoPagoStatusToVentaEstado(payment.getStatus()));
        ventaRepository.save(venta);
        logger.info("Pago ID {} procesado. Estado de venta ID {} actualizado a {}", payment.getId(), ventaId, venta.getEstado());
    }

    private String mapMercadoPagoStatusToVentaEstado(String mpStatus) {
        return switch (mpStatus) {
            case "approved" -> "APROBADA";
            case "in_process", "pending" -> "PENDIENTE";
            case "rejected" -> "RECHAZADA";
            default -> "DESCONOCIDO";
        };
    }
}