    package org.springej.backende_commerce.repository;

import org.springej.backende_commerce.entity.Imagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
    @Repository
    public interface ImagenRepository extends JpaRepository<Imagen,Long> {
        Optional<Imagen> findByPublicId(String publicId);
}
