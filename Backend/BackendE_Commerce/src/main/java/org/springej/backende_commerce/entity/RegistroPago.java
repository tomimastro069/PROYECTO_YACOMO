package org.springej.backende_commerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "registro_pago")
@Data
@NoArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})
public class RegistroPago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idRegistro_Pago")
    private Long id;

    @Column(name = "mp_payment_id", unique = true)
    private String mpPaymentId;

    @Column(name = "status")
    private String status;

    @Column(name = "amount")
    private BigDecimal amount;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "date_approved")
    private LocalDateTime dateApproved;

    @OneToOne
    @JoinColumn(name = "idVenta", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Venta venta;

}