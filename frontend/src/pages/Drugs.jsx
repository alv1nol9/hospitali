import { useEffect, useState } from 'react';
import api from '../api';
import DrugCard from '../components/DrugCard';
import '../styles/Drugs.css';

export default function Drugs({ user }) {
  const [drugs, setDrugs] = useState([]);
  const [form, setForm] = useState({ name: '', quantity: 0, min_threshold: 10 });

  async function fetchDrugs() {
    try {
      const res = await api.get('/drugs');
      setDrugs(res.data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchDrugs();
  }, []);

  async function addDrug(e) {
    e.preventDefault();
    try {
      await api.post('/drugs', form);
      setForm({ name: '', quantity: 0, min_threshold: 10 });
      fetchDrugs();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add');
    }
  }

  async function deleteDrug(id) {
    if (!confirm('Delete this drug?')) return;
    try {
      await api.delete(`/drugs/${id}`);
      fetchDrugs();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  }

  return (
    <div className="drugs-page">
      <h2>All Drugs</h2>

      <form onSubmit={addDrug} className="drug-form">
        <input
          placeholder="name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="qty"
          value={form.quantity}
          onChange={(e) =>
            setForm({ ...form, quantity: Number(e.target.value) })
          }
        />
        <input
          type="number"
          placeholder="min"
          value={form.min_threshold}
          onChange={(e) =>
            setForm({ ...form, min_threshold: Number(e.target.value) })
          }
        />
        <button>Add</button>
      </form>

      <div className="drugs-grid">
        {drugs.map((d) => (
          <DrugCard key={d.id} drug={d} currentUser={user} onDelete={deleteDrug} />
        ))}
      </div>
    </div>
  );
}
