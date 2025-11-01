import axios from 'axios'

const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'

const api = axios.create({ baseURL: backend })

// attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response interceptor to handle 401 -> try refresh once
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
    const originalReq = err.config
    if (err.response && err.response.status === 401 && !originalReq._retry) {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        // no refresh token: force logout
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(err)
      }

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalReq.headers['Authorization'] = 'Bearer ' + token
            return api(originalReq)
          })
          .catch((e) => Promise.reject(e))
      }

      originalReq._retry = true
      isRefreshing = true

      try {
        // call refresh endpoint directly (no auth header interference)
        const res = await axios.post(`${backend}/refresh`, { refreshToken })
        const newAccess = res.data.accessToken
        const newRefresh = res.data.refreshToken
        localStorage.setItem('accessToken', newAccess)
        if (newRefresh) {
          localStorage.setItem('refreshToken', newRefresh)
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`
        processQueue(null, newAccess)
        isRefreshing = false
        originalReq.headers['Authorization'] = 'Bearer ' + newAccess
        return api(originalReq)
      } catch (e) {
        processQueue(e, null)
        isRefreshing = false
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/login'
        return Promise.reject(e)
      }
    }
    return Promise.reject(err)
  }
)

export default api
