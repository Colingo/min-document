var test = require("tape")

var document = require("../index")

test("document is a Document", function (assert) {
    assert.equal(typeof document.createTextNode, "function")
    assert.equal(typeof document.createElement, "function")
    assert.equal(typeof document.createDocumentFragment, "function")

    assert.end()
})

test("can do stuff", function (assert) {
    var div = document.createElement("div")
    div.className = "foo bar"

    var span = document.createElement("span")
    div.appendChild(span)
    span.textContent = "Hello!"

    var html = String(div)

    assert.equal(html, "<DIV class=\"foo bar\">" +
        "<SPAN>Hello!</SPAN></DIV>")

    assert.end()
})


test("can createDocumentFragment", function (assert) {
    var frag = document.createDocumentFragment()

    var h1 = document.createElement("h1")
    var h2 = document.createElement("h2")


    frag.appendChild(h1)
    assert.equal(String(frag), "<H1></H1>")

    frag.appendChild(h2)
    assert.equal(String(frag), "<H1></H1><H2></H2>")

    frag.removeChild(h1)
    assert.equal(String(frag), "<H2></H2>")

    frag.replaceChild(h1, h2)
    assert.equal(String(frag), "<H1></H1>")

    assert.end()
})


test("getElementById, getElementsByTagName, querySelector", function (assert) {

    function append_el(id, parent, tag) {
        var el = document.createElement(tag || "div")
        el.id = id
        parent.appendChild(el)
        return el
    }

    var el1   = append_el(1, document.body)
    var el2   = append_el(2, document.body)

    var el11  = append_el(11,  el1)
    var el12  = append_el(12,  el1)
    var el21  = append_el(21,  el2)
    var el22  = append_el(22,  el2)
    var el221 = append_el(221, el22, "span")
    var el222 = append_el(222, el22)
    var el3   = append_el(3, document.body)

	el21.className = "findme"
	el222.setAttribute("type", "text/css")

    assert.equal(document.getElementById(1),    el1)
    assert.equal(document.getElementById("2"),  el2)
    assert.equal(document.getElementById(3),    el3)
    assert.equal(document.getElementById(11),   el11)
    assert.equal(document.getElementById(12),   el12)
    assert.equal(document.getElementById(21),   el21)
    assert.equal(document.getElementById(22),   el22)
    assert.equal(document.getElementById(221),  el221)
    assert.equal(document.getElementById(222),  el222)
    
	assert.equal(document.getElementsByTagName("div").length,  8)
	assert.equal(document.getElementsByTagName("span").length,  1)
	
	assert.equal(document.querySelector("span"),      el221)
	assert.equal(document.querySelector("#22"),       el22)
	assert.equal(document.querySelector("div#22"),    el22)
	assert.equal(document.querySelector("span#22"),   null)

	assert.equal(document.querySelector(".findme"),         el21)
	assert.equal(document.querySelector(".not_found"),      null)
	assert.equal(document.querySelector("div.findme"),      el21)
	assert.equal(document.querySelector("div.not_found"),   null)
	assert.equal(document.querySelector("span.findme"),     null)
	assert.equal(document.querySelector("span.not_found"),  null)
	assert.equal(document.querySelector("#21.findme"),      el21)
	assert.equal(document.querySelector("div#21.findme"),   el21)

    assert.end()
})

