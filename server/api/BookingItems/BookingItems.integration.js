/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newBookingItems;

describe('BookingItems API:', function() {
  describe('GET /api/BookingItems', function() {
    var BookingItemss;

    beforeEach(function(done) {
      request(app)
        .get('/api/BookingItems')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          BookingItemss = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(BookingItemss).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/BookingItems', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/BookingItems')
        .send({
          name: 'New BookingItems',
          info: 'This is the brand new BookingItems!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newBookingItems = res.body;
          done();
        });
    });

    it('should respond with the newly created BookingItems', function() {
      expect(newBookingItems.name).to.equal('New BookingItems');
      expect(newBookingItems.info).to.equal('This is the brand new BookingItems!!!');
    });
  });

  describe('GET /api/BookingItems/:id', function() {
    var BookingItems;

    beforeEach(function(done) {
      request(app)
        .get(`/api/BookingItems/${newBookingItems._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          BookingItems = res.body;
          done();
        });
    });

    afterEach(function() {
      BookingItems = {};
    });

    it('should respond with the requested BookingItems', function() {
      expect(BookingItems.name).to.equal('New BookingItems');
      expect(BookingItems.info).to.equal('This is the brand new BookingItems!!!');
    });
  });

  describe('PUT /api/BookingItems/:id', function() {
    var updatedBookingItems;

    beforeEach(function(done) {
      request(app)
        .put(`/api/BookingItems/${newBookingItems._id}`)
        .send({
          name: 'Updated BookingItems',
          info: 'This is the updated BookingItems!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedBookingItems = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedBookingItems = {};
    });

    it('should respond with the updated BookingItems', function() {
      expect(updatedBookingItems.name).to.equal('Updated BookingItems');
      expect(updatedBookingItems.info).to.equal('This is the updated BookingItems!!!');
    });

    it('should respond with the updated BookingItems on a subsequent GET', function(done) {
      request(app)
        .get(`/api/BookingItems/${newBookingItems._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let BookingItems = res.body;

          expect(BookingItems.name).to.equal('Updated BookingItems');
          expect(BookingItems.info).to.equal('This is the updated BookingItems!!!');

          done();
        });
    });
  });

  describe('PATCH /api/BookingItems/:id', function() {
    var patchedBookingItems;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/BookingItems/${newBookingItems._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched BookingItems' },
          { op: 'replace', path: '/info', value: 'This is the patched BookingItems!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedBookingItems = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedBookingItems = {};
    });

    it('should respond with the patched BookingItems', function() {
      expect(patchedBookingItems.name).to.equal('Patched BookingItems');
      expect(patchedBookingItems.info).to.equal('This is the patched BookingItems!!!');
    });
  });

  describe('DELETE /api/BookingItems/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/BookingItems/${newBookingItems._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when BookingItems does not exist', function(done) {
      request(app)
        .delete(`/api/BookingItems/${newBookingItems._id}`)
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
