// Supabase Edge Function: extract-contact
// Takes raw spoken/typed text and asks Google Gemini (free tier, no billing needed)
// to return structured contact fields. Your Gemini key stays here as a secret —
// never inside the phone app.

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

Deno.serve(async (req) => {
  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return new Response(JSON.stringify({ error: "Missing transcript" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const prompt = `You extract contact information from a spoken sentence into strict JSON.
Return ONLY a JSON object, no preamble, no markdown fences, with exactly these fields:
{
  "name": string,
  "company": string or null,
  "role": string or null,
  "tags": array of short strings (e.g. ["Client"], ["Investor"], ["Legal"], ["Staffing Partner"], ["Press"], ["Advisor"]),
  "how_they_help": string or null (one short sentence),
  "met_context": string or null
}
If a field isn't mentioned, use null (or empty array for tags). Never invent details not implied by the text.

Sentence: "${transcript}"`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      }
    );

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { error: "Could not understand that — try rephrasing it more simply." };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
