package org.springej.backende_commerce.Model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class DetalleVenta {
    @Id
    @GeneratedValue
    private Long id;
}
