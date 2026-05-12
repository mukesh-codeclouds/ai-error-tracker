# Phase 3 Engineering Plan
## Track Fast Error With AI — AI Mapping + Fix Suggestions UI

**Phase:** 3 of 5
**Timeline:** Week 5–6 (10 working days)
**Owner:** Engineering Lead
**Status:** Planning
**PRD Reference:** §5.1 In Scope (v1.0), FR-04, FR-05, FR-08, §10 Technical Architecture

---

## 1. Phase 3 Goal

Integrate AI capabilities to bridge the gap between parsed log errors and the local codebase. This phase involves sending error context to an LLM, receiving mapping confirmations, and generating actionable fix suggestions. It also includes the UI for model selection and API key management.

**Deliverables at end of Phase 3:**
- ✅ AI Provider Configuration UI (OpenAI, Anthropic, Google, Ollama)
- ✅ Secure client-side API key storage (localStorage)
- ✅ AI Mapping Engine: Sends error message + stack trace to LLM for file/line confirmation
- ✅ Fix Suggestion UI: Displays plain-language explanation + code diffs
- ✅ "Copy Fix" and "Open in Editor" (linked to Phase 2 Code Viewer)
- ✅ Confidence scores for AI mappings (High/Medium/Low)

---

## 2. Tech Stack Decisions

| Layer | Decision | Rationale |
|---|---|---|
| **LLM Orchestration** | LangChain.js or direct SDKs | direct SDKs (OpenAI/Anthropic/Google) for minimal overhead and specific control |
| **Local AI** | Ollama API | Allows users to run Llama 3/Mistral locally without sending data to external clouds |
| **UI Components** | Radix UI / Shadcn | Premium, accessible components for modals and dropdowns |
| **Syntax Highlighting** | `shiki` or `prismjs` | High-quality highlighting for fix suggestions |
| **Diff Viewing** | `react-diff-viewer` | Clear side-by-side or inline diffs for proposed fixes |

---

## 3. Project Folder Structure Updates

```
track-errors/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ai/
│   │   │   │   ├── ModelSelector.jsx     ← Provider/Model dropdown
│   │   │   │   ├── ApiKeyInput.jsx       ← Secure key input fields
│   │   │   │   ├── FixSuggestion.jsx     ← The main AI output card
│   │   │   │   └── MappingBadge.jsx      ← Confidence score indicator
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── index.js              ← AI dispatcher (factory pattern)
│   │   │   │   ├── openai.service.js
│   │   │   │   ├── anthropic.service.js
│   │   │   │   ├── google.service.js
│   │   │   │   └── ollama.service.js
│   │   ├── store/
│   │   │   └── useAIStore.js             ← Zustand store for AI config & keys
```

---

## 4. AI Orchestration Logic

1. **Context Preparation:** Gather error message, raw log line, and the matched file path + snippet from Phase 2.
2. **Prompt Engineering:**
   - **System Prompt:** "You are an expert debugger. Analyze the following error and provide a fix..."
   - **User Prompt:** includes error context and local code snippet.
3. **Multi-Provider Dispatch:**
   - The `ai/index.js` service reads the selected provider from `useAIStore`.
   - It routes the request to the correct SDK with the user's local API key.
4. **Response Parsing:** AI returns structured JSON containing:
   - `explanation`: Root cause description.
   - `fixSuggestion`: Code snippet or diff.
   - `confidence`: Confidence score (0.0 - 1.0).

---

## 5. Day-by-Day Task Breakdown

### Week 5 (Days 21–25) — AI Config & Integration

| Day | Tasks |
|---|---|
| **Day 21** | Build `useAIStore` and `ApiKeyInput.jsx`; implement secure storage in `localStorage`. |
| **Day 22** | Create `ModelSelector.jsx`; support OpenAI, Anthropic, and Google Gemini dropdowns. |
| **Day 23** | Backend/Frontend: Set up proxy routes if needed for CORS (though many SDKs work client-side if allowed). |
| **Day 24** | Prompt Engineering: Develop and test the "Mapping Confirmation" prompt; ensure consistent JSON output. |
| **Day 25** | Implement `openai.service.js` and `google.service.js` initial integrations. |

### Week 6 (Days 26–30) — Fix Suggestions UI + Ollama

| Day | Tasks |
|---|---|
| **Day 26** | Implement `anthropic.service.js` and `ollama.service.js` (testing with local Ollama instance). |
| **Day 27** | Build `FixSuggestion.jsx` UI; display the explanation and the primary code fix. |
| **Day 28** | Integrate `react-diff-viewer`; show the "Before vs After" for the proposed fix. |
| **Day 29** | Add "Copy Fix" and "Apply" (simulation) logic; connect "Open in Editor" to Phase 2 viewer. |
| **Day 30** | Phase 3 QA: Test all 4 providers; verify error handling for invalid API keys; demo AI-powered resolution. |

---

## 6. Acceptance Criteria — Phase 3 Complete

| # | Criterion | How Verified |
|---|---|---|
| AC-21 | User can enter and save API keys for OpenAI/Anthropic/Google | Manual UI test |
| AC-22 | Keys are NEVER sent to the app backend (checked via Network tab) | Network audit |
| AC-23 | AI correctly identifies the root cause of a PHP Fatal Error | Test with sample logs |
| AC-24 | Fix suggestions include valid syntax for the target language | Verify snippet output |
| AC-25 | Ollama integration works with a locally running instance | Manual test with Ollama |
| AC-26 | UI shows loading states during AI generation | Manual UI test |
| AC-27 | System handles AI rate limits/errors gracefully with user feedback | Trigger 429 error |

---

## 7. Definition of Done — Phase 3

- [ ] All 7 acceptance criteria pass.
- [ ] Prompt templates are versioned and documented in `src/services/ai/prompts/`.
- [ ] Unit tests for the AI dispatcher factory logic.
- [ ] No regressions in Log Upload or Codebase Indexing.
- [ ] Code reviewed and merged to `main`.
- [ ] Demo-ready: Upload a log, connect codebase, and see an AI-generated fix suggestion.

---

*Document Owner: Engineering Lead | Phase: 3 | Stack: React + AI SDKs | Next Review: End of Day 25*
