document.getElementById('csvFileInput').addEventListener('change', handleFileSelect, false);
document.getElementById('randomizeButton').addEventListener('click', randomizeSeats, false);
document.getElementById('columnsInput').addEventListener('input', updateGridLayout);
document.getElementById('addDeskButton').addEventListener('click', addEmptyDesk);
document.getElementById('savePlanButton').addEventListener('click', saveCurrentPlan);
document.getElementById('renamePlanButton').addEventListener('click', renameSelectedPlan);
document.getElementById('deletePlanButton').addEventListener('click', deleteSelectedPlan);

// Automatically load the selected plan when the dropdown changes
document.getElementById('savedPlansSelect').addEventListener('change', loadSelectedPlan);

let students = [];

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

    emptyDeskDiv.addEventListener('dblclick', function() {
        classroomDiv.removeChild(emptyDeskDiv);
    });

    classroomDiv.insertBefore(emptyDeskDiv, classroomDiv.firstChild);
    enableDragAndDrop();
}

function enableDragAndDrop() {
    const studentsDivs = document.querySelectorAll('.student');
    let dragged = null;

    studentsDivs.forEach(studentDiv => {
        studentDiv.addEventListener('dragstart', function(event) {
            dragged = this;
            setTimeout(() => this.style.display = 'none', 0);
        });

        studentDiv.addEventListener('dragend', function(event) {
            setTimeout(() => this.style.display = 'flex', 0);
            dragged = null;
        });

        studentDiv.addEventListener('dragover', function(event) {
            event.preventDefault();
        });

        studentDiv.addEventListener('drop', function(event) {
            event.preventDefault();
            if (dragged && this !== dragged) {
                this.parentNode.insertBefore(dragged, this);
            }
        });
    });
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

        emptyDeskDiv.addEventListener('dblclick', function() {
            classroomDiv.removeChild(emptyDeskDiv);
        });

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

    if (existingPlanIndex !== -1) {
        if (!confirm(`Un plan de classe avec ce titre existe déjà. Voulez-vous le remplacer ?`)) {
            return;
        }
        savedPlans[existingPlanIndex] = { name: title, desks: desks };
    } else {
        savedPlans.push({ name: title, desks: desks });
    }

    localStorage.setItem("savedPlans", JSON.stringify(savedPlans));
    updateSavedPlansSelect();
}

function loadSelectedPlan() {
    const savedPlans = JSON.parse(localStorage.getItem("savedPlans") || "[]");
    const selectedPlanIndex = document.getElementById('savedPlansSelect').selectedIndex;
    if (savedPlans[selectedPlanIndex]) {
        const classroomDiv = document.getElementById('classroom');
        classroomDiv.innerHTML = '';

        const selectedPlan = savedPlans[selectedPlanIndex];
        selectedPlan.desks.forEach(deskData => {
            const deskDiv = document.createElement('div');
            deskDiv.className = 'student' + (deskData.isEmpty ? ' empty-desk' : '');
            deskDiv.textContent = deskData.content;
            deskDiv.draggable = true;

            if (deskData.isEmpty) {
                deskDiv.addEventListener('dblclick', function() {
                    classroomDiv.removeChild(deskDiv);
                });
            }

            classroomDiv.appendChild(deskDiv);
        });

        // Update the title input and displayed classroom title
        document.getElementById('titleInput').value = savedPlans[selectedPlanIndex].name;
        updateClassroomTitle();
        
        updateGridLayout();
        enableDragAndDrop();
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
    const savedPlans = JSON.parse(localStorage.getItem("savedPlans") || "[]");
    const selectedPlanIndex = document.getElementById('savedPlansSelect').selectedIndex;

    if (savedPlans[selectedPlanIndex]) {
        const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer le plan de classe "${savedPlans[selectedPlanIndex].name}" ?`);
        if (confirmed) {
            savedPlans.splice(selectedPlanIndex, 1);
            localStorage.setItem("savedPlans", JSON.stringify(savedPlans));
            updateSavedPlansSelect();
            document.getElementById('classroom').innerHTML = '';
            document.getElementById('titleInput').value = '';
            updateClassroomTitle();
        }
    }
}

function updateSavedPlansSelect() {
    const savedPlans = JSON.parse(localStorage.getItem("savedPlans") || "[]");
    const savedPlansSelect = document.getElementById('savedPlansSelect');
    savedPlansSelect.innerHTML = '';
    savedPlans.forEach((plan, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = plan.name;
        savedPlansSelect.appendChild(option);
    });

    // Automatically load the first plan if any exist
    if (savedPlans.length > 0) {
        savedPlansSelect.selectedIndex = 0; // Select the first plan
        loadSelectedPlan(); // Load the selected plan
    }
}

// Initializer
document.addEventListener('DOMContentLoaded', updateSavedPlansSelect);