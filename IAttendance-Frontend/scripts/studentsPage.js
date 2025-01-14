// Check for authentication
const token = localStorage.getItem('token');
const username = localStorage.getItem('username');

if (!token) {
    window.location.href = '/IAttendance-Frontend/pages/login.html';
} else {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    const greetingElement = document.getElementById('greeting');
    greetingElement.textContent = `Welcome, ${username}!`;
}

// Elements
const searchBtn = document.getElementById('searchBtn');
const firstNameInput = document.getElementById('firstName');
const midAndLastNameInput = document.getElementById('midAndLastName');
const studentsTableBody = document.getElementById('studentsTableBody');

// Function to parse date string in format "dd-mm-yyyy - hh:mm"
function parseAbsenceDate(dateString) {
    const [datePart, timePart] = dateString.split(' - ');
    const [day, month, year] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');
    
    // Month is 0-based in JavaScript Date
    return new Date(year, month - 1, day, hours, minutes);
}

// Function to check if student is absent
function isStudentAbsent(student) {
    if (!student.absences?.length) return false;

    const now = new Date();
    
    return student.absences.some(absence => {
        const absenceDate = parseAbsenceDate(absence.dateOfAbsence);
        
        // Calculate time difference in hours
        const timeDiff = Math.abs(now - absenceDate) / (1000 * 60 * 60);
        
        // Check if current time is within 2 hours of absence time
        return timeDiff <= 2;
    });
}

// Load all students when page loads
async function loadAllStudents() {
    try {
        const [studentsResponse, absencesResponse] = await Promise.all([
            axios.get('http://localhost:3000/students'),
            axios.get('http://localhost:3000/absences')
        ]);
        
        // Combine student data with their absences
        const studentsWithAbsences = studentsResponse.data.map(student => ({
            ...student,
            absences: absencesResponse.data.filter(absence => 
                absence.firstName === student.firstName && 
                absence.midAndLastName === student.midAndLastName
            )
        }));
        
        displayStudents(studentsWithAbsences);
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
        const [studentResponse, absencesResponse] = await Promise.all([
            axios.get(`http://localhost:3000/students/search`, {
                params: { firstName, midAndLastName }
            }),
            axios.get('http://localhost:3000/absences')
        ]);
        
        if (studentResponse.data) {
            const studentWithAbsences = {
                ...studentResponse.data,
                absences: absencesResponse.data.filter(absence => 
                    absence.firstName === studentResponse.data.firstName && 
                    absence.midAndLastName === studentResponse.data.midAndLastName
                )
            };
            displayStudents([studentWithAbsences]);
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
        const presenceStatus = isStudentAbsent(student) ? 'Absent' : 'Present';
        row.innerHTML = `
            <td>${student.firstName}</td>
            <td>${student.midAndLastName}</td>
            <td>${presenceStatus}</td>
        `;
        studentsTableBody.appendChild(row);
    });
}

// Error handler
function handleError(error) {
    if (error.response) {
        if (error.response.status === 401 || error.response.status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('username');
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