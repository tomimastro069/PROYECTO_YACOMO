package org.springej.backende_commerce.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "domicilio")
@Getter
@Setter
@NoArgsConstructor
public class Domicilio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (name = "direccion")
    private String direccion;

    @Column(name = "codigo_area")
    private int codigo_area;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;


}
