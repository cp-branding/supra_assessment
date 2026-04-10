export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const {
    name, company, email,
    answer_1, answer_2, answer_3,
    score, einordnung, full_assessment,
    chat_history, source
  } = req.body;

  if (!name || !company || !answer_1 || !answer_2 || !answer_3) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const payload = {
    name,
    company,
    email: email || null,
    answer_1,
    answer_2,
    answer_3,
    score: typeof score === 'number' ? score : null,
    einordnung: einordnung || null,
    full_assessment: full_assessment || null,
    chat_history: chat_history || [],
    source: source || null,
    email_sent: false,
  };

  try {
    const r = await fetch(`${process.env.SUPABASE_URL}/rest/v1/assessment_leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const err = await r.text();
      return res.status(500).json({ error: 'DB error', detail: err });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'DB error', detail: err.message });
  }
}
