export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ error: "Falta el texto" });
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{ role: "user", content: `Extrae información de este correo de Google Classroom chileno. Responde SOLO JSON sin markdown:\n{"materia":"MATERIA EN MAYÚSCULAS","titulo":"string","objetivo":"string","actividades":["..."],"materiales_extra":["..."],"fecha_entrega":"YYYY-MM-DD o null","profesor":"string"}\nCorreo: ${texto}` }]
      })
    });
    const data = await response.json();
    const txt = data.content.map(b => b.text || "").join("").replace(/```json|```/g, "").trim();
    res.status(200).json(JSON.parse(txt));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
