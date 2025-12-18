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

// --- PART 3: Box and Whiskers Plot ---

function generateBoxPlot() {
    const rawData = document.getElementById('box-input').value;
    const data = parseInput(rawData);

    if (data.length < 5) {
        alert("Please enter at least 5 numbers to generate a meaningful Box Plot.");
        return;
    }

    const sorted = [...data].sort((a, b) => a - b);
    const { q1, q3, iqr } = MathUtils.quartiles(sorted);
    const median = MathUtils.median(sorted);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const outliers = MathUtils.getOutliers(data);

    // Display Stats
    const statsHtml = `
        <div class="stat-box"><span class="stat-label">Minimum</span><span class="stat-value">${min}</span></div>
        <div class="stat-box"><span class="stat-label">Q1</span><span class="stat-value">${q1}</span></div>
        <div class="stat-box"><span class="stat-label">Median</span><span class="stat-value">${median}</span></div>
        <div class="stat-box"><span class="stat-label">Q3</span><span class="stat-value">${q3}</span></div>
        <div class="stat-box"><span class="stat-label">Maximum</span><span class="stat-value">${max}</span></div>
        <div class="stat-box"><span class="stat-label">IQR</span><span class="stat-value">${iqr}</span></div>
        <div class="stat-box"><span class="stat-label">Outliers</span><span class="stat-value" style="color:${outliers.length ? 'red' : 'green'}">${outliers.join(', ') || 'None'}</span></div>
    `;

    document.getElementById('box-stats').innerHTML = statsHtml;
    document.getElementById('box-output').style.display = 'block';

    drawBoxPlot(sorted, q1, median, q3, min, max, outliers);
}

function randomizeBoxData() {
    const data = MathUtils.generateData(15, 1, 100);
    // Add deliberate outliers for demonstration sometimes
    if (Math.random() > 0.5) data.push(120, 130);
    document.getElementById('box-input').value = data.join(', ');
}

function clearBoxPlot() {
    document.getElementById('box-input').value = '';
    document.getElementById('box-output').style.display = 'none';
}

function drawBoxPlot(data, q1, median, q3, min, max, outliers) {
    const canvas = document.getElementById('boxChart');
    const ctx = canvas.getContext('2d');

    // Adjust canvas resolution
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    // Margins and Scale
    const padding = 40;
    const plotWidth = width - (padding * 2);
    const dataMin = Math.min(min, ...outliers); // Include outliers in scale
    const dataMax = Math.max(max, ...outliers);
    const range = dataMax - dataMin || 1; // avoid div 0

    const mapX = (val) => padding + ((val - dataMin) / range) * plotWidth;
    const yCenter = height / 2;
    const boxHeight = 60;

    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#6C63FF';
    ctx.font = '12px Inter';
    ctx.textAlign = 'center';

    // 1. Draw Range Line (Whisker to Whisker)
    // Theoretically whiskers go to min/max excluding outliers, but often simplified to min/max. 
    // Let's stick to using the 'min' and 'max' passed (which usually implies range of non-outliers if calculated strictly, 
    // but here we passed simple sorted min/max. 
    // Let's refine: The 'min'/'max' displayed are usually ALL data. 
    // Standard Box plot: Whiskers go to largest/smallest value within 1.5 IQR. 
    // Logic: calculate true whisker bounds.

    const iqr = q3 - q1;
    const lowerFence = q1 - 1.5 * iqr;
    const upperFence = q3 + 1.5 * iqr;

    // Find actual values inside fences
    const insideValues = data.filter(d => d >= lowerFence && d <= upperFence);
    const whiskerMin = insideValues[0];
    const whiskerMax = insideValues[insideValues.length - 1];

    // Draw Line from Whisker Min to Whisker Max
    ctx.beginPath();
    ctx.moveTo(mapX(whiskerMin), yCenter);
    ctx.lineTo(mapX(whiskerMax), yCenter);
    ctx.stroke();

    // 2. Draw Box (Q1 to Q3)
    ctx.fillStyle = 'rgba(108, 99, 255, 0.2)';
    ctx.fillRect(mapX(q1), yCenter - boxHeight / 2, mapX(q3) - mapX(q1), boxHeight);
    ctx.strokeRect(mapX(q1), yCenter - boxHeight / 2, mapX(q3) - mapX(q1), boxHeight);

    // 3. Draw Median Line
    ctx.beginPath();
    ctx.moveTo(mapX(median), yCenter - boxHeight / 2);
    ctx.lineTo(mapX(median), yCenter + boxHeight / 2);
    ctx.stroke();

    // 4. Draw Whisker Caps
    ctx.beginPath();
    ctx.moveTo(mapX(whiskerMin), yCenter - 10);
    ctx.lineTo(mapX(whiskerMin), yCenter + 10);
    ctx.moveTo(mapX(whiskerMax), yCenter - 10);
    ctx.lineTo(mapX(whiskerMax), yCenter + 10);
    ctx.stroke();

    // 5. Draw Outliers
    ctx.fillStyle = '#F72585';
    outliers.forEach(out => {
        ctx.beginPath();
        ctx.arc(mapX(out), yCenter, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // 6. Draw Labels (Axis)
    ctx.fillStyle = '#333';

    // Helper to draw text if space allows (simple check)
    const labels = [
        { val: q1, text: "Q1", y: yCenter - 60 },
        { val: q3, text: "Q3", y: yCenter - 60 },
        { val: median, text: "Median", y: yCenter - 65 }
    ];

    labels.forEach(l => {
        ctx.fillText(l.text, mapX(l.val), l.y);
        ctx.fillText(l.val, mapX(l.val), l.y + 15);
    });

    // 7. Draw Number Line (Axis)
    const axisY = yCenter + 50; // Position below the box plot
    ctx.beginPath();
    ctx.moveTo(padding, axisY);
    ctx.lineTo(width - padding, axisY);
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Calculate nice ticks
    const roughStep = range / 10;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const normalizedStep = roughStep / magnitude;
    let step = magnitude;
    if (normalizedStep > 5) step *= 10;
    else if (normalizedStep > 2) step *= 5;
    else if (normalizedStep > 1) step *= 2;

    const startTick = Math.ceil(dataMin / step) * step;
    const endTick = Math.floor(dataMax / step) * step;

    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.font = '10px Inter';

    const drawTick = (val) => {
        const x = mapX(val);
        ctx.beginPath();
        ctx.moveTo(x, axisY);
        ctx.lineTo(x, axisY + 5);
        ctx.stroke();
        ctx.fillText(parseFloat(val.toPrecision(12)), x, axisY + 15);
    };

    // Always draw Min and Max on axis
    drawTick(dataMin);
    if (dataMax !== dataMin) drawTick(dataMax);

    // Draw intermediate nice ticks if they don't overlap with Min/Max
    const minX = mapX(dataMin);
    const maxX = mapX(dataMax);
    const overlapPadding = 20; // pixels to avoid text overlap

    for (let t = startTick; t <= endTick; t += step) {
        const x = mapX(t);
        // Check overlap with Min (start) and Max (end)
        if (x > minX + overlapPadding && x < maxX - overlapPadding) {
            drawTick(t);
        }
    }
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
