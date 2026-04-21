const bcrypt = require('bcryptjs')
const SALT_ROUNDS = 10
// Hache un mot de passe en clair
const hashPassword = (plainPassword) =>
  bcrypt.hash(plainPassword, SALT_ROUNDS)
// Compare un mot de passe en clair avec son hash
const comparePassword = (plainPassword, hashedPassword) =>
  bcrypt.compare(plainPassword, hashedPassword)
module.exports = { hashPassword, comparePassword }