export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { texto } = req.body;
  if (!texto) return res.status(400).json({ error: "Falta el texto" });
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
        "HTTP-Referer": "https://feliperojas84.github.io/mochilasosdatos",
        "X-Title": "Mochila SOS"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        messages: [{ role: "user", content: `Eres el asistente de Mochila SOS, app escolar chilena. Analiza este correo de Google Classroom y responde SOLO con JSON válido sin markdown.\n\nINSTRUCCIONES:\n- Materiales, tareas o actividades → tipo "aviso"\n- Posterga, cambia fecha o reprograma evaluación → tipo "reprogramacion"\n- Evaluación nueva → tipo "evaluacion_nueva"\n\nPara "aviso": {"tipo":"aviso","materia":"MAYÚSCULAS","titulo":"string","objetivo":"string","actividades":["..."],"materiales_extra":["..."],"fecha_entrega":"YYYY-MM-DD o null","profesor":"string"}\n\nPara "reprogramacion": {"tipo":"reprogramacion","materia":"MAYÚSCULAS","titulo":"string","fecha_original":"YYYY-MM-DD o null","fecha_nueva":"YYYY-MM-DD","motivo":"string","profesor":"string"}\n\nPara "evaluacion_nueva": {"tipo":"evaluacion_nueva","materia":"MAYÚSCULAS","titulo":"string","fecha":"YYYY-MM-DD","tipo_eval":"sumativa/proceso/oral/especial","contenidos":["..."],"materiales":["..."],"profesor":"string"}\n\nCorreo: ${texto}` }],
        temperature: 0.1
      })
    });
    const data = await response.json();
    if(!data.choices || !data.choices[0]) return res.status(500).json({ error: "Sin respuesta", detalle: JSON.stringify(data) });
    const txt = data.choices[0].message.content.replace(/```json/g,"").replace(/```/g,"").trim();
    res.status(200).json(JSON.parse(txt));
  } catch(e) { res.status(500).json({ error: e.message }); }
}
