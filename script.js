async function getAnswer() {
    const questionInput = document.getElementById('question');
    const question = questionInput.value.trim();
    const answerSection = document.getElementById('answer');

    if (question === "") {
        answerSection.innerHTML = "Please enter a question.";
        return;
    }

    answerSection.innerHTML = "Searching...";

    // Auto-correct suggestion based on a list of common words
    const suggestions = autoCorrect(question);
    if (suggestions.length > 0) {
        answerSection.innerHTML += `<br>Did you mean: <strong>${suggestions[0]}</strong>?`;
    }

    try {
        // DuckDuckGo Instant Answers API
        const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(question)}&format=json&pretty=1`;
        const response1 = await fetch(ddgUrl);
        const data1 = await response1.json();

        if (data1.AbstractText) {
            answerSection.innerHTML = data1.AbstractText;
            return;
        }

        // Wikipedia API for search
        const wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(question)}&limit=1&format=json&origin=*`;
        const response2 = await fetch(wikiUrl);
        const data2 = await response2.json();

        if (data2[1] && data2[1].length > 0) {
            answerSection.innerHTML = `Wikipedia says: ${data2[2][0]} <br><a href="${data2[3][0]}" target="_blank">Read more</a>`;
            return;
        }

        // OpenAI Free GPT-based API (example placeholder, replace with an actual free AI endpoint)
        const aiUrl = `https://api.example.com/answer?q=${encodeURIComponent(question)}`;
        const response3 = await fetch(aiUrl);
        const data3 = await response3.json();

        if (data3.answer) {
            answerSection.innerHTML = data3.answer;
            return;
        }

        answerSection.innerHTML = "Sorry, I couldn't find an answer.";
    } catch (error) {
        console.error("Error fetching the answer:", error);
        answerSection.innerHTML = "Sorry, something went wrong. Please try again.";
    }
}

// Simple auto-correct function using Levenshtein distance
function autoCorrect(input) {
    const commonWords = ["javascript", "react", "nodejs", "html", "css", "api", "question", "answer", "fetch", "search"];
    const threshold = 2;
    const suggestions = commonWords
        .map(word => ({ word, distance: levenshteinDistance(input.toLowerCase(), word) }))
        .filter(item => item.distance <= threshold)
        .sort((a, b) => a.distance - b.distance)
        .map(item => item.word);
    return suggestions;
}

// Levenshtein distance function
function levenshteinDistance(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1      // deletion
                );
            }
        }
    }
    return matrix[b.length][a.length];
}
