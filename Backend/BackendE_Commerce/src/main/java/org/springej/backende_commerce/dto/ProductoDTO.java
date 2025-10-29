package org.springej.backende_commerce.dto;

import lombok.*;
import org.springej.backende_commerce.entity.Producto;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO para transferir información de productos CON imágenes
 * Rompe la referencia circular
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ProductoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private double precio;
    private Integer stock;
    private String promocion;
    private List<ImagenDTO> imagenes; // Solo URLs, sin referencias circulares

    /**
     * Constructor que mapea desde la entidad Producto
     */
    public ProductoDTO(Producto producto) {
        this.id = producto.getId();
        this.nombre = producto.getNombre();
        this.descripcion = producto.getDescripcion();
        this.precio = producto.getPrecio();
        this.stock = producto.getStock();
        this.promocion = producto.getPromocion();

        // Mapear solo las URLs de las imágenes (sin referencias circulares)
        this.imagenes = new ArrayList<>();
        if (producto.getProductoImagenes() != null && !producto.getProductoImagenes().isEmpty()) {
            this.imagenes = producto.getProductoImagenes()
                    .stream()
                    .filter(pi -> pi.getImagen() != null)
                    .map(pi -> new ImagenDTO(
                            pi.getImagen().getId(),
                            pi.getImagen().getUrl(),
                            pi.getImagen().getPublicId()
                    ))
                    .collect(Collectors.toList());
        }
    }
}