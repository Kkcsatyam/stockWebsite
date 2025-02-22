document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const API_KEY = "4ZUV5YXV4C6GFH2Z";
  const BASE_URL = "https://www.alphavantage.co/query";
  const searchInput = document.querySelector(".search-input");
  const searchBtn = document.querySelector(".search-btn");
  const resultsContainer = document.createElement("div");
  resultsContainer.classList.add("stock-results");
  document.querySelector(".hero").appendChild(resultsContainer);

  const compareInput = document.querySelector(".compare-input");
  const compareBtn = document.querySelector(".compare-btn");
  const chartContainer = document.getElementById("stockChart");
  let stockChart;

  async function fetchStockData(symbol) {
    try {
      const response = await fetch(
        `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
      );
      const data = await response.json();
      if (
        data["Global Quote"] &&
        Object.keys(data["Global Quote"]).length > 0
      ) {
        return data["Global Quote"];
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error fetching stock data:", error);
      return null;
    }
  }

  function displayStockData(stock) {
    resultsContainer.innerHTML = "";
    if (!stock) {
      resultsContainer.innerHTML =
        "<p>No data found. Please check the stock symbol.</p>";
      return;
    }
    resultsContainer.innerHTML = `
          <div class="stock-card">
    <h2>${stock["01. symbol"]}</h2>
    <div class="stock-details">
        <div><strong>Price:</strong> $${stock["05. price"] || "N/A"}</div>
        <div><strong>Change:</strong> ${stock["09. change"] || "N/A"} (${
      stock["10. change percent"] || "N/A"
    })</div>
        <div><strong>Open:</strong> $${stock["02. open"] || "N/A"}</div>
        <div><strong>High:</strong> $${stock["03. high"] || "N/A"}</div>
        <div><strong>Low:</strong> $${stock["04. low"] || "N/A"}</div>
        <div><strong>Previous Close:</strong> $${
          stock["08. previous close"] || "N/A"
        }</div>
        <div><strong>Volume:</strong> ${stock["06. volume"] || "N/A"}</div>
        <div><strong>Latest Trading Day:</strong> ${
          stock["07. latest trading day"] || "N/A"
        }</div>
    </div>
</div>

        `;
  }

  searchBtn.addEventListener("click", async () => {
    const symbol = searchInput.value.trim().toUpperCase();
    if (symbol) {
      resultsContainer.innerHTML = "<p>Loading...</p>";
      const stockData = await fetchStockData(symbol);
      displayStockData(stockData);
    }
  });

  async function fetchStockHistory(symbol) {
    try {
      const response = await fetch(
        `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`
      );
      const data = await response.json();
      return data["Time Series (Daily)"] || null;
    } catch (error) {
      console.error("Error fetching stock history:", error);
      return null;
    }
  }

  async function compareStocks() {
    const symbols = compareInput.value
      .split(",")
      .map((s) => s.trim().toUpperCase());
    if (symbols.length === 0) return;

    let stockData = {};
    for (const symbol of symbols) {
      stockData[symbol] = await fetchStockHistory(symbol);
    }

    plotStockTrends(stockData);
  }

  function plotStockTrends(stockData) {
    if (stockChart) stockChart.destroy();

    const allDates = Object.keys(stockData[Object.keys(stockData)[0]] || {})
      .slice(0, 30)
      .reverse();
    const datasets = Object.entries(stockData)
      .map(([symbol, data]) => {
        return {
          label: symbol,
          data: allDates.map((date) =>
            data[date] ? parseFloat(data[date]["4. close"]) : null
          ),
          borderColor: getRandomColor(),
          fill: false,
        };
      })
      .filter((dataset) => dataset.data.some((value) => value !== null));

    const ctx = chartContainer.getContext("2d");
    stockChart = new Chart(ctx, {
      type: "line",
      data: { labels: allDates, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { title: { display: true, text: "Date" } },
          y: { title: { display: true, text: "Stock Price ($)" } },
        },
      },
    });
  }

  function getRandomColor() {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  compareBtn.addEventListener("click", compareStocks);

  document.querySelector(".nav-link.compare").addEventListener("click", () => {
    window.location.href = "compare.html";
  });

  document
    .querySelector(".nav-link.backtester")
    .addEventListener("click", () => {
      window.location.href = "backtester.html";
    });
});
