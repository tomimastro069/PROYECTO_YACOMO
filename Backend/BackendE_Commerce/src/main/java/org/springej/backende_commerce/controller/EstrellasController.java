package org.springej.backende_commerce.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springej.backende_commerce.dto.EstrellasDTO;
import org.springej.backende_commerce.entity.Usuario;
import org.springej.backende_commerce.service.AuthService;
import org.springej.backende_commerce.service.EstrellasService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:5500")
@RestController
@RequestMapping("/api/estrellas")
@RequiredArgsConstructor
public class EstrellasController {

    private final EstrellasService estrellasService;
    private final AuthService authService;

    @PostMapping
    public ResponseEntity<Void> darPuntuacion(@Valid @RequestBody EstrellasDTO estrellasDTO) {
        Usuario usuarioLogeado = authService.getUsuarioLogeado();
        estrellasService.guardarPuntuacion(estrellasDTO, usuarioLogeado);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }
    @GetMapping("/promedio/{productoId}")
    public ResponseEntity<Double> obtenerPromedioEstrellas(@PathVariable Long productoId) {
    Double promedio = estrellasService.obtenerPromedioEstrellas(productoId);
    return ResponseEntity.ok(promedio != null ? promedio : 0.0);
}
}