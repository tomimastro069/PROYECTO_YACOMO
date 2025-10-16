package org.springej.backende_commerce.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "promociones")
@Data
@NoArgsConstructor
public class Promocion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idPromocion")
    private Long id;

    @Column(name = "porcentaje_promocion")
    private double porcentajeDescuento;
}
