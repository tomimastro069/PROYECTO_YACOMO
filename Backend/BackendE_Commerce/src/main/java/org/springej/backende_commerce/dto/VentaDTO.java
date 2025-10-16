package org.springej.backende_commerce.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentaDTO {

    @NotNull(message = "El ID del usuario es obligatorio")
    @Positive(message = "El ID del usuario debe ser positivo")
    // Se elimina idUsuario para tomarlo del contexto de seguridad (usuario logeado)
    // private Long idUsuario;

    @NotNull(message = "La fecha de venta es obligatoria")
    private LocalDate fechaVenta;

    @NotEmpty(message = "La lista de productos no puede estar vacía")
    @Valid
    private List<ProductoVentaDTO> productos;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductoVentaDTO {

        @NotNull(message = "El ID del producto es obligatorio")
        @Positive(message = "El ID del producto debe ser positivo")
        private Long idProducto;

        @NotNull(message = "La cantidad es obligatoria")
        @Min(value = 1, message = "La cantidad debe ser al menos 1")
        private Integer cantidad;

        // ID de promoción opcional
        private Long idPromocion;
    }

    // Métodos helper
    public int getTotalProductos() {
        return productos != null ? productos.size() : 0;
    }

    public int getCantidadTotalItems() {
        return productos != null ?
                productos.stream().mapToInt(ProductoVentaDTO::getCantidad).sum() : 0;
    }
}