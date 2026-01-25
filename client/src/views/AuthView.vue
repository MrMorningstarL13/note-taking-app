<template>
  <div class="flex items-center justify-center w-full h-full min-h-screen p-4">
    <!-- Card Container -->
    <div class="w-full max-w-md relative z-10 transition-all duration-500">
      
      <!-- Top Banner for Backend Errors -->
      <Transition name="fade">
        <div 
          v-if="error" 
          class="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-sm flex items-center gap-3 backdrop-blur-xl animate-shake"
        >
          <div class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
          {{ error }}
        </div>
      </Transition>

      <div class="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden group">
        <!-- Top Decor -->
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 opacity-60"></div>

        <!-- Logo / Header -->
        <div class="text-center mb-10">
          <h1 class="text-4xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm mb-2">
            Notes
          </h1>
          <p class="text-white/60 text-sm font-medium">
            {{ isLogin ? 'Welcome back! Please login.' : 'Create an account to get started.' }}
          </p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          
          <!-- Email Input -->
          <div>
            <label class="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">Email</label>
            <input 
              v-model="email"
              type="email" 
              required
              placeholder="hello@example.com"
              class="w-full px-5 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all shadow-inner"
            />
            <p v-if="email && !isEmailValid" class="text-[10px] text-red-400/80 ml-1 font-medium">Please enter a valid email address</p>
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
            <p v-if="!isLogin && password && password.length < 6" class="text-[10px] text-red-400/80 ml-1 font-medium italic">Min. 6 characters required</p>
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
            <p v-if="confirmPassword && password !== confirmPassword" class="text-[10px] text-red-400/80 ml-1 font-medium">Passwords do not match</p>
          </div>

          <div v-if="!isLogin" class="space-y-2">
            <label class="text-xs font-bold uppercase tracking-widest text-white/50 ml-1">Display name</label>
            <input 
              v-model="displayName"
              type="text" 
              required
              placeholder="Your name"
              class="w-full px-5 py-3.5 bg-black/20 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-transparent transition-all shadow-inner"
            />
            <p v-if="displayName && displayName.length > 30" class="text-[10px] text-red-400 ml-1">Name must be under 30 characters</p>
          </div>

          <!-- Submit Button -->
          <button 
            type="submit"
            :disabled="!isFormValid || isLoading"
            :class="[
              'w-full py-4 rounded-2xl font-bold tracking-widest uppercase text-sm transition-all duration-500 relative overflow-hidden group',
              isFormValid && !isLoading
                ? 'bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-white shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-95 cursor-pointer'
                : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
            ]"
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
import { ref, computed } from 'vue'
import { useUserStore } from '../stores/user'
import { useRouter } from 'vue-router'

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const displayName = ref('')

const isLoading = ref(false)
const error = ref('')

const isEmailValid = computed(() => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email.value)
})

const isFormValid = computed(() => {
  if (isLogin.value) {
    return isEmailValid.value && password.value.length > 0
  } else {
    return isEmailValid.value && 
           password.value.length >= 6 && 
           password.value === confirmPassword.value &&
           displayName.value.trim().length > 0 &&
           displayName.value.length <= 30
  }
})

const userStore = useUserStore()
const router = useRouter()

function toggleMode() {
  isLogin.value = !isLogin.value
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  displayName.value = ''
  error.value = ''
}

async function handleSubmit() {
  if (!isFormValid.value) return
  
  error.value = ''
  isLoading.value = true

  const result = isLogin.value 
    ? await userStore.login(email.value, password.value)
    : await userStore.register(email.value, password.value, displayName.value)

  isLoading.value = false

  if (result.success) {
    router.push('/')
  } else {
    error.value = result.message || 'Authentication failed'
  }
}
</script>

<style scoped>
.animate-shake {
  animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shake {
  10%, 90% { transform: translate3d(-1px, 0, 0); }
  20%, 80% { transform: translate3d(2px, 0, 0); }
  30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
  40%, 60% { transform: translate3d(4px, 0, 0); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
