# Phase 06: Testing & Deploy
Status: ⬜ Pending
Dependencies: Phase 05

## Objective
Kiểm thử toàn diện và chuẩn bị deploy.

## Requirements
### Functional
- [ ] Tất cả API endpoints tested
- [ ] UI hoạt động trên Chrome, Firefox, Safari
- [ ] Data hiển thị chính xác

### Non-Functional
- [ ] No critical bugs
- [ ] Performance benchmarks met
- [ ] Documentation đầy đủ

## Implementation Steps
1. [ ] API testing: test tất cả endpoints với pytest
2. [ ] Frontend testing: component tests với Jest/Testing Library
3. [ ] E2E test: main user flows (map, search, detail)
4. [ ] Performance test: Lighthouse audit
5. [ ] Cross-browser testing (Chrome + Firefox)
6. [ ] Viết README hướng dẫn setup + chạy project
7. [ ] Docker-compose cho easy deployment (optional)

## Files to Create/Modify
- `api/tests/test_airports.py` - Airport API tests
- `api/tests/test_stats.py` - Stats API tests
- `dashboard/src/__tests__/` - Frontend tests
- `README.md` - Update hướng dẫn
- `docker-compose.yml` - Docker setup (optional)

## Test Criteria
- [ ] API test coverage > 80%
- [ ] 0 critical/high severity bugs
- [ ] Lighthouse Performance score > 80
- [ ] README có đủ hướng dẫn để team member mới setup được

## Notes
- Focus test các happy paths trước
- Lighthouse test trên production build
- Docker-compose giúp team mới setup nhanh

---
🎉 Done! Project complete.
