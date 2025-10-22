package org.springej.backende_commerce.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.*;
import org.springej.backende_commerce.entity.Favorito;
import org.springej.backende_commerce.entity.Producto;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FavoritoResponseDTO {
    private Long idFavorito;
    private String usuario;

    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "favoritos", "productoVentas", "productoImagenes", "estrellas"})
    private Producto producto;

    public FavoritoResponseDTO(Favorito favorito) {
        this.idFavorito = favorito.getId();
        this.usuario = favorito.getUsuario().getNombre() + " " + favorito.getUsuario().getApellido();
        this.producto = favorito.getProducto();
    }
}
