const assert = require('assert').strict;
const Auth = require('../../lib/auth');
const { connect, sql } = require('../../db');

function isJWT(token) {
  // JWT token should have 3 parts (header, payload, signature)
  return typeof token == 'string' && token.split('.').length == 3;
}

// Ensure users are deleted after test is done
after(async () => {
  const db = await connect();
  await db.run('DELETE FROM users');
});

describe('Auth ', () => {
  describe('async createToken()', () => {
    it('no payload', async () => {
      const token = await Auth.createToken({});

      assert.ok(isJWT(token));
    });

    it('with payload', async () => {
      const token = await Auth.createToken({
        email: 'someemail',
      });

      assert.ok(isJWT(token));
    });
  });

  describe('async createPassword()', () => {
    it('with password', async () => {
      const password = await Auth.createPassword('Hello123');

      assert.equal(typeof password, 'string');
      assert.equal(password.split('$').length, 4);
    });

    it('no password', async () => {
      await assert.rejects(() => Auth.createPassword());
    });
  });

  describe('async register()', () => {
    it('with credentials', async () => {
      await Auth.register({
        email: 'test@example.com',
        name: 'Tester',
        password: 'somepassword',
        birthdate: '1970-01-01',
      });
    });

    it('without credentials', async () => {
      await assert.rejects(() => Auth.register());
    });
  })

  describe('async login()', () => {
    it('with credentials', async () => {
      // Create user first
      const password = await Auth.createPassword('Letmein123');
      const db = await connect();
      await db.run(sql`
        INSERT INTO users (email, name, password, birthdate)
        VALUES ('user@test.com', 'Tester', ${password}, '1970-01-01')
      `);

      const token = await Auth.login('user@test.com', 'Letmein123');

      assert.ok(isJWT(token));
    });

    it('without credentials', async () => {
      await assert.rejects(() => Auth.login());
    });
  });
});

