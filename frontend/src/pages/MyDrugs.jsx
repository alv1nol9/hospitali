import { useEffect, useState } from 'react'
import api from '../api'
import DrugCard from '../components/DrugCard'


export default function MyDrugs({ user }) {
const [drugs, setDrugs] = useState([])


async function fetchMine() {
try {
const res = await api.get('/drugs/mine')
setDrugs(res.data)
} catch (err) {
console.error(err)
}
}


useEffect(() => { fetchMine() }, [])


async function deleteDrug(id) {
if (!confirm('Delete?')) return
await api.delete(`/drugs/${id}`)
fetchMine()
}


return (
<div>
<h2 className="text-2xl font-bold mb-4">My Drugs</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{drugs.map(d => <DrugCard key={d.id} drug={d} currentUser={user} onDelete={deleteDrug} />)}
</div>
</div>
)
}