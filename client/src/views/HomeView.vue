<template>
  <div class="h-screen flex overflow-hidden font-sans text-white selection:bg-pink-500/30">
    <!-- Sidebar -->
    <aside 
      :class="[
        'w-full md:w-72 bg-white/5 backdrop-blur-2xl border-r border-white/10 flex-col transition-all duration-300 shadow-2xl z-10 relative',
        mobileView === 'sidebar' ? 'flex' : 'hidden',
        'md:flex'
      ]"
    >
      <div class="p-6 border-b border-white/5 bg-white/5">
        <h1 class="text-4xl font-black tracking-tight bg-gradient-to-r from-sky-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
          Notes
        </h1>
      </div>
      
      <nav class="flex-1 overflow-y-auto p-4 space-y-6">
        <!-- Folders -->
        <div class="space-y-1">
          <div class="flex items-center justify-between px-2 mb-3">
             <span class="text-xs font-bold uppercase tracking-widest text-white/40">Folders</span>
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

          <FolderItem
            v-for="folder in store.allFolders"
            :key="folder.id"
            :folder="folder"
            :is-selected="store.selectedFolderId === folder.id"
            :count="store.getNotesCountForFolder(folder.id)"
            @select="handleFolderSelect"
            @delete="store.deleteFolder"
            @rename="({ id, name }) => store.updateFolder(id, name)"
            :allow-delete="folder.type !== 'virtual'" 
          />
        </div>
      </nav>

      <div class="p-4 border-t border-white/5 bg-white/5 backdrop-blur-md">
        <div class="flex items-center justify-between gap-3 px-2 py-3 rounded-2xl bg-white/5 border border-white/10 shadow-lg group/user transition-all duration-300 hover:bg-white/10">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover/user:scale-105 transition-transform duration-300">
              <User class="w-5 h-5 text-cyan-300" />
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-sm font-bold text-white truncate">{{ store.userRef?.displayName || store.userRef?.email || 'User' }}</span>
            </div>
          </div>
          
          <button
            @click="store.logout"
            class="p-2.5 rounded-xl text-white/40 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 hover:scale-110 active:scale-90 flex-shrink-0"
            title="Logout"
          >
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>

    <NoteList 
      :class="[
        mobileView === 'list' ? 'flex' : 'hidden',
        'md:flex'
      ]"
      @open-menu="mobileView = 'sidebar'"
      @select-note="handleNoteSelect"
    />

    <NoteEditor 
      :class="[
        mobileView === 'editor' ? 'flex' : 'hidden',
        'md:flex'
      ]"
      @back="mobileView = 'list'"
    />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { Plus, LogOut, User } from 'lucide-vue-next'
import { useUserStore } from '../stores/user'
import FolderItem from '../components/FolderItem.vue'
import NoteList from '../components/NoteList.vue'
import NoteEditor from '../components/NoteEditor.vue'

const store = useUserStore()

const mobileView = ref('sidebar')

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

function handleFolderSelect(folderId) {
  store.selectFolder(folderId)
  mobileView.value = 'list'
}

function handleNoteSelect(noteId) {
  store.selectNote(noteId)
  mobileView.value = 'editor'
}

watch(showNewFolderInput, (val) => {
  if (val) {
    nextTick(() => newFolderInput.value?.focus())
  }
})
</script>
