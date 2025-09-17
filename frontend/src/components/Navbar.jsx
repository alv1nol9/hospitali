import { Link } from 'react-router-dom'


export default function Navbar({ user, onLogout }) {
return (
<nav className="bg-indigo-600 text-white p-4">
<div className="max-w-6xl mx-auto flex justify-between items-center">
<div className="font-bold">Drug Inventory</div>
<div className="flex items-center gap-4">
<Link to="/drugs">All</Link>
<Link to="/drugs/mine">Mine</Link>
<Link to="/drugs/low_stock">Low Stock</Link>
<Link to="/drugs/search">Search</Link>
{!user ? (
<>
<Link to="/login">Login</Link>
<Link to="/register">Register</Link>
</>
) : (
<>
<span className="text-sm">{user.username}</span>
<button onClick={onLogout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
</>
)}
</div>
</div>
</nav>
)
}