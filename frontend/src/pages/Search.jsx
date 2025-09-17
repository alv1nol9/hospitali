import { useState } from 'react'
import api from '../api'
import DrugCard from '../components/DrugCard'


export default function Search({ user }) {
const [q, setQ] = useState('')
const [results, setResults] = useState([])


async function doSearch(e) {
e.preventDefault()
const res = await api.get(`/drugs/search?q=${encodeURIComponent(q)}`)
setResults(res.data)
}


return (
<div>
<h2 className="text-2xl font-bold mb-4">Search Drugs</h2>
<form onSubmit={doSearch} className="flex gap-2 mb-4">
<input className="border p-2 rounded" placeholder="search" value={q} onChange={(e) => setQ(e.target.value)} />
<button className="bg-blue-600 text-white px-3 py-1 rounded">Search</button>
</form>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">{results.map(r => <DrugCard key={r.id} drug={r} currentUser={user} />)}</div>
</div>
)
}