// students.js
// Check for authentication
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/IAttendance-Frontend/pages/login.html';
} else {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Elements
const searchBtn = document.getElementById('searchBtn');
const firstNameInput = document.getElementById('firstName');
const midAndLastNameInput = document.getElementById('midAndLastName');
const studentsTableBody = document.getElementById('studentsTableBody');

// Load all students when page loads
async function loadAllStudents() {
    try {
        const response = await axios.get('http://localhost:3000/students');
        displayStudents(response.data);
    } catch (error) {
        handleError(error);
    }
}

// Search for specific student
searchBtn.addEventListener('click', async () => {
    const firstName = firstNameInput.value;
    const midAndLastName = midAndLastNameInput.value;

    if (!firstName || !midAndLastName) {
        alert('Please fill in both name fields');
        return;
    }

    try {
        const response = await axios.get(`http://localhost:3000/students/search`, {
            params: {
                firstName: firstName,
                midAndLastName: midAndLastName
            }
        });
        
        if (response.data) {
            displayStudents([response.data]); // Wrap single student in array
        }
    } catch (error) {
        handleError(error);
    }
});

// Display students in table
function displayStudents(students) {
    studentsTableBody.innerHTML = '';
    students.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.firstName}</td>
            <td>${student.midAndLastName}</td>
            <!-- Add other student fields as needed -->
        `;
        studentsTableBody.appendChild(row);
    });
}

// Error handler
function handleError(error) {
    if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/IAttendance-Frontend/pages/login.html';
        } else {
            alert(error.response.data.message || 'An error occurred');
        }
    } else {
        alert('Network error occurred');
    }
}

// Load students when page loads
loadAllStudents();

// Add axios interceptor for handling auth errors globally
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            window.location.href = '/IAttendance-Frontend/pages/login.html';
        }
        return Promise.reject(error);
    }
);