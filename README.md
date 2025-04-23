# S&P 500 Quant Dashboard

An interactive, D3-based dashboard for exploring S&P 500 risk and return metrics.

## Project Structure

sp500-quant-dashboard/ ├── README.md ├── index.html ├── main.js ├── data/ │ ├── sp500_prices_clean.csv │ └── sp500_features.csv ├── scripts/ │ ├── merge_sp500.py │ ├── pre_process.py │ └── feature_engineering.py └── report/ └── Milestone1_Report.pdf

markdown
Copy
Edit

- **index.html** + **main.js**  
  The low-fidelity D3 prototype with filters, line chart, tooltips, and scatter plot.

- **data/**  
  - `sp500_prices_clean.csv` – cleaned & merged price + metadata  
  - `sp500_features.csv` – with Return, Volatility_30d, Sharpe_30d, Beta_60d

- **scripts/**  
  1. `merge_sp500.py` – downloads & merges raw CSVs  
  2. `pre_process.py` – cleans and filters the merged data  
  3. `feature_engineering.py` – computes Return, Volatility, Sharpe, Beta

- **report/**  
  - `Milestone1_Report.pdf` – 2-page report detailing dataset, persona, tasks & design rationale.

## Setup & Run

1. **Install dependencies**  
   ```bash
   pip install pandas
