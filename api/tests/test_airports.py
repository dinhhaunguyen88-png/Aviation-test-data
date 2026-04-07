"""
test_airports.py — Tests for airport-related API endpoints.
Tests against running server at localhost:8000.
"""


class TestHealthEndpoint:
    def test_health_returns_ok(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert "version" in data


class TestAirportList:
    def test_list_airports_default(self, client):
        resp = client.get("/api/airports")
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert "pagination" in data
        assert isinstance(data["data"], list)
        assert data["pagination"]["total"] > 80000

    def test_list_airports_with_filter(self, client):
        resp = client.get("/api/airports?type=large_airport&limit=5")
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["data"]) == 5
        for airport in data["data"]:
            assert airport["type"] == "large_airport"

    def test_list_airports_pagination(self, client):
        r1 = client.get("/api/airports?limit=2&offset=0")
        r2 = client.get("/api/airports?limit=2&offset=2")
        assert r1.status_code == 200
        assert r2.status_code == 200
        ids1 = {a["ident"] for a in r1.json()["data"]}
        ids2 = {a["ident"] for a in r2.json()["data"]}
        assert ids1.isdisjoint(ids2), "Pages should not overlap"


class TestAirportSearch:
    def test_search_by_name(self, client):
        resp = client.get("/api/airports/search?q=Noi+Bai")
        assert resp.status_code == 200
        data = resp.json()
        assert data["pagination"]["total"] >= 1
        found = any("Noi Bai" in a["name"] for a in data["data"])
        assert found, "Noi Bai should be in results"

    def test_search_by_icao(self, client):
        resp = client.get("/api/airports/search?q=VVNB")
        assert resp.status_code == 200
        data = resp.json()
        assert data["pagination"]["total"] >= 1
        assert data["data"][0]["ident"] == "VVNB"

    def test_search_requires_q(self, client):
        resp = client.get("/api/airports/search")
        assert resp.status_code == 422, "Missing required 'q' should be 422"


class TestAirportDetail:
    def test_detail_vvnb(self, client):
        resp = client.get("/api/airports/VVNB")
        assert resp.status_code == 200
        data = resp.json()
        assert data["ident"] == "VVNB"
        assert data["iata_code"] == "HAN"
        assert "runways" in data
        assert "frequencies" in data
        assert len(data["runways"]) == 2

    def test_detail_not_found(self, client):
        resp = client.get("/api/airports/ZZZZ_FAKE")
        assert resp.status_code == 404


class TestAirportMap:
    def test_map_viewport_hanoi(self, client):
        resp = client.get(
            "/api/airports/map?north=22&south=20&east=106&west=105&limit=50"
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert "count" in data
        idents = [a["ident"] for a in data["data"]]
        assert "VVNB" in idents
