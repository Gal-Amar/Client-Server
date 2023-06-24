function validateContactUs() {

  var firstName = document.getElementById('inputFirstName').value.trim();
  var lastName = document.getElementById('inputLastName').value.trim();
  var email = document.getElementById('inputEmailAddress').value.trim();
  var message = document.getElementById('inputMessage').value.trim();
  var selectElement = document.getElementById('subject').value;


  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var nameRegex = /^[A-Za-z]+$/;
  var messageRegex = /^[\w\W]*$/;

  var firstNameError = document.getElementById('contactUsFirstNameError');
  var lastNameError = document.getElementById('contactUsLastNameError');
  var emailError = document.getElementById('contactUsEmailError');
  var subjectError = document.getElementById('contactUsSubjectError');
  var messageError = document.getElementById('contactUsMessageError');
  var firstNameValid = false;
  var lastNameValid = false;
  var emailValid = false;
  var subjectValid = false;
  var messageValid = false;

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
    lastNameValid = true;
  }
  // Validate email input
  if (message === '') {
    messageError.innerHTML = 'Please enter your message.';
  } else if (!messageRegex.test(message)) {
    messageError.innerHTML = 'Please enter a valid message.';
  } else {
    messageError.innerHTML = '';
    messageValid = true;
  }

  if (selectElement == '') {
    subjectError.innerHTML = 'Please select a subject.';
  } else {
    subjectError.innerHTML = '';
    subjectValid = true;
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

  // If all inputs are valid
  return firstNameValid && lastNameValid && emailValid && subjectValid && messageValid;
}

let contactUsForm = document.getElementById('contactUsForm');
contactUsForm.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Clicked submit')
  if (validateContactUs()) {

    // Get input values
    var firstName = document.getElementById('inputFirstName').value.trim();
    var lastName = document.getElementById('inputLastName').value.trim();
    var email = document.getElementById('inputEmailAddress').value.trim();
    var message = document.getElementById('inputMessage').value;
    var selectElement = document.getElementById('subject').value;
    var submitResult = document.getElementById('submitMessage');

    $.ajax({
      type: "POST",
      url: "/contact-us",
      data: {
        "firstName": firstName,
        "lastName": lastName,
        "email": email,
        "message": message,
        "subject": selectElement
      },
      success: function (res) {
        submitResult.style.color = "green";
        submitResult.innerHTML = 'Your message has been received and will be handled soon!'
        setTimeout(function () {
          submitResult.innerHTML = '';
          window.location.href = '/';
          // Remove the message by clearing its inner HTML
        }, 2000);
      },
      error: function (xhr, status, error) {
        submitResult.style.color = "red";
        submitResult.innerHTML = 'There has been an error while sending your message; please try again later.'
        setTimeout(function () {
          submitResult.innerHTML = ''
          // Remove the message by clearing its inner HTML
        }, 2000);
      }
    });
  }
});
