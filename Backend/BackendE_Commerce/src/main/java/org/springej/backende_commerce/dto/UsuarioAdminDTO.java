package org.springej.backende_commerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioAdminDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private LocalDate fechaRegistro;
    private List<String> roles;
}

