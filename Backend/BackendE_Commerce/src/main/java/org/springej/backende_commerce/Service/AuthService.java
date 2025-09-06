package org.springej.backende_commerce.Service;

import org.springej.backende_commerce.Dto.LoginDTO;
import org.springej.backende_commerce.Dto.RegisterDTO;
import org.springej.backende_commerce.Model.Usuario;
import org.springej.backende_commerce.Repository.UsuarioRepository;
import org.springej.backende_commerce.Util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

@Service
public class AuthService {
    private final UsuarioRepository usuarioRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    public AuthService(UsuarioRepository usuarioRepository, JwtUtil jwtUtil){
        this.usuarioRepository = usuarioRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public Usuario registrarUsuario(RegisterDTO usuarioDTO){
        System.out.println("Intentando registrar: " + usuarioDTO.getEmail());

        Optional<Usuario> existeusuario = usuarioRepository.findByEmail(usuarioDTO.getEmail());
        if(existeusuario.isPresent()){
            System.out.println("Email ya registrado");
            throw new RuntimeException("El email que intenta ingresar ya esta registrado.");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(usuarioDTO.getNombre());
        usuario.setEmail(usuarioDTO.getEmail());
        usuario.setPassword(passwordEncoder.encode(usuarioDTO.getPassword()));

        Usuario saved = usuarioRepository.save(usuario);
        System.out.println("Usuario guardado: " + saved.getEmail());
        return saved;
    }

    public String loginUsuario(LoginDTO usuarioDTO){
        Usuario usuario = usuarioRepository.findByEmail(usuarioDTO.getEmail()).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(usuarioDTO.getPassword(), usuario.getPassword())){
            throw new RuntimeException("Usuario no encontrado.");
        }

        return jwtUtil.generateToken(usuario);
    }
}
