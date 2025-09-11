package org.springej.backende_commerce.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Rol_Usuario")
@Data
@NoArgsConstructor
public class RolUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idRol_Usuario")
    private Long id;  // PK artificial

    @ManyToOne
    @JoinColumn(name = "idRol", nullable = false)
    private Rol rol;

    @ManyToOne
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;
}
