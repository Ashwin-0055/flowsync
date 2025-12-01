/**
 * Call Perplexity API with system instruction and user prompt
 * @param {string} systemInstruction - The system instruction for the AI
 * @param {string} userPrompt - The user's prompt/query
 * @returns {Promise<string>} - The AI's response
 */
export async function llmApiCall(systemInstruction, userPrompt) {
    const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;

    if (!apiKey || apiKey.trim() === '') {
        throw new Error('Perplexity API key not configured. Please add VITE_PERPLEXITY_API_KEY to your .env.local file.');
    }

    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [
                    {
                        role: 'system',
                        content: systemInstruction
                    },
                    {
                        role: 'user',
                        content: userPrompt
                    }
                ],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Perplexity API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();

        if (!data.choices || !data.choices[0]?.message?.content) {
            throw new Error('Invalid response format from Perplexity API');
        }

        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('LLM API Call Error:', error);
        throw error;
    }
}
