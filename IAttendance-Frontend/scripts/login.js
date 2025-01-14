const loginButton = document.getElementById("login");

loginButton.addEventListener('click', async function(e){
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Show loading state
    loginButton.disabled = true;
    loginButton.textContent = 'Logging in...';

    try {
        const response = await axios.post('http://localhost:3000/login', {
            username: username,
            password: password
        });

        if (response.status === 200) {
            // Store the token
            localStorage.setItem('token', response.data.token);

            //Store the username
            localStorage.setItem('username', response.data.user.username);
            
            // Set default authorization header for all future axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
            
            // Redirect to students page
            window.location.href = '/IAttendance-Frontend/pages/students.html';
        }
    } catch (error) {
        // Show error to user
        alert(error.response?.data?.message || 'Login failed');
    } finally {
        // Reset button state
        loginButton.disabled = false;
        loginButton.textContent = 'Login';
    }
});

// Add this to handle cases where the token might be invalid or expired
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
            window.location.href = '/login'; // Redirect to login page
        }
        return Promise.reject(error);
    }
);