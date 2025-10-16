package org.springej.backende_commerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.util.List;

@Entity
@Table(name = "promociones")
@Getter
@Setter
@NoArgsConstructor
public class Promocion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "porcentaje_descuento")
    private double porcentajeDescuento;

    @OneToMany(mappedBy = "promocion")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ProductoVenta> productoVentas;
}
