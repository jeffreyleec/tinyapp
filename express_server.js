const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

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

  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  //console.log(users)
  //console.log(urlDatabase)
  //console.log([templateVars.user.id])

  if (templateVars.user && templateVars.user.password === users[templateVars.user.id].password) {
    //&& templateVars.user.password === users[templateVars.user.id].password
    res.render("urls_new", templateVars);
    //console.log('test');
  } else {
    res.status(401).send('please login first!');
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };
  //console.log(templateVars.user.email)
  if (templateVars.user) {
    res.redirect("/urls");
   // console.log('test');
  } else {
    res.render("login", templateVars);

  }


});

app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"] };


  if (templateVars.user) {
    res.redirect("/urls");
    console.log('test');
  } else {
    res.render("register", templateVars);

  }
});


app.post("/urls", (req, res) => {
  
  const templateVars = { urls: urlDatabase, user: req.cookies["user_id"]};
  //console.log(req.body.longURL); // Log the POST request body to the console
  if (templateVars.user && templateVars.user.password === users[templateVars.user.id].password) {
    //&& templateVars.user.password === users[templateVars.user.id].password
    let newId = generateRandomString();
    let longURLDATA = req.body.longURL;
    let userIDDATA = templateVars.user.id;
    urlDatabase[newId] = {};
    urlDatabase[newId].longURL = longURLDATA;
    urlDatabase[newId].userID = userIDDATA;
   //console.log(templateVars.user.id)
    //let matchingIDURLs = findingMatchingIDURLs(templateVars.user.id)
    
//LAST HERE CHANGE ^^^^^^^^^^^^^^^^^^^^^******
    //console.log(urlDatabase)
    res.redirect(`/urls/${newId}`);
  } else {
    res.redirect("/login");
  }

  // let newId = generateRandomString()
  // urlDatabase[newId] = req.body.longURL
  // res.redirect(`/urls/${newId}`);

});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: req.cookies["user_id"], urls: urlDatabase };

  if (urlDatabase[templateVars.id].userID === templateVars.user.id ) {
  res.render("urls_show", templateVars);
  }else {
    //console.log(urlDatabase[templateVars.id].userID)
    //console.log(templateVars.user.id)
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
  //console.log('test')

  const { id } = req.params;
  for (let shortURL in urlDatabase) {
    if (shortURL === id) {
      urlDatabase[id].longURL = req.body.newURL;
    }
  }
  res.redirect('/urls');
});








app.post("/logout", (req, res) => {


  res.clearCookie('user_id');//, { path: '/admin' })
  res.redirect('/urls');
});



app.post("/register", (req, res) => {
  let userId = generateRandomString();
  const userEmail = req.body.email;
  const userPassword = req.body.pass;
  if (req.body.email === '' || req.body.pass === '') {
    return res.status(400).send({
      message: 'This is an error! Missing Data'
    });
  }

  if (prexsistingEmail(userEmail)) {
    //console.log('theres a match')
    return res.status(400).send({
      message: 'This is an error! Email already being used'
    });
  }

  let newProfile = {
    id: userId,
    email: userEmail,
    password: userPassword
  };

  users[userId] = newProfile;
  res.cookie('user_id', newProfile, { maxAge: 900000, httpOnly: true });
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

  if (prexsistingEmail(userEmail)) {
    let selectUser = getUserByEmail(userEmail);
    let userStats = users[selectUser];

    if (userPassword === userStats.password) {
      res.cookie('user_id', userStats, { maxAge: 900000, httpOnly: true });
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
  let length = 6;
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);

};

const prexsistingEmail = function (emailTest) {
  for (let userProfiles in users) {
    if (users[userProfiles].email === emailTest) {
      return true;
    }
  }
  return false;

};


function getUserByEmail(emailTest) {
  for (let userProfiles in users) {
    if (users[userProfiles].email === emailTest) {
      return userProfiles;
    }
  }
  return false;
}

function findingMatchingIDURLs(userIdentity) {
  let matching = [];
    for (let key in urlDatabase){
      if ( urlDatabase[key].userID === userIdentity) {
        matching.push(urlDatabase[key].longURL);
      }
    }
    return matching;
  }



