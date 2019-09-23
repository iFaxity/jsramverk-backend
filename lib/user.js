const { sql, connect } = require('./db');

module.exports = class User {
  static async create({ email, name, password, birthdate }) {
    const db = await connect();

    return db.run(sql`
      INSERT INTO users (email, name, password, birthdate)
      VALUES (${email}, ${name}, ${password}, ${birthdate})
    `);
  }

  static async read(email) {
    const db = await connect();
    const user = await db.get(sql`SELECT * FROM users WHERE email=${email}`);
    return user && new User(user);
  }

  static async update({ email, name, password, birthdate }) {
    const db = await connect();
    return db.run(sql`
      UPDATE users
      SET email=${email}, name=${name}, password=${password}, birthdate=${birthdate}
      WHERE email=${email}
    `);
  }

  static async delete(email) {
    const db = await connect();
    return db.run(sql`DELETE FROM users WHERE email = ${email}`);
  }

  constructor({ email, name, password, birthdate }) {
    this.email = email;
    this.name = name;
    this.password = password;
    this.birthdate = birthdate;
  }
};


/*async function kek() {
  const bcrypt = require('bcrypt');
  const User = module.exports;

  const user = await User.read('test@test.com');

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash('Testing123', salt);

  await User.update(user);
}

kek().then(() => console.log('kek'));*/
