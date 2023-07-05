function validateSignIn() {
   // Get input values
   var email = document.getElementById('signinEmail').value.trim();
   var password = document.getElementById('signinPassword').value.trim();
   

   // Regular expressions for validation
   var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
   var passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&\-_=+\\|[\]{};:/.,><()]+$/;

   // Error messages and flags for each input
   var emailError = document.getElementById('signinEmailError')
   var passwordError = document.getElementById('signinPasswordError');
   var emailValid = false;
   var passwordValid = false;

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
      passwordError.innerHTML = '';
      passwordValid = true;
   }

   // If both inputs are valid, show modal with email and password values
   return emailValid && passwordValid;
}

let signinForm = document.getElementById('signinForm');

signinForm.addEventListener('submit', (e) => {
   e.preventDefault();

   if (validateSignIn()) {
      // Get input values
      var email = document.getElementById('signinEmail').value.trim().toLowerCase();
      var password = document.getElementById('signinPassword').value.trim();
      var checkbox = document.querySelector('#customCheck');
      var submitResult = document.getElementById('submitMessage');
      var rememberMe
      
      if (checkbox.checked){
        rememberMe = true;
      }
      else rememberMe = false;

       $.ajax({
           type: "POST",
           url: "/sign-in",
           data: {
               'email': email,
               'password': password,
               'rememberMe': rememberMe
           },
           success: function(res) {
             window.location.href = '/';
           },
           error: function(xhr, status, error) {
              submitResult.innerHTML = 'User name of password incorrect'
           }
         });
   }
});