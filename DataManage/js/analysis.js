/**
 * Data Analysis Logic (Simplified)
 */

// Main Analysis Function
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
}

function randomizeData(setNum) {
    const data = MathUtils.generateData(15, 10, 100);
    document.getElementById(`data-input-${setNum}`).value = data.join(', ');
}

function clearAll() {
    document.getElementById('data-input-1').value = '';
    document.getElementById('results-area').style.display = 'none';
}
