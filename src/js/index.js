import 'core-js/stable';
import { createFigures } from './interactif2.js';

var insererEntetesBlocsLesson = function () {
    // Définitions
    const definitions = document.querySelectorAll('.definition');
    definitions.forEach((definition, index) => {
        definition.innerHTML = `
        <span id="def${index + 1}" class="header header-definition">
            Définition ${index + 1}.
        </span>${definition.innerHTML}`;
    });

    // Exemples
    const exemples = document.querySelectorAll('.exemple');
    exemples.forEach((exemple, index) => {
        exemple.innerHTML = `
        <details class="detailExemple">
            <summary>
                <span id="exemple${index + 1}" class="header header-exemple">
                    Exemple ${index + 1}.
                </span>
            </summary>
            ${exemple.innerHTML}
        </details>`;
    });

    // Propriétés
    const proprietes = document.querySelectorAll('.propriete');
    proprietes.forEach((propriete, index) => {
        propriete.innerHTML = `
        <span id="prop${index + 1}" class="header header-propriete">
            Propriété ${index + 1}.
        </span>${propriete.innerHTML}`;
    });

    // Remarques
    const remarques = document.querySelectorAll('.remarque');
    remarques.forEach((remarque, index) => {
        remarque.innerHTML = `
        <span id="remarque${index + 1}" class="header header-remarque">
            Remarque ${index + 1}.
        </span>${remarque.innerHTML}`;
    });

    // Démonstrations
    const demonstrations = document.querySelectorAll('.demonstration');
    demonstrations.forEach((demo, i) => {
        demo.innerHTML = `
    <details class="detailDemonstration">
      <summary>
        <span id="proof${i + 1}"
            class="header header-proof">
          Démonstration ${i + 1}.
        </span>
      </summary>
      ${demo.innerHTML}
      <span style="font-size: 150%;">&#9633;</span>
    </details>
  `;
    });
};
var insererEntetesBlocsExercices = function () {
    // Exercices
    const exercices = document.querySelectorAll('.exercice');
    exercices.forEach((exercice, index) => {
        const title = document.createElement('titreExercice');
        title.innerHTML = `
        <span class="titreExercice">
            Exercice ${index + 1}
        </span>`;
        exercice.insertBefore(title, exercice.firstChild);
    });

    // Exercices sans calculatrice
    var exercicesSansCalculatrice = document.querySelectorAll('.exercice:not(.calculator)');
    for (var i = 0; i < exercicesSansCalculatrice.length; i++) {
        exercicesSansCalculatrice[i].querySelector('.titreExercice').innerHTML += ' <span class="fa-stack fa-lg" style="font-size: 18px;"><i class="fas fa-calculator fa-stack-1x"></i><i class="fas fa-ban fa-stack-2x" style="color:Tomato"></i></span>';
    }

    // Solutions
    var solutions = document.querySelectorAll('.solution');
    for (var i = 0; i < solutions.length; i++) {
        var details = document.createElement('details');
        //details.setAttribute('open', '');
        details.classList.add('solution');
        details.innerHTML = '<summary>Solution</summary>';
        solutions[i].parentNode.insertBefore(details, solutions[i]);
        details.appendChild(solutions[i]);
    }

    // Indice
    var indices = document.querySelectorAll('.indice');
    for (var i = 0; i < indices.length; i++) {
        var details = document.createElement('details');
        //details.setAttribute('open', '');
        details.classList.add('indice');
        details.innerHTML = '<summary>Indice</summary>';
        indices[i].parentNode.insertBefore(details, indices[i]);
        details.appendChild(indices[i]);
    }
};
var wrapElementsInReveal = function (parent) {
    var elements = parent.querySelectorAll('li, p, td,.katex-display');

    for (var i = 0; i < elements.length; i++) {
        var reveal = document.createElement('div');
        reveal.className = 'reveal';
        reveal.innerHTML = elements[i].innerHTML;
        elements[i].innerHTML = '';
        elements[i].appendChild(reveal);
        reveal.addEventListener('click', function () {
            this.classList.add('clicked');
        });

        wrapElementsInReveal(reveal);
    }
}
var masquerSolutionsExercices = function () {
    var solutions = document.querySelectorAll('details.solution .solution');
    solutions.forEach(function (solution) {
        wrapElementsInReveal(solution);
    });
}
var insererFigures = function () {
    // Tester si le document contient des éléments de la class figure
    if (document.querySelector(".figure") != null) {
        // Recupérer le nom du fichier
        var filename = window.location.pathname.split("/").pop();
        // Modifier son extension en svg
        filename = filename.replace(/\.[^/.]+$/, ".svg");
        // Charger le fichier svg et le script d'interactivité si nécessaire
        d3.text(filename).then(function (svgData) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(svgData, "image/svg+xml");
            // Rechercher dans le document toutes les balises de class figure
            var figures = document.querySelectorAll(".figure");
            // Pour chaque figure, on récupère son id et on va chercher la figure dans doc
            figures.forEach(function (figure) {
                var id = figure.id;
                var svg = doc.getElementById(id);
                // On essaie de voir s'il a trouvé la figure. Si oui, on l'ajoute dans la div de class figure, sinon on affiche un message d'erreur
                // Si la figure est déjà présente dans le document, on ne fait rien
                if (figure.querySelector("svg") == null) {
                    if (svg == null) {
                        // On affiche en bleu le message d'erreur
                        figure.style.color = "blue";
                        // Le message est barré
                        figure.style.textDecoration = "line-through";
                        figure.innerHTML = "<i>Erreur : La figure " + id + " n'a pas été trouvée</i>";
                    } else {
                        figure.appendChild(svg);
                    }
                }
            })
            createFigures();
        });
    }
}
var convertirKatexEnMathML = function () {
    renderMathInElement(document.body, {
        // customised options
        // • auto-render specific keys, e.g.:
        delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
            { left: '\\(', right: '\\)', display: false },
            { left: '\\[', right: '\\]', display: true }
        ],
        // • rendering keys, e.g.:
        throwOnError: false,
        ignoredTags: ["svg"],
        output: "html", // Compatibilité avec Apple notamment
    });
}
var ajouterSommaire = function () {
    if (document.querySelector("#tableOfContents") != null) {
        var toc = document.getElementById('tableOfContents');
        var headers = document.querySelectorAll('h2, h3');

        headers.forEach(function (header, index) {
            var id = 'title' + index;
            header.id = id;

            var link = document.createElement('a');
            link.href = '#' + id;
            link.textContent = header.textContent;
            toc.appendChild(link);
            toc.appendChild(document.createElement('br'));
        });
    }
}
var openAvantPrint = function () {
    window.onbeforeprint = function () {
        const detailsElements = document.querySelectorAll('details');
        detailsElements.forEach(details => {
            details.setAttribute('open', '');
        });
    }
}
document.addEventListener("DOMContentLoaded", function () {
    insererEntetesBlocsLesson();
    insererEntetesBlocsExercices();
    insererFigures();
    convertirKatexEnMathML();
    masquerSolutionsExercices();
    ajouterSommaire();
    openAvantPrint();
});