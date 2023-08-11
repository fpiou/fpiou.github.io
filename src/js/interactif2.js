// Version: 1.0.0

///////////////////////
////// Remarques //////
///////////////////////
// L'attribut "name" ne doit pas comporter de tiret - (voir automaticHideCrossPoint)). Faut-il ajouter un attribut figureId pour identifier les points autrement ?
// La class "selectionne" est utilisée pour afficher ou non le disque de surlignage (est-ce une bonne solution ?) : "unselected" et "selected" peuvent-elle remplacer cette classe (fonctionnement différent) ?
// On reconnait un point draggable par le fait qu'il possède un petit cercle sélectionnerur (class="selectionneur")
// Les points liés sont ceux qui ont un attribu linkto qui contient l'id du point déplacé
// Les attributs x et y initialisent les coordonnées du point
// Les coordonnées x et y sont données par l'attribut transform="translate(x,y)"
// Est-il possible que si on déplace un point dont un point est lié avec un rapport k, ce rapport ne change pas si on le déplace ?
import { add } from 'lodash';
import { Point, Vecteur, Segment } from './class2.js'

// Liste des codages possibles
var codagesSegment = [
    "M-5,-5 L0,5 M0,-5 L5,5",
    "M-2.5,-5 L2.5,5",
    "M-5,-5 L-1,5 M-1,-5 L3,5 M3,-5 L7,5",
    "M-5,-5 L-2,5 M-2,-5 L1,5 M1,-5 L4,5 M4,-5 L7,5"
]

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
            }
            // On sélectionne maintenant tous qui n'ont pas la class name
            var ids = figures[i].querySelector("svg").querySelectorAll("*:not([name])");
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
                        ids[j].setAttribute("id", id + "-" + ids[j].getAttribute("linkto") + "-label");
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
}
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
}
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
}
var addListenerButtonPleinEcran = function (figure) {
    var bouton = figure.querySelector(".bouton-pleinecran");
    bouton.addEventListener("click", function () {
        if (!document.fullscreenElement) {
            if (figure.requestFullscreen) {
                figure.requestFullscreen();
            } else if (figure.webkitRequestFullscreen) { /* Safari */
                figure.webkitRequestFullscreen();
            } else if (figure.msRequestFullscreen) { /* IE11 */
                figure.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullScreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullScreen();
            }
        }
    });
}
var addBoutonPleinEcran = function (figure) {
    if (figure.querySelector(".bouton-pleinecran") == null) {
        var bouton = document.createElement("button");
        bouton.classList.add("bouton-pleinecran");
        bouton.innerHTML = "Plein écran";
        figure.appendChild(bouton);
    }
}
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
}
var getLinkto = function (objet) {
    return objet.getAttribute("linkto").split(" ");
}
var getElementLinkto = function (objet, n) {
    return document.getElementById(getLinkto(objet)[n]);
}
var constructLabelPoint = function (point) {
    if (point.classList.contains("labeled")) {
        var idfigure = point.id.split("-")[0];
        var labels = document.getElementById(idfigure).querySelectorAll("g.label");
        var labelLinkto = Array.from(labels).filter(
            label => label.getAttribute("linkto") == point.id
        );
        var foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        if (labelLinkto.length == 0) {
            foreignObject.setAttribute("x", "0");
            foreignObject.setAttribute("y", "0");
            foreignObject.setAttribute("text-anchor", "start");
            foreignObject.setAttribute("width", "20");
            foreignObject.setAttribute("height", "20");
            foreignObject.setAttribute("style", point.getAttribute("style"));
            foreignObject.innerHTML = katex.renderToString(point.getAttribute("name"), { output: "mathml" });
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
                foreignObject.setAttribute("text-anchor", label.getAttribute("text-anchor"));
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
            foreignObject.innerHTML = katex.renderToString(label.innerHTML, { output: "mathml" });
        }
        foreignObject.style.userSelect = "none";
        point.appendChild(foreignObject);
    }
}
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
}
var automaticHideCrossPoint = function (point) {
    var idfigure = point.id.split("-")[0];
    getPolygonesFigure(idfigure).forEach(function (polygone) {
        var linkto = getLinkto(polygone);
        if (linkto.includes(point.id)) {
            point.querySelector("path.crosspoint").setAttribute("stroke", "transparent");
        }
    });
}
var constructHightlightPoint = function (point) {
    if (point.classList.contains("draggable")) {
        var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("class", "selectionne");
        circle.setAttribute("cx", "0");
        circle.setAttribute("cy", "0");
        circle.setAttribute("fill", "transparent");
        circle.setAttribute("stroke", "transparent");
        circle.setAttribute("fill-opacity", "0.2");
        circle.setAttribute("r", "20");
        circle.style.userSelect = "none";
        point.appendChild(circle);
    }
}
var constructSelectPoint = function (point) {
    if (point.classList.contains("draggable")) {
        var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("class", "selectionneur");
        circle.setAttribute("cx", "0");
        circle.setAttribute("cy", "0");
        circle.setAttribute("fill", "transparent");
        circle.setAttribute("r", "4");
        point.appendChild(circle);
    }
}
var getPointsFigure = function (figure) {
    var points = document.querySelectorAll("g.point");
    var pointsArray = Array.from(points);
    return pointsArray.filter(
        point => point.id.split("-")[0] == figure.id
    );
}
var initialiserPointTransform = function (point) {
    var x = 0
    var y = 0
    if (point.hasAttribute("x")) {
        x = point.getAttribute("x");
    }
    if (point.hasAttribute("y")) {
        y = point.getAttribute("y");
    }
    point.setAttribute("transform", "translate(" + x + "," + y + ")");
}
var getPolygonesFigure = function (idfigure) {
    var polygones = document.querySelectorAll("g.polygone");
    var polygonesArray = Array.from(polygones);
    return polygonesArray.filter(
        polygone => polygone.id.split("-")[0] == idfigure
    );
}
var getVecteursFigure = function (figure) {
    var vecteurs = document.querySelectorAll("g.vecteur");
    var vecteursArray = Array.from(vecteurs);
    return vecteursArray.filter(
        vecteur => vecteur.id.split("-")[0] == figure.id
    );
}
var constructHeadVecteur = function (vecteur) {
    var A = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 0)));
    var B = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 1)));
    var AB = new Segment(A, B);
    var alpha = AB.angle() / Math.PI * 180;
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M-7,-2 L-0,-0 L-7,2");
    // Déterminer les coordonnées relatives de B par rappport à A
    path.setAttribute("transform", "translate(" + B.x + "," + B.y + ") rotate(" + -alpha + ")");
    path.setAttribute("fill", "black");
    path.setAttribute("stroke-width", "0.5");
    path.classList.add("headVecteur");
    path.style.userSelect = "none";
    setStroke(vecteur, path);
    // Ajouter le style du vecteur au path
    path.setAttribute("style", vecteur.getAttribute("style"));
    // Si dans le style il y a un stroke alors on ajoute la même couleur au fill du path
    if (vecteur.getAttribute("style")!=null && vecteur.getAttribute("style").includes("stroke")) {
        // Récupérer le stroke du style
        var stroke = vecteur.getAttribute("style").split(";").filter(
            style => style.includes("stroke")
        )[0];
        // Récupérer la couleur du stroke
        var color = stroke.split(":")[1];
        path.setAttribute("fill", color);
    }
    vecteur.appendChild(path);
}
var constructLabelVecteur = function (vecteur) {
    var A = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 0)));
    var B = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 1)));
    var AB = new Segment(A, B);
    var I = AB.milieu();
    var foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
    foreignObject.setAttribute("x", I.x);
    foreignObject.setAttribute("y", I.y);
    foreignObject.setAttribute("width", "20");
    foreignObject.setAttribute("height", "20");
    foreignObject.setAttribute("style", vecteur.getAttribute("style"));
    // Ajouter le style du vecteur
    foreignObject.setAttribute("style", vecteur.getAttribute("style"));
    foreignObject.innerHTML = katex.renderToString("\\overrightarrow{" + vecteur.getAttribute("name") + "}", { output: "mathml" });
    foreignObject.style.userSelect = "none";
    vecteur.appendChild(foreignObject);
}

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
}
var initialiserVecteur = function (vecteur) {
    constructVecteur(vecteur);
}
var initialiserVecteursFigure = function (figure) {
    getVecteursFigure(figure).forEach(function (vecteur) {
        initialiserVecteur(vecteur);
    });
}
var getDroitesFigure = function (figure) {
    var droites = document.querySelectorAll("g.droite");
    var droitesArray = Array.from(droites);
    return droitesArray.filter(
        droite => droite.id.split("-")[0] == figure.id
    );
}
var determinerExtremitesDroite = function (droite) {
    var A = new Point(...getCoordonneesPoint(getElementLinkto(droite, 0)));
    var B = new Point(...getCoordonneesPoint(getElementLinkto(droite, 1)));
    var AB = new Vecteur();
    AB.setCoordonneesVecteur2Points(A, B);
    var u = AB.normalisation();
    var E1 = A.translation(u.multiplicationVecteur(-200));
    var E2 = A.translation(u.multiplicationVecteur(200));
    return [E1, E2];
}
var setStroke = function (objet, path) {
    var stroke = objet.hasAttribute("stroke") ? objet.getAttribute("stroke") : "black";
    path.setAttribute("stroke", stroke);
    var strokewidth = objet.hasAttribute("stroke-width") ? objet.getAttribute("stroke-width") : "0.5";
    path.setAttribute("stroke-width", strokewidth);
    // Si c'est un vecteur il faut que le fill soit le même que le srtoke du vecteur
    if (objet.classList.contains("vecteur")) {
        path.setAttribute("fill", stroke);
    }
}
var constructDroite = function (droite) {
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var extremites = determinerExtremitesDroite(droite);
    var E1 = extremites[0];
    var E2 = extremites[1];
    path.setAttribute("d", "M" + E1.x + "," + E1.y + " L" + E2.x + "," + E2.y);
    setStroke(droite, path);
    droite.appendChild(path);
}
var initialiserDroite = function (droite) {
    constructDroite(droite);
}
var initialiserDroitesFigure = function (figure) {
    getDroitesFigure(figure).forEach(function (droite) {
        initialiserDroite(droite);
    });
}
var getDemidroitesFigure = function (figure) {
    var demidroites = document.querySelectorAll("g.demidroite");
    var demidroitesArray = Array.from(demidroites);
    return demidroitesArray.filter(
        demidroite => demidroite.id.split("-")[0] == figure.id
    );
}
var constructDemiDroite = function (demidroite) {
    var A = new Point(...getCoordonneesPoint(getElementLinkto(demidroite, 0)));
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var extremites = determinerExtremitesDroite(demidroite);
    var E = extremites[1];
    path.setAttribute("d", "M" + A.x + "," + A.y + " L" + E.x + "," + E.y);
    setStroke(demidroite, path);
    demidroite.appendChild(path);
}
var initialiserDemiDroite = function (demidroite) {
    constructDemiDroite(demidroite);
}
var initialiserDemiDroitesFigure = function (figure) {
    getDemidroitesFigure(figure).forEach(function (demidroite) {
        initialiserDemiDroite(demidroite);
    });
}
var getSegmentsFigure = function (figure) {
    var segments = document.querySelectorAll("g.segment");
    var segmentsArray = Array.from(segments);
    return segmentsArray.filter(
        segment => segment.id.split("-")[0] == figure.id
    );
}
var constructCodageSegment = function (segment, codage) {
    var A = new Point(...getCoordonneesPoint(getElementLinkto(segment, 0)));
    var B = new Point(...getCoordonneesPoint(getElementLinkto(segment, 1)));
    var AB = new Segment(A, B);
    var I = AB.milieu();
    var alpha = AB.angle() / Math.PI * 180;
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "transparent");
    path.setAttribute("stroke", "black");
    path.setAttribute("stroke-width", "0.8");
    path.setAttribute("transform", "translate(" + I.x + "," + I.y + ") rotate(" + alpha + ")");
    path.setAttribute("d", codage);
    path.style.userSelect = "none";
    path.classList.add("codageSegment");
    segment.appendChild(path);
}
var isCodageSegment = function (segment) {
    return segment.classList.contains("codage");
}
var isSegmentLie = function (segment) {
    // Dans linkto, on a l'id des deux points et éventuellement l'id d'un segment lié par le codage
    var linkto = getLinkto(segment);
    return linkto.length == 3;
}
var getSegmentLie = function (segment) {
    var linkto = getLinkto(segment);
    return document.getElementById(linkto[2]);
}
var getCodageSegmentLie = function (segment) {
    var linkto = getLinkto(segment);
    return getSegmentLie(segment).querySelector("path.codageSegment").getAttribute("d");
}
var listeCodagesFigure = function (objet) {
    var idfigure = objet.id.split("-")[0];
    var codages = document.querySelectorAll("g.codage");
    var codagesArray = Array.from(codages);
    var codagesFigure = codagesArray.filter(
        codage => codage.id.split("-")[0] == idfigure
    ).filter(
        codage => codage.querySelector("path.codageSegment") != null
    ).map(
        // On récupère l'attribut d
        codage => codage.querySelector("path.codageSegment").getAttribute("d")
    );
    return codagesFigure;
}
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
        return ""
    }
}
var constructSegment = function (segment) {
    var A = getElementLinkto(segment, 0);
    var B = getElementLinkto(segment, 1);
    // Construire un élément path
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    // A est l'origine et B l'extrémité du path
    path.setAttribute("d", "M" + getCoordonneesPoint(A).join(",") + " L" + getCoordonneesPoint(B).join(","));
    setStroke(segment, path);
    segment.appendChild(path);
    if (isCodageSegment(segment)) {
        if (isSegmentLie(segment)) {
            constructCodageSegment(segment, getCodageSegmentLie(segment));
        } else {
            constructCodageSegment(segment, nouveauCodageSegment(segment));
        }
    }
}
var initialiserSegment = function (segment) {
    constructSegment(segment);
}
var initialiserSegmentsFigure = function (figure) {
    getSegmentsFigure(figure).forEach(function (segment) {
        initialiserSegment(segment);
    });
}
var constructPolygone = function (polygone) {
    var points = getLinkto(polygone).map(
        point => new Point(...getCoordonneesPoint(document.getElementById(point)))
    ).map(point => [point.x, point.y].join(','));
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var d = "M" + points.join(" L") + " Z";
    path.setAttribute("d", d);
    setStroke(polygone, path);
    path.setAttribute("style", polygone.getAttribute("style"));
    polygone.appendChild(path);
}
var initialiserPolygone = function (polygone) {
    constructPolygone(polygone);
}
var initialiserPolygonesFigure = function (figure) {
    getPolygonesFigure(figure.id).forEach(function (polygone) {
        initialiserPolygone(polygone);
    });
}
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
}
var getCoordonneesPoint = function (point) {
    var data = point.getAttribute("transform").split("translate(")[1].split(")")[0].split(",");
    var x = parseFloat(data[0]);
    var y = parseFloat(data[1]);
    return [x, y];
}
var setCoordonneesPoint = function (point, x, y) {
    point.setAttribute("transform", "translate(" + x + "," + y + ")");
}
var actualiserCoordonneesPointClassTranslation = function (point) {
    if (point.classList.contains("translation")) {
        // M est l'image de P par la translation de vecteur kAB
        var A = getElementLinkto(point, 0)
        var B = getElementLinkto(point, 1)
        var P = getElementLinkto(point, 2)
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
}
var actualiserCoordonneesPointClassDilatation = function (point) {
    if (point.classList.contains("dilatation")) {
        // H est le projeté de P selon la direction formant un angle alpha avec le vecteur AB
        // M est l'image de P par l'homothétie de rapport k et de centre H 
        var A = getElementLinkto(point, 0)
        var B = getElementLinkto(point, 1)
        var P = getElementLinkto(point, 2)
        let P1 = new Point(...getCoordonneesPoint(A));
        let P2 = new Point(...getCoordonneesPoint(B));
        let P3 = new Point(...getCoordonneesPoint(P));
        var data = point.getAttribute("data").split(" ");
        var k = parseFloat(data[1]);
        var alpha = parseFloat(data[0]) / 180 * Math.PI;
        var H = P3.projectionAngle(P1, P2, alpha);
        var M = P3.homothetie(H, k)
        setCoordonneesPoint(point, M.x, M.y)
    }
}
var actualiserCoordonneesPointClassRotation = function (point) {
    if (point.classList.contains("rotation")) {
        var A = new Point(...getCoordonneesPoint(getElementLinkto(point, 0)));
        var data = point.getAttribute("data").split(" ");
        var alpha = parseFloat(data[0]) / 180 * Math.PI;
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
        setCoordonneesPoint(point, M.x, M.y)
    }
}
var actualiserCoordonneesPointsLies = function (point) {
    // Récursivité pour atteindre tous les points liés
    var idPoint = point.getAttribute("id");
    var points = document.querySelectorAll("g.point[linkto*='" + idPoint + "']");
    for (var i = 0; i < points.length; i++) {
        actualiserCoordonneesPoint(points[i]);
    }
}
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
}
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
}
var actualiserVecteur = function (vecteur) {
    var A = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 0)));
    var B = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 1)));
    var path = vecteur.querySelector("path");
    path.setAttribute("d", "M" + A.x + "," + A.y + " L" + B.x + "," + B.y);
    actualiserHeadVecteur(vecteur);
    actualiserLabelVecteur(vecteur);
}
var actualiserCoordonneesVecteursLies = function (point) {
    var idPoint = point.getAttribute("id");
    var vecteurs = document.querySelectorAll("g.vecteur[linkto*='" + idPoint + "']");
    for (var i = 0; i < vecteurs.length; i++) {
        actualiserVecteur(vecteurs[i]);
    }
}
var actualiserDroite = function (droite) {
    var path = droite.querySelector("path");
    var extremites = determinerExtremitesDroite(droite);
    var E1 = extremites[0];
    var E2 = extremites[1];
    path.setAttribute("d", "M" + E1.x + "," + E1.y + " L" + E2.x + "," + E2.y);
}
var actualiserCoordonneesDroitesLies = function (point) {
    var idPoint = point.getAttribute("id");
    var droites = document.querySelectorAll("g.droite[linkto*='" + idPoint + "']");
    for (var i = 0; i < droites.length; i++) {
        actualiserDroite(droites[i]);
    }
}
var actualiserDemiDroite = function (demidroite) {
    var path = demidroite.querySelector("path");
    var extremites = determinerExtremitesDroite(demidroite);
    var E = extremites[1];
    var A = getElementLinkto(demidroite, 0);
    path.setAttribute("d", "M" + getCoordonneesPoint(A).join(",") + " L" + E.x + "," + E.y);
}
var actualiserCoordonneesDemiDroitesLies = function (point) {
    var idPoint = point.getAttribute("id");
    var demidroites = document.querySelectorAll("g.demidroite[linkto*='" + idPoint + "']");
    for (var i = 0; i < demidroites.length; i++) {
        actualiserDemiDroite(demidroites[i]);
    }
}
var actualiserCodageSegment = function (segment) {
    var A = new Point(...getCoordonneesPoint(getElementLinkto(segment, 0)));
    var B = new Point(...getCoordonneesPoint(getElementLinkto(segment, 1)));
    var AB = new Segment(A, B);
    var I = AB.milieu();
    var alpha = AB.angle() / Math.PI * 180;
    var path = segment.querySelector("path.codageSegment");
    path.setAttribute("transform", "translate(" + I.x + "," + I.y + ") rotate(" + -alpha + ")");
}
var actualiserHeadVecteur = function (vecteur) {
    var A = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 0)));
    var B = new Point(...getCoordonneesPoint(getElementLinkto(vecteur, 1)));
    var AB = new Segment(A, B);
    var alpha = AB.angle() / Math.PI * 180;
    var path = vecteur.querySelector("path.headVecteur");
    path.setAttribute("transform", "translate(" + B.x + "," + B.y + ") rotate(" + -alpha + ")");
}
var actualiserSegment = function (segment) {
    var A = getElementLinkto(segment, 0);
    var B = getElementLinkto(segment, 1);
    var path = segment.querySelector("path");
    path.setAttribute("d", "M" + getCoordonneesPoint(A).join(",") + " L" + getCoordonneesPoint(B).join(","));
    if (isCodageSegment(segment)) {
        actualiserCodageSegment(segment);
    }
}
var actualiserCoordonneesSegmentsLies = function (point) {
    var idPoint = point.getAttribute("id");
    var segments = document.querySelectorAll("g.segment[linkto*='" + idPoint + "']");
    for (var i = 0; i < segments.length; i++) {
        actualiserSegment(segments[i]);
    }
}
var actualiserPolygone = function (polygone) {
    var points = getLinkto(polygone).map(
        point => new Point(...getCoordonneesPoint(document.getElementById(point)))
    ).map(point => [point.x, point.y].join(','));
    var path = polygone.querySelector("path");
    var d = "M" + points.join(" L") + " Z";
    path.setAttribute("d", d);
}
var actualiserCoordonneesPolygonesLies = function (point) {
    var idPoint = point.getAttribute("id");
    var polygones = document.querySelectorAll("g.polygone[linkto*='" + idPoint + "']");
    for (var i = 0; i < polygones.length; i++) {
        actualiserPolygone(polygones[i]);
    }
}
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
}
var actualiserPointsFigure = function (figure) {
    getPointsFigure(figure).forEach(function (point) {
        actualiserCoordonneesPoint(point);
    });
}
var setHightlightPointOn = function (point) {
    d3.select(point).select("circle.selectionne").attr("fill", "orange");
}
var setHightlightPointOff = function (point) {
    d3.select(point).select("circle.selectionne").attr("fill", "transparent");
}
var controlerCoordonneesPoint = function (point, figure) {
    let x = 0
    let y = 0
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
            var alpha = u.angle(v) / Math.PI * 180;
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
                var alpha = u.angle(v) / Math.PI * 180;
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
                var alpha = parseFloat(point.getAttribute("data").split(" ")[0]) / 180 * Math.PI;
                var P1 = B.rotation(A, alpha);
                var N = M.projectionOrthogonale(A, P1);
                var k = signe * A.distance(N) / A.distance(B);
                // On veut la obtenir la distance signée en utilisant le produit scalaire de u et v
                point.setAttribute("data", (alpha / Math.PI * 180).toString() + " " + k.toString());
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
            var alpha = u.angle(v) / Math.PI * 180;
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
        if (figure.querySelector("#" + figure.id + "-quadrillage").style.display == "block") {
            x = Math.round(x / 10) * 10;
            y = Math.round(y / 10) * 10;
        }
    }
    return [x, y];
}
var interactivity = function (figure) {
    d3.selectAll("g.point.draggable").call(d3.drag().on("drag", function () {
        if (d3.event.x > 0 && d3.event.x < 200 && d3.event.y > 0 && d3.event.y < 200) {
            setHightlightPointOn(this);
            setCoordonneesPoint(this,
                ...controlerCoordonneesPoint(this, figure)
            );
            actualiserCoordonneesPoint(this);
        }
    }).on("end", function () {
        setHightlightPointOff(this);
    }));
}
var initialiserPointsFigure = function (figure) {
    getPointsFigure(figure).filter(
        point => point.id.split("-")[0] == figure.id
    ).forEach(function (point) {
        initialiserPointTransform(point);
        constructLabelPoint(point);
        constructCrossPoint(point);
        //constructHightlightPoint(point);
        constructSelectPoint(point);
        automaticHideCrossPoint(point);
        initialiserDataPoint(point);
    });
}
var draggablesAuPremierPlan = function (figure) {
    var svg = figure.querySelector("svg");
    var draggable = figure.querySelectorAll(".draggable");
    for (var i = 0; i < draggable.length; i++) {
        svg.appendChild(draggable[i]);
    }
}
export var addListenerInteractivite = function (figure) {
    addListenerButtonQuadrillage(figure);
    addListenerButtonPleinEcran(figure);
    figure.addEventListener("mouseenter", function () {
        interactivity(this);
    });
}

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
}