import { addListenerInteractivite } from "./interactif2.js";
import { pipwerks } from "./SCORM_API_wrapper.js";

var scorm = pipwerks.SCORM;

function init() {
  //	scorm.version = "1.2"; // auto if not specified
  scorm.init();
}

function set(param, value) {
  scorm.set(param, value);
}

function get(param) {
  scorm.get(param);
}

function end() {
  scorm.quit();
}

window.onload = function () {
  init();
  // var studentId = scorm.get("cmi.core.student_id");
  // console.log(studentId);
}

window.onunload = function () {
  end();
}

function envoyerScore(score) {
  scorm.status("set", "completed");
  scorm.set("cmi.core.score.raw", score.toString());
  scorm.set("cmi.core.score.min", "0");
  scorm.set("cmi.core.score.max", "100");
  scorm.set("cmi.core.score.scaled", "1");
  if (score < 100) {
    scorm.set("cmi.success_status", "failed");
  } else {
    scorm.set("cmi.success_status", "passed");
  }
  scorm.save();
}

// Début du traitement
function disableRadios() {
  var radios = document.getElementsByName('choix');
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

function getReponsesPossibles(qcm) {
  var reponsesQCM = qcm.getElementsByClassName('reponse');

  var answers = [
    { id: "c", text: reponsesQCM[0].innnerHTML },
    { id: "f1", text: reponsesQCM[1].innnerHTML },
    { id: "f2", text: reponsesQCM[2].innnerHTML },
    { id: "f3", text: reponsesQCM[3].innnerHTML }
  ];

  for (var i = 0; i < answers.length; i++) {
    answers[i].text = reponsesQCM[i].innerHTML
  }
  return answers
}

var score = 0;
var nbQCM = 0;
var suivant = false;
var correctAnswerId;
var qcms = [];

function getCorrection(response) {
  if (suivant) {
    loadNextQCM();
  } else {
    suivant = true
    nbQCM += 1
    var radios = document.getElementsByClassName('choix');

    if (response == correctAnswerId) {
      score += 1;
    }
    for (var i = 0, length = radios.length; i < length; i++) {
      radios[i].disabled = true;
      if (i == correctAnswerId) {
        radios[i].style.background = "#008000"
      }
      if (i == response && response != correctAnswerId) {
        radios[i].style.background = "#FF0000"
      }
    }
  }
}

function getAnswer() {
  var radios = document.getElementsByName('choix');
  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      document.getElementById("Valider").innerHTML = "Suivant";
      return i;
    }
  }
}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

function recuperationQCM() {
  // Il faut récupérer tous les qcm
  let qcms = Array.from(document.getElementsByClassName('qcm')).map(el => el.cloneNode(true));
  let suppressions = document.getElementsByClassName('qcm');
  for (let i = 0; i < suppressions.length; i++) {
    suppressions[i].innerHTML = ""
  }
  return qcms
}

function traitementQCM(qcms) {
  // Mélanger les qcm
  qcms = shuffle(qcms);

  // Charger le premier QCM
  loadNextQCM();

  var radios = document.getElementsByName('choix');
  for (var i = 0, length = radios.length; i < length; i++) {
    radios[i].addEventListener('change', function () {
      // This function will be executed every time a radio button is selected
      if (!suivant) {
        document.getElementById("Valider").innerHTML = "Répondre"
        document.getElementById('Valider').style.display = 'inline';
      }
    });
  }

  var choixDivs = document.getElementsByClassName('choix');
  for (var i = 0; i < choixDivs.length; i++) {
    choixDivs[i].addEventListener('click', function () {
      // When a .choix div is clicked, select the radio button inside it
      var radioButton = this.querySelector('input[type=radio]');
      radioButton.checked = true;

      // Trigger the change event on the radio button
      var event = new Event('change');
      radioButton.dispatchEvent(event);

      // Montrer la sélection en la grisant
      if (!suivant) {
        for (var j = 0; j < choixDivs.length; j++) {
          choixDivs[j].style.background = "none";
        }
        this.style.background = "#eeeeee";
      }
    });
  }
}

function recuperationQCMGroupe() {
  // Il faut récupérer tous les qcm
  let qcmgroupes = Array.from(document.getElementsByClassName('groupequiz')).map(el => el.cloneNode(true));
  // On les supprime du DOM
  let suppressions = document.getElementsByClassName('groupequiz');
  for (let i = 0; i < suppressions.length; i++) {
    suppressions[i].innerHTML = ""
  }

  let qcms = [];
  // Dans chaque qcmgroupe il y a des questions et leurs réponses
  // Pour chaque question on crée un qcm avec sa réponse en premier et trois autres piochées parmi les réponses des autres questions
  for (let i = 0; i < qcmgroupes.length; i++) {
    let questions = Array.from(qcmgroupes[i].getElementsByClassName('question')).map(el => el.cloneNode(true));
    let reponses = Array.from(qcmgroupes[i].getElementsByClassName('reponse')).map(el => el.cloneNode(true));
    // créer autant de div qu'il y a de questions
    for (let j = 0; j < questions.length; j++) {
      let qcm = document.createElement('div');
      qcm.classList.add('qcm');
      qcm.appendChild(questions[j]);
      // Faire une copie de la réponse ajoutée
      qcm.appendChild(reponses[j].cloneNode(true));
      let reponsesPossibles = [];
      for (let k = 0; k < reponses.length; k++) {
        if (k != j) {
          reponsesPossibles.push(reponses[k].cloneNode(true));
        }
      }
      reponsesPossibles = shuffle(reponsesPossibles);
      for (let k = 0; k < 3; k++) {
        qcm.appendChild(reponsesPossibles[k]);
      }
      qcms.push(qcm);
    }
  }
  return qcms
}

document.addEventListener("DOMContentLoaded", function () {
  // Il faut s'assurer qu'il y a bien un contexte de quiz
  if (document.getElementsByClassName('qcm').length != 0 || document.getElementsByClassName('groupequiz').length != 0) {
    window.addEventListener("message", function (event) {
      if (event.data == "figures_created") {
        qcms = recuperationQCM();
        qcms = qcms.concat(recuperationQCMGroupe());
        traitementQCM(qcms);
      }
    }, false);
    document.getElementById('Valider').addEventListener('click', function () {
      getCorrection(getAnswer());
    });
  }
});

// Cette fonction remplit le formulaire avec le prochain QCM de la liste
function loadNextQCM() {
  if (qcms.length > 0) {
    var nextQCM = qcms.shift();

    setValider("Répondre")

    hideValider();

    disableRadios();

    var choix = document.getElementsByClassName("choix")
    hideCorrection(choix);

    suivant = false

    document.getElementById('question').innerHTML = nextQCM.querySelector('.question').innerHTML;

    var answers = getReponsesPossibles(nextQCM);

    answers = shuffle(answers);

    for (var i = 0; i < answers.length; i++) {
      choix[i].children[1].innerHTML = answers[i].text;
      if (answers[i].id === "c") {
        correctAnswerId = i;
      }
    }
    // Interactivité des figures
    // Rechercher les figures
    var figures = document.querySelectorAll(".figure");
    for (var i = 0; i < figures.length; i++) {
      addListenerInteractivite(figures[i]);
    }
  } else {
    score = Math.floor(score / nbQCM * 100)
    envoyerScore(score);
    document.getElementById("Valider").style.display = "none";
    document.getElementById("formulaire").style.display = "none";
    let divScore = document.getElementById("score");
    divScore.style.display = "block";
    let messageFinal = "<h2>Votre score final est " + score + "%.</h2>"
    if (score < 100) {
      messageFinal += '<h2>Ce n\'était pas évident mais je suis sûr que vous pouvez obtenir 100% de réussite.</h2><button type="button" onclick="location.reload();">Nouvel essai</button>'
    } else {
      messageFinal += "<h2>Félicitations ! Ce n'était pas évident mais vous êtes parvenu au bout !</h2>"
    }
    divScore.innerHTML = messageFinal
  }
}