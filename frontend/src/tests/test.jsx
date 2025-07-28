import React, { useState, useEffect } from 'react';

const villesSimulees = ['Paris', 'Lyon', 'Marseille', 'Bordeaux', 'Toulouse'];

export default function TestAutocomplete() {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (input.length > 0) {
      // Simule une requête API
      setSuggestions(villesSimulees.filter(v => v.toLowerCase().startsWith(input.toLowerCase())));
    } else {
      setSuggestions([]);
    }
  }, [input]);

  return (
    <div>
      <input
        type="text"
        list="villes-list"
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <datalist id="villes-list">
        {suggestions.map((v, i) => <option key={i} value={v} />)}
      </datalist>
    </div>
  );
}
