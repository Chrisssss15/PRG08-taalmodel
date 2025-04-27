# 📚 Taalmodel Project

Dit project is een eenvoudig taalmodel. Het bestaat uit een **frontend** (React + Vite + Tailwind) en een **backend** (Node.js + Express + LangChain). De backend verwerkt tekstuele data met behulp van vector databases en AI-embeddings (OpenAI/Azure).

---


## Installatie

### 1. Clone de repository  
Of pak deze ZIP uit en navigeer naar de hoofdmap.

### 2. Installeer dependencies

**Backend:**
```bash
cd server
npm install

**Frontend:**
cd ../client (als je in server map zit)
cd client (als je in de hoofdmap zit)
npm install

### 3. Instellen van omgevingsvariabelen (backend)
Maak in de server map een .env bestand aan, met de volgende variabelen (voorbeeld):
AZURE_OPENAI_API_KEY=your-azure-api-key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_DEPLOYMENT_NAME=your-deployment-name
AZURE_EMBEDDING_DEPLOYMENT_NAME=your-embedding-deployment-name

Let op: Je hebt een geldige Azure OpenAI API key en deployment nodig.

### 4. Start het project
**Backend:**
cd server
npm run start

**Frontend**
cd client
npm run dev


De frontend draait standaard op http://localhost:5173
De backend draait standaard op http://localhost:3000 (tenzij anders ingesteld).


Gebruik
Voer eerst npm run embed uit in de server-map om tekst te verwerken en te embedden (eenmalig, tenzij je nieuwe teksten toevoegt).

Daarna kun je vragen stellen via de frontend.

De backend verwerkt je vraag en zoekt relevante antwoorden uit de vector database.


Bekende Issues
Je hebt een geldige Azure OpenAI API nodig voor embeddings en chat.

Bij fouten zoals ENOTFOUND of 401/403: controleer je .env en API-permissies.

Na het toevoegen van nieuwe tekstbestanden altijd npm run embed uitvoeren.

