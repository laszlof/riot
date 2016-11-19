
const dom = require('./dom'),
  makeFn = require('./expr')

module.exports = function(tag_name, root, script) {

  const fn_index = {},
    loop_args = [],
    fns = []

  function pushFn(expr) {
    if (!expr || !expr.includes('{') || !expr.includes('}')) return

    var fn = makeFn(expr, loop_args),
      i = fn_index[fn]

    if (i === undefined) {
      fns.push(fn);
      i = fn_index[fn] = (fns.length - 1)
    }
    return i
  }


  function setEventHandler(attr, val) {
    if (!isExpr(val) || !val.includes('(') || !attr.name.slice(0, 2).toLowerCase() == 'on') return

    // toggle('active') --> this.toggle('active', e, thread, i)
    const args = trimArgs(['e'].concat(loop_args))
    var body = setThis(val.slice(1, -1).trim(), args).replace(')', ', ' + args + ')')

    fns.push(`function(${args}) { return ${ body } }`)
    attr.value = '$' + (fns.length - 1)

    return true
  }


  function setAttributes(arr) {
    arr && arr.forEach(function(attr) {
      var val = attr.value

      if (!setEventHandler(attr, val)) {
        var i = pushFn(val)
        if (i >= 0) attr.value = '$' + i
      }
    })
  }


  // { thread, i in threads.slice(1) } -> thread, i
  function parseEach(el) {
    const str = el.tagName && el.getAttribute('each')
    if (isExpr(str)) {
      const els = str.slice(1, -1).trim().split(/\s+in\s+/)
      el.setAttribute('each', '$' + pushFn('{ ' + els[1] + ' }'))
      return els[0]
    }
  }

  function makeHTML() {

    dom.walk(root, function(el, level) {

      // each attribute
      const each_args = parseEach(el)
      if (each_args) {
        loop_args[level] = each_args
        loop_args.splice(level + 1, loop_args.length)
      }

      // other attributes
      setAttributes(el.attributes)

      var text = el.nodeValue && el.nodeValue.trim()

      const i = pushFn(text)
      if (i >= 0) el.nodeValue = '$' + i

    })

    return dom.html(root)
  }

  this.generate = function() {
    const html = makeHTML().replace(/\n/g, '').replace(/\s{2,}/g, ' ').trim()

    // this looks ugly, sorry
    return `riot.tag('${tag_name}', '${html}',\n\n[${fns.join(',\n')}]` +
      (script ? `,\n\nfunction(self, opts) {\n\t${script}\n})\n` : ')\n')
  }

}


function isExpr(str) {
  return str && str[0] == '{' && str.endsWith('}')
}

