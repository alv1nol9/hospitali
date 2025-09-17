import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import api from './api'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Drugs from './pages/Drugs'
import MyDrugs from './pages/MyDrugs'
import LowStock from './pages/LowStock'
import Search from './pages/Search'


function AppWrapper() {
const [user, setUser] = useState(null)


useEffect(() => {
async function fetchMe() {
const token = localStorage.getItem('access_token')
if (!token) return
try {
const res = await api.get('/auth/me')
setUser(res.data)
} catch (e) {
setUser(null)
}
}
fetchMe()
}, [])


const handleLogin = (authData) => {
localStorage.setItem('access_token', authData.access_token)
if (authData.refresh_token) localStorage.setItem('refresh_token', authData.refresh_token)
setUser(authData.user)
}


const handleLogout = async () => {
const access = localStorage.getItem('access_token')
const refresh = localStorage.getItem('refresh_token')
try { if (access) await api.post('/auth/logout/access') } catch (e) {}
try { if (refresh) await api.post('/auth/logout/refresh') } catch (e) {}
localStorage.removeItem('access_token')
localStorage.removeItem('refresh_token')
setUser(null)
}


return (
<BrowserRouter>
<Navbar user={user} onLogout={handleLogout} />
<div className="max-w-6xl mx-auto p-4">
<Routes>
<Route path="/" element={<Navigate to="/drugs" replace />} />
<Route path="/login" element={<Login onLogin={handleLogin} />} />
<Route path="/register" element={<Register />} />
<Route path="/drugs" element={<Drugs user={user} />} />
<Route path="/drugs/mine" element={<MyDrugs user={user} />} />
<Route path="/drugs/low_stock" element={<LowStock user={user} />} />
<Route path="/drugs/search" element={<Search user={user} />} />
</Routes>
</div>
</BrowserRouter>
)
}


export default AppWrapper