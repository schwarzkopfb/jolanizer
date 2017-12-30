'use strict'

var RX_REPLACER = /edit/gi

var REPLACEMENTS = [
    'Jolán',
    'Kami',
    'Merienn',
    'Agrippína',
    'Ájlin',
    'Árpádina',
    'Bogárka',
    'Delfina',
    'Dezideráta',
    'Dzsenifer',
    'Dzsindzser',
    'Giszmunda',
    'Gyopárka',
    'Hatidzse',
    'Immakuláta',
    'Mirandolína',
    'Moána',
    'Nilüfer',
    'Pompónia',
    'Poppea',
    'Rozamunda',
    'Skolasztika'
]

var port     = chrome.runtime.connect(),
    next     = createRandomGeneratorFunction(getWeights()),
    elements = document.getElementsByTagName('*'),
    counter  = 0

for (var i = 0, l = elements.length; i < l; i++) {
    var element = elements[ i ]

    for (var j = 0, l2 = element.childNodes.length; j < l2; j++) {
        var node = element.childNodes[ j ]

        if (node.nodeType === 3) {
            var text = node.nodeValue,
                repd = text.replace(RX_REPLACER, function (orig) {
                    console.log(next())

                    return keepCase(orig, REPLACEMENTS[ next() ])
                })

            if (repd !== text) {
                element.replaceChild(document.createTextNode(repd), node)
                counter++
            }
        }
    }
}

window.addEventListener('message', function(event) {
    // we only accept messages from ourselves
    if (event.source != window)
        return;

    if (event.data.type && (event.data.type == "FROM_PAGE")) {
        console.log("Content script received: " + event.data.text);
        port.postMessage(event.data.text)
    }
}, false)

function getWeights() {
    var l = REPLACEMENTS.length,
        result = [ Math.abs(l / 3) ]

    for (var i = 1; i < l; i++)
        result.push(1)

    return result
}

function keepCase(orig, text) {
    var result = '',
        ol = orig.length,
        tl = text.length

    for (var i = 0; i < ol; i++) {
        var o = orig[ i ],
            t = text[ i ]

        if (t === undefined || o === undefined)
            break

        result += o === o.toUpperCase()
            ? t.toUpperCase()
            : t.toLowerCase()
    }

    var rl = result.length

    if (rl < tl)
        return result + text.substring(rl)
    else if (rl > tl)
        return result.substring(0, tl)
    else
        return result
}

/**
 * Ported from https://github.com/schwarzkopfb/wrg
 */

/* Weighted Random Generator
 * Generates a random array index by given weight scores
 * Based on Brandon Mills' weighted-random package (https://github.com/btmills/weighted-random)
 */

'use strict'

var message = 'weights must be an array of non-negative numbers'

function assert() {}

function createRandomGeneratorFunction(weights) {
    assert(Array.isArray(weights), message)

    var totalWeight = 0,
        length = weights.length,
        i = length

    while (i--) {
        var current = weights[ i ]
        assert(current >= 0, message)
        totalWeight += current
    }

    return function random() {
        var i = length,
            n = Math.random() * totalWeight

        while (i--) {
            var current = weights[ i ]

            if (n < current)
                return i

            n -= current
        }

        return -1
    }
}
