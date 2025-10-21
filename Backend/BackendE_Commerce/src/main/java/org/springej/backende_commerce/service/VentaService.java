package org.springej.backende_commerce.service;

import lombok.RequiredArgsConstructor;
import org.springej.backende_commerce.dto.VentaCreationResult;
import org.springej.backende_commerce.exception.ResourceNotFoundException;
import org.springej.backende_commerce.entity.*;
import org.springej.backende_commerce.repository.*;
import org.springej.backende_commerce.dto.VentaDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class VentaService {

    private static final Logger logger = LoggerFactory.getLogger(VentaService.class);

    private final VentaRepository ventaRepository;
    private final ProductoVentaRepository productoVentaRepository;
    private final ProductoRepository productoRepository;
    private final PromocionRepository promocionRepository;
    private final UsuarioRepository usuarioRepository;

    /**
     * Registra una nueva venta para el usuario autenticado
     */
    public VentaCreationResult registrarVenta(VentaDTO ventaDTO, Usuario usuario) {
        logger.info("Iniciando proceso de registro de venta para usuario ID: {}", usuario.getId());

        Venta venta = new Venta();
        venta.setUsuario(usuario);
        venta.setFechaVenta(ventaDTO.getFechaVenta());
        venta.setEstado("PENDIENTE"); // Establecer estado inicial para la integración con Mercado Pago

        double totalVenta = 0.0;

        for (VentaDTO.ProductoVentaDTO productoDTO : ventaDTO.getProductos()) {
            logger.debug("Procesando producto ID: {} con cantidad: {}",
                    productoDTO.getIdProducto(), productoDTO.getCantidad());

            Producto producto = productoRepository.findById(productoDTO.getIdProducto())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con ID: " + productoDTO.getIdProducto()));

            // Verificar y descontar stock
            if (producto.getStock() == null || producto.getStock() < productoDTO.getCantidad()) {
                logger.warn("Intento de compra sin stock para producto ID: {}. Stock disponible: {}, Cantidad solicitada: {}",
                        producto.getId(), producto.getStock(), productoDTO.getCantidad());
                throw new IllegalStateException("No hay stock suficiente para el producto: " + producto.getNombre());
            }
            producto.setStock(producto.getStock() - productoDTO.getCantidad());

            Promocion promocion = null;
            if (productoDTO.getIdPromocion() != null) {
                promocion = promocionRepository.findById(productoDTO.getIdPromocion())
                        .orElseThrow(() -> new ResourceNotFoundException("Promoción no encontrada con ID: " + productoDTO.getIdPromocion()));
            }

            double precioUnitario = producto.getPrecio();
            if (promocion != null) {
                double descuento = promocion.getPorcentajeDescuento();
                precioUnitario = precioUnitario * (1 - (descuento / 100.0));
            }
            totalVenta += precioUnitario * productoDTO.getCantidad();

            ProductoVenta productoVenta = new ProductoVenta();
            productoVenta.setVenta(venta);
            productoVenta.setProducto(producto);
            productoVenta.setPromocion(promocion);
            productoVenta.setCantidad(productoDTO.getCantidad());
            productoVenta.setPrecioUnitario(precioUnitario);

            venta.getProductos().add(productoVenta);
        }

        // El campo 'total' fue eliminado de la entidad Venta. El total se calcula aquí y se devuelve.
        Venta ventaGuardada = ventaRepository.save(venta);

        logger.info("Venta registrada exitosamente. ID: {}, Usuario: {}, Total calculado: {:.2f}",
                ventaGuardada.getId(), usuario.getId(), totalVenta);

        return new VentaCreationResult(ventaGuardada, BigDecimal.valueOf(totalVenta));
    }

    /**
     * Obtiene todas las ventas de un usuario específico
     */
    @Transactional(readOnly = true)
    public List<Venta> obtenerVentasPorUsuario(Long idUsuario) {
        logger.info("Buscando todas las ventas para usuario ID: {}", idUsuario);

        // Validar que el usuario existe
        if (!usuarioRepository.existsById(idUsuario)) {
            logger.warn("Usuario con ID {} no existe", idUsuario);
            throw new ResourceNotFoundException("Usuario no encontrado con ID: " + idUsuario);
        }

        List<Venta> ventas = ventaRepository.findByUsuarioIdOrderByFechaVentaDesc(idUsuario);
        logger.info("Se encontraron {} ventas para el usuario ID: {}", ventas.size(), idUsuario);

        return ventas;
    }

    /**
     * Obtiene todas las ventas registradas en el sistema (solo para Admins)
     */
    @Transactional(readOnly = true)
    public List<Venta> listarTodasLasVentas() {
        logger.info("Listando todas las ventas del sistema");
        return ventaRepository.findAll();
    }
}