/**
 * Study Notes Content & Application Logic
 */

const studyTopics = [
    {
        id: "central-tendency",
        title: "Central Tendency (Mean, Median, Mode)",
        content: `
            <p><strong>Central Tendency</strong> refers to the measure used to determine the "center" of a distribution of data. It describes a single value that identifies the central position within that set of data.</p>
            <ul style="margin: 10px 20px;">
                <li><strong>Mean (Average):</strong> The sum of all values divided by the number of values. Best for data without extreme outliers.</li>
                <li><strong>Median:</strong> The middle value when data is ordered from least to greatest. Best when outliers are present.</li>
                <li><strong>Mode:</strong> The value that appears most frequently. Useful for categorical data.</li>
            </ul>
        `,
        quiz: {
            question: "Which measure of central tendency is LEAST affected by extreme outliers?",
            options: ["Mean", "Median", "Mode", "Range"],
            correct: 1, // Index of correct answer
            explanation: "The **Median** is resistant to outliers because it only cares about the middle position, whereas the Mean pulls toward large values."
        }
    },
    {
        id: "data-spread",
        title: "Measures of Spread (Range, IQR, Standard Deviation)",
        content: `
            <p><strong>Measures of Spread</strong> describe how similar or varied the set of observed values are for a particular variable.</p>
            <ul style="margin: 10px 20px;">
                <li><strong>Range:</strong> The difference between the highest and lowest values (Max - Min). Simple but sensitive to outliers.</li>
                <li><strong>Interquartile Range (IQR):</strong> The range of the middle 50% of the data (Q3 - Q1). It shows the spread of the central bulk of data.</li>
                <li><strong>Standard Deviation:</strong> A measure of the amount of variation or dispersion of a set of values. A low standard deviation indicates that the values tend to be close to the mean.</li>
            </ul>
        `,
        quiz: {
            question: "If a dataset has a Standard Deviation of 0, what does that mean?",
            options: ["The data is completely random", "The mean is 0", "All data points are the same", "There is no mode"],
            correct: 2,
            explanation: "If Standard Deviation is 0, there is NO spread. This only happens if every single number in the dataset is identical."
        }
    },
    {
        id: "visualizations",
        title: "Data Visualizations",
        content: `
            <p>Visualizing data helps us see patterns, trends, and outliers.</p>
            <ul style="margin: 10px 20px;">
                <li><strong>Histogram:</strong> A bar graph-like representation of data that groups a range of outcome into columns. Good for showing frequency distribution.</li>
                <li><strong>Box Plot (Box-and-Whisker):</strong> Displays the five-number summary: minimum, first quartile, median, third quartile, and maximum. Excellent for spotting outliers.</li>
                <li><strong>Scatter Plot:</strong> Uses dots to represent values for two different numeric variables. Used to observe relationships (correlations) between variables.</li>
            </ul>
        `,
        quiz: {
            question: "Which chart is BEST for seeing the 5-number summary (Min, Q1, Median, Q3, Max)?",
            options: ["Histogram", "Scatter Plot", "Box Plot", "Pie Chart"],
            correct: 2,
            explanation: "A **Box Plot** is specifically designed to visualize the quartiles, median, and range/outliers of a dataset."
        }
    },
    {
        id: "correlation",
        title: "Correlation & Line of Best Fit",
        content: `
            <p><strong>Correlation</strong> describes the relationship between two variables.</p>
            <ul style="margin: 10px 20px;">
                <li><strong>Positive Correlation:</strong> As X increases, Y increases.</li>
                <li><strong>Negative Correlation:</strong> As X increases, Y decreases.</li>
                <li><strong>No Correlation:</strong> No apparent relationship between X and Y.</li>
            </ul>
            <p>The <strong>Line of Best Fit</strong> (Regression Line) is a straight line that best minimizes the distance between itself and the data points, often used for prediction.</p>
        `,
        quiz: {
            question: "A correlation coefficient (r) of -0.9 indicates...",
            options: ["A strong positive relationship", "A weak negative relationship", "A strong negative relationship", "No relationship"],
            correct: 2,
            explanation: "Correlation coefficients range from -1 to 1. Values close to -1 indicate a **strong negative** relationship."
        }
    }
];

function initStudySection() {
    const container = document.getElementById('topics-container');

    studyTopics.forEach((topic, index) => {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.id = `topic-${index}`;

        card.innerHTML = `
            <div class="topic-header" onclick="toggleTopic(${index})">
                <h3>${topic.title}</h3>
                <span class="toggle-icon">+</span>
            </div>
            <div class="topic-content">
                ${topic.content}
                
                <div class="quiz-container">
                    <h4>Mini Quiz</h4>
                    <p class="question">${topic.quiz.question}</p>
                    <div class="quiz-options" id="quiz-options-${index}">
                        ${topic.quiz.options.map((opt, i) =>
            `<button onclick="checkAnswer(${index}, ${i})">${opt}</button>`
        ).join('')}
                    </div>
                    <div id="quiz-feedback-${index}" style="margin-top:10px; display:none; padding:10px; border-radius:8px;"></div>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function toggleTopic(index) {
    const card = document.getElementById(`topic-${index}`);
    const isOpen = card.classList.contains('open');
    const icon = card.querySelector('.toggle-icon');

    // Close others (optional - for accordion effect)
    // document.querySelectorAll('.topic-card').forEach(c => { c.classList.remove('open'); c.querySelector('.toggle-icon').textContent = '+'; });

    if (!isOpen) {
        card.classList.add('open');
        icon.textContent = '−'; // Minus sign
    } else {
        card.classList.remove('open');
        icon.textContent = '+';
    }
}

function checkAnswer(topicIndex, optionIndex) {
    const topic = studyTopics[topicIndex];
    const feedbackDiv = document.getElementById(`quiz-feedback-${topicIndex}`);
    const buttons = document.querySelectorAll(`#quiz-options-${topicIndex} button`);

    // Disable all buttons
    buttons.forEach(btn => btn.disabled = true);

    if (optionIndex === topic.quiz.correct) {
        buttons[optionIndex].classList.add('correct');
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.background = '#d4edda';
        feedbackDiv.style.color = '#155724';
        feedbackDiv.innerHTML = `<strong>Correct!</strong> ${topic.quiz.explanation}`;
    } else {
        buttons[optionIndex].classList.add('incorrect');
        buttons[topic.quiz.correct].classList.add('correct'); // Show correct one
        feedbackDiv.style.display = 'block';
        feedbackDiv.style.background = '#f8d7da';
        feedbackDiv.style.color = '#721c24';
        feedbackDiv.innerHTML = `<strong>Incorrect.</strong> ${topic.quiz.explanation}`;
    }
}
