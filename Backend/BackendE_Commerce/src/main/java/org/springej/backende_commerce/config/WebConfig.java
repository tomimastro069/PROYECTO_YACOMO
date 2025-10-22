package org.springej.backende_commerce.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Logger logger = LoggerFactory.getLogger(WebConfig.class);

    /**
     * Configuración global de CORS para permitir que el frontend (servido en localhost:5500)
     * se comunique con todos los endpoints de la API del backend.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        logger.info("Configurando CORS para permitir acceso desde http://localhost:5500 y http://127.0.0.1:5500");
        registry.addMapping("/api/**") // Aplica la configuración a todos los endpoints bajo /api/
                .allowedOrigins(
                        "http://127.0.0.1:5500",
                        "http://localhost:5500"
                ) // Permite peticiones desde el Live Server (ambas URLs son equivalentes)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS") // Permite todos los métodos HTTP comunes
                .allowedHeaders("*") // Permite todos los encabezados en la petición (ej. Content-Type, Authorization)
                .allowCredentials(true); // Permite el envío de cookies o tokens de autorización
    }
}
