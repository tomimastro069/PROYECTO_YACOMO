package org.springej.backende_commerce.Util;


import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springej.backende_commerce.Model.Usuario;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256); // genera clave secreta
    private final long expiration = 1000 * 60 * 60; // 1 hora en ms

    // Generar token
    public String generateToken(Usuario usuario) {
        return Jwts.builder()
                .setSubject(usuario.getEmail()) // sub = email
                .setIssuedAt(new Date()) // fecha de creación
                .setExpiration(new Date(System.currentTimeMillis() + expiration)) // expiración
                .signWith(key) // firma con clave secreta
                .compact(); // genera el string del token
    }

    // Validar token
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token); // si no falla, el token es válido
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false; // token inválido o expirado
        }
    }

    // Obtener email del token
    public String getEmailFromToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject(); // el subject contiene el email
    }
}
