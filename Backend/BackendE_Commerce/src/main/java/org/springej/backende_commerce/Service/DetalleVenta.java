package org.springej.backende_commerce.Service;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;

@Entity
public class DetalleVenta {
    @Id
    @GeneratedValue
    private int id;
}
