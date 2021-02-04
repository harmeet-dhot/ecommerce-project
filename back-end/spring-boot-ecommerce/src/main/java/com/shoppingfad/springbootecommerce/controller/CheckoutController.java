package com.shoppingfad.springbootecommerce.controller;

import com.shoppingfad.springbootecommerce.dto.Purchase;
import com.shoppingfad.springbootecommerce.dto.PurchaseResponse;
import com.shoppingfad.springbootecommerce.service.CheckoutService;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin
@RequestMapping("/api/checkout")
public class CheckoutController {

    private CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }
    @PostMapping("/purchase")
    public PurchaseResponse placeOrder(@RequestBody Purchase purchase){
        return checkoutService.placeOrder(purchase);
    }
}
