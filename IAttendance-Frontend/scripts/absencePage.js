const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

if (!token) {
    window.location.href = '/login.html';
} else {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const greetingElement = document.getElementById('greeting');
    greetingElement.textContent = `Welcome, ${username}!`;
}

// Elements
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');
const firstNameInput = document.getElementById('firstName');
const midAndLastNameInput = document.getElementById('midAndLastName');
const absencesTableBody = document.getElementById('absencesTableBody');
const loadingElement = document.getElementById('loading');
const errorElement = document.getElementById('errorMessage');

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).replace(',', ' -');
}

// Load all absences
async function loadAllAbsences() {
    try {
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';
        
        const response = await axios.get('http://localhost:3000/absences');
        displayAbsences(response.data);
    } catch (error) {
        handleError(error);
    } finally {
        loadingElement.style.display = 'none';
    }
}

// Search absences
searchBtn.addEventListener('click', async () => {
    try {
        loadingElement.style.display = 'block';
        errorElement.style.display = 'none';

        const params = {};
        if (firstNameInput.value) params.firstName = firstNameInput.value;
        if (midAndLastNameInput.value) params.midAndLastName = midAndLastNameInput.value;

        const response = await axios.get('http://localhost:3000/absences/search', { params });
        displayAbsences(response.data);
    } catch (error) {
        handleError(error);
    } finally {
        loadingElement.style.display = 'none';
    }
});

// Reset search
resetBtn.addEventListener('click', () => {
    firstNameInput.value = '';
    midAndLastNameInput.value = '';
    loadAllAbsences();
});

// Display absences in table
function displayAbsences(absences) {
    absencesTableBody.innerHTML = '';
    absences.forEach(absence => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${absence.firstName}</td>
            <td>${absence.midAndLastName}</td>
            <td>${absence.dateOfAbsence}</td>
        `;
        absencesTableBody.appendChild(row);
    });
}

// Error handler
function handleError(error) {
    if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            window.location.href = '/login.html';
        } else {
            errorElement.textContent = error.response.data.message || 'An error occurred';
            errorElement.style.display = 'block';
        }
    } else {
        errorElement.textContent = 'Network error occurred';
        errorElement.style.display = 'block';
    }
}

// Add axios interceptor for handling auth errors globally
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            window.location.href = '/login.html';
        }
        return Promise.reject(error);
    }
);

// Load absences when page loads
loadAllAbsences();