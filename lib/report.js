const { sql, connect } = require('../db');

module.exports = class Report {
  static async list() {
    const db = await connect();
    const reports = await db.all(`SELECT id FROM reports`);
    return reports.map(report => new Report(report));
  }

  static async create(report) {
    if (typeof report != 'object') {
      throw new TypeError(`Parameter report, expected object got ${typeof report}`);
    }

    const db = await connect();
    return db.run(sql`
      INSERT INTO reports (id, content)
      VALUES (${report.id}, ${report.content})
    `);
  }

  static async read(id) {
    if (typeof id != 'number') {
      throw new TypeError(`Parameter id, expected number got ${typeof id}`);
    }

    const db = await connect();
    const report = await db.get(sql`SELECT * FROM reports WHERE id=${id}`);
    return report && new Report(report);
  }

  static async update(id, report) {
    if (typeof id != 'number') {
      throw new TypeError(`Parameter id, expected number got ${typeof id}`);
    } else if (typeof report != 'object') {
      throw new TypeError(`Parameter report, expected object got ${typeof report}`);
    }

    const db = await connect();
    return db.run(sql`UPDATE reports SET id=${report.id}, content=${report.content} WHERE id=${id}`);
  }

  static async delete(id) {
    if (typeof id != 'number') {
      throw new TypeError(`Parameter id, expected number got ${typeof id}`);
    }

    const db = await connect();
    return db.run(sql`DELETE FROM reports WHERE id=${id}`);
  }

  constructor({ id, content }) {
    this.id = id;
    this.content = content;
  }
};
