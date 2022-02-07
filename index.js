import express from 'express'; // on importe la bibliotheque express
import { Helper } from './helper/helper.js';
import { Word } from './models/Word.js';
import { Page } from './models/Page.js';
import fetch from "node-fetch"; // on importe fetch pour avoir acces a la method fetch qui permet de transformer une page html en texte
import Cheerio from 'cheerio'; // on importe la methode load de la biblioteque cheerio
import fs from 'fs'; // on importe fs qui sert à interagir avec les fichier json

let filePath = './stockage.json' // je créer un chemin pour stocker mon fichier json

if (!fs.existsSync(filePath)) { // je verifie si le fichier existe
  fs.writeFileSync(filePath, JSON.stringify([])); // s'il n'éxiste pas, alors je créer un fichier json avec le chemin de "filePath" et j'insert un tableau vide dedans (JSON.stringify sert à le mettre en string)
}


const app = express(); // initialisation de l'appli express
app.use(express.static('./assets')); // demande a express d'aller chercher les fichers statics (image, css; js...) dans le dossier assets
app.use(express.urlencoded({ extended: true })); // pour configurer express



app.listen(8080, () => { //methode native express qui permet d'écouter sur un port soit un lieu de stockage du site
  console.log("Le serveur a démarré et fonctionne");
})



//localhost:8080 pour trouver la page
app.get('/', async (req, res) => {// "/" sera à la fin de l'url
  let fileContent = fs.readFileSync(filePath); // "readFileSync" capture le contenue et "JSON.parse" transforme le text en objet 
  fileContent = JSON.parse(fileContent)
  let string = "";
  for (let i = 0; i < fileContent.length; i++) {
    string = string + "<p>" + fileContent[i].url + "</p>" // pour l'introduire un <p> plus tard dans indexation.html.twig
  }
  res.render('indexation.html.twig',// est le fichier où l'on veut accéder // La methode "render" affiche le fichier en argument
    {
      message: string
    });
})



//localhost:8080/recherche pour trouver la page
app.get('/recherche', async (req, res) => {// "/recherche" sera à la fin de l'url
  
  res.render('recherche.html.twig',// est le fichier où l'on veut accéder // La methode "render" affiche le fichier en argument
    {

    });
})






app.post('/', async (req, res) => {
  let tableau = []
  let contentFile = JSON.parse(fs.readFileSync(filePath)); // fs.readFileSync capture le contenu et JSON.parse converti le texte en objet
  for (let i = 0; i < contentFile.length; i++) {
    tableau.push(contentFile[i].url)
  }
  if (!tableau.includes(req.body.url)) { // "includes" est une fonction js pour verifier si l'argument est present dans le tableau / body.url" pour recuperer seulement l'url / si l'url n'existe pas dans le tableau...
    const response = await fetch(req.body.url); // "feth()" aspire l'url en argument
    const body = await response.text(); // converti en text le contenu de l'url
    const cheerio = Cheerio.load(body); // je load le html dans "body"
    let text = cheerio('body').text() // c'est le texte de la page
    let title = cheerio('title').text()
    let tabObj = count(text)
    let page = new Page(title, req.body.url, tabObj)
    contentFile.push(page)
    fs.writeFileSync(filePath, JSON.stringify(contentFile, null, 4));
    // ...alors on insere l'url dans le tableau
  }
  res.redirect("/")
})




app.post('/recherche', async (req, res) => {
  console.log(req.body.word);
  let word = req.body.word;

  let fileContent = JSON.parse(fs.readFileSync(filePath));
  let tableau = [];
  for (let i = 0; i < fileContent.length; i++) {
    for (let j = 0; j < fileContent[i].words.length; j++) {
      console.log(word);
      if (fileContent[i].words[j].word.toLowerCase() === word) {
       let obj = {
         word: word,
         url: fileContent[i].url,
         titre: fileContent[i].titre,
         count:fileContent[i].words[j].count,
       }
        tableau.push(obj)
      }
    }
  }
  console.log(tableau);
  tableau.sort(function (a, b) {
    return b.count - a.count  ;
  });
  let string = '';
  for (let i = 0; i < tableau.length; i++) {
    string = string + "<p>" + tableau[i].titre + " apparait "+ tableau[i].count + " fois" + "</p>" // pour l'introduire un <p> plus tard dans indexation.html.twig
    
  }
  res.render('recherche.html.twig',// est le fichier où l'on veut accéder // La methode "render" affiche le fichier en argument
    {
      message: string
    });
})





function count(str) { // compte le nombre d'occurence mot par mot
  let tab = str.split(/[^a-zA-ZàèìòùÀÈÌÒÙáéíóúýÁÉÍÓÚÝâêîôûÂÊÎÔÛãñõÃÑÕäëïöüÿÄËÏÖÜŸçÇßØøÅåÆæœ]/); // je créer un tableau pour stocker tout les mots d'un texte grace à "split"
  let subText = [];
  let tabObj = [];
  for (let i = 0; i < tab.length; i++) {// je parcours tous les mots de "tab"
    for (let j = 0; j < tab.length; j++) { //je parcours une deuxieme fois tous les mots de "tab"
      if (tab[j] === tab[i]) { // je compare les mots des deux parcours et s'ils sont égaux...
        subText.push(tab[j]); // ... je push le mot dans le tableau "subText"
      }
    }
    let obj = new Word(tab[i], subText.length) // je créer un objet avec le mot et son nombre d'occurence
    tabObj.push(obj); // je stock tous les objets dans ce tableau
    subText.splice(0, subText.length); // je supprime le contenu de subText pour les prochains mots
    Helper.removeOcurence(tab, tab[i]);
    i--;
  }
  return tabObj
}


