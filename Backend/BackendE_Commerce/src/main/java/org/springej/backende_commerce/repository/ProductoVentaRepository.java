package org.springej.backende_commerce.repository;

import org.springej.backende_commerce.entity.ProductoVenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoVentaRepository extends JpaRepository<ProductoVenta, Long> {
}