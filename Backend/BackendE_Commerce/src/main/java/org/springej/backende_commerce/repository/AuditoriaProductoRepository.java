package org.springej.backende_commerce.repository;

import org.springej.backende_commerce.entity.AuditoriaProducto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditoriaProductoRepository extends JpaRepository<AuditoriaProducto, Long> {
}