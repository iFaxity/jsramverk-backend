const assert = require('assert').strict;
const Report = require('../../lib/report');
const { connect } = require('../../db');


before(async () => {
  const db = await connect();
  const stmt = 'INSERT INTO reports (id, content) VALUES (?, ?)';

  await db.run(stmt, [ 1, 'Hello World!' ]);
  await db.run(stmt, [ 2, 'Some content' ]);
  await db.run(stmt, [ 3, 'Banana is in fact a fruit' ]);
});

after(async () => {
  const db = await connect();
  await db.run('DELETE FROM reports');
});


describe('Report class', () => {
  it('static async list()', async () => {
    const reports = await Report.list();
    assert.ok(Array.isArray(reports));
  });

  describe('static async create()', () => {
    it('with argument', async () => {
      await Report.create({
        id: 4,
        content: 'Foo',
      });

      const report = await Report.read(4);
      assert.ok(report instanceof Report);
      assert.equal(report.id, 4);
      assert.equal(report.content, 'Foo');
    });

    it('without argument', async () => {
      await assert.rejects(() => Report.create());
    });
  });

  describe('static async read()', () => {
    it('with argument', async () => {
      const report = await Report.read(1);
      assert.ok(report instanceof Report);
      assert.equal(report.id, 1);
      assert.equal(report.content, 'Hello World!');
    });

    it('with nonexistent id', async () => {
      const report = await Report.read(75);
      assert.equal(typeof report, 'undefined');
    });

    it('without argument', async () => {
      await assert.rejects(() => Report.read());
    });
  });

  describe('static async update()', () => {
    it('with argument', async () => {
      await Report.update(2, {
        id: 5,
        content: 'Testing',
      });

      const report = await Report.read(5);
      assert.ok(report instanceof Report);
      assert.equal(report.id, 5);
      assert.equal(report.content, 'Testing');
    });

    it('without arguments', async () => {
      await assert.rejects(() => Report.update());
    });

    it('without user argument', async () => {
      await assert.rejects(() => Report.update(1));
    });
  });

  describe('static async delete()', () => {
    it('with argument', async () => {
      await Report.delete(3);

      const report = await Report.read(3);
      assert.equal(typeof report, 'undefined');
    });

    it('with nonexistent id', async () => {
      await Report.delete(63);
    });

    it('without argument', async () => {
      await assert.rejects(() => Report.delete());
    });
  });
});
