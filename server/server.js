import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai"; //
import express from "express";
import cors from "cors";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import fetch from 'node-fetch';

const app = express();
let fetchedPokemons = []; // hier worden ALLE gefetche Pokémon in opgeslagen

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let vectorStore = await FaissStore.load("textVectorDB", new AzureOpenAIEmbeddings({ //informatie ophalen dmv azure openAI uit mijn locale db
  azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
}));

const model = new AzureChatOpenAI({
  temperature: 0.2, //geeft de betrouwbaarheid aan van de antwoorden
});

// Functie om een nieuwe random Pokémon te fetchen en aan de lijst toe te voegen
const fetchPokemonData = async () => {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10'); //live data ophalen
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('No Pokemon data found in API response');
    }
    const pokemon = data.results[Math.floor(Math.random() * data.results.length)];

    // Voeg toe aan de lijst als hij er nog niet in zit
    if (!fetchedPokemons.includes(pokemon.name)) {
      fetchedPokemons.push(pokemon.name);
    }

    return pokemon;
  } catch (error) {
    console.error('Error in fetchPokemonData:', error.message);
    throw error;
  }
};

// Functie om context van Pokémon op te halen
async function getPokemonContext(pokemonName) {
  const docs = await vectorStore.similaritySearch(pokemonName, 1);
  if (docs.length > 0) {
    return docs[0].pageContent;
  } else {
    return "";
  }
}

// Prompt functie
async function sendPrompt(context, prompt) {
  // Prompt engeniring
  const messages = [
    ["system", `You are the assistant of a Pokémon trainer—a friendly helpdesk.
      - Always answer questions factually, clearly, and with enthusiasm.
      - Keep your answer short (maximum 3 sentences).
      - Only use information that is provided in the context, which comes from the textVectorDB.
      - If the answer is unknown or not present, reply with: 'Unknown.'
      `],
    ["user", `context: ${context}, question: ${prompt}`]
  ];
  const response = await model.invoke(messages); // Return een gestructureerde response
  return response.content;
}

// Pokemon fetchen
app.post('/generatePokemon', async (req, res) => {
  try {
    const pokemon = await fetchPokemonData();
    if (pokemon) {
      res.status(200).json({
        message: `Fetched pokemons: ${pokemon.name}`,
        pokemons: fetchedPokemons // Geef lijstje terug aan frontend als je wilt
      });
    } else {
      res.status(500).json({ error: 'Failed to fetch Pokemon data' });
    }
  } catch (error) {
    console.error('Error fetching Pokemon data:', error);
    res.status(500).json({ error: 'Failed to fetch Pokemon data' });
  }
});

// Chatbot
app.post("/ask", async (req, res) => { 
  await new Promise(r => setTimeout(r, 2000)); // <-- 2 seconden pauze
  const chatHistory = req.body.chatHistory || [];

  const lastUserMsg = [...chatHistory].reverse().find(m => m.role === "user");
  let prompt = lastUserMsg ? lastUserMsg.content.toLowerCase() : "";

  // 1. Check of er iets is gefetched
  if (fetchedPokemons.length === 0) {
    return res.json({ message: "Please fetch a Pokémon first!" });
  }

  const messages = [
    ["system", `You are the assistant of a Pokémon trainer—a friendly helpdesk.
      - Always answer questions factually, clearly, and with enthusiasm.
      - Keep your answer short (maximum 3 sentences).
      - Only use information that is provided in the context, which comes from the textVectorDB.
      - If the answer is unknown or not present, reply with: 'Unknown.'
      `],
    ...chatHistory.map(m => [m.role, m.content])
  ];

  // 2. Kijk of de vraag over een gefetchte Pokémon gaat
  const foundPokemon = fetchedPokemons.find(name => prompt.includes(name.toLowerCase()));

  if (!foundPokemon) {
    return res.json({ message: "Please fetch this Pokémon first!" });
  }

  // 3. Haal context van die Pokémon
  const context = await getPokemonContext(foundPokemon);

  // 4. Geef context en prompt door aan model
  let result = await sendPrompt(context, prompt); // Await toegevoegd om meerdere calls te voorkomen
  res.json({ message: result });
});

app.listen(3000, () => console.log("server op poort 3000"));
