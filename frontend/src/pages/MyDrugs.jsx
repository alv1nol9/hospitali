import { useEffect, useState } from 'react';
import api from '../api';
import DrugCard from '../components/DrugCard';
import '../styles/MyDrugs.css';

export default function MyDrugs({ user }) {
  const [drugs, setDrugs] = useState([]);

  async function fetchMine() {
    try {
      const res = await api.get('/drugs/mine');
      setDrugs(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchMine();
  }, []);

  async function deleteDrug(id) {
    if (!confirm('Delete?')) return;
    await api.delete(`/drugs/${id}`);
    fetchMine();
  }

  return (
    <div className="mydrugs-page">
      <h2>My Drugs</h2>
      <div className="mydrugs-grid">
        {drugs.map((d) => (
          <DrugCard
            key={d.id}
            drug={d}
            currentUser={user}
            onDelete={deleteDrug}
          />
        ))}
      </div>
    </div>
  );
}
