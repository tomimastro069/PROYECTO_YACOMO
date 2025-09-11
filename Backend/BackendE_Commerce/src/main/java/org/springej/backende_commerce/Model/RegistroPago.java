package org.springej.backende_commerce.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Registro_Pago")
@Data
@NoArgsConstructor
public class RegistroPago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cantidad_total")
    private float cantidadTotal;

    @Column(name = "cvu")
    private int cvu;

    @Column(name = "alias")
    private String alias;

    // Relación con Venta
    @OneToOne
    @JoinColumn(name = "Venta_idVenta", nullable = false)
    private Venta venta;

//    @JoinColumn
//    @Column(name = "Venta_Usuario_idUsuario")
//    private Usuario usuario;
}
