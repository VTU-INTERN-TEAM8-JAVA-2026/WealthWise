package com.example.demo.model;

import java.math.BigDecimal;

public class RebalanceResponse {

    private String fund;
    private BigDecimal currentAllocation;
    private BigDecimal targetAllocation;
    private String action;

    public RebalanceResponse(String fund,
                             BigDecimal currentAllocation,
                             BigDecimal targetAllocation,
                             String action) {
        this.fund = fund;
        this.currentAllocation = currentAllocation;
        this.targetAllocation = targetAllocation;
        this.action = action;
    }

    public String getFund() {
        return fund;
    }

    public BigDecimal getCurrentAllocation() {
        return currentAllocation;
    }

    public BigDecimal getTargetAllocation() {
        return targetAllocation;
    }

    public String getAction() {
        return action;
    }
}