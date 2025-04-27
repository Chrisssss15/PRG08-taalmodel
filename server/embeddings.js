import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { FaissStore } from "@langchain/community/vectorstores/faiss";

const model = new AzureChatOpenAI({ temperature: 1 });

let vectorStore;

const embeddings = new AzureOpenAIEmbeddings({ //azure gebruiken om embeddings te maken
  // temperature: 0,
  azureOpenAIApiEmbeddingsDeploymentName: process.env.AZURE_EMBEDDING_DEPLOYMENT_NAME
});

//const vectorTest = await embeddings.embedQuery("the hamster ate too many nuts"); 
// console.log(vectorTest);

async function loadHamsterStory(){
  const loader = new TextLoader("./public/text.txt"); // haalt info uit een text file
  const docs = await loader.load();
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 450,
    chunkOverlap: 200
  });
  const splitDocs = await textSplitter.splitDocuments(docs);
  console.log(`I created ${splitDocs.length} text chunks`);
  vectorStore = await FaissStore.fromDocuments(splitDocs, embeddings);
  await vectorStore.save("textVectorDB"); // slaat de vector store op in db
  console.log('Vector store created');
}

// async function askQuestion(prompt){
//   // const relevantDocs = await vectorStore.similaritySearch("who is the hero of this story?", 100);
//     const relevantDocs = await vectorStore.similaritySearch(prompt, 100);
//   console.log(relevantDocs[0]);
//   const context = relevantDocs.map(doc => doc.pageContent).join("\n\n");
//   console.log( context); 

//   //Chat
//   const response = await model.invoke([
//     ["system", "You will get a context and a question. Use only the context to answer the question"],
//     ["user", `context: ${context}, question: ${prompt}`],
//   ]);

//   console.log("---------------------------");
//   console.log(response.content);
// }

// await loadHamsterStory();
// await askQuestion("who is the hero of this story?");
