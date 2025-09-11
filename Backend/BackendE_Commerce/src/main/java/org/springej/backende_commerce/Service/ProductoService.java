package org.springej.backende_commerce.Service;

import org.springej.backende_commerce.Repository.ProductoRepository;
import org.springej.backende_commerce.Model.Producto;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    // Listar todos los productos
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    // Buscar producto por ID
    public Optional<Producto> buscarPorId(Long id) {
        return productoRepository.findById(id);
    }

    // Guardar producto (crear o actualizar)
    public Producto guardar(Producto producto) {
        return productoRepository.save(producto);
    }

    // Eliminar producto por ID
    public void eliminar(Long id) {
        productoRepository.deleteById(id);
    }

//

    // Actualización parcial de un producto
    public Optional<Producto> actualizarParcial(Long id, Map<String, Object> campos) {
        return productoRepository.findById(id).map(producto -> {
            campos.forEach((campo, valor) -> {
                Field field = ReflectionUtils.findField(Producto.class, campo);
                if (field != null) {
                    field.setAccessible(true);
                    // Conversión de tipos para campos específicos
                    if (campo.equals("precio") && valor instanceof Number) {
                        valor = ((Number) valor).doubleValue();
                    }
                    ReflectionUtils.setField(field, producto, valor);
                }
            });
            return productoRepository.save(producto);
        });
    }

    // Verificar si un producto existe
    public boolean existePorId(Long id) {
        return productoRepository.existsById(id);
    }

    // Contar total de productos
    public long contarProductos() {
        return productoRepository.count();
    }

//    // Listar productos con paginación
//    public Page<Producto> listarPaginado(Pageable pageable) {
//        return productoRepository.findAll(pageable);
//    }
//   // Buscar productos por nombre y/o rango de precios
//    public List<Producto> buscarProductos(String nombre, Double precioMin, Double precioMax) {
//        // Si todos los parámetros son nulos, retorna todos los productos
//        if (nombre == null && precioMin == null && precioMax == null) {
//            return listarTodos();
//        }
//
//        // Busca por los criterios proporcionados
//        return productoRepository.findByMultipleCriteria(nombre, precioMin, precioMax);
//    }
//
//    // Buscar productos por nombre (búsqueda parcial)
//    public List<Producto> buscarPorNombre(String nombre) {
//        return productoRepository.findByNombreContainingIgnoreCase(nombre);
//    }
//
//    // Buscar productos por precio máximo
//    public List<Producto> buscarPorPrecioMaximo(Double precioMax) {
//        return productoRepository.findByPrecioLessThanEqual(precioMax);
//    }
//
//    // Buscar productos por rango de precios
//    public List<Producto> buscarPorRangoPrecios(Double precioMin, Double precioMax) {
//        if (precioMin != null && precioMax != null) {
//            return productoRepository.findByPrecioBetween(precioMin, precioMax);
//        } else if (precioMin != null) {
//            return productoRepository.findByPrecioGreaterThanEqual(precioMin);
//        } else if (precioMax != null) {
//            return productoRepository.findByPrecioLessThanEqual(precioMax);
//        } else {
//            return listarTodos();
//        }
//    }
//    // Calcular precio promedio de todos los productos
//    public Double calcularPrecioPromedio() {
//        return productoRepository.calcularPrecioPromedio();
//    }
//
//    // Buscar productos más caros
//    public List<Producto> buscarMasCaros(int limite) {
//        return productoRepository.findTopByOrderByPrecioDesc().stream()
//                .limit(limite)
//                .toList();
//    }
//
//    // Buscar productos más baratos
//    public List<Producto> buscarMasBaratos(int limite) {
//        return productoRepository.findTopByOrderByPrecioAsc().stream()
//                .limit(limite)
//                .toList();
//    }
//
//    // Actualizar precio de un producto
//    public Optional<Producto> actualizarPrecio(Long id, double nuevoPrecio) {
//        return productoRepository.findById(id).map(producto -> {
//            producto.setPrecio(nuevoPrecio);
//            return productoRepository.save(producto);
//        });
//    }
//
//    // Buscar productos por descripción
//    public List<Producto> buscarPorDescripcion(String descripcion) {
//        return productoRepository.findByDescripcionContainingIgnoreCase(descripcion);
//    }
//
//    // Buscar productos por nombre o descripción
//    public List<Producto> buscarPorNombreODescripcion(String texto) {
//        return productoRepository.findByNombreOrDescripcion(texto);
//    }
}