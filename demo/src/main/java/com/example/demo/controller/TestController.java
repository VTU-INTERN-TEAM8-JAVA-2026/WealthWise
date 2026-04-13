package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test2")
    public String test() {
        return "Backend is working perfectly!";
    }
}