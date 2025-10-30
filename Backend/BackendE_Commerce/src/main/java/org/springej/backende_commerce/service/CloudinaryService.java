package org.springej.backende_commerce.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(@Value("${cloudinary.cloud_name}") String cloudName,
                             @Value("${cloudinary.api_key}") String apiKey,
                             @Value("${cloudinary.api_secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }

    /**
     * ✅ Método original (mantener por compatibilidad)
     * Genera public_id aleatorio
     */
    public Map<String, Object> upload(MultipartFile file) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("resource_type", "auto"));
    }

    /**
     * 🔥 NUEVO: Sube imagen con public_id consistente
     * Si subes la misma imagen dos veces, SOBRESCRIBE la anterior
     *
     * @param file - Archivo a subir
     * @param productoId - ID del producto
     * @param index - Índice de la imagen (0, 1, 2...)
     * @return Map con url, public_id, etc.
     */
    public Map<String, Object> upload(MultipartFile file, Long productoId, int index) throws IOException {
        // Generar public_id único basado en producto: "productos/123_0"
        String publicId = String.format("productos/%d_%d", productoId, index);

        Map<String, Object> params = ObjectUtils.asMap(
                "public_id", publicId,
                "overwrite", true,        // ⬅️ Sobrescribe si ya existe
                "resource_type", "auto",
                "folder", "productos"     // Organiza en carpeta "productos"
        );

        return cloudinary.uploader().upload(file.getBytes(), params);
    }

    /**
     * 🔥 NUEVO: Sube imagen usando hash del archivo (alternativa)
     * Detecta duplicados por contenido
     */
    public Map<String, Object> uploadWithHash(MultipartFile file, String hash) throws IOException {
        String publicId = String.format("productos/hash_%s", hash);

        Map<String, Object> params = ObjectUtils.asMap(
                "public_id", publicId,
                "overwrite", true,
                "resource_type", "auto",
                "folder", "productos"
        );

        return cloudinary.uploader().upload(file.getBytes(), params);
    }

    /**
     * Elimina imagen de Cloudinary
     */
    public Map<String, Object> destroy(String publicId) throws IOException {
        return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    /**
     * Genera URL segura desde public_id
     */
    public String generateUrl(String publicId) {
        return cloudinary.url().secure(true).generate(publicId);
    }

    /**
     * 🔥 NUEVO: Verifica si una imagen existe en Cloudinary
     */
    public boolean exists(String publicId) {
        try {
            Map result = cloudinary.api().resource(publicId, ObjectUtils.emptyMap());
            return result != null && result.containsKey("public_id");
        } catch (Exception e) {
            return false;
        }
    }
}