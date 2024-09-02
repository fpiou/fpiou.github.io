document.getElementById('csvFileInput').addEventListener('change', handleFileSelect, false);
document.getElementById('randomizeButton').addEventListener('click', randomizeSeats, false);
document.getElementById('columnsInput').addEventListener('input', updateGridLayout);
document.getElementById('addDeskButton').addEventListener('click', addEmptyDesk);

let students = [];

function handleFileSelect(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const csv = event.target.result;
        students = csv.split('\n').map(row => {
            const [prenom, nom] = row.split(',');
            return { prenom, nom };
        }).filter(student => student.prenom && student.nom); // Filtrer les lignes vides
        
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

    classroomDiv.appendChild(emptyDeskDiv);
    enableDragAndDrop(); // Pour permettre de déplacer le bureau vide
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
            if (dragged) {
                // Vérifie si l'élément cible est le même que l'élément glissé
                if (this !== dragged) {
                    // Insère l'élément déplacé avant l'élément cible
                    this.parentNode.insertBefore(dragged, this);
                }
            }
        });
    });
}


function randomizeSeats() {
    const classroomDiv = document.getElementById('classroom');
    
    // Récupérer tous les enfants (étudiants et bureaux)
    const allDesks = Array.from(classroomDiv.children);
    
    // Mémoriser les positions des bureaux vides
    const emptyDeskPositions = [];
    allDesks.forEach((desk, index) => {
        if (desk.classList.contains('empty-desk')) {
            emptyDeskPositions.push({ element: desk, index: index });
        }
    });
    
    // Filtrer les bureaux non vides
    const nonEmptyDesks = allDesks.filter(desk => !desk.classList.contains('empty-desk'));
    
    // Mélanger uniquement les bureaux non vides
    const shuffledDesks = nonEmptyDesks.sort(() => Math.random() - 0.5);
    
    // Vider le conteneur
    classroomDiv.innerHTML = '';
    
    // Réinsérer les bureaux, en tenant compte des bureaux vides mémorisés
    let shuffledIndex = 0;
    for (let i = 0; i < allDesks.length; i++) {
        // Si un bureau vide doit être à cette position, on l'ajoute
        const emptyDesk = emptyDeskPositions.find(pos => pos.index === i);
        if (emptyDesk) {
            classroomDiv.appendChild(emptyDesk.element);
        } else {
            // Sinon, on ajoute un bureau non vide mélangé
            classroomDiv.appendChild(shuffledDesks[shuffledIndex]);
            shuffledIndex++;
        }
    }
}

function displayClassroom(students) {
    const classroomDiv = document.getElementById('classroom');
    classroomDiv.innerHTML = ''; // Vider le contenu précédent

    students.forEach(student => {
        const studentDiv = document.createElement('div');
        studentDiv.className = 'student';
        studentDiv.textContent = `${student.prenom} ${student.nom}`;
        studentDiv.draggable = true;

        classroomDiv.appendChild(studentDiv);
    });

    updateGridLayout();
    enableDragAndDrop();
}




function updateGridLayout() {
    const columns = document.getElementById('columnsInput').value || 4;
    const classroomDiv = document.getElementById('classroom');
    classroomDiv.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
}
