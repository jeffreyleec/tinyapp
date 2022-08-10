const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser')

app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get("/urls", (req, res) => {

  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  res.render("urls_new", templateVars);

});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  res.render("register", templateVars);
});


app.post("/urls", (req, res) => {
  //console.log(req.body.longURL); // Log the POST request body to the console
  let newId = generateRandomString()
  urlDatabase[newId] = req.body.longURL
  res.redirect(`/urls/${newId}`);

});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], user: req.cookies["user_id"] };
  res.render("urls_show", templateVars);
});


app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});



app.post("/urls/:id/delete", (req, res) => {
  //console.log('test')
  const { id } = req.params
  for (let shortURL in urlDatabase) {
    if (shortURL === id) {
      delete urlDatabase[id]
    }
  }

  res.redirect('/urls');
});



app.post("/urls/:id/edit", (req, res) => {
  //console.log('test')
  const { id } = req.params
  for (let shortURL in urlDatabase) {
    if (shortURL === id) {
      urlDatabase[id] = req.body.newURL
    }
  }
  res.redirect('/urls');
});








app.post("/logout", (req, res) => {


  res.clearCookie('user_id')//, { path: '/admin' })
  res.redirect('/urls');
});



app.post("/register", (req, res) => {
  let userId = generateRandomString()
  const userEmail = req.body.email;
  const userPassword = req.body.pass;
  if (req.body.email === '' || req.body.pass === '') {
    return res.status(400).send({
      message: 'This is an error! Missing Data'
    });
  }

  if(prexsistingEmail(userEmail)){
    //console.log('theres a match')
    return res.status(400).send({
      message: 'This is an error! Email already being used'
   });
  }

  let newProfile = {
    id: userId,
    email: userEmail,
    password: userPassword
  }

  users[userId] = newProfile
  res.cookie('user_id', newProfile, { maxAge: 900000, httpOnly: true })
  res.redirect('/urls');
});



app.post("/login", (req, res) => {

  const userEmail = req.body.email;
  const userPassword = req.body.pass;
  if (req.body.email === '' || req.body.pass === '') {
    return res.status(400).send({
      message: 'This is an error! Missing Data'
    });
  }
  
  if(prexsistingEmail(userEmail)){
    let selectUser = getUserByEmail(userEmail)
    let userStats = users[selectUser]

    if (userPassword === userStats.password) {
      res.cookie('user_id', userStats, { maxAge: 900000, httpOnly: true })
      res.redirect('/urls');
    } else {
      return res.status(403).send({
        message: 'password incorrect'
      });
    }
    
   
  } else {
    return res.status(403).send({
      message: 'e-mail cannot be found'
    });
  }

 
  

  
  
});










const generateRandomString = function () {
  let length = 6
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);

}

const prexsistingEmail = function (emailTest) {
  for (let userProfiles in users) {
    if (users[userProfiles].email === emailTest) {
      return true
    }
  }
  return false;

}


function getUserByEmail(emailTest) {
  for(let userProfiles in users){
    if (users[userProfiles].email === emailTest) {
      return userProfiles
    }
  }
  return false
}


