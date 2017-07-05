let express = require("express");
let app = express();
let PORT = process.env.PORT || 8080;

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

// URL Database
let urlDatabase = {
  "b2xVn2": {
    shortUrl: "b2xVn2",
    longUrl: "http://www.lighthouselabs.ca"
  },

  "9sm5xK": {
    shortUrl: "9sm5xK",
    longUrl: "http://www.google.com"
  }
}


app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


//Generates a new random short URL, adds it to the urlDatabase and redirects to URL's index page
app.post("/urls", (req, res) => {
  let shortUrl = generateRandomString()
  let longUrl = req.body.longUrl
  urlDatabase[shortUrl] = {
    shortUrl: shortUrl,
    longUrl: longUrl,
  }
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Goes to the longUrl page
app.get("/u/:shortUrl", (req, res) => {
  let shortUrl = req.params.shortUrl;
  let longUrl = urlDatabase[shortUrl].longUrl;
  res.redirect(longUrl)
});

//Deletes an Url
app.post("/urls/:id/delete", (req, res) => {
  let shortUrl = req.params.id;
  delete urlDatabase[shortUrl];
  res.redirect("/urls");
});

//Updates an Url
app.post("/urls/:id", (req, res) => {
  let shortUrl = req.params.id;
  let longUrl = req.body.longUrl
  urlDatabase[shortUrl].longUrl = longUrl
  res.redirect(`/urls/${shortUrl}`);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  let shortUrl = req.params.id
  let longUrl = urlDatabase[shortUrl].longUrl
  let templateVars = {
    shortUrl: shortUrl,
    longUrl: longUrl
  }
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


// Generates a random string
function generateRandomString() {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let length = 6;
  let randomString = "";
  for (let i = length; i > 0; --i) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
}