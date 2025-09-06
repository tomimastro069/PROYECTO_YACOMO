package org.springej.backende_commerce.Controller;


import org.springej.backende_commerce.Dto.LoginDTO;
import org.springej.backende_commerce.Dto.RegisterDTO;
import org.springej.backende_commerce.Model.Usuario;
import org.springej.backende_commerce.Service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService){
        this.authService = authService;
    }

    // Endpoint para registrar usuario
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterDTO request) {
        Usuario nuevoUsuario = authService.registrarUsuario(request);
        return ResponseEntity.ok("Usuario registrado: " + nuevoUsuario.getEmail());
    }

    // Endpoint para login
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginDTO request) {
        String token = authService.loginUsuario(request); // Aquí authService genera el JWT
        return ResponseEntity.ok(token);
    }

}
