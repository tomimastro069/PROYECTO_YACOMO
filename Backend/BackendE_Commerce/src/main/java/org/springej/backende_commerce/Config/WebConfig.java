package org.springej.backende_commerce.Config;

import org.springej.backende_commerce.Filter.JwtFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration // Marca la clase como de configuración de Spring
public class WebConfig implements WebMvcConfigurer {

    private final JwtFilter jwtFilter;

    // Inyectamos JwtFilter (Spring lo detecta como un componente si tiene @Component)
    public WebConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtFilter)   // Registramos el interceptor
                .addPathPatterns("/**")      // Se aplica a todos los endpoints
                .excludePathPatterns(        // Exceptuamos los públicos
                        "/auth/**",          // login y register
                        "/public/**"         // (opcional) cualquier ruta pública que quieras
                );
    }
}
