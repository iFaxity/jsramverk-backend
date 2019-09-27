const assert = require('assert').strict;
const { sql } = require('../../db');

describe('SQL template string', () => {
  it('get sql()', () => {
    const id = 8;
    const stmt = sql`SELECT * FROM table WHERE id=${id}`;

    assert.equal(typeof stmt.sql, 'string');
    assert.ok(stmt.sql.split('?').length, 2);
  });

  describe('append()', () => {
    it('with valid argument', () => {
      const id = 4;
      const text = 'Hello world';
      const stmt = sql`UPDATE table SET`;

      stmt.append(sql` id=${id}`);
      stmt.append(sql`,text=${text}`);

      assert.equal(stmt.values.length, 2);
      assert.deepEqual(stmt.values, [ id, text ]);
      assert.equal(stmt.strings.length, 3);
    });

    it('with invalid argument', () => {
      const stmt = sql`SELECT * FROM table WHERE`;

      assert.throws(() => {
        stmt.append('id=2');
      });
    });
  });
});
