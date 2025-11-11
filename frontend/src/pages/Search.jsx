import { useState } from 'react';
import api from '../api';
import DrugCard from '../components/DrugCard';
import '../styles/Search.css';

export default function Search({ user }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);

  async function doSearch(e) {
    e.preventDefault();
    const res = await api.get(`/drugs/search?q=${encodeURIComponent(q)}`);
    setResults(res.data);
  }

  return (
    <div className="search-page">
      <h2>Search Drugs</h2>
      <form onSubmit={doSearch} className="search-form">
        <input
          placeholder="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button>Search</button>
      </form>

      <div className="search-results">
        {results.map((r) => (
          <DrugCard key={r.id} drug={r} currentUser={user} />
        ))}
      </div>
    </div>
  );
}
