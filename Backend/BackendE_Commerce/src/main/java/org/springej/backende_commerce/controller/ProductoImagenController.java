package org.springej.backende_commerce.controller;

import lombok.RequiredArgsConstructor;
import org.springej.backende_commerce.entity.Imagen;
import org.springej.backende_commerce.entity.Producto;
import org.springej.backende_commerce.entity.ProductoImagen;
import org.springej.backende_commerce.repository.ImagenRepository;
import org.springej.backende_commerce.repository.ProductoImagenRepository;
import org.springej.backende_commerce.repository.ProductoRepository;
import org.springej.backende_commerce.service.CloudinaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/producto-imagenes")
@CrossOrigin(origins = "http://localhost:5500") // Es mejor ser específico que usar "*"
@RequiredArgsConstructor
public class ProductoImagenController {

    private final ProductoRepository productoRepository;
    private final ImagenRepository imagenRepository;
    private final ProductoImagenRepository productoImagenRepository;
    private final CloudinaryService cloudinaryService;

    // ---- SUBIR IMÁGENES ----
    @PostMapping("/producto/{productoId}")
    public ResponseEntity<?> subirImagenes(@PathVariable Long productoId,
                                           @RequestParam("imagenes") MultipartFile[] imagenes) {
        try {
            Optional<Producto> optProducto = productoRepository.findById(productoId);
            if (optProducto.isEmpty()) {
                return ResponseEntity.badRequest().body("Producto no encontrado");
            }
            Producto producto = optProducto.get();

            for (MultipartFile file : imagenes) {
                Map uploadResult = cloudinaryService.upload(file);
                String secureUrl = uploadResult.get("secure_url").toString();
                String publicId = uploadResult.get("public_id").toString();

                // Crear Imagen
                Imagen imagen = new Imagen();
                imagen.setUrl(secureUrl);
                imagen.setPublicId(publicId);
                imagen.setFechaFoto(LocalDateTime.now());
                imagenRepository.save(imagen);

                // Crear relación Producto_Imagen
                ProductoImagen pi = new ProductoImagen();
                pi.setProducto(producto);
                pi.setImagen(imagen);
                productoImagenRepository.save(pi);
            }

            return ResponseEntity.ok("Imágenes subidas y asociadas correctamente");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    // ---- ELIMINAR IMAGEN ----
    @DeleteMapping("/{idImagen}/producto/{productoId}")
    public ResponseEntity<?> eliminarImagen(@PathVariable Long productoId,
                                            @PathVariable Long idImagen) {
        try {
            Optional<Producto> optProducto = productoRepository.findById(productoId);
            if (optProducto.isEmpty()) {
                return ResponseEntity.badRequest().body("Producto no encontrado");
            }
            Producto producto = optProducto.get();

            Optional<Imagen> optImagen = imagenRepository.findById(idImagen);
            if (optImagen.isEmpty()) {
                return ResponseEntity.badRequest().body("Imagen no encontrada");
            }
            Imagen imagen = optImagen.get();

            // Verificar relación Producto_Imagen
            Optional<ProductoImagen> piOpt = productoImagenRepository.findByProductoAndImagen(producto, imagen);
            if (piOpt.isEmpty()) {
                return ResponseEntity.badRequest().body("La imagen no pertenece a este producto");
            }

            // Eliminar de Cloudinary
            if (imagen.getPublicId() != null) {
                try {
                    cloudinaryService.destroy(imagen.getPublicId());
                } catch (Exception e) {
                    System.err.println("Error eliminando de Cloudinary: " + e.getMessage());
                }
            }

            // Eliminar relación y luego imagen
            productoImagenRepository.delete(piOpt.get());
            imagenRepository.delete(imagen);

            return ResponseEntity.ok("Imagen eliminada correctamente");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}
