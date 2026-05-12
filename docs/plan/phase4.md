# Phase 4 Engineering Plan
## Track Fast Error With AI — Dashboard, Filters, Export & Privacy Audit

**Phase:** 4 of 5
**Timeline:** Week 7 (5 working days)
**Owner:** Engineering Lead
**Status:** Planning
**PRD Reference:** §5.1 In Scope (v1.0), FR-06, FR-07, §12 Success Metrics

---

## 1. Phase 4 Goal

Transform the raw error list into a professional, actionable dashboard. This phase focuses on data visualization, advanced filtering, and reporting capabilities. It also includes a formal privacy audit to ensure the "Codebase Never Leaves Browser" promise is technically enforced.

**Deliverables at end of Phase 4:**
- ✅ Summary Analytics Cards (Total Errors, Critical Count, Most Frequent)
- ✅ Advanced Filter Sidebar (Severity, Language, Date Range, File)
- ✅ Error Frequency Trend Chart (using Recharts)
- ✅ PDF Report Generation (Summary of errors + AI fixes)
- ✅ CSV Export for error raw data
- ✅ Privacy Audit Report & Enforced Content Security Policy (CSP)

---

## 2. Tech Stack Decisions

| Layer | Decision | Rationale |
|---|---|---|
| **Charts** | Recharts | Declarative, React-native chart library, easy to theme |
| **PDF Export** | `@react-pdf/renderer` | Generate PDFs on the client-side for privacy |
| **CSV Export** | `react-csv` | Simple CSV generation from state objects |
| **Icons** | Lucide React | Clean, consistent iconography for the dashboard |
| **Data Grid** | TanStack Table v8 | Powerful, headless table for sorting and filtering |

---

## 3. Project Folder Structure Updates

```
track-errors/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCards.jsx       ← High-level summary chips
│   │   │   │   ├── ErrorTrendChart.jsx  ← Visual frequency chart
│   │   │   │   └── FilterSidebar.jsx    ← Multi-select filters
│   │   │   ├── export/
│   │   │   │   ├── PDFReport.jsx        ← PDF template component
│   │   │   │   └── ExportActions.jsx    ← Download buttons
│   │   ├── utils/
│   │   │   └── reportGenerator.js       ← Data transformation for exports
```

---

## 4. Privacy & Security Audit

Since the core value proposition is **Privacy**, Phase 4 includes:
1. **CSP Header Configuration:** Restrict network calls to only the backend API and the selected AI providers.
2. **Local Data Validation:** Verify that `FileSystemHandle` and code snippets never touch the `POST /api/logs/upload` request body.
3. **Session Purge:** Implement "Clear Session" which nukes Zustand stores and IndexedDB handles.

---

## 5. Day-by-Day Task Breakdown

| Day | Tasks |
|---|---|
| **Day 31** | Dashboard: Build `StatsCards` and integrate `TanStack Table` for the main error grid with sorting. |
| **Day 32** | Filters: Implement `FilterSidebar` with multi-select for Severity, Language, and a Date Range picker. |
| **Day 33** | Visualization: Build `ErrorTrendChart` using Recharts to show error spikes over time. |
| **Day 34** | Export: Implement PDF (client-side) and CSV export functionality using current filter state. |
| **Day 35** | Privacy Audit: Finalize CSP; implement "Clear Session" logic; run security scan on dependencies. |

---

## 6. Acceptance Criteria — Phase 4 Complete

| # | Criterion | How Verified |
|---|---|---|
| AC-28 | Dashboard shows accurate counts for Critical/High/Medium/Low errors | Compare with raw log counts |
| AC-29 | Filtering by "PHP" hides all Node.js and Python errors immediately | Manual UI test |
| AC-30 | User can export a PDF containing at least 5 errors and their AI fixes | Open generated PDF |
| AC-31 | "Clear Session" removes all data from UI and local storage | Check DevTools Application tab |
| AC-32 | Chart correctly displays time-based frequency of errors | Test with log having varying timestamps |

---

## 7. Definition of Done — Phase 4

- [ ] All 5 acceptance criteria pass.
- [ ] Exported PDF is branded and formatted correctly.
- [ ] No console errors when switching complex filters.
- [ ] Privacy audit document signed off.
- [ ] Code reviewed and merged to `main`.
- [ ] Demo-ready: Filter for critical errors, view chart, and download the PDF report.

---

*Document Owner: Engineering Lead | Phase: 4 | Stack: React + Recharts + React-PDF | Next Review: End of Day 35*
