// Producto.java
package org.example.Entity;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "producto", schema = "base_datos_yacomo")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "idProducto") // Mantener el nombre real de la DB
    private Integer idProducto;

    @Column(name = "nombre_producto", length = 255)
    private String nombreProducto;

    @Column(name = "descripcion_producto", length = 255)
    private String descripcionProducto;

    @Column(name = "precio_unitario_producto")
    private Float precioUnitarioProducto;

    // Cambio a OneToMany porque tu tabla imagen tiene FK directa
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Imagen> imagenes = new ArrayList<>();

    // Getters y setters
    public Integer getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(Integer idProducto) {
        this.idProducto = idProducto;
    }

    public String getNombreProducto() {
        return nombreProducto;
    }

    public void setNombreProducto(String nombreProducto) {
        this.nombreProducto = nombreProducto;
    }

    public String getDescripcionProducto() {
        return descripcionProducto;
    }

    public void setDescripcionProducto(String descripcionProducto) {
        this.descripcionProducto = descripcionProducto;
    }

    public Float getPrecioUnitarioProducto() {
        return precioUnitarioProducto;
    }

    public void setPrecioUnitarioProducto(Float precioUnitarioProducto) {
        this.precioUnitarioProducto = precioUnitarioProducto;
    }

    public List<Imagen> getImagenes() {
        return imagenes;
    }

    public void setImagenes(List<Imagen> imagenes) {
        this.imagenes = imagenes;
    }

    // Metodo helper para agregar imagen
    public void addImagen(Imagen imagen) {
        imagenes.add(imagen);
        imagen.setProducto(this);
    }

    // Metodo helper para remover imagen
    public void removeImagen(Imagen imagen) {
        imagenes.remove(imagen);
        imagen.setProducto(null);
    }
}