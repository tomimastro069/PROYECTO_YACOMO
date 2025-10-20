package org.springej.backende_commerce.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springej.backende_commerce.entity.Rol;
import org.springej.backende_commerce.repository.RolRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Componente que se ejecuta al iniciar la aplicación para inicializar datos esenciales.
 * En este caso, se asegura de que los roles básicos del sistema existan en la base de datos.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Iniciando la verificación e inicialización de roles...");

        List<String> roles = Arrays.asList("USER", "ADMIN");

        for (String rolNombre : roles) {
            if (rolRepository.findByNombre(rolNombre).isEmpty()) {
                Rol nuevoRol = new Rol();
                nuevoRol.setNombre(rolNombre);
                rolRepository.save(nuevoRol);
                log.info("Rol '{}' no encontrado. Creando y guardando en la base de datos.", rolNombre);
            } else {
                log.info("Rol '{}' ya existe en la base de datos. No se requiere acción.", rolNombre);
            }
        }
    }
}