import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "st-SECRETKEY",
});

// text-embedding-ada-002, text-embedding-3-small, text-embedding-3-large
const MODEL = "text-embedding-ada-002";

export const generateEmbedding = async (value: string) => {
  const input = value.replaceAll("\n", " ");

  const { data } = await openai.embeddings.create({
    model: MODEL,
    input,
  });

  return data[0]?.embedding;
};
