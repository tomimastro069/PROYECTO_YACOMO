package org.springej.backende_commerce.repository;

import org.springej.backende_commerce.entity.Estrellas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstrellasRepository extends JpaRepository<Estrellas, Long> {
}
