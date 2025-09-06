package org.springej.backende_commerce.Filter;


import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springej.backende_commerce.Util.JwtUtil;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class JwtFilter implements HandlerInterceptor{

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

        String path = request.getServletPath();

        if (path.equals("/auth") || path.startsWith("/auth/")) {
            return true;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7); // quitar "Bearer "
            if (jwtUtil.validateToken(token)) {
                return true; // token válido, dejar pasar
            }
        }

        // Si no es válido, devolver 401
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.getWriter().write("Token inválido o ausente");
        return false;
    }

}
