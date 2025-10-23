package org.springej.backende_commerce.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Getter
@Setter
@Table(name = "usuarios")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "apellido")
    private String apellido;

    @Column(name = "password")
    private String password;

    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

    //Navegacion Inversa con Ventas
    @OneToMany(mappedBy = "usuario")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonManagedReference
    private List<Venta> ventas;

    // 🔹 Evita recursión infinita (Usuario -> Favorito -> Usuario ...)
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @JsonManagedReference
    @Builder.Default
    private List<Favorito> productosFavoritos = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "usuario_rol",
            joinColumns = @JoinColumn(name = "usuario_id"),
            inverseJoinColumns = @JoinColumn(name = "rol_id"))
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Rol> roles = new HashSet<>();


    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "usuario",cascade = CascadeType.ALL)
    private List<Domicilio> domicilios= new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        fechaRegistro = LocalDate.now();
    }
}
