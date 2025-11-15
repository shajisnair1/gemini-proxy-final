const { GoogleGenAI } = require('@google/genai');

exports.handler = async function(event, context) {
  // Check HTTP method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ success: false, error: 'Method not allowed. Use POST.' }),
    };
  }

  if (!process.env.GEMINI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Server API Key not configured.' }),
    };
  }

  // Safely parse request body
  let body;
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Request body is required.' }),
      };
    }
    body = JSON.parse(event.body);
  } catch (parseError) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: 'Invalid JSON in request body.' }),
    };
  }

  const { resourceType, medium, selectedClass, selectedSubject, selectedTopic, userQuery } = body;

  // Validate required fields
  if (!resourceType || !medium || !selectedClass || !selectedSubject || !selectedTopic) {
    return {
      statusCode: 400,
      body: JSON.stringify({ success: false, error: 'Missing required fields.' }),
    };
  }

  const fullPrompt = `You are an expert educational content generator named Vidyaayaanam. Create a ${resourceType} for Class ${selectedClass}, Subject ${selectedSubject}, Topic ${selectedTopic}. The content should be in ${medium} language. Format the output in a **minimalist, modern, and easy-to-read style**. Use clear headings (using ## and ###), bullet points, and short, professional paragraphs. Avoid overly decorative or conversational intros/outros. User Request/Query: "${userQuery}".`;

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, content: text }),
    };
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: 'Failed to generate content due to a backend error.' }),
    };
  }
};