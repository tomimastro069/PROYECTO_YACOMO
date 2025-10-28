package org.springej.backende_commerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springej.backende_commerce.entity.Venta;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentaResumenDTO {
    private Long id;
    private LocalDate fechaVenta;
    private String estado;
    private List<VentaDTO.ProductoVentaDTO> productos;
    private BigDecimal total;

    public VentaResumenDTO(Venta venta) {
        this.id = venta.getId();
        this.fechaVenta = venta.getFechaVenta();
        this.estado = venta.getEstado();
        this.productos = venta.getProductos().stream()
                .map(pv -> new VentaDTO.ProductoVentaDTO(
                        pv.getProducto().getId(),
                        pv.getCantidad(),
                        pv.getPrecioUnitario(),
                        pv.getProducto().getNombre()
                ))
                .collect(Collectors.toList());
        // Calculamos el total de la venta sumando los subtotales de cada item
        this.total = venta.getProductos().stream()
                .map(pv -> pv.getPrecioUnitario().multiply(BigDecimal.valueOf(pv.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
