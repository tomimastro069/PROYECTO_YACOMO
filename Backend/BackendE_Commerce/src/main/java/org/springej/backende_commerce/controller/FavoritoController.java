package org.springej.backende_commerce.controller;

import lombok.RequiredArgsConstructor;

import org.hibernate.Hibernate;
import org.springej.backende_commerce.dto.FavoritoResponseDTO;
import org.springej.backende_commerce.entity.Favorito;
import org.springej.backende_commerce.entity.Usuario;
import org.springej.backende_commerce.exception.ResourceNotFoundException;
import org.springej.backende_commerce.exception.AlreadyExistsException;
import org.springej.backende_commerce.service.AuthService;
import org.springej.backende_commerce.service.FavoritoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
public class FavoritoController {

    private final FavoritoService favoritoService;
    private final AuthService authService;

    /**
     * Agrega un producto a los favoritos del usuario logeado
     * @param idProducto id del producto que se quiere agregar
     * @return DTO del favorito creado
     * @throws ResourceNotFoundException si el usuario o producto no existen
     * @throws AlreadyExistsException si el usuario ya tiene este producto en favoritos
     */
    @PostMapping("/agregar")
    public ResponseEntity<FavoritoResponseDTO> agregarFavorito(@RequestParam Long idProducto) {
        Usuario usuario = authService.getUsuarioLogeado();
        Favorito favorito = favoritoService.agregarFavorito(usuario.getId(), idProducto);
        FavoritoResponseDTO responseDTO = new FavoritoResponseDTO(favorito);
        return ResponseEntity.ok(responseDTO);
    }

    /**
     * Elimina un favorito existente del usuario logeado
     * @param idProducto id del producto que se quiere eliminar de favoritos
     * @return No content
     * @throws ResourceNotFoundException si el usuario o producto no existen
     */
    @DeleteMapping("/eliminar")
    public ResponseEntity<Void> eliminarFavorito(@RequestParam Long idProducto) {
        Usuario usuario = authService.getUsuarioLogeado();
        favoritoService.eliminarFavorito(usuario.getId(), idProducto);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lista todos los favoritos del usuario logeado
     * @return Lista de DTOs de los favoritos del usuario
     * @throws ResourceNotFoundException si el usuario no existe
     */
    @GetMapping
    public ResponseEntity<List<FavoritoResponseDTO>> obtenerFavoritos() {
        Usuario usuario = authService.getUsuarioLogeado();

        List<Favorito> favoritos = favoritoService.obtenerFavoritosDeUsuario(usuario.getId());

        List<FavoritoResponseDTO> responseDTOs = favoritos.stream()
                .peek(f -> {
                    // ⚙️ Esto evita proxies dentro de la lista
                    Hibernate.initialize(f.getProducto());
                })
                .map(FavoritoResponseDTO::new)
                .toList();

        return ResponseEntity.ok(responseDTOs);
    }


}
