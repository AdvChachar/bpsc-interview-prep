const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  if (!MISTRAL_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'MISTRAL_API_KEY not configured' }) };
  }

  try {
    const { system, user, maxTokens } = JSON.parse(event.body);

    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + MISTRAL_API_KEY
      },
      body: JSON.stringify({
        model: 'mistral-large-latest',
        max_tokens: maxTokens || 1200,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ]
      })
    });

    const data = await res.json();
    const content = (data.choices && data.choices[0] && data.choices[0].message)
      ? data.choices[0].message.content
      : '';

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
