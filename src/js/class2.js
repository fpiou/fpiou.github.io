export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    setCoordonneesPoint = function (point, x, y) {
        point.x = x;
        point.y = y;
    }
    getCoordonneesPoint = function (point) {
        return [point.x, point.y];
    }
    translation = function (vecteur) {
        return new Point(this.x + vecteur.x, this.y + vecteur.y);
    }
    rotation(centre, angle) {
        let dx = this.x - centre.x;
        let dy = this.y - centre.y;
      
        let rotatedX = centre.x + dx * Math.cos(angle) - dy * Math.sin(angle);
        let rotatedY = centre.y + dx * Math.sin(angle) + dy * Math.cos(angle);
      
        return new Point(rotatedX, rotatedY);
    }
    symetrieCentrale = function (point) {
        return new Point(2 * point.x - this.x, 2 * point.y - this.y);
    }
    symetrieAxiale = function (point, droite) {
        let vecteur = new Vecteur(droite.point2.x - droite.point1.x, droite.point2.y - droite.point1.y);
        let vecteurNormal = new Vecteur(-vecteur.y, vecteur.x);
        let vecteurNormalUnitaire = new Vecteur(vecteurNormal.x / Math.sqrt(vecteurNormal.x * vecteurNormal.x + vecteurNormal.y * vecteurNormal.y), vecteurNormal.y / Math.sqrt(vecteurNormal.x * vecteurNormal.x + vecteurNormal.y * vecteurNormal.y));
        let vecteurPointDroite = new Vecteur(point.x - droite.point1.x, point.y - droite.point1.y);
        let projection = vecteurNormalUnitaire.x * vecteurPointDroite.x + vecteurNormalUnitaire.y * vecteurPointDroite.y;
        let symetrique = new Vecteur(point.x - 2 * projection * vecteurNormalUnitaire.x, point.y - 2 * projection * vecteurNormalUnitaire.y);
        return new Point(symetrique.x, symetrique.y);
    }
    distance = function (point1) {
        return Math.sqrt(Math.pow(this.x - point1.x, 2) + Math.pow(this.y - point1.y, 2));
    }
    homothetie = function (centre,k) {
        return new Point(centre.x + k * (this.x - centre.x), centre.y + k * (this.y - centre.y));
    }
    homothetiePoint = function (centre, point) {
        let k = centre.distance(point) / centre.distance(this);
        return this.homothetie(centre, k);
    }
    angle = function (point1, point2) {
        // Retourne l'angle orienté entre les vecteurs (this, point1) et (this, point2)
        let vecteur1 = new Vecteur(point1.x - this.x, point1.y - this.y);
        let vecteur2 = new Vecteur(point2.x - this.x, point2.y - this.y);
        return vecteur1.angle(vecteur2);
    }
    distancePointDroite = function (A,B) {
        return (B.x - A.x)*(this.y - A.y) - (B.y - A.y)*(this.x - A.x);
    }
    projectionOrthogonale = function (A,B) {
        // Projection de this sur la droite (AB)
        let AB = new Vecteur(B.x-A.x,B.y-A.y);
        let AC = new Vecteur(this.x-A.x,this.y-A.y);
        let k = AB.produitScalaire(AC)/(AB.norme()*AB.norme());
        return new Point(A.x+k*AB.x, A.y+k*AB.y);
    }
    projectionAngle = function (A,B,angle) {
        let AB = new Droite()
        AB.setCoefficientsDroite2Points(A,B);
        let u = new Vecteur()
        u.setCoordonneesVecteur2Points(A,B)
        let v = u.rotation(angle);
        let C = this.translation(v)
        let AC = new Droite()
        AC.setCoefficientsDroite2Points(this,C)
        return AB.intersection(AC)
    }
}
export class Vecteur {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    setCoordonneesVecteur = function (vecteur, x, y) {
        vecteur.x = x;
        vecteur.y = y;
    }
    // Méthode pour construire le vecteur à partir de deux points
    setCoordonneesVecteur2Points = function (point1, point2) {
        this.x = point2.x - point1.x;
        this.y = point2.y - point1.y;
    }
    getCoordonneesVecteur = function () {
        return [this.x, this.y];
    }
    additionVecteur = function (vecteur) {
        return new Vecteur(this.x + vecteur.x, this.y + vecteur.y);
    }
    soustractionVecteur = function (vecteur) {
        return new Vecteur(this.x - vecteur.x, this.y - vecteur.y);
    }
    multiplicationVecteur = function (k) {
        return new Vecteur(k * this.x, k * this.y);
    }
    produitScalaire = function (vecteur) {
        return this.x * vecteur.x + this.y * vecteur.y;
    }
    norme = function () {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalisation = function () {
        return new Vecteur(this.x / this.norme(), this.y / this.norme());
    }
    produitVectoriel = function (vecteur) {
        return this.x * vecteur.y - this.y * vecteur.x;
    }
    angle = function (vecteur) {
        // Prévoir un angle signé
        return Math.atan2(this.produitVectoriel(vecteur), this.produitScalaire(vecteur));
    }
    projection = function (vecteur) {
        return this.produitScalaire(vecteur) / this.norme();
    }
    projectionOrthogonale = function (vecteur) {
        return this.produitVectoriel(vecteur) / this.norme();
    }
    rotation = function (angle) {
        return new Vecteur(this.x * Math.cos(angle) - this.y * Math.sin(angle), this.x * Math.sin(angle) + this.y * Math.cos(angle));
    }
}
export class Cercle {
    constructor(centre, rayon) {
        this.centre = centre;
        this.rayon = rayon;
    }
    setCoordonneesCercle = function (centre, rayon) {
        this.centre = centre;
        this.rayon = rayon;
    }
    getCoordonneesCercle = function () {
        return [this.centre, this.rayon];
    }
    translation = function (vecteur) {
        return new Cercle(new Point(this.centre.x + vecteur.x, this.centre.y + vecteur.y), this.rayon);
    }
    symetrieCentrale =  function (centre) {
        return new Cercle(new Point(2 * centre.x - this.centre.x, 2 * centre.y - this.centre.y), this.rayon);
    }
    symetrieAxiale = function (droite) {
        let vecteur = new Vecteur(droite.point2.x - droite.point1.x, droite.point2.y - droite.point1.y);
        let vecteurNormal = new Vecteur(-vecteur.y, vecteur.x);
        let vecteurNormalUnitaire = new Vecteur(vecteurNormal.x / Math.sqrt(vecteurNormal.x * vecteurNormal.x + vecteurNormal.y * vecteurNormal.y), vecteurNormal.y / Math.sqrt(vecteurNormal.x * vecteurNormal.x + vecteurNormal.y * vecteurNormal.y));
        let vecteurCentreDroite = new Vecteur(this.centre.x - droite.point1.x, this.centre.y - droite.point1.y);
        let projection = vecteurNormalUnitaire.x * vecteurCentreDroite.x + vecteurNormalUnitaire.y * vecteurCentreDroite.y;
        let symetrique = new Vecteur(this.centre.x - 2 * projection * vecteurNormalUnitaire.x, this.centre.y - 2 * projection * vecteurNormalUnitaire.y);
        return new Cercle(new Point(symetrique.x, symetrique.y), this.rayon);
    }
    rotation = function (angle, centre) {
        return new Cercle(new Point((this.centre.x-centre.x) * Math.cos(angle) - (this.centre.y-centre.y) * Math.sin(angle)+centre.x, (this.centre.x-centre.x) * Math.sin(angle) + (this.centre.y-centre.y) * Math.cos(angle)+centre.y), this.rayon);
    }
    homothetie = function (centre,k) {
        return new Cercle(new Point(centre.x + k * (this.centre.x - centre.x), centre.y + k * (this.centre.y - centre.y)), k * this.rayon);
    }
    translation = function (vecteur) {
        return new Cercle(new Point(this.centre.x + vecteur.x, this.centre.y + vecteur.y), this.rayon);
    }
}
export class Points {
    constructor(points) {
        this.points = points;
    }
    setCoordonneesPoints = function (points) {
        this.points = points;
    }
    getCoordonneesPoints = function () {
        return this.points;
    }
    translation = function (vecteur) {
        let points = [];
        for (let i = 0; i < this.points.length; i++) {
            points.push(new Point(this.points[i].x + vecteur.x, this.points[i].y + vecteur.y));
        }
        return new Points(points);
    }
    rotation = function (angle, center) {
        let points = [];
        for (let i = 0; i < this.points.length; i++) {
            points.push(new Point((this.points[i].x-center.x) * Math.cos(angle) - (this.points[i].y-center.y) * Math.sin(angle)+center.x, (this.points[i].x-center.x) * Math.sin(angle) + (this.points[i].y-center.y) * Math.cos(angle)+center.y));
        }
        return new Points(points);
    }
    symetriecentrale = function (centre) {
        let points = [];
        for (let i = 0; i < this.points.length; i++) {
            points.push(new Point(2 * centre.x - this.points[i].x, 2 * centre.y - this.points[i].y));
        }
        return new Points(points);
    }
    symetrieaxiale = function (droite) {
        let vecteur = new Vecteur(droite.point2.x - droite.point1.x, droite.point2.y - droite.point1.y);
        let vecteurNormal = new Vecteur(-vecteur.y, vecteur.x);
        let vecteurNormalUnitaire = new Vecteur(vecteurNormal.x / Math.sqrt(vecteurNormal.x * vecteurNormal.x + vecteurNormal.y * vecteurNormal.y), vecteurNormal.y / Math.sqrt(vecteurNormal.x * vecteurNormal.x + vecteurNormal.y * vecteurNormal.y));
        let points = [];
        for (let i = 0; i < this.points.length; i++) {
            let vecteurPointDroite = new Vecteur(this.points[i].x - droite.point1.x, this.points[i].y - droite.point1.y);
            let projection = vecteurNormalUnitaire.x * vecteurPointDroite.x + vecteurNormalUnitaire.y * vecteurPointDroite.y;
            let symetrique = new Vecteur(this.points[i].x - 2 * projection * vecteurNormalUnitaire.x, this.points[i].y - 2 * projection * vecteurNormalUnitaire.y);
            points.push(new Point(symetrique.x, symetrique.y));
        }
        return new Points(points);
    }
    homothetie = function (centre,k) {
        let points = [];
        for (let i = 0; i < this.points.length; i++) {
            points.push(new Point(centre.x + k * (this.points[i].x - centre.x), centre.y + k * (this.points[i].y - centre.y)));
        }
        return new Points(points);
    }
    translation = function (vecteur) {
        let points = [];
        for (let i = 0; i < this.points.length; i++) {
            points.push(new Point(this.points[i].x + vecteur.x, this.points[i].y + vecteur.y));
        }
        return new Points(points);
    }
}
export class Droite {
    constructor(a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    setCoefficientsDroite = function (a, b, c) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    getCoefficientsDroite = function () {
        return [this.a, this.b, this.c];
    }
    setCoefficientsDroite2Points = function (point1, point2) {
        this.a = point2.y - point1.y;
        this.b = point1.x - point2.x;
        this.c = point1.y * point2.x - point1.x * point2.y;
    }
    translation = function (vecteur) {
        return new Droite(this.a, this.b, this.c + this.a * vecteur.x + this.b * vecteur.y);
    }
    rotation = function (angle, centre) {
        return new Droite(this.a * Math.cos(angle) - this.b * Math.sin(angle), this.a * Math.sin(angle) + this.b * Math.cos(angle), this.c + this.a * (centre.y - centre.x * Math.sin(angle)) + this.b * (centre.x * Math.cos(angle) - centre.y));
    }
    symetrieCentrale = function (centre) {
        return new Droite(this.a, this.b, this.c + 2 * this.a * centre.x + 2 * this.b * centre.y);
    }
    symetrieAxiale = function (droite) {
        let vecteur = new Vecteur(droite.point2.x - droite.point1.x, droite.point2.y - droite.point1.y);
        let vecteurNormal = new Vecteur(-vecteur.y, vecteur.x);
        let vecteurNormalUnitaire = new Vecteur(vecteurNormal.x / Math.sqrt(vecteurNormal.x * vecteurNormal.x + vecteurNormal.y * vecteurNormal.y), vecteurNormal.y / Math.sqrt(vecteurNormal.x * vecteurNormal.x + vecteurNormal.y * vecteurNormal.y));
        let vecteurPointDroite = new Vecteur(this.a, this.b);
        let projection = vecteurNormalUnitaire.x * vecteurPointDroite.x + vecteurNormalUnitaire.y * vecteurPointDroite.y;
        let symetrique = new Vecteur(this.a - 2 * projection * vecteurNormalUnitaire.x, this.b - 2 * projection * vecteurNormalUnitaire.y);
        return new Droite(symetrique.x, symetrique.y, this.c);
    }
    homothetie = function (centre,k) {
        return new Droite(this.a, this.b, this.c + this.a * (centre.x - k * centre.x) + this.b * (centre.y - k * centre.y));
    }
    perpendiculaire = function (point) {
        return new Droite(-this.b, this.a, this.b * point.x - this.a * point.y);
    }
    parallele = function (point) {
        return new Droite(this.a, this.b, this.c - this.a * point.x + this.b * point.y);
    }
    intersection = function (droite) {
        let x = (this.b * droite.c - droite.b * this.c) / (this.a * droite.b - droite.a * this.b);
        let y = (this.c * droite.a - droite.c * this.a) / (this.a * droite.b - droite.a * this.b);
        return new Point(x, y);
    }
}
export class Segment {
    constructor(point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
    }
    setCoordonneesSegment = function (point1, point2) {
        this.point1 = point1;
        this.point2 = point2;
    }
    getCoordonneesSegment = function () {
        return [this.point1, this.point2];
    }
    translation = function (vecteur) {
        return new Segment(new Point(this.point1.x + vecteur.x, this.point1.y + vecteur.y), new Point(this.point2.x + vecteur.x, this.point2.y + vecteur.y));
    }
    rotation = function (angle, centre) {
        return new Segment(new Point((this.point1.x-centre.x) * Math.cos(angle) - (this.point1.y-centre.y) * Math.sin(angle)+centre.x, (this.point1.x-centre.x) * Math.sin(angle) + (this.point1.y-centre.y) * Math.cos(angle)+centre.y), new Point((this.point2.x-centre.x) * Math.cos(angle) - (this.point2.y-centre.y) * Math.sin(angle)+centre.x, (this.point2.x-centre.x) * Math.sin(angle) + (this.point2.y-centre.y) * Math.cos(angle)+centre.y));
    }
    symetrieCentrale = function (centre) {
        return new Segment(new Point(2 * centre.x - this.point1.x, 2 * centre.y - this.point1.y), new Point(2 * centre.x - this.point2.x, 2 * centre.y - this.point2.y));
    }
    symetrieAxiale = function (droite) {
        let vecteur = new Vecteur(droite.point2.x - droite.point1.x, droite.point2.y - droite.point1.y);
        let vecteurNormal = new Vecteur(-vecteur.y, vecteur.x);
        let vecteurNormalUnitaire = new Vecteur(vecteurNormal.x / Math.sqrt(vecteurNormal.x * vecteurNormal.x + vecteurNormal.y * vecteurNormal.y), vecteurNormal.y / Math.sqrt(vecteurNormal.x * vecteurNormal.x + vecteurNormal.y * vecteurNormal.y));
        let vecteurPointDroite1 = new Vecteur(this.point1.x - droite.point1.x, this.point1.y - droite.point1.y);
        let projection1 = vecteurNormalUnitaire.x * vecteurPointDroite1.x + vecteurNormalUnitaire.y * vecteurPointDroite1.y;
        let symetrique1 = new Vecteur(this.point1.x - 2 * projection1 * vecteurNormalUnitaire.x, this.point1.y - 2 * projection1 * vecteurNormalUnitaire.y);
        let vecteurPointDroite2 = new Vecteur(this.point2.x - droite.point1.x, this.point2.y - droite.point1.y);
        let projection2 = vecteurNormalUnitaire.x * vecteurPointDroite2.x + vecteurNormalUnitaire.y * vecteurPointDroite2.y;
        let symetrique2 = new Vecteur(this.point2.x - 2 * projection2 * vecteurNormalUnitaire.x, this.point2.y - 2 * projection2 * vecteurNormalUnitaire.y);
        return new Segment(new Point(symetrique1.x, symetrique1.y), new Point(symetrique2.x, symetrique2.y));
    }
    homothetie = function (centre,k) {
        return new Segment(new Point(centre.x + k * (this.point1.x - centre.x), centre.y + k * (this.point1.y - centre.y)), new Point(centre.x + k * (this.point2.x - centre.x), centre.y + k * (this.point2.y - centre.y)));
    }
    perpendiculaire = function (point) {
        let droite = new Droite(this.point1, this.point2);
        return droite.perpendiculaire(point);
    }
    parallele = function (point) {
        let droite = new Droite(this.point1, this.point2);
        return droite.parallele(point);
    }
    milieu = function () {
        return new Point((this.point1.x + this.point2.x) / 2, (this.point1.y + this.point2.y) / 2);
    }
    longueur = function () {
        return Math.sqrt(Math.pow(this.point1.x - this.point2.x, 2) + Math.pow(this.point1.y - this.point2.y, 2));
    }
    angle = function () {
        // Retourne l'angle orienté entre le segment et l'axe des abscisses
        let vecteur = new Vecteur(this.point2.x - this.point1.x, this.point2.y - this.point1.y);
        return vecteur.angle(new Vecteur(1, 0));
    }
}