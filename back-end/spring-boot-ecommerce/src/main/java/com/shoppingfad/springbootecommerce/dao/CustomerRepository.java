package com.shoppingfad.springbootecommerce.dao;

import com.shoppingfad.springbootecommerce.entities.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<Customer,Long> {
    Customer findByEmail(String theEmail);
}
