package org.springej.backende_commerce.repository;

import org.springej.backende_commerce.entity.Favorito;
import org.springej.backende_commerce.entity.Producto;
import org.springej.backende_commerce.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoritoRepository extends JpaRepository<Favorito, Long> {
    Optional<Favorito> findByUsuarioAndProducto(Usuario usuario, Producto producto);
    List<Favorito> findByUsuario(Usuario usuario);
    boolean existsByUsuarioAndProducto(Usuario usuario, Producto producto);
    // Opción 1: buscar por el ID del usuario
    List<Favorito> findByUsuario_Id(Long usuarioId);

}
