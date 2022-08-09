const express = require("express");
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
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




app.post("/urls", (req, res) => {
  console.log(req.body.longURL); // Log the POST request body to the console
  
  
  let newId = generateRandomString()
  urlDatabase[newId] = req.body.longURL
  //res.redirect(`/urls/${newId}`)
  //console.log(id)
    //const templateVars = { id: newId, longURL: newLink };
  //res.render("urls_show", templateVars);
  res.redirect(`/urls/${newId}`);
  //res.send("Ok"); // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
   const longURL = urlDatabase[req.params.id]
  //  console.log(longURL)

    //const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };

  //  res.render(longURL, templateVars);


  res.redirect(longURL);
});

//<%- include('partials/_header') %> 


const generateRandomString = function() {
  let length = 6
  return  Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);

}
