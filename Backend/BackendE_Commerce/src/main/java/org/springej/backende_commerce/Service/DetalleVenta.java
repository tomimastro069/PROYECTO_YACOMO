package org.springej.backende_commerce.Service;

import jakarta.persistence.*;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import org.springframework.stereotype.Service;

@Service
public class DetalleVenta {
    @Id
    @GeneratedValue
    private int id;
}
