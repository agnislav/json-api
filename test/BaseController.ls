require! [\mocha, \sinon \chai, \../lib/BaseController, \../lib/types/ErrorResource, \../lib/types/Collection]
expect = chai.expect
it2 = it # a hack for livescript
resSpy = {json: sinon.spy((status, body) -> status )}

describe("Base Controller", ->
  beforeEach(->
    resSpy.json.reset!
  )

  describe("extend", ->
    it2("returns a new object the provided properties and `this` as the prototype", ->
      orig = {'base': -> it}
      new1 = BaseController.extend.call(orig, {'my2': -> it})
      new2 = BaseController.extend({'my3': true})

      expect(new1.__proto__ == orig).to.be.true
      expect(new1.my2).to.be.a('function')
      expect(new2.__proto__ == BaseController).to.be.true
      expect(new2.my3).to.be.true
    )
  )

  describe("sendResources", ->
    it2("uses the error's status as response status code if passed an error resource", ->
      BaseController.sendResources(resSpy, new ErrorResource(null, {'status': 411}))
      BaseController.sendResources(resSpy, new ErrorResource(null, {'status': 408}))
      expect(resSpy.json.firstCall.args).to.have.length(2)
      expect(resSpy.json.secondCall.args).to.have.length(2)      
      expect(resSpy.json.firstCall.args[0]).to.equal(411)
      expect(resSpy.json.secondCall.args[0]).to.equal(408)
      expect(resSpy.json.firstCall.args[1]).to.be.an("object")
    )

    it2("calls `pickStatus` to figure out the appopriate response status code if passed a collection of error resources", ->
      coll = new Collection([new ErrorResource(null, {'status': 411}), new ErrorResource(null, {'status': 408})])
      pickStatusSpy = sinon.spy(BaseController, "_pickStatus");

      BaseController.sendResources(resSpy, coll)
      
      expect(pickStatusSpy.callCount).to.equal(1)
      expect(pickStatusSpy.calledWith([411, 408])).to.be.true
      expect(resSpy.json.firstCall.args).to.have.length(2)
      expect(resSpy.json.firstCall.args[1]).to.be.an("object")

      BaseController._pickStatus.restore();
    )
  )

  describe("", ->)
)