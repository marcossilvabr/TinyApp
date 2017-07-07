const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieSession = require("cookie-session");
app.use(cookieSession( {
  name: 'session',
  keys: ['key1'],
  maxAge: 24 * 60 * 60 * 1000
}));

const bcrypt = require("bcrypt");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// URL DATABASE
let urlDatabase = {
  "b2xVn2": {
    shortUrl: "b2xVn2",
    longUrl: "http://www.lighthouselabs.ca",
    createdBy: "1f2f3f" }
}

// USER DATABASE
let users = {
  "1f2f3f": {
    id: "1f2f3f",
    email: "user@example.com",
    password: "password" }
}

app.get('/urls.json', (req, res) => {
   res.json(urlDatabase);
});

app.use((req, res, next) => {
  req.logged_in = req.session.user_id;
  res.locals.user = users[req.session.user_id]
  next();
});


// HOME - If logged redirects to urls page. If not logged redirects to login page.
app.get("/", (req, res) => {
  if(res.locals.user) {
    res.redirect("/urls");
    return;
  }
  res.redirect("/login");
});

// Generates a short url and adds it to the urlDatabase
app.post("/urls", (req, res) => {
  if (req.logged_in) {
    let shortUrl = generateRandomString();
    let longUrl = req.body.longUrl;
    let createdBy = req.session.user_id;
    urlDatabase[shortUrl] = {
      shortUrl: shortUrl,
      longUrl: longUrl,
      createdBy: createdBy};
    res.redirect("/urls");
  } else {
    res.status(401).send("Please <a href='/login'>Login Here</a>");
  }
});

// Displays user's short and long urls
app.get("/urls", (req, res) => {
  if (res.locals.user) {
    const filteredDatabase = {};

    for(let url in urlDatabase) {
      if (res.locals.user.id === urlDatabase[url].createdBy) {
        filteredDatabase[url] = urlDatabase[url];
      }
    }
    let templateVars = {
      urls: filteredDatabase
    }
    res.render("urls_index", templateVars);
  } else {
      res.status(401).send("Please <a href='/login'>Login Here</a>");
  }
});

// Renders the url shortener page
app.get("/urls/new", (req, res) => {
  if (res.locals.user) {
    res.render("urls_new");
  }
  else {
    res.status(401).send("Please <a href='/login'>Login Here</a>");
  }
});

// Shows a url page (with short and long urls)
app.get("/urls/:id", (req, res) => {

  let short = req.params.id;
  if(!urlDatabase[short]) {
    res.status(404).send("Short Url not found");
    return;
  }
  if (!res.locals.user) {
    res.status(401).send("Please <a href='/login'>Login Here</a>");
    return;
  }
  if(res.locals.user.id !== urlDatabase[req.params.id].createdBy) {
    res.status(403).send("You can't change an url from another user");
  }
  let long  = urlDatabase[short].longUrl;
  let templateVars = {
    shortUrl: short,
    longUrl: long
  };
  res.render("urls_show", templateVars);
});

// Redirects to the long url page
app.get("/u/:shortUrl", (req, res) => {

  let shortUrl = req.params.shortUrl;
  if(!urlDatabase[shortUrl]) {
    res.status(404).send("URL does not exist");
  }
  let longUrl = urlDatabase[shortUrl].longUrl;
  res.redirect(longUrl);
});

// Deletes an url
app.post("/urls/:id/delete", (req, res) => {
  let shortUrl = req.params.id;
  delete urlDatabase[shortUrl];
  res.redirect("/urls");
})

// Updates an urls
app.post("/urls/:id", (req, res) => {
  let shortUrl = req.params.id;
  if(!urlDatabase[shortUrl]) {
    res.status(404).send("Short Url not found");
    return;
  }
  if (!res.locals.user) {
    res.status(401).send("Please <a href='/login'>Login Here</a>");
    return;
  }
  if(res.locals.user.id !== urlDatabase[req.params.id].createdBy) {
    res.status(403).send("You can't change an url from another user");
    return;
  }


  let longUrl = req.body.longUrl;
  urlDatabase[shortUrl].longUrl = longUrl;
  res.redirect(`/urls/${shortUrl}`);
})

// Renders the login page
app.get("/login", (req, res) => {
  if(!res.locals.user) {
    res.render("urls_login");
    return;
  }
  res.redirect("/urls");
})

// Login post request
app.post("/login", (req, res) => {
  let email     = req.body.email;
  let password  = req.body.password;

  if(email === "" || password === "") {
    res.status(401).send("Please provide your Login and Password");
    return;
  }
    for (let user_id in users) {
      let user = users[user_id];
      let hashed_password = bcrypt.compareSync(password, users[user_id].password);
      if (email === user.email) {

        if (!hashed_password) {
          res.status(403).send("Password does not match");
          return;
        } else {
          req.session.user_id = user_id;
          res.redirect("/");
          return;
        }
      }
    } res.status(404).send("Email not found")
});

// Logout post request
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
})

// Renders the registration page
app.get("/register", (req, res) => {
   if(!res.locals.user) {
    res.render("urls_register");
    return;
  }
  res.redirect("/");
})

// Registration post request
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let hashed_password = bcrypt.hashSync(password, 10);

  if (email === "" || password === "") {
    res.status(400).send("Please provide your Login and Password");
    return;
  }
    for (let item in users) {
      let value = users[item];
      if(email === value.email) {
        res.status(400).send("This email is already registered");
      }
    }

  let user_id   = generateRandomString();
  let userInfo = {
    id: user_id,
    email: email,
    password: hashed_password
  }
  users[user_id] = userInfo;
  req.session.user_id = user_id;
  res.redirect("/urls");
});

// Function to generate 6 random characters (used both for user and short url creation)
generateRandomString = function() {
  let s = Math.random().toString(36).slice(2);
  return s.substr(0, 6);
}

app.listen(PORT, () => {
  console.log(`Express Server listening on port ${PORT}!`);
});