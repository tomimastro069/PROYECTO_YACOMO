package org.springej.backende_commerce.repository;

import org.springej.backende_commerce.entity.Imagen;
import org.springej.backende_commerce.entity.Producto;
import org.springej.backende_commerce.entity.ProductoImagen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProductoImagenRepository extends JpaRepository<ProductoImagen,Integer> {

    // Metodo para buscar la relación Producto_Imagen por producto e imagen
    Optional<ProductoImagen> findByProductoAndImagen(Producto producto, Imagen imagen);
}

//CONSULTA PARA VER A Q PRODUCTO PERTENECE CADA IMAGEN
//SELECT
//    i.idImagen,
//    i.url,
//    i.public_id,
//    p.idProducto,
//    p.nombre_producto,
//    p.descripcion_producto,
//    p.precio_unitario_producto
//FROM imagen i
//JOIN producto_imagen pi ON i.idImagen = pi.imagen_idImagen
//JOIN producto p ON pi.producto_idProducto = p.idProducto
//WHERE i.idImagen = 1;  -- reemplazá 123 con el ID de la imagen que quieras consultar