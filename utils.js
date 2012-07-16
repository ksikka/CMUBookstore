// Takes in a string, returns an escaped string ready for regex
// Source : http://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function sanitizeForRegex(s) {
  return s.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

// Strips a string of trailing whitespace
function trim(string) {
  if(!string) return "";
  return string.replace(/^\s*|\s*$/g, '');
}


exports.sanitizeForRegex = sanitizeForRegex;
exports.trim = trim;
