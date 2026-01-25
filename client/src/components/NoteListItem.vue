<template>
  <button
    @click="$emit('select', note.id)"
    :class="[
      'w-full p-4 text-left transition-all duration-300 rounded-xl border group relative overflow-hidden',
      isSelected 
        ? 'bg-white/10 border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.15)]' 
        : 'border-transparent bg-white/5 hover:bg-white/10 hover:border-white/10 hover:scale-[1.02]'
    ]"
  >
    <!-- Selection Glow -->
    <div v-if="isSelected" class="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-transparent opacity-50"></div>

    <div class="flex items-start gap-3 relative z-10 w-full">
      <div class="flex-1 min-w-0 space-y-1">
        <div class="flex items-center gap-2">
          <h3 class="font-bold text-white truncate text-base group-hover:text-pink-200 transition-colors">
            {{ note.title || 'Untitled Note' }}
          </h3>
        </div>
        
        <p class="text-sm text-white/50 truncate font-light">
          {{ note.content || 'No additional text' }}
        </p>
        
        <div class="flex items-center gap-3 mt-3">
          <span class="text-xs font-medium text-white/30 group-hover:text-white/50 transition-colors">
            {{ formattedDate }}
          </span>
        </div>
      </div>

      <Star
        v-if="note.isFavourite"
        class="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
      />
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { Star } from 'lucide-vue-next'
import { useUserStore } from '../stores/user'

const props = defineProps({
  note: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  }
})

const store = useUserStore()

defineEmits(['select'])

const formattedDate = computed(() => {
  const d = new Date(props.note.updatedAt)
  const now = new Date()
  const diff = now - d

  if (diff < 86400000) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  } else if (diff < 604800000) {
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})
</script>
