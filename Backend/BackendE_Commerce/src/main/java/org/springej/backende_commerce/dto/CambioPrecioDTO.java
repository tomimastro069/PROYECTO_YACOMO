package org.springej.backende_commerce.dto;

import java.time.Instant;

public record CambioPrecioDTO(
        Integer numeroRevision,
        Double precio,
        Instant fecha
) {}
