"""
conftest.py — Shared fixtures for API tests.
Uses Starlette TestClient (sync, no server needed).
"""
import sys
import os
import pytest

# Ensure api/ is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app  # noqa: E402
from starlette.testclient import TestClient  # noqa: E402


@pytest.fixture
def client():
    """Sync test client — no running server needed."""
    with TestClient(app) as c:
        yield c
