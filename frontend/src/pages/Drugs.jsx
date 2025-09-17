import { useEffect, useState } from 'react'
import api from '../api'
import DrugCard from '../components/DrugCard'


export default function Drugs({ user }) {
const [drugs, setDrugs] = useState([])
const [form, setForm] = useState({ name: '', quantity: 0, min_threshold: 10 })


async function fetchDrugs() {
try {
const res = await api.get('/drugs')
setDrugs(res.data)
} catch (e) {
console.error(e)
}
}


useEffect(() => { fetchDrugs() }, [])


async function addDrug(e) {
e.preventDefault()
try {
await api.post('/drugs', form)
setForm({ name: '', quantity: 0, min_threshold: 10 })
fetchDrugs()
} catch (err) {
alert(err.response?.data?.message || 'Failed to add')
}
}


async function deleteDrug(id) {
if (!confirm('Delete this drug?')) return
try {
await api.delete(`/drugs/${id}`)
fetchDrugs()
} catch (err) {
alert(err.response?.data?.message || 'Delete failed')
}
}


return (
<div>
<h2 className="text-2xl font-bold mb-4">All Drugs</h2>


<form onSubmit={addDrug} className="mb-6 flex gap-2">
<input className="border p-2 rounded" placeholder="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
<input type="number" className="border p-2 rounded w-24" placeholder="qty" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
<input type="number" className="border p-2 rounded w-24" placeholder="min" value={form.min_threshold} onChange={(e) => setForm({ ...form, min_threshold: Number(e.target.value) })} />
<button className="bg-green-600 text-white px-3 py-1 rounded">Add</button>
</form>


<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{drugs.map(d => (
<DrugCard key={d.id} drug={d} currentUser={user} onDelete={deleteDrug} />
))}
</div>
</div>
)
}