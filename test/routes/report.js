const chai = require('chai');
const chaiHttp = require('chai-http');
const http = require('http');
const Auth = require('../../lib/auth');
const { connect } = require('../../db');

const app = require('../../app');
let server = http.createServer(app.callback()).listen(3002);
let token;

chai.should();
chai.use(chaiHttp);

before(async () => {
  token = await Auth.createToken({});

  const stmt = 'INSERT INTO reports (id, content) VALUES (?, ?)';
  const db = await connect();
  await db.run(stmt, [ 10, 'My first report!' ]);
  await db.run(stmt, [ 11, 'My second report!' ]);
});
after(async () => {
  const db = await connect();
  await db.run('DELETE FROM reports');
});

describe('Report routes', () => {
  it('GET /', done => {
    chai.request(server)
      .get('/')
      .end((ex, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.data.should.be.an('object');
        res.body.data.content.should.be.a('string');

        done();
      });
  });

  it('GET /reports', done => {
    chai.request(server)
      .get('/reports')
      .end((ex, res) => {
        res.should.have.status(200);
        res.body.should.be.an('object');
        res.body.data.should.be.an('array');

        done();
      });
  });

  describe('GET /reports/week/:id', () => {
      it('with existing report', done => {
        chai.request(server)
          .get('/reports/week/10')
          .end((ex, res) => {
            res.should.have.status(200);
            res.body.should.be.an('object');
            res.body.data.should.be.an('object');
            res.body.data.id.should.equal(10);
            res.body.data.content.should.be.a('string');

            done();
          });
      });

      it('without existing report', done => {
        chai.request(server)
          .get('/reports/week/80')
          .end((ex, res) => {
            res.should.have.status(404);
            res.body.should.be.an('object');
            res.body.message.should.be.a('string');

            done();
          });
      });
  });

  describe('GET /reports/week/:id/edit', () => {
    it('with existing report', done => {
      chai.request(server)
        .get('/reports/week/10/edit')
        .set('Authorization', `Bearer ${token}`)
        .end((ex, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.data.should.be.an('object');
          res.body.data.id.should.equal(10);
          res.body.data.content.should.be.a('string');

          done();
        });
    });

    it('without existing report', done => {
      chai.request(server)
        .get('/reports/week/40/edit')
        .set('Authorization', `Bearer ${token}`)
        .end((ex, res) => {
          res.should.have.status(404);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');

          done();
        });
    });
  });

  describe('POST /reports', () => {
    it('Update report', done => {
      chai.request(server)
        .post('/reports')
        .set('Authorization', `Bearer ${token}`)
        .send({ id: 11, content: 'Some content' })
        .end((ex, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');

          done();
        });
    });

    it('Create report', done => {
      chai.request(server)
        .post('/reports')
        .set('Authorization', `Bearer ${token}`)
        .send({ id: 12, content: 'Test' })
        .end((ex, res) => {
          res.should.have.status(200);
          res.body.should.be.an('object');
          res.body.message.should.be.a('string');

          done();
        });
    });
  });
});
