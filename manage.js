// manage.js - Content Management System
document.addEventListener('DOMContentLoaded', () => {
    // Storage keys
    const GIGS_KEY = 'br_gigs';
    const MUSIC_KEY = 'br_music';
    const GALLERY_KEY = 'br_gallery';
    const CURRENT_USER_KEY = 'br_current_user';

    // Check permissions
    const currentUser = JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    if (!currentUser || currentUser.roleLevel > 2) {
        alert('Keine Berechtigung für diese Seite!');
        window.location.href = 'index.html';
        return;
    }

    // Initialize data if not exists
    if (!localStorage.getItem(GIGS_KEY)) {
        localStorage.setItem(GIGS_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(MUSIC_KEY)) {
        localStorage.setItem(MUSIC_KEY, JSON.stringify([]));
    }
    if (!localStorage.getItem(GALLERY_KEY)) {
        localStorage.setItem(GALLERY_KEY, JSON.stringify([]));
    }

    // Current edit IDs
    let editingGigId = null;
    let editingMusicId = null;
    let editingGalleryId = null;

    // --- GIGS MANAGEMENT ---
    const gigsContainer = document.getElementById('gigsContainer');
    const addGigBtn = document.getElementById('addGigBtn');
    const gigModal = document.getElementById('gigModal');
    const gigForm = document.getElementById('gigForm');
    const gigModalTitle = document.getElementById('gigModalTitle');

    function loadGigs() {
        const gigs = JSON.parse(localStorage.getItem(GIGS_KEY)) || [];
        gigsContainer.innerHTML = '';

        if (gigs.length === 0) {
            gigsContainer.innerHTML = '<p style="text-align: center; color: var(--text-color); opacity: 0.6;">Keine Gigs vorhanden</p>';
            return;
        }

        gigs.forEach(gig => {
            const gigCard = document.createElement('div');
            gigCard.className = 'manage-item-card';
            gigCard.innerHTML = `
                ${gig.image ? `<img src="${gig.image}" alt="${gig.venue}" class="manage-item-image">` : ''}
                <div class="manage-item-content">
                    <h3>${gig.venue}</h3>
                    <p class="manage-item-date">${formatDate(gig.date)}</p>
                    <p>${gig.description || ''}</p>
                </div>
                <div class="manage-item-actions">
                    <button class="btn btn-primary btn-small edit-gig-btn" data-id="${gig.id}">Bearbeiten</button>
                    <button class="btn btn-danger btn-small delete-gig-btn" data-id="${gig.id}">Löschen</button>
                </div>
            `;
            gigsContainer.appendChild(gigCard);
        });

        // Add event listeners
        document.querySelectorAll('.edit-gig-btn').forEach(btn => {
            btn.addEventListener('click', () => editGig(parseInt(btn.dataset.id)));
        });
        document.querySelectorAll('.delete-gig-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteGig(parseInt(btn.dataset.id)));
        });
    }

    addGigBtn.addEventListener('click', () => {
        editingGigId = null;
        gigModalTitle.textContent = 'Gig hinzufügen';
        gigForm.reset();
        gigModal.style.display = 'block';
    });

    gigForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const gigs = JSON.parse(localStorage.getItem(GIGS_KEY)) || [];

        const gigData = {
            id: editingGigId || Date.now(),
            date: document.getElementById('gigDate').value,
            venue: document.getElementById('gigVenue').value,
            description: document.getElementById('gigDescription').value
        };

        // Handle image upload
        const imageFile = document.getElementById('gigImage').files[0];
        if (imageFile) {
            gigData.image = await fileToBase64(imageFile);
        } else if (editingGigId) {
            // Keep existing image
            const existingGig = gigs.find(g => g.id === editingGigId);
            if (existingGig) gigData.image = existingGig.image;
        }

        if (editingGigId) {
            const index = gigs.findIndex(g => g.id === editingGigId);
            gigs[index] = gigData;
        } else {
            gigs.push(gigData);
        }

        localStorage.setItem(GIGS_KEY, JSON.stringify(gigs));
        gigModal.style.display = 'none';
        loadGigs();
    });

    function editGig(id) {
        const gigs = JSON.parse(localStorage.getItem(GIGS_KEY)) || [];
        const gig = gigs.find(g => g.id === id);
        if (!gig) return;

        editingGigId = id;
        gigModalTitle.textContent = 'Gig bearbeiten';
        document.getElementById('gigDate').value = gig.date;
        document.getElementById('gigVenue').value = gig.venue;
        document.getElementById('gigDescription').value = gig.description || '';
        gigModal.style.display = 'block';
    }

    function deleteGig(id) {
        if (!confirm('Gig wirklich löschen?')) return;
        let gigs = JSON.parse(localStorage.getItem(GIGS_KEY)) || [];
        gigs = gigs.filter(g => g.id !== id);
        localStorage.setItem(GIGS_KEY, JSON.stringify(gigs));
        loadGigs();
    }

    // --- MUSIC MANAGEMENT ---
    const musicContainer = document.getElementById('musicContainer');
    const addMusicBtn = document.getElementById('addMusicBtn');
    const musicModal = document.getElementById('musicModal');
    const musicForm = document.getElementById('musicForm');
    const musicModalTitle = document.getElementById('musicModalTitle');

    function loadMusic() {
        const tracks = JSON.parse(localStorage.getItem(MUSIC_KEY)) || [];
        musicContainer.innerHTML = '';

        if (tracks.length === 0) {
            musicContainer.innerHTML = '<p style="text-align: center; color: var(--text-color); opacity: 0.6;">Keine Tracks vorhanden</p>';
            return;
        }

        tracks.forEach(track => {
            const trackCard = document.createElement('div');
            trackCard.className = 'manage-item-card';
            trackCard.innerHTML = `
                <div class="manage-item-content">
                    <h3>${track.title}</h3>
                    <p>${track.artist}</p>
                    ${track.file ? '<p class="manage-item-file">🎵 Audio-Datei vorhanden</p>' : ''}
                </div>
                <div class="manage-item-actions">
                    <button class="btn btn-primary btn-small edit-music-btn" data-id="${track.id}">Bearbeiten</button>
                    <button class="btn btn-danger btn-small delete-music-btn" data-id="${track.id}">Löschen</button>
                </div>
            `;
            musicContainer.appendChild(trackCard);
        });

        document.querySelectorAll('.edit-music-btn').forEach(btn => {
            btn.addEventListener('click', () => editMusic(parseInt(btn.dataset.id)));
        });
        document.querySelectorAll('.delete-music-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteMusic(parseInt(btn.dataset.id)));
        });
    }

    addMusicBtn.addEventListener('click', () => {
        editingMusicId = null;
        musicModalTitle.textContent = 'Track hinzufügen';
        musicForm.reset();
        musicModal.style.display = 'block';
    });

    musicForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tracks = JSON.parse(localStorage.getItem(MUSIC_KEY)) || [];

        const trackData = {
            id: editingMusicId || Date.now(),
            title: document.getElementById('musicTitle').value,
            artist: document.getElementById('musicArtist').value
        };

        const audioFile = document.getElementById('musicFile').files[0];
        if (audioFile) {
            trackData.file = await fileToBase64(audioFile);
        } else if (editingMusicId) {
            const existingTrack = tracks.find(t => t.id === editingMusicId);
            if (existingTrack) trackData.file = existingTrack.file;
        }

        if (editingMusicId) {
            const index = tracks.findIndex(t => t.id === editingMusicId);
            tracks[index] = trackData;
        } else {
            tracks.push(trackData);
        }

        localStorage.setItem(MUSIC_KEY, JSON.stringify(tracks));
        musicModal.style.display = 'none';
        loadMusic();
    });

    function editMusic(id) {
        const tracks = JSON.parse(localStorage.getItem(MUSIC_KEY)) || [];
        const track = tracks.find(t => t.id === id);
        if (!track) return;

        editingMusicId = id;
        musicModalTitle.textContent = 'Track bearbeiten';
        document.getElementById('musicTitle').value = track.title;
        document.getElementById('musicArtist').value = track.artist;
        musicModal.style.display = 'block';
    }

    function deleteMusic(id) {
        if (!confirm('Track wirklich löschen?')) return;
        let tracks = JSON.parse(localStorage.getItem(MUSIC_KEY)) || [];
        tracks = tracks.filter(t => t.id !== id);
        localStorage.setItem(MUSIC_KEY, JSON.stringify(tracks));
        loadMusic();
    }

    // --- GALLERY MANAGEMENT ---
    const galleryContainer = document.getElementById('galleryContainer');
    const addGalleryBtn = document.getElementById('addGalleryBtn');
    const galleryModal = document.getElementById('galleryModal');
    const galleryForm = document.getElementById('galleryForm');
    const galleryModalTitle = document.getElementById('galleryModalTitle');

    function loadGallery() {
        const images = JSON.parse(localStorage.getItem(GALLERY_KEY)) || [];
        galleryContainer.innerHTML = '';

        if (images.length === 0) {
            galleryContainer.innerHTML = '<p style="text-align: center; color: var(--text-color); opacity: 0.6;">Keine Bilder vorhanden</p>';
            return;
        }

        images.forEach(img => {
            const imgCard = document.createElement('div');
            imgCard.className = 'manage-item-card';
            imgCard.innerHTML = `
                ${img.file ? `<img src="${img.file}" alt="${img.caption}" class="manage-item-image">` : ''}
                <div class="manage-item-content">
                    <p>${img.caption}</p>
                </div>
                <div class="manage-item-actions">
                    <button class="btn btn-primary btn-small edit-gallery-btn" data-id="${img.id}">Bearbeiten</button>
                    <button class="btn btn-danger btn-small delete-gallery-btn" data-id="${img.id}">Löschen</button>
                </div>
            `;
            galleryContainer.appendChild(imgCard);
        });

        document.querySelectorAll('.edit-gallery-btn').forEach(btn => {
            btn.addEventListener('click', () => editGallery(parseInt(btn.dataset.id)));
        });
        document.querySelectorAll('.delete-gallery-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteGallery(parseInt(btn.dataset.id)));
        });
    }

    addGalleryBtn.addEventListener('click', () => {
        editingGalleryId = null;
        galleryModalTitle.textContent = 'Bild hinzufügen';
        galleryForm.reset();
        galleryModal.style.display = 'block';
    });

    galleryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const images = JSON.parse(localStorage.getItem(GALLERY_KEY)) || [];

        const imgData = {
            id: editingGalleryId || Date.now(),
            caption: document.getElementById('galleryCaption').value
        };

        const imageFile = document.getElementById('galleryFile').files[0];
        if (imageFile) {
            imgData.file = await fileToBase64(imageFile);
        } else if (editingGalleryId) {
            const existingImg = images.find(i => i.id === editingGalleryId);
            if (existingImg) imgData.file = existingImg.file;
        }

        if (editingGalleryId) {
            const index = images.findIndex(i => i.id === editingGalleryId);
            images[index] = imgData;
        } else {
            images.push(imgData);
        }

        localStorage.setItem(GALLERY_KEY, JSON.stringify(images));
        galleryModal.style.display = 'none';
        loadGallery();
    });

    function editGallery(id) {
        const images = JSON.parse(localStorage.getItem(GALLERY_KEY)) || [];
        const img = images.find(i => i.id === id);
        if (!img) return;

        editingGalleryId = id;
        galleryModalTitle.textContent = 'Bild bearbeiten';
        document.getElementById('galleryCaption').value = img.caption;
        galleryModal.style.display = 'block';
    }

    function deleteGallery(id) {
        if (!confirm('Bild wirklich löschen?')) return;
        let images = JSON.parse(localStorage.getItem(GALLERY_KEY)) || [];
        images = images.filter(i => i.id !== id);
        localStorage.setItem(GALLERY_KEY, JSON.stringify(images));
        loadGallery();
    }

    // --- MODAL CLOSE HANDLERS ---
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function () {
            const modalId = this.dataset.modal;
            document.getElementById(modalId).style.display = 'none';
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // --- UTILITY FUNCTIONS ---
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('de-DE', options);
    }

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // --- USER MANAGEMENT (Admin Only) ---
    const USERS_KEY = 'br_users';
    const userManagementSection = document.getElementById('userManagementSection');
    const userTableBody = document.getElementById('userTableBody');

    // Show user management section only for admins
    if (currentUser.role === 'ADMIN' && userManagementSection) {
        userManagementSection.style.display = 'block';
        loadUsers();
    }

    function loadUsers() {
        const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        if (!userTableBody) return;

        userTableBody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>
                    ${user.username !== 'admin' ? `<button class="btn btn-danger btn-small delete-user-btn" data-id="${user.id}">Löschen</button>` : '<span style="opacity: 0.5;">Geschützt</span>'}
                </td>
            `;
            userTableBody.appendChild(tr);
        });

        // Add delete listeners
        document.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = parseInt(this.getAttribute('data-id'));
                deleteUser(id);
            });
        });
    }

    function deleteUser(id) {
        if (!confirm('Benutzer wirklich löschen?')) return;
        let users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        users = users.filter(u => u.id !== id);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        loadUsers();
    }

    // Initial load
    loadGigs();
    loadMusic();
    loadGallery();
});
