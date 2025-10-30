package org.springej.backende_commerce.controller;

import lombok.RequiredArgsConstructor;
import org.springej.backende_commerce.dto.*;
import org.springej.backende_commerce.service.EmailService;
import org.springej.backende_commerce.service.JwtService;
import org.springej.backende_commerce.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserDetails user = (UserDetails) authentication.getPrincipal();

        String token = jwtService.generateToken(user);

        List<String> roles = user.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return ResponseEntity.ok(new JwtResponse(token, user.getUsername(), roles));
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request){
        usuarioService.registrarUsuario(request);
        return ResponseEntity.ok("Usuario registrado correctamente");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        String resetToken = usuarioService.generarTokenRecuperacion(request.getEmail(), jwtService);
        String resetLink = "http://127.0.0.1:5500/Frontend/html/reset-password.html?token=" + resetToken;
        usuarioService.enviarEmailRecuperacion(request.getEmail(), resetLink, emailService);
        return ResponseEntity.ok("Link de recuperación: " + resetLink);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        if (!jwtService.isPasswordResetToken(request.getToken())) {
            return ResponseEntity.badRequest().body("Token inválido para resetear contraseña");
        }

        String email = jwtService.obtenerUsername(request.getToken());
        usuarioService.actualizarPassword(email, request.getNewPassword());

        return ResponseEntity.ok("Contraseña actualizada correctamente");
    }
}