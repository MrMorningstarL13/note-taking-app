import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null)
    const isAuthenticated = ref(false)
    const router = useRouter()

    // Initialize state from cookie
    const token = Cookies.get('token')
    if (token) {
        try {
            const decoded = jwtDecode(token)
            // Assuming token contains user info payload, otherwise we might need to fetch profile
            user.value = decoded
            isAuthenticated.value = true
        } catch (e) {
            Cookies.remove('token')
        }
    }

    async function login(email, password) {
        try {
            const response = await fetch('http://localhost:8080/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data || 'Login failed')
            }

            const { token } = data
            Cookies.set('token', token, { expires: 7 }) // 7 days

            const decoded = jwtDecode(token)
            user.value = decoded
            isAuthenticated.value = true

            return { success: true }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, message: error.message }
        }
    }

    async function register(email, password, displayName = 'User') {
        try {
            const response = await fetch('http://localhost:8080/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password, displayName })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data || 'Registration failed')
            }

            const { token } = data
            Cookies.set('token', token, { expires: 7 })

            const decoded = jwtDecode(token)
            user.value = decoded
            isAuthenticated.value = true

            return { success: true }
        } catch (error) {
            console.error('Registration error:', error)
            return { success: false, message: error.message }
        }
    }

    function logout() {
        user.value = null
        isAuthenticated.value = false
        Cookies.remove('token')
        router.push('/login')
    }

    return {
        user,
        isAuthenticated,
        login,
        register,
        logout
    }
})
