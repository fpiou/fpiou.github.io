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
    // Vérifier si le nom du fichier se termine par .html
    if (!nomFichier.endsWith(".html")) {
      nomFichier += ".html";
    }
    nomFichier = nomFichier.replace(".html", ".sqlite");
    xhr.open("GET", nomFichier, true);
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
    // La réponse est correcte
    if (i == correctAnswerId && i == response) {
      radios[i].style.background = "rgba(0, 200, 0, 0.7)";
      nbResponsesCorrectes++;
    }
    // La réponse correcte en cas d'erreur
    if (i == correctAnswerId && i != response) {
      radios[i].style.background = "rgba(255, 0, 0,0.5)";
    }
    // La réponse sélectionnée en cas d'erreur
    if (i == response && response != correctAnswerId) {
      radios[i].style.background = "rgb(128, 128, 128,0.2)";
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
let series = [];
let nextQuestions = [];
let db;
let numQuestion = 0;
let nbQuestions = 0;
let nbResponsesCorrectes = 0;

function creerSerieQuizs(database) {
  // On détermine le nombre de groupes
  const query = `SELECT MAX(group_id) FROM questions_answers;`;
  const result = database.exec(query);
  const nbGroupes = result[0].values[0][0];
  // On parcourt les groupes
  for (let i = 1; i <= nbGroupes; i++) {
    // On récupère toutes les questions du groupe
    const query2 = `SELECT * FROM questions_answers WHERE group_id = ${i};`;
    const result2 = database.exec(query2);
    // On mélange les questions
    const shuffledQuestions = shuffle(result2[0].values);
    // On ajoute les questions mélangées à la série
    series.push(shuffledQuestions);
  }
}

function tourSuivant() {
  // On remet le compteur de réponses correctes à zéro
  nbResponsesCorrectes = 0;
  // On détermine le nombre de groupes restant dans la série
  const nbGroupes = series.length;
  // On parcourt les groupes de la série
  let questions = [];
  for (let i = 0; i < nbGroupes; i++) {
    // On récupère la première question du groupe
    const question = series[i].shift();
    // On ajoute la question au tableau des questions
    questions.push(question);
  }
  // Si un groupe est vide, on le supprime de la série
  series = series.filter((groupe) => groupe.length > 0);
  // On parcourt les questions
  questions.forEach((question) => {
    // On récupère la question et la réponse
    const questionText = question[2];
    let answer = question[3];
    // Si answer ne contient pas de balise <div> avec la classe "choice"
    if (!answer.includes('<div class="choice">')) {
      // On choisit au hasard 3 réponses possibles du même groupe
      const query2 = `SELECT * FROM questions_answers WHERE group_id = ${question[1]} AND answer != "${answer}" ORDER BY RANDOM() LIMIT 3;`;
      // On récupère les réponses possibles
      const result2 = db.exec(query2);
      // On ajoute la réponse à la fin du tableau
      const answers = result2[0].values.map((value) => value[3]);
      answers.push(answer);
      // On mélange les réponses
      const shuffledAnswers = shuffle(answers);
      // On conserve la bonne réponse
      const correctAnswer = shuffledAnswers.indexOf(answer);
      // On ajoute la question et ses réponses à la prochaine série
      nextQuestions.push({
        question: questionText,
        answers: shuffledAnswers,
        correctAnswer: correctAnswer,
      });
    } else {
      // On récupère les réponses possibles dans les balises <div> avec la classe "choice"
      const parsedDocument = new DOMParser().parseFromString(
        answer,
        "text/html"
      );
      const choiceElements = Array.from(
        parsedDocument.querySelectorAll(".choice")
      );
      const answers = choiceElements.map((value) => value.innerHTML);
      // La première réponse est la bonne réponse
      answer = answers[0];
      // On mélange les réponses
      const shuffledAnswers = shuffle([
        answer,
        ...shuffle(answers.slice(1)).slice(0, 3),
      ]);
      // On conserve la bonne réponse
      const correctAnswer = shuffledAnswers.indexOf(answer);
      // On ajoute la question et ses réponses à la prochaine série
      nextQuestions.push({
        question: questionText,
        answers: shuffledAnswers,
        correctAnswer: correctAnswer,
      });
    }
  });
  // On mélange les questions
  nextQuestions = shuffle(nextQuestions);
  // On conserve le nombre de questions
  nbQuestions = nextQuestions.length;
  // On ajoute le div pour l'impression du quiz
  printQuiz(nextQuestions);
}

function remplirFormulaire(questionText, answersArray) {
  // Accéder à l'élément DOM pour la question et mettre à jour le texte
  const questionElement = document.querySelector("#question");
  // Mettre à jour le contenu de questionElement
  questionElement.innerHTML = questionText;

  // Accéder aux éléments DOM pour les choix de réponse et mettre à jour leurs labels
  const choiceElements = document.querySelectorAll(".choix label");
  answersArray.forEach((answer, index) => {
    choiceElements[index].innerHTML = answer;
    if (answer == "") {
      //Le bouton radio dans lequel est contenu le label est désactivé est caché
      choiceElements[index].parentElement.style.display = "none";
    } else {
      //Le bouton radio dans lequel est contenu le label est activé et affiché
      choiceElements[index].parentElement.style.display = "block";
    }
  });
}

function questionsDifferentes() {
  // On agit que si le bouton Imprimer est affiché
  if (document.querySelector("#Imprimer").style.display == "inline") {
    nextQuestions = [];
    if (series.length > 0) {
      tourSuivant();
      document.querySelector("#Imprimer").style.display = "inline";
      numQuestion = 0;
    } else {
      // On recharge la page
      window.location.reload();
    }
  }
}

function ajouterEcouteursQuiz() {
  var radios = document.getElementsByName("choix");
  for (var i = 0, length = radios.length; i < length; i++) {
    radios[i].addEventListener("change", function () {
      document.getElementById("Valider").style.display = "inline";
    });
  }
  // Sélection du bouton radio d'un choix du quiz
  var choixDivs = document.getElementsByClassName("choix");
  for (var i = 0; i < choixDivs.length; i++) {
    choixDivs[i].addEventListener("click", function () {
      // Montrer la sélection en la grisant que si le bouton Valider n'est pas sur "Suivant"
      if (document.getElementById("Valider").innerHTML != "Suivant") {
        var radioButton = this.querySelector("input[type=radio]");
        radioButton.checked = true;

        // Trigger the change event on the radio button
        var event = new Event("change");
        radioButton.dispatchEvent(event);

        for (var j = 0; j < choixDivs.length; j++) {
          choixDivs[j].style.background = "none";
        }
        this.style.background = "rgb(0, 0, 255,0.2)";
      }
    });
  }
  // Sélection du bouton Valider
  var Valider = document.getElementById("Valider");
  Valider.addEventListener("click", function () {
    if (this.innerHTML == "Suivant" || this.innerHTML == "En ligne") {
      questionsDifferentes();
      window.parent.postMessage("questionSuivante", "*");
      var formulaire = document.querySelector(".quiz-choices");
      formulaire.classList.remove("clicked");
      // Ne plus afficher le bouton Imprimer
      document.querySelector("#Imprimer").style.display = "none";
      // Ne plus afficher l'introduction
      document.querySelector(".introduction-quiz").style.display = "none";
      document.querySelector("#score").style.display = "none";
    } else {
      getCorrection(getAnswer());
      // Récupérer tous les boutons radios
      var radios = document.getElementsByName("choix");
      // Désactiver tous les boutons radios
      for (var i = 0, length = radios.length; i < length; i++) {
        radios[i].disabled = true;
      }
    }
  });
  // Ajouter un écouteur pour le message "questionSuivante"
  window.addEventListener("message", function (event) {
    if (event.data == "questionSuivante") {
      document.querySelector("#question").innerHTML = "";
      document.querySelectorAll(".label").innerHTML = "";
      document.querySelector("#formulaire").style.display = "none";
      // On supprime le printquiz s'il existe
      if (document.getElementById("printquiz")) {
        document.getElementById("printquiz").remove();
      }
      // On passe à la question suivante s'il en reste
      if (nextQuestions.length == 0) {
        // On affiche le score en pourcentage dans #score
        document.querySelector(
          "#score"
        ).innerHTML = `Score précédent : ${Math.round(
          (nbResponsesCorrectes / nbQuestions) * 100
        )}%`;
        // On a fini le tour, on recommence si la serie n'est pas vide
        document.querySelector("#score").style.display = "block";
        if (series.length > 0) {
          // On passe au tour suivant car la série n'est pas vide
          tourSuivant();
          // Vider le formulaire
          document.getElementById("Valider").innerHTML = "En ligne";
          document.getElementById("Valider").style.display = "inline";
          document.querySelector("#Imprimer").style.display = "inline";
          numQuestion = 0;
          // Afficher l'introduction
          document.querySelector(".introduction-quiz").style.display = "block";
        } else {
          // On a fini la série, on affiche un message
          document.getElementById("question").innerHTML = "C'est terminé !";
          document.getElementById("Valider").style.display = "none";
          document.querySelector("#formulaire").style.display = "none";
        }
      } else {
        // On a encore des questions, on passe à la suivante
        // On ajoute 1 au numéro de la question
        numQuestion++;
        // On prépare la question suivante
        var { questionText, answersArray } = nextQuestion(nextQuestions);
        initialiserAffichageQuiz(questionText, answersArray);
      }
    }
  });
  // Ajouter un écouteur pour révéler le formulaire quiz-choices de réponses
  var formulaire = document.querySelector(".quiz-choices");
  formulaire.addEventListener("click", function () {
    this.classList.add("clicked");
  });
  // On ajoute un écouteur pour l'impression du quiz
  window.addEventListener("beforeprint", function () {
    questionsDifferentes();
  });
}

function mettreEnFormeQuiz() {
  convertirKatexEnMathML();
  createFigures();
}

function initialiserAffichageQuiz(question, shuffledAnswers) {
  remplirFormulaire(question, shuffledAnswers);
  setValider("Répondre");
  hideValider();
  disableRadios();
  var choix = document.getElementsByClassName("choix");
  hideCorrection(choix);
  mettreEnFormeQuiz();
  // Afficher le formulaire
  document.querySelector("#formulaire").style.display = "block";
  // Ajouter le numéro de la question et le nombre de questions i/n
  // <div id="num-nb"></div>
  var numNb = document.getElementById("num-nb");
  numNb.innerHTML = `Question ${numQuestion}/${nbQuestions} :`;
}

function nextQuestion(nextQuestions) {
  // On récupère la question et les réponses
  const questionText = nextQuestions[0].question;
  const answersArray = nextQuestions[0].answers;
  // Avant de supprimer la question et les réponses du tableau, on récupère l'indice de la bonne réponse
  correctAnswerId = nextQuestions[0].correctAnswer;
  // On supprime la question et les réponses du tableau
  nextQuestions.shift();
  return { questionText, answersArray };
}

function printQuiz(nextQuestions) {
  // On vide le div printquiz s'il existe
  if (document.getElementById("printquiz")) {
    document.getElementById("printquiz").remove();
  }
  let quiz = "";
  let solution = "";
  for (let i = 0; i < nextQuestions.length; i++) {
    quiz += `
    <div class="question">
<strong>Question ${i + 1} : </strong>${nextQuestions[i].question}
</div>
<form class="quiz-choices">
    <div class="choix">
        <input type="radio" name="choix">
        <label>${nextQuestions[i].answers[0]}</label>
    </div>

    <div class="choix">
        <input type="radio" name="choix">
        <label>${nextQuestions[i].answers[1]}</label>
    </div>

    <div class="choix">
        <input type="radio" name="choix">
        <label>${nextQuestions[i].answers[2]}</label>
    </div>

    <div class="choix">
        <input type="radio" name="choix">
        <label>${nextQuestions[i].answers[3]}</label>
    </div>
</form>
`;
    solution += `
<strong>Question ${i + 1} : </strong>${
      nextQuestions[i].answers[nextQuestions[i].correctAnswer]
    }
`;
  }
  // On créé un élément div pour contenir le quiz
  const quizElement = document.createElement("div");
  // On lui donne un identifiant pour le css
  quizElement.id = "printquiz";
  // On ajoute une entete avec un titre, la date, un espace pour le nom, le prénom et la classe
  var entete = document.createElement("div");
  entete.id = "enteteQuiz";
  entete.innerHTML = `
<div class="nom-prenom-classe">
  <div id="nom">Nom :</div>
  <div id="prenom">Prénom :</div>
  <div id="classe">Classe :</div>
</div>
<div class="titrePrintQuiz-date">
  <div class="titrePrintQuiz">Quiz</div>
  <div class="date">${new Date().toLocaleDateString()}</div>
</div>
    `;
  // On ajoute le quiz à l'élément div
  quizElement.innerHTML = quiz;
  // On ajoute l'entete à l'élément div
  quizElement.prepend(entete);
  // On le rend invisible
  // quizElement.style.display = "none";
  // On ajoute l'élément div au body
  // On ajoute les solutions à l'élément div
  quizElement.innerHTML +=
    `
<div class="titrePrintQuiz-date">
  <div class="titrePrintQuiz">Quiz - Solutions</div>
  <div class="date">${new Date().toLocaleDateString()}</div>
</div>
  ` + solution;
  document.body.appendChild(quizElement);
  mettreEnFormeQuiz();
}

export async function createQuizs() {
  try {
    db = await importerBD();
    creerSerieQuizs(db);
    tourSuivant();
    ajouterEcouteursQuiz();
    document.getElementById("Valider").innerHTML = "En ligne";
    document.getElementById("Valider").style.display = "inline";
    document.querySelector("#formulaire").style.display = "none";
    document.querySelector("#Imprimer").style.display = "inline";
    document.getElementById("Imprimer").addEventListener("click", function () {
      window.print();
    });
    document.querySelector(".introduction-quiz").innerHTML = `
    <p>Bienvenue au quiz ! Vous êtes sur le point de répondre à </p>
    <div class="score"><strong>${nbQuestions} questions.</strong></div>
    <p>Voici quelques recommandations pour une expérience optimale :</p>

<ul>
    <li>Prenez un moment pour réfléchir avant de révéler les choix et surtout mettez vos pensées par écrit. Cela aide à clarifier votre réflexion, à réduire la charge mentale et à progresser plus efficacement.</li>
    <li>Une fois les choix affichés, sélectionnez votre réponse. Rappelez-vous, il n'y a qu'une seule bonne réponse.</li>
    <li>Vous avez la liberté de changer votre choix tant que vous n'avez pas validé en cliquant sur "Répondre".</li>
    <li>Après avoir répondu, utilisez le bouton "Suivant" pour passer à la question suivante.</li>
    <li>Si vous souhaitez avoir une version papier du quiz, cliquez simplement sur "Imprimer".</li>
    <li>N'hésitez pas à retenter le quiz autant de fois que nécessaire pour maîtriser le sujet.</li>
</ul>

<p>Rassurez-vous, votre vie privée est respectée : aucune de vos informations personnelles n'est enregistrée.</p>
`;
  } catch (error) {
    console.error(
      "Erreur lors de l'importation de la base de données :",
      error
    );
  }
}
