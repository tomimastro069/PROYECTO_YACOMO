package org.springej.backende_commerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminUsuarioRequest {
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato del email no es válido")
    private String email;

    // Opcional en actualización: si es null o vacío, no se cambia
    private String password;

    // "USER" o "ADMIN"
    @NotBlank(message = "El rol es obligatorio")
    private String rol;
}

