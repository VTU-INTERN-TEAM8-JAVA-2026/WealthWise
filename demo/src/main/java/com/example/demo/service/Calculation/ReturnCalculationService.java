package com.example.demo.service.Calculation;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;


@Service
public class ReturnCalculationService{

    public BigDecimal calculateCAGR(
            BigDecimal initialValue,
            BigDecimal finalValue,
            LocalDate startDate,
            LocalDate endDate
    ) {

        if (initialValue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Initial value must be > 0");
        }

        long daysBetween = ChronoUnit.DAYS.between(startDate, endDate);

        if (daysBetween <= 0) return BigDecimal.ZERO;

        BigDecimal years = BigDecimal.valueOf(daysBetween)
                .divide(BigDecimal.valueOf(365), 10, RoundingMode.HALF_UP);

        double ratio = finalValue.divide(initialValue, 10, RoundingMode.HALF_UP).doubleValue();

        double cagr = Math.pow(ratio, (1.0 / years.doubleValue())) - 1;

        return BigDecimal.valueOf(cagr)
                .multiply(BigDecimal.valueOf(100))
                .setScale(4, RoundingMode.HALF_UP);
    }
}