import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'


export default function Login({ onLogin }) {
const [username, setUsername] = useState('')
const [password, setPassword] = useState('')
const navigate = useNavigate()


async function submit(e) {
e.preventDefault()
try {
const res = await api.post('/auth/login', { username, password })
onLogin(res.data)
navigate('/drugs')
} catch (err) {
alert(err.response?.data?.message || 'Login failed')
}
}


return (
<div className="max-w-sm mx-auto mt-8 bg-white p-6 rounded shadow">
<h2 className="text-xl font-bold mb-4">Login</h2>
<form onSubmit={submit} className="flex flex-col gap-3">
<input className="border p-2 rounded" placeholder="username" value={username} onChange={(e) => setUsername(e.target.value)} />
<input type="password" className="border p-2 rounded" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} />
<button className="bg-indigo-600 text-white px-3 py-2 rounded">Login</button>
</form>
</div>
)
}