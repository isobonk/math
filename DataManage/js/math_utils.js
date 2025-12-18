/**
 * Math Utils for Data Management App
 * Contains core statistical calculations
 */

const MathUtils = {
    // Basic summation
    sum: (arr) => arr.reduce((a, b) => a + b, 0),

    // Mean (Average)
    mean: (arr) => {
        if (arr.length === 0) return 0;
        return MathUtils.sum(arr) / arr.length;
    },

    // Median (Middle value)
    median: (arr) => {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);

        if (sorted.length % 2 === 0) {
            return (sorted[mid - 1] + sorted[mid]) / 2;
        }
        return sorted[mid];
    },

    // Mode (Most frequent)
    mode: (arr) => {
        if (arr.length === 0) return [];
        const counts = {};
        let maxFreq = 0;

        arr.forEach(num => {
            counts[num] = (counts[num] || 0) + 1;
            if (counts[num] > maxFreq) maxFreq = counts[num];
        });

        if (maxFreq === 1) return [];

        return Object.keys(counts)
            .filter(num => counts[num] === maxFreq)
            .map(num => Number(num))
            .sort((a, b) => a - b);
    },

    // Range (Max - Min)
    range: (arr) => {
        if (arr.length === 0) return 0;
        return Math.max(...arr) - Math.min(...arr);
    },

    // Standard Deviation (Population)
    stdDev: (arr) => {
        if (arr.length === 0) return 0;
        const avg = MathUtils.mean(arr);
        const squareDiffs = arr.map(val => Math.pow(val - avg, 2));
        const avgSquareDiff = MathUtils.mean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    },

    // Quartiles & IQR
    quartiles: (arr) => {
        if (arr.length === 0) return { q1: 0, q3: 0, iqr: 0 };
        const sorted = [...arr].sort((a, b) => a - b);

        const median = (a) => {
            const mid = Math.floor(a.length / 2);
            if (a.length % 2 === 0) return (a[mid - 1] + a[mid]) / 2;
            return a[mid];
        };

        const mid = Math.floor(sorted.length / 2);
        const lowerHalf = sorted.length % 2 === 0 ? sorted.slice(0, mid) : sorted.slice(0, mid);
        const upperHalf = sorted.length % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);

        const q1 = median(lowerHalf);
        const q3 = median(upperHalf);
        const iqr = q3 - q1;

        return { q1, q3, iqr };
    },

    // Pearson Correlation Coefficient
    correlation: (x, y) => {
        if (x.length !== y.length || x.length === 0) return 0;

        const n = x.length;
        const meanX = MathUtils.mean(x);
        const meanY = MathUtils.mean(y);

        let numerator = 0;
        let denomX = 0;
        let denomY = 0;

        for (let i = 0; i < n; i++) {
            const dx = x[i] - meanX;
            const dy = y[i] - meanY;
            numerator += dx * dy;
            denomX += dx * dx;
            denomY += dy * dy;
        }

        if (denomX === 0 || denomY === 0) return 0; // Avoid division by zero
        return numerator / Math.sqrt(denomX * denomY);
    },

    // Generate Line of Best Fit (y = mx + b)
    linearRegression: (x, y) => {
        if (x.length !== y.length || x.length === 0) return { m: 0, b: 0 };

        const n = x.length;
        const sumX = MathUtils.sum(x);
        const sumY = MathUtils.sum(y);
        const sumXY = x.reduce((acc, curr, i) => acc + curr * y[i], 0);
        const sumXX = x.reduce((acc, curr) => acc + curr * curr, 0);

        const m = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const b = (sumY - m * sumX) / n;

        return { m, b };
    },

    // Identify Outliers (1.5 * IQR rule)
    getOutliers: (arr) => {
        const { q1, q3, iqr } = MathUtils.quartiles(arr);
        const lowerBound = q1 - 1.5 * iqr;
        const upperBound = q3 + 1.5 * iqr;
        return arr.filter(num => num < lowerBound || num > upperBound);
    },

    // Generate Random Data
    generateData: (count = 10, min = 1, max = 100) => {
        return Array.from({ length: count }, () => Math.floor(Math.random() * (max - min + 1)) + min);
    }
};
