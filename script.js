// --- COMPONENT LOADING ---
async function loadComponents() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (headerPlaceholder) {
        try {
            const response = await fetch('components/header.html');
            const html = await response.text();
            headerPlaceholder.innerHTML = html;
        } catch (error) {
            console.error('Error loading header:', error);
        }
    }

    if (footerPlaceholder) {
        try {
            const response = await fetch('components/footer.html');
            const html = await response.text();
            footerPlaceholder.innerHTML = html;
        } catch (error) {
            console.error('Error loading footer:', error);
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {

    // --- LOAD COMPONENTS FIRST ---
    await loadComponents();

    // --- MOCK DATA & AUTH ---
    const USERS_KEY = 'br_users';
    const CURRENT_USER_KEY = 'br_current_user';
    const POSTS_KEY = 'br_posts';

    // Initialize Mock Users if not exists
    if (!localStorage.getItem(USERS_KEY)) {
        const initialUsers = [
            { id: 1, username: 'admin', password: 'password', role: 'ADMIN', roleLevel: 1 },
            { id: 2, username: 'leiter', password: 'password', role: 'Bandleiter', roleLevel: 2 },
            { id: 3, username: 'member', password: 'password', role: 'Bandmitglied', roleLevel: 3 }
        ];
        localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
    }

    // --- DOM ELEMENTS (now available after component load) ---
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.querySelector('.close-modal');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const adminLink = document.getElementById('adminLink');
    const newsGrid = document.getElementById('newsGrid');
    const userTableBody = document.getElementById('userTableBody');

    // --- AUTH FUNCTIONS ---
    function getCurrentUser() {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    }

    function login(username, password) {
        const users = JSON.parse(localStorage.getItem(USERS_KEY));
        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
            return true;
        } else {
            return false;
        }
    }

    function logout() {
        localStorage.removeItem(CURRENT_USER_KEY);
        window.location.href = 'index.html';
    }

    // --- PERMISSION FUNCTIONS ---
    function hasPermission(requiredLevel) {
        const user = getCurrentUser();
        if (!user) return false;
        return user.roleLevel <= requiredLevel;
    }

    function canManageContent() {
        return hasPermission(2); // Bandleiter and above
    }

    function canManageUsers() {
        return hasPermission(1); // Admin only
    }

    function updateUI() {
        const user = getCurrentUser();

        if (user) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'block';

            // Show Manage Content Link if Admin or Bandleiter
            const manageLink = document.getElementById('manageLink');
            if (manageLink) {
                manageLink.style.display = canManageContent() ? 'block' : 'none';
            }

            // Show Manage Icon Button if Admin or Bandleiter
            const manageIconBtn = document.getElementById('manageIconBtn');
            if (manageIconBtn) {
                manageIconBtn.style.display = canManageContent() ? 'inline-flex' : 'none';
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (logoutBtn) logoutBtn.style.display = 'none';

            const manageLink = document.getElementById('manageLink');
            if (manageLink) manageLink.style.display = 'none';

            const manageIconBtn = document.getElementById('manageIconBtn');
            if (manageIconBtn) manageIconBtn.style.display = 'none';
        }
    }

    // --- EVENT LISTENERS ---

    // Login Modal
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            closeLoginModal();
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            closeLoginModal();
        }
    });

    function closeLoginModal() {
        if (loginModal) {
            loginModal.style.display = 'none';
            if (loginForm) loginForm.reset();
            if (loginError) loginError.textContent = '';
        }
    }

    // Login Form Submit
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = loginForm.username.value;
            const password = loginForm.password.value;

            if (login(username, password)) {
                closeLoginModal();
                updateUI();
            } else {
                if (loginError) {
                    loginError.textContent = 'Ungültiger Benutzername oder Passwort';
                }
            }
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }


    // --- USER MANAGEMENT (users.html) ---
    if (userTableBody) {
        renderUserTable();
    }

    function renderUserTable() {
        const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
        const currentUser = getCurrentUser();

        // Redirect if not admin
        if (!currentUser || currentUser.role !== 'ADMIN') {
            window.location.href = 'index.html';
            return;
        }

        userTableBody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.username}</td>
                <td>${user.role}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="alert('Edit feature coming soon')">Edit</button>
                    ${user.username !== 'admin' ? `<button class="btn btn-danger btn-small delete-user-btn" data-id="${user.id}">Delete</button>` : ''}
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
        if (confirm('Benutzer wirklich löschen?')) {
            let users = JSON.parse(localStorage.getItem(USERS_KEY));
            users = users.filter(u => u.id !== id);
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            renderUserTable();
        }
    }

    // --- EXISTING FUNCTIONALITY ---

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Only if on same page
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Simple Form Handler
    const form = document.getElementById('bookingForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Vielen Dank für Ihre Anfrage! Wir werden uns schnellstmöglich bei Ihnen melden.');
            form.reset();
        });
    }

    // Header scroll effect
    const header = document.querySelector('.header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.style.backgroundColor = 'rgba(10, 10, 10, 0.95)';
                header.style.padding = '10px 0';
            } else {
                header.style.backgroundColor = 'rgba(10, 10, 10, 0.9)';
                header.style.padding = '20px 0';
            }
        });
    }

    // Initial UI Update
    updateUI();

});
