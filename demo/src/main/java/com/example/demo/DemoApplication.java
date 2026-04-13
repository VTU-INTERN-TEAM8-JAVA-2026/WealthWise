package com.example.demo;

import com.example.demo.model.Investment;
import com.example.demo.repository.InvestmentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.math.BigDecimal;
import java.time.LocalDate;


@SpringBootApplication

public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }


    @Bean
    CommandLineRunner run(InvestmentRepository repo) {
        return args -> {

            Investment inv1 = new Investment();  // ✅ CREATE OBJECT

            inv1.setFundName("Test Fund");
            inv1.setAmount(new BigDecimal("10000"));

            inv1.setUnits(new BigDecimal("100"));
            inv1.setNav(new BigDecimal("120"));
            inv1.setPreviousNav(new BigDecimal("118")); // for day pnl
            inv1.setDate(LocalDate.of(2020, 1, 1));

            repo.save(inv1);
        };

    }
}