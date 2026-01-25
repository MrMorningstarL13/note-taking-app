import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

export const useUserStore = defineStore('user', () => {
    const router = useRouter()

    const user = ref(null)
    const isAuthenticated = ref(false)

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


    // --- Auth Initialization ---
    const token = Cookies.get('token')
    if (token) {
        try {
            const decoded = jwtDecode(token)
            user.value = decoded
            isAuthenticated.value = true
        } catch (e) {
            Cookies.remove('token')
        }
    }

    const defaultFolders = computed(() => [
        { id: 'all', name: 'All Notes', icon: 'Folder', type: 'default' },
        { id: 'favourites', name: 'Favourites', icon: 'Star', type: 'default' },
        { id: 'trash', name: 'Trash', icon: 'Trash2', type: 'default' },
    ])

    const allFolders = computed(() => [...defaultFolders.value, ...customFolders.value])
    const currentFolder = computed(() => allFolders.value.find(f => f.id === selectedFolderId.value) || defaultFolders.value[0])

    const filteredNotes = computed(() => {
        let result = notes.value

        if (selectedFolderId.value === 'all') {
            result = result.filter(n => !n.isTrashed)
        } else if (selectedFolderId.value === 'favourites') {
            result = result.filter(n => n.isFavourite && !n.isTrashed)
        } else if (selectedFolderId.value === 'trash') {
            result = result.filter(n => n.isTrashed)
        } else {
            result = result.filter(n => n.folderId === selectedFolderId.value && !n.isTrashed)
        }

        if (selectedTagId.value) {
            result = result.filter(n => n.tags.includes(selectedTagId.value))
        }
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

    function setUserData(userData) {
        if (!userData || !userData.folders) return;

        console.log('Setting user data:', userData);

        const newNotes = [];
        const newCustomFolders = [];

        userData.folders.forEach(folder => {
            let folderId = folder.name;
            if (folder.name === 'unfoldered') folderId = 'all';
            else if (folder.name === 'favorites') folderId = 'favourites';
            else {
                if (folder.id) {
                    folderId = folder.id;
                    newCustomFolders.push({
                        id: folder.id,
                        name: folder.name,
                        icon: 'FolderOpen',
                        type: 'custom'
                    });
                } else {
                    folderId = folder.name;
                    newCustomFolders.push({
                        id: folder.name,
                        name: folder.name,
                        icon: 'FolderOpen',
                        type: 'custom'
                    });
                }
            }

            if (folder.notes && Array.isArray(folder.notes)) {
                folder.notes.forEach(note => {
                    newNotes.push({
                        ...note,
                        folderId: folderId,
                        isFavourite: note.isFavourite || false,
                    });
                });
            }
        });

        notes.value = newNotes;
        folders.value = newFolders;

        // Auto-select first folder if nothing selected or current selection invalid
        if (!selectedFolderId.value || !newFolders.find(f => f.id === selectedFolderId.value)) {
            if (newFolders.length > 0) {
                selectedFolderId.value = newFolders[0].id;
            }
        }
    }

    // --- Persistence (Backend) ---
    let saveTimeout = null;
    const saveData = async () => {
        if (!isAuthenticated.value || !user.value) return;

        // Debounce
        if (saveTimeout) clearTimeout(saveTimeout);

        saveTimeout = setTimeout(async () => {
            // Reconstruct backend structure
            // We need to map notes back to their folders
            const folderStructure = folders.value.map(folder => {
                // Get notes that belong to this folder
                const folderNotes = notes.value.filter(n => n.folderId === folder.id);

                // Return folder object matching backend expectation
                return {
                    id: folder.id,
                    name: folder.name,
                    icon: folder.icon, // persistent icon if backend supports it
                    type: folder.type,
                    notes: folderNotes // These notes already have updated content
                };
            });

            console.log('Auto-saving user data...');

            try {
                const response = await fetch('http://localhost:8080/users/updateData', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.value.email,
                        folders: folderStructure
                    })
                });

                if (!response.ok) {
                    console.error('Failed to auto-save data');
                } else {
                    console.log('Data saved successfully');
                }
            } catch (error) {
                console.error('Error auto-saving data:', error);
            }
        }, 1000);
    };

    watch([notes, folders], saveData, { deep: true });

    async function login(email, password) {
        try {
            const response = await fetch('http://localhost:8080/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data || 'Login failed')
            }

            const { token, user: userData } = data
            Cookies.set('token', token, { expires: 7 })

            const decoded = jwtDecode(token)
            user.value = decoded
            isAuthenticated.value = true

            if (userData) {
                setUserData(userData)
            }

            return { success: true }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, message: error.message }
        }
    }

    async function register(email, password, displayName = 'User') {
        try {
            const response = await fetch('http://localhost:8080/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password, displayName })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data || 'Registration failed')
            }

            const { token, newUser } = data
            Cookies.set('token', token, { expires: 7 })

            const decoded = jwtDecode(token)
            user.value = decoded
            isAuthenticated.value = true

            if (newUser) {
                setUserData(newUser)
            }

            return { success: true }
        } catch (error) {
            console.error('Registration error:', error)
            return { success: false, message: error.message }
        }
    }

    function logout() {
        user.value = null
        isAuthenticated.value = false
        Cookies.remove('token')

        // Clear notes state on logout
        notes.value = []
        customFolders.value = []
        selectedFolderId.value = 'all'
        selectedNoteId.value = null

        router.push('/login')
    }

    async function createNote() {
        if (!isAuthenticated.value) return;

        let serverFolderName = 'unfoldered';
        if (selectedFolderId.value === 'favourites') {
            serverFolderName = 'favorites';
        } else if (selectedFolderId.value === 'trash') {
            serverFolderName = 'unfoldered';
        } else if (selectedFolderId.value !== 'all') {
            const folder = customFolders.value.find(f => f.id === selectedFolderId.value);
            if (folder) serverFolderName = folder.name;
        }

        try {
            const response = await fetch('http://localhost:8080/users/createNote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.value.email, folderName: serverFolderName })
            });

            const data = await response.json();
            if (response.ok) {
                const newNote = data.note;
                notes.value.unshift(newNote)
                selectedNoteId.value = newNote.id
            } else {
                console.error('Failed to create note:', data);
            }
        } catch (error) {
            console.error('Error creating note:', error);
        }
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
                notes.value = notes.value.filter(n => n.id !== id)
            } else {
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

    async function createFolder(name) {
        if (!isAuthenticated.value) return;

        try {
            const response = await fetch('http://localhost:8080/users/createFolder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.value.email, folderName: name })
            });

            const data = await response.json();
            if (response.ok) {
                const newFolder = data.folder;
                newFolder.icon = 'FolderOpen';
                newFolder.type = 'backend';
                folders.value.push(newFolder)
            } else {
                console.error('Failed to create folder:', data);
            }
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    }

    function deleteFolder(id) {
        folders.value = folders.value.filter(f => f.id !== id)
        // Note deletion logic? 
        // If we delete a folder locally, what happens to notes? 
        // Usually should call backend delete. Check backend support later.

        if (selectedFolderId.value === id) selectedFolderId.value = folders.value[0]?.id || null
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
        // Auth State
        user,
        isAuthenticated,
        // Notes State
        notes,
        folders,
        tags,
        // defaultFolders gone
        allFolders,
        currentFolder,
        filteredNotes,
        selectedFolderId,
        selectedNoteId,
        selectedTagId,
        selectedNote,
        searchQuery,

        // Auth Actions
        login,
        register,
        logout,

        // Notes Getters/Helpers
        getNotesCountForFolder,
        getTagById,

        // Notes Actions
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
        moveToFolder,
        saveData
    }
})
