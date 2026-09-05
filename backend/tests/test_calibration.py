"""Model believability — confidence must track REAL inputs, not defaults."""
from app.services.fire_risk_engine import FireRiskEngine, score_to_level
from app.services.agents.carbon_guard import carbon_guard
from app.services.agents.disaster_guard import disaster_guard

eng = FireRiskEngine()


def test_no_inputs_low_confidence_and_full_missing():
    r = eng.analyze("unit-x")
    assert r["confidence"] < 60, r
    assert set(r["missing"]) == {"satellite", "weather", "terrain", "firms", "community"}
    assert 0 <= r["risk_score"] <= 100


def test_full_inputs_high_confidence_no_missing():
    r = eng.analyze(
        "unit-x",
        satellite={"ndvi": 0.3, "ndmi": 0.2},
        weather={"temperature": 36, "humidity": 25, "rainfall": 0, "wind_speed": 20},
        terrain={"slope": 25, "elevation": 500},
        hotspots=[{"latitude": 13.9, "longitude": 108.3}],
        community=3,
    )
    assert r["confidence"] > 75, r
    assert r["missing"] == []
    assert r["warning_level"] in ("IV", "V")  # dry + hot + windy + hotspots


def test_thresholds_unified_20_40_60_80():
    assert score_to_level(20).value == "I"
    assert score_to_level(21).value == "II"
    assert score_to_level(60).value == "III"
    assert score_to_level(80).value == "IV"
    assert score_to_level(81).value == "V"


def test_carbon_flags_estimated_inputs():
    r = carbon_guard.analyze("unit-x")
    assert set(r["estimated_inputs"]) == {"forest_area_ha", "ndvi", "ndvi_change"}
    assert r["confidence"] <= 65
    r2 = carbon_guard.analyze("unit-x", forest_area_ha=1200, ndvi=0.65, ndvi_change=-0.05)
    assert r2["estimated_inputs"] == []
    assert r2["confidence"] > 65


def test_disaster_reports_estimated_inputs():
    r = disaster_guard.analyze("unit-x", "FLOOD", None, {})
    assert "rainfall" in r["estimated_inputs"] and "elevation" in r["estimated_inputs"]
    r2 = disaster_guard.analyze("unit-x", "FLOOD", None, {"rainfall": 120, "elevation": 60})
    assert r2["estimated_inputs"] == []
