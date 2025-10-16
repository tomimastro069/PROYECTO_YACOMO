package org.springej.backende_commerce.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springej.backende_commerce.constantes.JwtConstantes;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private final String secretKey;

    public JwtService(@Value("${jwt.secret}") String secretKey) {
        this.secretKey = secretKey;
    }

    private Key obtenerKey(){
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }

    public String generateToken(UserDetails userDetails){
        return Jwts.builder()
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + JwtConstantes.JWT_EXPIRATION_TIME)) // 7 dias
                .signWith(obtenerKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String obtenerUsername(String token){
        return obtenerClaim(token, Claims::getSubject);
    }

    public <T> T obtenerClaim(String token, Function<Claims, T> claimsTFunction){
        final Claims claims = obtenerTodosLosClaims(token);
        return claimsTFunction.apply(claims);
    }

    private Claims obtenerTodosLosClaims(String token){
        return Jwts.parserBuilder()
                .setSigningKey(obtenerKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token, UserDetails userDetails){
        final String email = obtenerUsername(token);
        return (email.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    private boolean isTokenExpired(String token){
        return obtenerClaim(token, Claims::getExpiration).before(new Date());
    }

    public String generatePasswordResetToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("reset", true) // identificador de que es para reset
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 15 * 60 * 1000)) // 15 min
                .signWith(obtenerKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isPasswordResetToken(String token) {
        Claims claims = obtenerTodosLosClaims(token);
        Boolean resetFlag = claims.get("reset", Boolean.class);
        return resetFlag != null && resetFlag;
    }

}
