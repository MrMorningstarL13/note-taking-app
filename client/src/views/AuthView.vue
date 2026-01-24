<template>
  <div class="flex items-center justify-center w-full h-full min-h-screen p-4">
    <!-- Card Container -->
    <div class="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden relative z-10 transition-all duration-500">
      
      <!-- Top Decor -->
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400"></div>

      <div class="p-8 md:p-10">
        <!-- Logo / Header -->
        <div class="text-center mb-10">
          <h1 class="text-4xl font-black bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-md mb-2">
            Notes
          </h1>
          <p class="text-white/60 text-sm font-medium">
            {{ isLogin ? 'Welcome back! Please login.' : 'Create an account to get started.' }}
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          
          <!-- Email Input -->
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">Email</label>
            <input 
              v-model="email"
              type="email" 
              required
              placeholder="you@example.com"
              class="w-full px-5 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all shadow-inner"
            />
          </div>

          <!-- Password Input -->
          <div class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">Password</label>
            <input 
              v-model="password"
              type="password" 
              required
              placeholder="••••••••"
              class="w-full px-5 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all shadow-inner"
            />
          </div>

          <!-- Confirm Password (Signup only) -->
          <div v-if="!isLogin" class="space-y-2 animate-in slide-in-from-top-4 fade-in duration-300">
            <label class="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">Confirm Password</label>
            <input 
              v-model="confirmPassword"
              type="password" 
              required
              placeholder="••••••••"
              class="w-full px-5 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all shadow-inner"
            />
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            class="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 shadow-lg shadow-purple-500/30 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4"
          >
            {{ isLogin ? 'Log In' : 'Sign Up' }}
          </button>
        </form>

        <!-- Toggle Mode -->
        <div class="mt-8 text-center">
          <p class="text-sm text-white/60">
            {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
            <button 
              @click="toggleMode"
              class="font-bold text-pink-400 hover:text-pink-300 ml-1 transition-colors underline decoration-2 underline-offset-4"
            >
              {{ isLogin ? 'Sign up' : 'Log in' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ref } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')

const userStore = useUserStore()
const router = useRouter()

function toggleMode() {
  isLogin.value = !isLogin.value
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
}

async function handleSubmit() {
  if (!isLogin.value && password.value !== confirmPassword.value) {
    alert("Passwords don't match!")
    return
  }

  const result = isLogin.value 
    ? await userStore.login(email.value, password.value)
    : await userStore.register(email.value, password.value)

  if (result.success) {
    router.push('/')
  } else {
    alert(result.message || 'Authentication failed')
  }
}
</script>
