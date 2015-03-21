"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var mocha = _interopRequire(require("mocha"));

var sinon = _interopRequire(require("sinon"));

var chai = _interopRequire(require("chai"));

var utils = _interopRequireWildcard(require("../../src/util/misc"));

var Resource = _interopRequire(require("../../src/types/Resource"));

var Collection = _interopRequire(require("../../src/types/Collection"));

var expect = chai.expect;

describe("Utility methods", function () {
  describe("deleteNested", function () {
    var obj = { contact: { phone: "310" }, "top-level": true };
    var deletion = utils.deleteNested("contact.phone", obj);

    it("should delete a nested property when present", function () {
      expect(obj.contact.phone).to.equal(undefined);
    });

    it("should work on non-nested properties too", function () {
      utils.deleteNested("top-level", obj);
      expect(obj["top-level"]).to.be.undefined;
    });

    it("should return true if deletion succeeds", function () {
      expect(deletion).to.be["true"];
    });

    it("should return false if deletion fails", function () {
      expect(utils.deleteNested("contact.twitter", obj)).to.be["false"];
    });
  });

  describe("isSubsetOf", function () {
    it("should return true for two equal arrays", function () {
      expect(utils.isSubsetOf([1, 2, 3], [1, 2, 3])).to.be["true"];
    });

    it("should return true for strict subsets", function () {
      expect(utils.isSubsetOf(["test", "bob", 3], ["test", 3])).to.be["true"];
    });

    it("should return false for non-subsets", function () {
      expect(utils.isSubsetOf(["myprop", "bob"], ["john", "mary"])).to.be["false"];
    });

    it("should handle duplicate elements in either argument", function () {
      expect(utils.isSubsetOf(["test", 3, 3], ["test", 3])).to.be["true"];
      expect(utils.isSubsetOf(["test", 3], [3, 3])).to.be["true"];
      expect(utils.isSubsetOf(["test", 3], ["test", 3, 3])).to.be["true"];
    });

    it("should treat values differently even if they have equal string representations", function () {
      expect(utils.isSubsetOf(["test", "3"], ["test", 3])).to.be["false"];
      expect(utils.isSubsetOf(["false"], [false])).to.be["false"];
      expect(utils.isSubsetOf(["false"], [0])).to.be["false"];
    });
  });
});