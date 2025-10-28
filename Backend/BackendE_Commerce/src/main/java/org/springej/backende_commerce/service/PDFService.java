package org.springej.backende_commerce.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springej.backende_commerce.entity.ProductoVenta;
import org.springej.backende_commerce.entity.RegistroPago;
import org.springej.backende_commerce.entity.Venta;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Service
public class PDFService {

    public static byte[] generarPdf(Venta venta) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 50, 50, 70, 50);

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // --- Encabezado ---
            Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(40, 40, 40));
            Font subtitleFont = new Font(Font.HELVETICA, 12, Font.NORMAL, new Color(80, 80, 80));

            Paragraph titulo = new Paragraph("Comprobante de Compra", titleFont);
            titulo.setAlignment(Element.ALIGN_CENTER);
            titulo.setSpacingAfter(15f);
            document.add(titulo);

            String fecha = "-";
            try {
                if (venta.getFechaVenta() != null) {
                    // Como es LocalDate, no tiene hora — usamos solo día, mes y año
                    DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                    fecha = venta.getFechaVenta().format(fmt);
                }
            } catch (Exception ex) {
                // fallback por si ocurre algún error inesperado
                fecha = venta.getFechaVenta().toString();
            }


            document.add(new Paragraph("Venta Nº: " + venta.getId(), subtitleFont));
            document.add(new Paragraph("Fecha: " + fecha, subtitleFont));
            if (venta.getUsuario() != null) {
                document.add(new Paragraph("Cliente: " +
                        venta.getUsuario().getNombre() + " " + venta.getUsuario().getApellido(), subtitleFont));
                document.add(new Paragraph("Email: " + venta.getUsuario().getEmail(), subtitleFont));
            }
            document.add(Chunk.NEWLINE);

            // --- Tabla de productos ---
            PdfPTable table = new PdfPTable(new float[]{4, 1, 2, 2});
            table.setWidthPercentage(100);
            table.setSpacingBefore(10f);
            table.setSpacingAfter(10f);

            Font headerFont = new Font(Font.HELVETICA, 12, Font.BOLD, Color.WHITE);
            Font cellFont = new Font(Font.HELVETICA, 11, Font.NORMAL, new Color(50, 50, 50));

            PdfPCell header1 = new PdfPCell(new Phrase("Producto", headerFont));
            PdfPCell header2 = new PdfPCell(new Phrase("Cant.", headerFont));
            PdfPCell header3 = new PdfPCell(new Phrase("Precio Unit.", headerFont));
            PdfPCell header4 = new PdfPCell(new Phrase("Subtotal", headerFont));

            Color azul = new Color(44, 62, 80);
            for (PdfPCell c : new PdfPCell[]{header1, header2, header3, header4}) {
                c.setBackgroundColor(azul);
                c.setHorizontalAlignment(Element.ALIGN_CENTER);
                c.setPadding(8f);
                table.addCell(c);
            }

            BigDecimal total = BigDecimal.ZERO;
            for (ProductoVenta pv : venta.getProductos()) {
                String nombre = pv.getProducto() != null ? pv.getProducto().getNombre() : "Producto";
                int cantidad = pv.getCantidad();
                BigDecimal unitario = pv.getPrecioUnitario() != null ? pv.getPrecioUnitario() : BigDecimal.ZERO;
                BigDecimal subtotal = unitario.multiply(BigDecimal.valueOf(cantidad));
                total = total.add(subtotal);

                table.addCell(new Phrase(nombre, cellFont));
                table.addCell(new Phrase(String.valueOf(cantidad), cellFont));
                table.addCell(new Phrase(String.format("$%.2f", unitario), cellFont));
                table.addCell(new Phrase(String.format("$%.2f", subtotal), cellFont));
            }

            document.add(table);

            // --- Resumen de totales ---
            Font totalFont = new Font(Font.HELVETICA, 13, Font.BOLD, new Color(33, 47, 60));
            Paragraph totalPar = new Paragraph("Total: $" + total.setScale(2, BigDecimal.ROUND_HALF_UP), totalFont);
            totalPar.setAlignment(Element.ALIGN_RIGHT);
            totalPar.setSpacingBefore(10f);
            document.add(totalPar);

            // --- Datos de pago ---
            if (venta.getRegistroPago() != null) {
                RegistroPago pago = venta.getRegistroPago();
                document.add(Chunk.NEWLINE);
                document.add(new Paragraph("Método de pago: " + pago.getPaymentMethod(), subtitleFont));
                document.add(new Paragraph("Estado del pago: " + pago.getStatus(), subtitleFont));
                document.add(new Paragraph("ID Mercado Pago: " + pago.getMpPaymentId(), subtitleFont));
            }

            // --- Pie de página ---
            document.add(Chunk.NEWLINE);
            Paragraph gracias = new Paragraph("Gracias por tu compra. ¡Esperamos verte pronto!", subtitleFont);
            gracias.setAlignment(Element.ALIGN_CENTER);
            gracias.setSpacingBefore(30f);
            document.add(gracias);

            document.close();
        } catch (Exception e) {
            e.printStackTrace();
            return new byte[0];
        }

        return out.toByteArray();
    }
}
