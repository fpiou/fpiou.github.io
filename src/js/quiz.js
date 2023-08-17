import initSqlJs from "sql.js";
import { convertirKatexEnMathML } from "./index.js";
import { createFigures } from "./interactif2.js";

const config = {
  locateFile: (filename) => `/dist/${filename}`,
};

let SQL;
let isInitialized = false;

async function initializeSqlJs() {
  if (!isInitialized) {
    SQL = await initSqlJs(config);
    isInitialized = true;
  }
}

async function importerBD() {
  await initializeSqlJs();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let nomFichier = window.location.pathname.split("/").pop();
    nomFichier = nomFichier.replace(".html", ".sqlite");
    xhr.open(
      "GET",
      nomFichier,
      true
    );
    xhr.responseType = "arraybuffer";

    xhr.onload = function (e) {
      if (xhr.status === 200) {
        const db = new SQL.Database(new Uint8Array(this.response));
        resolve(db);
      } else {
        reject("Erreur lors du chargement de la base de données.");
      }
    };

    xhr.onerror = function () {
      reject("Erreur réseau lors du chargement de la base de données.");
    };

    xhr.send();
  });
}

function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function disableRadios() {
  var radios = document.getElementsByName("choix");
  for (var i = 0, length = radios.length; i < length; i++) {
    radios[i].disabled = false;
    radios[i].checked = false;
  }
}

function hideCorrection(choix) {
  for (var i = 0, length = choix.length; i < length; i++) {
    choix[i].style.background = "none";
  }
}

function hideValider() {
  document.getElementById("Valider").style.display = "none";
}

function setValider(text) {
  document.getElementById("Valider").innerHTML = text;
}

function getCorrection(response) {
  var radios = document.getElementsByClassName("choix");
  for (var i = 0, length = radios.length; i < length; i++) {
    radios[i].disabled = true;
    if (i == correctAnswerId) {
      radios[i].style.background = "#008000";
    }
    if (i == response && response != correctAnswerId) {
      radios[i].style.background = "#FF0000";
    }
  }
}

function getAnswer() {
  var radios = document.getElementsByName("choix");
  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      document.getElementById("Valider").innerHTML = "Suivant";
      return i;
    }
  }
}

let correctAnswerId;

function piocherQuestion(db) {
  // Choisir une question au hasard dans le groupe 1
  const query = `
  SELECT *
  FROM questions_answers
  WHERE group_id = 1
  ORDER BY RANDOM()
  LIMIT 1;
`;
  const result = db.exec(query);
  // On récupère la question et la réponse
  const question = result[0].values[0][2];
  const answer = result[0].values[0][3];
  // Choisir au hasard 3 réponses possibles
  const query2 = `
  SELECT *
  FROM questions_answers
  WHERE group_id = 1
  AND answer != '${answer}'
  ORDER BY RANDOM()
  LIMIT 3;
`;

  // On récupère les réponses possibles
  const result2 = db.exec(query2);
  // On crée un tableau avec les réponses possibles
  const answers = result2[0].values.map((value) => value[3]);
  // On ajoute la réponse à la fin du tableau
  answers.push(answer);
  // On mélange les réponses
  const shuffledAnswers = shuffle(answers);
  // On conserve l'index de la réponse
  const answerIndex = shuffledAnswers.indexOf(answer);
  // On place cet index dans une variable globale
  correctAnswerId = answerIndex;
  return {shuffledAnswers, question};
}

function remplirFormulaire(questionText,answersArray) {
  // Accédez à l'élément DOM pour la question et mettez à jour le texte
  const questionElement = document.querySelector("#question");
  questionElement.innerHTML = questionText;

  // Accédez aux éléments DOM pour les choix de réponse et mettez à jour leurs labels
  const choiceElements = document.querySelectorAll(".choix label");
  answersArray.forEach((answer, index) => {
    choiceElements[index].innerHTML = answer;
  });
}
export async function createQuizs() {
  try {
    const db = await importerBD();
    const {shuffledAnswers, question} = piocherQuestion(db);
    remplirFormulaire(question,shuffledAnswers);
    convertirKatexEnMathML();
    createFigures();

    setValider("Répondre");

    hideValider();

    disableRadios();

    var choix = document.getElementsByClassName("choix");
    hideCorrection(choix);

    var radios = document.getElementsByName("choix");
    for (var i = 0, length = radios.length; i < length; i++) {
      radios[i].addEventListener("change", function () {
        document.getElementById("Valider").innerHTML = "Répondre";
        document.getElementById("Valider").style.display = "inline";
      });
    }

    var choixDivs = document.getElementsByClassName("choix");
    for (var i = 0; i < choixDivs.length; i++) {
      choixDivs[i].addEventListener("click", function () {
        // When a .choix div is clicked, select the radio button inside it
        var radioButton = this.querySelector("input[type=radio]");
        radioButton.checked = true;

        // Trigger the change event on the radio button
        var event = new Event("change");
        radioButton.dispatchEvent(event);

        // Montrer la sélection en la grisant
        for (var j = 0; j < choixDivs.length; j++) {
          choixDivs[j].style.background = "none";
        }
        this.style.background = "#eeeeee";
      });
    }

    document.getElementById("Valider").addEventListener("click", function () {
      getCorrection(getAnswer());
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'importation de la base de données :",
      error
    );
  }
}
