import axios from 'axios'


const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:5000'


const api = axios.create({ baseURL: API_BASE })


// Attach access token to requests
api.interceptors.request.use((config) => {
const token = localStorage.getItem('access_token')
if (token) config.headers.Authorization = `Bearer ${token}`
return config
})


// Response interceptor: if 401, try refresh using refresh_token
let isRefreshing = false
let failedQueue = []


const processQueue = (error, token = null) => {
failedQueue.forEach((prom) => {
if (error) prom.reject(error)
else prom.resolve(token)
})
failedQueue = []
}


api.interceptors.response.use(
(res) => res,
async (err) => {
const originalRequest = err.config
if (err.response && err.response.status === 401 && !originalRequest._retry) {
originalRequest._retry = true
const refreshToken = localStorage.getItem('refresh_token')
if (!refreshToken) {
// no refresh - redirect to login handled in app
return Promise.reject(err)
}


if (isRefreshing) {
return new Promise(function (resolve, reject) {
failedQueue.push({ resolve, reject })
})
.then((token) => {
originalRequest.headers.Authorization = `Bearer ${token}`
return api(originalRequest)
})
.catch((e) => Promise.reject(e))
}


isRefreshing = true
try {
const r = await axios.post(`${API_BASE}/auth/refresh`, {}, {
headers: { Authorization: `Bearer ${refreshToken}` }
})
const newAccess = r.data.access_token
localStorage.setItem('access_token', newAccess)
api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`
processQueue(null, newAccess)
originalRequest.headers.Authorization = `Bearer ${newAccess}`
return api(originalRequest)
} catch (refreshErr) {
processQueue(refreshErr, null)
// clear tokens
localStorage.removeItem('access_token')
localStorage.removeItem('refresh_token')
return Promise.reject(refreshErr)
} finally {
isRefreshing = false
}
}
return Promise.reject(err)
}
)


export default api