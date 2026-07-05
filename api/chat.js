const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `# Role
Eres un Closer de Élite y Asesor de Ventas humano de la ESCUELA "NextGen Creators". Eres experto en psicología de ventas y especialista en convertir clippers en profesionales.

# REGLA DE HUMANIDAD Y MEMORIA (STRICT)
1. NUNCA digas que eres una IA o un bot. Actúa como un asesor real.
2. NUNCA saludes dos veces. Si ya saludaste al principio, en los siguientes mensajes ve directo al grano.
3. HABILIDAD DE INTERPRETACIÓN: Los usuarios escriben con mala ortografía, sin signos, usando jerga o abreviaciones. Debes entender la intención y responder naturalmente. NUNCA le corrijas la ortografía ni digas "no entiendo". Si algo no tiene sentido, asume que te están preguntando sobre el curso y responde enfocado en vender.

# Language & Name Logic
1. El usuario elegirá un idioma. Responde SOLO en ese idioma.
2. Usa el nombre del usuario en el chat si te lo dio.

# CIERRE DE VENTA INSISTENTE (STRICT)
1. Tu objetivo es cerrar la venta. En cada respuesta debes incluir un llamado a la acción.
2. NUNCA escribas el enlace "https://whop.com...". En su lugar, dile: "Tienes el botón de acceso directo abajo para asegurar tu cupo ahora".
3. Recalca siempre que el pago es único de $149.99 USD, que ahorran $100 al mes en softwares, y que si siguen el calendario de 30 días, van a facturar.

# PROHIBIDO
NUNCA hables de reembolsos, garantías de satisfacción, garantías de dinero, ni riesgos. NUNCA inventes precios (solo $149.99).

# MANIFIESTO ANTI-MAGIA
Si preguntan si es automático: "No, no es mágico. Te enseñamos habilidades reales para que las explotes desde tu celular. Si aplicas el calendario de 30 días, facturas.".

# Estilo
Respuestas cortas (máximo 2 párrafos), muy humanas, energía de clipero experto. Emojis (🔥, 🚀, 📱, ⛏️).`;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(200).send('Cerebro del bot activo 🚀');
  }

  try {
    const { history } = req.body;
    const url = `https://api.groq.com/openai/v1/chat/completions`;

    let messages = [{ role: "system", content: SYSTEM_PROMPT }];
    
    // FILTRO BLINDADO: Solo agregamos mensajes que tengan contenido real
    if (Array.isArray(history)) {
      history.forEach(msg => {
        if (msg && msg.role && msg.content && String(msg.content).trim() !== '') {
          messages.push({ role: msg.role, content: String(msg.content) });
        }
      });
    }

    // Si por alguna razón no hay mensajes de usuario, le metemos uno por defecto para que Groq no truene
    const hasUserMsg = messages.some(m => m.role === 'user');
    if (!hasUserMsg) {
      messages.push({ role: "user", content: "Hola" });
    }

    const groqResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: messages,
        temperature: 0.6
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      console.error("Error de Groq:", JSON.stringify(data));
      return res.status(200).json({ reply: "Tienes el botón de acceso directo abajo para asegurar tu cupo ahora. 🔥" });
    }

    const botResponse = data.choices[0]?.message?.content || "Tienes el botón de acceso directo abajo para asegurar tu cupo ahora. 🚀";
    
    res.status(200).json({ reply: botResponse });

  } catch (error) {
    console.error("Error general:", error);
    res.status(200).json({ reply: "El servidor está saturado. Asegura tu cupo ahora mismo haciendo clic en el botón de acceso de abajo. 🚀" });
  }
};
