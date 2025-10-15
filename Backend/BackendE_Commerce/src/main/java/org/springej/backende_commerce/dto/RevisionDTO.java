package org.springej.backende_commerce.dto;

import java.time.Instant;

public record RevisionDTO(
        Integer numeroRevision,
        Instant fechaRevision,
        String nombre,
        String descripcion,
        Double precio
) {}