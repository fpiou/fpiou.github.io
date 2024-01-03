// Version: 1.0.0
import { get } from "lodash";
import { Point, Vecteur, Segment } from "./class2.js";
import * as math from "mathjs";
import { intersect, shape } from 'svg-intersections';

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
    // On lui ajoute un identifiant unique
    figures[i].id = figures[i].id=='' ? "figure" + i : figures[i].id+i;
    // On récupère l'identifiant de la figure
    var id = figures[i].id;
    // on teste si la figure contient un svg
    if (figures[i].querySelector("svg") != null) {
      // On ajoute l'identifiant à l'élément svg
      figures[i].querySelector("svg").id = id;
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
        // On ajoute également l'identifiant à tous les éléments du controls qui est un string de la forme "A:0.5 B:1 C:2"
        if (ids[j].getAttribute("controls") != null) {
          var controls = ids[j].getAttribute("controls").split(" ");
          for (var k = 0; k < controls.length; k++) {
            controls[k] =
              id +
              "-" +
              controls[k].split(":")[0] +
              ":" +
              controls[k].split(":")[1];
          }
          ids[j].setAttribute("controls", controls.join(" "));
        }
        // On ajoute également l'identifiant à tous les éléments du repere
        if (ids[j].getAttribute("repere") != null) {
          ids[j].setAttribute(
            "repere",
            id + "-" + ids[j].getAttribute("repere")
          );
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
  // On ajoute la classe cadre au cadre
  cadre.classList.add("background-figure");
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
    if (labelLinkto.length == 0) {
      var foreignObject = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "foreignObject"
      );
      foreignObject.setAttribute("x", "0");
      foreignObject.setAttribute("y", "0");
      foreignObject.setAttribute("text-anchor", "start");
      foreignObject.setAttribute("width", "20");
      foreignObject.setAttribute("height", "20");
      foreignObject.setAttribute("style", point.getAttribute("style"));
      foreignObject.innerHTML = katex.renderToString(
        point.getAttribute("name"),
        { output: "htmlAndMathml" }
      );
      foreignObject.style.userSelect = "none";
      point.appendChild(foreignObject);
    } else {
      labelLinkto.forEach(function (label,index) {
        var foreignObject = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "foreignObject"
        );
        foreignObject.id = label.id+"-"+index;
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
          foreignObject.setAttribute("stroke", "black");
        }
        foreignObject.setAttribute(
          "style",
          labelLinkto[index].getAttribute("style")
        );
        foreignObject.innerHTML = katex.renderToString(label.innerHTML, {
          output: "htmlAndMathml",
        });
        foreignObject.style.userSelect = "none";
        point.appendChild(foreignObject);
      });
    }
  }
};
var constructCrossPoint = function (point) {
  // Récupérer les paramètres du point
  var paramString = point.getAttribute("parametres");
  if (paramString == null) {
    paramString = "";
  }
  var parametres = convertStringToParametres(paramString);
  // Si le point a des paramètres
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  // Si le point a un parametre forme
  if (parametres.forme != undefined && parametres.forme == "+") {
    path.setAttribute("d", "M-2,0 L2,0 M0,-2 L0,2");
  } else {
    path.setAttribute("d", "M-2,-2 L2,2 M-2,2 L2,-2");
  }
  path.setAttribute("fill", "none");
  if (point.getAttribute("stroke") == null) {
    path.setAttribute("stroke", "black");
  }
  path.setAttribute("class", "crosspoint");
  path.style.userSelect = "none";
  // Récupérer le style du point
  var style = point.getAttribute("style");
  path.setAttribute("style", style);
  // Vers de nouvelles prises en charge des paramètres
  if (point.getAttribute("scale") != null) {
    path.setAttribute("transform", "scale("+point.getAttribute("scale")+")");
  }
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
  if (point.hasAttribute("repere")) {
    var repere = document.getElementById(point.getAttribute("repere"));
    [x, y] = repere.getCoordonneesDansViewBox(x, y);
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
var createHeadLine = function (line, forme = ">") {
  var A = new Point(...getCoordonneesPoint(getElementLinkto(line, 0)));
  var B = new Point(...getCoordonneesPoint(getElementLinkto(line, 1)));
  var AB = new Segment(A, B);
  var alpha = (AB.angle() / Math.PI) * 180;
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  if (forme == ">") {
    path.setAttribute("d", "M-7,-2 L-0,-0 L-7,2");
  }
  if (forme == "[") {
    path.setAttribute("d", "M-7,-2 L-0,-0 L-7,2 M-7,-2 L-7,2");
  }
  if (forme == "]") {
    path.setAttribute("d", "M-2,-3 L0,-3 L0,3 L-2,3");
  }
  // Déterminer les coordonnées relatives de B par rappport à A
  path.setAttribute(
    "transform",
    "translate(" + B.x + "," + B.y + ") rotate(" + -alpha + ")"
  );
  // Récupérer tous les attributs de line commençant par header- et attribuer l'attribut header-attribut à path
  var attributs = Array.from(line.attributes).filter((attribut) =>
    attribut.name.includes("header-")
  );
  attributs.forEach(function (attribut) {
    path.setAttribute(attribut.name.replace("header-", ""), attribut.value);
  });
  path.style.userSelect = "none";
  line.appendChild(path);
};
var constructHeadVecteur = function (vecteur) {
  var A = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 0)));
  var B = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 1)));
  var AB = new Segment(A, B);
  var alpha = (AB.angle() / Math.PI) * 180;
  // Récupérer le paramètre scale du vecteur
  var scale = 1;
  if (vecteur.hasAttribute("scale")) {
    scale = vecteur.getAttribute("scale");
  }
  var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M-7,-2 L-0,-0 L-7,2");
  // Déterminer les coordonnées relatives de B par rappport à A
  path.setAttribute(
    "transform",
    "translate(" + B.x + "," + B.y + ") rotate(" + -alpha + ") scale(" + scale + ")" 
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
  if (segment.getAttribute("header") != null) {
    createHeadLine(segment, segment.getAttribute("header"));
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
  if (parametres.xBoxmin == undefined) {
    parametres.xBoxmin = parametres.xmin;
  }
  // Si parametres.xmax n'existe pas alors on prend 10
  if (parametres.xmax == undefined) {
    parametres.xmax = 10;
  }
  if (parametres.xBoxmax == undefined) {
    parametres.xBoxmax = parametres.xmax;
  }
  // Si parametres.ymin n'existe pas alors on prend -10
  if (parametres.ymin == undefined) {
    parametres.ymin = -10;
  }
  if (parametres.yBoxmin == undefined) {
    parametres.yBoxmin = parametres.ymin;
  }
  // Si parametres.ymax n'existe pas alors on prend 10
  if (parametres.ymax == undefined) {
    parametres.ymax = 10;
  }
  if (parametres.yBoxmax == undefined) {
    parametres.yBoxmax = parametres.ymax;
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
      .evaluate(`${viewBox.xO}+(${x[i]} - ${parametres.xBoxmin}) * ${echelleX}`)
      .valueOf();
    y[i] = math
      .evaluate(
        `${viewBox.yO}+(-1*${y[i]} + ${parametres.yBoxmax}) * ${echelleY}`
      )
      .valueOf();
  }
  // On construit le path
  var d = "M" + x[0] + "," + y[0];
  for (var i = 1; i < parametres.n + 1; i++) {
    d += " L" + x[i] + "," + y[i];
  }
  return d;
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
        `${viewBox.xO}+(${parametres.xmin} - ${parametres.xmin}) * ${echelleX}`
      )
      .valueOf() +
    "," +
    yOrigin +
    " L" +
    math
      .evaluate(
        `${viewBox.xO}+(${parametres.xmax} - ${parametres.xmin}) * ${echelleX}`
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
        `${viewBox.yO}+(-1*${parametres.ymin} + ${parametres.ymax}) * ${echelleY}`
      )
      .valueOf() +
    " L" +
    xOrigin +
    "," +
    math
      .evaluate(
        `${viewBox.yO}+(-1*${parametres.ymax} + ${parametres.ymax}) * ${echelleY}`
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
      `${viewBox.xO}+(${absFirstGraduation + i * parametres.xunit} - ${
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
      `${viewBox.yO}+(-1*${ordFirstGraduation + i * parametres.yunit} + ${
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
var constructAxes = function (
  courbe,
  xOrigin,
  yOrigin,
  echelleX,
  echelleY,
  viewBox,
  parametres
) {
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
  return [axesSVG, graduationsSVG, uniteXSVG, uniteYSVG];
};
var constructCourbe = function (courbe) {
  var parametres = initialiserParametresCourbe(courbe);
  var expression = courbe.getAttribute("expression");
  var viewBox = getViewBoxFigure(courbe.parentNode);
  var echelleX = viewBox.width / (parametres.xBoxmax - parametres.xBoxmin);
  var echelleY = viewBox.height / (parametres.yBoxmax - parametres.yBoxmin);
  var [xOrigin, yOrigin] = changementEchelleRepere(
    [0],
    [0],
    parametres.xBoxmin,
    parametres.yBoxmax,
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
  if (parametres.afficherAxes) {
    var [axesSVG, graduationsSVG, uniteXSVG, uniteYSVG] = constructAxes(
      courbe,
      xOrigin,
      yOrigin,
      echelleX,
      echelleY,
      viewBox,
      parametres
    );
    courbe.appendChild(axesSVG);
    courbe.appendChild(graduationsSVG);
    courbe.appendChild(uniteXSVG);
    courbe.appendChild(uniteYSVG);
  }
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
var getSecteursFigure = function (figure) {
  var secteurs = document.querySelectorAll("g.secteur");
  var secteursArray = Array.from(secteurs);
  return secteursArray.filter(
    (secteur) => secteur.id.split("-")[0] == figure.id
  );
};
function createSVGElement(tagName) {
  return document.createElementNS("http://www.w3.org/2000/svg", tagName);
}
function constructSecteur(secteur) {
  const centre = getElementLinkto(secteur, 0);
  var paramString = secteur.getAttribute("parametres");
  const defaultParams = {
    r: 10,
    departAngle: 0,
    angle: 90,
    sens: 0,
    afficherNoms: false,
    coeffDistanceEtiquette: 0.7,
  };
  const parametres = {
    ...defaultParams,
    ...convertStringToParametres(paramString),
  };
  const secteurSVG = createSVGElement("path");
  var [x, y] = [parametres.xOrigin, parametres.yOrigin];
  if (centre != null) {
    [x, y] = getCoordonneesPoint(centre);
  }
  const angleRad = (parametres.angle / 180) * Math.PI;
  const departAngleRad = (parametres.departAngle / 180) * Math.PI;
  const r = parametres.r;
  const senscoeff = parametres.sens == 0 ? 1 : -1;
  const x1 = x + r * Math.cos(departAngleRad);
  const y1 = y - senscoeff * r * Math.sin(departAngleRad);
  const x2 = x + r * Math.cos(angleRad + departAngleRad);
  const y2 = y - senscoeff * r * Math.sin(angleRad + departAngleRad);

  const largeArcFlag = parametres.angle > 180 ? 1 : 0;
  const d = `M${x},${y} L${x1},${y1} A${r},${r} 0 ${largeArcFlag},${parametres.sens} ${x2},${y2} Z`;

  secteurSVG.setAttribute("d", d);
  secteurSVG.setAttribute("fill", "transparent");
  secteurSVG.setAttribute("stroke", "black");
  secteurSVG.setAttribute("stroke-width", "0.5");
  secteurSVG.setAttribute("style", secteur.getAttribute("style"));
  secteurSVG.style.userSelect = "none";
  secteur.appendChild(secteurSVG);
  // On regarde si on doit afficher le nom du secteur
  if (parametres.afficherNoms) {
    var nomSVG = document.createElementNS("http://www.w3.org/2000/svg", "text");
    // On caclule le milieu du secteur
    var x =
      x +
      parametres.coeffDistanceEtiquette *
        r *
        Math.cos(angleRad / 2 + departAngleRad);
    var y =
      y -
      parametres.coeffDistanceEtiquette *
        senscoeff *
        r *
        Math.sin(angleRad / 2 + departAngleRad);
    nomSVG.setAttribute("x", x);
    nomSVG.setAttribute("y", y);
    nomSVG.setAttribute("text-anchor", "middle");
    nomSVG.setAttribute("font-size", "10");
    nomSVG.setAttribute("fill", "black");
    nomSVG.setAttribute("stroke", "transparent");
    nomSVG.setAttribute("style", "fill-opacity:1;user-select:none");
    nomSVG.innerHTML = secteur.getAttribute("nom");
    secteur.appendChild(nomSVG);
  }
}
var initialiserSecteur = function (secteur) {
  constructSecteur(secteur);
};
var initialiserSecteursFigure = function (figure) {
  getSecteursFigure(figure).forEach(function (secteur) {
    initialiserSecteur(secteur);
  });
};
var getDiagrammesCirculairesFigure = function (figure) {
  var diagrammesCirculaires = document.querySelectorAll(
    "g.diagrammeCirculaire"
  );
  var diagrammesCirculairesArray = Array.from(diagrammesCirculaires);
  return diagrammesCirculairesArray.filter(
    (diagrammeCirculaire) => diagrammeCirculaire.id.split("-")[0] == figure.id
  );
};
var getViewBoxFigure = function (figure) {
  var viewbox = figure.getAttribute("viewBox").split(" ").map(Number);
  return {
    xO: viewbox[0],
    yO: viewbox[1],
    width: viewbox[2],
    height: viewbox[3],
  };
};
var changementEchelleRepere = function (
  x,
  y,
  xBoxmin,
  yBoxmax,
  echelleX,
  echelleY,
  viewBox
) {
  return [
    math.evaluate(`${viewBox.xO}+(${x} - ${xBoxmin}) * ${echelleX}`).valueOf(),
    math
      .evaluate(`${viewBox.yO}+(-1*${y} + ${yBoxmax}) * ${echelleY}`)
      .valueOf(),
  ];
};
var constructDiagrammeCirculaire = function (diagrammeCirculaire) {
  // Les données séparées par des ; sont au format csv dans le innerHTML de diagrammeCirculaire
  var data = diagrammeCirculaire.innerHTML.split("\n");
  // On supprime les lignes vides
  data = data.filter((ligne) => ligne != "");
  // On supprime les espaces en début et fin de ligne
  data = data.map((ligne) => ligne.trim());
  // On supprime les espaces en trop dans les lignes
  data = data.map((ligne) => ligne.replace(/ +/g, " "));
  // On supprime les espaces avant et après les ;
  data = data.map((ligne) => ligne.replace(/ *; */g, ";"));
  // On récupère les données dans un tableau
  data = data.map((ligne) => ligne.split(";"));
  // La première ligne contient les catégories des données
  data.shift();
  // La dernière ligne est à supprimer si elle est vide
  if (data[data.length - 1].length == 1 && data[data.length - 1][0] == "") {
    data.pop();
  }
  // La première colonne contient les noms des secteurs
  var nomsSecteurs = data.map((ligne) => ligne[0]);
  // L'autre colonne contient les valeurs des secteurs
  var valeursSecteurs = data.map((ligne) => parseFloat(ligne[1]));
  // On récupère les paramètres
  var paramString = diagrammeCirculaire.getAttribute("parametres");
  var parametres = convertStringToParametres(paramString);
  // On récupère le viewBox de la figure (X_0 Y_0 Width Height)
  var viewBox = getViewBoxFigure(diagrammeCirculaire.parentNode);
  // Si parametres.r n'existe pas alors on prend la moitié de la plus petite dimension du viewBox
  if (parametres.r == undefined) {
    parametres.r = Math.min(viewBox.width, viewBox.height) / 2;
  }
  // Si parametres.departAngle n'existe pas alors on prend 0
  if (parametres.departAngle == undefined) {
    parametres.departAngle = 0;
  }
  // Si coeffDistanceEtiquette n'existe pas alors on prend 0.7
  if (parametres.coeffDistanceEtiquette == undefined) {
    parametres.coeffDistanceEtiquette = 0.7;
  }
  // L'échelle en abscisse et en ordonnée par rapport au viewBox est viewBox.echelleX et viewBox.echelleY
  // Dans parametres on a parametres.r qui est le rayon du diagramme circulaire et parametres.departAngle qui est l'angle de départ et parametres.sens qui est le sens de rotation et parametres.afficherValeurs qui est un booléen et parametres.afficherNoms qui est un booléen et parametres.afficherPourcentages qui est un booléen et xOrigin et yOrigin qui sont les coordonnées du centre du diagramme circulaire
  // Si xOrigin et yOrigin n'existent pas alors on prend le centre du viewBox
  if (parametres.xOrigin == undefined) {
    parametres.xOrigin = viewBox.xO + viewBox.width / 2;
  }
  if (parametres.yOrigin == undefined) {
    parametres.yOrigin = viewBox.yO + viewBox.height / 2;
  }
  // Si parametres.sens n'existe pas alors on prend 0
  if (parametres.sens == undefined) {
    parametres.sens = 0;
  }
  // On calcule les angles de départ et d'arrivée de chaque secteur
  var angles = [];
  var somme = valeursSecteurs.reduce((a, b) => a + b, 0);
  var angleDepart = parametres.departAngle;
  var angleArrivee = angleDepart;
  for (var i = 0; i < valeursSecteurs.length; i++) {
    angleDepart = angleArrivee;
    angleArrivee = angleDepart + (valeursSecteurs[i] * 360) / somme;
    angles.push({
      nom: nomsSecteurs[i],
      valeur: valeursSecteurs[i],
      angleDepart: angleDepart,
      angleArrivee: angleArrivee,
    });
  }
  const couleurs = [
    "red",
    "green",
    "blue",
    "yellow",
    "orange",
    "purple",
    "pink",
    "brown",
    "grey",
    "black",
  ];
  // On construit les secteurs
  valeursSecteurs.forEach((valeur, index) => {
    var secteur = document.createElementNS("http://www.w3.org/2000/svg", "g");
    secteur.classList.add("secteur");
    // AJouter parametres à secteur
    var parametresSecteur = "";
    secteur.id = diagrammeCirculaire.id + "-" + index;
    parametresSecteur = "";
    parametresSecteur += "r:" + parametres.r;
    parametresSecteur += ",departAngle:" + angles[index].angleDepart;
    parametresSecteur +=
      ",angle:" + (angles[index].angleArrivee - angles[index].angleDepart);
    parametresSecteur += ",sens:" + parametres.sens;
    parametresSecteur += ",xOrigin:" + parametres.xOrigin;
    parametresSecteur += ",yOrigin:" + parametres.yOrigin;
    parametresSecteur += ",afficherValeurs:" + parametres.afficherValeurs;
    parametresSecteur += ",afficherNoms:" + parametres.afficherNoms;
    parametresSecteur +=
      ",afficherPourcentages:" + parametres.afficherPourcentages;
    parametresSecteur += ",style:" + diagrammeCirculaire.getAttribute("style");
    parametresSecteur +=
      ",coeffDistanceEtiquette:" + parametres.coeffDistanceEtiquette;
    // On ajoute le nom du secteur
    secteur.setAttribute("nom", angles[index].nom);
    secteur.setAttribute("parametres", parametresSecteur);
    // On ajoute la couleur
    secteur.setAttribute(
      "style",
      "fill-opacity:0.2;fill:" + couleurs[index % couleurs.length]
    );
    // On ajoute le secteur à la figure
    diagrammeCirculaire.parentNode.appendChild(secteur);
  });
};
var initialiserDiagrammeCirculaire = function (diagrammeCirculaire) {
  constructDiagrammeCirculaire(diagrammeCirculaire);
};
var initialiserDiagrammesCirculairesFigure = function (figure) {
  getDiagrammesCirculairesFigure(figure).forEach(function (
    diagrammeCirculaire
  ) {
    initialiserDiagrammeCirculaire(diagrammeCirculaire);
  });
};
var getNuagesPointsFigure = function (figure) {
  var nuagesPoints = document.querySelectorAll("g.nuagePoints");
  var nuagesPointsArray = Array.from(nuagesPoints);
  return nuagesPointsArray.filter(
    (nuagePoints) => nuagePoints.id.split("-")[0] == figure.id
  );
};
var constructNuagePoints = function (nuagePoints) {
  var viewBox = getViewBoxFigure(nuagePoints.parentNode);
  var paramString = nuagePoints.getAttribute("parametres");
  var parametres = convertStringToParametres(paramString);
  // Si dans parametres il y a un paramètre expression alors on construit le nuage de points à partir de l'expression
  var abscisses = [];
  var ordonnees = [];
  if (parametres.expression == undefined) {
    var data = nuagePoints.innerHTML.split("\n");
    // On supprime les lignes vides
    data = data.filter((ligne) => ligne != "");
    // On supprime les espaces en début et fin de ligne
    data = data.map((ligne) => ligne.trim());
    // On supprime les espaces en trop dans les lignes
    data = data.map((ligne) => ligne.replace(/ +/g, " "));
    // On supprime les espaces avant et après les ;
    data = data.map((ligne) => ligne.replace(/ *; */g, ";"));
    // On récupère les données dans un tableau
    data = data.map((ligne) => ligne.split(";"));
    // La première ligne contient les catégories des données
    data.shift();
    // La dernière ligne est à supprimer si elle est vide
    if (data[data.length - 1].length == 1 && data[data.length - 1][0] == "") {
      data.pop();
    }
    // La première colonne contient les abscisses des points
    abscisses = data.map((ligne) => parseFloat(ligne[0]));
    // L'autre colonne contient les ordonnées des points
    ordonnees = data.map((ligne) => parseFloat(ligne[1]));
  } else {
    // On calcule les coordonnées avec l'expression
    var { x, y } = calculCoordonneesPointsCourbe(
      parametres.expression,
      parametres
    );
    abscisses = x;
    ordonnees = y;
  }
  // L'objectif est de construire un + pour chaque point
  // Pour les axes, si aucune indication n'est donnée, on prend les valeurs min et max des abscisses et des ordonnées
  // Si parametres.xmin n'existe pas alors on prend la valeur minimale des abscisses
  if (parametres.xmin == undefined) {
    parametres.xmin = Math.min(...abscisses);
  }
  if (parametres.xBoxmin == undefined) {
    parametres.xBoxmin = parametres.xmin;
  }
  // Si parametres.xmax n'existe pas alors on prend la valeur maximale des abscisses
  if (parametres.xmax == undefined) {
    parametres.xmax = Math.max(...abscisses);
  }
  if (parametres.xBoxmax == undefined) {
    parametres.xBoxmax = parametres.xmax;
  }
  // Calcul de l'échelle en x
  var echelleX = viewBox.width / (parametres.xBoxmax - parametres.xBoxmin);
  // Si parametres.ymin n'existe pas alors on prend la valeur minimale des ordonnées
  if (parametres.ymin == undefined) {
    parametres.ymin = Math.min(...ordonnees);
  }
  if (parametres.yBoxmin == undefined) {
    parametres.yBoxmin = parametres.ymin;
  }
  // Si parametres.ymax n'existe pas alors on prend la valeur maximale des ordonnées
  if (parametres.ymax == undefined) {
    parametres.ymax = Math.max(...ordonnees);
  }
  if (parametres.yBoxmax == undefined) {
    parametres.yBoxmax = parametres.ymax;
  }
  // Calcul de l'échelle en y
  var echelleY = viewBox.height / (parametres.yBoxmax - parametres.yBoxmin);
  // Si parametres.xunit n'existe pas alors on prend 1
  if (parametres.xunit == undefined) {
    parametres.xunit = 1;
  }
  // Si parametres.yunit n'existe pas alors on prend 1
  if (parametres.yunit == undefined) {
    parametres.yunit = 1;
  }
  // Si parametres.afficherAxes n'existe pas alors on prend true
  if (parametres.afficherAxes == undefined) {
    parametres.afficherAxes = true;
  }
  // Si parametres.afficherGraduations n'existe pas alors on prend true
  if (parametres.afficherGraduations == undefined) {
    parametres.afficherGraduations = true;
  }
  //parametres = initialiserParametresCourbe(parametres);
  // On calcule les coordonnées des points en prenant en compte le changement d'échelle et le changement d'origine
  var points = [];
  for (var i = 0; i < abscisses.length; i++) {
    var [x, y] = changementEchelleRepere(
      abscisses[i],
      ordonnees[i],
      parametres.xBoxmin,
      parametres.yBoxmax,
      echelleX,
      echelleY,
      viewBox
    );
    points.push([x, y]);
  }
  // On construit les points
  points.forEach((point, index) => {
    var pointSVG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pointSVG.classList.add("point");
    // AJouter parametres à point
    var parametresPoint = "";
    pointSVG.id = nuagePoints.id + "-" + index;
    pointSVG.setAttribute("x", point[0]);
    pointSVG.setAttribute("y", point[1]);
    parametresPoint = "";
    parametresPoint += "forme:+,";
    parametresPoint += ",style:" + nuagePoints.getAttribute("style");
    pointSVG.setAttribute("parametres", parametresPoint);
    // On ajoute le point à la figure
    nuagePoints.parentNode.appendChild(pointSVG);
    initialiserPoint(pointSVG);
  });
  // On construit les axes
  var [xOrigin, yOrigin] = changementEchelleRepere(
    [0],
    [0],
    parametres.xBoxmin,
    parametres.yBoxmax,
    echelleX,
    echelleY,
    viewBox
  );

  if (parametres.afficherAxes) {
    var [axesSVG, graduationsSVG, uniteXSVG, uniteYSVG] = constructAxes(
      nuagePoints,
      xOrigin,
      yOrigin,
      echelleX,
      echelleY,
      viewBox,
      parametres
    );
  }
  // On ajoute les axes à la figure
  if (parametres.afficherAxes) {
    nuagePoints.parentNode.appendChild(axesSVG);
    nuagePoints.parentNode.appendChild(graduationsSVG);
    nuagePoints.parentNode.appendChild(uniteXSVG);
    nuagePoints.parentNode.appendChild(uniteYSVG);
  }
};
var initialiserNuagePoints = function (nuagePoints) {
  constructNuagePoints(nuagePoints);
};
var initialiserNuagesPointsFigure = function (figure) {
  getNuagesPointsFigure(figure).forEach(function (nuagePoints) {
    initialiserNuagePoints(nuagePoints);
  });
};
var getCarresFigure = function (figure) {
  var carres = document.querySelectorAll("g.carre");
  var carresArray = Array.from(carres);
  return carresArray.filter((carre) => carre.id.split("-")[0] == figure.id);
};
var constructCarre = function (carre) {
  // Le carré est déterminer par un point et un vecteur
  // On récupère le point
  var point = getElementLinkto(carre, 0);
  var P1 = new Point(...getCoordonneesPoint(point));
  // On récupère le vecteur
  var vecteur = getElementLinkto(carre, 1);
  var A = getElementLinkto(vecteur, 0);
  var B = getElementLinkto(vecteur, 1);
  var P2 = new Point(...getCoordonneesPoint(A));
  var P3 = new Point(...getCoordonneesPoint(B));
  var u = new Vecteur();
  u.setCoordonneesVecteur2Points(P2, P3);
  // On récupère les paramètres
  // var paramString = carre.getAttribute("parametres");
  // var parametres = convertStringToParametres(paramString);
  // On construit les trois points du carré qui manquent
  var P2 = P1.translation(u);
  var P3 = P2.translation(u.rotation(-Math.PI / 2));
  var P4 = P1.translation(u.rotation(-Math.PI / 2));
  // On ajoute les points
  var linktoCarre = "";
  for (var i = 0; i < 4; i++) {
    var pointSVG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pointSVG.classList.add("point");
    // Ajouter parametres à point
    pointSVG.id = carre.id + "-" + i;
    pointSVG.setAttribute("x", [P1, P2, P3, P4][i].x);
    pointSVG.setAttribute("y", [P1, P2, P3, P4][i].y);
    // On le rend invisible
    pointSVG.setAttribute("visibility", "hidden");
    // On ajoute le point à la figure
    carre.appendChild(pointSVG);
    // On initialise le point
    initialiserPoint(pointSVG);
    linktoCarre += pointSVG.id + " ";
  }
  linktoCarre = linktoCarre.slice(0, -1);
  var carreSVG = document.createElementNS("http://www.w3.org/2000/svg", "g");
  carreSVG.classList.add("polygone");
  carreSVG.setAttribute("linkto", linktoCarre);
  var style = carre.getAttribute("style");
  carreSVG.setAttribute("style", style);
  carre.appendChild(carreSVG);
  initialiserPolygone(carreSVG);
};
var initialiserCarre = function (carre) {
  constructCarre(carre);
};
var initialiserCarresFigure = function (figure) {
  getCarresFigure(figure).forEach(function (carre) {
    initialiserCarre(carre);
  });
};
var getPatternsFigure = function (figure) {
  var patterns = document.querySelectorAll("g.pattern");
  var patternsArray = Array.from(patterns);
  return patternsArray.filter(
    (pattern) => pattern.id.split("-")[0] == figure.id
  );
};
var constructPattern = function (pattern) {
  // On récupère dans le innerHTML les données sont au format csv : class&x&y&parametres
  var data = pattern.innerHTML.split("\n");
  // On supprime les lignes vides
  data = data.filter((ligne) => ligne != "");
  // On supprime les espaces en début et fin de ligne
  data = data.map((ligne) => ligne.trim());
  // On supprime les espaces en trop dans les lignes
  data = data.map((ligne) => ligne.replace(/ +/g, " "));
  // On supprime les espaces avant et après les ;
  data = data.map((ligne) => ligne.replace(/ *; */g, ";"));
  // On récupère les données dans un tableau
  data = data.map((ligne) => ligne.split(";"));
  // On supprime la dernière ligne si elle est vide
  if (data[data.length - 1].length == 1 && data[data.length - 1][0] == "") {
    data.pop();
  }
  // On récupère les coordonnées du point dans linkto
  var [x, y] = getCoordonneesPoint(getElementLinkto(pattern, 0));
  // Le reste du linkto est conservée
  var linkto = pattern.getAttribute("linkto").split(" ");
  linkto.shift();
  linkto = linkto.join(" ");
  // Pour chaque ligne
  data.forEach((ligne, index) => {
    // On récupère la classe
    var classe = ligne[0];
    // On récupère les coordonnées
    var x1 = parseFloat(ligne[1]);
    var y1 = parseFloat(ligne[2]);
    // On récupère les paramètres
    var paramString = ligne[3];
    // On construit le nouveau point
    var pointSVG = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pointSVG.classList.add("point");
    pointSVG.id = pattern.id + "-" + index;
    var name = pattern.id + "-" + index;
    pointSVG.setAttribute("name", name);
    pointSVG.setAttribute("x", x + x1);
    pointSVG.setAttribute("y", y + y1);
    pointSVG.setAttribute("visibility", "hidden");
    pattern.appendChild(pointSVG);
    initialiserPoint(pointSVG);
    // On construit l'élément
    var element = document.createElementNS("http://www.w3.org/2000/svg", "g");
    element.id = pattern.id + "-" + index;
    element.setAttribute("style", paramString.replace(",", ";"));
    element.setAttribute("linkto", name + " " + linkto);
    element.classList.add(classe);
    pattern.appendChild(element);
    initialiserElement(element);
  });
};
var initialiserPattern = function (pattern) {
  constructPattern(pattern);
};
var initialiserPatternsFigure = function (figure) {
  getPatternsFigure(figure).forEach(function (pattern) {
    initialiserPattern(pattern);
  });
};
var initialiserElement = function (element) {
  if (element.classList.contains("point")) {
    initialiserPoint(element);
  } else if (element.classList.contains("vecteur")) {
    initialiserVecteur(element);
  } else if (element.classList.contains("droite")) {
    initialiserDroite(element);
  } else if (element.classList.contains("demiDroite")) {
    initialiserDemiDroite(element);
  } else if (element.classList.contains("segment")) {
    initialiserSegment(element);
  } else if (element.classList.contains("polygone")) {
    initialiserPolygone(element);
  } else if (element.classList.contains("courbe")) {
    initialiserCourbe(element);
  } else if (element.classList.contains("secteur")) {
    initialiserSecteur(element);
  } else if (element.classList.contains("nuagePoints")) {
    initialiserNuagePoints(element);
  } else if (element.classList.contains("carre")) {
    initialiserCarre(element);
  } else if (element.classList.contains("pattern")) {
    initialiserPattern(element);
  }
};
var calculerEchelleRepere = function (repere) {
  var viewBox = getViewBoxFigure(repere.parentNode);
  var echelleX =
    viewBox.width / (repere.getAttribute("xmax") - repere.getAttribute("xmin"));
  var echelleY =
    viewBox.height /
    (repere.getAttribute("ymax") - repere.getAttribute("ymin"));
  repere.setAttribute("echellex", echelleX);
  repere.setAttribute("echelley", echelleY);
};
var getAxesFigure = function (figure) {
  var axes = document.querySelectorAll("g.axe");
  var axesArray = Array.from(axes);
  return axesArray.filter((axe) => axe.id.split("-")[0] == figure.id);
};
var getCoordonneesDansViewBox = function (repere, x, y) {
  var echelleX = repere.getAttribute("echellex");
  var echelleY = repere.getAttribute("echelley");
  var viewBox = getViewboxFigure(repere.parentNode);
  var x = math
    .evaluate(
      `${viewBox.xmin}+(${x} - ${repere.getAttribute("xmin")}) * ${echelleX}`
    )
    .valueOf();
  var y = math
    .evaluate(
      `${viewBox.ymin}+(-1*${y} + ${repere.getAttribute("ymax")}) * ${echelleY}`
    )
    .valueOf();
  return [x, y];
};
var createAxe = function (axe) {
  var repere = getElementLinkto(axe, 0);
  var axeSVG = document.createElementNS("http://www.w3.org/2000/svg", "path");
  if (axe.classList.contains("ordonnees")) {
    var ymin = getCoordonneesDansViewBox(
      repere,
      0,
      repere.getAttribute("ymin")
    )[1];
    var ymax = getCoordonneesDansViewBox(
      repere,
      0,
      repere.getAttribute("ymax")
    )[1];
    var xorigine = getCoordonneesDansViewBox(
      repere,
      repere.getAttribute("xorigine"),
      0
    )[0];
    var d = `M ${xorigine} ${ymin} V ${ymax}`;
  } else {
    // Par défaut l'axe des abscisses
    var xmin = getCoordonneesDansViewBox(
      repere,
      repere.getAttribute("xmin"),
      0
    )[0];
    var xmax = getCoordonneesDansViewBox(
      repere,
      repere.getAttribute("xmax"),
      0
    )[0];
    var yorigine = getCoordonneesDansViewBox(
      repere,
      0,
      repere.getAttribute("yorigine")
    )[1];
    var d = `M ${xmin} ${yorigine} H ${xmax}`;
  }
  axeSVG.setAttribute("d", d);
  axe.appendChild(axeSVG);
};
var initialiserAxe = function (axe) {
  createAxe(axe);
};
var initialiserAxesFigure = function (figure) {
  getAxesFigure(figure).forEach(function (axe) {
    initialiserAxe(axe);
  });
};
var getReperesFigure = function (figure) {
  var reperes = document.querySelectorAll("g.repere");
  var reperesArray = Array.from(reperes);
  return reperesArray.filter((repere) => repere.id.split("-")[0] == figure.id);
};
var getViewboxFigure = function (figure) {
  var viewbox = figure.getAttribute("viewBox").split(" ").map(Number);
  return {
    xmin: viewbox[0],
    ymin: viewbox[1],
    width: viewbox[2],
    height: viewbox[3],
  };
};
var initialiserRepere = function (repere) {
  calculerEchelleRepere(repere);
  // Ajouter une fonction qui donne les coordonnées d'un point dans le repère
  repere.getCoordonneesDansViewBox = function (x, y) {
    var viewBox = getViewboxFigure(this.parentNode);
    var x = math
      .evaluate(
        `${viewBox.xmin}+(${x} - ${this.getAttribute(
          "xmin"
        )}) * ${this.getAttribute("echellex")}`
      )
      .valueOf();
    var y = math
      .evaluate(
        `${viewBox.ymin}+(-1*${y} + ${this.getAttribute(
          "ymax"
        )}) * ${this.getAttribute("echelley")}`
      )
      .valueOf();
    return [x, y];
  };
};
var initialiserReperesFigure = function (figure) {
  getReperesFigure(figure).forEach(function (repere) {
    initialiserRepere(repere);
  });
};
var getGraduationsAxesFigure = function (figure) {
  var graduationsAxes = document.querySelectorAll("g.graduationsAxe");
  var graduationsAxesArray = Array.from(graduationsAxes);
  return graduationsAxesArray.filter(
    (graduationsAxe) => graduationsAxe.id.split("-")[0] == figure.id
  );
};
var createGraduationsAxe = function (graduationsAxe) {
  // <g name="repere1" class="repere" xmin="-10" ymin="-10" xmax="10" ymax ="10" xorigine="0" yorigine="0"></g>
  // <g name="AxeX" class="axe abscisses" linkto="repere1" stroke="black"></g>
  // <g name="AxeY" class="axe ordonnees" linkto="repere1" stroke="black"></g>
  // <g name="GraduationsX" class="graduationsAxe" linkto="AxeX" pas="1" stroke="black"></g>
  // <g name="GraduationsY" class="graduationsAxe" linkto="AxeY" pas="1" stroke="black"></g>
  var axe = getElementLinkto(graduationsAxe, 0);
  var repere = getElementLinkto(axe, 0);
  var graduationsAxeSVG = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "g"
  );
  // Calculer le nombre de graduations en fonction du pas
  var pas = parseFloat(graduationsAxe.getAttribute("pas"));
  var xmin = parseFloat(repere.getAttribute("xmin"));
  var xmax = parseFloat(repere.getAttribute("xmax"));
  var ymin = parseFloat(repere.getAttribute("ymin"));
  var ymax = parseFloat(repere.getAttribute("ymax"));
  var xorigine = parseFloat(repere.getAttribute("xorigine"));
  var yorigine = parseFloat(repere.getAttribute("yorigine"));
  var graduations = [];
  // Les graduations doivent tomber sur 0
  if (xmin < 0 && xmax > 0) {
    var x = 0;
    while (x < xmax) {
      graduations.push(x);
      x += pas;
    }
    var x = 0;
    while (x > xmin) {
      graduations.push(x);
      x -= pas;
    }
  } else if (xmin < 0 && xmax < 0) {
    var x = 0;
    while (x > xmin) {
      graduations.push(x);
      x -= pas;
    }
  } else if (xmin > 0 && xmax > 0) {
    var x = 0;
    while (x < xmax) {
      graduations.push(x);
      x += pas;
    }
  }
  if (ymin < 0 && ymax > 0) {
    var y = 0;
    while (y < ymax) {
      graduations.push(y);
      y += pas;
    }
    var y = 0;
    while (y > ymin) {
      graduations.push(y);
      y -= pas;
    }
  } else if (ymin < 0 && ymax < 0) {
    var y = 0;
    while (y > ymin) {
      graduations.push(y);
      y -= pas;
    }
  } else if (ymin > 0 && ymax > 0) {
    var y = 0;
    while (y < ymax) {
      graduations.push(y);
      y += pas;
    }
  }
  // On retire les graduations qui sont sur l'origine (xorigine ou yorigine)
  graduations = graduations.filter(
    (graduation) => graduation != xorigine && graduation != yorigine
  );
  // On construit les graduations
  graduations.forEach((graduation) => {
    var graduationSVG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    if (axe.classList.contains("ordonnees")) {
      var ymin = getCoordonneesDansViewBox(repere, 0, graduation)[1];
      var xorigine = getCoordonneesDansViewBox(
        repere,
        repere.getAttribute("xorigine"),
        0
      )[0];
      var d = `M ${xorigine - 2.5} ${ymin} H ${xorigine + 2.5}`;
    } else {
      // Par défaut l'axe des abscisses
      var xmin = getCoordonneesDansViewBox(repere, graduation, 0)[0];
      var yorigine = getCoordonneesDansViewBox(
        repere,
        0,
        repere.getAttribute("yorigine")
      )[1];
      var d = `M ${xmin} ${yorigine + 2.5} V ${yorigine - 2.5}`;
    }
    graduationSVG.setAttribute("d", d);
    graduationSVG.setAttribute("stroke", graduationsAxe.getAttribute("stroke"));
    graduationsAxeSVG.appendChild(graduationSVG);
  });
  graduationsAxe.appendChild(graduationsAxeSVG);
};
var initialiserGraduationsAxe = function (graduationsAxe) {
  createGraduationsAxe(graduationsAxe);
};
var initialiserGraduationsAxesFigure = function (figure) {
  getGraduationsAxesFigure(figure).forEach(function (graduationsAxe) {
    initialiserGraduationsAxe(graduationsAxe);
  });
};
var getCourbesRepresentativesFigure = function (figure) {
  var courbesRepresentatives = document.querySelectorAll(
    "g.courbeRepresentative"
  );
  var courbesRepresentativesArray = Array.from(courbesRepresentatives);
  return courbesRepresentativesArray.filter(
    (courbeRepresentative) => courbeRepresentative.id.split("-")[0] == figure.id
  );
};
var createCourbeRepresentative = function (courbeRepresentative) {
  // <g name="c1" class="courbeRepresentative" expression="x^2" pas="0.01" xmin="-2" xmax="3" linkto="repere1" stroke="red" stroke-width="0.5"></g>
  var repere = getElementLinkto(courbeRepresentative, 0);
  var xmin = parseFloat(courbeRepresentative.getAttribute("xmin"));
  var xmax = parseFloat(courbeRepresentative.getAttribute("xmax"));
  var pas = parseFloat(courbeRepresentative.getAttribute("pas"));
  var expression = courbeRepresentative.getAttribute("expression");
  var points = [];
  let n = (xmax - xmin) / pas; // Calcule le nombre total d'itérations
  for (let i = 0; i <= n; i++) {
      let x = xmin + i * pas;
      let y = math.evaluate(expression, { x: x });
      points.push([x, y]);
  }

  // Utilisez D3 pour générer un chemin lissé
  var lineGenerator = d3
    .line()
    .x((d) => getCoordonneesDansViewBox(repere, d[0], d[1])[0])
    .y((d) => getCoordonneesDansViewBox(repere, d[0], d[1])[1])
    .curve(d3.curveBasis);

  var d = lineGenerator(points);

  d3.select("#" + courbeRepresentative.id)
    .append("path")
    .attr("d", d)
    .attr("fill", "none")
    .attr("stroke", courbeRepresentative.getAttribute("stroke"));
};
var initialiserCourbeRepresentative = function (courbeRepresentative) {
  createCourbeRepresentative(courbeRepresentative);
};
var initialiserCourbesRepresentativesFigure = function (figure) {
  getCourbesRepresentativesFigure(figure).forEach(function (
    courbeRepresentative
  ) {
    initialiserCourbeRepresentative(courbeRepresentative);
  });
};
var getpathsPointsControlsFigure = function (figure) {
  var pathsPointsControls = document.querySelectorAll("g.pathPointsControls");
  var pathsPointsControlsArray = Array.from(pathsPointsControls);
  return pathsPointsControlsArray.filter(
    (pathPointsControls) => pathPointsControls.id.split("-")[0] == figure.id
  );
};
var getElementsLinkto = function (element) {
  var linkto = element.getAttribute("linkto").split(" ");
  var elementsLinkto = [];
  linkto.forEach((id) => {
    elementsLinkto.push(element.parentNode.querySelector("#" + id));
  });
  return elementsLinkto;
};
var createpathPointsControls = function (pathPointsControls) {
  // <g name="c2" class="pathPointsControls" controls="C:0 A:1" linkto="A B C D" stroke="green" stroke-width="0.5" fill="transparent"></g>
  var pentes = {};
  if (pathPointsControls.getAttribute("controls") != undefined) {
    var controlsAttribute = pathPointsControls
      .getAttribute("controls")
      .split(" ");
    controlsAttribute.forEach((control) => {
      var [nom, pente] = control.split(":");
      pentes[nom] = -pente;
    });
  }
  var linkto = pathPointsControls.getAttribute("linkto").split(" ");
  var points = [];
  for (var i = 0; i < linkto.length; i++) {
    var point = pathPointsControls.parentNode.querySelector("#" + linkto[i]);
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
  var pathPointsControlsSVG = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "path"
  );
  pathPointsControlsSVG.setAttribute("d", d);
  pathPointsControls.appendChild(pathPointsControlsSVG);
};
var initialiserpathPointsControls = function (pathPointsControls) {
  createpathPointsControls(pathPointsControls);
};
var initialiserpathsPointsControlsFigure = function (figure) {
  getpathsPointsControlsFigure(figure).forEach(function (pathPointsControls) {
    initialiserpathPointsControls(pathPointsControls);
  });
};
var getIntersectionPathsFigure = function (figure) {
  var intersectionPaths = document.querySelectorAll("g.intersections");
  var intersectionPathsArray = Array.from(intersectionPaths);
  return intersectionPathsArray.filter(
    (intersectionPath) => intersectionPath.id.split("-")[0] == figure.id
  );
};
var createIntersectionPath = function (intersectionPath) {
  // Obtenez vos éléments path dans linkto
  var linkto = intersectionPath.getAttribute("linkto").split(" ");
  var path1 = intersectionPath.parentNode.querySelector("#" + linkto[0]).querySelector("path");
  var path2 = intersectionPath.parentNode.querySelector("#" + linkto[1]).querySelector("path");
  // Vérifier s'il y a un paramètre de choix des intersections
  var indices = intersectionPath.getAttribute("indices");
  if (indices != undefined) {
    indices = indices.split(" ");
    indices = indices.map((indice) => parseInt(indice));
  }

  // Calculez les intersections
  const pathShape1 = shape("path", { d: path1.getAttribute("d") });
  const pathShape2 = shape("path", { d: path2.getAttribute("d") });
  const result = intersect(pathShape1, pathShape2);

  // Créer les points d'intersections
  result.points.forEach((point, index) => {
    if (indices == undefined || indices.includes(index)) {
      var pointSVG = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      );
      pointSVG.classList.add("point");
      pointSVG.id = intersectionPath.id + "-" + index;
      pointSVG.setAttribute("x", point.x);
      pointSVG.setAttribute("y", point.y);
      intersectionPath.appendChild(pointSVG);
      initialiserPoint(pointSVG);
    }
  });
};
var initialiserIntersectionPath = function (intersectionPath) {
  createIntersectionPath(intersectionPath);
};
var initilialiserIntersectionPathsFigure = function (figure) {
  getIntersectionPathsFigure(figure).forEach(function (intersectionPath) {
    initialiserIntersectionPath(intersectionPath);
  }
  );
};
var initialiserFigure = function (figure) {
  addQuadrillage(figure);
  addBoutonQuadrillage(figure);
  addBoutonPleinEcran(figure);
  initialiserReperesFigure(figure);
  initialiserPointsFigure(figure);
  initialiserVecteursFigure(figure);
  initialiserDroitesFigure(figure);
  initialiserDemiDroitesFigure(figure);
  initialiserSegmentsFigure(figure);
  initialiserPolygonesFigure(figure);
  initialiserGraduationsFigure(figure);
  initialiserCourbesFigure(figure);
  initialiserDiagrammesCirculairesFigure(figure);
  initialiserSecteursFigure(figure);
  initialiserNuagesPointsFigure(figure);
  initialiserCarresFigure(figure);
  initialiserPatternsFigure(figure);
  initialiserAxesFigure(figure);
  initialiserGraduationsAxesFigure(figure);
  initialiserCourbesRepresentativesFigure(figure);
  initialiserpathsPointsControlsFigure(figure);
  initilialiserIntersectionPathsFigure(figure);
};
var getCoordonneesPoint = function (point) {
  var data = point
    .getAttribute("transform")
    .split("translate(")[1]
    .split(")")[0]
    .split(",");
  // var x = parseFloat(data[0]);
  // var y = parseFloat(data[1]);
  var x = math.evaluate(data[0]).valueOf();
  var y = math.evaluate(data[1]).valueOf();
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
  var scale = 1;
  if (vecteur.hasAttribute("scale")) {
    scale = parseFloat(vecteur.getAttribute("scale"));
  }
  var path = vecteur.querySelector("path.headVecteur");
  path.setAttribute(
    "transform",
    "translate(" + B.x + "," + B.y + ") rotate(" + -alpha + ") scale(" + scale + ")"
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
function closestPointOnPath(pathNode, point) {
  const totalLength = pathNode.getTotalLength();
  let precision = 8;
  let best;
  let bestLength;
  let bestDistance = Infinity;

  for (
    let scan, scanLength = 0, scanDistance;
    scanLength <= totalLength;
    scanLength += precision
  ) {
    if (
      (scanDistance = distance2(
        (scan = pathNode.getPointAtLength(scanLength))
      )) < bestDistance
    ) {
      (best = scan), (bestLength = scanLength), (bestDistance = scanDistance);
    }
  }

  precision /= 2;
  while (precision > 0.5) {
    let before, after, beforeLength, afterLength, beforeDistance, afterDistance;
    if (
      (beforeLength = bestLength - precision) >= 0 &&
      (beforeDistance = distance2(
        (before = pathNode.getPointAtLength(beforeLength))
      )) < bestDistance
    ) {
      (best = before),
        (bestLength = beforeLength),
        (bestDistance = beforeDistance);
    } else if (
      (afterLength = bestLength + precision) <= totalLength &&
      (afterDistance = distance2(
        (after = pathNode.getPointAtLength(afterLength))
      )) < bestDistance
    ) {
      (best = after),
        (bestLength = afterLength),
        (bestDistance = afterDistance);
    } else {
      precision /= 2;
    }
  }

  function distance2(p) {
    const dx = p.x - point[0];
    return dx * dx;
  }

  return best;
}
var interactivity = function (figure) {
  d3.selectAll("g.point.draggable:not(.onpath)").call(
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
  d3.selectAll("g.point.draggable.onpath").call(
    d3
      .drag()
      .on("drag", function () {
        const pathNode = getElementLinkto(this, 0).querySelector("path");
        const point = closestPointOnPath(pathNode, [d3.event.x, d3.event.y]);
        d3.select(this).attr("cx", point.x).attr("cy", point.y);
        setHightlightPointOn(this);
        setCoordonneesPoint(this, point.x, point.y);
        actualiserCoordonneesPoint(this);
      })
      .on("end", function () {
        setHightlightPointOff(this);
      })
  );
};
var initialiserPoint = function (point) {
  initialiserPointTransform(point);
  constructLabelPoint(point);
  constructCrossPoint(point);
  constructHightlightPoint(point);
  constructSelectPoint(point);
  automaticHideCrossPoint(point);
  initialiserDataPoint(point);
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
