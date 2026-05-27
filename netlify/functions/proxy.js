const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!GEMINI_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'GEMINI_API_KEY not configured' }) };
  }

  try {
    const { system, user, maxTokens } = JSON.parse(event.body);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: system + '\n\n' + user }
          ]
        }],
        generationConfig: {
          maxOutputTokens: maxTokens || 1200,
          temperature: 0.7
        }
      })
    });

    const data = await res.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
