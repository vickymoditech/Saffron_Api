/* globals sinon, describe, expect, it */

var proxyquire = require('proxyquire').noPreserveCache();

var couponCtrlStub = {
  index: 'couponCtrl.index',
  show: 'couponCtrl.show',
  create: 'couponCtrl.create',
  upsert: 'couponCtrl.upsert',
  patch: 'couponCtrl.patch',
  destroy: 'couponCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var couponIndex = proxyquire('./index.js', {
  express: {
    Router() {
      return routerStub;
    }
  },
  './coupon.controller': couponCtrlStub
});

describe('Coupon API Router:', function() {
  it('should return an express router instance', function() {
    expect(couponIndex).to.equal(routerStub);
  });

  describe('GET /api/coupons', function() {
    it('should route to coupon.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'couponCtrl.index')
        ).to.have.been.calledOnce;
    });
  });

  describe('GET /api/coupons/:id', function() {
    it('should route to coupon.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'couponCtrl.show')
        ).to.have.been.calledOnce;
    });
  });

  describe('POST /api/coupons', function() {
    it('should route to coupon.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'couponCtrl.create')
        ).to.have.been.calledOnce;
    });
  });

  describe('PUT /api/coupons/:id', function() {
    it('should route to coupon.controller.upsert', function() {
      expect(routerStub.put
        .withArgs('/:id', 'couponCtrl.upsert')
        ).to.have.been.calledOnce;
    });
  });

  describe('PATCH /api/coupons/:id', function() {
    it('should route to coupon.controller.patch', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'couponCtrl.patch')
        ).to.have.been.calledOnce;
    });
  });

  describe('DELETE /api/coupons/:id', function() {
    it('should route to coupon.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'couponCtrl.destroy')
        ).to.have.been.calledOnce;
    });
  });
});
