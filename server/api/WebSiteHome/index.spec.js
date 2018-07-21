'use strict';

/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var WebSiteHomeCtrlStub = {
  index: 'WebSiteHomeCtrl.index',
  show: 'WebSiteHomeCtrl.show',
  create: 'WebSiteHomeCtrl.create',
  upsert: 'WebSiteHomeCtrl.upsert',
  patch: 'WebSiteHomeCtrl.patch',
  destroy: 'WebSiteHomeCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var WebSiteHomeIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './WebSiteHome.controller': WebSiteHomeCtrlStub
});

describe('WebSiteHome API Router:', function() {
  it('should return an express router instance', function() {
    expect(WebSiteHomeIndex).to.equal(routerStub);
  });

  describe('GET /api/WebSiteHomes', function() {
    it('should route to WebSiteHome.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'WebSiteHomeCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/WebSiteHomes/:id', function() {
    it('should route to WebSiteHome.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'WebSiteHomeCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/WebSiteHomes', function() {
    it('should route to WebSiteHome.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'WebSiteHomeCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/WebSiteHomes/:id', function() {
    it('should route to WebSiteHome.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'WebSiteHomeCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/WebSiteHomes/:id', function() {
    it('should route to WebSiteHome.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'WebSiteHomeCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/WebSiteHomes/:id', function() {
    it('should route to WebSiteHome.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'WebSiteHomeCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
