package com.shoppingfad.springbootecommerce.dto;

import com.shoppingfad.springbootecommerce.entities.Address;
import com.shoppingfad.springbootecommerce.entities.Customer;
import com.shoppingfad.springbootecommerce.entities.Order;
import com.shoppingfad.springbootecommerce.entities.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {
    
    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    private Set<OrderItem> orderItems;
    
}
