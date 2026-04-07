"""
test_stats.py — Tests for stats, data freshness, and routes endpoints.
"""


class TestStatsOverview:
    def test_stats_overview(self, client):
        resp = client.get("/api/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_airports"] > 80000
        assert data["total_runways"] > 40000
        assert data["total_airlines"] > 5000
        assert data["total_routes"] > 60000
        assert "top_country" in data
        assert "total_countries" in data


class TestStatsCountries:
    def test_by_country(self, client):
        resp = client.get("/api/stats/countries?limit=5")
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert len(data["data"]) == 5
        assert "total_countries" in data
        # US should be first (most airports)
        assert data["data"][0]["country_code"] == "US"


class TestStatsTypes:
    def test_by_type(self, client):
        resp = client.get("/api/stats/types")
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        types = [t["type"] for t in data["data"]]
        assert "small_airport" in types
        assert "large_airport" in types
        for t in data["data"]:
            assert "count" in t
            assert "percentage" in t


class TestDataFreshness:
    def test_data_freshness(self, client):
        resp = client.get("/api/data-freshness")
        assert resp.status_code == 200
        data = resp.json()
        assert "database_size_mb" in data
        assert data["database_size_mb"] > 30
        assert "total_records" in data
        assert data["total_records"] > 200000
        assert "sources" in data
        assert len(data["sources"]) == 8


class TestRoutes:
    def test_routes_by_airport(self, client):
        resp = client.get("/api/routes/HAN")
        assert resp.status_code == 200
        data = resp.json()
        assert "outbound" in data
        assert "inbound" in data
        assert "total_outbound" in data
        assert data["total_outbound"] > 50
        assert isinstance(data["outbound"], list)

    def test_routes_unknown_airport(self, client):
        resp = client.get("/api/routes/ZZZFAKE")
        assert resp.status_code == 404
