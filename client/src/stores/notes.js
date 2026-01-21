import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'

export const useNotesStore = defineStore('notes', () => {
    // State
    const notes = ref([])
    const customFolders = ref([])
    const tags = ref([
        { id: 'tag-1', name: 'Work', color: '#ec4899' }, // Pink
        { id: 'tag-2', name: 'Personal', color: '#3b82f6' }, // Blue
        { id: 'tag-3', name: 'Ideas', color: '#f59e0b' }, // Amber
        { id: 'tag-4', name: 'Urgent', color: '#ef4444' }, // Red
    ])

    const selectedFolderId = ref('all')
    const selectedNoteId = ref(null)
    const selectedTagId = ref(null)
    const searchQuery = ref('')

    // Persistence
    const loadState = () => {
        const saved = localStorage.getItem('notes-app-state')
        if (saved) {
            const parsed = JSON.parse(saved)
            if (parsed.notes) notes.value = parsed.notes
            if (parsed.customFolders) customFolders.value = parsed.customFolders
            if (parsed.tags && parsed.tags.length > 0) tags.value = parsed.tags
        }
    }

    const saveState = () => {
        localStorage.setItem('notes-app-state', JSON.stringify({
            notes: notes.value,
            customFolders: customFolders.value,
            tags: tags.value
        }))
    }

    // Load initially
    loadState()

    // Watch for changes to save
    watch([notes, customFolders, tags], saveState, { deep: true })

    // Default Folders
    const defaultFolders = computed(() => [
        { id: 'all', name: 'All Notes', icon: 'Folder', type: 'default' },
        { id: 'favourites', name: 'Favourites', icon: 'Star', type: 'default' },
        { id: 'trash', name: 'Trash', icon: 'Trash2', type: 'default' },
    ])

    const allFolders = computed(() => [...defaultFolders.value, ...customFolders.value])
    const currentFolder = computed(() => allFolders.value.find(f => f.id === selectedFolderId.value) || defaultFolders.value[0])

    // Getters
    const filteredNotes = computed(() => {
        let result = notes.value

        // Filter by Folder
        if (selectedFolderId.value === 'all') {
            result = result.filter(n => !n.isTrashed)
        } else if (selectedFolderId.value === 'favourites') {
            result = result.filter(n => n.isFavourite && !n.isTrashed)
        } else if (selectedFolderId.value === 'trash') {
            result = result.filter(n => n.isTrashed)
        } else {
            result = result.filter(n => n.folderId === selectedFolderId.value && !n.isTrashed)
        }

        // Filter by Tag
        if (selectedTagId.value) {
            result = result.filter(n => n.tags.includes(selectedTagId.value))
        }

        // Search
        if (searchQuery.value) {
            const q = searchQuery.value.toLowerCase()
            result = result.filter(n =>
                (n.title && n.title.toLowerCase().includes(q)) ||
                (n.content && n.content.toLowerCase().includes(q))
            )
        }

        return result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    })

    const selectedNote = computed(() => notes.value.find(n => n.id === selectedNoteId.value))

    const getNotesCountForFolder = (folderId) => {
        if (folderId === 'all') return notes.value.filter(n => !n.isTrashed).length
        if (folderId === 'favourites') return notes.value.filter(n => n.isFavourite && !n.isTrashed).length
        if (folderId === 'trash') return notes.value.filter(n => n.isTrashed).length
        return notes.value.filter(n => n.folderId === folderId && !n.isTrashed).length
    }

    const getTagById = (id) => tags.value.find(t => t.id === id)

    // Actions
    function createNote() {
        const newNote = {
            id: uuidv4(),
            title: '',
            content: '',
            folderId: selectedFolderId.value === 'favourites' || selectedFolderId.value === 'trash' || selectedFolderId.value === 'all' ? 'all' : selectedFolderId.value,
            tags: [],
            isPinned: false,
            isFavourite: false,
            isTrashed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
        notes.value.unshift(newNote)
        selectedNoteId.value = newNote.id
    }

    function updateNote(id, updates) {
        const note = notes.value.find(n => n.id === id)
        if (note) {
            Object.assign(note, updates, { updatedAt: new Date().toISOString() })
        }
    }

    function deleteNote(id) {
        const note = notes.value.find(n => n.id === id)
        if (note) {
            if (note.isTrashed) {
                // Permanently delete
                notes.value = notes.value.filter(n => n.id !== id)
            } else {
                // Move to trash
                note.isTrashed = true
                note.updatedAt = new Date().toISOString()
            }
            if (selectedNoteId.value === id) selectedNoteId.value = null
        }
    }

    function restoreNote(id) {
        const note = notes.value.find(n => n.id === id)
        if (note) {
            note.isTrashed = false
            note.updatedAt = new Date().toISOString()
        }
    }

    function createFolder(name) {
        const newFolder = {
            id: uuidv4(),
            name,
            icon: 'FolderOpen',
            type: 'custom'
        }
        customFolders.value.push(newFolder)
    }

    function deleteFolder(id) {
        customFolders.value = customFolders.value.filter(f => f.id !== id)
        // Move notes to 'all' (remove folder association)
        notes.value.forEach(n => {
            if (n.folderId === id) n.folderId = 'all'
        })
        if (selectedFolderId.value === id) selectedFolderId.value = 'all'
    }

    function selectFolder(id) {
        selectedFolderId.value = id
        selectedNoteId.value = null
        selectedTagId.value = null
        searchQuery.value = ''
    }

    function selectNote(id) {
        selectedNoteId.value = id
    }

    function toggleTagFilter(id) {
        selectedTagId.value = selectedTagId.value === id ? null : id
    }

    function setSearchQuery(query) {
        searchQuery.value = query
    }

    function toggleFavourite(id) {
        const note = notes.value.find(n => n.id === id)
        if (note) {
            note.isFavourite = !note.isFavourite
            note.updatedAt = new Date().toISOString()
        }
    }

    function togglePin(id) {
        const note = notes.value.find(n => n.id === id)
        if (note) {
            note.isPinned = !note.isPinned
            note.updatedAt = new Date().toISOString()
        }
    }

    function toggleNoteTag(noteId, tagId) {
        const note = notes.value.find(n => n.id === noteId)
        if (note) {
            if (note.tags.includes(tagId)) {
                note.tags = note.tags.filter(t => t !== tagId)
            } else {
                note.tags.push(tagId)
            }
            note.updatedAt = new Date().toISOString()
        }
    }

    function moveToFolder(noteId, folderId) {
        const note = notes.value.find(n => n.id === noteId)
        if (note) {
            note.folderId = folderId
            note.updatedAt = new Date().toISOString()
        }
    }

    return {
        notes,
        customFolders,
        tags,
        defaultFolders,
        allFolders,
        currentFolder,
        filteredNotes,
        selectedFolderId,
        selectedNoteId,
        selectedTagId,
        selectedNote,
        searchQuery,

        getNotesCountForFolder,
        getTagById,

        createNote,
        updateNote,
        deleteNote,
        restoreNote,
        createFolder,
        deleteFolder,
        selectFolder,
        selectNote,
        toggleTagFilter,
        setSearchQuery,
        toggleFavourite,
        togglePin,
        toggleNoteTag,
        moveToFolder
    }
})
