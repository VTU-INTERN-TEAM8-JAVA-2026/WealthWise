package com.example.demo.controller;
import java.util.stream.Collectors;
import com.example.demo.model.Investment;
import com.example.demo.service.InvestmentService;
import com.example.demo.service.portfolio.PortfolioService;
import org.antlr.v4.runtime.misc.LogManager;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;


@RestController
@CrossOrigin(origins = "http://localhost:3000")



public class InvestmentController {

    private final InvestmentService investmentService;

    public InvestmentController(InvestmentService investmentService) {
        this.investmentService = investmentService;
    }

    @GetMapping("/portfolio")
    public BigDecimal getPortfolioValue() {
        List<Investment> investmentList = investments.stream()
                .map(map -> {
                    Investment inv = new Investment(
                            (String) map.get("symbol"),
                            ((Number) map.get("quantity")).doubleValue(),
                            ((Number) map.get("price")).doubleValue()
                    );
                    System.out.println("Created: " + inv.getSymbol() + " qty=" + inv.getQuantity() + " price=" + inv.getPrice());
                    return inv;
                })
                .collect(Collectors.toList());

        BigDecimal result = investmentService.calculatePortfolioValue(investmentList);
        System.out.println("FINAL RESULT: " + result);
        return result;
    }
    private List<Map<String, Object>> investments = new ArrayList<>();

    @GetMapping("/investments")
    public List<Map<String, Object>> getAll() {
        return investments;
    }


    @PostMapping("/investments")
    public void add(@RequestBody List<Map<String, Object>> investments) {  // ✅ List!
        this.investments.addAll(investments);  // Add all at once
        System.out.println("Added " + investments.size() + " investments");
    }

    @PostMapping("/portfolio/value")
    public BigDecimal getPortfolioValue(@RequestBody List<Investment> investments) {
        return PortfolioService.calculatePortfolioValue(investments);
    }
    @GetMapping("/debug")
    public String debug() {
        return "Investments count: " + investments.size();
    }
    // Add to controller (temporary)
    @DeleteMapping("/investments/clear")
    public void clear() {
        investments.clear();  // Reset list
    }

}