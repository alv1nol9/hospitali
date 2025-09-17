import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'


export default function Register() {
const [username, setUsername] = useState('')
const [password, setPassword] = useState('')
const navigate = useNavigate()


async function submit(e) {
e.preventDefault()
try {
await api.post('/auth/register', { username, password })
alert('Registered. Please login.')
navigate('/login')
} catch (err) {
alert(err.response?.data?.message || 'Register failed')
}
}


return (
<div className="max-w-sm mx-auto mt-8 bg-white p-6 rounded shadow">
<h2 className="text-xl font-bold mb-4">Register</h2>
<form onSubmit={submit} className="flex flex-col gap-3">
<input className="border p-2 rounded" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
<input type="password" className="border p-2 rounded" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
<button className="bg-green-600 text-white px-3 py-2 rounded">Register</button>
</form>
</div>
)
}