package org.springej.backende_commerce.dto;

import java.time.Instant;

public record CambioNombreDTO(
        Integer numeroRevision,
        String nombre,
        Instant fecha
) {}