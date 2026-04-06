"""
Aviation Dashboard - Data Integrity Tests
Verifies data was imported correctly.
"""

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import text
from database import engine


def run_tests():
    tests_passed = 0
    tests_total = 0

    print("=" * 60)
    print("🧪 DATA INTEGRITY TESTS")
    print("=" * 60)

    with engine.connect() as conn:
        # ─── Test 1: Row counts ───
        expected = {
            "countries": (200, 300),
            "regions": (3000, 5000),
            "airports": (80000, 100000),
            "runways": (40000, 55000),
            "airport_frequencies": (25000, 35000),
            "navaids": (10000, 12000),
            "airlines": (5000, 7000),
            "routes": (60000, 75000),
        }
        print("\n📊 Test 1: Row counts within expected range")
        for table, (lo, hi) in expected.items():
            tests_total += 1
            count = conn.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            ok = lo <= count <= hi
            status = "✅" if ok else "❌"
            print(f"  {status} {table}: {count:,} (expected {lo:,}-{hi:,})")
            if ok:
                tests_passed += 1

        # ─── Test 2: ICAO query performance ───
        print("\n⚡ Test 2: Query by ICAO performance")
        tests_total += 1
        t0 = time.perf_counter()
        row = conn.execute(
            text("SELECT * FROM airports WHERE ident = 'KJFK'")
        ).fetchone()
        t1 = time.perf_counter()
        ms = (t1 - t0) * 1000
        ok = ms < 50 and row is not None
        print(f"  {'✅' if ok else '❌'} KJFK query: {ms:.2f}ms (target <50ms)")
        if ok:
            tests_passed += 1

        # ─── Test 3: Country query performance ───
        print("\n⚡ Test 3: Query by country performance")
        tests_total += 1
        t0 = time.perf_counter()
        rows = conn.execute(
            text("SELECT COUNT(*) FROM airports WHERE iso_country = 'US'")
        ).scalar()
        t1 = time.perf_counter()
        ms = (t1 - t0) * 1000
        ok = ms < 100 and rows > 0
        print(
            f"  {'✅' if ok else '❌'} US airports: {rows:,} found in {ms:.2f}ms (target <100ms)"
        )
        if ok:
            tests_passed += 1

        # ─── Test 4: Geo bounding box ───
        print("\n🗺️ Test 4: Geo bounding box query")
        tests_total += 1
        t0 = time.perf_counter()
        rows = conn.execute(
            text(
                "SELECT COUNT(*) FROM airports "
                "WHERE latitude_deg BETWEEN 10.5 AND 11.0 "
                "AND longitude_deg BETWEEN 106.0 AND 107.0"
            )
        ).scalar()
        t1 = time.perf_counter()
        ms = (t1 - t0) * 1000
        ok = rows > 0
        print(f"  {'✅' if ok else '❌'} HCM area: {rows} airports in {ms:.2f}ms")
        if ok:
            tests_passed += 1

        # ─── Test 5: No null idents ───
        print("\n🔒 Test 5: Data quality — no null idents")
        tests_total += 1
        null_idents = conn.execute(
            text("SELECT COUNT(*) FROM airports WHERE ident IS NULL")
        ).scalar()
        ok = null_idents == 0
        print(f"  {'✅' if ok else '❌'} Null idents: {null_idents}")
        if ok:
            tests_passed += 1

        # ─── Test 6: Runway refs (optimized with LEFT JOIN) ───
        print("\n🔗 Test 6: Referential integrity — runways → airports")
        tests_total += 1
        orphans = conn.execute(
            text(
                "SELECT COUNT(*) FROM runways r "
                "LEFT JOIN airports a ON r.airport_ident = a.ident "
                "WHERE a.ident IS NULL"
            )
        ).scalar()
        ok = orphans == 0
        print(f"  {'✅' if ok else '⚠️'} Orphaned runways: {orphans}")
        if ok:
            tests_passed += 1

        # ─── Test 7: Frequency refs (optimized) ───
        print("\n🔗 Test 7: Referential integrity — frequencies → airports")
        tests_total += 1
        orphans = conn.execute(
            text(
                "SELECT COUNT(*) FROM airport_frequencies f "
                "LEFT JOIN airports a ON f.airport_ident = a.ident "
                "WHERE a.ident IS NULL"
            )
        ).scalar()
        ok = orphans == 0
        print(f"  {'✅' if ok else '⚠️'} Orphaned frequencies: {orphans}")
        if ok:
            tests_passed += 1

        # ─── Test 8: Sample data spot checks ───
        print("\n📋 Test 8: Sample data spot checks")
        tests_total += 1
        checks = 0

        r = conn.execute(
            text("SELECT name, iata_code FROM airports WHERE ident = 'VVTS'")
        ).fetchone()
        if r and "Tan Son Nhat" in r[0] and r[1] == "SGN":
            checks += 1

        r = conn.execute(
            text("SELECT name, iata_code FROM airports WHERE ident = 'KJFK'")
        ).fetchone()
        if r and "Kennedy" in r[0] and r[1] == "JFK":
            checks += 1

        r = conn.execute(
            text("SELECT name FROM countries WHERE code = 'VN'")
        ).fetchone()
        if r and "Viet" in r[0]:
            checks += 1

        ok = checks == 3
        print(f"  {'✅' if ok else '❌'} Spot checks: {checks}/3 passed")
        if ok:
            tests_passed += 1

    # ─── Summary ───
    print(f"\n{'=' * 60}")
    if tests_passed == tests_total:
        print(f"🎉 ALL TESTS PASSED: {tests_passed}/{tests_total}")
    else:
        print(f"⚠️ Results: {tests_passed}/{tests_total} tests passed")
    print(f"{'=' * 60}")

    return tests_passed == tests_total


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
