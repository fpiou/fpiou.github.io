// const fs = require("fs");
// const path = require("path");

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDirectory = path.resolve(__dirname, "dist");

function generateHtmlList(directory) {
  let listContent = "<ul>";
  // Tester si le répertoire existe
  if (!fs.existsSync(directory)) {
    return "En cours de construction";
  }
  const items = fs.readdirSync(directory, { withFileTypes: true });

  items.forEach((item) => {
    const fullPath = path.join(directory, item.name);
    if (item.isDirectory()) {
      listContent += `<li>${item.name}${generateHtmlList(fullPath)}</li>`;
    } else if (path.extname(item.name) === ".html" && item.name !== "exercices.html") {
      const relativePath = path.relative(distDirectory, fullPath);
      listContent += `<li><a href="./dist/${relativePath}">${item.name}</a></li>`;
    }
  });

  listContent += "</ul>";
  return listContent;
}

// Récupérer le contenu du bandeau dans le fichier bandeau.html
const bandeau = fs.readFileSync(
  path.resolve(__dirname, "./templates/bandeau.html"),
  "utf8"
);

const entete = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="mobile-web-app-capable" content="yes">

    <link rel="apple-touch-icon" sizes="180x180" href="/favicon_io/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon_io/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon_io/favicon-16x16.png" />
    <link rel="manifest" href="/favicon_io/site.webmanifest" />
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@200;300;400&display=swap"
        rel="stylesheet">

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css"
        integrity="sha384-GvrOXuhMATgEsSwCs4smul74iXGOixntILdUW9XmUC6+HX0sLNAK3q71HotJqlAn" crossorigin="anonymous">

    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"
        integrity="sha384-cpW21h6RZv/phavutF+AuVYrr+dA8xD9zs6FwLpaCct6O9ctzYFfFr4dgmgccOTx"
        crossorigin="anonymous"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"
        integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05"
        crossorigin="anonymous"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/10.4.0/math.min.js"></script>

    <!--Styles personnalisés-->
    <link rel="stylesheet" href="/src/css/main.css">


    <!--Scripts personnalisés-->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">

    <!-- Biliothèque pour manipuler le svg -->
    <script src="https://d3js.org/d3.v5.min.js"></script>

    <!-- Marqueurs pour les figures en SVG-->
    <div id="interactivite"></div>
    <script defer src="/dist/main.bundle.js"></script>
`;
const indexContent = `
${entete}
    <title>Accueil</title>
</head>
<body>
    ${bandeau}
    <h1>Tout le contenu du site</h1>
    ${generateHtmlList(distDirectory)}
</body>
</html>
`;

fs.writeFileSync(path.resolve(__dirname, "index.html"), indexContent);

// Créer une seconde page dans laquelle on affiche que les contenus de cours du niveau seconde
const lessons2nde = `
${entete}
    <title>2nde générale- Leçons</title>
</head>
<body>
    ${bandeau}
    <h1>2nde générale - Leçons</h1>
    ${generateHtmlList(path.resolve(__dirname, "dist/lessons/2nde"))}
</body>
</html>
`;

fs.writeFileSync(path.resolve(__dirname, "lessons_2nde.html"), lessons2nde);

// Créer une seconde page dans laquelle on affiche que les contenus de cours du niveau première Specialite
const lessons1ereSpecialite = `
${entete}
    <title>1ère spécialité - Leçons</title>
</head>
<body>
    ${bandeau}
    <h1>1ère spécialité - Leçons</h1>
    ${generateHtmlList(path.resolve(__dirname, "dist/lessons/1ereSPE"))}
</body>
</html>
`;

fs.writeFileSync(
  path.resolve(__dirname, "lessons_1ereSpecialite.html"),
  lessons1ereSpecialite
);

// Créer une seconde page dans laquelle on affiche que les contenus d'exercices du niveau seconde'
const exercises2nde = `
${entete}
    <title>2nde générale - Exercices</title>
</head>
<body>
    ${bandeau}
    <h1>2nde générale - Exercices</h1>
    ${generateHtmlList(path.resolve(__dirname, "dist/exercices/2nde"))} 
</body>
</html>
`;

fs.writeFileSync(path.resolve(__dirname, "exercices_2nde.html"), exercises2nde);

// Créer une seconde page dans laquelle on affiche que les contenus d'exercices du niveau première Specialite
const exercises1ereSpecialite = `
${entete}
    <title>1ère spécialité - Exercices</title>
</head>
<body>
    ${bandeau}
    <h1>1ère spécialité - Exercices</h1>
    ${generateHtmlList(path.resolve(__dirname, "dist/exercices/1ereSPE"))}
</body>
</html>
`;

fs.writeFileSync(
  path.resolve(__dirname, "exercices_1ereSpecialite.html"),
  exercises1ereSpecialite
);

// Créer une seconde page dans laquelle on affiche que les contenus d'exercices du niveau première générale
const exercises1ereGenerale = `
${entete}
    <title>1ère générale - Exercices</title>
</head>
<body>
    ${bandeau}
    <h1>1ère générale - Exercices</h1>
    ${generateHtmlList(path.resolve(__dirname, "dist/exercices/1ere"))}
</body>
</html>
`;

fs.writeFileSync(
  path.resolve(__dirname, "exercices_1ereGenerale.html"),
  exercises1ereGenerale
);

// Créer une seconde page dans laquelle on affiche que les contenus de lessons du niveau premiere generale
const exercisesLessons1ereGenerale = `
${entete}
    <title>1ère générale - Leçons</title>
</head>
<body>
    ${bandeau}
    <h1>1ère générale - Leçons</h1>
    ${generateHtmlList(path.resolve(__dirname, "dist/lessons/1ere"))}
</body>
</html>
`;

fs.writeFileSync(
  path.resolve(__dirname, "lessons_1ereGenerale.html"),
  exercisesLessons1ereGenerale
);

// Créer les pages de quizs de chaque niveau
const quizs2nde = `
${entete}
    <title>2nde générale - Quizs</title>
</head>
<body>
    ${bandeau}
    
    <h1>2nde générale - Quizs</h1>
    ${generateHtmlList(path.resolve(__dirname, "dist/quizs/2nde"))}
</body>
</html>
`;

fs.writeFileSync(path.resolve(__dirname, "quizs_2nde.html"), quizs2nde);

const quizs1ereSpecialite = `
${entete}
    <title>1ère spécialité - Quizs</title>
</head>
<body>
    ${bandeau}
    <h1>1ère spécialité - Quizs</h1>
    ${generateHtmlList(path.resolve(__dirname, "dist/quizs/1ereSPE"))}
</body>
</html>
`;

fs.writeFileSync(
  path.resolve(__dirname, "quizs_1ereSpecialite.html"),
  quizs1ereSpecialite
);

const quizs1ereGenerale = `
${entete}
    <title>1ère générale - Quizs</title>
</head>
<body>
    ${bandeau}
    <h1>1ère générale - Quizs</h1>
    ${generateHtmlList(path.resolve(__dirname, "dist/quizs/1ere"))}
</body>
</html>
`;

fs.writeFileSync(
  path.resolve(__dirname, "quizs_1ereGenerale.html"),
  quizs1ereGenerale
);
