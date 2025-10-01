package org.springej.backende_commerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="Producto")
@Data
@NoArgsConstructor
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idProducto")
    private Long id;

    @Column(name = "nombre_producto", unique = true)
    private String nombre;

    @Column(name = "descripcion_producto")
    private String descripcion;

    @Column(name = "precio_unitario_producto")
    private double precio;
}
