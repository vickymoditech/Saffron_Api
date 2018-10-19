/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var BasketCtrlStub = {
  index: 'BasketCtrl.index',
  show: 'BasketCtrl.show',
  create: 'BasketCtrl.create',
  upsert: 'BasketCtrl.upsert',
  patch: 'BasketCtrl.patch',
  destroy: 'BasketCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var BasketIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './Basket.controller': BasketCtrlStub
});

describe('Basket API Router:', function() {
  it('should return an express router instance', function() {
    expect(BasketIndex).to.equal(routerStub);
  });

  describe('GET /api/Baskets', function() {
    it('should route to Basket.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'BasketCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/Baskets/:id', function() {
    it('should route to Basket.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'BasketCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/Baskets', function() {
    it('should route to Basket.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'BasketCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/Baskets/:id', function() {
    it('should route to Basket.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'BasketCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/Baskets/:id', function() {
    it('should route to Basket.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'BasketCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/Baskets/:id', function() {
    it('should route to Basket.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'BasketCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
