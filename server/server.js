// import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
// import express from "express";
// import cors from "cors";
// import { FaissStore } from "@langchain/community/vectorstores/faiss";
// import fetch from 'node-fetch';

// const app = express();
// let currentPokemon = null;

// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // const messages = [
// //   ["system", `You are the assistant of a Pokémon trainer—a friendly helpdesk.
// //     - Always answer questions factually, clearly, and with enthusiasm.
// //     - Keep your answer short (maximum 3 sentences).
// //     - Use only the information provided in the context.
// //     - If the answer is unknown or not present, reply with: 'Unknown.'
// //     `],
// //     ["user", `context: ${context}, question: ${prompt}`]

// // ]

// let vectorStore = await FaissStore.load("textVectorDB", new AzureOpenAIEmbeddings({
//   azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
// }));

// const model = new AzureChatOpenAI({
//   temperature: 0.2,
// });

// const fetchPokemonData = async () => {
//   try {
//       const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10');
//       if (!response.ok) {
//           throw new Error(`API responded with status ${response.status}`);
//       }
//       const data = await response.json();
//       if (!data.results || data.results.length === 0) {
//           throw new Error('No Pokemon data found in API response');
//       }
//       currentPokemon = data.results[Math.floor(Math.random() * data.results.length)];
//       return currentPokemon;
//   } catch (error) {
//       console.error('Error in fetchPokemonData:', error.message);
//       throw error;
//   }
// };




// // async function createJoke() {
// //   const result = await model.invoke("tell me a javascript joke");
// //   return result.content;
// // }

// // async function sendPrompt(prompt) {
// //   messages.push(["human", prompt])
// //   const result = await model.invoke(messages);
// //   messages.push(["ai", result.content]);
// //   return result.content;
// // }

// // async function sendPrompt(prompt){
// //   const relevantDocs = await vectorStore.similaritySearch(prompt, 3);
// //   // console.log(relevantDocs[0]);
// //   const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");
// //   // console.log( context); 

// //   //Chat
// //   const messages = [
// //     ["system", `You are the assistant of a Pokémon trainer—a friendly helpdesk.
// //       - Always answer questions factually, clearly, and with enthusiasm.
// //       - Keep your answer short (maximum 3 sentences).
// //       - Only use information that is provided in the context, which comes from the textVectorDB.
// //       - If the answer is unknown or not present, reply with: 'Unknown.'
// //       `],
// //     ["user", `context: ${context}, question: ${prompt}`]
// //   ]
// //   const response = await model.invoke(messages);

// //   console.log("---------------------------");
// //   // console.log(response.content);
// //   return response.content;
// // }
// async function sendPrompt(context, prompt){
//   const messages = [
//     ["system", `You are the assistant of a Pokémon trainer—a friendly helpdesk.
//       - Always answer questions factually, clearly, and with enthusiasm.
//       - Keep your answer short (maximum 3 sentences).
//       - Only use information that is provided in the context, which comes from the textVectorDB.
//       - If the answer is unknown or not present, reply with: 'Unknown.'
//       `],
//     ["user", `context: ${context}, question: ${prompt}`]
//   ]

//   const response = await model.invoke(messages);

//   return response.content;
// }

// // Deze functie zoekt de context/document op voor de opgehaalde Pokémon (op naam)
// async function getPokemonContext(pokemonName) {
//   // Gebruik de vectorDB om te zoeken naar het document van alleen deze Pokémon
//   // Zoek met hoge 'k' (bv. 1) want we willen exact de meest relevante (meestal 1 resultaat)
//   const docs = await vectorStore.similaritySearch(pokemonName, 1);
//   if (docs.length > 0) {
//     return docs[0].pageContent; // Hier staat de tekst/kenmerken van de Pokémon
//   } else {
//     return ""; // Geen context gevonden
//   }
// }

// // app.get("/joke", async (req, res) => {
// //   let joke = await createJoke();
// //   res.json({ message: joke });
// // });

// // app.post("/ask", async (req, res) => {
// //   let prompt = req.body.prompt;
// //   console.log("the user asked for");
// //   console.log(prompt);  
// //   let result = await sendPrompt(prompt);
// //   console.log(result);
// //   res.json({ message: result });
// // });

// app.post("/ask", async (req, res) => {
//   let prompt = req.body.prompt;

//   // 1. Check of er een Pokémon is opgehaald
//   if (!currentPokemon) {
//     return res.json({ message: "Please fetch a Pokémon first!" });
//   }

//   // 2. Haal context van de laatste Pokémon
//   const currentPokemonContext = await getPokemonContext(currentPokemon.name); // Zelf implementeren

//   // 3. Geef context en prompt door
//   let result = await sendPrompt(currentPokemonContext, prompt);
//   res.json({ message: result });
// });


// app.post('/generatePokemon', async (req, res) => {
//   try {
//       const pokemon = await fetchPokemonData();
//       if (pokemon) {
//           res.status(200).json(pokemon);
//       } else {
//           res.status(500).json({ 
//             error: 'Failed to fetch Pokemon data' 
//           });
//       }
//   } catch (error) {
//       console.error('Error fetching Pokemon data:', error);
//       res.status(500).json({ error: 'Failed to fetch Pokemon data' });
//   }
// });

// app.listen(3000, () => console.log("server op poort 3000"));

import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import express from "express";
import cors from "cors";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import fetch from 'node-fetch';

const app = express();
let fetchedPokemons = []; // Hier bewaren we ALLE gefetchte Pokémon

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let vectorStore = await FaissStore.load("textVectorDB", new AzureOpenAIEmbeddings({
  azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
}));

const model = new AzureChatOpenAI({
  temperature: 0.2,
});

// Functie om een nieuwe random Pokémon te fetchen en aan de lijst toe te voegen
const fetchPokemonData = async () => {
  try {
    const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10');
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
  const messages = [
    ["system", `You are the assistant of a Pokémon trainer—a friendly helpdesk.
      - Always answer questions factually, clearly, and with enthusiasm.
      - Keep your answer short (maximum 3 sentences).
      - Only use information that is provided in the context, which comes from the textVectorDB.
      - If the answer is unknown or not present, reply with: 'Unknown.'
      `],
    ["user", `context: ${context}, question: ${prompt}`]
  ];
  const response = await model.invoke(messages);
  return response.content;
}

// Endpoint om een Pokémon te fetchen
app.post('/generatePokemon', async (req, res) => {
  try {
    const pokemon = await fetchPokemonData();
    if (pokemon) {
      res.status(200).json({
        message: `Fetch a new pokemon: ${pokemon.name}`,
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

// Endpoint om een vraag te stellen
app.post("/ask", async (req, res) => {
  let prompt = req.body.prompt.toLowerCase();
  console.log("DEBUG: fetchedPokemons =", fetchedPokemons); // <-- toevoegen!
  // 1. Check of er iets is gefetched
  if (fetchedPokemons.length === 0) {
    return res.json({ message: "Please fetch a Pokémon first!" });
  }

  // 2. Kijk of de vraag over een gefetchte Pokémon gaat
  const foundPokemon = fetchedPokemons.find(name => prompt.includes(name.toLowerCase()));

  if (!foundPokemon) {
    return res.json({ message: "Please fetch this Pokémon first!" });
  }

  // 3. Haal context van die Pokémon
  const context = await getPokemonContext(foundPokemon);

  // 4. Geef context en prompt door aan model
  let result = await sendPrompt(context, req.body.prompt);
  res.json({ message: result });
});

app.listen(3000, () => console.log("server op poort 3000"));
