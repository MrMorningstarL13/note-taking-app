<template>
  <div class="group relative flex items-center">
    <button
      @click="$emit('select', folder.id)"
      :class="[
        'w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left transition-all duration-300 relative overflow-hidden',
        isSelected
          ? 'bg-white/10 text-white shadow-lg backdrop-blur-md border border-white/10'
          : 'text-white/60 hover:bg-white/5 hover:text-white hover:pl-5'
      ]"
    >
      <!-- Active Indicator glow -->
      <div v-if="isSelected" class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]"></div>

      <component 
        :is="iconComponent" 
        :class="[
          'w-5 h-5 transition-all duration-300',
          isSelected ? 'text-cyan-300 scale-110' : 'group-hover:text-cyan-200 text-current'
        ]" 
      />
      
      <span class="flex-1 font-medium tracking-wide truncate">{{ folder.name }}</span>
      
      <span
        v-if="count > 0"
        :class="[
          'text-xs font-bold py-0.5 px-2 rounded-full transition-colors',
          isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-white/40 group-hover:text-white group-hover:bg-white/10'
        ]"
      >
        {{ count }}
      </span>
    </button>
    
    <!-- Delete Button for Custom Folders -->
    <button
      v-if="allowDelete"
      @click.stop="$emit('delete', folder.id)"
      class="absolute right-[-28px] opacity-0 group-hover:opacity-100 group-hover:right-2 p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white transition-all duration-300"
      title="Delete Folder"
    >
      <Trash2 class="w-3.5 h-3.5" />
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { FileText, Star, User, Briefcase, Trash2, Folder, FolderOpen } from 'lucide-vue-next'

const props = defineProps({
  folder: {
    type: Object,
    required: true
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: 0
  },
  allowDelete: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select', 'delete'])

const iconMap = {
  FileText,
  Star,
  User,
  Briefcase,
  Trash2,
  Folder,
  FolderOpen
}

const iconComponent = computed(() => iconMap[props.folder.icon] || Folder)
</script>
