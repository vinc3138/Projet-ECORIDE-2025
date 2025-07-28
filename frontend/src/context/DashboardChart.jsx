import React from 'react';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';

const sampleData = [
  { date: '2025-06-01', trajets: 12, ecolos: 5 },
  { date: '2025-06-02', trajets: 18, ecolos: 8 },
  { date: '2025-06-03', trajets: 10, ecolos: 3 },
  { date: '2025-06-04', trajets: 22, ecolos: 11 },
  { date: '2025-06-05', trajets: 15, ecolos: 7 },
];

export default function DashboardChart() {
  return (
    <>
      <div className="mt-3">
        <h6 className="text-secondary mb-3" style={{ paddingLeft: '2em' }}>
          📊 Nombre de trajets proposés par jour (total de trajets et trajets écologiques uniquement) :
        </h6>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={sampleData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="trajets" stroke="#8884d8" name="Trajets totaux" />
              <Line type="monotone" dataKey="ecolos" stroke="#82ca9d" name="Trajets écologiques" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5">
        <h6 className="text-secondary mb-3" style={{ paddingLeft: '2em' }}>
          📊 Gains de la plateforme par jour :
        </h6>

        <div style={{ width: '100%', height: 300, marginTop: 40 }}>
          <ResponsiveContainer>
            <BarChart data={sampleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="trajets" fill="#8884d8" name="Trajets totaux" />
              <Bar dataKey="ecolos" fill="#82ca9d" name="Écologiques" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
}