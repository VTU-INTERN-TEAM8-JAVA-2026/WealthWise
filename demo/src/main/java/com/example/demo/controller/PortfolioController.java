package com.example.demo.controller;
import com.example.demo.model.Investment;
import com.example.demo.model.*;
import com.example.demo.repository.InvestmentRepository;
import com.example.demo.service.portfolio.PortfolioService;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.PortfolioRequest;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/portfolio")
@CrossOrigin(origins = "http://localhost:3000")

public class PortfolioController {

    private final PortfolioService service;
    private final InvestmentRepository repo;   // ✅ ADD THIS

    public PortfolioController(PortfolioService service, InvestmentRepository repo) {
        this.service = service;
        this.repo = repo;
    }

    @GetMapping("/value")
    public BigDecimal getValue() {
        return service.calculatePortfolioValue();
    }

    @GetMapping("/invested")
    public BigDecimal getInvested() {
        return service.calculateTotalInvested();
    }

    @GetMapping("/cagr")
    public BigDecimal getCagr() {
        return service.calculatePortfolioCagr();
    }

    @GetMapping("/xirr")
    public BigDecimal getXirr() {
        return service.calculatePortfolioXirr();
    }

    @GetMapping("/day-pnl")
    public BigDecimal getDayPnL() {
        return service.calculateDayPnL();
    }

    @GetMapping("/allocation")
    public Map<String, BigDecimal> getAllocation() {
        return service.getFundAllocation();
    }

//    @GetMapping("/benchmark")
//    public BenchmarkResponse getBenchmarkComparison() {
//        return service.compareWithBenchmark();
//    }
//
//    @PostMapping("/sip/future-value")
//    public BigDecimal calculateSip(@RequestBody SipRequest request) {
//        return service.calculateSipFutureValue(request);
//    }
//
//    @GetMapping("/rebalance")
//    public List<RebalanceResponse> getRebalance() {
//        return service.getRebalancingSuggestion();
//    }

    // ✅ ADD USER INPUT API HERE (INSIDE CLASS)
    @PostMapping("/add")
    public Investment addInvestment(@RequestBody Investment inv) {
        return repo.save(inv);
    }
    @GetMapping("/pnl")
    public BigDecimal getPnL() {
        return service.calculateProfitLoss();
    }

    @GetMapping("/returns")
    public BigDecimal getAbsoluteReturn() {
        return service.calculateAbsoluteReturn();
    }
    @GetMapping("/all")
    public List<Investment> getAll() {
        return repo.findAll();
    }


        @GetMapping("/summary")
        public Map<String, Double> getSummary() {

            double invested = 5000;
            double current = 6500;

            double profit = current - invested;
            double profitPercent = (profit / invested) * 100;

            Map<String, Double> result = new HashMap<>();
            result.put("invested", invested);
            result.put("current", current);
            result.put("profit", profit);
            result.put("profitPercent", profitPercent);

            return result;
        }

        @PostMapping("/summary")
        public PortfolioSummary getSummary(@RequestBody PortfolioRequest request) {
            double invested = request.getInvested();
            double current = request.getCurrent();
            double profit = current - invested;
            double profitPercent = (profit / invested) * 100;

            PortfolioSummary summary = new PortfolioSummary();
            summary.setInvested(invested);
            summary.setCurrent(current);
            summary.setProfit(profit);
            summary.setProfitPercent(profitPercent);

            // Optionally also call service for consistency
            PortfolioSummary calculated = PortfolioService.calculateSummary(invested, current);

            // You can choose which one to return:
            // return summary;   // manual calculation
            return calculated;   // service-based calculation
        }
   }


