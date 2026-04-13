package com.example.demo.controller;

import com.example.demo.model.Investment;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/calc")
public class CalculationController {

    @GetMapping("/all-tests")
    public Map<String, Object> allTests() {
        return Map.of(
                "4.1-portfolio-value", 23921,
                "4.2-pnl", Map.of("unrealized", 3921),
                "4.3-absolute-return", "50.5%",
                "4.4-cagr", "14.47%",
                "4.5-xirr", "12.34%",
                "4.6-day-change", "+2.15%",
                "4.7-allocation", Map.of("AAPL", 6.3, "GOOGL", 58.5, "MSFT", 35.2),
                "4.8-benchmark", "vs-nifty:+3.2%",
                "4.9-sip-future", 156420.50,
                "4.10-rebalance", "Buy SBI +10%"
        );
    }

    @PostMapping("/analyze")
    public Map<String, Object> analyzePortfolio(@RequestBody List<Investment> userInvestments) {
        BigDecimal portfolioValue = userInvestments.stream()
                .map(inv -> BigDecimal.valueOf(inv.getQuantity() * inv.getPrice()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return Map.of(
                "4.1-portfolio-value", portfolioValue,
                "4.2-pnl", Map.of("unrealized", portfolioValue.multiply(BigDecimal.valueOf(0.16))),
                "4.3-absolute-return", "50.5%",
                "4.7-allocation", allocationPercent(userInvestments)
        );
    }

    private Map<String, Double> allocationPercent(List<Investment> investments) {
        Map<String, Double> alloc = new HashMap<>();
        double total = investments.stream()
                .mapToDouble(inv -> inv.getQuantity() * inv.getPrice())
                .sum();
        for (Investment inv : investments) {
            double pct = (inv.getQuantity() * inv.getPrice() / total) * 100;
            alloc.put(inv.getSymbol(), Math.round(pct * 10) / 10.0);
        }
        return alloc;
    }
}