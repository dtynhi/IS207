# Migration Risk Register

| Risk | Impact | Mitigation | Owner | Status |
|---|---|---|---|---|
| Hidden legacy business rules in controllers/helpers | High | Characterization tests + parity checklist before refactor | Backend Lead | Open |
| Mongo nested structures hard to normalize | High | Use hybrid approach (relation + JSONB) and validate query patterns | Data Lead | Open |
| Auth/session regressions | High | Keep auth behavior compatible in v1, migrate incrementally | Backend Lead | Open |
| UI parity drift during React rebuild | Medium | Route-by-route acceptance criteria and side-by-side QA | Frontend Lead | Open |
| Migration timeline slips | Medium | Vertical slices + scope freeze + weekly checkpoint | PM | Open |
