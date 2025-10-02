package org.springej.backende_commerce.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "producto_imagen")
@Data
@NoArgsConstructor
public class ProductoImagen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idProductoImagen")
    private Integer idProductoImagen;

    @ManyToOne
    @JoinColumn(name = "producto_idProducto", referencedColumnName = "idProducto")
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "imagen_idImagen", referencedColumnName = "idImagen")
    private Imagen imagen;

}
