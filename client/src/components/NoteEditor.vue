<template>
  <div class="flex-1 flex flex-col relative z-0 min-w-0">

    <div v-if="!store.selectedNote" class="flex-1 flex flex-col items-center justify-center text-white/30">
      <div class="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 ring-1 ring-white/10 animate-pulse">
        <FileText class="w-10 h-10 opacity-50" />
      </div>
      <p class="text-2xl font-bold tracking-tight mb-2">Select a note to view</p>
      <p class="text-sm opacity-60">Choose from the list or create a new one</p>
    </div>

    <template v-else>
      <div class="flex items-center justify-between p-4 border-b border-white/5 bg-white/5 backdrop-blur-md z-30 relative">
        <div class="flex items-center gap-2">
          <button 
            @click="$emit('back')"
            class="md:hidden p-2.5 rounded-xl text-white/40 hover:bg-white/10 hover:text-white transition-all duration-300"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          
          <button
            @click="store.toggleFavourite(store.selectedNoteId)"
            :class="[
              'p-2.5 rounded-xl transition-all duration-300 hover:scale-110 cursor-pointer',
              store.selectedNote.isFavourite
                ? 'text-yellow-400 bg-yellow-500/20 shadow-[0_0_15px_rgba(250,204,21,0.2)]'
                : 'text-white/40 hover:bg-white/10 hover:text-white'
            ]"
            title="Toggle Favourite"
          >
            <Star :class="['w-5 h-5', store.selectedNote.isFavourite && 'fill-yellow-400']" />
          </button>
        </div>

        <div class="flex items-center gap-2">
          <div class="relative">
            <button
              @click="showFolderMenu = !showFolderMenu"
              class="p-2.5 rounded-xl text-white/40 hover:bg-white/10 hover:text-white transition-all duration-300 hover:scale-110"
              title="Move to Folder"
            >
              <FolderOpen class="w-5 h-5" />
            </button>

            <button
              @click="showAIPrompt = true"
              class="p-2.5 rounded-xl text-cyan-400/60 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all duration-300 hover:scale-110"
              title="AI Magic Suggestion"
            >
              <Wand2 class="w-5 h-5" />
            </button>

            <div
              v-if="showFolderMenu"
              class="absolute right-0 top-full mt-2 w-56 bg-black/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 py-2 z-20 overflow-hidden"
            >
              <div class="px-4 py-2 text-xs font-bold text-white/40 uppercase tracking-wider">Move to...</div>
              <button
                v-for="folder in availableFolders"
                :key="folder.id"
                @click="handleMoveToFolder(folder.id)"
                class="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 text-left transition-colors group"
              >
                <component :is="getIcon(folder.icon)" class="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                <span class="flex-1 text-sm text-white/80 group-hover:text-white">{{ folder.name }}</span>
                <Check
                  v-if="currentNoteFolder?.id === folder.id"
                  class="w-4 h-4 text-pink-500"
                />
              </button>
            </div>
          </div>

          <div class="w-px h-6 bg-white/10 mx-1"></div>

          <button
            @click="store.deleteNote(store.selectedNoteId)"
            class="p-2.5 rounded-xl text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 hover:scale-110"
            title="Delete Note"
          >
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-10 py-8 custom-scrollbar">
        <input
          :value="store.selectedNote.title"
          @input="handleTitleChange"
          placeholder="Untitled Note"
          class="w-full text-5xl font-black text-transparent bg-gradient-to-r from-white via-white to-white/70 bg-clip-text caret-white placeholder-white/20 border-none outline-none bg-transparent mb-6 tracking-tight drop-shadow-sm"
        />
        
        <div class="flex items-center gap-4 mb-10 text-sm">
          <span class="font-medium text-white/40 bg-white/5 px-2 py-1 rounded-lg">{{ formattedDate }}</span>
        </div>

        <textarea
          :value="store.selectedNote.content"
          @input="handleContentChange"
          placeholder="Start writing..."
          class="w-full min-h-[800px] text-white/90 placeholder-white/20 border-none outline-none bg-transparent resize-none leading-loose text-lg font-light tracking-wide selection:bg-pink-500/30"
        />
      </div>
    </template>

    <div
      v-if="showFolderMenu || showAIPrompt"
      @click="closeOverlays"
      class="fixed inset-0 z-20"
    />


    <Transition name="fade">
      <div 
        v-if="showAIPrompt" 
        class="absolute inset-x-10 top-20 bg-black/60 backdrop-blur-3xl border border-cyan-500/30 rounded-[2rem] p-8 z-40 shadow-[0_0_50px_rgba(34,211,238,0.15)] duration-300"
      >
        <div class="flex items-center gap-3 mb-6 font-bold text-cyan-400 tracking-wider uppercase text-xs">
          <Sparkles class="w-4 h-4 animate-pulse" />
          AI Magic Assistant
        </div>
        
        <input 
          v-model="aiPromptText"
          @keyup.enter="handleAIGenerate"
          placeholder="What should I write for you? (e.g. 'A recipe for sushi')"
          class="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all mb-4"
          ref="aiInput"
          autofocus
        />

        <div class="flex justify-end gap-3">
          <button 
            @click="showAIPrompt = false"
            class="px-5 py-2.5 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
          >
            Cancel
          </button>
          <button 
            @click="handleAIGenerate"
            :disabled="isGeneratingAI || !aiPromptText.trim()"
            class="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl text-white font-bold text-sm shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Loader2 v-if="isGeneratingAI" class="w-4 h-4 animate-spin" />
            {{ isGeneratingAI ? 'AI is thinking...' : 'Generate Wisdom' }}
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  FileText, Star, FolderOpen, Trash2,
  Folder, User, Briefcase, ArrowLeft, Check,
  Wand2, Sparkles, Loader2
} from 'lucide-vue-next'
import { useUserStore } from '../stores/user'

const store = useUserStore()
defineEmits(['back'])

const showFolderMenu = ref(false)
const showAIPrompt = ref(false)
const aiPromptText = ref('')
const isGeneratingAI = ref(false)
const aiInput = ref(null)

const iconMap = {
  FileText,
  Star,
  User,
  Briefcase,
  Trash2,
  Folder,
  FolderOpen
}

const getIcon = (iconName) => iconMap[iconName] || Folder

const availableFolders = computed(() => store.allPhysicalFolders)

const currentNoteFolder = computed(() => {
  if (!store.selectedNoteId) return null
  return store.allPhysicalFolders.find(f => 
    f.notes.some(n => n.id === store.selectedNoteId)
  )
})

const formattedDate = computed(() => {
  if (!store.selectedNote) return ''
  const d = new Date(store.selectedNote.updatedAt)
  const now = new Date()
  const diff = now - d

  if (diff < 86400000) {
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  } else if (diff < 604800000) {
    return d.toLocaleDateString('en-US', { weekday: 'short' })
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
})

function handleTitleChange(event) {
  store.updateNote(store.selectedNoteId, { title: event.target.value })
}

function handleContentChange(event) {
  store.updateNote(store.selectedNoteId, { content: event.target.value })
}

function handleMoveToFolder(newFolderId) {
  store.moveToFolder(store.selectedNoteId, newFolderId)
  showFolderMenu.value = false
}

async function handleAIGenerate() {
  if (!aiPromptText.value.trim() || isGeneratingAI.value) return
  
  isGeneratingAI.value = true
  const result = await store.generateAINote(aiPromptText.value)
  isGeneratingAI.value = false
  
  if (result.success) {
    showAIPrompt.value = false
    aiPromptText.value = ''
  } else {
    alert('AI was too busy thinking. Try again!')
  }
}

function closeOverlays() {
  showFolderMenu.value = false
  showAIPrompt.value = false
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>