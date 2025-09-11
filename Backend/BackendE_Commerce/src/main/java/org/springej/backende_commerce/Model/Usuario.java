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
    @Column(name = "idUsuario")
    private Long id;

    @Column(name = "nombre_usuario")
    private String nombre;

    @Column(name = "apellido_usuario")
    private String apellido;

    @Column(name = "contrasena_usuario")
    private String password;

    @Column(name = "email_usuario")
    private String email;

    @Column(name = "codigo_area_usuario")
    private int CodigoArea;

    @Column(name = "numero_telefono_usuario")
    private String numeroTelefono;

    @Column(name = "es_admin_usuario")
    private boolean esAdmin;

    //Navegacion Inversa con Ventas
    @OneToMany(mappedBy = "usuario")
    private List<Venta> ventas;

    //Navegacion Inversa con Favoritos
    @OneToMany(mappedBy = "usuario")
    private List<Favorito> productosFavoritos;
}
