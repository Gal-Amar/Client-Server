function validateSignUp() {
    // Get input values
    var firstName = document.getElementById('signupFirstName').value.trim();
    var lastName = document.getElementById('signupLastName').value.trim();
    var email = document.getElementById('signupEmail').value.trim();
    var password = document.getElementById('signupPassword').value.trim();
    var repeatPassword = document.getElementById('signupRepeatPassword').value.trim();

    // Regular expressions for validation
    var nameRegex = /^[A-Za-z]+$/;
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&\-_=+\\|[\]{};:/.,><()]+$/;

    // Error messages and flags for each input
    var firstNameError = document.getElementById('signupFirstNameError');
    var lastNameError = document.getElementById('signupLastNameError');
    var emailError = document.getElementById('signupEmailError');
    var passwordError = document.getElementById('signupPasswordError');
    var repeatPasswordError = document.getElementById('signupRepeatPasswordError');
    var firstNameValid = false;
    var lastNameValid = false;
    var emailValid = false;
    var passwordValid = false;
    var repeatPasswordValid = false;

    // Validate firstName input
    if (firstName === '') {
        firstNameError.innerHTML = 'Please enter your first name.';
    } else if (!nameRegex.test(firstName)) {
        firstNameError.innerHTML = 'Please enter letters only.';
    } else {
        firstNameError.innerHTML = '';
        firstNameValid = true;
    }

    // Validate lastName input
    if (lastName === '') {
        lastNameError.innerHTML = 'Please enter your last name.';
    } else if (!nameRegex.test(lastName)) {
        lastNameError.innerHTML = 'Please enter letters only.';
    } else {
        lastNameError.innerHTML = '';
        lastNameError = true;
    }

    // Validate email input
    if (email === '') {
        emailError.innerHTML = 'Please enter your email address.';
    } else if (!emailRegex.test(email)) {
        emailError.innerHTML = 'Please enter a valid email address.';
    } else {
        emailError.innerHTML = '';
        emailValid = true;
    }

    // Validate password input
    if (password === '') {
        passwordError.innerHTML = 'Please enter your password.';
    } else if (password.length < 6) {
        passwordError.innerHTML = 'Password must be at least 6 characters.';
    } else if (!passwordRegex.test(password)) {
        passwordError.innerHTML = 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character of the following: !@#$%^&*()-_=+\\|[]{};:/?.><';
    } else {
        // Validate repeatPassword input
        if (repeatPassword === '') {
            repeatPasswordError.innerHTML = 'Please enter your password again.';
        } else if (password.length < 6) {
            repeatPasswordError.innerHTML = 'Password must be at least 6 characters.';
        } else if (!passwordRegex.test(password)) {
            repeatPasswordError.innerHTML = 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character of the following: !@#$%^&*()-_=+\\|[]{};:/?.><';
        } else if (repeatPassword != password) {
            repeatPasswordError.innerHTML = 'Passwords must match.';
        } else {
            repeatPasswordError.innerHTML = '';
            repeatPasswordValid = true;
        }
        passwordError.innerHTML = '';
        passwordValid = true;
    }


    // If all inputs are valid
    return firstNameValid && lastNameValid && emailValid && passwordValid && repeatPasswordValid;
}

let signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (validateSignUp()) {
        // Get input values
        var firstName = document.getElementById('signupFirstName').value.trim();
        var lastName = document.getElementById('signupLastName').value.trim();
        var email = document.getElementById('signupEmail').value.trim();
        var password = document.getElementById('signupPassword').value.trim();
        var repeatPassword = document.getElementById('signupRepeatPassword').value.trim();

        //  $.ajax({
        //      type: "POST",
        //      url: "/sign-in",
        //      data: {
        //          'username': email,
        //          'password': password
        //      },
        //      success: function(res) {
        //          if (res.result == 'redirect') {
        //              //redirecting to main page from here.
        //              window.location.replace(res.url);
        //          }
        //      },
        //      error: function(xhr, status, error) {
        //          var serverLoginResponse = document.getElementById("server-login-response");
        //          serverLoginResponse.innerText = xhr.responseText;
        //      }
        //    });

    }
});