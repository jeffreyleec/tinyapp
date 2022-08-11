const express = require("express");
const app = express();
const PORT = 8080;
const {getUserByEmail, prexsistingEmail, generateRandomString, findingMatchingIDURLs} =  require('./helper');


var cookieSession = require('cookie-session')
app.use(cookieSession({
  name: 'session',
  keys: ['notasecret']
}));

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
const bcrypt = require("bcryptjs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
  const matchingDatabase = findingMatchingIDURLs(req.session['user_id'], urlDatabase)
  
  const templateVars = { urls: matchingDatabase, user: users[req.session['user_id']]};
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
    const templateVars = { urls: urlDatabase, user: users[req.session['user_id']]};
  const user = users[req.session['user_id']]
  
    if (user) {
    res.render("urls_new", templateVars);
      } else {
    res.status(401).send('please login first!');
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session['user_id']]};
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);

  }


});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.session['user_id']]};

  if (templateVars.user) {
    res.redirect("/urls");
      } else {
    res.render("register", templateVars);

  }
});


app.post("/urls", (req, res) => {
  
  const templateVars = { urls: urlDatabase, user: users[req.session['user_id']]};
  if (templateVars.user && templateVars.user.password === users[templateVars.user.id].password) {
    let newId = generateRandomString();
    let longURLDATA = req.body.longURL;
    let userIDDATA = templateVars.user.id;
    urlDatabase[newId] = {};
    urlDatabase[newId].longURL = longURLDATA;
    urlDatabase[newId].userID = userIDDATA;
    
    res.redirect(`/urls/${newId}`);

  } else {
    res.redirect("/login");
  }



});

app.get("/urls/:id", (req, res) => {
  
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session['user_id']], urls: urlDatabase };

  if (urlDatabase[templateVars.id].userID === templateVars.user.id ) {
  res.render("urls_show", templateVars);
  }else {
     return res.status(404).send({
      message: 'id not found.'
    
    });
  }




  
});


app.get("/u/:id", (req, res) => {
if (urlDatabase[req.params.id]) {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
}else {
  return res.status(404).send({
    Error: 'ID not found. Please refresh and try agian.'
  });
}
  
});



app.post("/urls/:id/delete", (req, res) => {
  //console.log('test')
  const { id } = req.params;
  for (let shortURL in urlDatabase) {
    if (shortURL === id) {
      delete urlDatabase[id];
    }
  }

  res.redirect('/urls');
});



app.post("/urls/:id/edit", (req, res) => {
  const { id } = req.params;
  for (let shortURL in urlDatabase) {
    if (shortURL === id) {
      urlDatabase[id].longURL = req.body.newURL;
    }
  }
  res.redirect('/urls');
});



app.post("/logout", (req, res) => {


  req.session = null;
  res.redirect('/urls');
});



app.post("/register", (req, res) => {
  let userId = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.pass;
  const hashedPassword = bcrypt.hashSync(userPassword, 10);

  if (req.body.email === '' || req.body.pass === '') {
    return res.status(400).send({
      message: 'This is an error! Missing Data'
    });
  }

  if (prexsistingEmail(userEmail, users)) {
  
    return res.status(400).send({
      message: 'This is an error! Email already being used'
    });
  }

  let newProfile = {
    id: userId,
    email: userEmail,
    password: hashedPassword
  };

  users[userId] = newProfile;
  req.session.user_id = newProfile.id;
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

  if (prexsistingEmail(userEmail, users)) {
    let selectUser = getUserByEmail(userEmail, users);
    let userStats = users[selectUser];

    if (bcrypt.compareSync(userPassword, users[selectUser].password)) {
      req.session.user_id = userStats.id;
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










