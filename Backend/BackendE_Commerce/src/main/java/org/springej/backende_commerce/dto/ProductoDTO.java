package org.springej.backende_commerce.dto;

import lombok.*;
import org.springej.backende_commerce.entity.Producto;

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
    private Double estrellas; 


    public ProductoDTO(Producto producto) {
        this.id = producto.getId();
        this.nombre = producto.getNombre();
        this.descripcion = producto.getDescripcion();
        this.precio = producto.getPrecio();
        this.stock = producto.getStock();
    }
}
