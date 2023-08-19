/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
/*!*****************************!*\
  !*** ./src/ts/geometrie.ts ***!
  \*****************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Cercle: () => (/* binding */ Cercle),
/* harmony export */   Droite: () => (/* binding */ Droite),
/* harmony export */   Point: () => (/* binding */ Point),
/* harmony export */   Points: () => (/* binding */ Points),
/* harmony export */   Segment: () => (/* binding */ Segment),
/* harmony export */   Vecteur: () => (/* binding */ Vecteur)
/* harmony export */ });
class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    setCoordonneesPoint(point, x, y) {
        point.x = x;
        point.y = y;
    }
    getCoordonneesPoint(point) {
        return [point.x, point.y];
    }
    translation(vecteur) {
        return new Point(this.x + vecteur.x, this.y + vecteur.y);
    }
    rotation(centre, angle) {
        let dx = this.x - centre.x;
        let dy = this.y - centre.y;
        let rotatedX = centre.x + dx * Math.cos(angle) - dy * Math.sin(angle);
        let rotatedY = centre.y + dx * Math.sin(angle) + dy * Math.cos(angle);
        return new Point(rotatedX, rotatedY);
    }
    symetrieCentrale(point) {
        return new Point(2 * point.x - this.x, 2 * point.y - this.y);
    }
    symetrieAxiale(d) {
        let x = (d.b * (d.b * this.x - d.a * this.y) - d.a * d.c) / (d.a * d.a + d.b * d.b);
        let y = (d.a * (-d.b * this.x + d.a * this.y) - d.b * d.c) / (d.a * d.a + d.b * d.b);
        return new Point(2 * x - this.x, 2 * y - this.y);
    }
    distance(point) {
        return Math.sqrt(Math.pow(this.x - point.x, 2) + Math.pow(this.y - point.y, 2));
    }
    homothetie(centre, k) {
        return new Point(centre.x + k * (this.x - centre.x), centre.y + k * (this.y - centre.y));
    }
    homothetiePoint(centre, point) {
        let k = centre.distance(point) / centre.distance(this);
        return this.homothetie(centre, k);
    }
    angle(point1, point2) {
        // Retourne l'angle orienté entre les vecteurs (this, point1) et (this, point2)
        let vecteur1 = new Vecteur(point1.x - this.x, point1.y - this.y);
        let vecteur2 = new Vecteur(point2.x - this.x, point2.y - this.y);
        return vecteur1.angle(vecteur2);
    }
    distancePointDroite(A, B) {
        return (B.x - A.x) * (this.y - A.y) - (B.y - A.y) * (this.x - A.x);
    }
    projectionOrthogonale(A, B) {
        // Projection de this sur la droite (AB)
        let AB = new Vecteur(B.x - A.x, B.y - A.y);
        let AC = new Vecteur(this.x - A.x, this.y - A.y);
        let k = AB.produitScalaire(AC) / (AB.norme() * AB.norme());
        return new Point(A.x + k * AB.x, A.y + k * AB.y);
    }
    projectionAngle(A, B, angle) {
        let AB = new Droite(0, 0, 0);
        AB.setCoefficientsDroite2Points(A, B);
        let u = new Vecteur(0, 0);
        u.setCoordonneesVecteur2Points(A, B);
        let v = u.rotation(angle);
        let C = this.translation(v);
        let AC = new Droite(0, 0, 0);
        AC.setCoefficientsDroite2Points(this, C);
        return AB.intersection(AC);
    }
}
class Vecteur {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    setCoordonneesVecteur(vecteur, x, y) {
        vecteur.x = x;
        vecteur.y = y;
    }
    // Méthode pour construire le vecteur à partir de deux points
    setCoordonneesVecteur2Points(point1, point2) {
        this.x = point2.x - point1.x;
        this.y = point2.y - point1.y;
    }
    getCoordonneesVecteur() {
        return [this.x, this.y];
    }
    additionVecteur(vecteur) {
        return new Vecteur(this.x + vecteur.x, this.y + vecteur.y);
    }
    soustractionVecteur(vecteur) {
        return new Vecteur(this.x - vecteur.x, this.y - vecteur.y);
    }
    multiplicationVecteur(k) {
        return new Vecteur(k * this.x, k * this.y);
    }
    produitScalaire(vecteur) {
        return this.x * vecteur.x + this.y * vecteur.y;
    }
    norme() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalisation() {
        return new Vecteur(this.x / this.norme(), this.y / this.norme());
    }
    produitVectoriel(vecteur) {
        return this.x * vecteur.y - this.y * vecteur.x;
    }
    angle(vecteur) {
        // Prévoir un angle signé
        return Math.atan2(this.produitVectoriel(vecteur), this.produitScalaire(vecteur));
    }
    projection(vecteur) {
        return this.produitScalaire(vecteur) / this.norme();
    }
    projectionOrthogonale(vecteur) {
        return this.produitVectoriel(vecteur) / this.norme();
    }
    rotation(angle) {
        return new Vecteur(this.x * Math.cos(angle) - this.y * Math.sin(angle), this.x * Math.sin(angle) + this.y * Math.cos(angle));
    }
    oppose() {
        return new Vecteur(-this.x, -this.y);
    }
}
class Cercle {
    constructor(centre, rayon) {
        this.centre = centre;
        this.rayon = rayon;
    }
    setCoordonneesCercle(centre, rayon) {
        this.centre = centre;
        this.rayon = rayon;
    }
    getCoordonneesCercle() {
        return [this.centre, this.rayon];
    }
    symetrieCentrale(centre) {
        return new Cercle(new Point(2 * centre.x - this.centre.x, 2 * centre.y - this.centre.y), this.rayon);
    }
    symetrieAxiale(droite) {
        let x = (droite.b * (droite.b * this.centre.x - droite.a * this.centre.y) - droite.a * droite.c) / (droite.a * droite.a + droite.b * droite.b);
        let y = (droite.a * (-droite.b * this.centre.x + droite.a * this.centre.y) - droite.b * droite.c) / (droite.a * droite.a + droite.b * droite.b);
        return new Cercle(new Point(2 * x - this.centre.x, 2 * y - this.centre.y), this.rayon);
    }
    rotation(angle, centre) {
        return new Cercle(new Point((this.centre.x - centre.x) * Math.cos(angle) - (this.centre.y - centre.y) * Math.sin(angle) + centre.x, (this.centre.x - centre.x) * Math.sin(angle) + (this.centre.y - centre.y) * Math.cos(angle) + centre.y), this.rayon);
    }
    homothetie(centre, k) {
        return new Cercle(new Point(centre.x + k * (this.centre.x - centre.x), centre.y + k * (this.centre.y - centre.y)), k * this.rayon);
    }
    translation(vecteur) {
        return new Cercle(new Point(this.centre.x + vecteur.x, this.centre.y + vecteur.y), this.rayon);
    }
}
class Droite {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    setCoefficientsDroite(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    getCoefficientsDroite() {
        return [this.a, this.b, this.c];
    }
    getVecteurDirecteur() {
        return new Vecteur(this.a, this.b);
    }
    getVecteurNormal() {
        return new Vecteur(-this.b, this.a);
    }
    getVecteurNormalUnitaire() {
        return new Vecteur(-this.b / Math.sqrt(this.a * this.a + this.b * this.b), this.a / Math.sqrt(this.a * this.a + this.b * this.b));
    }
    setCoefficientsDroite2Points(point1, point2) {
        this.a = point2.y - point1.y;
        this.b = point1.x - point2.x;
        this.c = point1.y * point2.x - point1.x * point2.y;
    }
    translation(vecteur) {
        return new Droite(this.a, this.b, this.c + this.a * vecteur.x + this.b * vecteur.y);
    }
    rotation(angle, centre) {
        return new Droite(this.a * Math.cos(angle) - this.b * Math.sin(angle), this.a * Math.sin(angle) + this.b * Math.cos(angle), this.c + this.a * (centre.y - centre.x * Math.sin(angle)) + this.b * (centre.x * Math.cos(angle) - centre.y));
    }
    symetrieCentrale(centre) {
        return new Droite(this.a, this.b, this.c + 2 * this.a * centre.x + 2 * this.b * centre.y);
    }
    symetrieAxiale(d) {
        // Choisissons deux points sur la droite this
        let x1 = 0;
        let y1 = (-this.c - this.a * x1) / this.b;
        let x2 = 1;
        let y2 = (-this.c - this.a * x2) / this.b;
        // Trouvons leurs symétriques par rapport à d
        let x1Prime = x1 - 2 * d.a * (d.a * x1 + d.b * y1 + d.c) / (d.a ** 2 + d.b ** 2);
        let y1Prime = y1 - 2 * d.b * (d.a * x1 + d.b * y1 + d.c) / (d.a ** 2 + d.b ** 2);
        let x2Prime = x2 - 2 * d.a * (d.a * x2 + d.b * y2 + d.c) / (d.a ** 2 + d.b ** 2);
        let y2Prime = y2 - 2 * d.b * (d.a * x2 + d.b * y2 + d.c) / (d.a ** 2 + d.b ** 2);
        // Trouvons l'équation de la droite passant par P1' et P2'
        let aPrime = y2Prime - y1Prime;
        let bPrime = x1Prime - x2Prime;
        let cPrime = x2Prime * y1Prime - x1Prime * y2Prime;
        return new Droite(aPrime, bPrime, cPrime);
    }
    homothetie(centre, k) {
        return new Droite(this.a, this.b, this.c + this.a * (centre.x - k * centre.x) + this.b * (centre.y - k * centre.y));
    }
    perpendiculaire(point) {
        return new Droite(-this.b, this.a, this.b * point.x - this.a * point.y);
    }
    parallele(point) {
        return new Droite(this.a, this.b, this.c - this.a * point.x + this.b * point.y);
    }
    intersection(droite) {
        let x = (this.b * droite.c - droite.b * this.c) / (this.a * droite.b - droite.a * this.b);
        let y = (this.c * droite.a - droite.c * this.a) / (this.a * droite.b - droite.a * this.b);
        return new Point(x, y);
    }
}
class Points {
    constructor(points) {
        this.points = points;
    }
    setCoordonneesPoints(points) {
        this.points = points;
    }
    getCoordonneesPoints() {
        return this.points;
    }
    rotation(angle, centre) {
        let points = [];
        for (let i = 0; i < this.points.length; i++) {
            points.push(new Point((this.points[i].x - centre.x) * Math.cos(angle) - (this.points[i].y - centre.y) * Math.sin(angle) + centre.x, (this.points[i].x - centre.x) * Math.sin(angle) + (this.points[i].y - centre.y) * Math.cos(angle) + centre.y));
        }
        return new Points(points);
    }
    symetriecentrale(centre) {
        let points = [];
        for (let i = 0; i < this.points.length; i++) {
            points.push(new Point(2 * centre.x - this.points[i].x, 2 * centre.y - this.points[i].y));
        }
        return new Points(points);
    }
    symetrieaxiale(droite) {
        let points = [];
        for (let i = 0; i < this.points.length; i++) {
            let x = (droite.b * (droite.b * this.points[i].x - droite.a * this.points[i].y) - droite.a * droite.c) / (droite.a * droite.a + droite.b * droite.b);
            let y = (droite.a * (-droite.b * this.points[i].x + droite.a * this.points[i].y) - droite.b * droite.c) / (droite.a * droite.a + droite.b * droite.b);
            points.push(new Point(2 * x - this.points[i].x, 2 * y - this.points[i].y));
        }
        return new Points(points);
    }
    homothetie(centre, k) {
        let points = [];
        for (let i = 0; i < this.points.length; i++) {
            points.push(new Point(centre.x + k * (this.points[i].x - centre.x), centre.y + k * (this.points[i].y - centre.y)));
        }
        return new Points(points);
    }
    translation(vecteur) {
        let points = [];
        for (let i = 0; i < this.points.length; i++) {
            points.push(new Point(this.points[i].x + vecteur.x, this.points[i].y + vecteur.y));
        }
        return new Points(points);
    }
}
class Segment {
    constructor(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
    }
    setCoordonneesSegment(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
    }
    getCoordonneesSegment() {
        return [this.point1, this.point2];
    }
    translation(vecteur) {
        return new Segment(new Point(this.point1.x + vecteur.x, this.point1.y + vecteur.y), new Point(this.point2.x + vecteur.x, this.point2.y + vecteur.y));
    }
    rotation(angle, centre) {
        return new Segment(new Point((this.point1.x - centre.x) * Math.cos(angle) - (this.point1.y - centre.y) * Math.sin(angle) + centre.x, (this.point1.x - centre.x) * Math.sin(angle) + (this.point1.y - centre.y) * Math.cos(angle) + centre.y), new Point((this.point2.x - centre.x) * Math.cos(angle) - (this.point2.y - centre.y) * Math.sin(angle) + centre.x, (this.point2.x - centre.x) * Math.sin(angle) + (this.point2.y - centre.y) * Math.cos(angle) + centre.y));
    }
    symetrieCentrale(centre) {
        return new Segment(new Point(2 * centre.x - this.point1.x, 2 * centre.y - this.point1.y), new Point(2 * centre.x - this.point2.x, 2 * centre.y - this.point2.y));
    }
    symetrieAxiale(droite) {
        let x1 = (droite.b * (droite.b * this.point1.x - droite.a * this.point1.y) - droite.a * droite.c) / (droite.a * droite.a + droite.b * droite.b);
        let y1 = (droite.a * (-droite.b * this.point1.x + droite.a * this.point1.y) - droite.b * droite.c) / (droite.a * droite.a + droite.b * droite.b);
        let x2 = (droite.b * (droite.b * this.point2.x - droite.a * this.point2.y) - droite.a * droite.c) / (droite.a * droite.a + droite.b * droite.b);
        let y2 = (droite.a * (-droite.b * this.point2.x + droite.a * this.point2.y) - droite.b * droite.c) / (droite.a * droite.a + droite.b * droite.b);
        return new Segment(new Point(2 * x1 - this.point1.x, 2 * y1 - this.point1.y), new Point(2 * x2 - this.point2.x, 2 * y2 - this.point2.y));
    }
    homothetie(centre, k) {
        return new Segment(new Point(centre.x + k * (this.point1.x - centre.x), centre.y + k * (this.point1.y - centre.y)), new Point(centre.x + k * (this.point2.x - centre.x), centre.y + k * (this.point2.y - centre.y)));
    }
    perpendiculaire(point) {
        let droite = new Droite(0, 0, 0);
        droite.setCoefficientsDroite2Points(this.point1, this.point2);
        return droite.perpendiculaire(point);
    }
    parallele(point) {
        let droite = new Droite(0, 0, 0);
        droite.setCoefficientsDroite2Points(this.point1, this.point2);
        return droite.parallele(point);
    }
    milieu() {
        return new Point((this.point1.x + this.point2.x) / 2, (this.point1.y + this.point2.y) / 2);
    }
    longueur() {
        return Math.sqrt(Math.pow(this.point1.x - this.point2.x, 2) + Math.pow(this.point1.y - this.point2.y, 2));
    }
    angle() {
        // Retourne l'angle orienté entre le segment et l'axe des abscisses
        let vecteur = new Vecteur(this.point2.x - this.point1.x, this.point2.y - this.point1.y);
        return vecteur.angle(new Vecteur(1, 0));
    }
}
window.Point = Point;
window.Vecteur = Vecteur;
window.Cercle = Cercle;
window.Droite = Droite;
window.Points = Points;
window.Segment = Segment;

/******/ })()
;
//# sourceMappingURL=geometrie.bundle.js.map