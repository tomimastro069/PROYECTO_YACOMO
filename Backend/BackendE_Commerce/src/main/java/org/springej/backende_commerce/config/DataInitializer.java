package org.springej.backende_commerce.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springej.backende_commerce.entity.Rol;
import org.springej.backende_commerce.entity.Usuario;
import org.springej.backende_commerce.repository.RolRepository;
import org.springej.backende_commerce.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Inicializa roles y un usuario administrador al arrancar la aplicacion.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@ecommerce.com";
    private static final String ADMIN_PASSWORD = "admin123";

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Iniciando la verificacion e inicializacion de roles y usuario admin...");

        inicializarRolesBase();
        inicializarUsuarioAdmin();
    }

    private void inicializarRolesBase() {
        List<String> roles = Arrays.asList("USER", "ADMIN");

        for (String rolNombre : roles) {
            if (rolRepository.findByNombre(rolNombre).isEmpty()) {
                Rol nuevoRol = new Rol();
                nuevoRol.setNombre(rolNombre);
                rolRepository.save(nuevoRol);
                log.info("Rol '{}' creado correctamente.", rolNombre);
            } else {
                log.info("Rol '{}' ya existe. No se requiere accion.", rolNombre);
            }
        }
    }

    private void inicializarUsuarioAdmin() {
        usuarioRepository.findByEmail(ADMIN_EMAIL).ifPresentOrElse(
                usuario -> log.info("Usuario admin ya existe con email '{}'.", usuario.getEmail()),
                this::crearUsuarioAdmin
        );
    }

    private void crearUsuarioAdmin() {
        rolRepository.findByNombre("ADMIN").ifPresentOrElse(rolAdmin -> {
            Usuario admin = Usuario.builder()
                    .nombre("Administrador")
                    .apellido("Principal")
                    .email(ADMIN_EMAIL)
                    .password(passwordEncoder.encode(ADMIN_PASSWORD))
                    .build();
            admin.getRoles().add(rolAdmin);
            usuarioRepository.save(admin);
            log.info("Usuario admin creado por defecto con email '{}'.", ADMIN_EMAIL);
        }, () -> log.warn("No se pudo crear el usuario admin porque el rol 'ADMIN' no esta disponible."));
    }
}