package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Data
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fundName;

    private BigDecimal units;

    private BigDecimal nav; // latest NAV

    private BigDecimal investedAmount;
}