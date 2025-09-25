package org.example.Controller;

import org.example.Entity.Imagen;
import org.example.Entity.Producto;
import org.example.Service.CloudinaryService;
import org.example.repository.ImagenRepository;
import org.example.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/productos")
@CrossOrigin(origins = "*")
public class ProductoImagenController {

    @Autowired private ProductoRepository productoRepository;
    @Autowired private ImagenRepository imagenRepository;
    @Autowired private CloudinaryService cloudinaryService;

    @PostMapping("/{idProducto}/imagenes")
    public ResponseEntity<?> subirImagenes(@PathVariable Integer idProducto,
                                           @RequestParam("imagenes") MultipartFile[] imagenes) {
        try {
            Optional<Producto> opt = productoRepository.findById(idProducto);
            if (opt.isEmpty()) {
                return ResponseEntity.badRequest().body("Producto no encontrado");
            }

            Producto producto = opt.get();

            for (MultipartFile file : imagenes) {
                // Subir a Cloudinary
                Map uploadResult = cloudinaryService.upload(file);
                String secureUrl = uploadResult.get("secure_url").toString();
                String publicId = uploadResult.get("public_id").toString();

                // Crear entidad Imagen
                Imagen imagen = new Imagen();
                imagen.setUrl(secureUrl);
                imagen.setPublicId(publicId);
                imagen.setFechaFoto(LocalDateTime.now());
                imagen.setProducto(producto); // Establecer la relación

                // Guardar la imagen (la relación se establece automáticamente)
                imagenRepository.save(imagen);
            }

            return ResponseEntity.ok("Imágenes subidas y asociadas correctamente");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{idProducto}/imagenes/{idImagen}")
    public ResponseEntity<?> eliminarImagen(@PathVariable Integer idProducto,
                                            @PathVariable Integer idImagen) {
        try {
            Optional<Producto> optProd = productoRepository.findById(idProducto);
            if (optProd.isEmpty()) {
                return ResponseEntity.badRequest().body("Producto no encontrado");
            }

            Optional<Imagen> optImg = imagenRepository.findById(idImagen);
            if (optImg.isEmpty()) {
                return ResponseEntity.badRequest().body("Imagen no encontrada");
            }

            Imagen imagen = optImg.get();

            // Verificar que la imagen pertenece al producto
            if (!imagen.getProducto().getIdProducto().equals(idProducto)) {
                return ResponseEntity.badRequest().body("La imagen no pertenece a este producto");
            }

            // Borrar en Cloudinary
            if (imagen.getPublicId() != null) {
                try {
                    cloudinaryService.destroy(imagen.getPublicId());
                } catch (Exception e) {
                    System.err.println("Error eliminando de Cloudinary: " + e.getMessage());
                    // Continuar con la eliminación de BD aunque falle Cloudinary
                }
            }

            // Eliminar de la base de datos
            imagenRepository.delete(imagen);

            return ResponseEntity.ok("Imagen eliminada correctamente");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}