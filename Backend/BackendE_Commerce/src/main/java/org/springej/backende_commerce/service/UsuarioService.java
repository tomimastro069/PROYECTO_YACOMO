package org.springej.backende_commerce.service;

import lombok.RequiredArgsConstructor;
import org.springej.backende_commerce.dto.DomicilioDTO;
import org.springej.backende_commerce.dto.DomicilioRequest;
import org.springej.backende_commerce.dto.RegisterRequest;
import org.springej.backende_commerce.dto.AdminUsuarioRequest;
import org.springej.backende_commerce.dto.UsuarioAdminDTO;
import org.springej.backende_commerce.entity.Domicilio;
import org.springej.backende_commerce.exception.AlreadyExistsException;
import org.springej.backende_commerce.exception.ResourceNotFoundException;
import org.springej.backende_commerce.entity.Rol;
import org.springej.backende_commerce.entity.Usuario;
import org.springej.backende_commerce.repository.RolRepository;
import org.springej.backende_commerce.repository.DomicilioRepository;
import org.springej.backende_commerce.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.stream.Collectors;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final DomicilioRepository domicilioRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Registra un nuevo usuario con rol USER por defecto.
     *
     * @param request DTO con los datos del usuario a registrar
     * @return El usuario guardado
     * @throws AlreadyExistsException si el email ya está en uso
     * @throws ResourceNotFoundException si no se encuentra el rol USER
     */
    public Usuario registrarUsuario(RegisterRequest request) {
        usuarioRepository.findByEmail(request.getEmail()).ifPresent(u -> {
            throw new AlreadyExistsException("El email '" + request.getEmail() + "' ya está registrado.");
        });

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        Rol rol = rolRepository.findByNombre("USER")
                .orElseThrow(() -> new ResourceNotFoundException("No se pudo encontrar el rol 'USER' para la asignación inicial."));

        usuario.getRoles().add(rol);
        // Guardar domicilios si existen
        if (request.getDomicilios() != null && !request.getDomicilios().isEmpty()) {
            List<Domicilio> domicilios = request.getDomicilios().stream().map(d -> {
                Domicilio domicilio = new Domicilio();
                domicilio.setDireccion(d.getDireccion());
                domicilio.setCodigo_area(d.getCodigo_area());
                domicilio.setUsuario(usuario);
                return domicilio;
            }).toList();
            usuario.setDomicilios(domicilios);
        }
        return usuarioRepository.save(usuario);
    }

    public DomicilioDTO agregarDomicilio(Usuario usuario, DomicilioRequest request) {
        Domicilio domicilio = new Domicilio();
        domicilio.setDireccion(request.getDireccion());
        domicilio.setCodigo_area(request.getCodigo_area());
        domicilio.setUsuario(usuario);

        Domicilio guardado = domicilioRepository.save(domicilio);
        usuario.getDomicilios().add(guardado);
        return new DomicilioDTO(guardado);
    }

    public void eliminarDomicilio(Usuario usuario, Long domicilioId) {
        Domicilio domicilio = domicilioRepository.findById(domicilioId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro el domicilio con id: " + domicilioId));

        if (!domicilio.getUsuario().getId().equals(usuario.getId())) {
            throw new ResourceNotFoundException("El domicilio no pertenece al usuario autenticado.");
        }

        domicilioRepository.delete(domicilio);
    }

    /**
     * Busca un usuario por email.
     *
     * @param email Email del usuario
     * @return Optional con el usuario si existe
     */
    public Optional<Usuario> buscarPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    /**
     * Actualiza la contraseña de un usuario.
     *
     * @param email Usuario a actualizar
     * @param nuevaPassword Nueva contraseña sin encriptar
     * @return Usuario con la contraseña actualizada
     * @throws ResourceNotFoundException si no se encuentra el usuario
     */
    public Usuario actualizarPassword(String email, String nuevaPassword) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró un usuario con el email: " + email));

        usuario.setPassword(passwordEncoder.encode(nuevaPassword));
        return usuarioRepository.save(usuario);
    }

    /**
     * Genera el token de recuperación de contraseña para un usuario.
     *
     * @param email Email del usuario
     * @param jwtService Servicio JWT para generar el token
     * @return Token generado
     * @throws ResourceNotFoundException si no se encuentra el usuario
     */
    public String generarTokenRecuperacion(String email, JwtService jwtService) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró un usuario con el email: " + email));

        return jwtService.generatePasswordResetToken(usuario.getEmail());
    }

    /**
     * Envía el correo de recuperación de contraseña usando el EmailService.
     *
     * @param email Email del usuario
     * @param resetLink Link de recuperación
     * @param emailService Servicio de envío de emails
     */
    public void enviarEmailRecuperacion(String email, String resetLink, EmailService emailService) {
        emailService.sendPasswordResetEmail(email, resetLink);
    }

    // ========================= ADMIN CRUD =========================
    public List<UsuarioAdminDTO> listarTodosAdmin() {
        return usuarioRepository.findAll().stream().map(this::toAdminDTO).toList();
    }

    public UsuarioAdminDTO obtenerPorIdAdmin(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
        return toAdminDTO(usuario);
    }

    public UsuarioAdminDTO crearUsuarioAdmin(AdminUsuarioRequest request) {
        usuarioRepository.findByEmail(request.getEmail()).ifPresent(u -> {
            throw new AlreadyExistsException("El email '" + request.getEmail() + "' ya está registrado.");
        });

        Usuario usuario = Usuario.builder()
                .nombre(request.getNombre())
                .apellido(request.getApellido())
                .email(request.getEmail())
                .password(passwordEncoder.encode(
                        java.util.Optional.ofNullable(request.getPassword())
                                .orElseThrow(() -> new IllegalArgumentException("La contraseña es obligatoria"))
                ))
                .build();

        asignarRol(usuario, request.getRol());
        Usuario guardado = usuarioRepository.save(usuario);
        return toAdminDTO(guardado);
    }

    public UsuarioAdminDTO actualizarUsuarioAdmin(Long id, AdminUsuarioRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        usuario.getRoles().clear();
        asignarRol(usuario, request.getRol());

        Usuario guardado = usuarioRepository.save(usuario);
        return toAdminDTO(guardado);
    }

    public void eliminarUsuarioAdmin(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario no encontrado con id: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    private void asignarRol(Usuario usuario, String rolNombre) {
        String nombreNormalizado = (rolNombre == null) ? "" : rolNombre.trim().toUpperCase();
        Rol rol = rolRepository.findByNombre(nombreNormalizado)
                .orElseThrow(() -> new ResourceNotFoundException("No se pudo encontrar el rol '" + nombreNormalizado + "'"));
        usuario.getRoles().add(rol);
    }

    private UsuarioAdminDTO toAdminDTO(Usuario usuario) {
        List<String> roles = usuario.getRoles().stream().map(Rol::getNombre).toList();
        return new UsuarioAdminDTO(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getEmail(),
                usuario.getFechaRegistro(),
                roles
        );
    }
}
