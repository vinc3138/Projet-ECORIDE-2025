export async function fetchKpis() {
  
	// Récupération du token stocké en local
	const token = localStorage.getItem('jwt_token');
	
	const API_URL = import.meta.env.VITE_API_URL;
	
	const res = await fetch(`${API_URL}/api/kpi/journalier`, {
		method: 'GET',
		headers: {
		  'Content-Type': 'application/json',
		  'Authorization': `Bearer ${token}`
		}
	});

	if (!res.ok) throw new Error('Erreur fetch KPIs');

	const data = await res.json();

	return data; // { kpiJournalier: [...], covoiturages: [...] }
}