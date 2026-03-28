import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendToClaudeService(messages: Message[]): Promise<string> {
  const response = await groq.chat.completions.create({
    model:      'llama-3.3-70b-versatile', // modelo gratuito más potente de Groq
    max_tokens: 1024,
    messages
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error('Respuesta vacía de Groq');
  }

  return content;
}