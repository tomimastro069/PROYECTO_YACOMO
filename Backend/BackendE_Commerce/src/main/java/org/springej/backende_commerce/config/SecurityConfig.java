package org.springej.backende_commerce.config;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springej.backende_commerce.security.AuthEntryPoint;
import org.springej.backende_commerce.security.JwtFilter;
import org.springej.backende_commerce.service.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Data
@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final AuthEntryPoint authEntryPoint;
    private final JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{//sirve para definir que rutas seran públicas y privadas

        http.csrf(csrf -> csrf.disable());  //desactiva csrf porque se va a usar JWT

        // Habilita CORS usando la configuración global definida en WebConfig
        // Esto es CRUCIAL para que Spring Security no bloquee las peticiones de pre-vuelo (OPTIONS)
        http.cors(Customizer.withDefaults());

        http.authorizeHttpRequests( auth -> auth
                // Rutas públicas para autenticación, documentación de API y visualización de productos
                .requestMatchers("/api/auth/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/productos", "/api/productos/**").permitAll()
                .requestMatchers("/api/chat", "/api/price").permitAll()

                // Rutas públicas para el flujo de pago de Mercado Pago
                .requestMatchers("/api/payments/webhook", "/api/payments/success", "/api/payments/failure", "/api/payments/pending").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/payments/create-order").authenticated() // Crear orden requiere autenticación

                // Rutas para usuarios autenticados (USER o ADMIN)
                // Reglas específicas para Ventas
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/ventas").authenticated() // Usuarios pueden crear ventas
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/ventas/mis-compras").authenticated() // Usuarios pueden ver sus compras
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/ventas", "/api/ventas/usuario/**").hasRole("ADMIN") // Admins ven todo

                .requestMatchers("/api/favoritos/**").authenticated()
                .requestMatchers("/api/estrellas/**").authenticated()

                // Rutas exclusivas para ADMIN (gestión de productos e imágenes)
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/productos").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/productos/**").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/productos/**").hasRole("ADMIN")
                .requestMatchers("/api/producto-imagenes/**").hasRole("ADMIN")

                // Usuarios (perfil y domicilios) autenticados; CRUD de usuarios solo ADMIN
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/usuarios/me").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/usuarios/domicilios").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/usuarios/domicilios/**").authenticated()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/usuarios", "/api/usuarios/**").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/usuarios").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/usuarios/**").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/usuarios/**").hasRole("ADMIN")

                // Todas las demás rutas requieren autenticación
                .anyRequest().authenticated()
        );

        http.exceptionHandling(ex -> ex.authenticationEntryPoint(authEntryPoint));
        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class); //antes de que se ejecute el filtro por defecto va JwtFilter
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsServiceImpl userDetailsService,
                                                         PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder);
        return authProvider;
    }

}
