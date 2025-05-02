import { SQL } from "bun";
import { faker } from "@faker-js/faker";
import { generateEmbedding } from "./embeddings";
import pgvector from "pgvector";

const sql = new SQL({ url: process.env.DATABASE_URL });

const initDb = async () => {
  /**
   * Create extension if not exists
   */
  await sql`CREATE EXTENSION IF NOT EXISTS vector;`;

  /**
   * Create table if not exists
   */
  await sql`CREATE TABLE IF NOT EXISTS documents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding VECTOR(1536) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  );`;
};

const seedDb = async () => {
  const documents = await Promise.all(
    Array.from({ length: 3 }, async () => {
      const content = faker.lorem.paragraph();
      return {
        title: faker.lorem.sentence(),
        content,
        embedding: pgvector.toSql(await generateEmbedding(content)),
      };
    })
  );

  await sql`INSERT INTO documents ${sql(documents)}`;

  console.log("Database seeded successfully");
};

const searchDb = async (query: string) => {
  const embedding = await generateEmbedding(query);
  if (!embedding) {
    throw new Error("Embedding generation failed");
  }
  const sqlEmbedding = pgvector.toSql(embedding);
  const results = await sql`SELECT * FROM documents ORDER BY embedding <-> ${sqlEmbedding} LIMIT 3`.values();
  return results;
};

const demo = async (search = "What is the capital of Taiwan?", seed = false) => {
  await initDb();
  if (seed) {
    await seedDb();
  }
  const results = await searchDb(search);
  console.log(results);
};

const Script = {
  init: async () => {
    await initDb();
    await seedDb();
  },
  initDb,
  seedDb,
  searchDb,
  demo,
};

export default Script;
