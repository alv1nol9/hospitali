import { useEffect, useState } from 'react';
import api from '../api';
import DrugCard from '../components/DrugCard';
import '../styles/LowStock.css';

export default function LowStock({ user }) {
  const [drugs, setDrugs] = useState([]);

  useEffect(() => {
    api.get('/drugs/low_stock').then((r) => setDrugs(r.data));
  }, []);

  return (
    <div className="lowstock-page">
      <h2>Low Stock</h2>
      {drugs.length === 0 ? (
        <p>All stocked up 🎉</p>
      ) : (
        <div className="lowstock-grid">
          {drugs.map((d) => (
            <DrugCard
              key={d.id}
              drug={d}
              currentUser={user}
            />
          ))}
        </div>
      )}
    </div>
  );
}
