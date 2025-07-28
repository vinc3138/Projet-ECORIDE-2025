import React, { useState, useEffect, useRef } from 'react';
import { fetchCitySuggestions } from '../utils/listeVilleTrajet.js';

const debounce = (func, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

export default function AutocompletionTrajet({ label, onSelect, placeholder }) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const suggestionBoxRef = useRef();

  const debouncedFetch = debounce(async (query) => {
    const cities = await fetchCitySuggestions(query);
    setSuggestions(cities);
  }, 300);

  useEffect(() => {
    if (inputValue.length >= 2) debouncedFetch(inputValue);
    else setSuggestions([]);
  }, [inputValue]);

  const handleSelect = (place) => {
    const city = place.properties.locality || place.properties.name;
    setInputValue(city);
    setSuggestions([]);
    onSelect(city, true);
  };

  useEffect(() => {
    const closeSuggestions = (e) => {
      if (!suggestionBoxRef.current?.contains(e.target)) setSuggestions([]);
    };
    document.addEventListener('click', closeSuggestions);
    return () => document.removeEventListener('click', closeSuggestions);
  }, []);

  return (
    <div className="mb-3 column position-relative" ref={suggestionBoxRef}>
      <label className="form-label">{label}</label>
      <input
        type="text"
        className="form-control"
        value={inputValue}
        placeholder={placeholder}
        onChange={(e) => {
          setInputValue(e.target.value);
          onSelect(null, false);
        }}
        required
      />
      {suggestions.length > 0 && (
        <ul className="list-group position-absolute w-100 zindex-dropdown">
          {suggestions.map((place, index) => (
            <li
              key={index}
              className="list-group-item list-group-item-action"
              onClick={() => handleSelect(place)}
            >
              {place.properties.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
