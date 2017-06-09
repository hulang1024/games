// 全局
var localisationResources = {};

function getLocalisationResourceBundle(locale) {
  var res = {};
  var that = {};

  that.getString = function(code) {
    return res[code];
  }

  that.setLocale = function(loc) {
    locale = loc;
    res = localisationResources[locale.toString()];
  }

  that.setLocale(locale);

  return that;
}
