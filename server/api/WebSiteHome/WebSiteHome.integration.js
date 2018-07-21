'use strict';

/* globals describe, expect, it, beforeEach, afterEach */

var app = require('../..');
import request from 'supertest';

var newWebSiteHome;

describe('WebSiteHome API:', function() {
  describe('GET /api/WebSiteHomes', function() {
    var WebSiteHomes;

    beforeEach(function(done) {
      request(app)
        .get('/api/WebSiteHomes')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          WebSiteHomes = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(WebSiteHomes).to.be.instanceOf(Array);
    });
  });

  describe('POST /api/WebSiteHomes', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/WebSiteHomes')
        .send({
          name: 'New WebSiteHome',
          info: 'This is the brand new WebSiteHome!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          newWebSiteHome = res.body;
          done();
        });
    });

    it('should respond with the newly created WebSiteHome', function() {
      expect(newWebSiteHome.name).to.equal('New WebSiteHome');
      expect(newWebSiteHome.info).to.equal('This is the brand new WebSiteHome!!!');
    });
  });

  describe('GET /api/WebSiteHomes/:id', function() {
    var WebSiteHome;

    beforeEach(function(done) {
      request(app)
        .get(`/api/WebSiteHomes/${newWebSiteHome._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          WebSiteHome = res.body;
          done();
        });
    });

    afterEach(function() {
      WebSiteHome = {};
    });

    it('should respond with the requested WebSiteHome', function() {
      expect(WebSiteHome.name).to.equal('New WebSiteHome');
      expect(WebSiteHome.info).to.equal('This is the brand new WebSiteHome!!!');
    });
  });

  describe('PUT /api/WebSiteHomes/:id', function() {
    var updatedWebSiteHome;

    beforeEach(function(done) {
      request(app)
        .put(`/api/WebSiteHomes/${newWebSiteHome._id}`)
        .send({
          name: 'Updated WebSiteHome',
          info: 'This is the updated WebSiteHome!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          updatedWebSiteHome = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedWebSiteHome = {};
    });

    it('should respond with the updated WebSiteHome', function() {
      expect(updatedWebSiteHome.name).to.equal('Updated WebSiteHome');
      expect(updatedWebSiteHome.info).to.equal('This is the updated WebSiteHome!!!');
    });

    it('should respond with the updated WebSiteHome on a subsequent GET', function(done) {
      request(app)
        .get(`/api/WebSiteHomes/${newWebSiteHome._id}`)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if(err) {
            return done(err);
          }
          let WebSiteHome = res.body;

          expect(WebSiteHome.name).to.equal('Updated WebSiteHome');
          expect(WebSiteHome.info).to.equal('This is the updated WebSiteHome!!!');

          done();
        });
    });
  });

  describe('PATCH /api/WebSiteHomes/:id', function() {
    var patchedWebSiteHome;

    beforeEach(function(done) {
      request(app)
        .patch(`/api/WebSiteHomes/${newWebSiteHome._id}`)
        .send([
          { op: 'replace', path: '/name', value: 'Patched WebSiteHome' },
          { op: 'replace', path: '/info', value: 'This is the patched WebSiteHome!!!' }
        ])
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if(err) {
            return done(err);
          }
          patchedWebSiteHome = res.body;
          done();
        });
    });

    afterEach(function() {
      patchedWebSiteHome = {};
    });

    it('should respond with the patched WebSiteHome', function() {
      expect(patchedWebSiteHome.name).to.equal('Patched WebSiteHome');
      expect(patchedWebSiteHome.info).to.equal('This is the patched WebSiteHome!!!');
    });
  });

  describe('DELETE /api/WebSiteHomes/:id', function() {
    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete(`/api/WebSiteHomes/${newWebSiteHome._id}`)
        .expect(204)
        .end(err => {
          if(err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when WebSiteHome does not exist', function(done) {
      request(app)
        .delete(`/api/WebSiteHomes/${newWebSiteHome._id}`)
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
