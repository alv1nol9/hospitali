export default function DrugCard({ drug, currentUser, onDelete }) {
const canEdit = currentUser && (currentUser.role === 'admin' || currentUser.username === drug.owner)
return (
<div className="border rounded p-4 bg-white">
<h3 className="font-semibold">{drug.name}</h3>
<p>Qty: {drug.quantity}</p>
<p>Min: {drug.min_threshold}</p>
<p className="text-sm text-gray-500">Owner: {drug.owner}</p>
{drug.low_stock && <p className="text-red-600">Low stock</p>}
{canEdit && (
<div className="mt-2 flex gap-2">
<button onClick={() => onDelete && onDelete(drug.id)} className="bg-red-600 text-white px-3 py-1 rounded">Delete</button>
</div>
)}
</div>
)
}