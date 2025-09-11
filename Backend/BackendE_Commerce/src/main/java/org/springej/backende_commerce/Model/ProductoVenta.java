package org.springej.backende_commerce.Model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "Procto_Venta")
@Data
@NoArgsConstructor
public class ProductoVenta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idVenta")
    private Venta venta;

    @ManyToOne
    @JoinColumn(name = "idPromocion")
    private Promocion promocion;

    @Column(name = "idProducto_Venta")
    private Producto producto;

    @Column(name = "")
    private int cantidad_Producto_Venta;

}
