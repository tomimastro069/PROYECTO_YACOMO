package org.example.repository;

import org.example.Entity.Imagen;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImagenRepository extends JpaRepository<Imagen, Integer> {}