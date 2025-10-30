package org.springej.backende_commerce.repository;

import org.springej.backende_commerce.entity.Estrellas;
import org.springej.backende_commerce.entity.Producto;
import org.springej.backende_commerce.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstrellasRepository extends JpaRepository<Estrellas, Long> {

    Optional<Estrellas> findByUsuarioAndProducto(Usuario usuario, Producto producto);

    @Query("SELECT AVG(e.puntuacion) FROM Estrellas e WHERE e.producto.id = :productoId")
    Double promedioPorProducto(Long productoId);
}
