// Takes in a string, returns an escaped string ready for regex
// Source : http://stackoverflow.com/questions/6300183/sanitize-string-of-regex-characters-before-regexp-build
function sanitizeForRegex(s) {
  return s.replace(/[#-.]|[[-^]|[?|{}]/, '\\$&');
}

// Strips a string of trailing whitespace
function trim(string) {
  if(!string) return "";
  return string.replace(/^\s*|\s*$/g, '');
}


exports.sanitizeForRegex = sanitizeForRegex;
exports.trim = trim;
