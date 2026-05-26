export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ error: "Falta el texto" });
  const apiKey = process.env.GEMINI_API_KEY;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: `Extrae información de este correo de Google Classroom chileno. Responde SOLO JSON válido sin markdown ni bloques de código:\n{"materia":"MATERIA EN MAYÚSCULAS","titulo":"string","objetivo":"string","actividades":["..."],"materiales_extra":["..."],"fecha_entrega":"YYYY-MM-DD o null","profesor":"string"}\nCorreo: ${texto}` }] }], generationConfig: { temperature: 0.1 } }) }
    );
    const data = await response.json();
    if(!data.candidates || !data.candidates[0]) return res.status(500).json({ error: "Sin respuesta de Gemini", raw: data });
    const txt = data.candidates[0].content.parts[0].text.replace(/```json/g,"").replace(/```/g,"").trim();
    res.status(200).json(JSON.parse(txt));
  } catch(e) { res.status(500).json({ error: e.message }); }
}
