(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();
    
    
   // Back to top button
   $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 10, 'easeInOutExpo');
        return false;
    });


    // Team carousel
    $(".team-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        center: false,
        dots: false,
        loop: true,
        margin: 50,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });


    // Testimonial carousel

    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        center: true,
        dots: true,
        loop: true,
        margin: 0,
        nav : true,
        navText: false,
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:2
            },
            992:{
                items:3
            }
        }
    });


     // Fact Counter

     $(document).ready(function(){
        $('.counter-value').each(function(){
            $(this).prop('Counter',0).animate({
                Counter: $(this).text()
            },{
                duration: 2000,
                easing: 'easeInQuad',
                step: function (now){
                    $(this).text(Math.ceil(now));
                }
            });
        });
    });



})(jQuery);


// email send //


// Initialize EmailJS
emailjs.init('vLW6gIIB58oMyIJkr');

// Get reference to the contact form, button, and message display element
const contactForm = document.querySelector('.contact-form');
const submitButton = document.querySelector('.contact-form button');
const contactMessage = document.getElementById('contactMessage');

// Function to send email
const sendEmail = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    // Gather form inputs
    const name = document.querySelector('.contact-form input[placeholder="Your Name"]').value;
    const email = document.querySelector('.contact-form input[placeholder="Your Email"]').value;
    const project = document.querySelector('.contact-form input[placeholder="Project"]').value;
    const message = document.querySelector('.contact-form textarea[placeholder="Message"]').value;

    // Ensure all fields are filled
    if (!name || !email || !project || !message) {
        contactMessage.textContent = 'Please fill all fields before submitting. ❌';
        contactMessage.style.color = 'red';
        return;
    }

    // Disable button to prevent multiple submissions
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    // Send form data using EmailJS
    emailjs
        .send('service_k62nfzb', 'template_0f70l0d', {
            user_name: name,
            user_email: email,
            user_project: project,
            user_message: message,
        })
        .then(() => {
               // Error: Show error message
            contactMessage.textContent = 'Failed to send message. Please try again. ❌';
            contactMessage.style.color = 'red';
            contactForm.reset();
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
            

            // Clear the message after 5 seconds
            
        })
        .catch((error) => {
            // Success: Show success message and reset form         
            console.error('Failed to send email:', error);
            contactMessage.textContent = 'Message sent successfully! ✅';
            contactMessage.style.color = 'blue';

            setTimeout(() => {
                contactMessage.textContent = '';
            }, 4000);

            // Reset the form fields
            contactForm.reset();
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        });
        
};

// Attach event listener to the form's button
submitButton.addEventListener('click', sendEmail);



// modal//

db.users.insertOne({
    username: "admin",
    email: "admin@saran.com",
    password: bcrypt.hashSync("SaranLife", 8), // Hash the password
    role: "admin" // Set the role to "admin"
  });




