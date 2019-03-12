/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var BookingItemsCtrlStub = {
  index: 'BookingItemsCtrl.index',
  show: 'BookingItemsCtrl.show',
  create: 'BookingItemsCtrl.create',
  upsert: 'BookingItemsCtrl.upsert',
  patch: 'BookingItemsCtrl.patch',
  destroy: 'BookingItemsCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var BookingItemsIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './BookingItems.controller': BookingItemsCtrlStub
});

describe('BookingItems API Router:', function() {
  it('should return an express router instance', function() {
    expect(BookingItemsIndex).to.equal(routerStub);
  });

  describe('GET /api/BookingItems', function() {
    it('should route to BookingItems.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'BookingItemsCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/BookingItems/:id', function() {
    it('should route to BookingItems.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'BookingItemsCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/BookingItems', function() {
    it('should route to BookingItems.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'BookingItemsCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/BookingItems/:id', function() {
    it('should route to BookingItems.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'BookingItemsCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/BookingItems/:id', function() {
    it('should route to BookingItems.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'BookingItemsCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/BookingItems/:id', function() {
    it('should route to BookingItems.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'BookingItemsCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
