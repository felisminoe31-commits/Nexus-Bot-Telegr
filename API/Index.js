const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

module.exports = async (req, res) => {
  // Configuração para permitir que o site fale com o servidor (CORS)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { type, topic } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Faltou o tópico!' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    let prompt = "";
    
    if (type === "viral") {
      prompt = `Aja como um estrategista viral de TikTok e Reels. Crie um roteiro de vídeo curto (60s) altamente engajador sobre: "${topic}". 
      Estrutura obrigatória: 
      1. Gancho polêmico ou curioso (3s). 
      2. Desenvolvimento do problema. 
      3. Solução rápida. 
      4. Call to Action (Chamada para ação). 
      Use linguagem moderna, direta e persuasiva. Em Português.`;
    } else if (type === "sales") {
      prompt = `Aja como um copywriter profissional de vendas diretas. Escreva uma mensagem de abordagem (Cold Message) para vender o seguinte produto/serviço: "${topic}".
      Use gatilhos mentais de escassez e autoridade. A mensagem deve ser curta, educada mas impossível de ignorar. Em Português.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.status(200).json({ result: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar conteúdo.' });
  }
};
