package org.springej.backende_commerce.repository;

import org.springej.backende_commerce.entity.Usuario;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByNombre(String nombre);

    Optional<Usuario> findByEmail(String email);

    @EntityGraph(attributePaths = "roles")
    Optional<Usuario> findWithRolesByEmail(String email);
}
