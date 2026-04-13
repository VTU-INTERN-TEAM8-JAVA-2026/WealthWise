package com.example.demo.model;

public class PortfolioSummary {
    private double invested;
    private double current;
    private double profit;
    private double profitPercent;

    // getters and setters
    public double getInvested() { return invested; }
    public void setInvested(double invested) { this.invested = invested; }

    public double getCurrent() { return current; }
    public void setCurrent(double current) { this.current = current; }

    public double getProfit() { return profit; }
    public void setProfit(double profit) { this.profit = profit; }

    public double getProfitPercent() { return profitPercent; }
    public void setProfitPercent(double profitPercent) { this.profitPercent = profitPercent; }
}
