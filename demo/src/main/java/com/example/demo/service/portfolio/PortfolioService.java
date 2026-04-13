package com.example.demo.service.portfolio;
import java.math.RoundingMode;
import com.example.demo.model.Investment;
import com.example.demo.model.PortfolioSummary;
import com.example.demo.repository.InvestmentRepository;
import org.springframework.stereotype.Service;
import java.math.RoundingMode;
import java.math.BigDecimal;
import java.math.MathContext;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class PortfolioService {

    private final InvestmentRepository repo;

    public PortfolioService(InvestmentRepository repo) {
        this.repo = repo;
    }

    // ✅ 4.1 Portfolio Value
    public BigDecimal calculatePortfolioValue() {
        List<Investment> investments = repo.findAll();

        BigDecimal total = BigDecimal.ZERO;

        for (Investment inv : investments) {
            if (inv.getUnits() != null && inv.getNav() != null) {
                total = total.add(inv.getUnits().multiply(inv.getNav()));
            }
        }

        return total;
    }

    // ✅ Total Invested
    public BigDecimal calculateTotalInvested() {
        List<Investment> investments = repo.findAll();

        BigDecimal total = BigDecimal.ZERO;

        for (Investment inv : investments) {
            if (inv.getAmount() != null) {
                total = total.add(inv.getAmount());
            }
        }

        return total;
    }

    // ✅ 4.2 Profit/Loss
    public BigDecimal calculateProfitLoss() {
        BigDecimal current = calculatePortfolioValue();
        BigDecimal invested = calculateTotalInvested();
        return current.subtract(invested);
    }

    // ✅ 4.3 Absolute Return




    public BigDecimal calculateAbsoluteReturn() {
        BigDecimal current = calculatePortfolioValue();
        BigDecimal invested = calculateTotalInvested();

        if (invested.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return current.subtract(invested)
                .divide(invested, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    // ✅ 4.4 CAGR (SAFE VERSION)
    public BigDecimal calculatePortfolioCagr() {
        List<Investment> investments = repo.findAll();

        if (investments.isEmpty()) return BigDecimal.ZERO;

        BigDecimal invested = calculateTotalInvested();
        BigDecimal current = calculatePortfolioValue();

        if (invested.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        // find earliest date safely
        LocalDate startDate = null;

        for (Investment inv : investments) {
            if (inv.getDate() != null) {
                if (startDate == null || inv.getDate().isBefore(startDate)) {
                    startDate = inv.getDate();
                }
            }
        }

        if (startDate == null) return BigDecimal.ZERO;

        long days = ChronoUnit.DAYS.between(startDate, LocalDate.now());
        double years = days / 365.0;

        if (years <= 0) return BigDecimal.ZERO;

        double ratio = current.divide(invested, MathContext.DECIMAL64).doubleValue();

        double cagr = Math.pow(ratio, (1 / years)) - 1;

        return BigDecimal.valueOf(cagr * 100);
    }

    // ✅ 4.5 XIRR (temporary safe fallback)
    public BigDecimal calculatePortfolioXirr() {
        return calculatePortfolioCagr(); // placeholder
    }

    // ✅ 4.6 Day P&L
    public BigDecimal calculateDayPnL() {
        return BigDecimal.ZERO; // will implement later
    }

    // ✅ 4.7 Allocation
    public java.util.Map<String, BigDecimal> getFundAllocation() {
        List<Investment> investments = repo.findAll();
        java.util.Map<String, BigDecimal> map = new java.util.HashMap<>();

        BigDecimal total = calculatePortfolioValue();

        if (total.compareTo(BigDecimal.ZERO) == 0) {
            return map;
        }

        for (Investment inv : investments) {
            if (inv.getUnits() != null && inv.getNav() != null) {

                BigDecimal value = inv.getUnits().multiply(inv.getNav());

                BigDecimal percent = value
                        .divide(total, MathContext.DECIMAL64)
                        .multiply(BigDecimal.valueOf(100));

                map.put(inv.getFundName(), percent);
            }
        }

        return map;
    }



        public static PortfolioSummary calculateSummary(double invested, double current) {
            double profit = current - invested;
            double profitPercent = (profit / invested) * 100;

            PortfolioSummary summary = new PortfolioSummary();
            summary.setInvested(invested);
            summary.setCurrent(current);
            summary.setProfit(profit);
            summary.setProfitPercent(profitPercent);

            return summary;
        }
    }


