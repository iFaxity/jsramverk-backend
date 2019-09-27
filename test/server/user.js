const assert = require('assert').strict;
const User = require('../../lib/user');
const { connect } = require('../../db');


before(async () => {
  const db = await connect();
  const stmt = 'INSERT INTO users (email, name, password, birthdate) VALUES (?, ?, ?, ?)';

  await db.run(stmt, [ 'foo@example.com', 'Foo Tester', 'Password123', '1986-03-25' ]);
  await db.run(stmt, [ 'bar@example.com', 'Bar Tester', 'Letmein456', '2010-06-14' ]);
  await db.run(stmt, [ 'baz@example.com', 'Baz Tester', 'Verysecure83', '1976-06-14' ]);
});
after(async () => {
  const db = await connect();
  await db.run('DELETE FROM users');
});


describe('User class', () => {
  describe('static async create()', () => {
    it('with argument', async () => {
      await User.create({
        email: 'test@foo.com',
        name: 'Test Tester',
        password: 'notverysafe',
        birthdate: '1970-01-01',
      });

      const user = await User.read('test@foo.com');
      assert.ok(user instanceof User);
    });

    it('without argument', async () => {
      await assert.rejects(() => User.create());
    });
  });

  describe('static async read()', () => {
    it('with argument', async () => {
      const user = await User.read('foo@example.com');

      assert.ok(user instanceof User);
      assert.equal(user.email, 'foo@example.com');
      assert.equal(user.name, 'Foo Tester');
      assert.equal(user.password, 'Password123');
      assert.equal(user.birthdate, '1986-03-25');
    });

    it('with nonexistent user', async () => {
      const user = await User.read('notauser@example.com');
      assert.equal(typeof user, 'undefined');
    });

    it('without argument', async () => {
      await assert.rejects(() => User.read());
    });
  });

  describe('static async update()', () => {
    it('with argument', async () => {
      await User.update('bar@example.com', {
        email: 'user@example.com',
        name: 'User',
        password: 'Supersecure97',
        birthdate: '2001-02-03',
      });

      const user = await User.read('user@example.com');

      assert.equal(user.email, 'user@example.com');
      assert.equal(user.name, 'User');
      assert.equal(user.password, 'Supersecure97');
      assert.equal(user.birthdate, '2001-02-03');
    });

    it('without arguments', async () => {
      await assert.rejects(() => User.update());
    });

    it('without user argument', async () => {
      await assert.rejects(() => User.update('hello@world.com'));
    });
  });

  describe('static async delete()', () => {
    it('with argument', async () => {
      // User from previous test case
      await User.delete('baz@example.com');

      const user = await User.read('baz@example.com');
      assert.equal(typeof user, 'undefined');
    });

    it('with nonexistent user', async () => {
      // just check it doesn't throw error
      await User.delete('notauser@user.com');
    });


    it('without argument', async () => {
      await assert.rejects(() => User.delete());
    });
  });
});
