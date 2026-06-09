# AI Forecasting Models

Stock Time Nexus uses 5 machine learning and statistical models, plus an Ensemble model, to predict stock price trends.

## Model Profiles

1. **LSTM (Long Short-Term Memory)**
   - **Type**: Deep Learning / Recurrent Neural Network
   - **Description**: Excellent at capturing complex non-linear patterns and long-term sequential dependencies.
   - **Historical Accuracy**: ~92%

2. **Prophet (Facebook Prophet)**
   - **Type**: Additive Time Series Regression
   - **Description**: Developed by Meta, it excels at identifying daily, weekly, and yearly seasonality, plus holiday effects.
   - **Historical Accuracy**: ~89%

3. **ARIMA (AutoRegressive Integrated Moving Average)**
   - **Type**: Classical Statistical Time Series
   - **Description**: A highly reliable model for stable linear trends and short-term forecasting.
   - **Historical Accuracy**: ~85%

4. **XGBoost (Extreme Gradient Boosting)**
   - **Type**: Ensemble Decision Trees
   - **Description**: A powerful tree-based model that treats the time-series forecasting problem as a tabular regression task.
   - **Historical Accuracy**: ~88%

5. **Random Forest**
   - **Type**: Bagging Ensemble Decision Trees
   - **Description**: Robust to noise and outliers, providing a stable prediction based on multiple decision tree averages.
   - **Historical Accuracy**: ~87%

6. **Ensemble Model**
   - **Type**: Combined Predictor
   - **Description**: Dynamically averages and weights the forecasts of all 5 individual models to produce a single consolidated prediction.
   - **Historical Accuracy**: **~94%** (highest accuracy rate)
