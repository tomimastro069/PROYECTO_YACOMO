package org.springej.backende_commerce.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentService {

    private final PreferenceClient preferenceClient;
    private final PaymentClient paymentClient;

    @Value("${mercadopago.access.token}")
    private String mpAccessToken;

    @Value("${mercadopago.base.url}")
    private String baseUrl;

    public PaymentService() {
        this.preferenceClient = new PreferenceClient();
        this.paymentClient = new PaymentClient();
    }

    @PostConstruct
    public void init() {
        MercadoPagoConfig.setAccessToken(mpAccessToken);
    }

    public String createPreference(String title, BigDecimal totalAmount, String externalRef, String notificationUrl) throws MPException, MPApiException {
        PreferenceItemRequest item = PreferenceItemRequest.builder()
                .title(title)
                .quantity(1)
                .unitPrice(totalAmount)
                .currencyId("ARS")
                .build();

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(baseUrl + "/api/payments/success")
                .failure(baseUrl + "/api/payments/failure")
                .pending(baseUrl + "/api/payments/pending")
                .build();

        PreferenceRequest request = PreferenceRequest.builder()
                .items(List.of(item))
                .externalReference(externalRef)
                .notificationUrl(notificationUrl)
                .backUrls(backUrls)
                .autoReturn("approved")
                .build();

        try {
            Preference preference = preferenceClient.create(request);
            return preference.getInitPoint();
        } catch (MPException | MPApiException e) {
            throw e; // Re-lanzar las excepciones específicas de Mercado Pago
        }
    }

    public Payment getPayment(Long paymentId) throws MPException, MPApiException {
        return paymentClient.get(paymentId);
    }
}