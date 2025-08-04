document.addEventListener('DOMContentLoaded', () => {

    // ---
    // Element Selectors
    // ---
    const inputTextArea = document.getElementById('input-textarea');
    const outputArea = document.getElementById('output-area');
    const summarizeBtn = document.getElementById('summarize-btn');
    
    const temperatureSlider = document.getElementById('temperature-slider');
    const temperatureValue = document.getElementById('temperature-value');
    const temperatureLabel = document.getElementById('temperature-label');
    
    const costEstimate = document.getElementById('cost-estimate');
    const sessionTotalCost = document.getElementById('session-total-cost');
    const sessionSummaryCount = document.getElementById('session-summary-count');
    const clearSessionBtn = document.getElementById('clear-session-btn');
    
    const pasteBtn = document.getElementById('btn-paste');
    const uploadBtn = document.getElementById('btn-upload');
    const speakBtn = document.getElementById('btn-speak');
    
    const themeToggle = document.getElementById('theme-toggle');
    const themeMenu = document.getElementById('theme-menu');
    const currentThemeSpan = document.querySelector('.current-theme');
    const body = document.body;

    // ---
    // State Management
    // ---
    let sessionCost = 0;
    let summaryCount = 0;
    let isRecording = false;
    let recognition = null;
    
    // Load from localStorage
    function loadSession() {
        sessionCost = parseFloat(localStorage.getItem('sessionCost') || '0');
        summaryCount = parseInt(localStorage.getItem('summaryCount') || '0', 10);
        updateSessionDisplay();
    }

    function saveSession() {
        localStorage.setItem('sessionCost', sessionCost);
        localStorage.setItem('summaryCount', summaryCount);
    }

    function updateSessionDisplay() {
        sessionTotalCost.textContent = `$${sessionCost.toFixed(4)}`;
        sessionSummaryCount.textContent = summaryCount;
    }
    
    clearSessionBtn.addEventListener('click', () => {
        sessionCost = 0;
        summaryCount = 0;
        saveSession();
        updateSessionDisplay();
    });

    // ---
    // Event Listeners & UI Logic
    // ---

    // Temperature Slider
    const creativityLabels = [
        "Factual", "Very Precise", "Precise", "Balanced-", "Balanced", 
        "Balanced+", "Creative-", "Creative", "Very Creative", "Imaginative", "Visionary"
    ];
    temperatureSlider.addEventListener('input', () => {
        const tempValue = parseInt(temperatureSlider.value, 10);
        temperatureValue.textContent = tempValue;
        temperatureLabel.textContent = creativityLabels[tempValue];
        updateCostEstimate();
    });

    // Text Input for Cost Estimation
    inputTextArea.addEventListener('input', updateCostEstimate);

    // Summarize Button
    summarizeBtn.addEventListener('click', handleSummarize);

    // Input Actions
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            inputTextArea.value += text;
        } catch (err) {
            console.error('Failed to read clipboard contents: ', err);
            alert('Failed to paste text. Please check your browser permissions.');
        }
    });

    uploadBtn.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.txt,.md,.pdf';
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                inputTextArea.value = e.target.result;
            };
            reader.readAsText(file);
        };
        fileInput.click();
    });

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onstart = () => {
            isRecording = true;
            speakBtn.classList.add('recording');
            speakBtn.querySelector('span').textContent = 'Stop';
        };

        recognition.onresult = (event) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            inputTextArea.value += finalTranscript;
        };

        recognition.onend = () => {
            isRecording = false;
            speakBtn.classList.remove('recording');
            speakBtn.querySelector('span').textContent = 'Speak';
        };
        
        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            recognition.onend(); // Reset button state
        };

    }

    speakBtn.addEventListener('click', () => {
        if (!recognition) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }
        if (isRecording) {
            recognition.stop();
        } else {
            recognition.start();
        }
    });
    
    // Theme Selector
    themeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('show');
    });

    document.addEventListener('click', () => {
        themeMenu.classList.remove('show');
    });

    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', () => {
            const theme = option.dataset.theme;
            body.setAttribute('data-theme', theme);
            currentThemeSpan.textContent = option.querySelector('.theme-name').textContent;
            localStorage.setItem('selectedTheme', theme);
        });
    });

    // Load saved theme
    const savedTheme = localStorage.getItem('selectedTheme') || 'retro';
    body.setAttribute('data-theme', savedTheme);
    const savedOption = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
    if (savedOption) {
        currentThemeSpan.textContent = savedOption.querySelector('.theme-name').textContent;
    }


    // ---
    // Core Functions
    // ---

    // Cost Estimation
    function updateCostEstimate() {
        const text = inputTextArea.value;
        const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const totalCost = calculateCost(wordCount);
        costEstimate.textContent = `$${totalCost.toFixed(4)}`;
    }

    function calculateCost(wordCount) {
        const inputTokens = Math.ceil(wordCount * 1.33); // 1 word is approx 1.33 tokens
        const outputTokens = Math.floor(inputTokens * 0.3); // Assume summary is 30% of input
        const inputCost = (inputTokens / 1000) * 0.0015; // GPT-3.5-turbo pricing
        const outputCost = (outputTokens / 1000) * 0.002;
        return inputCost + outputCost;
    }

    // System Prompt for Creativity
    function getSystemPrompt(temperature) {
        if (temperature <= 1) return "You are a factual summarizer. Extract key facts and data points. Use bullet points.";
        if (temperature <= 3) return "You are a professional summarizer. Provide a clear, concise summary suitable for a business report.";
        if (temperature <= 5) return "You are a balanced summarizer. Provide an easy-to-read, engaging summary.";
        if (temperature <= 7) return "You are a creative summarizer. Use vivid language and perhaps a metaphor to make the summary interesting.";
        return "You are a visionary storyteller. Transform the text into a compelling narrative or a bold, forward-looking statement.";
    }

    // API Call to Vercel Function
    async function handleSummarize() {
        const textToSummarize = inputTextArea.value;
        if (!textToSummarize.trim()) {
            alert('Please enter some text to summarize.');
            return;
        }

        summarizeBtn.disabled = true;
        summarizeBtn.innerHTML = 'ANALYZING...';
        outputArea.innerHTML = '<p class="placeholder">Generating your summary...</p>';

        const temperature = parseInt(temperatureSlider.value, 10);
        const systemPrompt = getSystemPrompt(temperature);
        
        try {
            const response = await fetch('/api/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: textToSummarize,
                    temperature: temperature / 10, // Scale to 0-1 range for API
                    systemPrompt: systemPrompt
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An unknown API error occurred.');
            }

            const data = await response.json();
            outputArea.textContent = data.summary;

            // Update session
            const cost = calculateCost(textToSummarize.trim().split(/\s+/).length);
            sessionCost += cost;
            summaryCount++;
            saveSession();
            updateSessionDisplay();

        } catch (error) {
            outputArea.innerHTML = `<p class="error">Sorry, an error occurred: ${error.message}</p>`;
        } finally {
            summarizeBtn.disabled = false;
            summarizeBtn.innerHTML = '🚀 SUMMARIZE TEXT';
        }
    }
    
    // Initial Load
    loadSession();
    updateCostEstimate();
});
