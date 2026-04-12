// NOTE: Set ANTHROPIC_API_KEY in Railway frontend environment variables

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    return res.status(400).json({ error: 'טקסט ריק' });
  }
  if (text.length > 1000) {
    return res.status(400).json({ error: 'הטקסט ארוך מדי (מקסימום 1000 תווים)' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY לא מוגדר' });
  }

  const currentYear = new Date().getFullYear();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        system: 'Return only valid JSON. No markdown, no explanations.',
        messages: [
          {
            role: 'user',
            content: `Parse the following Hebrew appointment text and return a JSON object with these fields:
- customer_name (string): the customer's full name
- service_name (string): the service/treatment name
- date (string): date in YYYY-MM-DD format, current year is ${currentYear}
- time (string): time in HH:MM 24-hour format
- price (number): total price as a number, or 0 if not mentioned
- deposit (number): deposit/advance payment as a number, or 0 if not mentioned

Examples of input formats:
"אתל חיים, לק גל, בשעה 12 בתאריך ה16 למאי"
"שרה כהן, הרמת ריסים, 20/5 ב-14:30, 200₪"
"רחל לוי - עיצוב גבות - יום שלישי ה-3 ליוני בשעה 10"

Text to parse:
${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Anthropic API error:', response.status, errBody);
      return res.status(500).json({ error: 'שגיאה בקריאה ל-AI' });
    }

    const data = await response.json();
    const content = data?.content?.[0]?.text;

    if (!content) {
      return res.status(500).json({ error: 'תגובה ריקה מה-AI' });
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON from the content in case there's any surrounding text
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return res.status(400).json({ error: 'לא ניתן לפרסר את הטקסט' });
      }
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('parse-appointment error:', err);
    return res.status(500).json({ error: 'שגיאת שרת' });
  }
}
