package com.example.demo.service;

import com.example.demo.model.Investment;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class InvestmentService {
    public BigDecimal calculatePortfolioValue(List<Investment> investments) {
        BigDecimal total = BigDecimal.ZERO;
        for (Investment inv : investments) {
            total = total.add(BigDecimal.valueOf(inv.getQuantity() * inv.getPrice()));
        }
        return total;  // ✅ Should be 1505.0
    }
}
