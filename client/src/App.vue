<template>
  <div class="h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-rose-950 flex overflow-hidden font-sans text-white selection:bg-pink-500/30">
    <!-- Abstract background blobs for extra dynamism -->
    <div class="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
      <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[120px] animate-pulse"></div>
      <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-rose-600/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
    </div>

    <aside class="w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-all duration-300 shadow-2xl z-10 relative">
      <div class="p-6 border-b border-white/5 bg-white/5">
        <h1 class="text-4xl font-black tracking-tight bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
          Notes
        </h1>
      </div>
      
      <nav class="flex-1 overflow-y-auto p-4 space-y-6">
        <!-- Default Folders -->
        <div class="space-y-1">
          <FolderItem
            v-for="folder in store.defaultFolders"
            :key="folder.id"
            :folder="folder"
            :is-selected="store.selectedFolderId === folder.id"
            :count="store.getNotesCountForFolder(folder.id)"
            @select="store.selectFolder"
          />
        </div>

        <!-- Custom Folders -->
        <div>
          <div class="flex items-center justify-between px-2 mb-3">
            <span class="text-xs font-bold uppercase tracking-widest text-white/40">My Folders</span>
            <button
              @click="showNewFolderInput = true"
              class="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-all duration-300 hover:rotate-90 hover:shadow-glow"
            >
              <Plus class="w-4 h-4" />
            </button>
          </div>
          
          <div v-if="showNewFolderInput" class="mb-3 px-1">
            <input
              v-model="newFolderName"
              @keyup.enter="handleCreateFolder"
              @blur="showNewFolderInput = false"
              placeholder="Folder name..."
              class="w-full px-4 py-2 text-sm rounded-xl border border-white/20 bg-black/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 backdrop-blur-sm transition-all shadow-inner"
              ref="newFolderInput"
            />
          </div>

          <div class="space-y-1">
            <FolderItem
              v-for="folder in store.customFolders"
              :key="folder.id"
              :folder="folder"
              :is-selected="store.selectedFolderId === folder.id"
              :count="store.getNotesCountForFolder(folder.id)"
              @select="store.selectFolder"
              @delete="store.deleteFolder"
              :allow-delete="true"
            />
          </div>
        </div>
      </nav>

      <!-- Tags Section -->
      <div class="p-5 border-t border-white/10 bg-gradient-to-t from-black/20 to-transparent">
        <span class="text-xs font-bold text-white/40 uppercase tracking-widest">Tags</span>
        <div class="flex flex-wrap gap-2 mt-4">
          <button
            v-for="tag in store.tags"
            :key="tag.id"
            @click="store.toggleTagFilter(tag.id)"
            :class="[
              'px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-300 border',
              store.selectedTagId === tag.id
                ? 'text-white border-transparent shadow-[0_0_15px_rgba(0,0,0,0.3)] scale-105'
                : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-105'
            ]"
            :style="store.selectedTagId === tag.id ? { backgroundColor: tag.color, boxShadow: `0 0 15px ${tag.color}60` } : {}"
          >
            {{ tag.name }}
          </button>
        </div>
      </div>
    </aside>

    <!-- Notes List -->
    <NoteList />

    <!-- Note Editor -->
    <NoteEditor />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useNotesStore } from './stores/notes'
import FolderItem from './components/FolderItem.vue'
import NoteList from './components/NoteList.vue'
import NoteEditor from './components/NoteEditor.vue'

const store = useNotesStore()

const showNewFolderInput = ref(false)
const newFolderName = ref('')
const newFolderInput = ref(null)

function handleCreateFolder() {
  if (newFolderName.value.trim()) {
    store.createFolder(newFolderName.value)
    newFolderName.value = ''
    showNewFolderInput.value = false
  }
}

watch(showNewFolderInput, (val) => {
  if (val) {
    nextTick(() => newFolderInput.value?.focus())
  }
})
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Outfit', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom Scrollbar for a cleaner look */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
