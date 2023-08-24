// Version: 1.0.0
import { Point, Vecteur, Segment } from "./class2.js";
import * as math from "mathjs";

// Liste des codages possibles
var codagesSegment = [
  "M-5,-5 L0,5 M0,-5 L5,5",
  "M-2.5,-5 L2.5,5",
  "M-5,-5 L-1,5 M-1,-5 L3,5 M3,-5 L7,5",
  "M-5,-5 L-2,5 M-2,-5 L1,5 M1,-5 L4,5 M4,-5 L7,5",
];

var setUniqueIds = function () {
  // On récupère toutes les balises de class figure
  var figures = document.querySelectorAll(".figure");
  // On rend unique les identifiants des éléments constitutifs de la figure
  for (var i = 0; i < figures.length; i++) {
    // On récupère l'identifiant de la figure
    var id = figures[i].id;
    // on teste si la figure contient un svg
    if (figures[i].querySelector("svg") != null) {
      var ids = figures[i].querySelector("svg").querySelectorAll("*[name]");
      // Pour chaque identifiant
      for (var j = 0; j < ids.length; j++) {
        // On créé un id pour l'élément
        ids[j].setAttribute("id", id + "-" + ids[j].getAttribute("name"));

        // On ajoute également l'identifiant à tous les éléments du linkto
        if (ids[j].getAttribute("linkto") != null) {
          var linkto = ids[j].getAttribute("linkto").split(" ");
          for (var k = 0; k < linkto.length; k++) {
            linkto[k] = id + "-" + linkto[k];
          }
          ids[j].setAttribute("linkto", linkto.join(" "));
        }
        // On ajoute également l'identifiant à tous les éléments du pentes qui est un string de la forme "A:0.5,B:1,C:2"
        if (ids[j].getAttribute("pentes") != null) {
          var pentes = ids[j].getAttribute("pentes").split(",");
          for (var k = 0; k < pentes.length; k++) {
            pentes[k] =
              id +
              "-" +
              pentes[k].split(":")[0] +
              ":" +
              pentes[k].split(":")[1];
          }
          ids[j].setAttribute("pentes", pentes.join(","));
        }
      }
      // On sélectionne maintenant tous qui n'ont pas la class name
      var ids = figures[i]
        .querySelector("svg")
        .querySelectorAll("*:not([name])");
      // On ajoute un identifiant s'ils n'ont pas de linkto
      for (var j = 0; j < ids.length; j++) {
        if (ids[j].getAttribute("linkto") == null) {
          ids[j].setAttribute("id", id + "-" + j);
        } else {
          // On créé un id pour l'élément à partir du linkto
          // Sauf s'il est de la class label
          if (!ids[j].classList.contains("label")) {
            ids[j].setAttribute("id", id + "-" + ids[j].getAttribute("linkto"));
          } else {
            ids[j].setAttribute(
              "id",
              id + "-" + ids[j].getAttribute("linkto") + "-label"
            );
          }
        }
        // On ajoute également l'identifiant à tous les éléments du linkto
        if (ids[j].getAttribute("linkto") != null) {
          var linkto = ids[j].getAttribute("linkto").split(" ");
          for (var k = 0; k < linkto.length; k++) {
            linkto[k] = id + "-" + linkto[k];
          }
          ids[j].setAttribute("linkto", linkto.join(" "));
        }
      }
    }
  }
};
var addListenerButtonQuadrillage = function (figure) {
  var quadrillage = figure.querySelector("#" + figure.id + "-quadrillage");
  var bouton = figure.querySelector(".bouton-quadrillage");
  bouton.addEventListener("click", function () {
    if (quadrillage.style.display == "none") {
      quadrillage.style.display = "block";
    } else {
      quadrillage.style.display = "none";
    }
  });
};
var addBoutonQuadrillage = function (figure) {
  // Tester si la figure a déjà un bouton de la classe bouton-quadrillage
  if (figure.querySelector(".bouton-quadrillage") == null) {
    // On ajoute un bouton pour afficher/masquer le quadrillage
    var bouton = document.createElement("button");
    // Ajouter une classe au bouton
    bouton.classList.add("bouton-quadrillage");
    bouton.innerHTML = "Afficher/masquer le quadrillage";
    figure.appendChild(bouton);
  }
};
var addListenerButtonPleinEcran = function (figure) {
  var bouton = figure.querySelector(".bouton-pleinecran");
  bouton.addEventListener("click", function () {
    if (!document.fullscreenElement) {
      if (figure.requestFullscreen) {
        figure.requestFullscreen();
      } else if (figure.webkitRequestFullscreen) {
        /* Safari */
        figure.webkitRequestFullscreen();
      } else if (figure.msRequestFullscreen) {
        /* IE11 */
        figure.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullScreen();
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullScreen();
      }
    }
  });
};
var addBoutonPleinEcran = function (figure) {
  if (figure.querySelector(".bouton-pleinecran") == null) {
    var bouton = document.createElement("button");
    bouton.classList.add("bouton-pleinecran");
    bouton.innerHTML = "Plein écran";
    figure.appendChild(bouton);
  }
};
var addQuadrillage = function (figure) {
  // On ajoute un quadrillage
  var quadrillage = document.createElementNS("http://www.w3.org/2000/svg", "g");
  quadrillage.setAttribute("id", "quadrillage");
  // On récupère les dimensions de la figure avec viewBox
  var viewBox = figure.querySelector("svg").getAttribute("viewBox").split(" ");
  var width = parseFloat(viewBox[2]);
  var height = parseFloat(viewBox[3]);
  var xmin = parseFloat(viewBox[0]);
  var ymin = parseFloat(viewBox[1]);
  // On calcule le nombres de lignes et de colonnes
  var nblignes = Math.floor(height / 10);
  var nbcolonnes = Math.floor(width / 10);
  // On ajoute les lignes verticales
  for (i = 0; i < nbcolonnes + 1; i++) {
    var ligne = document.createElementNS("http://www.w3.org/2000/svg", "line");
    ligne.setAttribute("x1", xmin + i * 10);
    ligne.setAttribute("y1", ymin);
    ligne.setAttribute("x2", xmin + i * 10);
    ligne.setAttribute("y2", ymin + height);
    ligne.setAttribute("stroke", "gray");
    ligne.setAttribute("stroke-width", "0.2");
    quadrillage.appendChild(ligne);
  }
  // On ajoute les lignes horizontales
  for (var i = 0; i < nblignes + 1; i++) {
    var ligne = document.createElementNS("http://www.w3.org/2000/svg", "line");
    ligne.setAttribute("x1", xmin);
    ligne.setAttribute("y1", ymin + i * 10);
    ligne.setAttribute("x2", xmin + width);
    ligne.setAttribute("y2", ymin + i * 10);
    ligne.setAttribute("stroke", "gray");
    ligne.setAttribute("stroke-width", "0.2");
    quadrillage.appendChild(ligne);
  }
  if (!figure.querySelector("svg").classList.contains("quadrillage")) {
    quadrillage.style.display = "none";
  }
  quadrillage.style.userSelect = "none";
  quadrillage.style.pointerEvents = "none";
  quadrillage.id = figure.id + "-quadrillage";
  // On place un cadre autour du quadrillage
  var cadre = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  cadre.setAttribute("x", xmin);
  cadre.setAttribute("y", ymin);
  cadre.setAttribute("width", width);
  cadre.setAttribute("height", height);
  cadre.setAttribute("fill", "lightgray");
  cadre.setAttribute("fill-opacity", "0.2");
  // Avec un effet d'ombre
  figure.querySelector("svg").prepend(quadrillage);
  figure.querySelector("svg").prepend(cadre);
};
var getLinkto = function (objet) {
  //on teste si l'objet a un attribut linkto
  if (objet.hasAttribute("linkto")) {
    return objet.getAttribute("linkto").split(" ");
  } else {
    return [];
  }
};
var getElementLinkto = function (objet, n) {
  return document.getElementById(getLinkto(objet)[n]);
};
var constructLabelPoint = function (point) {
  if (point.classList.contains("labeled")) {
    var idfigure = point.id.split("-")[0];
    var labels = document.getElementById(idfigure).querySelectorAll("g.label");
    var labelLinkto = Array.from(labels).filter(
      (label) => label.getAttribute("linkto") == point.id
    );
    var foreignObject = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "foreignObject"
    );
    if (labelLinkto.length == 0) {
      foreignObject.setAttribute("x", "0");
      foreignObject.setAttribute("y", "0");
      foreignObject.setAttribute("text-anchor", "start");
      foreignObject.setAttribute("width", "20");
      foreignObject.setAttribute("height", "20");
      foreignObject.setAttribute("style", point.getAttribute("style"));
      foreignObject.innerHTML = katex.renderToString(
        point.getAttribute("name"),
        { output: "mathml" }
      );
    } else {
      var label = labelLinkto[0];
      if (label.hasAttribute("x")) {
        foreignObject.setAttribute("x", label.getAttribute("x"));
      } else {
        foreignObject.setAttribute("x", "0");
      }
      if (label.hasAttribute("y")) {
        foreignObject.setAttribute("y", label.getAttribute("y"));
      } else {
        foreignObject.setAttribute("y", "0");
      }
      if (label.hasAttribute("width")) {
        foreignObject.setAttribute("width", label.getAttribute("width"));
      } else {
        foreignObject.setAttribute("width", "20");
      }
      if (label.hasAttribute("height")) {
        foreignObject.setAttribute("height", label.getAttribute("height"));
      } else {
        foreignObject.setAttribute("height", "20");
      }
      if (label.hasAttribute("text-anchor")) {
        foreignObject.setAttribute(
          "text-anchor",
          label.getAttribute("text-anchor")
        );
      } else {
        foreignObject.setAttribute("text-anchor", "middle");
      }
      if (label.hasAttribute("fill")) {
        foreignObject.setAttribute("fill", label.getAttribute("fill"));
      } else {
        foreignObject.setAttribute("fill", "black");
      }
      if (label.hasAttribute("stroke")) {
        foreignObject.setAttribute("stroke", label.getAttribute("stroke"));
      } else {
        foreignObject.setAttribute("stroke", "stroke");
      }
      foreignObject.setAttribute("style", labelLinkto[0].getAttribute("style"));
      foreignObject.innerHTML = katex.renderToString(label.innerHTML, {
        output: "mathml",
      });
    }
    foreignObject.style.userSelect = "none";
    point.appendChild(foreignObject);
  }
};
var constructCrossPoint = function (point) {
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M-2,-2 L2,2 M-2,2 L2,-2");
  path.setAttribute("fill", "transparent");
  path.setAttribute("stroke", "black");
  path.setAttribute("class", "crosspoint");
  path.style.userSelect = "none";
  // Récupérer le style du point
  var style = point.getAttribute("style");
  path.setAttribute("style", style);
  point.appendChild(path);
};
var automaticHideCrossPoint = function (point) {
  var idfigure = point.id.split("-")[0];
  getPolygonesFigure(idfigure).forEach(function (polygone) {
    var linkto = getLinkto(polygone);
    if (linkto.includes(point.id)) {
      point
        .querySelector("path.crosspoint")
        .setAttribute("stroke", "transparent");
    }
  });
};
var constructHightlightPoint = function (point) {
  if (point.classList.contains("draggable")) {
    var circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("class", "selectionne");
    circle.setAttribute("cx", "0");
    circle.setAttribute("cy", "0");
    circle.setAttribute("fill", "transparent");
    circle.setAttribute("stroke", "transparent");
    circle.setAttribute("fill-opacity", "0.2");
    circle.setAttribute("r", "0");
    circle.style.userSelect = "none";
    point.prepend(circle);
  }
};
var constructSelectPoint = function (point) {
  if (point.classList.contains("draggable")) {
    var circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle"
    );
    circle.setAttribute("class", "selectionneur");
    circle.setAttribute("cx", "0");
    circle.setAttribute("cy", "0");
    circle.setAttribute("fill", "transparent");
    circle.setAttribute("r", "4");
    point.appendChild(circle);
  }
};
var getPointsFigure = function (figure) {
  var points = document.querySelectorAll("g.point");
  var pointsArray = Array.from(points);
  return pointsArray.filter((point) => point.id.split("-")[0] == figure.id);
};
var initialiserPointTransform = function (point) {
  var x = 0;
  var y = 0;
  if (point.hasAttribute("x")) {
    x = point.getAttribute("x");
  }
  if (point.hasAttribute("y")) {
    y = point.getAttribute("y");
  }
  point.setAttribute("transform", "translate(" + x + "," + y + ")");
};
var getPolygonesFigure = function (idfigure) {
  var polygones = document.querySelectorAll("g.polygone");
  var polygonesArray = Array.from(polygones);
  return polygonesArray.filter(
    (polygone) => polygone.id.split("-")[0] == idfigure
  );
};
var getVecteursFigure = function (figure) {
  var vecteurs = document.querySelectorAll("g.vecteur");
  var vecteursArray = Array.from(vecteurs);
  return vecteursArray.filter(
    (vecteur) => vecteur.id.split("-")[0] == figure.id
  );
};
var constructHeadVecteur = function (vecteur) {
  var A = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 0)));
  var B = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 1)));
  var AB = new Segment(A, B);
  var alpha = (AB.angle() / Math.PI) * 180;
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M-7,-2 L-0,-0 L-7,2");
  // Déterminer les coordonnées relatives de B par rappport à A
  path.setAttribute(
    "transform",
    "translate(" + B.x + "," + B.y + ") rotate(" + -alpha + ")"
  );
  path.setAttribute("fill", "black");
  path.setAttribute("stroke-width", "0.5");
  path.classList.add("headVecteur");
  path.style.userSelect = "none";
  setStroke(vecteur, path);
  // Ajouter le style du vecteur au path
  path.setAttribute("style", vecteur.getAttribute("style"));
  // Si dans le style il y a un stroke alors on ajoute la même couleur au fill du path
  if (
    vecteur.getAttribute("style") != null &&
    vecteur.getAttribute("style").includes("stroke")
  ) {
    // Récupérer le stroke du style
    var stroke = vecteur
      .getAttribute("style")
      .split(";")
      .filter((style) => style.includes("stroke"))[0];
    // Récupérer la couleur du stroke
    var color = stroke.split(":")[1];
    path.setAttribute("fill", color);
  }
  vecteur.appendChild(path);
};
var constructLabelVecteur = function (vecteur) {
  var A = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 0)));
  var B = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 1)));
  var AB = new Segment(A, B);
  var I = AB.milieu();
  var foreignObject = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "foreignObject"
  );
  foreignObject.setAttribute("x", I.x);
  foreignObject.setAttribute("y", I.y);
  foreignObject.setAttribute("width", "20");
  foreignObject.setAttribute("height", "20");
  foreignObject.setAttribute("style", vecteur.getAttribute("style"));
  // Ajouter le style du vecteur
  foreignObject.setAttribute("style", vecteur.getAttribute("style"));
  foreignObject.innerHTML = katex.renderToString(
    "\\overrightarrow{" + vecteur.getAttribute("name") + "}",
    { output: "mathml" }
  );
  foreignObject.style.userSelect = "none";
  vecteur.appendChild(foreignObject);
};
var constructVecteur = function (vecteur) {
  var A = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 0)));
  var B = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 1)));
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M" + A.x + "," + A.y + " L" + B.x + "," + B.y);
  setStroke(vecteur, path);
  vecteur.appendChild(path);
  constructHeadVecteur(vecteur);
  // Ajouter le style du vecteur au path
  path.setAttribute("style", vecteur.getAttribute("style"));
  if (vecteur.classList.contains("labeled")) {
    constructLabelVecteur(vecteur);
  }
};
var initialiserVecteur = function (vecteur) {
  constructVecteur(vecteur);
};
var initialiserVecteursFigure = function (figure) {
  getVecteursFigure(figure).forEach(function (vecteur) {
    initialiserVecteur(vecteur);
  });
};
var getDroitesFigure = function (figure) {
  var droites = document.querySelectorAll("g.droite");
  var droitesArray = Array.from(droites);
  return droitesArray.filter((droite) => droite.id.split("-")[0] == figure.id);
};
var determinerExtremitesDroite = function (droite) {
  var A = new Point(...getCoordonneesPoint(getElementLinkto(droite, 0)));
  var B = new Point(...getCoordonneesPoint(getElementLinkto(droite, 1)));
  var AB = new Vecteur();
  AB.setCoordonneesVecteur2Points(A, B);
  var u = AB.normalisation();
  var E1 = A.translation(u.multiplicationVecteur(-200));
  var E2 = A.translation(u.multiplicationVecteur(200));
  return [E1, E2];
};
var setStroke = function (objet, path) {
  var stroke = objet.hasAttribute("stroke")
    ? objet.getAttribute("stroke")
    : "black";
  path.setAttribute("stroke", stroke);
  var strokewidth = objet.hasAttribute("stroke-width")
    ? objet.getAttribute("stroke-width")
    : "0.5";
  path.setAttribute("stroke-width", strokewidth);
  // Si c'est un vecteur il faut que le fill soit le même que le srtoke du vecteur
  if (objet.classList.contains("vecteur")) {
    path.setAttribute("fill", stroke);
  }
};
var constructDroite = function (droite) {
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  var extremites = determinerExtremitesDroite(droite);
  var E1 = extremites[0];
  var E2 = extremites[1];
  path.setAttribute("d", "M" + E1.x + "," + E1.y + " L" + E2.x + "," + E2.y);
  setStroke(droite, path);
  droite.appendChild(path);
};
var initialiserDroite = function (droite) {
  constructDroite(droite);
};
var initialiserDroitesFigure = function (figure) {
  getDroitesFigure(figure).forEach(function (droite) {
    initialiserDroite(droite);
  });
};
var getDemidroitesFigure = function (figure) {
  var demidroites = document.querySelectorAll("g.demidroite");
  var demidroitesArray = Array.from(demidroites);
  return demidroitesArray.filter(
    (demidroite) => demidroite.id.split("-")[0] == figure.id
  );
};
var constructDemiDroite = function (demidroite) {
  var A = new Point(...getCoordonneesPoint(getElementLinkto(demidroite, 0)));
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  var extremites = determinerExtremitesDroite(demidroite);
  var E = extremites[1];
  path.setAttribute("d", "M" + A.x + "," + A.y + " L" + E.x + "," + E.y);
  setStroke(demidroite, path);
  path.setAttribute("style", demidroite.getAttribute("style"));
  demidroite.appendChild(path);
};
var initialiserDemiDroite = function (demidroite) {
  constructDemiDroite(demidroite);
};
var initialiserDemiDroitesFigure = function (figure) {
  getDemidroitesFigure(figure).forEach(function (demidroite) {
    initialiserDemiDroite(demidroite);
  });
};
var getSegmentsFigure = function (figure) {
  var segments = document.querySelectorAll("g.segment");
  var segmentsArray = Array.from(segments);
  return segmentsArray.filter(
    (segment) => segment.id.split("-")[0] == figure.id
  );
};
var constructCodageSegment = function (segment, codage) {
  var A = new Point(...getCoordonneesPoint(getElementLinkto(segment, 0)));
  var B = new Point(...getCoordonneesPoint(getElementLinkto(segment, 1)));
  var AB = new Segment(A, B);
  var I = AB.milieu();
  var alpha = (AB.angle() / Math.PI) * 180;
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "transparent");
  path.setAttribute("stroke", "black");
  path.setAttribute("stroke-width", "0.8");
  path.setAttribute(
    "transform",
    "translate(" + I.x + "," + I.y + ") rotate(" + alpha + ")"
  );
  path.setAttribute("d", codage);
  path.style.userSelect = "none";
  path.classList.add("codageSegment");
  segment.appendChild(path);
};
var isCodageSegment = function (segment) {
  return segment.classList.contains("codage");
};
var isSegmentLie = function (segment) {
  // Dans linkto, on a l'id des deux points et éventuellement l'id d'un segment lié par le codage
  var linkto = getLinkto(segment);
  return linkto.length == 3;
};
var getSegmentLie = function (segment) {
  var linkto = getLinkto(segment);
  return document.getElementById(linkto[2]);
};
var getCodageSegmentLie = function (segment) {
  var linkto = getLinkto(segment);
  return getSegmentLie(segment)
    .querySelector("path.codageSegment")
    .getAttribute("d");
};
var listeCodagesFigure = function (objet) {
  var idfigure = objet.id.split("-")[0];
  var codages = document.querySelectorAll("g.codage");
  var codagesArray = Array.from(codages);
  var codagesFigure = codagesArray
    .filter((codage) => codage.id.split("-")[0] == idfigure)
    .filter((codage) => codage.querySelector("path.codageSegment") != null)
    .map(
      // On récupère l'attribut d
      (codage) => codage.querySelector("path.codageSegment").getAttribute("d")
    );
  return codagesFigure;
};
var nouveauCodageSegment = function (segment) {
  var codageExistants = listeCodagesFigure(segment);
  // On veut un codage qui n'existe pas déjà
  var i = 0;
  while (codageExistants.includes(codagesSegment[i])) {
    i++;
    if (i == codagesSegment.length) {
      break;
    }
  }
  if (i < codagesSegment.length) {
    return codagesSegment[i];
  } else {
    // Plus de codages disponibles
    return "";
  }
};
var constructSegment = function (segment) {
  var A = getElementLinkto(segment, 0);
  var B = getElementLinkto(segment, 1);
  // Construire un élément path
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  // A est l'origine et B l'extrémité du path
  path.setAttribute(
    "d",
    "M" +
      getCoordonneesPoint(A).join(",") +
      " L" +
      getCoordonneesPoint(B).join(",")
  );
  setStroke(segment, path);
  segment.appendChild(path);
  if (isCodageSegment(segment)) {
    if (isSegmentLie(segment)) {
      constructCodageSegment(segment, getCodageSegmentLie(segment));
    } else {
      constructCodageSegment(segment, nouveauCodageSegment(segment));
    }
  }
};
var initialiserSegment = function (segment) {
  constructSegment(segment);
};
var initialiserSegmentsFigure = function (figure) {
  getSegmentsFigure(figure).forEach(function (segment) {
    initialiserSegment(segment);
  });
};
var constructPolygone = function (polygone) {
  var points = getLinkto(polygone)
    .map(
      (point) =>
        new Point(...getCoordonneesPoint(document.getElementById(point)))
    )
    .map((point) => [point.x, point.y].join(","));
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  var d = "M" + points.join(" L") + " Z";
  path.setAttribute("d", d);
  setStroke(polygone, path);
  path.setAttribute("style", polygone.getAttribute("style"));
  polygone.appendChild(path);
};
var initialiserPolygone = function (polygone) {
  constructPolygone(polygone);
};
var initialiserPolygonesFigure = function (figure) {
  getPolygonesFigure(figure.id).forEach(function (polygone) {
    initialiserPolygone(polygone);
  });
};
var getGraduationsFigure = function (figure) {
  var graduations = document.querySelectorAll("g.graduation");
  var graduationsArray = Array.from(graduations);
  return graduationsArray.filter(
    (graduation) => graduation.id.split("-")[0] == figure.id
  );
};
var constructGraduation = function (graduation) {
  var A = new Point(...getCoordonneesPoint(getElementLinkto(graduation, 0)));
  var B = new Point(...getCoordonneesPoint(getElementLinkto(graduation, 1)));
  var parametres = eval("({" + graduation.getAttribute("parametres") + "})");
  // Si parametres.vsize n'existe pas alors on prend 4
  if (parametres.vsize == undefined) {
    parametres.vsize = 4;
  }
  if (parametres.distance == undefined) {
    parametres.distance = 10;
  }
  var AB = new Vecteur(0, 0);
  AB.setCoordonneesVecteur2Points(A, B);
  var u = AB.normalisation();
  var graduations = [];
  for (var i = 0; i < parametres.n + 1; i++) {
    graduations.push(
      A.translation(u.multiplicationVecteur((i * AB.norme()) / parametres.n))
    );
  }
  // Construire les graduations de taille verticale vsize
  var graduationsSVG = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  var style = graduation.getAttribute("style");
  graduationsSVG.setAttribute("style", style);
  for (var i = 0; i < parametres.n + 1; i++) {
    var graduationSVG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    // La graduation est pour moitié en dessous et pour moitié au dessus du point
    // La graduation doit être orientée selon le vecteur u
    var x1 = graduations[i].x - (parametres.vsize / 2) * u.y;
    var y1 = graduations[i].y + (parametres.vsize / 2) * u.x;
    var x2 = graduations[i].x + (parametres.vsize / 2) * u.y;
    var y2 = graduations[i].y - (parametres.vsize / 2) * u.x;
    graduationSVG.setAttribute("d", "M" + x1 + "," + y1 + " L" + x2 + "," + y2);
    graduationSVG.setAttribute("stroke", "black");
    graduationSVG.setAttribute("stroke-width", "0.5");
    graduationSVG.style.userSelect = "none";
    graduationsSVG.appendChild(graduationSVG);
  }
  // On ajoute maintenant les abscisses des graduations si la class abscisses est présente
  if (graduation.classList.contains("abscisses")) {
    // Si parametres.nmin n'existe pas alors on prend 0
    if (parametres.nmin == undefined) {
      parametres.nmin = 0;
    }

    var angle = Math.atan2(u.y, u.x); // Angle de u par rapport à l'axe des abscisses

    var abscissesSVG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "g"
    );
    for (var i = 0; i < parametres.n + 1; i++) {
      var abscisseSVG = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      var offsetX = 0,
        offsetY = parametres.distance; // Par défaut, placez les abscisses en dessous

      // Si l'angle est dans le 2ème ou 3ème quadrant, placez les abscisses au-dessus
      if (angle > Math.PI / 2 && angle < (3 * Math.PI) / 2) {
        offsetY = -parametres.distance;
      }

      abscisseSVG.setAttribute("x", graduations[i].x + offsetX);
      abscisseSVG.setAttribute("y", graduations[i].y + offsetY);
      abscisseSVG.setAttribute("text-anchor", "middle");
      abscisseSVG.setAttribute("font-size", "10");
      abscisseSVG.setAttribute("fill", "black");
      abscisseSVG.setAttribute("stroke", "transparent");
      abscisseSVG.setAttribute("stroke-width", "0.5");
      abscisseSVG.setAttribute("style", "user-select:none");
      abscisseSVG.setAttribute("style", style);
      abscisseSVG.innerHTML = (
        parametres.nmin +
        (i * (parametres.nmax - parametres.nmin)) / parametres.n
      ).toFixed(0);
      graduationsSVG.appendChild(abscisseSVG);
    }
  }
  graduation.appendChild(graduationsSVG);
};
var initialiserGraduation = function (graduation) {
  constructGraduation(graduation);
};
var initialiserGraduationsFigure = function (figure) {
  getGraduationsFigure(figure).forEach(function (graduation) {
    initialiserGraduation(graduation);
  });
};
var getCourbesFigure = function (figure) {
  var courbes = document.querySelectorAll("g.courbe");
  var courbesArray = Array.from(courbes);
  return courbesArray.filter((courbe) => courbe.id.split("-")[0] == figure.id);
};
var addDebug = function () {
  // Ajout d'un élément debug dans le DOM
  var debug = document.createElement("div");
  debug.id = "debug";
  document.body.appendChild(debug);
  // Afficher tous les messages de console.log() dans le div debug
  console.log = function (message) {
    debug.innerHTML += message + "<br>";
  };
  console.error = function (message) {
    debug.innerHTML += "<span style='color:red'>" + message + "</span><br>";
  };
  console.log("%%%%% DEBUG %%%%%%%");
};
var convertStringToParametres = function (paramString) {
  // Divisez la chaîne en paires clé-valeur
  var pairs = paramString.split(",");

  // Traitez chaque paire
  var processedPairs = pairs.map((pair) => {
    var [key, value] = pair.split(":");
    // Si la valeur n'est pas clairement numérique, considérez-la comme une chaîne
    if (isNaN(parseFloat(value))) {
      value = '"' + value + '"';
    }
    return '"' + key + '":' + value;
  });
  // Recombinez les paires traitées en une seule chaîne
  var jsonStr = "{" + processedPairs.join(",") + "}";
  return JSON.parse(jsonStr);
};

var initialiserParametresCourbe = function (courbe) {
  var paramString = courbe.getAttribute("parametres");
  var parametres = convertStringToParametres(paramString);
  // Si parametres.xunit n'existe pas alors on prend 1
  if (parametres.xunit == undefined) {
    parametres.xunit = 1;
  }
  // Si parametres.yunit n'existe pas alors on prend 1
  if (parametres.yunit == undefined) {
    parametres.yunit = 1;
  }
  // Si parametres.xmin n'existe pas alors on prend -10
  if (parametres.xmin == undefined) {
    parametres.xmin = -10;
  }
  // Si parametres.xmax n'existe pas alors on prend 10
  if (parametres.xmax == undefined) {
    parametres.xmax = 10;
  }
  // Si parametres.ymin n'existe pas alors on prend -10
  if (parametres.ymin == undefined) {
    parametres.ymin = -10;
  }
  // Si parametres.ymax n'existe pas alors on prend 10
  if (parametres.ymax == undefined) {
    parametres.ymax = 10;
  }
  // Si parametres.n n'existe pas alors on prend 100
  if (parametres.n == undefined) {
    parametres.n = 100;
  }
  return parametres;
};
var recupererPentesCourbe = function (courbe) {
  var pentes = courbe.getAttribute("pentes");
  if (pentes != null) {
    var parametresPentes = convertStringToParametres(pentes);
    // parametresPentes est un dictionnaire, chaque clé est la pente. Il faut la convertir en son opposée
    for (var key in parametresPentes) {
      parametresPentes[key] = -parametresPentes[key];
    }
    return parametresPentes;
  } else {
    return null;
  }
};
var calculCoordonneesPointsCourbe = function (expression, parametres) {
  var x = [];
  var y = [];
  for (var i = 0; i < parametres.n + 1; i++) {
    x.push(
      parametres.xmin + (i * (parametres.xmax - parametres.xmin)) / parametres.n
    );
    y.push(math.evaluate(expression, { x: x[i] }).valueOf());
  }
  return { x, y };
};
var constructPathCourbe = function (
  x,
  y,
  echelleX,
  echelleY,
  viewBox,
  parametres
) {
  // On met les coordonnées des points à l'échelle tout en effectuant un changement de repère
  for (var i = 0; i < parametres.n + 1; i++) {
    x[i] = math
      .evaluate(`${viewBox[0]}+(${x[i]} - ${parametres.xmin}) * ${echelleX}`)
      .valueOf();
    y[i] = math
      .evaluate(`${viewBox[1]}+(-1*${y[i]} + ${parametres.ymax}) * ${echelleY}`)
      .valueOf();
  }
  // On construit le path
  var d = "M" + x[0] + "," + y[0];
  for (var i = 1; i < parametres.n + 1; i++) {
    d += " L" + x[i] + "," + y[i];
  }
  return d;
};
var getOrigineAxes = function (
  courbe,
  parametres,
  echelleX,
  echelleY,
  viewBox
) {
  // Calcul des positions des axes en fonction de l'échelle et du changement de repère
  var xOrigin = math
    .evaluate(`${viewBox[0]}+(-1 * ${parametres.xmin}) * ${echelleX}`)
    .valueOf();
  var yOrigin = math
    .evaluate(`${viewBox[1]}+${parametres.ymax} * ${echelleY}`)
    .valueOf();
  return { xOrigin, yOrigin };
};
var constructPathAxeX = function (
  xOrigin,
  yOrigin,
  echelleX,
  echelleY,
  viewBox,
  parametres
) {
  return (
    "M" +
    math
      .evaluate(
        `${viewBox[0]}+(${parametres.xmin} - ${parametres.xmin}) * ${echelleX}`
      )
      .valueOf() +
    "," +
    yOrigin +
    " L" +
    math
      .evaluate(
        `${viewBox[0]}+(${parametres.xmax} - ${parametres.xmin}) * ${echelleX}`
      )
      .valueOf() +
    "," +
    yOrigin
  );
};
var constructPathAxeY = function (
  xOrigin,
  yOrigin,
  echelleX,
  echelleY,
  viewBox,
  parametres
) {
  return (
    "M" +
    xOrigin +
    "," +
    math
      .evaluate(
        `${viewBox[1]}+(-1*${parametres.ymin} + ${parametres.ymax}) * ${echelleY}`
      )
      .valueOf() +
    " L" +
    xOrigin +
    "," +
    math
      .evaluate(
        `${viewBox[1]}+(-1*${parametres.ymax} + ${parametres.ymax}) * ${echelleY}`
      )
      .valueOf()
  );
};
var constructPathTickXGraduation = function (
  i,
  xOrigin,
  yOrigin,
  echelleX,
  echelleY,
  viewBox,
  parametres,
  absFirstGraduation
) {
  var x1 = math
    .evaluate(
      `${viewBox[0]}+(${absFirstGraduation + i * parametres.xunit} - ${
        parametres.xmin
      }) * ${echelleX}`
    )
    .valueOf();
  var y1 = yOrigin + 1;
  var x2 = x1;
  var y2 = yOrigin - 1;
  var d = "M" + x1 + "," + y1 + " L" + x2 + "," + y2;
  return d;
};
var constructPathTickYGraduation = function (
  i,
  xOrigin,
  yOrigin,
  echelleX,
  echelleY,
  viewBox,
  parametres,
  ordFirstGraduation
) {
  var x1 = xOrigin + 1;
  var y1 = math
    .evaluate(
      `${viewBox[1]}+(-1*${ordFirstGraduation + i * parametres.yunit} + ${
        parametres.ymax
      }) * ${echelleY}`
    )
    .valueOf();
  var x2 = xOrigin - 1;
  var y2 = y1;
  var d = "M" + x1 + "," + y1 + " L" + x2 + "," + y2;
  return d;
};
function combinedControlPoints(points, tension = 0.5) {
  var controlPoints = [];
  for (var i = 0; i < points.length - 1; i++) {
    var point = points[i];
    var nextPoint = points[i + 1];
    var delta = tension * (nextPoint[0] - point[0]);

    if (point.pente !== undefined) {
      var dy = point.pente * delta;
      controlPoints.push([point[0] + delta, point[1] + dy]);
    } else {
      var p0 = points[i - 1] || point;
      controlPoints.push([
        point[0] + (nextPoint[0] - p0[0]) / 6,
        point[1] + (nextPoint[1] - p0[1]) / 6,
      ]);
    }

    if (nextPoint.pente !== undefined) {
      var dyNext = nextPoint.pente * delta;
      controlPoints.push([nextPoint[0] - delta, nextPoint[1] - dyNext]);
    } else {
      var p3 = points[i + 2] || nextPoint;
      controlPoints.push([
        nextPoint[0] - (p3[0] - point[0]) / 6,
        nextPoint[1] - (p3[1] - point[1]) / 6,
      ]);
    }
  }
  return controlPoints;
}

var constructCourbe = function (courbe) {
  var parametres = initialiserParametresCourbe(courbe);
  var expression = courbe.getAttribute("expression");
  // On récupère le viewBox de la figure (X_0 Y_0 Width Height)
  var viewBox = courbe.parentNode
    .getAttribute("viewBox")
    .split(" ")
    .map(Number);
  // On calcule l'échelle en abscisse et en ordonnée par rapport au viewBox
  var echelleX = viewBox[2] / (parametres.xmax - parametres.xmin);
  var echelleY = viewBox[3] / (parametres.ymax - parametres.ymin);
  // On détermine les coordonnées de l'origine des axes
  var { xOrigin, yOrigin } = getOrigineAxes(
    courbe,
    parametres,
    echelleX,
    echelleY,
    viewBox
  );
  // Construire la courbe
  // On compte le nombre d'éléments dans linkto
  var linkto = getLinkto(courbe);
  var d;
  // On test si linkto existe
  if (linkto.length <= 1) {
    // La courbe est définie par son expression lorsque le paramètre linkto est vide ou ne comporte qu'un seul élément
    var { x, y } = calculCoordonneesPointsCourbe(expression, parametres);
    var d = constructPathCourbe(x, y, echelleX, echelleY, viewBox, parametres);
  } else {
    // La courbe est définie par des points, on fait passer la courbe par ces points
    // On récupère les pentes des tangentes aux points lorsqu'elles sont définies
    var pentes = recupererPentesCourbe(courbe);
    // On récupère les coordonnées de ces points et on ajoute la propriete pente si elle existe
    var points = [];
    for (var i = 0; i < linkto.length; i++) {
      var point = courbe.parentNode.querySelector("#" + linkto[i]);
      var coords = getCoordonneesPoint(point);
      if (pentes != null && pentes[point.id] != undefined) {
        coords.pente = pentes[point.id];
      }
      linkto[i] = coords;
      points.push(coords);
    }
    var d = "M" + points[0].join(",");
    var controlPoints = combinedControlPoints(points);
    for (var i = 0; i < points.length - 1; i++) {
      d +=
        " C" +
        controlPoints[2 * i].join(",") +
        " " +
        controlPoints[2 * i + 1].join(",") +
        " " +
        points[i + 1].join(",");
    }
  }
  var courbeSVG = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  courbeSVG.setAttribute("d", d);
  courbeSVG.setAttribute("fill", "transparent");
  courbeSVG.setAttribute("stroke", "black");
  courbeSVG.setAttribute("stroke-width", "0.5");
  courbeSVG.setAttribute("style", courbe.getAttribute("style"));
  courbeSVG.style.userSelect = "none";
  // Construire les axes
  var axesSVG = document.createElementNS("http://www.w3.org/2000/svg", "g");
  var axeX = document.createElementNS("http://www.w3.org/2000/svg", "path");
  var axeY = document.createElementNS("http://www.w3.org/2000/svg", "path");
  var pathAxeX = constructPathAxeX(
    xOrigin,
    yOrigin,
    echelleX,
    echelleY,
    viewBox,
    parametres
  );
  axeX.setAttribute("d", pathAxeX);
  var pathAxeY = constructPathAxeY(
    xOrigin,
    yOrigin,
    echelleX,
    echelleY,
    viewBox,
    parametres
  );
  axeY.setAttribute("d", pathAxeY);
  axeX.setAttribute("stroke", "black");
  axeY.setAttribute("stroke", "black");
  axeX.setAttribute("stroke-width", "0.5");
  axeY.setAttribute("stroke-width", "0.5");
  axeX.style.userSelect = "none";
  axeY.style.userSelect = "none";
  axesSVG.appendChild(axeX);
  axesSVG.appendChild(axeY);
  // Construire les graduations
  var graduationsSVG = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  var style = courbe.getAttribute("style");
  graduationsSVG.setAttribute("style", style);

  // Calculons l'abscisse de la première graduation
  var absFirstGraduation =
    Math.ceil(parametres.xmin / parametres.xunit) * parametres.xunit;

  for (
    var i = 0;
    i < (parametres.xmax - parametres.xmin) / parametres.xunit + 1;
    i++
  ) {
    var graduationAxexSVG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    var d = constructPathTickXGraduation(
      i,
      xOrigin,
      yOrigin,
      echelleX,
      echelleY,
      viewBox,
      parametres,
      absFirstGraduation
    );
    graduationAxexSVG.setAttribute("d", d);
    graduationAxexSVG.setAttribute("stroke", "black");
    graduationAxexSVG.setAttribute("stroke-width", "0.5");
    graduationAxexSVG.style.userSelect = "none";
    graduationsSVG.appendChild(graduationAxexSVG);
  }

  // Calculons l'ordonnée de la première graduation
  var ordFirstGraduation =
    Math.ceil(parametres.ymin / parametres.yunit) * parametres.yunit;

  for (
    var i = 0;
    i < (parametres.ymax - parametres.ymin) / parametres.yunit + 1;
    i++
  ) {
    var graduationAxeySVG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    var d = constructPathTickYGraduation(
      i,
      xOrigin,
      yOrigin,
      echelleX,
      echelleY,
      viewBox,
      parametres,
      ordFirstGraduation
    );
    graduationAxeySVG.setAttribute("d", d);
    graduationAxeySVG.setAttribute("stroke", "black");
    graduationAxeySVG.setAttribute("stroke-width", "0.5");
    graduationAxeySVG.style.userSelect = "none";
    graduationsSVG.appendChild(graduationAxeySVG);
  }

  // Placer l'unité en abscisse
  var uniteXSVG = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  uniteXSVG.setAttribute("x", xOrigin + parametres.xunit * echelleX);
  uniteXSVG.setAttribute("y", yOrigin + 10);
  uniteXSVG.setAttribute("text-anchor", "middle");
  uniteXSVG.setAttribute("font-size", "10");
  uniteXSVG.setAttribute("fill", "black");
  uniteXSVG.setAttribute("stroke", "transparent");
  uniteXSVG.setAttribute("stroke-width", "0.5");
  uniteXSVG.setAttribute("style", "user-select:none");
  uniteXSVG.setAttribute("style", style);
  uniteXSVG.innerHTML = parametres.xunit;
  // Placer l'unité en ordonnée
  var uniteYSVG = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  uniteYSVG.setAttribute("x", xOrigin - 5);
  uniteYSVG.setAttribute("y", yOrigin - parametres.yunit * echelleY + 2.5); // Décalage de 2.5 pixels
  uniteYSVG.setAttribute("text-anchor", "middle");
  uniteYSVG.setAttribute("font-size", "10");
  uniteYSVG.setAttribute("fill", "black");
  uniteYSVG.setAttribute("stroke", "transparent");
  uniteYSVG.setAttribute("stroke-width", "0.5");
  uniteYSVG.setAttribute("style", "user-select:none");
  uniteYSVG.setAttribute("style", style);
  uniteYSVG.innerHTML = parametres.yunit;

  courbe.appendChild(axesSVG);
  courbe.appendChild(graduationsSVG);
  courbe.appendChild(uniteXSVG);
  courbe.appendChild(uniteYSVG);
  courbe.appendChild(courbeSVG);
};
var initialiserCourbe = function (courbe) {
  constructCourbe(courbe);
};
var initialiserCourbesFigure = function (figure) {
  getCourbesFigure(figure).forEach(function (courbe) {
    initialiserCourbe(courbe);
  });
};
var initialiserFigure = function (figure) {
  addQuadrillage(figure);
  addBoutonQuadrillage(figure);
  addBoutonPleinEcran(figure);
  initialiserPointsFigure(figure);
  initialiserVecteursFigure(figure);
  initialiserDroitesFigure(figure);
  initialiserDemiDroitesFigure(figure);
  initialiserSegmentsFigure(figure);
  initialiserPolygonesFigure(figure);
  initialiserGraduationsFigure(figure);
  initialiserCourbesFigure(figure);
};
var getCoordonneesPoint = function (point) {
  var data = point
    .getAttribute("transform")
    .split("translate(")[1]
    .split(")")[0]
    .split(",");
  var x = parseFloat(data[0]);
  var y = parseFloat(data[1]);
  return [x, y];
};
var setCoordonneesPoint = function (point, x, y) {
  point.setAttribute("transform", "translate(" + x + "," + y + ")");
};
var actualiserCoordonneesPointClassTranslation = function (point) {
  if (point.classList.contains("translation")) {
    // M est l'image de P par la translation de vecteur kAB
    var A = getElementLinkto(point, 0);
    var B = getElementLinkto(point, 1);
    var P = getElementLinkto(point, 2);
    let P1 = new Point(...getCoordonneesPoint(A));
    let P2 = new Point(...getCoordonneesPoint(B));
    let u = new Vecteur();
    u.setCoordonneesVecteur2Points(P1, P2);
    let P3 = new Point(...getCoordonneesPoint(P));
    var data = point.getAttribute("data").split(" ");
    var k = parseFloat(data[0]);
    let P4 = P3.translation(u.multiplicationVecteur(k));
    var x4 = P4.x;
    var y4 = P4.y;
    setCoordonneesPoint(point, x4, y4);
  }
};
var actualiserCoordonneesPointClassDilatation = function (point) {
  if (point.classList.contains("dilatation")) {
    // H est le projeté de P selon la direction formant un angle alpha avec le vecteur AB
    // M est l'image de P par l'homothétie de rapport k et de centre H
    var A = getElementLinkto(point, 0);
    var B = getElementLinkto(point, 1);
    var P = getElementLinkto(point, 2);
    let P1 = new Point(...getCoordonneesPoint(A));
    let P2 = new Point(...getCoordonneesPoint(B));
    let P3 = new Point(...getCoordonneesPoint(P));
    var data = point.getAttribute("data").split(" ");
    var k = parseFloat(data[1]);
    var alpha = (parseFloat(data[0]) / 180) * Math.PI;
    var H = P3.projectionAngle(P1, P2, alpha);
    var M = P3.homothetie(H, k);
    setCoordonneesPoint(point, M.x, M.y);
  }
};
var actualiserCoordonneesPointClassRotation = function (point) {
  if (point.classList.contains("rotation")) {
    var A = new Point(...getCoordonneesPoint(getElementLinkto(point, 0)));
    var data = point.getAttribute("data").split(" ");
    var alpha = (parseFloat(data[0]) / 180) * Math.PI;
    if (getLinkto(point).length == 1) {
      var k = parseFloat(data[1]);
      var P = A.translation(new Vecteur(1, 0));
      var M = P.rotation(A, alpha).homothetie(A, k);
    } else if (getLinkto(point).length == 2) {
      var P = new Point(...getCoordonneesPoint(getElementLinkto(point, 1)));
      var k = parseFloat(data[1]);
      var M = P.rotation(A, alpha).homothetie(A, k);
    } else if (getLinkto(point).length == 3) {
      var P = new Point(...getCoordonneesPoint(getElementLinkto(point, 1)));
      var Q = new Point(...getCoordonneesPoint(getElementLinkto(point, 2)));
      var k = parseFloat(data[1]);
      var N = P.rotation(A, alpha).homothetie(A, k);
      var u = new Vecteur();
      u.setCoordonneesVecteur2Points(A, Q);
      M = N.translation(u);
    }
    setCoordonneesPoint(point, M.x, M.y);
  }
};
var actualiserCoordonneesPointsLies = function (point) {
  // Récursivité pour atteindre tous les points liés
  var idPoint = point.getAttribute("id");
  var points = document.querySelectorAll("g.point[linkto*='" + idPoint + "']");
  for (var i = 0; i < points.length; i++) {
    actualiserCoordonneesPoint(points[i]);
  }
};
var initialiserDataPoint = function (point) {
  // Si le point subit une tranformation, on initialise l'attribut data si ce n'est pas déjà fait
  if (point.hasAttribute("data") == false) {
    if (point.classList.contains("translation")) {
      point.setAttribute("data", "1");
      point.classList.add("transformation");
    } else if (point.classList.contains("dilatation")) {
      point.setAttribute("data", "90 -1");
      point.classList.add("transformation");
    } else if (point.classList.contains("rotation")) {
      point.setAttribute("data", "90 1");
      point.classList.add("transformation");
    }
  } else {
    point.classList.add("transformation");
  }
};
var actualiserLabelVecteur = function (vecteur) {
  if (vecteur.classList.contains("labeled")) {
    var A = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 0)));
    var B = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 1)));
    var AB = new Segment(A, B);
    var I = AB.milieu();
    var foreignObject = vecteur.querySelector("foreignObject");
    foreignObject.setAttribute("x", I.x);
    foreignObject.setAttribute("y", I.y);
  }
};
var actualiserVecteur = function (vecteur) {
  var A = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 0)));
  var B = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 1)));
  var path = vecteur.querySelector("path");
  path.setAttribute("d", "M" + A.x + "," + A.y + " L" + B.x + "," + B.y);
  actualiserHeadVecteur(vecteur);
  actualiserLabelVecteur(vecteur);
};
var actualiserCoordonneesVecteursLies = function (point) {
  var idPoint = point.getAttribute("id");
  var vecteurs = document.querySelectorAll(
    "g.vecteur[linkto*='" + idPoint + "']"
  );
  for (var i = 0; i < vecteurs.length; i++) {
    actualiserVecteur(vecteurs[i]);
  }
};
var actualiserDroite = function (droite) {
  var path = droite.querySelector("path");
  var extremites = determinerExtremitesDroite(droite);
  var E1 = extremites[0];
  var E2 = extremites[1];
  path.setAttribute("d", "M" + E1.x + "," + E1.y + " L" + E2.x + "," + E2.y);
};
var actualiserCoordonneesDroitesLies = function (point) {
  var idPoint = point.getAttribute("id");
  var droites = document.querySelectorAll(
    "g.droite[linkto*='" + idPoint + "']"
  );
  for (var i = 0; i < droites.length; i++) {
    actualiserDroite(droites[i]);
  }
};
var actualiserDemiDroite = function (demidroite) {
  var path = demidroite.querySelector("path");
  var extremites = determinerExtremitesDroite(demidroite);
  var E = extremites[1];
  var A = getElementLinkto(demidroite, 0);
  path.setAttribute(
    "d",
    "M" + getCoordonneesPoint(A).join(",") + " L" + E.x + "," + E.y
  );
};
var actualiserCoordonneesDemiDroitesLies = function (point) {
  var idPoint = point.getAttribute("id");
  var demidroites = document.querySelectorAll(
    "g.demidroite[linkto*='" + idPoint + "']"
  );
  for (var i = 0; i < demidroites.length; i++) {
    actualiserDemiDroite(demidroites[i]);
  }
};
var actualiserCodageSegment = function (segment) {
  var A = new Point(...getCoordonneesPoint(getElementLinkto(segment, 0)));
  var B = new Point(...getCoordonneesPoint(getElementLinkto(segment, 1)));
  var AB = new Segment(A, B);
  var I = AB.milieu();
  var alpha = (AB.angle() / Math.PI) * 180;
  var path = segment.querySelector("path.codageSegment");
  path.setAttribute(
    "transform",
    "translate(" + I.x + "," + I.y + ") rotate(" + -alpha + ")"
  );
};
var actualiserHeadVecteur = function (vecteur) {
  var A = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 0)));
  var B = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 1)));
  var AB = new Segment(A, B);
  var alpha = (AB.angle() / Math.PI) * 180;
  var path = vecteur.querySelector("path.headVecteur");
  path.setAttribute(
    "transform",
    "translate(" + B.x + "," + B.y + ") rotate(" + -alpha + ")"
  );
};
var actualiserSegment = function (segment) {
  var A = getElementLinkto(segment, 0);
  var B = getElementLinkto(segment, 1);
  var path = segment.querySelector("path");
  path.setAttribute(
    "d",
    "M" +
      getCoordonneesPoint(A).join(",") +
      " L" +
      getCoordonneesPoint(B).join(",")
  );
  if (isCodageSegment(segment)) {
    actualiserCodageSegment(segment);
  }
};
var actualiserCoordonneesSegmentsLies = function (point) {
  var idPoint = point.getAttribute("id");
  var segments = document.querySelectorAll(
    "g.segment[linkto*='" + idPoint + "']"
  );
  for (var i = 0; i < segments.length; i++) {
    actualiserSegment(segments[i]);
  }
};
var actualiserPolygone = function (polygone) {
  var points = getLinkto(polygone)
    .map(
      (point) =>
        new Point(...getCoordonneesPoint(document.getElementById(point)))
    )
    .map((point) => [point.x, point.y].join(","));
  var path = polygone.querySelector("path");
  var d = "M" + points.join(" L") + " Z";
  path.setAttribute("d", d);
};
var actualiserCoordonneesPolygonesLies = function (point) {
  var idPoint = point.getAttribute("id");
  var polygones = document.querySelectorAll(
    "g.polygone[linkto*='" + idPoint + "']"
  );
  for (var i = 0; i < polygones.length; i++) {
    actualiserPolygone(polygones[i]);
  }
};
var actualiserCoordonneesPoint = function (point) {
  actualiserCoordonneesPointClassTranslation(point);
  actualiserCoordonneesPointClassDilatation(point);
  actualiserCoordonneesPointClassRotation(point);
  actualiserCoordonneesPointsLies(point);
  actualiserCoordonneesVecteursLies(point);
  actualiserCoordonneesDroitesLies(point);
  actualiserCoordonneesDemiDroitesLies(point);
  actualiserCoordonneesSegmentsLies(point);
  actualiserCoordonneesPolygonesLies(point);
};
var actualiserPointsFigure = function (figure) {
  getPointsFigure(figure).forEach(function (point) {
    actualiserCoordonneesPoint(point);
  });
};
var setHightlightPointOn = function (point) {
  d3.select(point).select("circle.selectionne").attr("fill", "orange");
  d3.select(point).select("circle.selectionne").attr("r", "20");
};
var setHightlightPointOff = function (point) {
  d3.select(point).select("circle.selectionne").attr("fill", "transparent");
  d3.select(point).select("circle.selectionne").attr("r", "0");
};
var controlerCoordonneesPoint = function (point, figure) {
  let x = 0;
  let y = 0;
  // Points draggable avec contrainte
  if (point.classList.contains("translation")) {
    // On détermine le projeté orthogonal du pointeur de la souris sur la droite parallèle à (AB) et passant par P
    var A = new Point(...getCoordonneesPoint(getElementLinkto(point, 0)));
    var B = new Point(...getCoordonneesPoint(getElementLinkto(point, 1)));
    var P = new Point(...getCoordonneesPoint(getElementLinkto(point, 2)));
    var M = new Point(d3.event.x, d3.event.y);
    var u = new Vecteur();
    u.setCoordonneesVecteur2Points(A, B);
    var Q = P.translation(u);
    var N = M.projectionOrthogonale(P, Q);
    x = N.x;
    y = N.y;
    // On veut la obtenir le rapport signé de la distance PN sur la distance AB
    var k = P.distance(N) / A.distance(B);
    // On veut la obtenir la distance signée en utilisant le produit scalaire de u et v
    var v = new Vecteur();
    v.setCoordonneesVecteur2Points(P, N);
    if (u.produitScalaire(v) < 0) {
      k = -k;
    }
    point.setAttribute("data", k.toString());
  } else if (point.classList.contains("rotation")) {
    // Tester le nombre de points liés
    // Si un seul point
    if (point.getAttribute("linkto").split(" ").length == 1) {
      var A = new Point(...getCoordonneesPoint(getElementLinkto(point, 0)));
      var k = parseFloat(point.getAttribute("data").split(" ")[1]);
      var M = new Point(d3.event.x, d3.event.y);
      var d = A.distance(M);
      var N = M.homothetie(A, k / d);
      var u = new Vecteur(1, 0);
      var v = new Vecteur();
      v.setCoordonneesVecteur2Points(A, N);
      var alpha = (u.angle(v) / Math.PI) * 180;
      point.setAttribute("data", alpha.toString() + " " + k.toString());
      x = N.x;
      y = N.y;
    } else if (point.getAttribute("linkto").split(" ").length == 2) {
      if (!point.classList.contains("rapport")) {
        var A = new Point(...getCoordonneesPoint(getElementLinkto(point, 0)));
        var B = new Point(...getCoordonneesPoint(getElementLinkto(point, 1)));
        var M = new Point(d3.event.x, d3.event.y);
        var k = parseFloat(point.getAttribute("data").split(" ")[1]);
        var u = new Vecteur();
        u.setCoordonneesVecteur2Points(A, B);
        var v = new Vecteur();
        v.setCoordonneesVecteur2Points(A, M);
        var alpha = (u.angle(v) / Math.PI) * 180;
        point.setAttribute("data", alpha.toString() + " " + k.toString());
        var N = M.homothetie(A, k);
        x = N.x;
        y = N.y;
      } else {
        // On conserve l'angle mais on change le rapport
        var A = new Point(...getCoordonneesPoint(getElementLinkto(point, 0)));
        var B = new Point(...getCoordonneesPoint(getElementLinkto(point, 1)));
        var M = new Point(d3.event.x, d3.event.y);
        var u = new Vecteur();
        u.setCoordonneesVecteur2Points(A, B);
        var v = new Vecteur();
        v.setCoordonneesVecteur2Points(A, M);
        // Déterminer le signe avec le produit vectoriel
        var signe = u.produitVectoriel(v) / Math.abs(u.produitVectoriel(v));
        // On projète M sur l'image de la droite (AB) par la rotation de centre A et d'angle alpha
        var alpha =
          (parseFloat(point.getAttribute("data").split(" ")[0]) / 180) *
          Math.PI;
        var P1 = B.rotation(A, alpha);
        var N = M.projectionOrthogonale(A, P1);
        var k = (signe * A.distance(N)) / A.distance(B);
        // On veut la obtenir la distance signée en utilisant le produit scalaire de u et v
        point.setAttribute(
          "data",
          ((alpha / Math.PI) * 180).toString() + " " + k.toString()
        );
        x = N.x;
        y = N.y;
      }
    } else if (point.getAttribute("linkto").split(" ").length == 3) {
      // Les points sont A, P, Q tels que AQ=AP
      // Le centre de rotation est maintenant Q mais on veut que le rayon soit toujours AP
      var A = new Point(...getCoordonneesPoint(getElementLinkto(point, 0)));
      var P = new Point(...getCoordonneesPoint(getElementLinkto(point, 1)));
      var Q = new Point(...getCoordonneesPoint(getElementLinkto(point, 2)));
      var M = new Point(d3.event.x, d3.event.y);
      var k = parseFloat(point.getAttribute("data").split(" ")[1]);
      var u = new Vecteur();
      u.setCoordonneesVecteur2Points(A, P);
      var v = new Vecteur();
      v.setCoordonneesVecteur2Points(Q, M);
      var alpha = (u.angle(v) / Math.PI) * 180;
      point.setAttribute("data", alpha.toString() + " " + k.toString());
      var N = M.homothetie(Q, k);
      x = N.x;
      y = N.y;
    }
  } else {
    // Il ne faut pas dépasser les limites du cadre
    // On récupère les dimensions du cadre avec le viewBox
    var cadre = figure.querySelector("svg");
    var viewBox = cadre.getAttribute("viewBox").split(" ");
    var xmin = parseFloat(viewBox[0]);
    var ymin = parseFloat(viewBox[1]);
    var width = parseFloat(viewBox[2]);
    var height = parseFloat(viewBox[3]);
    x = Math.min(Math.max(d3.event.x, xmin), xmin + width);
    y = Math.min(Math.max(d3.event.y, ymin), ymin + height);
    // Si le quadrillage est affiché, on déplace le point sur le quadrillage
    if (
      figure.querySelector("#" + figure.id + "-quadrillage").style.display ==
      "block"
    ) {
      x = Math.round(x / 10) * 10;
      y = Math.round(y / 10) * 10;
    }
  }
  return [x, y];
};
var interactivity = function (figure) {
  d3.selectAll("g.point.draggable").call(
    d3
      .drag()
      .on("drag", function () {
        if (
          d3.event.x > 0 &&
          d3.event.x < 200 &&
          d3.event.y > 0 &&
          d3.event.y < 200
        ) {
          setHightlightPointOn(this);
          setCoordonneesPoint(this, ...controlerCoordonneesPoint(this, figure));
          actualiserCoordonneesPoint(this);
        }
      })
      .on("end", function () {
        setHightlightPointOff(this);
      })
  );
};
var initialiserPointsFigure = function (figure) {
  getPointsFigure(figure)
    .filter((point) => point.id.split("-")[0] == figure.id)
    .forEach(function (point) {
      initialiserPointTransform(point);
      constructLabelPoint(point);
      constructCrossPoint(point);
      constructHightlightPoint(point);
      constructSelectPoint(point);
      automaticHideCrossPoint(point);
      initialiserDataPoint(point);
    });
};
var draggablesAuPremierPlan = function (figure) {
  var svg = figure.querySelector("svg");
  var draggable = figure.querySelectorAll(".draggable");
  for (var i = 0; i < draggable.length; i++) {
    svg.appendChild(draggable[i]);
  }
};
export var addListenerInteractivite = function (figure) {
  addListenerButtonQuadrillage(figure);
  addListenerButtonPleinEcran(figure);
  figure.addEventListener("mouseenter", function () {
    interactivity(this);
  });
};

// Créer les figures
export var createFigures = function () {
  setUniqueIds();
  var figures = document.querySelectorAll(".figure");
  for (var i = 0; i < figures.length; i++) {
    if (figures[i].querySelector("svg") != null) {
      initialiserFigure(figures[i]);
      actualiserPointsFigure(figures[i]);
      draggablesAuPremierPlan(figures[i]);
      addListenerInteractivite(figures[i]);
    }
  }
  window.parent.postMessage("figures_created", "*");
};
