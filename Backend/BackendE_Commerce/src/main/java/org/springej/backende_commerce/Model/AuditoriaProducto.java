package org.springej.backende_commerce.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "Auditoria_Producto")
@Data
@NoArgsConstructor
public class AuditoriaProducto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_producto")
    private String nombre;

    @Column(name = "descripcion_historico")
    private String descripcionHistorico;

    @Column(name = "precio_producto_historico")
    private float precioHistorico;

    @Column(name = "fecha_auditoria")
    private LocalDate fechaAuditoria;

    @ManyToOne
    @JoinColumn(name = "idProducto")
    private Producto producto;
}
