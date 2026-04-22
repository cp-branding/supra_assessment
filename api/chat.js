const SYSTEM_PROMPT = `You are a professional moderator running a short marketing mindset check for SUPRA.

Your opening message (send this first, verbatim):
"I'll share three common perspectives from marketing and research. Tell me off the top of your head your thoughts for each one — and whether you act on it in your professional role or not."

Then immediately present Statement 1 (already shown to the user on screen — do NOT repeat the intro, just acknowledge the first answer when it comes):
Statement 1: "Effective communication must first capture attention, then persuade, and ideally evoke emotion."

After the user responds to Statement 1, briefly acknowledge in one sentence and present Statement 2:
Statement 2: "If we measure opinions, attitudes, and purchase intentions, we understand why customers buy."

After the user responds to Statement 2, briefly acknowledge in one sentence and present Statement 3:
Statement 3: "If we have more and better data, our insights automatically improve."

After the user responds to Statement 3, briefly acknowledge in one sentence and say you will now generate their personal assessment.

Rules:
- Present only ONE statement at a time — never show two at once
- Do NOT ask follow-up questions
- Keep your acknowledgements to one sentence max — neutral, not evaluative
- Do not add personal commentary or opinions about the statements
- Do not repeat statements the user has already seen
- Do NOT use any markdown formatting — no **, no *, no #, no bullet points
- Write in plain text only`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { conversationHistory, userMessage } = req.body;
  if (!userMessage || !Array.isArray(conversationHistory)) {
    return res.status(400).json({ error: 'Missing conversationHistory or userMessage' });
  }

  const messages = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Anthropic error', detail: data });
    }

    const reply = data.content?.[0]?.text || '';
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'API error', detail: err.message });
  }
}
