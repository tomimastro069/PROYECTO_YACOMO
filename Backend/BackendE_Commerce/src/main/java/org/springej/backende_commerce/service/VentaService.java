package org.springej.backende_commerce.service;

import lombok.RequiredArgsConstructor;
import org.springej.backende_commerce.entity.*;
import org.springej.backende_commerce.repository.*;
import org.springej.backende_commerce.dto.VentaDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
    public Venta registrarVenta(VentaDTO ventaDTO, Usuario usuario) {
        logger.info("Iniciando proceso de registro de venta para usuario ID: {}", usuario.getId());

        // 2. Crear y guardar la venta
        Venta venta = new Venta();
        venta.setUsuario(usuario);
        venta.setFechaVenta(ventaDTO.getFechaVenta());

        venta = ventaRepository.save(venta);
        logger.debug("Venta creada con ID: {}", venta.getId());

        // 3. Procesar cada producto de la venta
        for (VentaDTO.ProductoVentaDTO productoDTO : ventaDTO.getProductos()) {
            logger.debug("Procesando producto ID: {} con cantidad: {}",
                    productoDTO.getIdProducto(), productoDTO.getCantidadProductoVenta());

            // Validar que el producto existe
            Producto producto = productoRepository.findById(productoDTO.getIdProducto())
                    .orElseThrow(() -> {
                        logger.error("Producto con ID {} no encontrado", productoDTO.getIdProducto());
                        return new IllegalArgumentException("Producto no encontrado con ID: " + productoDTO.getIdProducto());
                    });

            // Validar promoción si se especifica
            Promocion promocion = null;
            if (productoDTO.getIdPromocion() != null) {
                promocion = promocionRepository.findById(productoDTO.getIdPromocion())
                        .orElseThrow(() -> {
                            logger.error("Promoción con ID {} no encontrada", productoDTO.getIdPromocion());
                            return new IllegalArgumentException("Promoción no encontrada con ID: " + productoDTO.getIdPromocion());
                        });
                logger.debug("Promoción aplicada: {}", promocion.getId());
            }

            // Crear registro en ProductoVenta
            ProductoVenta productoVenta = new ProductoVenta();
            productoVenta.setVenta(venta);
            productoVenta.setProducto(producto);
            productoVenta.setPromocion(promocion);
            productoVenta.setCantidadProductoVenta(productoDTO.getCantidadProductoVenta());

            productoVentaRepository.save(productoVenta);

            logger.debug("ProductoVenta guardado: {} x {} unidades",
                    producto.getNombre(), productoDTO.getCantidadProductoVenta());
        }

        logger.info("Venta registrada exitosamente. ID: {}, Usuario: {}, Productos: {}",
                venta.getId(), usuario.getId(), ventaDTO.getTotalProductos());

        return venta;
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
            throw new IllegalArgumentException("Usuario no encontrado con ID: " + idUsuario);
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