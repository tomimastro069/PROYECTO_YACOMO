package org.springej.backende_commerce.controller;

import lombok.RequiredArgsConstructor;
import org.springej.backende_commerce.entity.Favorito;
import org.springej.backende_commerce.entity.Usuario;
import org.springej.backende_commerce.exception.ResourceNotFoundException;
import org.springej.backende_commerce.exception.AlreadyExistsException;
import org.springej.backende_commerce.service.AuthService;
import org.springej.backende_commerce.service.FavoritoService;
import org.springej.backende_commerce.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favoritos")
@RequiredArgsConstructor
public class FavoritoController {

    private final FavoritoService favoritoService;
    private final UsuarioRepository usuarioRepository;
    private final AuthService authService;

    /**
     * Agrega un producto a los favoritos del usuario logeado
     * @param idProducto id del producto que se quiere agregar
     * @return Favorito creado
     * @throws ResourceNotFoundException si el usuario o producto no existen
     * @throws AlreadyExistsException si el usuario ya tiene este producto en favoritos
     */
    @PostMapping("/agregar")
    public ResponseEntity<Favorito> agregarFavorito(@RequestParam Long idProducto) {
        Usuario usuario = authService.getUsuarioLogeado();
        Favorito favorito = favoritoService.agregarFavorito(usuario.getId(), idProducto);
        return ResponseEntity.ok(favorito);
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
     * @return Lista de favoritos del usuario
     * @throws ResourceNotFoundException si el usuario no existe
     */
    @GetMapping
    public ResponseEntity<List<Favorito>> obtenerFavoritos() {
        Usuario usuario = authService.getUsuarioLogeado();
        List<Favorito> favoritos = favoritoService.obtenerFavoritosDeUsuario(usuario.getId());
        return ResponseEntity.ok(favoritos);
    }


}
