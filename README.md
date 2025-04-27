# Pokémon Taalmodel

Dit project is een taalmodel gericht op Pokémon. Je kunt via een API Pokémon-data ophalen ("fetchen") en vervolgens vragen stellen over deze data. Het project bestaat uit een backend (Node.js + Express + LangChain) en een frontend (React + Vite + Tailwind).

## Features

- **Pokémon-data fetchen:** Haal data op via een externe API.
- **Vragen stellen:** Stel vragen over de gefetchte data met behulp van het taalmodel.

---

## 1. Installatie stappen

- **Clone het project**:
    ```bash
    git clone [hier-je-eigen-github-url]
    ```
    *(Of pak het ZIP-bestand uit en open de hoofdmap in je editor)*

- **Installeer de backend**:
    ```bash
    cd server
    npm install
    ```

- **Installeer de frontend**:
    ```bash
    cd ../client
    npm install
    ```

---

## 2. Maak een .env bestand

Maak in de map `server` een `.env` bestand aan met de volgende inhoud:

```env
AZURE_OPENAI_API_KEY=your-azure-api-key
AZURE_OPENAI_ENDPOINT=https://your-endpoint.openai.azure.com/
AZURE_DEPLOYMENT_NAME=your-deployment-name
AZURE_EMBEDDING_DEPLOYMENT_NAME=your-embedding-deployment-name
```
> **Let op:** Je hebt een geldige Azure OpenAI API key & deployment nodig!

---

## 3. Project starten

- **Teksten embedden (eenmalig bij nieuwe data):**
    ```bash
    cd server
    npm run embed
    ```

- **Start de backend server:**
    ```bash
    npm run start
    ```

- **Start de frontend:**
    ```bash
    cd ../client
    npm run dev
    ```

De frontend draait op: [http://localhost:5173](http://localhost:5173)  
De backend draait op: [http://localhost:3000](http://localhost:3000)

---

# 🐞 Bekende Problemen & Oplossingen

- **Geen geldige Azure API key:**  
  Controleer je `.env` bestand en API-permissies.

- **Foutmeldingen zoals ENOTFOUND / 401 / 403:**  
  Controleer of je Azure API-gegevens correct zijn ingevuld.

- **Nieuwe tekst wordt niet gevonden:**  
  Voer altijd `npm run embed` opnieuw uit na toevoegen van nieuwe tekstbestanden.
