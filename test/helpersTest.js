const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', () => {
  it('should return a user object when a  valid email is submitted', () => {
    const actualOutput = getUserByEmail("user@example.com", testUsers);
    const expectedOutput =
    {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    assert.deepEqual(actualOutput, expectedOutput);
  });
  it('should not return a user object when an invalid email is submitted', () => {
    const actualOutput = getUserByEmail("usr@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(actualOutput, expectedOutput);
  });
});