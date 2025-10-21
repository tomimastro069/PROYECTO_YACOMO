package org.springej.backende_commerce.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.preference.*;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PaymentService {

    @Value("${mercadopago.access.token}")
    private String mpAccessToken;

    @Value("${mercadopago.base.url}")
    private String baseUrl;

    public String createPreference(String title, BigDecimal unitPrice, int quantity,
                                   String externalRef, String notificationUrl) throws MPException, MPApiException {

        MercadoPagoConfig.setAccessToken(mpAccessToken);

        PreferenceClient client = new PreferenceClient();

        PreferenceItemRequest item = PreferenceItemRequest.builder()
                .title(title)
                .quantity(quantity)
                .unitPrice(unitPrice)
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
            Preference preference = client.create(request);
            return preference.getInitPoint();
        } catch (MPApiException e) {
            throw e;
        }
    }
}