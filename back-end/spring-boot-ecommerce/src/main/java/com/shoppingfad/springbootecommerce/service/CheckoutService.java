package com.shoppingfad.springbootecommerce.service;

import com.shoppingfad.springbootecommerce.dto.Purchase;
import com.shoppingfad.springbootecommerce.dto.PurchaseResponse;

public interface CheckoutService {
    PurchaseResponse placeOrder(Purchase purchase);
}
