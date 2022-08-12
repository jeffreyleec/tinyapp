const generateRandomString = function () {
  let length = 6;
  return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);

};

const prexsistingEmail = function (emailTest, database) {
  for (let userProfiles in database) {
    if (database[userProfiles].email === emailTest) {
      return true;
    }
  }
  return false;

};


function urlsForUser(userIdentity, database) {
  let matching = {};
    for (let key in database){
      if ( database[key].userID === userIdentity) {
        //matching.push(urlDatabase[key].longURL);
        matching[key]= database[key]
      }
    }
    return matching;
  }


  const getUserByEmail = function(email, database) {
    for (let userProfiles in database) {
      if (database[userProfiles].email === email) {
        return database[userProfiles];
      }
    }
    return false;
  };



  module.exports = {getUserByEmail, prexsistingEmail, generateRandomString, urlsForUser};