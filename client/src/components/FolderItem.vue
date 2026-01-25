<template>
  <div class="group relative flex items-center">
    <!-- Rename Input -->
    <div v-if="isEditing" class="w-full px-4 py-2">
      <input
        v-model="editName"
        @keyup.enter="saveRename"
        @blur="saveRename"
        class="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50"
        ref="renameInput"
      />
    </div>

    <button
      v-else
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
    
    <!-- Actions -->
    <div v-if="folder.id !== 'favourites'" class="absolute right-[-60px] opacity-0 group-hover:opacity-100 group-hover:right-2 flex items-center gap-1 transition-all duration-300">
      <!-- Rename Button -->
      <button
        v-if="allowDelete && !isEditing"
        @click.stop="startRename"
        class="p-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-all"
        title="Rename Folder"
      >
        <Pencil class="w-3.5 h-3.5" />
      </button>

      <!-- Delete Button for Custom Folders -->
      <button
        v-if="allowDelete && !isEditing"
        @click.stop="$emit('delete', folder.id)"
        class="p-1.5 rounded-lg bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white transition-all"
        title="Delete Folder"
      >
        <Trash2 class="w-3.5 h-3.5" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, nextTick } from 'vue'
import { FileText, Star, User, Briefcase, Trash2, Folder, FolderOpen, Pencil } from 'lucide-vue-next'

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

const emit = defineEmits(['select', 'delete', 'rename'])

const isEditing = ref(false)
const editName = ref(props.folder.name)
const renameInput = ref(null)

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

function startRename() {
  isEditing.value = true
  editName.value = props.folder.name
  nextTick(() => {
    renameInput.value?.focus()
    renameInput.value?.select()
  })
}

function saveRename() {
  if (!isEditing.value) return
  
  if (editName.value.trim() && editName.value !== props.folder.name) {
    emit('rename', { id: props.folder.id, name: editName.value.trim() })
  }
  
  isEditing.value = false
}
</script>
