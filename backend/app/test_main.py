from fastapi.testclient import TestClient
import pytest
from app.main import app
from app.nlp_parser import extract_skills, extract_emails, clean_text
from app.vector_search import compute_cosine_similarity, l2_normalize
import numpy as np

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"
    assert "NextGen" in response.json()["service"]

def test_nlp_extraction():
    text = "Hello! My name is John. You can reach me at developer@nextgen.com. Skills: React, Python, FastAPI."
    
    # Test Email extraction
    emails = extract_emails(text)
    assert len(emails) == 1
    assert emails[0] == "developer@nextgen.com"
    
    # Test Skills extraction
    skills = extract_skills(text)
    assert "React" in skills
    assert "Python" in skills
    assert "Fastapi" in skills

def test_vector_normalization():
    # Verify L2 normalization scale invariance
    vec = np.array([3.0, 4.0])
    normalized = l2_normalize(vec)
    assert np.allclose(np.linalg.norm(normalized), 1.0)
    assert np.allclose(normalized, np.array([0.6, 0.8]))

def test_cosine_similarity():
    # Orthogonal vectors should have 0 similarity
    v1 = [1.0, 0.0]
    v2 = [0.0, 1.0]
    sim = compute_cosine_similarity(v1, v2)
    assert np.isclose(sim, 0.0)

    # Identical vectors should have 1 similarity
    sim_identical = compute_cosine_similarity(v1, v1)
    assert np.isclose(sim_identical, 1.0)
