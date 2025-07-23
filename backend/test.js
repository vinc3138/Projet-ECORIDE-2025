fetch('http://localhost:8000/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'passager', password: 'passager' }),
  credentials: 'include'
})
.then(response => {
  console.log('Status:', response.status);
  return response.text();  // prends la réponse en texte brut
})
.then(text => {
  console.log('Response text:', text);
  try {
    const data = JSON.parse(text);
    console.log('Parsed JSON:', data);
  } catch (e) {
    console.error('Réponse non JSON:', e);
  }
})
.catch(err => console.error('Fetch error:', err));