package com.example.demo.service.Calculation;

import com.example.demo.model.CashFlow;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
public class XirrCalculationService {

    private static final int MAX_ITER = 100;
    private static final double TOLERANCE = 1e-7;

    public BigDecimal calculateXirr(List<CashFlow> cashFlows) {

        // ✅ 1. Basic validation
        if (cashFlows == null || cashFlows.size() < 2) {
            return BigDecimal.ZERO;
        }

        // ✅ 2. Sort by date
        cashFlows.sort(Comparator.comparing(CashFlow::getDate));

        // ✅ 3. Check positive & negative cash flow
        boolean hasPositive = cashFlows.stream()
                .anyMatch(cf -> cf.getAmount().compareTo(BigDecimal.ZERO) > 0);

        boolean hasNegative = cashFlows.stream()
                .anyMatch(cf -> cf.getAmount().compareTo(BigDecimal.ZERO) < 0);

        if (!hasPositive || !hasNegative) {
            return BigDecimal.ZERO;
        }

        // ✅ 4. Check unique dates
        long uniqueDates = cashFlows.stream()
                .map(CashFlow::getDate)
                .distinct()
                .count();

        if (uniqueDates == 1) {
            return BigDecimal.ZERO;
        }

        double rate = 0.1; // initial guess (10%)
        double prevRate;

        // ✅ 5. Newton-Raphson Iteration
        for (int i = 0; i < MAX_ITER; i++) {

            double fValue = xnpv(rate, cashFlows);
            double fDerivative = xnpvDerivative(rate, cashFlows);

            // ❌ Avoid division by zero
            if (Math.abs(fDerivative) < 1e-10) {
                break;
            }

            prevRate = rate;
            rate = rate - (fValue / fDerivative);

            // ✅ Convergence check
            if (Math.abs(rate - prevRate) < TOLERANCE) {
                return BigDecimal.valueOf(rate * 100)
                        .setScale(2, RoundingMode.HALF_UP);
            }
        }

        // ❌ fallback if not converged
        return BigDecimal.ZERO;
    }

    // ✅ XNPV Calculation
    private double xnpv(double rate, List<CashFlow> cashFlows) {

        double total = 0.0;
        var startDate = cashFlows.get(0).getDate();

        for (CashFlow cf : cashFlows) {
            double days = ChronoUnit.DAYS.between(startDate, cf.getDate());
            total += cf.getAmount().doubleValue() /
                    Math.pow(1 + rate, days / 365.0);
        }

        return total;
    }

    // ✅ Derivative of XNPV
    private double xnpvDerivative(double rate, List<CashFlow> cashFlows) {

        double total = 0.0;
        var startDate = cashFlows.get(0).getDate();

        for (CashFlow cf : cashFlows) {
            double days = ChronoUnit.DAYS.between(startDate, cf.getDate());
            double fraction = days / 365.0;

            total += -fraction * cf.getAmount().doubleValue() /
                    Math.pow(1 + rate, fraction + 1);
        }

        return total;
    }
}