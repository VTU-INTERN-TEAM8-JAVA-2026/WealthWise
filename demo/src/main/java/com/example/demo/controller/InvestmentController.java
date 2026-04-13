package com.example.demo.controller;

import com.example.demo.model.Investment;
import org.antlr.v4.runtime.misc.LogManager;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:3000")



public class InvestmentController {

    private List<Map<String, Object>> investments = new ArrayList<>();

    @GetMapping("/investments")
    public List<Map<String, Object>> getAll() {
        return investments;
    }


    @PostMapping("/investments")
    public void add(@RequestBody Map<String, Object> investment) {
        investments.add(investment);
    }


}