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
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (email === database[user]["email"]) {
      return database[user];
    }
  }
};

//Returns the URLs where the userID is equal to the ID of the currently logged-in user:
const getURLsForUser = (id, database) => {
  const output = {};
  for (const url in database) {
    if (database[url]["userID"] === id) {
      output[url] = database[url];
    }
  }
  return output;
};

module.exports = { generateRandomString, getUserByEmail, getURLsForUser };