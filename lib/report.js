const { sql, connect } = require('./db');

module.exports = class Report {
  static async list() {
    const db = await connect();
    const reports = await db.all(`SELECT * FROM reports`);
    return reports.map(report => new Report(report));
  }

  static async create({ id, content }) {
    const db = await connect();
    return db.run(sql`
      INSERT INTO reports (id, content)
      VALUES (${id}, ${content})
    `);
  }

  static async read(id) {
    const db = await connect();
    const report = await db.get(sql`SELECT * FROM reports WHERE id=${id}`);
    return report && new Report(report);
  }

  static async update({ id, content }) {
    const db = await connect();
    return db.run(sql`UPDATE reports SET content=${content} WHERE id=${id}`);
  }

  static async delete(id) {
    const db = await connect();
    return db.run(sql`DELETE FROM reports WHERE id=${id}`);
  }

  constructor({ id, content }) {
    this.id = id;
    this.content = content;
  }
};
