package org.example.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "imagen", schema = "base_datos_yacomo")
public class Imagen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_imagen") // Nombre real en la DB
    private Integer idImagen;

    @Column(name = "url", length = 500)
    private String url;

    @Column(name = "public_id", length = 255)
    private String publicId;

    @Column(name = "fecha_foto")
    private LocalDateTime fechaFoto;

    // Relación ManyToOne hacia Producto
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "idProducto", nullable = false) // FK en tabla imagen
    private Producto producto;

    // Getters y setters
    public Integer getIdImagen() {
        return idImagen;
    }

    public void setIdImagen(Integer idImagen) {
        this.idImagen = idImagen;
    }

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getPublicId() {
        return publicId;
    }

    public void setPublicId(String publicId) {
        this.publicId = publicId;
    }

    public LocalDateTime getFechaFoto() {
        return fechaFoto;
    }

    public void setFechaFoto(LocalDateTime fechaFoto) {
        this.fechaFoto = fechaFoto;
    }

    public Producto getProducto() {
        return producto;
    }

    public void setProducto(Producto producto) {
        this.producto = producto;
    }
}