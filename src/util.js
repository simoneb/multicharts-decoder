export function utf8_to_b64(str) {
  return window.btoa(unescape(encodeURIComponent(str)))
}

export function b64_to_utf8(str) {
  return decodeURIComponent(escape(window.atob(str)))
}

export function hex2a(_hex) {
  var hex = _hex.toString() //force conversion
  var str = ''
  for (var i = 0; i < hex.length; i += 2) {
    str += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
  }
  return str
}
