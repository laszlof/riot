
// https://github.com/riot/compiler/blob/master/lib/compiler.js#L474
const S_LINESTR = /"[^"\n\\]*(?:\\[\S\s][^"\n\\]*)*"|'[^'\n\\]*(?:\\[\S\s][^'\n\\]*)*'/.source,
  SELECTOR = RegExp('([{}]|^)[ ;]*([^@ ;{}][^{}]*)(?={)|' + S_LINESTR, 'g')

module.exports = function(tag_name, css) {

  return css.replace(SELECTOR, function (m, p1, p2) {

    if (!p2) return m

    p2 = p2.replace(/[^,]+/g, function (sel) {
      const s = sel.trim()

      if (s.startsWith(tag_name)) return sel

      // if (!s || s === 'from' || s === 'to' || s.slice(-1) === '%') return sel

      return s.startsWith(':scope') ? s.slice(6) : tag_name + ' ' + s
    })

    return p1 ? p1 + ' ' + p2 : p2
  })

}