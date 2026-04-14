# Module 5 Execution Tasks

## 1. Backend Setup (Spring Boot)
- [ ] **Initialize App:** Generate Spring Boot project (Web, Data JPA, PostgreSQL, Security components).
- [ ] **Configure DB:** Update `application.yml` with the existing Supabase PostgreSQL connection string.
- [ ] **Auth Strategy:** Implement Supabase JWT validation filter in Spring Security to authenticate and extract `user_id`.
*Priority: HIGH* | *Location: new `backend` root directory*

## 2. Goal Backend Implementation
- [ ] **Goal Entity:** Create `FinancialGoal` JPA Entity matching the existing `financial_goals` table schema exactly.
- [ ] **Repository Layer:** Create `FinancialGoalRepository` interface extending `JpaRepository`.
*Priority: HIGH* | *Location: `backend/src/main/java/com/wealthwise/module5/...`*

## 3. Business Logic Implementation
- [ ] **Goal Logic Setup:** Create `GoalService` to handle core logic (create, update, fetch goals).
- [ ] **Port Metric Setup:** Port the `calculateMonthlyNeed` and `getGoalProgress` logic from `planning.ts` to `GoalService`.
- [ ] **Inflation Logic:** Implement inflation adjustment computation logic in `GoalService` to recalculate target amounts based on `inflation_rate`.
*Priority: HIGH* | *Location: `backend/.../service/GoalService.java`*

## 4. API Layer
- [ ] **API Controller:** Create `GoalController` with endpoints: GET `/`, GET `/{id}`, POST `/`, PUT `/{id}`, PATCH `/{id}/achieve`.
- [ ] **DTO Mapping:** Create `GoalCreateRequestDTO` and `GoalResponseDTO`. Ensure data types match frontend UI requirements.
*Priority: HIGH* | *Location: `backend/.../controller/GoalController.java`*

## 5. Frontend Integration
- [ ] **Fetch Logic Migration:** Update `src/app/dashboard/goals/page.tsx` loader to fetch data from the Spring Boot API (`fetch` or `axios`) instead of `supabase.from("financial_goals")`.
- [ ] **Creation Migration:** Update `src/app/dashboard/goals/new/page.tsx` submission payload to POST to the Spring API endpoint.
- [ ] **Status Migration:** Update `markAchieved` function to call the `PATCH /{id}/achieve` API rather than updating Supabase directly.
*Priority: HIGH* | *Location: `src/app/dashboard/goals/...`*

## 6. Final Enhancements
- [ ] **Code Cleanup:** Refactor and remove deprecated goal logic from `src/lib/planning.ts` to maintain a single source of truth in the backend.
- [ ] **E2E Testing:** Verify the complete flow (Goal creation -> Java backend -> Supabase DB -> UI update).
*Priority: MEDIUM*
