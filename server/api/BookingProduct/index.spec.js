/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var BookingProductCtrlStub = {
  index: 'BookingProductCtrl.index',
  show: 'BookingProductCtrl.show',
  create: 'BookingProductCtrl.create',
  upsert: 'BookingProductCtrl.upsert',
  patch: 'BookingProductCtrl.patch',
  destroy: 'BookingProductCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var BookingProductIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './BookingProduct.controller': BookingProductCtrlStub
});

describe('BookingProduct API Router:', function() {
  it('should return an express router instance', function() {
    expect(BookingProductIndex).to.equal(routerStub);
  });

  describe('GET /api/BookingProducts', function() {
    it('should route to BookingProduct.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'BookingProductCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/BookingProducts/:id', function() {
    it('should route to BookingProduct.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'BookingProductCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/BookingProducts', function() {
    it('should route to BookingProduct.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'BookingProductCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/BookingProducts/:id', function() {
    it('should route to BookingProduct.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'BookingProductCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/BookingProducts/:id', function() {
    it('should route to BookingProduct.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'BookingProductCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/BookingProducts/:id', function() {
    it('should route to BookingProduct.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'BookingProductCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
