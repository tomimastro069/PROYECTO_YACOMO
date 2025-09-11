package org.springej.backende_commerce.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@Table(name = "Usuario")
@NoArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "apellido")
    private String apellido;

    @Column(name = "email")
    private String email;

    @Column(name = "codigo_de_area")
    private int CodigoArea;

    @Column(name = "numero_telefono")
    private String numeroTelefono;

    //Navegacion Inversa con Ventas
    @OneToMany(mappedBy = "usuario")
    private List<Venta> ventas;

    //Navegacion Inversa con Favoritos
    @OneToMany(mappedBy = "usuario")
    private List<Favorito> productosFavoritos;
}
