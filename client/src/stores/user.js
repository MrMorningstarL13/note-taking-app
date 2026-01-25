import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { v4 as uuidv4 } from 'uuid'

export const useUserStore = defineStore('user', () => {
    const router = useRouter()

    const userRef = ref(null)
    const isAuthenticated = ref(false)

    const folders = ref([])
    const notes = computed(() => folders.value.flatMap(f => f.notes || []))
    const selectedFolderId = ref(null)
    const selectedNoteId = ref(null)
    const searchQuery = ref('')

    const token = Cookies.get('token')
    if (token) {
        try {
            const decoded = jwtDecode(token)
            userRef.value = decoded
            isAuthenticated.value = true

            folders.value = JSON.parse(localStorage.getItem('folders')) || []
            selectedFolderId.value = localStorage.getItem('selectedFolderId') || null
        } catch (e) {
            Cookies.remove('token')
            clearLocalStorage()
        }
    } else {
        clearLocalStorage()
    }

    function syncLocalStorage() {
        localStorage.setItem('folders', JSON.stringify(folders.value))
        localStorage.setItem('selectedFolderId', selectedFolderId.value)
    }

    function clearLocalStorage() {
        localStorage.removeItem('notes')
        localStorage.removeItem('folders')
        localStorage.removeItem('selectedFolderId')
    }

    const allPhysicalFolders = computed(() => folders.value)
    const allFolders = computed(() => [
        { id: 'favourites', name: 'Favourites', icon: 'Star', type: 'virtual' },
        ...folders.value
    ])
    const currentFolder = computed(() => allFolders.value.find(f => f.id === selectedFolderId.value) || allFolders.value[0])

    const filteredNotes = computed(() => {
        let activeFolderId = selectedFolderId.value

        if (!activeFolderId || !allFolders.value.find(f => f.id === activeFolderId)) {
            activeFolderId = allFolders.value[0]?.id || null
        }

        let result = []
        if (activeFolderId === 'favourites') {
            result = notes.value.filter(n => n.isFavourite)
        } else {
            const folder = folders.value.find(f => f.id === activeFolderId)
            result = folder ? [...folder.notes] : []
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
        if (folderId === 'favourites') return notes.value.filter(n => n.isFavourite).length
        const folder = folders.value.find(f => f.id === folderId)
        return folder ? folder.notes.length : 0
    }


    function setUserData(userData) {
        if (!userData || !userData.folders) return;

        console.log('Setting user data:', userData);

        folders.value = userData.folders.map(folder => ({
            id: folder.id || folder.name,
            name: folder.name,
            icon: folder.icon || 'FolderOpen',
            type: 'custom',
            createdAt: folder.createdAt || new Date().toISOString(),
            notes: (folder.notes || []).map(note => ({
                ...note,
                isFavourite: note.isFavourite || false
            }))
        }));

        if (!selectedFolderId.value || !allFolders.value.find(f => f.id === selectedFolderId.value)) {
            selectedFolderId.value = allPhysicalFolders.value[0]?.id || 'favourites';
        }

        syncLocalStorage();
    }

    let saveTimeout = null;
    const saveData = async () => {
        if (!isAuthenticated.value || !userRef.value) return;

        syncLocalStorage();

        if (saveTimeout) clearTimeout(saveTimeout);

        saveTimeout = setTimeout(async () => {
            const folderStructure = allPhysicalFolders.value.map(folder => ({
                id: folder.id,
                name: folder.name,
                icon: folder.icon,
                createdAt: folder.createdAt,
                notes: folder.notes || []
            }));

            try {
                const response = await fetch('http://localhost:8080/users/updateData', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userRef.value.id,
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

            const { token, user } = data
            Cookies.set('token', token, { expires: 7 })

            userRef.value = user

            isAuthenticated.value = true

            if (user) {
                setUserData(user)
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

            const { token, user } = data
            Cookies.set('token', token, { expires: 7 })

            // const decoded = jwtDecode(token)
            userRef.value = user
            isAuthenticated.value = true

            if (user) {
                setUserData(user)
            }

            return { success: true }
        } catch (error) {
            console.error('Registration error:', error)
            return { success: false, message: error.message }
        }
    }

    function logout() {
        userRef.value = null
        isAuthenticated.value = false
        Cookies.remove('token')

        folders.value = []
        selectedFolderId.value = null
        selectedNoteId.value = null

        clearLocalStorage()

        router.push('/auth')
    }

    function createNote() {
        if (!isAuthenticated.value) return;

        let targetFolderId = selectedFolderId.value;

        if (!targetFolderId || targetFolderId === 'favourites' || !allPhysicalFolders.value.find(f => f.id === targetFolderId)) {
            targetFolderId = allPhysicalFolders.value[0]?.id || null;
        }

        const folder = folders.value.find(f => f.id === targetFolderId)
        if (!folder) {
            console.warn('Cannot create note: no folders available');
            return;
        }

        const newNote = {
            id: uuidv4(),
            title: 'New Note',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isFavourite: false
        };

        folder.notes.unshift(newNote);
        selectedNoteId.value = newNote.id;
        syncLocalStorage();
    }

    function updateNote(id, updates) {
        const note = notes.value.find(n => n.id === id)
        if (note) {
            Object.assign(note, updates, { updatedAt: new Date().toISOString() })
            syncLocalStorage();
        }
    }

    function deleteNote(id) {
        folders.value.forEach(folder => {
            folder.notes = folder.notes.filter(n => n.id !== id)
        })
        if (selectedNoteId.value === id) selectedNoteId.value = null
        syncLocalStorage();
    }


    function createFolder(name) {
        if (!isAuthenticated.value) return;
        if (!name || !name.trim()) return;

        const nameExists = folders.value.some(f => f.name.toLowerCase() === name.toLowerCase());
        if (nameExists) {
            console.warn('A folder with this name already exists');
            return;
        }

        const newFolder = {
            id: uuidv4(),
            name: name.trim(),
            icon: 'FolderOpen',
            type: 'custom',
            createdAt: new Date().toISOString(),
            notes: []
        };

        folders.value.push(newFolder);
        syncLocalStorage();
    }

    function deleteFolder(id) {
        if (id === 'favourites') return

        folders.value = folders.value.filter(f => f.id !== id)
        if (selectedFolderId.value === id) {
            selectedFolderId.value = allPhysicalFolders.value[0]?.id || null
        }
        syncLocalStorage();
    }

    function updateFolder(id, name) {
        if (id === 'favourites') return

        const folder = folders.value.find(f => f.id === id)
        if (folder && name && name.trim()) {
            folder.name = name.trim()
            syncLocalStorage();
        }
    }

    function selectFolder(id) {
        selectedFolderId.value = id
        syncLocalStorage();
        selectedNoteId.value = null
        searchQuery.value = ''
    }

    function selectNote(id) {
        selectedNoteId.value = id
    }


    function setSearchQuery(query) {
        searchQuery.value = query
    }

    function toggleFavourite(id) {
        const note = notes.value.find(n => n.id === id)
        if (note) {
            note.isFavourite = !note.isFavourite
            note.updatedAt = new Date().toISOString()
            syncLocalStorage();
        }
    }


    function moveToFolder(noteId, newFolderId) {
        let noteToMove = null;

        // Find and remove the note from its current folder
        for (const folder of folders.value) {
            const index = folder.notes.findIndex(n => n.id === noteId);
            if (index !== -1) {
                noteToMove = folder.notes.splice(index, 1)[0];
                break;
            }
        }

        if (noteToMove) {
            const destFolder = folders.value.find(f => f.id === newFolderId);
            if (destFolder) {
                destFolder.notes.push(noteToMove);
                noteToMove.updatedAt = new Date().toISOString();
                syncLocalStorage();
                saveData();
            }
        }
    }

    return {
        // Auth State
        userRef,
        isAuthenticated,
        // Notes State
        notes,
        folders,
        allFolders,
        allPhysicalFolders,
        currentFolder,
        filteredNotes,
        selectedFolderId,
        selectedNoteId,
        selectedNote,
        searchQuery,

        // Auth Actions
        login,
        register,
        logout,

        // Notes Getters/Helpers
        getNotesCountForFolder,

        // Notes Actions
        createNote,
        updateNote,
        deleteNote,
        createFolder,
        deleteFolder,
        updateFolder,
        selectFolder,
        selectNote,
        setSearchQuery,
        toggleFavourite,
        moveToFolder,
        saveData
    }
})
