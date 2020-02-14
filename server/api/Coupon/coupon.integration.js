/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newCoupon;

describe('Coupon API:', function() {
  describe('GET /api/coupons', function() {
    var coupons;

    beforeEach(function(done) {
      request(app)
        .get('/api/coupons')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          coupons = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(coupons).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/coupons', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/coupons')
        .send({
          name: 'New Coupon',
          info: 'This is the brand new coupon!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newCoupon = res.body;
          done();
        });
    });

    it('should respond with the newly created coupon', function() {
      expect(newCoupon.name).to.equal('New Coupon');
      expect(newCoupon.info).to.equal('This is the brand new coupon!!!');
    });
  });

  describe('GET /api/coupons/:id', function() {
    var coupon;

    beforeEach(function(done) {
      request(app)
        .get(`/api/coupons/${newCoupon._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          coupon = res.body;
          done();
        });
    });

    afterEach(function() {
      coupon = {};
    });

    it('should respond with the requested coupon', function() {
      expect(coupon.name).to.equal('New Coupon');
      expect(coupon.info).to.equal('This is the brand new coupon!!!');
    });
  });

  describe('PUT /api/coupons/:id', function() {
    var updatedCoupon;

    beforeEach(function(done) {
      request(app)
        .put(`/api/coupons/${newCoupon._id}`)
        .send({
          name: 'Updated Coupon',
          info: 'This is the updated coupon!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedCoupon = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedCoupon = {};
    });

    it('should respond with the updated coupon', function() {
      expect(updatedCoupon.name).to.equal('Updated Coupon');
      expect(updatedCoupon.info).to.equal('This is the updated coupon!!!');
    });

    it('should respond with the updated coupon on a subsequent GET', function(done) {
      request(app)
        .get(`/api/coupons/${newCoupon._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let coupon = res.body;

          expect(coupon.name).to.equal('Updated Coupon');
          expect(coupon.info).to.equal('This is the updated coupon!!!');

          done();
        });
    });
  });

  describe('PATCH /api/coupons/:id', function() {
    var patchedCoupon;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/coupons/${newCoupon._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched Coupon' },
          { op: 'replace', path: '/info', value: 'This is the patched coupon!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedCoupon = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedCoupon = {};
    });

    it('should respond with the patched coupon', function() {
      expect(patchedCoupon.name).to.equal('Patched Coupon');
      expect(patchedCoupon.info).to.equal('This is the patched coupon!!!');
    });
  });

  describe('DELETE /api/coupons/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/coupons/${newCoupon._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when coupon does not exist', function(done) {
      request(app)
        .delete(`/api/coupons/${newCoupon._id}`)
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
