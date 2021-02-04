package com.shoppingfad.springbootecommerce.entities;

import lombok.Data;

import javax.persistence.*;

@Data
@Table(name="state")
@Entity
public class State {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private int id;
    @Column(name="name")
    private String name;
    @ManyToOne
    @JoinColumn(name="country_id")
    private Country country;
}
