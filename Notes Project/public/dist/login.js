"use strict";
const logInForm = document.querySelector('#login');
const registerForm = document.querySelector('#register');
const closeErrorButton = document.querySelector('.error__main--button');
const errorDiv = document.querySelector('.error');
const errorText = document.querySelector('.error__main--p');
const errorTitle = document.querySelector('.error__main--h2');
closeErrorButton.addEventListener("click", () => {
    errorDiv.classList.remove("open");
});
class Note {
    constructor(title, description, id, noteOwner) {
        this.title = title;
        this.description = description;
        this.id = id;
        this.noteOwner = noteOwner;
    }
}
class User {
    constructor(fullName, email, password) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
    }
}
async function newJoinForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('emailLogin');
    const password = formData.get('passwordLogin');
    if (email && password) {
        const user = { email, password };
        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
            if (!response.ok) {
                const errorResponse = await response.json();
                errorTitle.textContent = "Error";
                errorText.textContent = errorResponse.error;
                errorDiv.classList.add("open");
            }
            else {
                window.location.href = 'notelist.html';
            }
        }
        catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error);
        }
    }
}
async function newRegisterForm(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = formData.get('emailRegister')?.toString();
    const fullName = formData.get('fullNameRegister')?.toString();
    const password = formData.get('passwordRegister')?.toString();
    if (email && fullName && password) {
        const newUser = { fullName, email, password };
        try {
            const response = await fetch('/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser),
            });
            if (!response.ok) {
                const errorResponse = await response.json();
                errorText.textContent = errorResponse.error;
                errorDiv.classList.add("open");
            }
            else {
                const responseData = await response.json();
                console.log(responseData);
            }
        }
        catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error);
        }
    }
}
