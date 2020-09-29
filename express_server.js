//Require Express & body-parser libraries
const express = require("express");
const bodyParser = require("body-parser");

//Create server
const app = express();
const PORT = 8080; // default port 8080

//Use EJS (for template engine) and body-parser (for parsing incoming request bodies)
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));

//Store short-URL / long-URL pairs in in urlDatabase object
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Listening: Listen for new requests on a certain port
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Routes: Stipulate what to show the user based on their request
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});