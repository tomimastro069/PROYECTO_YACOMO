package org.springej.backende_commerce.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springej.backende_commerce.dto.CambioNombreDTO;
import org.springej.backende_commerce.entity.Producto;
import org.springej.backende_commerce.repository.ProductoRepository;
import org.springej.backende_commerce.dto.RevisionDTO;
import org.springej.backende_commerce.dto.CambioPrecioDTO;
import org.springframework.data.history.Revision;
import org.springframework.data.history.Revisions;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.hibernate.envers.AuditReaderFactory;
import org.hibernate.envers.query.AuditEntity;
import jakarta.persistence.EntityManager;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoAuditoriaService {

    private static final Logger logger = LoggerFactory.getLogger(ProductoAuditoriaService.class);
    private final ProductoRepository productoRepository;
    private final EntityManager entityManager;

    /**
     * Obtiene todo el historial de cambios de un producto
     */
    public List<RevisionDTO> obtenerHistorial(Long productoId) {
        Revisions<Integer, Producto> revisions = productoRepository.findRevisions(productoId);

        return revisions.getContent().stream()
                .map(revision -> {
                    Producto producto = revision.getEntity();
                    return new RevisionDTO(
                            revision.getRevisionNumber().orElse(0),
                            revision.getRevisionInstant().orElse(Instant.now()),
                            producto.getNombre(),
                            producto.getDescripcion(),
                            producto.getPrecio()
                    );
                })
                .collect(Collectors.toList());
    }

    /**
     * Obtiene la última modificación de un producto
     */
    public RevisionDTO obtenerUltimaModificacion(Long productoId) {
        Revision<Integer, Producto> lastRevision =
                productoRepository.findLastChangeRevision(productoId).orElse(null);

        if (lastRevision == null) return null;

        Producto producto = lastRevision.getEntity();
        return new RevisionDTO(
                lastRevision.getRevisionNumber().orElse(0),
                lastRevision.getRevisionInstant().orElse(Instant.now()),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getPrecio()
        );
    }

    /**
     * Obtiene el estado de un producto en una fecha específica
     */
    public Producto obtenerProductoEnFecha(Long productoId, LocalDateTime fecha) {
        var auditReader = AuditReaderFactory.get(entityManager);

        try {

            Date timestamp = Date.from(fecha.atZone(ZoneId.systemDefault()).toInstant());

            Number revisionNumber = auditReader.getRevisionNumberForDate(timestamp);
            if (revisionNumber == null) {
                logger.warn("No se encontró una revisión para el producto ID {} en o antes de la fecha {}", productoId, fecha);
                return null;
            }
            return auditReader.find(Producto.class, productoId, revisionNumber);
        } catch (Exception e) {
            logger.error("Error al obtener el producto ID {} en la fecha {}: {}", productoId, fecha, e.getMessage());
            return null;
        }
    }

    /**
     * Obtiene historial de cambios de precio de un producto
     */
    public List<CambioPrecioDTO> obtenerHistorialPrecios(Long productoId) {
        var auditReader = AuditReaderFactory.get(entityManager);

        @SuppressWarnings("unchecked")
        List<Object[]> results = auditReader.createQuery()
                .forRevisionsOfEntity(Producto.class, false, true)
                .add(AuditEntity.id().eq(productoId))
                .addProjection(AuditEntity.revisionNumber())
                .addProjection(AuditEntity.property("precio"))
                .addProjection(AuditEntity.revisionProperty("timestamp"))
                .getResultList();

        return results.stream()
                .map(result -> new CambioPrecioDTO(
                        (Integer) result[0],
                        (Double) result[1],
                        Instant.ofEpochMilli((Long) result[2])
                ))
                .collect(Collectors.toList());
    }

    /**
     * Obtiene todos los cambios de nombre de un producto
     */
    public List<CambioNombreDTO> obtenerHistorialNombres(Long productoId) {
        var auditReader = AuditReaderFactory.get(entityManager);

        @SuppressWarnings("unchecked")
        List<Object[]> results = auditReader.createQuery()
                .forRevisionsOfEntity(Producto.class, false, true)
                .add(AuditEntity.id().eq(productoId))
                .addProjection(AuditEntity.revisionNumber())
                .addProjection(AuditEntity.property("nombre"))
                .addProjection(AuditEntity.revisionProperty("timestamp"))
                .getResultList();

        return results.stream()
                .map(result -> new CambioNombreDTO(
                        (Integer) result[0],
                        (String) result[1],
                        Instant.ofEpochMilli((Long) result[2])
                ))
                .collect(Collectors.toList());
    }

    /**
     * Cuenta cuántas veces se ha modificado un producto
     */
    public long contarModificaciones(Long productoId) {
        return productoRepository.findRevisions(productoId).getContent().size();
    }

    /**
     * Verifica si un producto fue modificado después de una fecha
     */
    public boolean fueModificadoDespuesDe(Long productoId, LocalDateTime fecha) {
        Revision<Integer, Producto> lastRevision =
                productoRepository.findLastChangeRevision(productoId).orElse(null);

        if (lastRevision == null) return false;

        Instant lastModified = lastRevision.getRevisionInstant().orElse(Instant.MIN);
        Instant fechaBusqueda = fecha.atZone(ZoneId.systemDefault()).toInstant();

        return lastModified.isAfter(fechaBusqueda);
    }

}