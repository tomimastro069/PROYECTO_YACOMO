package org.springej.backende_commerce.Model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="Producto")
@Data
@NoArgsConstructor
public class Producto {
    @Id
    @GeneratedValue
    @Column(name = "idProducto")
    private Long id;

    @Column(name = "nombre_producto")
    private String nombre;

    @Column(name = "Descripcion")
    private String descripcion;

    @Column(name = "Precio_producto")
    private double precio;
}
