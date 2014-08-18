// Generated by LiveScript 1.2.0
(function(){
  var Collection;
  Collection = require('../types/Collection');
  module.exports = {
    deleteNested: function(path, object){
      var pathParts, lastPart, containingParts, container, ref$, error;
      try {
        pathParts = path.split('.');
        lastPart = pathParts[pathParts.length - 1];
        containingParts = pathParts.slice(0, pathParts.length - 1);
        container = containingParts.reduce(function(obj, part){
          return obj[part];
        }, object);
        return ref$ = container[lastPart], delete container[lastPart], ref$;
      } catch (e$) {
        error = e$;
        console.log(error);
        return console.log("deleteNested failed with path: " + path + ", on oject: " + JSON.stringify(object));
      }
    },
    mapResources: function(resourceOrCollection, mapFn){
      if (resourceOrCollection instanceof Collection) {
        return resourceOrCollection.resources.map(mapFn);
      } else {
        return mapFn(resourceOrCollection);
      }
    },
    mapArrayOrVal: function(arrayOrVal, mapFn){
      if (arrayOrVal instanceof Array) {
        return arrayOrVal.map(mapFn);
      } else {
        return mapFn(arrayOrVal);
      }
    },
    forEachArrayOrVal: function(arrayOrVal, eachFn){
      if (arrayOrVal instanceof Array) {
        return arrayOrVal.forEach(eachFn);
      } else {
        return eachFn(arrayOrVal);
      }
    }
  };
}).call(this);
