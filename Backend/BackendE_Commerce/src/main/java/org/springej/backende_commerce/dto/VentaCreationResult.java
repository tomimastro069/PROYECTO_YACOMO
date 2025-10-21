package org.springej.backende_commerce.dto;

import org.springej.backende_commerce.entity.Venta;

import java.math.BigDecimal;

/**
 * DTO para encapsular el resultado de la creación de una venta,
 * incluyendo la venta misma y el total calculado.
 */
public class VentaCreationResult {
    private Venta venta;
    private BigDecimal totalCalculado;

    public VentaCreationResult(Venta venta, BigDecimal totalCalculado) {
        this.venta = venta;
        this.totalCalculado = totalCalculado;
    }

    public Venta getVenta() { return venta; }
    public BigDecimal getTotalCalculado() { return totalCalculado; }
}