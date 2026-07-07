import os
import sys
import unittest
from unittest.mock import patch, MagicMock
import pandas as pd

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.predictor import _normalize_model_type, _model_file_path, train_model, forecast

class TestPredictor(unittest.TestCase):

    def test_normalize_model_type(self):
        self.assertEqual(_normalize_model_type("ARIMA"), "arima")
        self.assertEqual(_normalize_model_type("RandomForest"), "rf")
        self.assertEqual(_normalize_model_type("LSTM"), "rf")
        self.assertEqual(_normalize_model_type("Prophet"), "rf")
        self.assertEqual(_normalize_model_type("rf"), "rf")
        self.assertEqual(_normalize_model_type("arima"), "arima")

    def test_model_file_path(self):
        path = _model_file_path("AAPL", "ARIMA")
        self.assertTrue(path.endswith("AAPL_arima.joblib"))

    @patch('backend.predictor.fetch_history')
    @patch('backend.predictor.save_metrics_to_db')
    def test_train_model(self, mock_save_db, mock_fetch):
        # Mock historical data: 90 days
        dates = pd.date_range(end='2026-07-07', periods=90)
        mock_df = pd.DataFrame({'Close': [100.0 + i * 0.5 for i in range(90)]}, index=dates)
        mock_fetch.return_value = mock_df

        result = train_model("AAPL", "arima")
        self.assertIn("mae", result)
        self.assertIn("rmse", result)
        self.assertIn("r2", result)
        self.assertIn("trained_at", result)
        self.assertIn("model_path", result)
        self.assertTrue(os.path.exists(result["model_path"]))

    @patch('backend.predictor.fetch_history')
    def test_forecast(self, mock_fetch):
        dates = pd.date_range(end='2026-07-07', periods=90)
        mock_df = pd.DataFrame({'Close': [100.0 + i * 0.5 for i in range(90)]}, index=dates)
        mock_fetch.return_value = mock_df

        # Test arima forecasting
        predictions = forecast("AAPL", "arima", steps=30)
        self.assertEqual(len(predictions), 30)
        for p in predictions:
            self.assertIn("date", p)
            self.assertIn("predicted", p)
            self.assertIn("confidence", p)
            self.assertTrue(0.0 <= p["confidence"] <= 1.0)

if __name__ == '__main__':
    unittest.main()
