package org.springej.backende_commerce.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.util.List;

@Data
public class RegisterRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    private List<DomicilioRequest> domicilios;
}