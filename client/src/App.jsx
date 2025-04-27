import React, { useState, useRef, useEffect } from "react";

export default function App() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [fetchedPokemons, setFetchedPokemons] = useState([]);
  const [currentPokemon, setCurrentPokemon] = useState("");
  const [isLoading, setIsLoading] = useState(false); // pas een nieuwe prompt als de vorige is afgerond
  const chatBoxRef = useRef(null);
  

  // Scroll automatisch naar beneden bij nieuw bericht
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  // Fetch random Pokémon via backend
  async function fetchRandomPokemon() {
    const res = await fetch("http://localhost:3000/generatePokemon", { method: "POST" });
    const data = await res.json();
    setChat(prev => [...prev, { role: "bot", text: data.message }]);
    if (data.pokemons) {
      setFetchedPokemons(data.pokemons);
      setCurrentPokemon(data.pokemons[data.pokemons.length - 1]);
    }
  }

  // Stuur vraag naar backend
  async function askQuestion(e) {
    const updatedChat = [...chat, { role: "user", content: message }];

    
    e.preventDefault();

    if (!message.trim() || isLoading) return; // voorkom dubbele submits
    setIsLoading(true);

    const res = await fetch("http://localhost:3000/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chatHistory: updatedChat })
    });

        const data = await res.json();

    setChat([...updatedChat, { role: "assistant", content: data.message }]); // hier komt de antwoord van de bot
    setMessage("");
    setTimeout(() => {
      setIsLoading(false); 
    }, 500);
  }
  return (
    <div className="w-screen h-screen bg-gradient-to-br from-blue-100 to-white flex items-center justify-center">
      <div className="w-full max-w-2xl h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Random Pokémon knop + huidige & alle gefetche namen */}
        <div className="flex items-center justify-between p-4 border-b">
          <button
            className="bg-blue-500 text-white rounded-full px-4 py-2 font-semibold shadow hover:bg-blue-600 transition"
            onClick={fetchRandomPokemon}
          >
            Random Pokémon
          </button>
          <div className="text-sm ml-4 text-gray-700">
            {currentPokemon
              ? (
                <span>
                  Current: <b className="capitalize">{currentPokemon}</b>
                </span>
              )
              : "No Pokémon chosen"}
          </div>
        </div>
        {/* Gefetche Pokémon-lijst */}
        <div className="px-4 py-2 text-xs text-gray-500">
          {fetchedPokemons.length > 0 && (
            <>Fetched Pokémon: <span className="capitalize">{fetchedPokemons.join(", ")}</span></>
          )}
        </div>
        {/* Chatbox */}
        <div
          ref={chatBoxRef}
          className="flex-1 px-4 py-2 overflow-y-auto bg-blue-50"
        >
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 max-w-[70%] px-4 py-2 rounded-2xl text-base break-words 
                ${msg.role === "user"
                  ? "bg-blue-500 text-white ml-auto rounded-br-md"
                  : "bg-gray-200 text-gray-900 mr-auto rounded-bl-md"
                }`}
            >
              <b>{msg.role === "user" ? "You" : "Bot"}:</b> {msg.content}
            </div>
          ))}
        </div>

        <form
          onSubmit={askQuestion}
          className="flex items-center border-t px-4 py-3 bg-white"
        >
         <input
            value={message}
            onChange={e => setMessage(e.target.value)} // de vraag die je stelt wordt hier naar de server gestuurd
            className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 mr-2"
            placeholder="Type your question here..."
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white rounded-full px-6 py-2 font-semibold shadow hover:bg-blue-600 transition"
            disabled={isLoading || message.trim() === ""} // knop uit als loading
          >
            {isLoading ? "Even wachten..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
