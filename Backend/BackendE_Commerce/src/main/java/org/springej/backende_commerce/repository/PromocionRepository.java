package org.springej.backende_commerce.repository;

import org.springej.backende_commerce.entity.Promocion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PromocionRepository extends JpaRepository<Promocion,Long> {
}
