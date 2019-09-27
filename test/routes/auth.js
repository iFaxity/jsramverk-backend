const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const Auth = require('../../lib/auth');
const { connect } = require('../../db');

const { PORT } = require('@ifaxity/env');
const app = require('../../app');
const server = http.createServer(app.callback()).listen(PORT);

chai.should();
chai.use(chaiHttp);

before(async () => {
  await Auth.register({
    email: 'tester@test.com',
    name: 'Test User',
    birthdate: '1970-01-01',
    password: 'Opensesame123',
  });
});
after(async () => {
  const db = await connect();
  await db.run('DELETE FROM users');
});

describe('Authentication routes', () => {
  describe('POST /login', () => {
    it('with existing user', done => {
      chai.request(server)
        .post('/login')
        .send({ email: 'tester@test.com', password: 'Opensesame123' })
        .end((ex, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');
          res.body.token.should.be.a('string');

          done();
        });
    });

    it('with nonexistent user', done => {
      chai.request(server)
        .post('/login')
        .send({ email: 'hello@somewebsite.com', password: 'Tota11ysecure' })
        .end((ex, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');

          done();
        });
    });

    it('without credentials', done => {
      chai.request(server)
        .post('/login')
        .end((ex, res) => {
          res.should.have.status(500);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');

          done();
        });
    });
  });

  describe('POST /register', () => {
    it('with nonexisting user', done => {
      chai.request(server)
        .post('/register')
        .send({
          email: 'me@test.com',
          name: 'Me Tester',
          password: 'Let_me_in',
          birthdate: '2005-01-09',
        })
        .end((ex, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');

          done();
        });
    });

    it('with existing user', done => {
      chai.request(server)
        .post('/register')
        .send({
          email: 'tester@test.com',
          name: 'New User',
          password: 'My_p4ssword',
          birthdate: '1993-07-14',
        })
        .end((ex, res) => {
          res.should.have.status(400);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');

          done();
        });
    });

    it('without credentials', done => {
      chai.request(server)
        .post('/register')
        .end((ex, res) => {
          res.should.have.status(500);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');

          done();
        });
    });
  });
});
