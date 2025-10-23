package org.springej.backende_commerce.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import com.fasterxml.jackson.annotation.JsonIgnore;

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

    @Column(name = "stock")
    private Integer stock;

    private String promocion;

    @OneToMany(mappedBy = "producto")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @NotAudited
    private List<Estrellas> estrellas;

    @OneToMany(mappedBy = "producto")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @NotAudited
    @JsonIgnore
    private List<Favorito> favoritos;

    @OneToMany(mappedBy = "producto")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @NotAudited
    @JsonIgnore
    private List<ProductoImagen> productoImagenes;

    @OneToMany(mappedBy = "producto")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @NotAudited
    @JsonIgnore
    private List<ProductoVenta> productoVentas;

    @PrePersist
    public void prePersist() {
        if (this.promocion == null) {
            this.promocion = "0%";
        }
    }
}
