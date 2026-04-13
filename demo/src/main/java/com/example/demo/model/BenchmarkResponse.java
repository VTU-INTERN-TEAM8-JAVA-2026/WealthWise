package com.example.demo.model;

import java.math.BigDecimal;

public class BenchmarkResponse {

    private BigDecimal portfolioReturn;
    private BigDecimal benchmarkReturn;
    private BigDecimal difference;

    public BenchmarkResponse(BigDecimal portfolioReturn,
                             BigDecimal benchmarkReturn,
                             BigDecimal difference) {
        this.portfolioReturn = portfolioReturn;
        this.benchmarkReturn = benchmarkReturn;
        this.difference = difference;
    }

    public BigDecimal getPortfolioReturn() {
        return portfolioReturn;
    }

    public BigDecimal getBenchmarkReturn() {
        return benchmarkReturn;
    }

    public BigDecimal getDifference() {
        return difference;
    }
}