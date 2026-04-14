# Module 5: Goal-Based Financial Planning - Specification

## 1. Feature Overview
The Goal-Based Financial Planning module (Module 5) allows users to create, track, and analyze long-term financial objectives. It supports goal creation, categorical tracking, real-time progress calculations, gap analysis, and takes inflation into account for accurate corpus projection. 

## 2. Current System Summary
**Frontend:** Built in Next.js (App Router). UI components for listing, creating, and tracking goals currently exist (`src/app/dashboard/goals/page.tsx`). Calculates progress and monthly needs purely on the client-side using `src/lib/planning.ts`.
**Backend:** No dedicated backend exists.
**Database:** Active Supabase connection (PostgreSQL) is directly accessed by the frontend. The schema uses the `financial_goals` table equipped with Row Level Security (RLS) policies.

## 3. Backend Design (Spring Boot)
We will introduce a Spring Boot application to take over the business logic and data fetching, acting as an intermediary between the Next.js frontend and the Supabase PostgreSQL database.

### Goal Entity (JPA)
Must map exactly to the existing Supabase `financial_goals` schema.

```java
@Entity
@Table(name = "financial_goals")
public class FinancialGoal {
    @Id
    @GeneratedValue
    private UUID id;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId; // Extracted from Supabase Auth token

    @Column(nullable = false)
    private String name;

    @Column(name = "target_amount", nullable = false)
    private BigDecimal targetAmount;

    @Column(name = "invested_amount", nullable = false)
    private BigDecimal investedAmount;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Column(nullable = false)
    private String priority; // 'Essential', 'Important', 'Aspirational'

    @Column(nullable = false)
    private String category;

    @Column(name = "inflation_rate", nullable = false)
    private BigDecimal inflationRate;

    @Column(nullable = false)
    private String status; // 'Active', 'Achieved', 'Archived'

    @Column(name = "expected_return", nullable = false)
    private BigDecimal expectedReturn;

    @Column(name = "monthly_need", nullable = false)
    private BigDecimal monthlyNeed;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
```

### Business Logic (Service Layer)
- **Progress Calculation:** `(invested_amount / target_amount) * 100` (Bounded to 100%).
- **Gap Analysis & Projection:** Moving `calculateMonthlyNeed` from Next.js to Spring Boot. Calculates required monthly investment factoring in the remaining months, `expected_return` (CAGR), and remaining corpus requirement.
- **Inflation Adjustment:** Target amounts can be dynamically recalculated to factor in `inflation_rate` over the timespan: `FutureValue = PresentValue * (1 + inflation_rate)^years`.

### API Contract (Controller Layer)

**Base Path:** `/api/v1/goals`

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| GET | `/` | Get all active goals for user | - | `List<FinancialGoal>` |
| GET | `/{id}` | Get goal by ID | - | `FinancialGoal` |
| POST | `/` | Create a new goal | `GoalCreateDTO` | `FinancialGoal` |
| PUT | `/{id}` | Update existing goal | `GoalUpdateDTO` | `FinancialGoal` |
| PATCH| `/{id}/achieve` | Mark goal as achieved | - | `FinancialGoal` |

*Note: All endpoints require Authorization header containing the user's Supabase JWT.*

## 4. DB Strategy
- **Reuse:** Strictly reuse the existing `financial_goals` table on Supabase.
- **Extensions:** No schema alters are required. Current fields (`target_amount`, `inflation_rate`, `expected_return`) fully cover Module 5 needs.
- **Access:** Spring Boot will connect to PostgreSQL using standard JDBC/Hibernate configuration targeting the Supabase database pooling URL.
