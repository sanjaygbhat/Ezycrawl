// models/User.js
class User {
  constructor(id, email, password, creditBalance, isAdmin) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.creditBalance = creditBalance;
    this.isAdmin = isAdmin;
  }
}

module.exports = User;
