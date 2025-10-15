package org.springej.backende_commerce.controller;

import org.springej.backende_commerce.dto.RevisionDTO;
import org.springej.backende_commerce.dto.CambioPrecioDTO;
import org.springej.backende_commerce.dto.CambioNombreDTO;
import org.springej.backende_commerce.entity.Producto;
import org.springej.backende_commerce.service.ProductoAuditoriaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/productos/auditoria")
@RequiredArgsConstructor
public class ProductoAuditoriaController {

    private final ProductoAuditoriaService auditoriaService;

    @GetMapping("/{id}/historial")
    public ResponseEntity<List<RevisionDTO>> obtenerHistorial(@PathVariable Long id) {
        return ResponseEntity.ok(auditoriaService.obtenerHistorial(id));
    }

    @GetMapping("/{id}/ultima-modificacion")
    public ResponseEntity<RevisionDTO> obtenerUltimaModificacion(@PathVariable Long id) {
        var revision = auditoriaService.obtenerUltimaModificacion(id);
        return revision != null ?
                ResponseEntity.ok(revision) :
                ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/en-fecha")
    public ResponseEntity<Producto> obtenerProductoEnFecha(
            @PathVariable Long id,
            @RequestParam LocalDateTime fecha) {
        var producto = auditoriaService.obtenerProductoEnFecha(id, fecha);
        return producto != null ?
                ResponseEntity.ok(producto) :
                ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/historial-precios")
    public ResponseEntity<List<CambioPrecioDTO>> obtenerHistorialPrecios(@PathVariable Long id) {
        return ResponseEntity.ok(auditoriaService.obtenerHistorialPrecios(id));
    }

    @GetMapping("/{id}/historial-nombres")
    public ResponseEntity<List<CambioNombreDTO>> obtenerHistorialNombres(@PathVariable Long id) {
        return ResponseEntity.ok(auditoriaService.obtenerHistorialNombres(id));
    }
}