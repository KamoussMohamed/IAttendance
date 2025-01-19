// Check for authentication
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');
const userRole = localStorage.getItem('role');

if (!token) {
    window.location.href = '/login.html';
} else {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const greetingElement = document.getElementById('greeting');
    greetingElement.textContent = `Welcome, ${username}!`;

    // Show/hide admin-only sections
    const isAdmin = userRole === 'admin';
    document.getElementById('addSessionSection').style.display = isAdmin ? 'block' : 'none';
    document.getElementById('deleteSessionSection').style.display = isAdmin ? 'block' : 'none';
}

// Elements
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('errorMessage');
const sessionsTableBody = document.getElementById('sessionsTableBody');

// Load all sessions
async function loadAllSessions() {
    try {
        loadingElement.textContent = 'Loading...';
        errorElement.textContent = '';
        
        const response = await axios.get('http://localhost:3000/sessions');
        displaySessions(response.data);
    } catch (error) {
        handleError(error);
    } finally {
        loadingElement.textContent = '';
    }
}

// Display sessions in table
function displaySessions(sessions) {
    sessionsTableBody.innerHTML = '';
    if (!Array.isArray(sessions)) {
        sessions = [sessions];
    }
    sessions.forEach(session => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${session.sessionName}</td>
            <td>${session.sessionDuration}</td>
            <td>${session.taughtBy}</td>
        `;
        sessionsTableBody.appendChild(row);
    });
}

// Add session
document.getElementById('addSessionBtn')?.addEventListener('click', async () => {
    try {
        const sessionName = document.getElementById('newSessionName').value;
        const sessionDuration = document.getElementById('sessionDuration').value;
        const taughtBy = document.getElementById('taughtBy').value;

        if (!sessionName || !sessionDuration || !taughtBy) {
            alert('Please fill in all fields');
            return;
        }

        await axios.post('http://localhost:3000/sessions/addSession', {
            sessionName,
            sessionDuration,
            taughtBy
        });

        alert('Session added successfully');
        loadAllSessions();
        
        // Clear inputs
        document.getElementById('newSessionName').value = '';
        document.getElementById('sessionDuration').value = '';
        document.getElementById('taughtBy').value = '';
    } catch (error) {
        handleError(error);
    }
});

// Search by session name
document.getElementById('searchByNameBtn').addEventListener('click', async () => {
    try {
        const sessionName = document.getElementById('searchSessionName').value;
        if (!sessionName) {
            alert('Please enter a session name');
            return;
        }

        const response = await axios.get('http://localhost:3000/sessions/searchByName', {
            params: { sessionName }
        });
        displaySessions(response.data);
    } catch (error) {
        handleError(error);
    }
});

// Search by teacher name
document.getElementById('searchByTeacherBtn').addEventListener('click', async () => {
    try {
        const teacherName = document.getElementById('searchTeacherName').value;
        if (!teacherName) {
            alert('Please enter a teacher name');
            return;
        }

        const response = await axios.get('http://localhost:3000/sessions/searchByTeacher', {
            params: { teacherName }
        });
        displaySessions(response.data);
    } catch (error) {
        handleError(error);
    }
});

// Delete session
document.getElementById('deleteSessionBtn')?.addEventListener('click', async () => {
    try {
        const sessionName = document.getElementById('deleteSessionName').value;
        if (!sessionName) {
            alert('Please enter a session name');
            return;
        }

        await axios.delete(`http://localhost:3000/sessions/deleteByName/${sessionName}`);
        alert('Session deleted successfully');
        loadAllSessions();
        document.getElementById('deleteSessionName').value = '';
    } catch (error) {
        handleError(error);
    }
});

// Show all sessions
document.getElementById('showAllBtn').addEventListener('click', loadAllSessions);

// Error handler
function handleError(error) {
    if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            window.location.href = '/login.html';
        } else {
            errorElement.textContent = error.response.data.message || 'An error occurred';
        }
    } else {
        errorElement.textContent = 'Network error occurred';
    }
}

// Add axios interceptor for handling auth errors globally
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            window.location.href = '/login.html';
        }
        return Promise.reject(error);
    }
);

// Load sessions when page loads
loadAllSessions();