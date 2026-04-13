package com.example.demo.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CashFlow {

    private LocalDate date;
    private BigDecimal amount;

    public CashFlow(LocalDate date, BigDecimal amount) {
        this.date = date;
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public BigDecimal getAmount() {
        return amount;
    }

}