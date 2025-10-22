package org.springej.backende_commerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class DomicilioRequest {
    @NotBlank(message = "La dirección es obligatoria")
    private String direccion;

    @Positive(message = "El código de área debe ser positivo")
    private int codigo_area;
}