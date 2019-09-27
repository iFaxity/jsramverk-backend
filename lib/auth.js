const createError = require('http-errors');
const bcrypt = require('bcrypt');
const jwt = require('@ifaxity/jwt');
const User = require('./user');

const {
  JWT_SECRET,
  JWT_ISSUER,
  JWT_EXPIRES_IN,
  JWT_MAX_AGE,
} = require('@ifaxity/env');

const Auth = {
  /**
   * Creates a new JWT token
   * @param {object} payload
   */
  createToken(payload) {
    // Create a JWT Token
    return jwt.sign(payload, JWT_SECRET, {
      issuer: JWT_ISSUER,
      expiresIn: JWT_EXPIRES_IN,
    });
  },

  /**
   * Hashes and salts password with bcrypt
   * @param {string} password
   */
  async createPassword(password) {
    const salt = await bcrypt.genSalt(12);
    return bcrypt.hash(password, salt);
  },

  /**
   * Logins the user and creates a new token
   * @param {string} email
   * @param {string} password
   * @returns {string}
   */
  async login(email, password) {
    // Used to generate a token for a user
    const user = await User.read(email);

    if (!user) {
      throw createError(400, 'Ogiltiga inloggningsuppgifter!');
    } else {
      // Check if the passwords match
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        throw createError(400, 'Ogiltiga inloggningsuppgifter!');
      }

      // Create a JWT Token
      return this.createToken({ email: email });
    }
  },

  /**
   * Registers a new user
   * @param {object} user
   * @param {string} user.email
   * @param {string} user.name
   * @param {string} user.password
   * @param {string} user.birthdate
   */
  async register({ email, name, password, birthdate }) {
    // Creates a new user but does not log the user in
    const user = await User.read(email);
    if (user) {
      throw createError(400, 'En användare med den emailen finns redan!');
    }

    const hash = await Auth.createPassword(password);

    await User.create({
      email,
      name,
      password: hash,
      birthdate
    });
  },

  /**
   * Authenticates before continuing the route
   */
  async middleware(ctx, next) {
    const now = Math.floor(Date.now() / 1000);

    if (!ctx.headers.authorization) {
      ctx.throw(401, 'Auktoriseringsheadern saknas!');
    }

    // Extract token from Authorisation header
    const [ type, token ] = ctx.headers.authorization.split(' ');

    if (type != 'Bearer') {
      ctx.throw(401, 'Auktoriseringsheadern är inte utav typen Bearer!');
    } else if (!token) {
      ctx.throw(401, 'Auktoriseringsheadern har ingen token!');
    }

    try {
      // Verify the JWT Token (ignore exp header, we validate it later)
      ctx.payload = await jwt.verify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        maxAge: JWT_MAX_AGE,
        ignoreExpire: true,
      });
    } catch (ex) {
      ctx.throw(401, ex.message);
    }

    await next();

    // Recreate token if it's expired
    if (ctx.payload.exp && now >= ctx.payload.exp && typeof ctx.body == 'object') {
      ctx.body.token = await Auth.createToken(ctx.payload);
    }
  }
};

module.exports = Auth;
