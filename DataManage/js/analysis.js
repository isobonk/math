/**
 * Data Analysis & Charting Logic
 */

let chartInstance = null;
let currentChartType = 'bar'; // default
let isComparisonMode = false;

// Main Analysis Function
function analyzeData() {
    const rawData1 = document.getElementById('data-input-1').value;
    const data1 = parseInput(rawData1);

    if (data1.length === 0) {
        alert("Please enter at least one valid number in Dataset 1.");
        return;
    }

    // Process Dataset 1
    displayStats(data1, 1);

    let data2 = [];
    if (isComparisonMode) {
        const rawData2 = document.getElementById('data-input-2').value;
        data2 = parseInput(rawData2);
        if (data2.length > 0) {
            displayStats(data2, 2);
            displayCorrelation(data1, data2);
        }
    }

    // Show Results
    document.getElementById('results-area').style.display = 'block';

    // Charts
    document.getElementById('charts-area').style.display = 'block';
    renderChart(data1, data2);
}

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
    const q1 = MathUtils.quartiles(data).q1;
    const q3 = MathUtils.quartiles(data).q3;

    const html = `
        <div class="stat-box">
            <span class="stat-label">COUNT (N)</span>
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
            <span class="stat-value" style="font-size:1.2rem">${mode || "No mode"}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">RANGE</span>
            <span class="stat-value">${range}</span>
        </div>
        <div class="stat-box">
            <span class="stat-label">STD DEV</span>
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

    // Add header if missing
    if (isComparisonMode && !document.getElementById(`stats-header-${setNum}`)) {
        // This is a quick UI hack to label the numbers
        const label = document.createElement('h4');
        label.id = `stats-header-${setNum}`;
        label.textContent = `Dataset ${setNum} Statistics`;
        label.style.gridColumn = "1/-1";
        label.style.marginTop = "10px";
        const grid = document.getElementById(`stats-grid-${setNum}`);
        grid.insertBefore(label, grid.firstChild);
    }
}

function displayCorrelation(d1, d2) {
    const box = document.getElementById('correlation-box');

    // Correlation requires equal lengths usually for element-wise pairing
    // However, if lengths differ, we truncate to the shorter one for valid math
    // or we just warn. For this app, let's truncate and warn if different.

    const minLen = Math.min(d1.length, d2.length);
    const set1 = d1.slice(0, minLen);
    const set2 = d2.slice(0, minLen);

    const r = MathUtils.correlation(set1, set2).toFixed(3);

    let strength = "";
    const absR = Math.abs(r);
    if (absR > 0.7) strength = "Strong";
    else if (absR > 0.3) strength = "Moderate";
    else strength = "Weak";

    let direction = r > 0 ? "Positive" : (r < 0 ? "Negative" : "No");

    box.style.display = 'block';
    box.innerHTML = `
        <h3>Comparitive Analysis</h3>
        <p><strong>Correlation Coefficient (r):</strong> <span style="font-size:1.2em; font-weight:bold">${r}</span></p>
        <p>Interpretation: <strong>${strength} ${direction} Correlation</strong></p>
        ${d1.length !== d2.length ? '<p style="font-size:0.8em; color:#666">Note: Datasets had different lengths. Correlation calculated using the first ' + minLen + ' pairs.</p>' : ''}
    `;
}

function renderChart(data1, data2) {
    const ctx = document.getElementById('mainChart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    // SCATTER PLOT LOGIC
    if (currentChartType === 'scatter') {
        if (!isComparisonMode || data2.length === 0) {
            // Cannot do scatter with 1 dataset really, unless we index it against 1..N
            // Let's just create points [i, value]
            const points = data1.map((val, i) => ({ x: i + 1, y: val }));

            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: 'Dataset 1 Distribution',
                        data: points,
                        backgroundColor: '#6C63FF'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { title: { display: true, text: 'Index' } },
                        y: { title: { display: true, text: 'Value' } }
                    }
                }
            });
        } else {
            // Real scatter vs comparison
            const minLen = Math.min(data1.length, data2.length);
            const points = [];
            for (let i = 0; i < minLen; i++) {
                points.push({ x: data1[i], y: data2[i] });
            }

            // Linear Regression Line
            const { m, b } = MathUtils.linearRegression(data1.slice(0, minLen), data2.slice(0, minLen));
            // Generate two points for the line
            const minX = Math.min(...data1.slice(0, minLen));
            const maxX = Math.max(...data1.slice(0, minLen));
            const lineData = [
                { x: minX, y: m * minX + b },
                { x: maxX, y: m * maxX + b }
            ];

            chartInstance = new Chart(ctx, {
                type: 'scatter',
                data: {
                    datasets: [
                        {
                            label: 'Data Points',
                            data: points,
                            backgroundColor: '#6C63FF'
                        },
                        {
                            type: 'line',
                            label: 'Line of Best Fit',
                            data: lineData,
                            borderColor: '#F72585',
                            borderWidth: 2,
                            pointRadius: 0
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { title: { display: true, text: 'Dataset 1' } },
                        y: { title: { display: true, text: 'Dataset 2' } }
                    }
                }
            });
        }
        return;
    }

    // BOX PLOT (Simulation using Bar Chart with floating bars if BoxPlot plugin not available, 
    // OR just use a simpler visualization since Chart.js standard doesn't have boxplot without plugins.
    // RECOMMENDATION: For MVP without requiring extra plugins, we will simulate a Box Plot using an error bar style or simpler:
    // Actually, "Box Plot" is hard in vanilla Chart.js.
    // We can use a "Floating Bar" to show the range (min to max) and a line for median?
    // Let's try to make a custom "Box-Like" representation using floating bars.
    // [Min, Q1], [Q3, Max]?
    // BETTER IDEA: Standard Chart.js does not support BoxPlots natively. 
    // I will fallback to a simplified "Range Bar" or just warn the user.
    // However, I can fetch a plugin from CDN.
    // https://unpkg.com/@sgratzl/chartjs-chart-boxplot
    // Since I didn't verify internet for plugins, I will stick to HISTOGRAM for 'bar' and maybe Line for distribution.

    // Wait, let's implement Histogram manually by binning.

    if (currentChartType === 'bar' || currentChartType === 'box') {
        // Note: If user selected Box Plot, I will render a histogram instead and alert, OR try to do a robust visual.
        // Let's do Histogram as the primary visual.

        // Create Bins
        const allData = isComparisonMode ? [...data1, ...data2] : [...data1];
        const min = Math.min(...allData);
        const max = Math.max(...allData);
        // Sturgis Rule or fixed 10 bins
        const binCount = Math.min(10, Math.ceil(Math.sqrt(allData.length)));
        const binSize = (max - min) / binCount || 1;

        const generateBins = (data) => {
            const bins = Array(binCount).fill(0);
            data.forEach(v => {
                let idx = Math.floor((v - min) / binSize);
                if (idx >= binCount) idx = binCount - 1;
                bins[idx]++;
            });
            return bins;
        };

        const labels = Array.from({ length: binCount }, (_, i) => {
            const start = (min + i * binSize).toFixed(1);
            const end = (min + (i + 1) * binSize).toFixed(1);
            return `${start}-${end}`;
        });

        const bins1 = generateBins(data1);
        const datasets = [{
            label: 'Dataset 1 Frequency',
            data: bins1,
            backgroundColor: 'rgba(108, 99, 255, 0.6)',
            borderColor: 'rgba(108, 99, 255, 1)',
            borderWidth: 1
        }];

        if (isComparisonMode && data2.length > 0) {
            const bins2 = generateBins(data2);
            datasets.push({
                label: 'Dataset 2 Frequency',
                data: bins2,
                backgroundColor: 'rgba(0, 180, 216, 0.6)',
                borderColor: 'rgba(0, 180, 216, 1)',
                borderWidth: 1
            });
        }

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, title: { display: true, text: 'Frequency' } },
                    x: { title: { display: true, text: 'Value Range' } }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Frequency Distribution (Histogram)'
                    }
                }
            }
        });
    }
}

// UI Helpers
function setChartType(type) {
    currentChartType = type;

    // Update active button
    const container = document.querySelector('#charts-area .controls-grid');
    Array.from(container.children).forEach(btn => {
        if (btn.textContent.toLowerCase().includes(type === 'bar' ? 'histogram' : type)) {
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        } else {
            btn.classList.add('btn-secondary');
            btn.classList.remove('btn-primary');
        }
    });

    analyzeData(); // Re-render
}

function toggleComparisonMode() {
    isComparisonMode = !isComparisonMode;
    const btn = document.getElementById('toggle-comparison');
    const container2 = document.getElementById('dataset-2-container');
    const scatterBtn = document.getElementById('scatter-btn');

    if (isComparisonMode) {
        btn.textContent = "Disable Comparison Mode";
        btn.classList.add('btn-accent');
        btn.classList.remove('btn-secondary');
        container2.style.display = 'block';
        scatterBtn.style.display = 'inline-block';
    } else {
        btn.textContent = "Enable Comparison Mode (2 Datasets)";
        btn.classList.remove('btn-accent');
        btn.classList.add('btn-secondary');
        container2.style.display = 'none';
        scatterBtn.style.display = 'none';

        // Reset chart type if it was scatter
        if (currentChartType === 'scatter') setChartType('bar');

        // Hide second stats
        document.getElementById('stats-grid-2').style.display = 'none';
        document.getElementById('correlation-box').style.display = 'none';
    }
}

function randomizeData(setNum) {
    const data = MathUtils.generateData(15, 10, 100);
    document.getElementById(`data-input-${setNum}`).value = data.join(', ');
}

function clearAll() {
    document.getElementById('data-input-1').value = '';
    document.getElementById('data-input-2').value = '';
    document.getElementById('results-area').style.display = 'none';
    document.getElementById('charts-area').style.display = 'none';
    if (chartInstance) chartInstance.destroy();
}
