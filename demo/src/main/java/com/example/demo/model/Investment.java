package com.example.demo.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
public class Investment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fundName;

    @Positive
    private BigDecimal units;

    private String symbol;
    private double quantity;
    private double price;  // ✅ Added getter/setter below

    private BigDecimal nav;
    private BigDecimal amount;
    private BigDecimal previousNav;
    private LocalDate date;

    // ✅ 1. Default constructor (REQUIRED for JPA/Spring)
    public Investment() {
    }

    // ✅ 2. Parameter constructor (for your controller)
    public Investment(String symbol, double quantity, double price) {
        this.symbol = symbol;
        this.quantity = quantity;
        this.price = price;
    }

    // ✅ 3. MISSING: price getter/setter
    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    // ✅ All other getters/setters (you have most)...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFundName() { return fundName; }
    public void setFundName(String fundName) { this.fundName = fundName; }

    public BigDecimal getUnits() { return units; }
    public void setUnits(BigDecimal units) { this.units = units; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public double getQuantity() { return quantity; }
    public void setQuantity(double quantity) { this.quantity = quantity; }

    public BigDecimal getNav() { return nav; }
    public void setNav(BigDecimal nav) { this.nav = nav; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public BigDecimal getPreviousNav() { return previousNav; }
    public void setPreviousNav(BigDecimal previousNav) { this.previousNav = previousNav; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}