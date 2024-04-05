"use strict";
const wrapper = document.querySelector('.wrapper');
const logOutButton = document.querySelector('.wrapper--logOut-button');
const notesWrapper = document.querySelector('.wrapper__main');
const titleInput = document.querySelector('#form-title');
const closeErrorBtn = document.querySelector('.error__main--button');
const error = document.querySelector('.error');
const paraError = document.querySelector('.error__main--p');
const noteTab = document.querySelector('.note-tab');
const h2Title = document.querySelector('.error__main--h2');
getNotes();
closeErrorBtn.addEventListener("click", () => {
    error.classList.remove("open");
});
let editMode = false;
function deleteCookie(cookieName) {
    document.cookie = cookieName + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}
function logOut() {
    if (editMode) {
        h2Title.textContent = "Error";
        paraError.textContent = "cant logout while editing note";
        error.classList.add("open");
        return console.log("cant logout while editing note");
    }
    deleteCookie("userId");
    window.location.href = 'index.html';
}
async function processResponse(response) {
    try {
        if (!response.ok) {
            if (response.statusText === "Validation error") {
                const { errors } = await response.json();
                paraError.textContent = errors;
                error.classList.add("open");
            }
            const responseError = await response.json();
            paraError.textContent = responseError.error;
            error.classList.add("open");
        }
        const { notes } = await response.json();
        renderNotes(notes, notesWrapper);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error: ", error.message);
        }
        else {
            console.error("Error: ", error);
        }
    }
}
function renderNotes(notes, wrapper) {
    try {
        if (!wrapper) {
            throw new Error("no div element");
        }
        wrapper.replaceChildren();
        if (notes.length !== 0) {
            notes.forEach(note => renderNote(wrapper, note));
        }
    }
    catch (error) {
        console.error(error);
    }
}
async function editTitle(event) {
    if (editMode) {
        h2Title.textContent = "Error";
        paraError.textContent = "cant edit note while another note is on edit";
        error.classList.add("open");
        return console.log("cant edit note while another note is on edit");
    }
    const editButton = event.target;
    const openBtn = editButton.previousElementSibling;
    const title = openBtn.previousElementSibling;
    const saveButton = editButton.nextElementSibling;
    const cancelButton = saveButton.nextElementSibling;
    console.log(title);
    editButton.classList.toggle("hidden");
    cancelButton.classList.toggle("hidden");
    saveButton.classList.toggle("hidden");
    title.classList.toggle("title-nonEdit");
    title.readOnly = false;
    editMode = true;
}
async function deleteNote(id) {
    if (editMode) {
        h2Title.textContent = "Error";
        paraError.textContent = "cant delete note while in edit";
        error.classList.add("open");
        return console.log("cant delete note while in edit");
    }
    const body = { id };
    const response = await fetch('/api/notes/delete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    await processResponse(response);
}
async function saveTitle(event, id) {
    const saveBtn = event.target;
    const editBtn = saveBtn.previousElementSibling;
    const openBtn = editBtn.previousElementSibling;
    const title = openBtn.previousElementSibling;
    const cancelBtn = saveBtn.nextElementSibling;
    const titleTxt = title.value;
    const updatedTitle = { title: titleTxt, id: id };
    try {
        const response = await fetch('/api/notes/updateTitle', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedTitle)
        });
        await processResponse(response);
        editMode = false;
        title.readOnly = true;
        editBtn.classList.toggle("hidden");
        cancelBtn.classList.toggle("hidden");
        saveBtn.classList.toggle("hidden");
        title.classList.toggle("title-nonEdit");
    }
    catch (error) {
        console.log({ error: error });
    }
}
function cancelEditTitle(event) {
    const cancelBtn = event.target;
    const saveBtn = cancelBtn.previousElementSibling;
    const editBtn = saveBtn.previousElementSibling;
    const openBtn = editBtn.previousElementSibling;
    const title = openBtn.previousElementSibling;
    editBtn.classList.toggle("hidden");
    cancelBtn.classList.toggle("hidden");
    saveBtn.classList.toggle("hidden");
    title.classList.toggle("title-nonEdit");
    editMode = false;
    title.readOnly = true;
}
async function saveDescription(id, event) {
    event.preventDefault();
    const savebtn = event.target;
    const description = savebtn.previousElementSibling;
    const desc = description.value;
    try {
        const response = await fetch('/api/notes/updateDescription', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: id, description: desc })
        });
        await processResponseDescription(response);
        h2Title.textContent = "Saved!";
        paraError.textContent = "Saved successfully";
        error.classList.add("open");
    }
    catch (error) {
        console.error("Error in saveDescription: ", error);
    }
}
function closeDescription() {
    wrapper.classList.toggle("hidden");
    noteTab.classList.toggle("hidden");
}
async function openDescription(id) {
    if (editMode) {
        h2Title.textContent = "Error";
        paraError.textContent = "cant open note while editing a note";
        error.classList.add("open");
        return console.log("cant open note while editing a note");
    }
    const response = await fetch('/api/notes/note', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id })
    });
    await processResponseDescription(response);
}
async function processResponseDescription(response) {
    try {
        if (!response.ok) {
            const { errors } = await response.json();
            paraError.textContent = errors || "An error occurred";
            error.classList.add("open");
            return;
        }
        const responseData = await response.json();
        if ('note' in responseData) {
            const { note } = responseData;
            renderNoteTab(note, noteTab);
        }
        else {
            console.error("Unexpected response format in processResponseDescription");
        }
    }
    catch (error) {
        console.error("Error in processResponseDescription: ", error);
    }
}
function renderNoteTab(note, noteTab) {
    noteTab.replaceChildren();
    wrapper.classList.toggle("hidden");
    noteTab.classList.toggle("hidden");
    const noteTabHeaderDiv = createElement("div", "note-tab__header");
    const noteTabHeaderTitle = createElement("h1", "note-tab__header--title", note.title);
    const closeBtn = createButtonElement("note-tab__header--closebtn", "X", () => closeDescription());
    noteTabHeaderDiv.appendChild(noteTabHeaderTitle);
    noteTabHeaderDiv.appendChild(closeBtn);
    const noteTabMainDiv = createElement("div", "note-tab__main");
    const noteTabMainDescription = createElement("textarea", "note-tab__main--description", note.description);
    const saveBtn = createButtonElement("note-tab__main--savebtn", "Save", (event) => saveDescription(note.id, event));
    noteTabMainDiv.appendChild(noteTabMainDescription);
    noteTabMainDiv.appendChild(saveBtn);
    noteTab.appendChild(noteTabHeaderDiv);
    noteTab.appendChild(noteTabMainDiv);
}
function renderNote(wrapper, note) {
    try {
        const noteDiv = createDivElement("wrapper__main__notediv");
        const titleDiv = createDivElement("wrapper__main__notediv__title");
        const title = createInputElement("text", "wrapper__main__notediv__title--title title-nonEdit", note.title);
        const openTitleButton = createButtonElement("wrapper__main__notediv__title-openbtn btn", "Open", () => openDescription(note.id));
        const editTitleButton = createButtonElement("wrapper__main__notediv__title--editbtn btn", "Edit", (event) => editTitle(event));
        const saveTitleButton = createButtonElement("wrapper__main__notediv__title--savebtn btn hidden", "Save", (event) => saveTitle(event, note.id));
        const cancelTitleButton = createButtonElement("wrapper__main__notediv__title--cancelbtn btn hidden", "Cancel", (event) => cancelEditTitle(event));
        const deleteTitleButton = createButtonElement("wrapper__main__notediv__title--deletebtn btn", "Delete", () => deleteNote(note.id));
        titleDiv.appendChild(title);
        titleDiv.appendChild(openTitleButton);
        titleDiv.appendChild(editTitleButton);
        titleDiv.appendChild(saveTitleButton);
        titleDiv.appendChild(cancelTitleButton);
        titleDiv.appendChild(deleteTitleButton);
        noteDiv.appendChild(titleDiv);
        wrapper.appendChild(noteDiv);
    }
    catch (error) {
        console.error(error);
    }
}
async function getNotes() {
    const response = await fetch('/api/users/notes');
    await processResponse(response);
}
async function addNote(event) {
    event.preventDefault();
    if (editMode) {
        h2Title.textContent = "Error";
        paraError.textContent = "cant submit note while editing note";
        error.classList.add("open");
        return console.log("cant submit note while editing note");
    }
    const form = document.querySelector('#notelist__form');
    const title = titleInput.value;
    const newTask = { title };
    const response = await fetch('/api/notes/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newTask)
    });
    await processResponse(response);
    form.reset();
}
function createElement(tagName, className, content) {
    const element = document.createElement(tagName);
    element.className = className;
    if (content) {
        element.textContent = content;
    }
    return element;
}
function createDivElement(className) {
    const element = document.createElement("div");
    element.className = className;
    return element;
}
function createButtonElement(className, content, handler) {
    const button = document.createElement("button");
    button.className = className;
    if (handler) {
        button.addEventListener("click", handler);
    }
    button.textContent = content;
    return button;
}
function createInputElement(type, className, content) {
    const input = document.createElement("input");
    input.type = type;
    input.className = className;
    input.readOnly = true;
    input.value = content;
    input.maxLength = 20;
    return input;
}
