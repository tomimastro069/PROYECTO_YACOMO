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

    // Para la respuesta
    private UsuarioDTO usuario;

    @NotNull(message = "La fecha de venta es obligatoria")
    private LocalDate fechaVenta;

    @NotEmpty(message = "La lista de productos no puede estar vacía")
    @Valid
    private List<ProductoVentaDTO> productos;

    @NotNull(message = "El estado es obligatorio")
    private String estado;

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

        // El precio unitario no se recibe, se calcula en el backend. Se devuelve en la respuesta.
        private java.math.BigDecimal precioUnitario;

        // Nuevo: nombre del producto para enviar directo al frontend
        private String nombreProducto;

        // Constructor de compatibilidad (sin nombreProducto)
        public ProductoVentaDTO(Long idProducto, Integer cantidad, java.math.BigDecimal precioUnitario) {
            this.idProducto = idProducto;
            this.cantidad = cantidad;
            this.precioUnitario = precioUnitario;
            this.nombreProducto = null;
        }
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
