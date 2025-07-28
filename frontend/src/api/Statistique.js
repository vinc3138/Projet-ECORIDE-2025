  <!-- Chart.js -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
    }
    h1, h2 {
      text-align: center;
      margin-bottom: 2rem;
    }
    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
    }
    #totalCredit {
      font-size: 1.5rem;
      font-weight: bold;
      text-align: center;
      color: #198754;
      padding: 1rem;
      background-color: #e9f7ef;
      border: 1px solid #d1e7dd;
      border-radius: 8px;
      max-width: 400px;
      margin: 2rem auto;
    }
  </style>
</head>
<body>

  <h1>💲 Total des crédits :</h1>

  <div id="totalCredit">Chargement...</div>
  
  <br/>

  <h1>📊 Graphiques</h1>

  <br/>

  <div class="container">
    <div class="chart-container">
      <h2>Covoiturages par jour</h2>
      <canvas id="chartCovoiturages"></canvas>
    </div>

    <div class="chart-container">
      <h2>Crédits gagnés par jour</h2>
      <canvas id="chartCredits"></canvas>
    </div>
  </div>

  <script>
    async function loadStats() {
      const covoiturages = await fetch('http://localhost:4000/covoiturages-par-jour').then(res => res.json());
      const credits = await fetch('http://localhost:4000/credits-par-jour').then(res => res.json());
      const total = await fetch('http://localhost:4000/total-credit').then(res => res.json());

      // Afficher total crédit en premier
      document.getElementById('totalCredit').textContent = total.totalCredit + " crédits";

      // Chart 1 - Covoiturages
      new Chart(document.getElementById('chartCovoiturages'), {
        type: 'bar',
        data: {
          labels: covoiturages.map(item => item._id),
          datasets: [{
            label: 'Nombre de covoiturages',
            data: covoiturages.map(item => item.totalCovoiturages),
            backgroundColor: '#0d6efd'
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false }
          }
        }
      });

      // Chart 2 - Crédits
      new Chart(document.getElementById('chartCredits'), {
        type: 'line',
        data: {
          labels: credits.map(item => item._id),
          datasets: [{
            label: 'Crédits gagnés',
            data: credits.map(item => item.totalCredit),
            borderColor: '#198754',
            backgroundColor: 'rgba(25, 135, 84, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true, position: 'top' }
          }
        }
      });
    }

    loadStats();
  </script>

</body>
</html>
