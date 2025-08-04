// Securely load the API key from environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export default async function handler(req, res) {
    // 1. We only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 2. Parse the incoming text from the frontend
        const { text, temperature = 0.3, systemPrompt = "You are a helpful assistant that summarizes text. Provide concise, accurate summaries." } = req.body;

        // 3. Basic validation
        if (!text || text.trim().length === 0) {
            return res.status(400).json({ error: 'Please provide text to summarize.' });
        }
        
        // Check if API key is available
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.' });
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
            
            return res.status(200).json({ summary });
        } catch (error) {
            console.error('OpenAI API error:', error);
            return res.status(500).json({ error: `Failed to summarize: ${error.message}` });
        }

    } catch (error) {
        console.error('Error in serverless function:', error);
        return res.status(500).json({ error: 'An internal server error occurred.' });
    }
} 