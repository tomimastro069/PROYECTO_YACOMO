package org.springej.backende_commerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springej.backende_commerce.entity.Domicilio;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DomicilioDTO {
    private Long id;
    private String direccion;
    private int codigo_area;

    public DomicilioDTO(Domicilio domicilio) {
        this.id = domicilio.getId();
        this.direccion = domicilio.getDireccion();
        this.codigo_area = domicilio.getCodigo_area();
    }
}