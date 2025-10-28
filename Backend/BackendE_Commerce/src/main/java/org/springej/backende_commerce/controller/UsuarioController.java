package org.springej.backende_commerce.controller;

import lombok.RequiredArgsConstructor;
import jakarta.validation.Valid;
import org.springej.backende_commerce.dto.DomicilioDTO;
import org.springej.backende_commerce.dto.DomicilioRequest;
import org.springej.backende_commerce.dto.FavoritoResponseDTO;
import org.springej.backende_commerce.dto.PerfilDTO;
import org.springej.backende_commerce.dto.VentaResumenDTO;
import org.springej.backende_commerce.dto.AdminUsuarioRequest;
import org.springej.backende_commerce.dto.UsuarioAdminDTO;
import org.springej.backende_commerce.entity.Usuario;
import org.springej.backende_commerce.service.AuthService;
import org.springej.backende_commerce.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5500") // Permite peticiones desde el frontend
public class UsuarioController {

    private final AuthService authService;
    private final UsuarioService usuarioService;

    /**
     * Endpoint para obtener los datos del perfil del usuario actualmente autenticado.
     * La autenticación es manejada por Spring Security a través del token JWT.
     * @return ResponseEntity con los datos del usuario en un DTO.
     */
    @GetMapping("/me")
    public ResponseEntity<PerfilDTO> obtenerMiPerfil() {
        // 1. Obtiene el objeto Usuario completo del usuario que hace la petición.
        Usuario usuarioLogeado = authService.getUsuarioLogeado();

        // 2. Construye el PerfilDTO con toda la información necesaria.
        PerfilDTO perfilDTO = new PerfilDTO();
        perfilDTO.setId(usuarioLogeado.getId());
        perfilDTO.setNombre(usuarioLogeado.getNombre());
        perfilDTO.setApellido(usuarioLogeado.getApellido());
        perfilDTO.setEmail(usuarioLogeado.getEmail());
        perfilDTO.setFechaRegistro(usuarioLogeado.getFechaRegistro());

        // 3. Mapea las ventas, favoritos y domicilios a sus respectivos DTOs.
        perfilDTO.setVentas(usuarioLogeado.getVentas().stream()
                .map(VentaResumenDTO::new)
                .collect(Collectors.toList()));

        perfilDTO.setFavoritos(usuarioLogeado.getProductosFavoritos().stream()
                .map(FavoritoResponseDTO::new)
                .collect(Collectors.toList()));

        perfilDTO.setDomicilios(usuarioLogeado.getDomicilios().stream()
                .map(DomicilioDTO::new)
                .collect(Collectors.toList()));

        return ResponseEntity.ok(perfilDTO);
    }

    @PostMapping("/domicilios")
    public ResponseEntity<DomicilioDTO> crearDomicilio(@Valid @RequestBody DomicilioRequest request) {
        Usuario usuarioLogeado = authService.getUsuarioLogeado();
        DomicilioDTO domicilioDTO = usuarioService.agregarDomicilio(usuarioLogeado, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(domicilioDTO);
    }

    @DeleteMapping("/domicilios/{id}")
    public ResponseEntity<Void> eliminarDomicilio(@PathVariable Long id) {
        Usuario usuarioLogeado = authService.getUsuarioLogeado();
        usuarioService.eliminarDomicilio(usuarioLogeado, id);
        return ResponseEntity.noContent().build();
    }

    // ===================== ADMIN CRUD =====================
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<java.util.List<UsuarioAdminDTO>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarTodosAdmin());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioAdminDTO> obtenerUsuario(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerPorIdAdmin(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioAdminDTO> crearUsuario(@Valid @RequestBody AdminUsuarioRequest request) {
        UsuarioAdminDTO creado = usuarioService.crearUsuarioAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(creado);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioAdminDTO> actualizarUsuario(@PathVariable Long id,
                                                             @Valid @RequestBody AdminUsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.actualizarUsuarioAdmin(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminarUsuarioAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
