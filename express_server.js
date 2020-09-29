//Require Express & body-parser libraries:
const express = require("express");
const bodyParser = require("body-parser");

//Create server:
const app = express();
const PORT = 8080; // default port 8080

//Use EJS (for template engine) and body-parser (for parsing incoming request bodies):
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

//Store short-URL / long-URL pairs in in urlDatabase object:
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Listening: Listen for new requests on a certain port:
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Random string generator for short URLs:
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let output = "";
  for (let i = 0; i < 6; i++) {
    output += characters[Math.floor(Math.random() * characters.length)];
  }
  return output;
};

//Routes: Stipulate what to show the user based on their request:
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//The below route shows a listing of all long-and-short URL pairs:
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//The below route shows a submit-new-URL page:
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//The below route shows, for a given short URL, what its long URL is:
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

//The below route sends users to the long URL when they use the endpoint :
app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//POST
//Handle post request when user submits new URL on /urls/new
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body["longURL"];  // Generate new short URL and add it to database object as key for long URL value
  res.redirect(`/urls/${newShortURL}`);       // Redirect user to new shortURL page for inputted URL
});