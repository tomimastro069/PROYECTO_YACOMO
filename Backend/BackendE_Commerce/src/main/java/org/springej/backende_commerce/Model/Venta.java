package org.springej.backende_commerce.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;


@Entity
@Table(name = "Venta")
@Data
@NoArgsConstructor
public class Venta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idVenta")
    private Long id;

    @Column(name = "fecha_venta")
    private LocalDate fechaVenta;

    //Relacion con usuario
    @ManyToOne
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    //Navegacion Inversa con Registro Pago
    @OneToOne(mappedBy = "venta")
    private RegistroPago registroPago;

}
