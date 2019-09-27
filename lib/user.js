const { sql, connect } = require('../db');

module.exports = class User {
  static async create(user) {
    if (typeof user != 'object') {
      throw new TypeError(`Parameter user, expected string got ${typeof user}`);
    }

    const db = await connect();
    return db.run(sql`
      INSERT INTO users (email, name, password, birthdate)
      VALUES (${user.email}, ${user.name}, ${user.password}, ${user.birthdate})
    `);
  }

  static async read(email) {
    if (typeof email != 'string') {
      throw new TypeError(`Parameter email, expected string got ${typeof email}`);
    }

    const db = await connect();
    const user = await db.get(sql`SELECT * FROM users WHERE email=${email}`);
    return user && new User(user);
  }

  static async update(email, user) {
    if (typeof email != 'string') {
      throw new TypeError(`Parameter email, expected string got ${typeof email}`);
    } else if (typeof user != 'object') {
      throw new TypeError(`Parameter user, expected string got ${typeof user}`);
    }

    const db = await connect();
    return db.run(sql`
      UPDATE users
      SET email=${user.email}, name=${user.name}, password=${user.password}, birthdate=${user.birthdate}
      WHERE email=${email}
    `);
  }

  static async delete(email) {
    if (typeof email != 'string') {
      throw new TypeError(`Parameter email, expected string got ${typeof email}`);
    }

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
