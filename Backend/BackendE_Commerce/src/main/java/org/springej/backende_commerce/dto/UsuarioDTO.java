package org.springej.backende_commerce.dto;


import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springej.backende_commerce.entity.Usuario;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String apellido;
    private String email;
    private LocalDate fechaRegistro; // Campo añadido para el frontend

    /**
     * Constructor para mapear una entidad Usuario a un UsuarioDTO.
     * @param usuario La entidad Usuario a convertir.
     */
    public UsuarioDTO(Usuario usuario) {
        this.id = usuario.getId();
        this.nombre = usuario.getNombre();
        this.apellido = usuario.getApellido();
        this.email = usuario.getEmail();
        this.fechaRegistro = usuario.getFechaRegistro(); // Asumiendo que el campo existe en la entidad Usuario
    }
}
