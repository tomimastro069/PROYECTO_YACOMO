package org.springej.backende_commerce.Dto;

import lombok.Data;

@Data
public class RegisterDTO {
    private String nombre;
    private String email;
    private String password;
}