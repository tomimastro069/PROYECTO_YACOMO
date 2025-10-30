package org.springej.backende_commerce.service;

import org.slf4j.Logger;
import lombok.RequiredArgsConstructor;
import org.slf4j.LoggerFactory;
import org.springej.backende_commerce.dto.ProductoDTO;
import org.springej.backende_commerce.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springej.backende_commerce.entity.Producto;
import java.util.Optional;

@Service
@Transactional
@RequiredArgsConstructor
public class ProductoService {

    private static final Logger logger = LoggerFactory.getLogger(ProductoService.class);
    private final ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public List<ProductoDTO> listarTodos() {
        logger.info("Consultando todos los productos con sus imágenes");

        // ✅ Opción 1: Si usas @EntityGraph
        List<Producto> productos = productoRepository.findAllWithImages();

        // ✅ Opción 2: Si usas el método en dos pasos
        // List<Long> ids = productoRepository.findAllProductIds();
        // List<Producto> productos = productoRepository.findByIdsWithImages(ids);

        logger.info("Se obtuvieron {} productos con imágenes", productos.size());

        return productos.stream()
                .map(ProductoDTO::new)
                .collect(Collectors.toList());
    }

    // ✅ DEVUELVE DTO
    @Transactional(readOnly = true)
    public Optional<ProductoDTO> buscarPorId(Long id) {
        logger.info("Buscando producto con imágenes con ID: {}", id);
        Optional<Producto> producto = productoRepository.findByIdWithImages(id);

        if (producto.isPresent()) {
            logger.info("Producto encontrado: {} con {} imágenes",
                    producto.get().getNombre(),
                    producto.get().getProductoImagenes() != null ?
                            producto.get().getProductoImagenes().size() : 0);
            return Optional.of(new ProductoDTO(producto.get()));
        } else {
            logger.info("Producto con ID {} no existe", id);
            return Optional.empty();
        }
    }

    // Guardar producto (crear o actualizar)
    public Producto guardar(Producto producto) {
        boolean esNuevo = producto.getId() == null;
        String accion = esNuevo ? "CREAR" : "ACTUALIZAR";

        logger.info("Guardando producto: {} ({})", producto.getNombre(), accion);

        try {
            Producto productoGuardado = productoRepository.save(producto);
            logger.info("Producto {} exitosamente con ID: {}",
                    esNuevo ? "creado" : "actualizado", productoGuardado.getId());
            return productoGuardado;

        } catch (Exception e) {
            logger.error("Error al guardar producto {}: {}", producto.getNombre(), e.getMessage());
            throw e;
        }
    }

    // Eliminar producto por ID
    public void eliminar(Long id) {
        logger.info("Eliminando producto con ID: {}", id);

        try {
            Optional<Producto> producto = productoRepository.findById(id);
            if (producto.isPresent()) {
                productoRepository.deleteById(id);
                logger.info("Producto con ID {} eliminado exitosamente", id);
            } else {
                logger.warn("Intento de eliminar producto inexistente con ID: {}", id);
            }

        } catch (Exception e) {
            logger.error("Error al eliminar producto con ID {}: {}", id, e.getMessage());
            throw e;
        }
    }

    // Actualización parcial de un producto
    public Optional<Producto> actualizarParcial(Long id, Map<String, Object> campos) {
        logger.info("Actualizando parcialmente producto con ID: {}", id);
        logger.debug("Campos a actualizar: {}", campos);

        try {
            return productoRepository.findById(id).map(producto -> {
                StringBuilder cambiosRealizados = new StringBuilder();

                campos.forEach((campo, valor) -> {
                    Field field = ReflectionUtils.findField(Producto.class, campo);
                    if (field != null) {
                        field.setAccessible(true);
                        Object valorAnterior = ReflectionUtils.getField(field, producto);

                        if (campo.equals("precio") && valor instanceof Number) {
                            valor = ((Number) valor).doubleValue();
                        }

                        ReflectionUtils.setField(field, producto, valor);
                        cambiosRealizados.append(String.format("%s: %s -> %s; ",
                                campo, valorAnterior, valor));
                    }
                });

                Producto productoActualizado = productoRepository.save(producto);
                logger.info("Producto actualizado parcialmente: {}", cambiosRealizados.toString());
                return productoActualizado;
            });

        } catch (Exception e) {
            logger.error("Error en actualización parcial del producto ID {}: {}", id, e.getMessage());
            throw e;
        }
    }

    public boolean existePorId(Long id) {
        logger.debug("Verificando existencia del producto con ID: {}", id);
        boolean existe = productoRepository.existsById(id);
        logger.debug("Producto con ID {} {}", id, existe ? "existe" : "no existe");
        return existe;
    }

    public long contarProductos() {
        logger.info("Contando total de productos");
        long total = productoRepository.count();
        logger.info("Total de productos: {}", total);
        return total;
    }

    @Transactional(readOnly = true)
    public Optional<Producto> buscarPorNombre(String nombre) {
        logger.info("Buscando producto por nombre: {}", nombre);
        Optional<Producto> resultado = productoRepository.findByNombreIgnoreCase(nombre.trim());

        if (resultado.isEmpty()) {
            logger.warn("Producto no encontrado con nombre: {}", nombre);
        } else {
            logger.info("Producto encontrado: {}", resultado.get().getNombre());
        }
        return resultado;
    }
    @Transactional(readOnly = true)
    public List<ProductoDTO> buscar(String termino) {
        logger.info("Buscando productos por término: {}", termino);
        List<Producto> resultados = productoRepository.buscarPorNombreODescripcion(termino);

        if (resultados.isEmpty()) {
            logger.warn("No se encontraron productos que coincidan con '{}'", termino);
        }

        return resultados.stream()
                .map(ProductoDTO::new)
                .collect(Collectors.toList());
    }
}