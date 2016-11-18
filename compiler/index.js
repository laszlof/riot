
// libs
const parseJS = require('./js-parse'),
  util = require('util'),
  dom = require('./dom')

// RE
const RESERVED = 'arguments console document false function instanceof location null self this top true typeof undefined window'.split(' '),
  ATTR_EXPR = /([\w\-]+=)(\{[^}]+\})([\s>])/g,
  VAR_NAME = /(^|[\!\s\(])+([a-z]\w*)\b\s?/g,
  TAG = /<(\w+-?\w+)([^>]*)>/g,
  EXPR = /\{([^}]+)\}\}?/g


function trimArgs(arr) {
  return arr.filter(function(el) {
    return !!el
  }).join(',')
}


function setThis(expr, args) {
  args = args ? args.split(',') : []
  return expr.replace(VAR_NAME, function(match, beg, key) {
    if (RESERVED.includes(key) || args.includes(key)) return match
    return beg + 'this.' + key.trimLeft()
  })
}

function objectify(str, args) {
  return '{' + str.split(',').map(function(pair) {
    var els = pair.split(':')
    return els[0] + ':' + setThis(els[1], args)

  }).join(',') + '}'
}

// Foo { bar } baz --> ["foo ", this.bar, " baz"]
function toArray(text, args) {
  return text.split(EXPR).map(function(el, i) {
    if (i % 2) {
      return el[0] == '{' ? `{ _html: ${ setThis(el.slice(1), args) } }` :
        /\w+:/.test(el.trim()) ? objectify(el, args) :
        setThis(el, args)
    }
    return '"' + el + '"'

  }).filter(function(el) {
    return el != '""'
  })
  return ret
}

function makeFn(expr, args) {
  var arr = toArray(expr, args),
    body = arr.length > 1 ? '[' + arr + ']' : arr[0].trim()

  return `function(${args}){return ${body}}`
}

function isExpr(str) {
  return str && str[0] == '{' && str.endsWith('}')
}

function closeTags(html) {
  return html.replace(TAG, function(match, name, attr) {
    return match.replace('/>', '></' + name + '>')
  })
}

// foo={ bar } --> foo="{ bar }"
function quoteExpressions(html) {
  return html.replace(ATTR_EXPR, function(match, beg, expr, end) {
    return beg + '"' + expr.replace(/"/g, "'") + '"' + end
  })
}


function closest(arr, index) {
  for (var i = index -1, el; i > 0; i--) {
    el = arr[i]
    if (el) return el
  }
}

function getScript(root) {
  var redundant = [],
    script = ''

  dom.walk(root, function(el, level) {
    if (el.nodeType == 8) redundant.push(el)
    else if (el.tagName == 'SCRIPT') {
      if (!script && level == 1) script = dom.html(el)
      redundant.push(el)
      return false
    }
  })

  redundant.forEach(function(el) {
    el.parentNode.removeChild(el)
  })

  return parseJS(script.trim())
}

function Tag(tag_name, root, script) {

  const fn_index = {},
    loop_args = [],
    fns = []

  function pushFn(expr) {
    if (!expr || !expr.includes('{') || !expr.includes('}')) return

    var fn = makeFn(expr, trimArgs(loop_args)),
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


  // { thread, i in threads.slice(1) } -> { item: 'thread', index: 'i', fn: threads.slice(1) }
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

    return `riot.tag('${tag_name}', '${html}',\n\n[${fns.join(',\n')}]` +
      (script ? `,\n\nfunction(self, opts) {\n\t${script}\n})\n` : ')\n')
  }

}

module.exports = function(html) {
  html = quoteExpressions(closeTags(html))
  const doc = dom.parse(html.trim())

  var js = '', index = 0, node

  while (node = doc.childNodes.item(index++)) {
    var name = (node.tagName || '').toLowerCase()

    if (name == 'script') {
      js += dom.html(node)

    } else if (name) {
      var root = dom.create('div')
      root.appendChild(node)

      var script = getScript(root),
        tag = new Tag(name, root, script)

      js += tag.generate()
    }
  }

  return js
}
