import "core-js/stable";
import { createFigures } from "./interactif2.js";
import { createQuizs } from "./quiz.js";

var insererEntetesBlocsLesson = function () {
  // Définitions
  const definitions = document.querySelectorAll(".definition");
  definitions.forEach((definition, index) => {
    definition.innerHTML = `
        <span id="def${index + 1}" class="header header-definition">
            Définition ${index + 1}.
        </span>${definition.innerHTML}`;
  });

  // Exemples
  const exemples = document.querySelectorAll(".exemple");
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
  const proprietes = document.querySelectorAll(".propriete");
  proprietes.forEach((propriete, index) => {
    propriete.innerHTML = `
        <span id="prop${index + 1}" class="header header-propriete">
            Propriété ${index + 1}.
        </span>${propriete.innerHTML}`;
  });

  // Remarques
  const remarques = document.querySelectorAll(".remarque");
  remarques.forEach((remarque, index) => {
    remarque.innerHTML = `
        <span id="remarque${index + 1}" class="header header-remarque">
            Remarque ${index + 1}.
        </span>${remarque.innerHTML}`;
  });

  // Méthodes
  const methodes = document.querySelectorAll(".methode");
  methodes.forEach((methode, index) => {
    methode.innerHTML = `
        <span id="methode${index + 1}" class="header header-methode">
            Méthode ${index + 1}.
        </span>${methode.innerHTML}`;
  });

  // Démonstrations
  const demonstrations = document.querySelectorAll(".demonstration");
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
  const exercices = document.querySelectorAll(".exercice");
  exercices.forEach((exercice, index) => {
    const title = document.createElement("titreExercice");
    title.innerHTML = `
        <span class="titreExercice">
            Exercice ${index + 1}
        </span>`;
    exercice.insertBefore(title, exercice.firstChild);
  });

  // Exercices sans calculatrice
  // var exercicesSansCalculatrice = document.querySelectorAll(
  //   ".exercice:not(.calculator)"
  // );
  // for (var i = 0; i < exercicesSansCalculatrice.length; i++) {
  //   exercicesSansCalculatrice[i].querySelector(".titreExercice").innerHTML +=
  //     ' <span class="fa-stack fa-lg" style="font-size: 18px;"><i class="fas fa-calculator fa-stack-1x"></i><i class="fas fa-ban fa-stack-2x" style="color:Tomato"></i></span>';
  // }

  // Solutions
  var solutions = document.querySelectorAll(".solution");
  for (var i = 0; i < solutions.length; i++) {
    var details = document.createElement("details");
    //details.setAttribute('open', '');
    details.classList.add("solution");
    details.innerHTML = "<summary>Solution</summary>";
    solutions[i].parentNode.insertBefore(details, solutions[i]);
    details.appendChild(solutions[i]);
  }

  // Indice
  var indices = document.querySelectorAll(".indice");
  for (var i = 0; i < indices.length; i++) {
    var details = document.createElement("details");
    //details.setAttribute('open', '');
    details.classList.add("indice");
    details.innerHTML = "<summary>Indice</summary>";
    indices[i].parentNode.insertBefore(details, indices[i]);
    details.appendChild(indices[i]);
  }
};
var wrapElementsInReveal = function (parent) {
  var elements = parent.querySelectorAll("p, .katex-display, table, .figure");

  for (var i = 0; i < elements.length; i++) {
    elements[i].classList.add("reveal");
    elements[i].addEventListener("click", function () {
      this.classList.add("clicked");
    });
  }
};
var masquerSolutionsExercices = function () {
  var solutions = document.querySelectorAll("details.solution .solution");
  solutions.forEach(function (solution) {
    wrapElementsInReveal(solution);
  });
};
function formatNumberForLatex(strNum) {
  // Remplacez d'abord les points ou virgules par {,}
  strNum = strNum.replace(/[.,]/g, "{,}");

  // Séparez la partie entière et décimale
  let [intPart, decPart] = strNum.split("{,}");

  // Ajoutez des espaces pour séparer les milliers dans la partie entière
  intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "\\ ");

  // Si une partie décimale existe, ajoutez des espaces pour séparer les milliers
  if (decPart) {
    decPart = decPart.replace(/(\d{3})\B/g, "$1\\ ");
    return intPart + "{,}" + decPart;
  }

  return intPart;
}
function formatSIForLatex(value, unit) {
  // Remplacer \cm, \m, etc. par \text{cm}, \text{m}, etc., mais exclure \square et \cubic
  unit = unit.replace(/\\(?!square|cubic)(\w+)/g, "\\text{$1}");

  // Remplacer \square\text{cm} par \text{cm}^2 et similaires
  unit = unit.replace(/\\square\\text\{(\w+)\}/g, "\\text{$1}^2");

  // Remplacer \cubic\text{cm} par \text{cm}^3 et similaires
  unit = unit.replace(/\\cubic\\text\{(\w+)\}/g, "\\text{$1}^3");
  console.log(unit);
  // Ajoutez d'autres remplacements d'unités si nécessaire

  return formatNumberForLatex(value) + "\\," + unit;
}
function preprocessLatexText(text) {
  const delimiters = [
    /\$(.*?)\$/g,
    /\$\$(.*?)\$\$/g,
    /\\\((.*?)\\\)/g,
    /\\\[.*?\\\]/g,
  ];

  for (let delimiter of delimiters) {
    text = text.replace(delimiter, function (match) {
      // Traitement pour \num{}
      match = match.replace(/\\num\{(-?[\d.,]+)\}/g, function (_, p1) {
        return formatNumberForLatex(p1);
      });

      // Traitement pour \SI{...}{...}
      match = match.replace(
        /\\SI\{(-?[\d.,]+)\}\{(.*?)\}/g,
        function (_, p1, p2) {
          return formatSIForLatex(p1, p2);
        }
      );

      return match;
    });
  }
  return text;
}
function isDescendantOfScript(node) {
  while (node) {
    if (node.tagName === "SCRIPT") {
      return true;
    }
    node = node.parentNode;
  }
  return false;
}
function preprocessLatex() {
  // Parcourir tous les noeuds textuels du document
  const walk = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  let node;
  while ((node = walk.nextNode())) {
    if (
      node.nodeValue &&
      /\$|\\\[|\\\(/.test(node.nodeValue) &&
      !isDescendantOfScript(node)
    ) {
      node.nodeValue = preprocessLatexText(node.nodeValue);
    }
  }
}
export var convertirKatexEnMathML = function () {
  preprocessLatex();
  renderMathInElement(document.body, {
    // customised options
    // • auto-render specific keys, e.g.:
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
      { left: "\\(", right: "\\)", display: false },
      { left: "\\[", right: "\\]", display: true },
    ],
    // • rendering keys, e.g.:
    throwOnError: false,
    ignoredTags: ["svg"],
    output: "html", // Compatibilité avec Apple notamment
  });
};
var ajouterSommaire = function () {
  if (document.querySelector("#tableOfContents") != null) {
    var toc = document.getElementById("tableOfContents");
    var headers = document.querySelectorAll("h1, h2, h3, h4");

    var currentLists = [document.createElement("ul")]; // Liste principale pour les h1
    toc.appendChild(currentLists[0]);

    headers.forEach(function (header, index) {
      var id = "title" + index;
      header.id = id;

      var link = document.createElement("a");
      link.href = "#" + id;
      link.textContent = header.textContent;

      var listItem = document.createElement("li");
      listItem.appendChild(link);

      var level = parseInt(header.tagName[1]) - 1; // h1 -> 0, h2 -> 1, etc.

      // Si la liste actuelle est plus profonde que le niveau actuel, remontez
      while (currentLists.length - 1 > level) {
        currentLists.pop();
      }

      // Si le niveau actuel est plus profond que la liste actuelle, créez une nouvelle liste imbriquée
      if (currentLists.length - 1 < level) {
        var newList = document.createElement("ul");
        currentLists[currentLists.length - 1].lastChild.appendChild(newList);
        currentLists.push(newList);
      }

      currentLists[currentLists.length - 1].appendChild(listItem);
    });
  }
};
var openAvantPrint = function () {
  window.onbeforeprint = function () {
    const detailsElements = document.querySelectorAll("details");
    detailsElements.forEach((details) => {
      details.setAttribute("open", "");
    });
  };
};
var adapterPositionDropdown = function (event) {
  var dropdownContent = event.currentTarget.querySelector(".dropdown-content");

  // Affichez le dropdown pour pouvoir obtenir ses dimensions
  dropdownContent.style.display = "flex";
  dropdownContent.style.flexDirection = "column";

  // Calculez la distance entre le bord droit du dropdown et le bord droit de la fenêtre
  var overflowDistance =
    dropdownContent.getBoundingClientRect().right - window.innerWidth;

  // Si le dropdown déborde à droite
  if (overflowDistance > 0) {
    // Ajustez la position du dropdown
    // Par exemple, déplacez le dropdown vers la gauche de la distance de débordement
    dropdownContent.style.right = overflowDistance + "px";
  } else {
    // Réinitialisez la position si elle a été précédemment ajustée
    dropdownContent.style.right = "auto";
  }
};
var dropdownMenusBandeau = function () {
  var dropdowns = document.querySelectorAll(".dropdown");
  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("click", function (event) {
      if (event.currentTarget.classList.contains("dropdown")) {
        // Masquer tous les dropdowns sauf celui cliqué
        dropdowns.forEach((dropdown) => {
          if (dropdown != event.target.parentNode) {
            dropdown.querySelector(".dropdown-content").style.display = "none";
          }
        });
        // Afficher ou masquer le dropdown cliqué
        var dropdownContent = event.currentTarget.querySelector(".dropdown-content");
        if (dropdownContent.style.display == "flex") {
          dropdownContent.style.display = "none";
        } else {
          adapterPositionDropdown(event);
          //dropdownContent.style.display = "flex";
        }
      }
    });
    dropdown.addEventListener("mouseover", function (event) {
      // On survole un élément dropdown
      if (event.target.classList.contains("dropdown")) {
        adapterPositionDropdown(event);
      }
    });
    dropdown.addEventListener("mouseleave", function (event) {
      if (event.target.classList.contains("dropdown")) {
        var dropdownContent = event.target.querySelector(".dropdown-content");
        dropdownContent.style.display = "none";
      }
    });
  });
};

document.addEventListener("DOMContentLoaded", function () {
  insererEntetesBlocsLesson();
  insererEntetesBlocsExercices();
  // On teste si on est dans un contexte <meta name="quiz" content="true">
  if (document.querySelector("meta[name=quiz]") != null) {
    createQuizs();
  } else {
    createFigures();
  }
  convertirKatexEnMathML();
  masquerSolutionsExercices();
  ajouterSommaire();
  dropdownMenusBandeau();
  openAvantPrint();
});
