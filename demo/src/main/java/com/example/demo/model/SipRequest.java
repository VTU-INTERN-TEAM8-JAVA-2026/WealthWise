package com.example.demo.model;

import java.math.BigDecimal;

public class SipRequest {

    private BigDecimal monthlyInvestment;
    private BigDecimal annualReturn;
    private int years;

    public BigDecimal getMonthlyInvestment() {
        return monthlyInvestment;
    }

    public void setMonthlyInvestment(BigDecimal monthlyInvestment) {
        this.monthlyInvestment = monthlyInvestment;
    }

    public BigDecimal getAnnualReturn() {
        return annualReturn;
    }

    public void setAnnualReturn(BigDecimal annualReturn) {
        this.annualReturn = annualReturn;
    }

    public int getYears() {
        return years;
    }

    public void setYears(int years) {
        this.years = years;
    }
}