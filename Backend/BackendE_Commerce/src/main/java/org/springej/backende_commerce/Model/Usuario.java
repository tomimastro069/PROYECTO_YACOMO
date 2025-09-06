package org.springej.backende_commerce.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String nombre;            //SI SE AGREGAN MAS COSAS HAY QUE CAMBIAR ./AUTHSERVICE EN EL METODO REGISTER

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

}
