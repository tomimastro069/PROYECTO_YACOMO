package org.springej.backende_commerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import org.hibernate.Hibernate;
import org.springej.backende_commerce.entity.Favorito;
import org.springej.backende_commerce.entity.Producto;
import org.springej.backende_commerce.entity.Usuario;
import org.springej.backende_commerce.exception.AlreadyExistsException;
import org.springej.backende_commerce.exception.ResourceNotFoundException;
import org.springej.backende_commerce.repository.FavoritoRepository;
import org.springej.backende_commerce.repository.ProductoRepository;
import org.springej.backende_commerce.repository.UsuarioRepository;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoritoService {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;

    /**
     * Agrega un producto a los favoritos de un usuario
     * @param idUsuario id del usuario
     * @param idProducto id del producto
     * @return Favorito creado
     * @throws ResourceNotFoundException si el usuario o producto no existen
     * @throws AlreadyExistsException si el usuario ya tiene este producto en favoritos
     */
    public Favorito agregarFavorito(Long idUsuario, Long idProducto) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        if (favoritoRepository.existsByUsuarioAndProducto(usuario, producto)) {
            throw new AlreadyExistsException("El usuario ya marcó este producto como favorito");
        }

        Favorito favorito = new Favorito();
        favorito.setUsuario(usuario);
        favorito.setProducto(producto);
        return favoritoRepository.save(favorito);
    }

    /**
     * Elimina un favorito de un usuario
     * @param idUsuario id del usuario
     * @param idProducto id del producto
     * @throws ResourceNotFoundException si el usuario o producto no existen
     */
    public void eliminarFavorito(Long idUsuario, Long idProducto) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Producto producto = productoRepository.findById(idProducto)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

        favoritoRepository.findByUsuarioAndProducto(usuario, producto)
                .ifPresent(favoritoRepository::delete);
    }

    @Transactional(readOnly = true)
    public List<Favorito> obtenerFavoritosDeUsuario(Long usuarioId) {
        List<Favorito> favoritos = favoritoRepository.findByUsuario_Id(usuarioId);

        // ✅ Forzar la carga del Producto para evitar el proxy
        favoritos.forEach(fav -> {
            if (fav.getProducto() != null) {
                Hibernate.initialize(fav.getProducto());
            }
        });

        return favoritos;
    }
}
