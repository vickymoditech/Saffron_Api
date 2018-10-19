/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newBasket;

describe('Basket API:', function() {
  describe('GET /api/Baskets', function() {
    var Baskets;

    beforeEach(function(done) {
      request(app)
        .get('/api/Baskets')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          Baskets = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(Baskets).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/Baskets', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/Baskets')
        .send({
          name: 'New Basket',
          info: 'This is the brand new Basket!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newBasket = res.body;
          done();
        });
    });

    it('should respond with the newly created Basket', function() {
      expect(newBasket.name).to.equal('New Basket');
      expect(newBasket.info).to.equal('This is the brand new Basket!!!');
    });
  });

  describe('GET /api/Baskets/:id', function() {
    var Basket;

    beforeEach(function(done) {
      request(app)
        .get(`/api/Baskets/${newBasket._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          Basket = res.body;
          done();
        });
    });

    afterEach(function() {
      Basket = {};
    });

    it('should respond with the requested Basket', function() {
      expect(Basket.name).to.equal('New Basket');
      expect(Basket.info).to.equal('This is the brand new Basket!!!');
    });
  });

  describe('PUT /api/Baskets/:id', function() {
    var updatedBasket;

    beforeEach(function(done) {
      request(app)
        .put(`/api/Baskets/${newBasket._id}`)
        .send({
          name: 'Updated Basket',
          info: 'This is the updated Basket!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedBasket = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedBasket = {};
    });

    it('should respond with the updated Basket', function() {
      expect(updatedBasket.name).to.equal('Updated Basket');
      expect(updatedBasket.info).to.equal('This is the updated Basket!!!');
    });

    it('should respond with the updated Basket on a subsequent GET', function(done) {
      request(app)
        .get(`/api/Baskets/${newBasket._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let Basket = res.body;

          expect(Basket.name).to.equal('Updated Basket');
          expect(Basket.info).to.equal('This is the updated Basket!!!');

          done();
        });
    });
  });

  describe('PATCH /api/Baskets/:id', function() {
    var patchedBasket;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/Baskets/${newBasket._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Basket' },
          { op: 'replace', path: '/info', value: 'This is the patched Basket!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedBasket = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedBasket = {};
    });

    it('should respond with the patched Basket', function() {
      expect(patchedBasket.name).to.equal('Patched Basket');
      expect(patchedBasket.info).to.equal('This is the patched Basket!!!');
    });
  });

  describe('DELETE /api/Baskets/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/Baskets/${newBasket._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when Basket does not exist', function(done) {
      request(app)
        .delete(`/api/Baskets/${newBasket._id}`)
        .expect(404)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });
  });
});
