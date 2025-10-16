package org.springej.backende_commerce.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;

import java.util.List;

@Entity
@Table(name="productos")
@Getter
@Setter
@NoArgsConstructor
@Audited
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre", unique = true)
    private String nombre;

    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "precio")
    private double precio;

    @OneToMany(mappedBy = "producto")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Estrellas> estrellas;

    @OneToMany(mappedBy = "producto")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<Favorito> favoritos;

    @OneToMany(mappedBy = "producto")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ProductoImagen> productoImagenes;

    @OneToMany(mappedBy = "producto")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ProductoVenta> productoVentas;
}
