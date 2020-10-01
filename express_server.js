//SERVER SET-UP ---------------------------------------------------------------------------

//Require third-party libraries:
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');

//Create server:
const app = express();
const PORT = 8080; // default port 8080

//Set EJS as view engine:
app.set("view engine", "ejs");

//Middleware: Set up body-parser (which parses HTTP request bodies) and Morgan (which logs HTTP requests to console)
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ["superSecretKey","evenMoreSuperSecretKey"]
}));

//DATA ---------------------------------------------------------------------------

//URLs:
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

//Users:
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//FUNCTIONS ---------------------------------------------------------------------------

//Random string generator for short URLs:
const generateRandomString = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let output = "";
  for (let i = 0; i < 6; i++) {
    output += characters[Math.floor(Math.random() * characters.length)];
  }
  return output;
};

//Return associated user object if email is in database
const returnUserObjectForEmail = (email, database) => {
  for (const user in database) {
    if (email === database[user]["email"]) {
      return database[user];
    }
  }
  return false;
};

//Returns the URLs where the userID is equal to the ID of the currently logged-in user:
const urlsForUser = (id) => {
  const output = {};
  for (url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      output[url] = urlDatabase[url];
    }
  }
  return output;
};

//ROUTES ---------------------------------------------------------------------------

//Redirect "/" requests to URLs page:
app.get("/", (req, res) => {
  res.redirect('/urls');
});

//Show URLs "database":
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Show user "database":
app.get("/users.json", (req, res) => {
  res.json(users);
});

//The below route shows a listing of all long-and-short URL pairs:
app.get("/urls", (req, res) => {
  const userObject = users[req.session["user_id"]];
  const id = req.session["user_id"];
  const urls = urlsForUser(id);
  const templateVars = { urls, user: userObject };
  if (!userObject) {
    res.status(403).send("Please log in or register.");
  } else {
    res.render("urls_index", templateVars);
  }
});

//The below route shows a submit-new-URL page:
app.get("/urls/new", (req, res) => {
  const userObject = users[req.session["user_id"]];
  const templateVars = { user: userObject };
  if (!userObject) {
    res.status(403).send("Please log in or register.");
  } else {
    res.render("urls_new", templateVars);
  }
});

//The below route shows, for a given short URL, what its long URL is:
app.get("/urls/:shortURL", (req, res) => {
  const userObject = users[req.session["user_id"]];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], user: userObject };
  if (!userObject) {
    res.redirect("/login");
  } else {
    res.render("urls_show", templateVars);
  }
});

//The below route sends users to the long URL when they use the short URL endpoint:
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});

//Send users to registration page:
app.get("/register", (req, res) => {
  const userObject = users[req.session["user_id"]];
  const templateVars = { user: userObject };
  res.render("registration", templateVars);
});

//Send users to login page:
app.get('/login', (req, res) => {
  const userObject = users[req.session["user_id"]];
  const templateVars = { user: userObject };
  res.render("login", templateVars);
});

//POST
//Handle post request when user submits new URL (on /urls/new):
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = { longURL: req.body["longURL"], userID: req.session["user_id"] };
  res.redirect(`/urls/${newShortURL}`);
});

//Handle post request when user deletes URL (on /urls):
app.post("/urls/:id/delete", (req, res) => {
  const id = req.session["user_id"];
  const urls = urlsForUser(id);
  const urlId = req.params.id;
  if (urls[urlId]) {
    delete urlDatabase[urlId];
    res.redirect('/urls');
  } else {
    res.status(403).send("Deletion request denied: Unauthorized.");
  }
});

//Handle post request when user updates a URL (on /urls_show):
app.post("/urls/:id", (req,res) => {
  const id = req.session["user_id"];
  const urls = urlsForUser(id);
  const updatedLongURL = req.body["updatedLongURL"];
  const urlId = req.params.id;
  if (urls[urlId]) {
    urlDatabase[urlId]["longURL"] = updatedLongURL;
    res.redirect('/urls');
    } else {
    res.status(403).send("Update request denied: Unauthorized.");
  }
});

//Handle login request:
app.post("/login", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  const userObject = returnUserObjectForEmail(email, users);
  if (!userObject) {
    res.status(403).send("This email address is not registered.");
  } else if (!bcrypt.compareSync(password, userObject["password"])) {
    res.status(403).send("Invalid password.");
  } else {
    req.session.user_id = userObject["id"]; //set the cookie based on saved user_id
    res.redirect('/urls');
  }
});

//Handle logout request
app.post("/logout", (req, res) => {
  req.session = null; //clear the cookie when user logs out
  res.redirect('/urls');
});

//Handle registration request:
app.post("/register", (req, res) => {
  const email = req.body["email"];
  const password = req.body["password"];
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (email === "" || password === "") {
    res.status(400).send("Please submit a valid email and password.");
    //add "go back to registration page" option here?
  } else if (returnUserObjectForEmail(email, users)) {
    res.status(400).send("This email is already registered.");
  } else {
    const userRandomID = generateRandomString();
    users[userRandomID] = {
      id: userRandomID,
      "email": email,
      "password": hashedPassword
    };
    req.session.user_id = userRandomID; //assign user_id cookie to userRandomID
    res.redirect('/urls');
  }
});

//Catch-all get request handler, if route is not specified above
app.get('*', (req, res) => {
  res.status(404).send('Page not found');
});

// LISTENER ---------------------------------------------------------------------------

//Listening: Listen for new requests on a certain port:
app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});