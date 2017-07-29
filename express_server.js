//Essential requirements
const http = require("http");
const express = require("express");
const app = express();
app.use(express.static('public'));
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080;
const cookieSession = require('cookie-session');



// For encrypting passwords:
const bcrypt = require('bcrypt');

//Bodyparser

app.use(bodyParser.urlencoded({extended: true }));
app.set('view engine', 'ejs');


// Hardcoded user database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "user3@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "abcdef": {
    id: "abcdef",
    email: "lighthouse@lighthouse.com",
    password: bcrypt.hashSync("lighthouse", 10)
  }
};

//establishes an easy hardcoded database for debugging
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  },
  "9sm5Ad": {
    longURL: "http://www.lighthouse.com",
    userID: "abcdef"
  }
};



// Allows for parsing of cookies
app.use(cookieSession({
  name: 'session',
  keys: [process.env.SESSION_SECRET || "testing"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000
}));

app.use( (req, res, next) => {

  res.locals.user = users[req.session.userId];

  next();

});

app.use("/urls", (req, res, next) => {
  const userId = req.session.userId;
    if (userId) {
      next();
    } else {
      res.status(401).send('You need to login to access this page <br><a href="/register"><button>Register</button></a><br><a href="/login"><button>Login</button></a>');
    }

});

//Functions to be moved over later
function generateRandomString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < 6; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//Allows JS to "sleep" for a given number of milliseconds
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function userSpecificUrls(userID) {
  let result = {};

  for (let key in urlDatabase) {
    let url = urlDatabase[key];

    if (userID === url.userID) {
      result[key] = url;
    }
  }

  return result;
}



// PAGES


//index page
app.get('/', function (req, res) {
  res.render('pages/index');
});

//about page
app.get('/about', function (req, res) {
  res.render('pages/about');
});

//Register page
app.get("/register", (req, res) => {
  let templateVars = {urls: urlDatabase};
  res.render("pages/register", templateVars);
});

app.post("/register", (req, res) =>{
  var user_id = generateRandomString();
  const hashed_password = bcrypt.hashSync(req.body.password, 10);
  if(!req.body.email || !req.body.password) {
    res.status(400);
    res.send('Email or Password can not be empty.');
    return;
  }
  for (user in users) {
    if(users[user].email === req.body.email){
      res.status(403);
      res.send('Email already exists.<br><a href="/register"><button>Try again</button></a><br><a href="/login"><button>Login</button></a>');
      return;
    }
  }
  users[user_id] = {
    id: user_id,
    email: req.body.email,
    password: hashed_password
  };
  req.session.userId = user_id;

  res.redirect("/login");
});

// Login the user
app.get("/login", (req, res) => {
  let templateVars = { user: req.user };
  console.log(templateVars);
  res.render("pages/login", templateVars);
});

app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400).send("Opps, Email or password left blank.  Please <a href='/login'>try again</a>.");
    return;
  }
  for (let user in users) {
    if (users[user].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, users[user].password)) {
        req.session["userId"] = users[user].id;
        res.redirect("/urls");
        return;
      } else {
        res.status(403).send("Sorry that's the Incorrect password.  Please <a href='/login'>try again</a>.");
        return;
      }
    }
  }
  res.status(403).send("Sorry, Email does not exist!  Please <a href='/register'>register</a>.");
});

// Logs out the user
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});



// JSON info
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// URLS page
app.get("/urls", (req, res) => {
    let userId = req.session.userId;
    let templateVars = { urls: userSpecificUrls(userId) };
    res.render("pages/urls_index", templateVars);
});

// Generates and posts new shortened URL to the /urls page
app.post("/urls", (req, res) => {
  let tempURL = req.body.longURL;
  if (!(tempURL.slice(0,6) == "http://" || tempURL.slice(0,7) == "https://")) {
    tempURL = `http://${tempURL}`;
    console.log('tempURL is' + tempURL);
  }
  urlDatabase[generateRandomString()] = {longurl: tempURL, userId: req.session.userId};
  console.log(urlDatabase);
  res.redirect("/urls");
});


// For creating a new url
app.get("/urls/new", (req, res) => {
    res.render("pages/urls_new");

});


//Single url with shortened key
app.get("/urls/:id", (req, res) => {

  if (req.params.id in urlDatabase) {
    let url = urlDatabase[req.params.id];
    let templateVars = { urls: userSpecificUrls(userId) };
    url.shortURL = req.params.id;
    res.render("pages/urls_show", templateVars);
  } else {
    res.status(404).send('MiniscURL not found!<br><a href="/register"><button>Register</button></a><br><a href="/login"><button>Login</button></a>');
  }
});

// Deletes a specified MiniscURL
app.post("/urls/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userId === req.session.userId) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls/");
  }
  res.redirect("/");
});

//Updates a user's given MiniscURL
app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = {
    longURL: req.body.longURL,
    userID: req.session.userId
  };
  res.redirect('/urls');
});

//
app.get("/u/:shortURL", (req, res) => {
  const ID = req.params.shortURL;
  console.log(req.params.shortURL);
  console.log(ID);
  const longURL = urlDatabase[ID];

  // if(!longURL) {
  //   res.render("pages/urls_new"); //Directs you to the make a new URL page FIX LATER
  // }
  res.redirect(longURL);
});


// allows my server to listen to port 8080
app.listen(8080);
console.log('8080 is the magic port');
