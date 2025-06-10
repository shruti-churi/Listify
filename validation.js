document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const contactFormMessage = document.getElementById('contactFormMessage');

    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');

    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    const messageError = document.getElementById('messageError');

    // Function to validate email format
    function isValidEmail(email) {
        // A common regex for email validation (can be more robust if needed)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to validate a field
    function validateField(inputElement, errorElement, errorMessage) {
        if (!inputElement) return true; // If element doesn't exist, assume valid for that field

        if (inputElement.value.trim() === '') {
            errorElement.textContent = errorMessage;
            inputElement.classList.add('error');
            return false;
        } else {
            errorElement.textContent = '';
            inputElement.classList.remove('error');
            return true;
        }
    }

    // Event listeners for real-time validation feedback (optional)
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            validateField(nameInput, nameError, 'Name is required.');
        });
    }

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            if (!validateField(emailInput, emailError, 'Email is required.')) {
                return;
            }
            if (!isValidEmail(emailInput.value.trim())) {
                emailError.textContent = 'Please enter a valid email address.';
                emailInput.classList.add('error');
            } else {
                emailError.textContent = '';
                emailInput.classList.remove('error');
            }
        });
    }

    if (messageInput) {
        messageInput.addEventListener('input', () => {
            validateField(messageInput, messageError, 'Message is required.');
        });
    }


    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent default form submission

            let isValid = true;

            // Validate all fields on submit
            if (!validateField(nameInput, nameError, 'Name is required.')) {
                isValid = false;
            }
            if (!validateField(emailInput, emailError, 'Email is required.')) {
                isValid = false;
            } else if (emailInput && !isValidEmail(emailInput.value.trim())) { // Check emailInput before accessing .value
                emailError.textContent = 'Please enter a valid email address.';
                emailInput.classList.add('error');
                isValid = false;
            }
            if (!validateField(messageInput, messageError, 'Message is required.')) {
                isValid = false;
            }

            if (isValid) {
                // If validation passes, you would typically send the form data to a server
                // For this example, we'll just display a success message.
                console.log('Contact Form Submitted:', {
                    name: nameInput.value,
                    email: emailInput.value,
                    subject: document.getElementById('contactSubject').value,
                    message: messageInput.value
                });

                contactFormMessage.textContent = 'Thank you for your message! We will get back to you shortly.';
                contactFormMessage.className = 'message success';
                contactForm.reset(); // Clear the form
                // Clear any lingering error messages
                if (nameError) nameError.textContent = '';
                if (emailError) emailError.textContent = '';
                if (messageError) messageError.textContent = '';
                if (nameInput) nameInput.classList.remove('error');
                if (emailInput) emailInput.classList.remove('error');
                if (messageInput) messageInput.classList.remove('error');


                setTimeout(() => contactFormMessage.textContent = '', 5000); // Clear message after 5 seconds
            } else {
                contactFormMessage.textContent = 'Please correct the errors in the form.';
                contactFormMessage.className = 'message error';
                setTimeout(() => contactFormMessage.textContent = '', 5000);
            }
        });
    }
});