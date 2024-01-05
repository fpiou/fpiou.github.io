import path from "path";
import HtmlWebpackPlugin from "html-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import WebpackShellPluginNext from "webpack-shell-plugin-next";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Chemin vers les répertoires de contenus
const contentDirectories = [
  path.resolve(__dirname, "./src/exercices"),
  path.resolve(__dirname, "./src/lessons"),
  path.resolve(__dirname, "./src/quizs"),
];

  

// Fonction pour lire les fichiers récursivement
function readFilesRecursively(directory) {
  let results = [];
  const list = fs.readdirSync(directory, { withFileTypes: true });

  list.forEach((file) => {
    const fullPath = path.join(directory, file.name);
    if (file.isDirectory()) {
      results = results.concat(readFilesRecursively(fullPath));
    } else if (path.extname(file.name) === ".html" || path.extname(file.name) === ".xml") {
      results.push(fullPath);
    }
  });

  return results;
}

function fileContainsFigureClass(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  return content.includes('class="figure"');
}

// Lire tous les fichiers de type html des répertoires de contenus
const contentFiles = contentDirectories.reduce((acc, directory) => {
  return acc.concat(readFilesRecursively(directory));
}, []);

// Récupérer le contenu du bandeau dans le fichier bandeau.html
const bandeau = fs.readFileSync(
  path.resolve(__dirname, "./templates/bandeau.html"),
  "utf8"
);

// Générer dynamiquement les configurations pour html-webpack-plugin
const htmlPlugins = contentFiles.map((file) => {
  const name = path.basename(file, ".html");
  const pathDist = path.resolve(__dirname, "./dist");
  const pathSource = path.resolve(__dirname, "./src");
  const pathOutput = path.relative(pathSource, pathDist);
  const pathRelative = path.extname(file) === '.xml' 
    ? path.relative(pathSource, file).replace('.xml', '.html') 
    : path.relative(pathSource, file);

  let cssFiles = [];
  cssFiles.push("main.css");
  
  if (file.includes("exercices")) {
    cssFiles.push("prettyExercice.css");
  }
  if (file.includes("lessons")) {
    cssFiles.push("prettyLesson.css");
  }
  if (file.includes("quizs")) {
    cssFiles.push("quiz.css");
  }

  if (fileContainsFigureClass(file)) {
    cssFiles.push("figures.css");
  }
  
  cssFiles.push("print.css");

  // Trois contextes exercice, lesson et quiz
  if (file.includes("exercices")) {
    var template = "./templates/exercice.html";
  } else if (file.includes("lessons")) {
    var template = "./templates/lesson.html";
  } else if (file.includes("quizs")) {
    var template = "./templates/quiz.html";
  }

  return new HtmlWebpackPlugin({
    template: template,
    filename: `${pathOutput}/${pathRelative}`,
    title: name.charAt(0).toUpperCase() + name.slice(1),
    content: fs.readFileSync(file, "utf8"),
    bandeau: bandeau,
    cssFiles: cssFiles,
  });
});

export default {
  entry: {
    main: "./src/js/index.js",
    trinomes: "./src/ts/trinomes.ts",
    geometrie: "./src/ts/geometrie.ts",
  },
  mode: "development",
  output: {
    filename: "[name].bundle.js",
    // Je ne sais pas à quoi servait la suite, probablement pour des tests qui n'ont plus lieu d'être là.
    //path: path.resolve(__dirname, "dist"),
    //library: "MyLibrary",
    //libraryTarget: "var",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.wasm$/,
        type: 'webassembly/sync'
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: {
      fs: false,
      path: false,
      crypto: false,
    },
  },
  plugins: [
    ...htmlPlugins,
    new MiniCssExtractPlugin({
      filename: "css/[name].css",
    }),
    new WebpackShellPluginNext({
      onBuildEnd: {
        scripts: ["node createIndex.mjs"], // Actualise le fichier index.html
        blocking: false,
        parallel: true,
      },
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'node_modules/sql.js/dist/sql-wasm.wasm', to: '' }
      ]
    })
  ],
  devtool: process.env.NODE_ENV === 'production' ? false : 'source-map',
};
