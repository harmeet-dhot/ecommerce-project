package com.shoppingfad.springbootecommerce.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;
import java.util.List;

@Data
@Table(name="country")
@Entity
public class Country {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private int id;
    @Column(name="code")
    private String code;
    @Column(name="name")
    private String name;

    // one to many with states
    @OneToMany(mappedBy = "country")
    @JsonIgnore
    private List<State> states;
}
