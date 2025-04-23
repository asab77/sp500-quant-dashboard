// main.js

// 1. Load the feature‐rich data
d3.csv("sp500_features.csv", d3.autoType).then(data => {
    // 2. Populate sector dropdown
    const sectors = Array.from(new Set(data.map(d => d.Sector))).sort();
    d3.select("#sector-select")
      .selectAll("option")
      .data(["All", ...sectors])
      .join("option")
        .text(d => d)
        .attr("value", d => d);
  
    // 3. Capture controls and tooltip container
    const sectorSelect = d3.select("#sector-select");
    const metricRadios = d3.selectAll('input[name="metric"]');
    const dateSlider   = d3.select("#date-range");
    const tooltip      = d3.select("#tooltip");
  
    // 4. Attach listeners
    sectorSelect.on("change", () => updateChart(data));
    metricRadios.on("change", () => updateChart(data));
    dateSlider.on("input",  () => updateChart(data));
  
    // 5. Initial draw
    updateChart(data);
  });
  
  
  function updateChart(data) {
    // --- Read control values ---
    const selSector = d3.select("#sector-select").property("value");
    const metric    = d3.select('input[name="metric"]:checked').property("value");
    const pct       = +d3.select("#date-range").property("value"); // 0–100%
  
    // --- Filter data for line chart ---
    const filt = selSector === "All"
      ? data
      : data.filter(d => d.Sector === selSector);
  
    // --- Build time series for selected metric ---
    const nested = d3.rollup(
      filt,
      v => d3.mean(v, d => d[metric]),
      d => d.Date
    );
    let series = Array.from(nested, ([date, value]) => ({ date, value }))
                      .sort((a, b) => d3.ascending(a.date, b.date));
  
    // --- Apply date-range slicing from slider ---
    const iMax   = Math.floor((pct/100) * (series.length - 1));
    series       = series.slice(0, iMax + 1);
  
    // --- SVG and margin setup ---
    const svg    = d3.select("svg");
    const margin = { top: 20, right: 30, bottom: 30, left: 50 };
    const W      = +svg.attr("width")  - margin.left - margin.right;
    const H      = +svg.attr("height") - margin.top  - margin.bottom;
  
    // Clear everything
    svg.selectAll("*").remove();
  
    // --- Draw line chart (top portion) ---
    const g = svg.append("g")
                 .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // scales
    const x = d3.scaleTime().domain(d3.extent(series, d => d.date)).range([0, W]);
    const y = d3.scaleLinear().domain(d3.extent(series, d => d.value)).nice().range([H*0.6, 0]);
    
    // axes
    g.append("g")
     .attr("transform", `translate(0,${H*0.6})`)
     .call(d3.axisBottom(x));
    g.append("g")
     .call(d3.axisLeft(y));
    
    // line generator
    const line = d3.line()
                   .x(d => x(d.date))
                   .y(d => y(d.value));
    // draw path
    g.append("path")
     .datum(series)
     .attr("fill", "none")
     .attr("stroke", "steelblue")
     .attr("stroke-width", 1.5)
     .attr("d", line);
    // points + tooltip
    g.selectAll("circle")
     .data(series)
     .join("circle")
       .attr("cx", d => x(d.date))
       .attr("cy", d => y(d.value))
       .attr("r", 3)
       .attr("fill", "steelblue")
       .on("mouseover", (e, d) => {
         tooltip.style("visibility", "visible")
                .html(`Date: ${d3.timeFormat("%Y-%m-%d")(d.date)}<br>${metric}: ${d.value.toFixed(4)}`)
                .style("top",  (e.pageY - 10) + "px")
                .style("left", (e.pageX + 10) + "px");
       })
       .on("mouseout", () => tooltip.style("visibility", "hidden"));
  
    // --- Prepare scatter data (bottom portion) ---
    // Use the last visible date
    const lastDate = series[series.length - 1].date.getTime();
    let scatterData = filt
      .filter(d => d.Date.getTime() === lastDate)
      .map(d => ({ Symbol: d.Symbol, Vol: d.Volatility_30d, Beta: d.Beta_60d }))
      .filter(d => d.Vol != null && d.Beta != null);
  
    // --- DEBUG: log scatter info ---
    console.log("Scatter data:", scatterData);
    console.log("Dimensions:", { W, H, H2: H*0.3, gap: H*0.6 + 20 });
  
    // scatter scales
    const H2  = H * 0.3;
    const W2  = W * 0.4;
    const x2  = d3.scaleLinear().domain(d3.extent(scatterData, d => d.Vol)).nice().range([0, W2]);
    const y2  = d3.scaleLinear().domain(d3.extent(scatterData, d => d.Beta)).nice().range([H2, 0]);
  
    // group for scatter, positioned below line
    const gap = H * 0.6 + 20;
    const g2  = svg.append("g")
                   .attr("transform", `translate(${margin.left},${margin.top + gap})`);
  
    // axes for scatter
    g2.append("g")
      .attr("transform", `translate(0,${H2})`)
      .call(d3.axisBottom(x2).ticks(5));
    g2.append("g")
      .call(d3.axisLeft(y2).ticks(5));
  
    // draw scatter points + tooltip
    g2.selectAll("circle.scatter")
      .data(scatterData)
      .join("circle")
        .classed("scatter", true)
        .attr("cx", d => x2(d.Vol))
        .attr("cy", d => y2(d.Beta))
        .attr("r", 4)
        .attr("fill", "tomato")
        .attr("opacity", 0.7)
        .on("mouseover", (e, d) => {
          tooltip.style("visibility", "visible")
                 .html(`${d.Symbol}<br>Vol: ${d.Vol.toFixed(3)}<br>β: ${d.Beta.toFixed(2)}`)
                 .style("top",  (e.pageY - 10) + "px")
                 .style("left", (e.pageX + 10) + "px");
        })
        .on("mouseout", () => tooltip.style("visibility", "hidden"));
  }
  