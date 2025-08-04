// Securely load the API key from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

exports.handler = async (event) => {
    // 1. We only accept POST requests
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // 2. Parse the incoming text from the frontend
        const { text, temperature = 0.3, systemPrompt = "You are a helpful assistant that summarizes text. Provide concise, accurate summaries." } = JSON.parse(event.body);

        // 3. Basic validation
        if (!text || text.trim().length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Please provide text to summarize.' }),
            };
        }
        
        // Check if API key is available
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' }),
            };
        }
        
        try {
            // Call OpenAI API
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: systemPrompt
                        },
                        {
                            role: 'user',
                            content: `Please summarize this text: ${text}`
                        }
                    ],
                    max_tokens: 500,
                    temperature: temperature
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
            }
            
            const data = await response.json();
            const summary = data.choices[0].message.content;
            
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ summary }),
            };
        } catch (error) {
            console.error('OpenAI API error:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: `Failed to summarize: ${error.message}` }),
            };
        }

    } catch (error) {
        console.error('Error in serverless function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'An internal server error occurred.' }),
        };
    }
}; 