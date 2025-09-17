import { useEffect, useState } from 'react'
import api from '../api'
import DrugCard from '../components/DrugCard'


export default function LowStock({ user }) {
const [drugs, setDrugs] = useState([])
useEffect(() => { api.get('/drugs/low_stock').then(r => setDrugs(r.data)) }, [])


return (
<div>
<h2 className="text-2xl font-bold mb-4">Low Stock</h2>
{drugs.length === 0 ? <p>All stocked up 🎉</p> : (
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">{drugs.map(d => <DrugCard key={d.id} drug={d} currentUser={user} />)}</div>
)}
</div>
)
}