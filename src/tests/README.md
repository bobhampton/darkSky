# Test Suite Documentation

## Test Structure

### Phase 1: Core Unit Tests ✅
Fast, offline tests for all utility functions. **113 tests total**

**Files:**
- `astronomy.test.ts` - Astronomy calculation tests (25 tests)
- `validation.test.ts` - Form validation tests (54 tests)
- `dateUtils.test.ts` - Date/number formatting tests (34 tests)

**Run:** `npm test`

---

### Phase 2: API Validation Tests 🌐
Optional tests that validate calculations against external APIs. **12 tests**

**Files:**
- `astronomy.validation.test.ts` - Compares with SunriseSunset.io and USNO (12 tests)

**Run:** `npm run test:validation`

**Notes:**
- Makes network calls (slower)
- Uses cached fixtures by default for fast, deterministic tests
- Set `USE_FIXTURES = false` to fetch fresh API data

---

### Phase 3: Integration Tests (Coming Soon)

---

## Test Coverage

**Best Practices:**
- Helper functions for DRY principle (see `helpers/apiHelpers.ts`)
- Constants for magic numbers (`ASTRONOMICAL_TWILIGHT_THRESHOLD = -18°`, etc.)
- Type-safe generics with JSDoc documentation
- Comprehensive edge case testing

**Edge Cases Covered:**
- Polar regions (76.5°N, 86°N) with polar night, midnight sun, multiple crossings
- Geographic extremes (±90° lat, ±180° lon, equator)
- Date boundaries (past/future, year boundaries, seasons)
- Elevation impact on twilight calculations
- Invalid inputs and boundary conditions

**Constants & Locations:** See test files for `TEST_LOCATIONS`, `SUN_ALTITUDE_RANGES`, and standard test dates

---

## Fixtures

Cached API responses stored in `fixtures/` for offline testing:

```
fixtures/
├── arctic-russia/     # Polar region edge cases
├── sunrisesunset/     # SunriseSunset.io responses
└── usno/              # USNO API responses
```

**To refresh:** Set `USE_FIXTURES = false` in test file, run `npm run test:validation`, commit updates

**Tolerance:** ±5 minutes for time comparisons (accounts for algorithm/rounding differences)

---

## Commands

```bash
npm test                    # Run all unit tests
npm run test:validation     # Run API validation tests
npm run test:ui             # Run with UI
npm run test:coverage       # Run with coverage report
npm test -- --watch         # Watch mode
```
