package org.springej.backende_commerce.service;

import lombok.RequiredArgsConstructor;
import org.springej.backende_commerce.entity.Usuario;
import org.springej.backende_commerce.repository.UsuarioRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        //buscar user en la DB por email
        Usuario usuario = usuarioRepository.findWithRolesByEmail(email)
                .orElseThrow(()-> new UsernameNotFoundException("Usuario no encontrado " + email));

        //se convierten roles a GrantedAuthority

        List<SimpleGrantedAuthority> authorities = usuario.getRoles().stream()
                .map(rol -> new SimpleGrantedAuthority("ROLE_" + rol.getNombre().toUpperCase()))
                .toList();

        return new User(
                usuario.getEmail(),
                usuario.getPassword(),
                authorities);
    }
}
