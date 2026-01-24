<template>
  <div class="w-80 border-r border-white/10 bg-white/5 backdrop-blur-3xl flex flex-col transition-all duration-300 shadow-2xl z-0">
    <!-- Header -->
    <div class="p-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
      <div class="flex items-center gap-3 mb-4">
        <h2 class="font-black text-2xl text-white tracking-tight drop-shadow-md truncate">{{ store.currentFolder.name }}</h2>
        <span class="px-2 py-0.5 rounded-full bg-white/10 text-xs font-bold text-white/60 border border-white/5 flex-shrink-0">
          {{ store.filteredNotes.length }}
        </span>
      </div>
      
      <!-- Search -->
      <div class="relative group">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-pink-400 transition-colors" />
        <input
          :value="store.searchQuery"
          @input="store.setSearchQuery($event.target.value)"
          placeholder="Search notes..."
          class="w-full pl-10 pr-4 py-3 rounded-xl border border-white/10 bg-black/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 text-sm backdrop-blur-sm transition-all shadow-inner focus:bg-black/30"
        />
      </div>
    </div>

    <!-- Notes List -->
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      <div v-if="store.filteredNotes.length === 0" class="flex flex-col items-center justify-center p-8 h-full text-center">
        <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 ring-1 ring-white/10">
          <FileText class="w-8 h-8 text-white/20" />
        </div>
        <p class="text-white/40 font-medium">No notes here yet</p>
      </div>
      
      <div v-else class="p-3 space-y-2">
        <NoteListItem
          v-for="note in store.filteredNotes"
          :key="note.id"
          :note="note"
          :is-selected="store.selectedNoteId === note.id"
          @select="store.selectNote"
        />
      </div>
    </div>

    <!-- New Note Button -->
    <div class="p-4 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent backdrop-blur-sm">
      <button
        @click="store.createNote"
        class="group w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 text-white font-bold rounded-xl hover:from-cyan-400 hover:via-blue-400 hover:to-purple-500 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] active:scale-[0.98] border border-white/10"
      >
        <Plus class="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        <span class="tracking-wide">Create Note</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { Search, FileText, Plus } from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import NoteListItem from './NoteListItem.vue'

const store = useUserStore()
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>
