package com.shoppingfad.springbootecommerce.service;

import com.shoppingfad.springbootecommerce.dao.CustomerRepository;
import com.shoppingfad.springbootecommerce.dto.Purchase;
import com.shoppingfad.springbootecommerce.dto.PurchaseResponse;
import com.shoppingfad.springbootecommerce.entities.Customer;
import com.shoppingfad.springbootecommerce.entities.Order;
import com.shoppingfad.springbootecommerce.entities.OrderItem;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.Set;
import java.util.UUID;

@Service
public class CheckoutServiceImpl implements CheckoutService {
    private CustomerRepository customerRepository;

    public CheckoutServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {
        // retriwve the order info from dto
        Order order=purchase.getOrder();
        //generate tracking number
        String orderTrackingNumber=generateTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);
        //populate order with orderItems
        Set<OrderItem> orderItems=purchase.getOrderItems();
        orderItems.forEach(item -> order.add(item));
        //populate order with billing address and shipping address
        order.setShippingAddress(purchase.getShippingAddress());
        order.setBillingAddress(purchase.getBillingAddress());
        //populate customer with order
        Customer customer=purchase.getCustomer();
        String theEmail=customer.getEmail();
        Customer customerfromDB=customerRepository.findByEmail(theEmail);
        if(customerfromDB!=null){
            customer=customerfromDB;
        }
        customer.add(order);
        // save to database
         customerRepository.save(customer);
        //return response

        return new PurchaseResponse(orderTrackingNumber);
    }

    private String generateTrackingNumber() {
        //generate unique UUID
        return UUID.randomUUID().toString();
    }
}
