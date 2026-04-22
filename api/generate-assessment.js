const ASSESSMENT_PROMPT_TEMPLATE = `You are a strategic research and marketing expert with deep understanding of implicit decision-making, buying behavior, market research, causality, neuroscience, and brand strategy.

Your task:
Evaluate three open answers from a prospect to three statements. Create a short, sharp assessment, assign a score, and end with a clear invitation to explore the topic further.

Goal of the assessment:
- Make visible whether the person is still thinking in classical patterns
- Show how much potential there is for Deep Implicit Research
- Reflect the prospect intelligently, not condescendingly
- Create interest in the talk, charts, book, and follow-up

Context:
The three statements test whether the prospect thinks more classically or is already further ahead in these areas:
1. AIDA / attention-first / persuasion models
2. Explicit market research / opinions / stated purchase intentions
3. Data volume vs. depth of insight

The three statements were:
1. "Effective communication must first capture attention, then persuade, and ideally evoke emotion."
2. "If we measure opinions, attitudes, and purchase intentions, we understand why customers buy."
3. "If we have more and better data, our insights automatically improve."

Input:
Answer to statement 1: {{answer_1}}
Answer to statement 2: {{answer_2}}
Answer to statement 3: {{answer_3}}

Evaluate the answers along these dimensions:
- How strongly is the person still thinking in an AIDA / attention-first model?
- How strongly do they equate explicit stated opinions with actual explanation of buying behavior?
- How strongly do they confuse more/better data with better insights?
- How reflective, nuanced, and open are they?
- How high is the potential and need for Deep Implicit Research?

Scoring:
Assign an overall score from 0 to 100.

Score interpretation:
- 0–24 = very low openness / strongly classical thinking / low receptiveness
- 25–49 = classically shaped / first signs of openness / clear need for education
- 50–74 = reflective / recognizes limits of classical research / good potential
- 75–100 = highly receptive / strong understanding / advanced thinking

Important:
A high score does NOT mean "everything is already perfect."
A high score means: the person already recognizes the limits of classical research and is receptive to Deep Implicit Research.
A low score means: the person is still strongly stuck in outdated mental models.
Both can be sales-relevant — the text should be framed accordingly.

How to work:
1. Read the three answers carefully.
2. Identify patterns, contradictions, buzzwords, and logic patterns.
3. Derive a short diagnosis.
4. Assign a score.
5. Write a short assessment text with clear, intelligent sharpness.
6. At the end, reference the IIEX keynote and offer to:
   - send the assessment by email
   - send the IIEX keynote slides by email
   - send book release info by email

Tone:
- intelligent
- clear
- precise
- slightly pointed
- no empty phrases
- no aggressive sales language
- no flattery
- no buzzword overload
- the prospect should feel recognized
- the text should read like a precise mirror

Length rules:
- First, output only the score on one line
- Then a very short label on one line
- Then an assessment of 120 to 180 words
- Then a very short CTA of 2 to 3 sentences

Format — use exactly this output format:

Score: XX/100

Classification: [short label, 3–6 words]

Assessment:
[120–180 words. Show clearly which thinking patterns are visible in the answers. Address the person directly as "you". Highlight whether they are still strongly thinking in attention/persuasion/explicit survey/data-volume logic — or whether a more differentiated understanding is already visible. Bring the themes of implicit vs. explicit, correlation vs. causation, and classical models vs. actual decision mechanics sharply to the point. No bullet points.]

CTA:
[2–3 sentences. Mention that you would be happy to send this assessment together with the IIEX keynote slides and book release dates by email.]

Additional scoring logic:
- If the person treats attention as a prerequisite of effectiveness, count that as classical AIDA thinking.
- If the person implies customers can accurately explain why they buy, count that as strong explicit logic.
- If the person implies more/better data automatically produces better insights, count that as a data-first fallacy.
- If the person distinguishes between observed behavior and actual cause, score that positively.
- If the person recognizes limits of classical research, score that positively.
- If the person mentions implicit processes, intuition, unconscious mechanisms, actual behavior, or causal questions, score that strongly positive.
- If the person answers with nuance (e.g. "it depends"), check whether there is real depth behind it or just hedging.
- Avoid overscoring mere buzzwords. Score substance, not jargon.

Important:
- Do not invent anything not recognizable in the answers.
- If answers are short or unclear, briefly note the uncertainty but still deliver a usable assessment.
- Do not write academically.
- Do not write like an automated personality test.
- Write so the text works in a high-quality conference or keynote context.

Now evaluate the answers.

IMPORTANT: Respond exclusively with valid JSON without Markdown formatting or code blocks:
{"score": <number 0-100>, "einordnung": "<3-6 words>", "full_assessment": "<Score: XX/100\\n\\nClassification: [label]\\n\\nAssessment:\\n[120-180 words]\\n\\nCTA:\\n[2-3 sentences]>"}`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { answer_1, answer_2, answer_3 } = req.body;
  if (!answer_1 || !answer_2 || !answer_3) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const prompt = ASSESSMENT_PROMPT_TEMPLATE
    .replace('{{answer_1}}', answer_1)
    .replace('{{answer_2}}', answer_2)
    .replace('{{answer_3}}', answer_3);

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
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Anthropic error', detail: data });
    }

    const rawText = data.content?.[0]?.text || '';

    try {
      // Strip potential markdown code blocks just in case
      const cleaned = rawText.replace(/^```json?\n?/, '').replace(/\n?```$/, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.status(200).json({
        score: parsed.score,
        einordnung: parsed.einordnung,
        full_assessment: parsed.full_assessment,
      });
    } catch {
      // Fallback if JSON parsing fails
      console.error('JSON parse failed:', rawText);
      return res.status(200).json({
        score: null,
        einordnung: 'Auswertung nicht verfügbar',
        full_assessment: rawText,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: 'API error', detail: err.message });
  }
}
