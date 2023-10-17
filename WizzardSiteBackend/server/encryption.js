const bcrypt = require('bcrypt');
const saltRounds = 10; // Number of salt rounds to use

// Function to hash a password
async function hashPassword(password) {
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash the password using the salt
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  } catch (error) {
    throw error;
  }
}
// Function to check a normal password against its hashed password
async function comparePasswords(plainPassword, hashedPassword) {
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      throw error;
    }
  }