/**
 * Data Analysis Logic
 */

let scatterChartInstance = null;

// --- PART 1: Single Variable Stats ---

function analyzeData() {
    const rawData1 = document.getElementById('data-input-1').value;
    const data1 = parseInput(rawData1);

    if (data1.length === 0) {
        alert("Please enter at least one valid number.");
        return;
    }

    // Process Dataset 1 only
    displayStats(data1, 1);

    // Show Results
    document.getElementById('results-area').style.display = 'block';
}

function randomizeData(setNum) {
    const data = MathUtils.generateData(15, 10, 100);
    document.getElementById(`data-input-${setNum}`).value = data.join(', ');
}

function clearStats() {
    document.getElementById('data-input-1').value = '';
    document.getElementById('results-area').style.display = 'none';
}

// --- PART 2: Scatter Plot & Line of Best Fit ---

function generateScatterPlot() {
    const rawX = document.getElementById('scatter-x').value;
    const rawY = document.getElementById('scatter-y').value;

    const xData = parseInput(rawX);
    const yData = parseInput(rawY);

    // Validation
    if (xData.length === 0 || yData.length === 0) {
        alert("Please enter both X and Y values.");
        return;
    }

    if (xData.length !== yData.length) {
        alert(`Data Mismatch: You have ${xData.length} X values and ${yData.length} Y values. Please ensure they have the same amount of data points.`);
        return;
    }

    document.getElementById('scatter-output').style.display = 'block';
    renderScatterChart(xData, yData);
}

function renderScatterChart(xData, yData) {
    const ctx = document.getElementById('scatterChart').getContext('2d');

    if (scatterChartInstance) {
        scatterChartInstance.destroy();
    }

    // Create Points
    const points = xData.map((x, i) => ({ x: x, y: yData[i] }));

    // Calculate Line of Best Fit
    const { m, b } = MathUtils.linearRegression(xData, yData);

    // Generate Line Points (Start and End of X range)
    const minX = Math.min(...xData);
    const maxX = Math.max(...xData);

    // Extend line slightly beyond data bounds for visuals
    const padding = (maxX - minX) * 0.1; // 10% padding
    const lineX1 = (minX - padding) || 0; // fallback to 0 if NaN/Infinite
    const lineX2 = (maxX + padding) || 10;

    const linePoints = [
        { x: lineX1, y: m * lineX1 + b },
        { x: lineX2, y: m * lineX2 + b }
    ];

    // Calculate Correlation for display
    const rVal = MathUtils.correlation(xData, yData);
    const r = rVal.toFixed(3);

    // Determine Strength and Direction
    const absR = Math.abs(rVal);
    let strength = "Weak";
    if (absR > 0.7) strength = "Strong";
    else if (absR > 0.3) strength = "Moderate";

    let direction = "No Correlation";
    if (rVal > 0) direction = "Positive";
    else if (rVal < 0) direction = "Negative";

    document.getElementById('scatter-stats').innerHTML =
        `<div>Correlation (r): ${r} (${strength} ${direction})</div>
         <div style="margin-top:5px;">Line of Best Fit: y = ${m.toFixed(2)}x + ${b.toFixed(2)}</div>`;

    // Render Chart
    scatterChartInstance = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Observed Data',
                    data: points,
                    backgroundColor: '#6C63FF',
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    type: 'line',
                    label: 'Line of Best Fit',
                    data: linePoints,
                    borderColor: '#F72585',
                    borderWidth: 2,
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `(${context.parsed.x}, ${context.parsed.y})`;
                        }
                    }
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: { display: true, text: 'X (Independent Variable)' }
                },
                y: {
                    title: { display: true, text: 'Y (Dependent Variable)' }
                }
            }
        }
    });
}

function randomizeScatterCtx(axis) {
    const data = MathUtils.generateData(10, 1, 50);
    document.getElementById(`scatter-${axis}`).value = data.join(', ');
}

function clearScatter() {
    document.getElementById('scatter-x').value = '';
    document.getElementById('scatter-y').value = '';
    document.getElementById('scatter-output').style.display = 'none';
    if (scatterChartInstance) scatterChartInstance.destroy();
}


// --- Helper Functions ---

// Parse comma/space separated string to number array
function parseInput(str) {
    return str.replace(/[,\s]+/g, ' ') // replace commas and multiple spaces with single space
        .trim()
        .split(' ')
        .map(Number)
        .filter(n => !isNaN(n));
}

function displayStats(data, setNum) {
    const sorted = [...data].sort((a, b) => a - b);
    const mean = MathUtils.mean(data).toFixed(2);
    const median = MathUtils.median(data);
    const mode = MathUtils.mode(data).join(', ');
    const range = MathUtils.range(data);
    const iqr = MathUtils.quartiles(data).iqr;
    const stdDev = MathUtils.stdDev(data).toFixed(2);
    const outliers = MathUtils.getOutliers(data).join(', ') || "None";

    const html = `
        <div class="stat-box">
            <span class="stat-label">Number Count</span>
            <span class="stat-value">${data.length}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">MEAN</span>
            <span class="stat-value">${mean}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">MEDIAN</span>
            <span class="stat-value">${median}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">MODE</span>
            <span class="stat-value" style="font-size:1.2rem">${mode || "None"}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">RANGE</span>
            <span class="stat-value">${range}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">Standard Deviation</span>
            <span class="stat-value">${stdDev}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">IQR</span>
            <span class="stat-value">${iqr}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">OUTLIERS</span>
            <span class="stat-value" style="font-size:1rem; color:${outliers !== 'None' ? 'red' : 'green'}">${outliers}</span>
        </div>
    `;

    document.getElementById(`stats-grid-${setNum}`).innerHTML = html;
    document.getElementById(`stats-grid-${setNum}`).style.display = 'grid';
}
