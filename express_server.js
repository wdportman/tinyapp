//APP SET-UP ---------------------------------------------------

//Require third-party libraries:
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

//Require modules in this file from different files in this project:
const { generateRandomString, getUserByEmail, getURLsForUser } = require('./helpers');
const { urlDatabase, userDatabase } = require('./databases');

//Create server:
const app = express();
const PORT = 8080;

//Listen for new requests on specified port:
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});

//Set EJS as view engine:
app.set("view engine", "ejs");

//Set up middleware:
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ["superSecretKey","evenMoreSuperSecretKey"]
}));


//ROUTES ---------------------------------------------------


//GET routes

app.get("/", (req, res) => {
  const userObject = userDatabase[req.session["user_id"]];
  if (userObject) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  const userObject = userDatabase[req.session["user_id"]];
  const templateVars = { user: userObject };
  if (!userObject) {
    res.render("login", templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get("/register", (req, res) => {
  const userObject = userDatabase[req.session["user_id"]];
  const templateVars = { user: userObject };
  if (!userObject) {
    res.render("registration", templateVars);
  } else {
    res.redirect('/urls');
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL in urlDatabase) {
    const longURL = urlDatabase[req.params.shortURL]["longURL"];
    res.redirect(longURL);
  } else {
    res.redirect("https://www.youtube.com/watch?v=oHg5SJYRHA0");
  }
});

app.get("/urls", (req, res) => {
  const userObject = userDatabase[req.session["user_id"]];
  const id = req.session["user_id"];
  const urls = getURLsForUser(id, urlDatabase);
  const templateVars = { urls, user: userObject };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userObject = userDatabase[req.session["user_id"]];
  const templateVars = { user: userObject };
  if (userObject) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userObject = userDatabase[req.session["user_id"]];
  const urlObject = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, urlObject, user: userObject };
  if (!userObject) {
    res.redirect("/urls");
  } else {
    res.render("urls_show", templateVars);
  }
});

//Catch-all get request handler, if route is not specified above
app.get('*', (req, res) => {
  const userObject = userDatabase[req.session["user_id"]];
  const templateVars = { user: userObject };
  res.render('notFound', templateVars);
});


//POST ROUTES

app.post("/login", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  const userObject = getUserByEmail(email, userDatabase);
  const templateVars = { user: userObject };
  if (!userObject || !bcrypt.compareSync(password, userObject["password"])) {
    res.render("loginError", templateVars);
  } else {
    req.session.user_id = userObject["id"]; //set the cookie based on saved user_id
    res.redirect('/urls');
  }
});

app.post("/logout", (req, res) => {
  req.session = null; //clear the cookie when user logs out
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  const hashedPassword = bcrypt.hashSync(password, 10);
  const userObject = getUserByEmail(email, userDatabase);
  const templateVars = { user: userObject };
  if (email === "" || password === "" || getUserByEmail(email, userDatabase)) {
    res.render("registrationError", templateVars);
  } else {
    const userRandomID = generateRandomString();
    userDatabase[userRandomID] = {
      id: userRandomID,
      "email": email,
      "password": hashedPassword
    };
    req.session.user_id = userRandomID; //assign user_id cookie to userRandomID
    res.redirect('/urls');
  }
});

app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  const userObject = userDatabase[req.session["user_id"]];
  if (userObject) {
    urlDatabase[newShortURL] = { longURL: req.body["longURL"], userID: req.session["user_id"] };
    res.redirect(`/urls/${newShortURL}`);
  } else {
    res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  const id = req.session["user_id"];
  const urls = getURLsForUser(id, urlDatabase);
  const updatedLongURL = req.body["updatedLongURL"];
  const urlId = req.params.id;
  if (urls[urlId]) {
    urlDatabase[urlId]["longURL"] = updatedLongURL;
    res.redirect('/urls');
  } else {
    res.status(403).send("Update request denied: Unauthorized.");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.session["user_id"];
  const urls = getURLsForUser(id, urlDatabase);
  const urlId = req.params.id;
  if (urls[urlId]) {
    delete urlDatabase[urlId];
    res.redirect('/urls');
  } else {
    res.status(403).send("Deletion request denied: Unauthorized.");
  }
});