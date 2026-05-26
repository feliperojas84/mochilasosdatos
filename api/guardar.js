export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const token = process.env.GITHUB_TOKEN;
  const repo = "feliperojas84/mochilasosdatos";
  const file = "datos.json";

  try {
    // Obtener SHA actual
    const shaRes = await fetch(`https://api.github.com/repos/${repo}/contents/${file}`, {
      headers: { "Authorization": "token "+token, "Accept": "application/vnd.github.v3+json" }
    });
    const shaData = await shaRes.json();
    const sha = shaData.sha;

    // Subir nuevo contenido
    const { datos, mensaje } = req.body;
    const contenido = Buffer.from(JSON.stringify(datos, null, 2)).toString("base64");
    const upRes = await fetch(`https://api.github.com/repos/${repo}/contents/${file}`, {
      method: "PUT",
      headers: { "Authorization": "token "+token, "Accept": "application/vnd.github.v3+json", "Content-Type": "application/json" },
      body: JSON.stringify({ message: mensaje||"Actualización", content: contenido, sha })
    });
    const upData = await upRes.json();
    res.status(200).json({ ok: true, sha: upData.content?.sha });
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
}
