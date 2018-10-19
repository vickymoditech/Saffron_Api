/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newBookingProduct;

describe('BookingProduct API:', function() {
  describe('GET /api/BookingProducts', function() {
    var BookingProducts;

    beforeEach(function(done) {
      request(app)
        .get('/api/BookingProducts')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          BookingProducts = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(BookingProducts).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/BookingProducts', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/BookingProducts')
        .send({
          name: 'New BookingProduct',
          info: 'This is the brand new BookingProduct!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newBookingProduct = res.body;
          done();
        });
    });

    it('should respond with the newly created BookingProduct', function() {
      expect(newBookingProduct.name).to.equal('New BookingProduct');
      expect(newBookingProduct.info).to.equal('This is the brand new BookingProduct!!!');
    });
  });

  describe('GET /api/BookingProducts/:id', function() {
    var BookingProduct;

    beforeEach(function(done) {
      request(app)
        .get(`/api/BookingProducts/${newBookingProduct._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          BookingProduct = res.body;
          done();
        });
    });

    afterEach(function() {
      BookingProduct = {};
    });

    it('should respond with the requested BookingProduct', function() {
      expect(BookingProduct.name).to.equal('New BookingProduct');
      expect(BookingProduct.info).to.equal('This is the brand new BookingProduct!!!');
    });
  });

  describe('PUT /api/BookingProducts/:id', function() {
    var updatedBookingProduct;

    beforeEach(function(done) {
      request(app)
        .put(`/api/BookingProducts/${newBookingProduct._id}`)
        .send({
          name: 'Updated BookingProduct',
          info: 'This is the updated BookingProduct!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedBookingProduct = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedBookingProduct = {};
    });

    it('should respond with the updated BookingProduct', function() {
      expect(updatedBookingProduct.name).to.equal('Updated BookingProduct');
      expect(updatedBookingProduct.info).to.equal('This is the updated BookingProduct!!!');
    });

    it('should respond with the updated BookingProduct on a subsequent GET', function(done) {
      request(app)
        .get(`/api/BookingProducts/${newBookingProduct._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let BookingProduct = res.body;

          expect(BookingProduct.name).to.equal('Updated BookingProduct');
          expect(BookingProduct.info).to.equal('This is the updated BookingProduct!!!');

          done();
        });
    });
  });

  describe('PATCH /api/BookingProducts/:id', function() {
    var patchedBookingProduct;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/BookingProducts/${newBookingProduct._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched BookingProduct' },
          { op: 'replace', path: '/info', value: 'This is the patched BookingProduct!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedBookingProduct = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedBookingProduct = {};
    });

    it('should respond with the patched BookingProduct', function() {
      expect(patchedBookingProduct.name).to.equal('Patched BookingProduct');
      expect(patchedBookingProduct.info).to.equal('This is the patched BookingProduct!!!');
    });
  });

  describe('DELETE /api/BookingProducts/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/BookingProducts/${newBookingProduct._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when BookingProduct does not exist', function(done) {
      request(app)
        .delete(`/api/BookingProducts/${newBookingProduct._id}`)
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
