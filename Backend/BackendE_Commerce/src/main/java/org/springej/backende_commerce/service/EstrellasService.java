package org.springej.backende_commerce.service;

import lombok.RequiredArgsConstructor;
import org.springej.backende_commerce.dto.EstrellasDTO;
import org.springej.backende_commerce.entity.Estrellas;
import org.springej.backende_commerce.entity.Producto;
import org.springej.backende_commerce.entity.Usuario;
import org.springej.backende_commerce.exception.ResourceNotFoundException;
import org.springej.backende_commerce.repository.EstrellasRepository;
import org.springej.backende_commerce.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EstrellasService {

    private final EstrellasRepository estrellasRepository;
    private final ProductoRepository productoRepository;

    @Transactional
    public void guardarPuntuacion(EstrellasDTO estrellasDTO, Usuario usuario) {
        Producto producto = productoRepository.findById(estrellasDTO.getProductoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + estrellasDTO.getProductoId()));

        Optional<Estrellas> calificacionExistente = estrellasRepository.findByUsuarioAndProducto(usuario, producto);

        Estrellas estrellas;
        if (calificacionExistente.isPresent()) {
            // Actualizar calificacion existente
            estrellas = calificacionExistente.get();
            estrellas.setPuntuacion(estrellasDTO.getPuntuacion());
        } else {
            // Crear nueva calificacion
            estrellas = new Estrellas();
            estrellas.setUsuario(usuario);
            estrellas.setProducto(producto);
            estrellas.setPuntuacion(estrellasDTO.getPuntuacion());
        }

        estrellasRepository.save(estrellas);
    }
    
    public Double obtenerPromedioEstrellas(Long productoId) {
        return estrellasRepository.promedioPorProducto(productoId);
    }
}
