package com.example.demo.controller;

import com.example.demo.model.CashFlow;
import com.example.demo.model.Investment;
import com.example.demo.service.Calculation.ReturnCalculationService;
import com.example.demo.service.Calculation.XirrCalculationService;
import com.example.demo.service.portfolio.PortfolioService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HomeController {

    @Autowired
    private ReturnCalculationService returnService;

    @Autowired
    private XirrCalculationService xirrService;


    @GetMapping("/runAll")
    public Map<String, Object> runAll() {

        Map<String, Object> result = new HashMap<>();

        List<CashFlow> cashFlows = List.of(
                new CashFlow(LocalDate.parse("2020-01-01"), new BigDecimal("-10000")),
                new CashFlow(LocalDate.parse("2021-01-01"), new BigDecimal("12000"))
        );
        result.put("xirr", xirrService.calculateXirr(cashFlows));
        result.put("returns", returnService.calculateReturn());
        return result;
    }

    @GetMapping("/test")
    public String test() {
        return "Backend is working!";
    }
    @PostMapping("/calculateXirr**")
    public BigDecimal calculateXirr(@RequestBody List<CashFlow> cashFlows) {
        return xirrService.calculateXirr(cashFlows);
    }
    @Autowired
    private PortfolioService portfolioService;

    // 👉 Your API method
    @PostMapping("/portfolio/value")
    public BigDecimal getPortfolioValue(@RequestBody List<Investment> investments) {
        return portfolioService.calculatePortfolioValue(investments);
    }
    @PostMapping("/value")
    public BigDecimal getValue(@RequestBody List<Investment> investments) {
        return service.calculatePortfolioValue(investments);
    }
    @Autowired
    private PortfolioService service;



    @PostMapping("/cagr")
    public BigDecimal getCagr(@RequestBody List<Investment> investments) {
        return service.calculatePortfolioCagr(investments);
    }
    @GetMapping("/")
    public Map<String, Object> home() {
        return Map.of(
                "WealthWise", "Backend LIVE!",
                "portfolio", "http://localhost:8080/portfolio",
                "calculations", "http://localhost:8080/calc/all-tests",
                "analyze", "POST http://localhost:8080/calc/analyze"
        );
    }
}