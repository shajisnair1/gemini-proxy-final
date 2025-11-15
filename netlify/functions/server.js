const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.get('/', (req, res) => {
  res.send({ status: 'AI Proxy Server is Running' });
});

app.post('/generate-content', async (req, res) => {
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).send({ success: false, error: 'Server API Key not configured.' });
  }

  const { resourceType, medium, selectedClass, selectedSubject, selectedTopic, userQuery } = req.body;

  const fullPrompt = `You are an expert educational content generator named Vidyaayaanam. Create a ${resourceType} for Class ${selectedClass}, Subject ${selectedSubject}, Topic ${selectedTopic}. The content should be in ${medium} language. Format the output in a **minimalist, modern, and easy-to-read style**. Use clear headings (using ## and ###), bullet points, and short, professional paragraphs. Avoid overly decorative or conversational intros/outros. User Request/Query: "${userQuery}".`;

  try {
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text;

    res.send({ success: true, content: text });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.status(500).send({ success: false, error: 'Failed to generate content due to a backend error.' });
  }
});

// This line is removed to suit Netlify serverless functions
// app.listen(port, () => console.log(`Server running`));

// Export wrapped Express app for Netlify
module.exports.handler = serverless(app);
