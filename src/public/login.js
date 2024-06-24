document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    const form = document.getElementById('loginForm');
    console.log('Login form element:', form);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Form submitted');
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log('Email:', email, 'Password:', password);

        fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })
        .then(response => {
            console.log('Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Response data:', data);
            if (data.success) {
                console.log('Login successful, redirecting to:', data.redirect);
                window.location.href = data.redirect;
            } else {
                console.log('Login failed:', data.message);
                alert(data.message || 'Login failed');
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            alert('An error occurred during login');
        });
    });
});