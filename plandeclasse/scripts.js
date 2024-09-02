document.getElementById('csvFileInput').addEventListener('change', handleFileSelect, false);
document.getElementById('randomizeButton').addEventListener('click', randomizeSeats, false);
document.getElementById('columnsInput').addEventListener('input', updateGridLayout);
document.getElementById('addDeskButton').addEventListener('click', addEmptyDesk);
document.getElementById('savePlanButton').addEventListener('click', saveCurrentPlan);
document.getElementById('renamePlanButton').addEventListener('click', renameSelectedPlan);
document.getElementById('deletePlanButton').addEventListener('click', deleteSelectedPlan);
document.getElementById('exportPlansButton').addEventListener('click', exportPlans);
document.getElementById('importPlansButton').addEventListener('click', importPlans);

document.getElementById('importPlansFileInput').addEventListener('change', handleImportFile, false);

// Automatically load the selected plan when the dropdown changes
document.getElementById('savedPlansSelect').addEventListener('change', loadSelectedPlan);

let students = [];

function exportPlans() {
    const savedPlans = localStorage.getItem("savedPlans") || "[]";
    const blob = new Blob([savedPlans], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plans_de_classe.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function handleImportFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const importedPlans = JSON.parse(event.target.result);
            if (Array.isArray(importedPlans)) {
                localStorage.setItem("savedPlans", JSON.stringify(importedPlans));
                updateSavedPlansSelect();
                alert('Plans de classe importés avec succès!');
            } else {
                alert('Le fichier n\'est pas au format correct.');
            }
        } catch (e) {
            alert('Erreur lors de l\'importation des plans de classe.');
        }
    };
    reader.readAsText(file);
}

function importPlans() {
    document.getElementById('importPlansFileInput').click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const csv = event.target.result;
        students = csv.split('\n').map(row => {
            const [prenom, nom] = row.split(',');
            return { prenom, nom };
        }).filter(student => student.prenom && student.nom);
        
        displayClassroom(students);
    };
    
    reader.readAsText(file);
}

function addEmptyDesk() {
    const classroomDiv = document.getElementById('classroom');
    const emptyDeskDiv = document.createElement('div');
    emptyDeskDiv.className = 'student empty-desk';
    emptyDeskDiv.textContent = 'Bureau vide';
    emptyDeskDiv.draggable = true;

    classroomDiv.insertBefore(emptyDeskDiv, classroomDiv.firstChild);
    enableDragAndDrop();
}

function enableDragAndDrop() {
    const studentsDivs = document.querySelectorAll('.student');
    let dragged = null;

    studentsDivs.forEach((studentDiv, index) => {
        studentDiv.setAttribute('draggable', true);
        studentDiv.setAttribute('data-id', index); // Assign a unique ID to each table

        studentDiv.addEventListener('dragstart', function(event) {
            dragged = this;
            dragged.style.opacity = "0.5"; // Make the original element semi-transparent
            event.dataTransfer.setData('text/html', this.innerHTML); // Store the HTML content of the dragged element
        });

        studentDiv.addEventListener('dragend', function(event) {
            dragged.style.opacity = "1"; // Reset the opacity of the original element
            const classroomDiv = document.getElementById('classroom');
            const rect = classroomDiv.getBoundingClientRect();
            const x = event.clientX;
            const y = event.clientY;

            if (x < rect.left || x > rect.right || y > rect.bottom || y < rect.top) {
                dragged.parentNode.removeChild(dragged);
            }
            dragged = null;
        });

        studentDiv.addEventListener('dragover', function(event) {
            event.preventDefault(); // Necessary to allow a drop
            event.dataTransfer.dropEffect = "move";
        });

        studentDiv.addEventListener('drop', function(event) {
            event.preventDefault();
            if (dragged && this !== dragged) {
                let temp = this.innerHTML;
                this.innerHTML = dragged.innerHTML;
                dragged.innerHTML = temp;
            }
        });

        // Single click to open the modal
        studentDiv.addEventListener('click', function() {
            openModal(this.textContent, this);
        });
    });
}

function openModal(content, studentDiv) {
    const modal = document.getElementById("tableModal");
    const modalText = document.getElementById("modalText");

    // Display the content as plain text
    modalText.textContent = content;
    modalText.setAttribute('data-id', studentDiv.getAttribute('data-id')); // Store the ID of the studentDiv

    modal.style.display = "flex";
}

function enableEditingInModal() {
    const modalText = document.getElementById("modalText");
    const studentDivId = modalText.getAttribute('data-id');
    const studentDiv = document.querySelector(`.student[data-id="${studentDivId}"]`);
    const currentName = modalText.textContent.trim();

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName;
    input.style.width = '100%';
    input.style.textAlign = 'center';

    modalText.innerHTML = '';
    modalText.appendChild(input);
    input.focus();

    input.addEventListener('blur', function() {
        updateTableName(studentDiv, input.value.trim());
        closeModal();
    });

    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            updateTableName(studentDiv, input.value.trim());
            closeModal();
        }
    });
}

// Function to close the modal
function closeModal() {
    const modal = document.getElementById("tableModal");
    modal.style.display = "none";
}

document.getElementById("modalText").addEventListener('dblclick', enableEditingInModal);
document.getElementById("closeModal").addEventListener('click', closeModal);

// Close the modal when the user clicks outside the modal content
window.addEventListener('click', function(event) {
    const modal = document.getElementById("tableModal");
    if (event.target === modal) {
        closeModal();
    }
});

function editTableName(studentDiv) {
    const currentName = studentDiv.textContent.trim();
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentName === 'Bureau vide' ? '' : currentName; // Default to empty if it's an empty desk
    input.style.width = '100%';
    input.style.textAlign = 'center';

    // Replace the content with the input field
    studentDiv.innerHTML = '';
    studentDiv.appendChild(input);
    input.focus();

    // Handle input field's events
    input.addEventListener('blur', function() {
        updateTableName(studentDiv, input.value.trim());
    });

    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            updateTableName(studentDiv, input.value.trim());
        }
    });
}

function updateTableName(studentDiv, newName) {
    if (newName) {
        studentDiv.textContent = newName;
        studentDiv.classList.remove('empty-desk');
    } else {
        studentDiv.textContent = 'Bureau vide';
        studentDiv.classList.add('empty-desk');
    }
    enableDragAndDrop(); // Re-enable drag and drop functionality
}

function randomizeSeats() {
    const classroomDiv = document.getElementById('classroom');
    const allDesks = Array.from(classroomDiv.children);

    const emptyDeskPositions = [];
    allDesks.forEach((desk, index) => {
        if (desk.classList.contains('empty-desk')) {
            emptyDeskPositions.push({ element: desk, index: index });
        }
    });

    const nonEmptyDesks = allDesks.filter(desk => !desk.classList.contains('empty-desk'));
    const shuffledDesks = nonEmptyDesks.sort(() => Math.random() - 0.5);

    classroomDiv.innerHTML = '';

    let shuffledIndex = 0;
    for (let i = 0; i < allDesks.length; i++) {
        const emptyDesk = emptyDeskPositions.find(pos => pos.index === i);
        if (emptyDesk) {
            classroomDiv.appendChild(emptyDesk.element);
        } else {
            classroomDiv.appendChild(shuffledDesks[shuffledIndex]);
            shuffledIndex++;
        }
    }
}

function displayClassroom(students) {
    const classroomDiv = document.getElementById('classroom');
    classroomDiv.innerHTML = '';

    students.forEach(student => {
        const studentDiv = document.createElement('div');
        studentDiv.className = 'student';
        studentDiv.textContent = `${student.prenom} ${student.nom}`;
        studentDiv.draggable = true;

        classroomDiv.appendChild(studentDiv);
    });

    completeWithEmptyDesks();
    updateGridLayout();
    enableDragAndDrop();
    updateClassroomTitle();
}

function completeWithEmptyDesks() {
    const classroomDiv = document.getElementById('classroom');
    const columns = document.getElementById('columnsInput').value || 4;
    const totalDesks = classroomDiv.children.length;

    const remainder = totalDesks % columns;
    const desksToAdd = remainder === 0 ? 0 : columns - remainder;

    for (let i = 0; i < desksToAdd; i++) {
        const emptyDeskDiv = document.createElement('div');
        emptyDeskDiv.className = 'student empty-desk';
        emptyDeskDiv.textContent = 'Bureau vide';
        emptyDeskDiv.draggable = true;

        

        classroomDiv.insertBefore(emptyDeskDiv, classroomDiv.firstChild);
    }
}

function updateGridLayout() {
    const columns = document.getElementById('columnsInput').value || 4;
    const classroomDiv = document.getElementById('classroom');
    classroomDiv.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}

function updateClassroomTitle() {
    const title = document.getElementById('titleInput').value;
    const classroomTitle = document.getElementById('classroomTitle');
    classroomTitle.textContent = title;
}

function saveCurrentPlan() {
    const title = document.getElementById('titleInput').value.trim();
    if (!title) {
        alert("Veuillez entrer un titre pour le plan de classe.");
        return;
    }

    const classroomDiv = document.getElementById('classroom');
    const desks = Array.from(classroomDiv.children).map(desk => ({
        content: desk.textContent,
        isEmpty: desk.classList.contains('empty-desk')
    }));

    let savedPlans = JSON.parse(localStorage.getItem("savedPlans") || "[]");

    const existingPlanIndex = savedPlans.findIndex(plan => plan.name === title);
    const savedPlansSelect = document.getElementById('savedPlansSelect');
    let selectedPlanIndex = savedPlansSelect.selectedIndex;

    if (existingPlanIndex !== -1) {
        if (!confirm(`Un plan de classe avec ce titre existe déjà. Voulez-vous le remplacer ?`)) {
            return;
        }
        savedPlans[existingPlanIndex] = { name: title, desks: desks };
        selectedPlanIndex = existingPlanIndex; // Keep the selection on the replaced plan
    } else {
        savedPlans.push({ name: title, desks: desks });
        selectedPlanIndex = savedPlans.length - 1; // Set to the newly added plan
    }

    localStorage.setItem("savedPlans", JSON.stringify(savedPlans));
    updateSavedPlansSelect();

    // Restore the selected plan after updating the list
    savedPlansSelect.selectedIndex = selectedPlanIndex;
}

function updateSavedPlansSelect() {
    const savedPlans = JSON.parse(localStorage.getItem("savedPlans") || "[]");
    const savedPlansSelect = document.getElementById('savedPlansSelect');
    const previousSelection = savedPlansSelect.selectedIndex;

    savedPlansSelect.innerHTML = '';
    savedPlans.forEach((plan, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = plan.name;
        savedPlansSelect.appendChild(option);
    });

    if (savedPlans.length > 0) {
        savedPlansSelect.selectedIndex = previousSelection >= 0 && previousSelection < savedPlans.length 
                                         ? previousSelection 
                                         : 0;
        loadSelectedPlan();
    }
}

function loadSelectedPlan() {
    const savedPlans = JSON.parse(localStorage.getItem("savedPlans") || "[]");
    const savedPlansSelect = document.getElementById('savedPlansSelect');
    const selectedPlanIndex = savedPlansSelect.selectedIndex;
    
    if (savedPlans[selectedPlanIndex]) {
        const classroomDiv = document.getElementById('classroom');
        classroomDiv.innerHTML = '';

        const selectedPlan = savedPlans[selectedPlanIndex];
        selectedPlan.desks.forEach(deskData => {
            const deskDiv = document.createElement('div');
            deskDiv.className = 'student' + (deskData.isEmpty ? ' empty-desk' : '');
            deskDiv.textContent = deskData.content;
            deskDiv.draggable = true;

            

            classroomDiv.appendChild(deskDiv);
        });

        // Update the title input and displayed classroom title
        document.getElementById('titleInput').value = savedPlans[selectedPlanIndex].name;
        updateClassroomTitle();
        
        updateGridLayout();
        enableDragAndDrop();

        // Ensure the dropdown remains on the selected plan
        savedPlansSelect.selectedIndex = selectedPlanIndex;
    }
}

function renameSelectedPlan() {
    const savedPlans = JSON.parse(localStorage.getItem("savedPlans") || "[]");
    const selectedPlanIndex = document.getElementById('savedPlansSelect').selectedIndex;

    if (savedPlans[selectedPlanIndex]) {
        const newName = prompt("Entrez un nouveau nom pour le plan de classe:", savedPlans[selectedPlanIndex].name);
        if (newName && newName.trim() !== "") {
            const nameExists = savedPlans.some(plan => plan.name === newName.trim());

            if (nameExists) {
                alert("Un plan de classe avec ce nom existe déjà. Veuillez choisir un autre nom.");
            } else {
                savedPlans[selectedPlanIndex].name = newName.trim();
                localStorage.setItem("savedPlans", JSON.stringify(savedPlans));
                updateSavedPlansSelect();
                document.getElementById('titleInput').value = newName.trim();
                updateClassroomTitle();
            }
        }
    }
}

function deleteSelectedPlan() {
    const savedPlans = JSON.parse(getCookie("savedPlans") || "[]");
    const selectedPlanIndex = document.getElementById('savedPlansSelect').selectedIndex;

    if (savedPlans[selectedPlanIndex]) {
        const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer le plan de classe "${savedPlans[selectedPlanIndex].name}" ?`);
        if (confirmed) {
            savedPlans.splice(selectedPlanIndex, 1);
            setCookie("savedPlans", JSON.stringify(savedPlans), 365);
            updateSavedPlansSelect();
            document.getElementById('classroom').innerHTML = '';
            document.getElementById('titleInput').value = '';
            updateClassroomTitle();
        }
    }
}

// Initializer
document.addEventListener('DOMContentLoaded', updateSavedPlansSelect);
