// Importing the Pinecone library
const { Pinecone } = require("@pinecone-database/pinecone");

// Initializing a Pinecone client with API key
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

// Function to get or create a Pinecone index
const chatGptProjectIndex = pc.Index("chat-gpt-project");

async function createMemory({ vectors, metadata, messageId }) {
  await chatGptProjectIndex.upsert([
    {
      id: messageId,
      values: vectors,
      metadata,
    },
  ]);
}

async function queryMemory({ queryvector, limit = 5, metadata }) {
  const data = await chatGptProjectIndex.query({
    vector: queryvector,
    topK: limit,
    filter: metadata ?  metadata  : undefined,
    includeMetadata: true,
  });

  return data.matches;
}

module.exports = {
  createMemory,
  queryMemory,
};
