package org.springej.backende_commerce.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor    
@ToString
public class ImagenDTO {
    private Integer id;
    private String url;
    private String publicId;
}