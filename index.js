/*
* null
* |- Object
*    |- Node
*       |- DocumentFragment
*       |- Element             // skip
*       |  |- HTMLElement
*       |     |- HTML*Element  // skip
*       |- CharacterData       // skip
*       |  |- Text
*
*/



function extend(obj, _super, extras) {
    obj.prototype = Object.create(_super.prototype)
    for (var key in extras) {
        obj.prototype[key] = extras[key]
    }
}



/*
* http://dom.spec.whatwg.org/#node
*/
function Node(){}

extend(Node, Object, {
    parentNode:      null,
    childNodes:      null,
    firstChild:      null,
    lastChild:       null,
    previousSibling: null,
    nextSibling:     null,
    appendChild: function(el) {
        var t = this
        , childs = t.childNodes
        , len = childs.length

        el.parentNode = t
        el.previousSibling = childs[ len - 1 ] || null
        if (el.previousSibling) el.previousSibling.nextSibling = el

        childs.push(el)

        t.firstChild = childs[0] || null
        t.lastChild = childs[ len - 1 ] || null
    },
    insertBefore: function() {
        //TODO
    },
    replaceChild: function(el, needle) {
        var index = this.childNodes.indexOf(needle)

        this.childNodes[index] = el
        el.parentNode = this
        //TODO: update firstChild, ...
    },
    removeChild: function(el) {
        var index = this.childNodes.indexOf(el)
        this.childNodes.splice(index, 1)
        el.parentNode = null
        el.previousSibling = el.nextSibling || null
        //TODO: update firstChild, ...
    },
    cloneNode: function(deep) {
        //TODO
    },
    hasChildNodes: function() {
        return this.childNodes && this.childNodes.length > 0
    },
    toString: function() {
        var result = this.textContent || ""

        if (this.childNodes) return this.childNodes.reduce(function (memo, node) {
            return memo + node
        }, result)

        return result
    }
})


function DocumentFragment() {
    this.childNodes = []
}

extend(DocumentFragment, Node, {
    nodeType: 11,
    nodeName: "#document-fragment"
})


function HTMLElement(tag) {
    var t = this
    t.nodeName = t.tagName = tag.toUpperCase()
    t.dataset = {}
    t.childNodes = []
    t.style = {}
}

var el_re = /([.#:[])([-\w]+)(?:=([-\w]+)])?/g

extend(HTMLElement, Node, {
    nodeType: 1,
    nodeName: null,
    className: "",
    textContent: "",
    hasAttribute: function(name) {
        //HACK: we should figure out a better way
        if (name == "dataset" || name == "style" || name == "tagName") return false
        return this.hasOwnProperty(name) && !(name in HTMLElement.prototype)
    },
    getAttribute: function(name) {
        return this.hasAttribute(name) ? this[name] : null
    },
    setAttribute: function(name, value) {
        this[name] = value
    },
    removeAttribute: function(name) {
        delete this.name
    },
    getElementById: function(id) {
        var t = this
        if (""+t.id === ""+id) return t

        var arr = t.childNodes
        , result = null

        if (arr) {
            for (var i = 0, len = arr.length; !result && i < len; i++) {
                result = arr[i].nodeType == 1 ? arr[i].getElementById(id) : null
            }
        }
        return result
    },
    getElementsByTagName: function(tag) {
        var el, els = [], next = this.firstChild
        tag = tag === "*" ? 1 : tag.toUpperCase()
        for (var i = 0, key = tag === 1 ? "nodeType" : "nodeName"; (el = next); ) {
            if (el[key] === tag) els[i++] = el
            next = el.firstChild || el.nextSibling
            while (!next && (el = el.parentNode)) next = el.nextSibling
        }
        return els
    },
    querySelector: function(sel) {
        var el
        , i = 0
        , rules = ["_"]
        , tag = sel.replace(el_re, function(_, o, s, v) {
                rules.push(
                    o == "." ? "(' '+_.className+' ').indexOf(' "+s+" ')>-1" :
                    o == "#" ? "_.id=='"+s+"'" :
                    "_.getAttribute('"+s+"')"+(v?"=='"+v+"'":"")
                )
                return ""
            }) || "*"
        , els = this.getElementsByTagName(tag)
        , fn = Function("_", "return " + rules.join("&&"))

        for (; el = els[i++]; ) if (fn(el)) return el
        return null
    },
    toString: function() {
        var result = "<" + this.nodeName + properties(this) + datasetify(this)

        if (this.nodeName == "IMG" || this.nodeName == "BR") {
            return result + "/>"
        }

        return result + ">" +
            Node.prototype.toString.call(this) +
            "</" + this.nodeName + ">"
    }
})


function Text(value) {
    this.textContent = value
}

extend(DocumentFragment, Node, {
    nodeType: 3,
    nodeName: "#text"
})

function Document(){
    this.body = this.createElement("body")
}

extend(Document, Node, {
    nodeType: 9,
    nodeName: "#document",
    createElement: function(tag) {
        return new HTMLElement(tag)
    },
    createTextNode: function(value) {
        return new Text(value)
    },
    createDocumentFragment: function() {
        return new DocumentFragment()
    },
    getElementById: function(id) {
        return this.body.getElementById(id)
    },
    getElementsByTagName: function(tag) {
        return this.body.getElementsByTagName(tag)
    },
    querySelector: function(sel) {
        return this.body.querySelector(sel)
    }
})

var document = module.exports = new Document




function stylify(styles) {
    var attr = ""
    Object.keys(styles).forEach(function (key) {
        var value = styles[key]
        attr += key + ":" + value + ";"
    })
    return attr
}

function datasetify(el) {
    var ds = el.dataset
    var props = []

    for (var key in ds) {
        props.push({ name: "data-" + key, value: ds[key] })
    }

    return props.length ? stringify(props) : ""
}

function stringify(list) {
    var attributes = []
    list.forEach(function (tuple) {
        var name = tuple.name
        var value = tuple.value

        if (name === "style") {
            value = stylify(value)
        }

        attributes.push(name + "=" + "\"" + value + "\"")
    })

    return attributes.length ? " " + attributes.join(" ") : ""
}

function properties(el) {
    var props = []
    for (var key in el) {
        if (el.hasAttribute(key)) {
            props.push({ name: key, value: el[key] })
        }
    }

    if (el.className) {
        props.push({ name: "class", value: el.className })
    }

    return props.length ? stringify(props) : ""
}

