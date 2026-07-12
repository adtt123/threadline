// Supabase Edge Function: extract-contact
// Takes raw spoken/typed text and asks Claude to return structured contact fields.
// The Anthropic API key stays here (server secret) — never inside the phone app.

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

Deno.serve(async (req) => {
  try {
    const { transcript } = await req.json();

    if (!transcript || typeof transcript !== "string") {
      return new Response(JSON.stringify({ error: "Missing transcript" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You extract contact information from a spoken sentence into strict JSON.
Return ONLY a JSON object, no preamble, no markdown fences, with exactly these fields:
{
  "name": string,
  "company": string or null,
  "role": string or null,
  "tags": array of short strings (e.g. ["Client"], ["Investor"], ["Legal"], ["Staffing Partner"], ["Press"], ["Advisor"]),
  "how_they_help": string or null (one short sentence),
  "met_context": string or null
}
If a field isn't mentioned, use null (or empty array for tags). Never invent details not implied by the text.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: transcript }],
      }),
    });

    const data = await response.json();
    const rawText = data?.content?.[0]?.text ?? "{}";
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
