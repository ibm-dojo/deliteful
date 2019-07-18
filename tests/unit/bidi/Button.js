define(function (require) {
	"use strict";

	var registerSuite = intern.getPlugin("interface.object").registerSuite;
	var assert = intern.getPlugin("chai").assert;
	var register = require("delite/register");
	var Button = require("deliteful/Button");
	var container, html = "<d-button id='b1' textDir='ltr'>" +
		"\u05d0\u05d1\u05d2 ABC</d-button>" +
		"<d-button id='b2' textDir='rtl'>ABC \u05d0\u05d1\u05d2</d-button>" +
		"<d-button id='b3' title='ABC \u05d0\u05d1\u05d2' textDir='auto'>" +
		"\u05d0\u05d1\u05d2 ABC</d-button>" +
		"<d-button id='b4' label='ABC \u05d2\u05d1\u05d0' textDir='auto'>" +
		"\u05d0\u05d1\u05d2 ABC</d-button>";

	registerSuite("deliteful/Button (bidi)", {
		before: function () {
			container = document.createElement("div");
			document.body.appendChild(container);
		},

		tests: {
			markup: {
				beforeEach: function () {
					container.innerHTML = html;
					register.deliver();
				},

				tests: {
					ltr: function () {
						var b1 = document.getElementById("b1");
						assert.strictEqual("\u202a\u05d0\u05d1\u05d2 ABC\u202c", b1.labelNode.textContent,
							"ltr: wrong displayed value for 'label'");
						assert.strictEqual("\u202a\u05d0\u05d1\u05d2 ABC\u202c", b1.title,
							"ltr: wrong default value for 'title'");
					},
					rtl: function () {
						var b2 = document.getElementById("b2");
						assert.strictEqual("\u202bABC \u05d0\u05d1\u05d2\u202c", b2.labelNode.textContent,
							"rtl: wrong displayed value for 'label'");
						assert.strictEqual("\u202bABC \u05d0\u05d1\u05d2\u202c", b2.title,
							"rtl: wrong default value for 'title'");
					},
					auto: function () {
						var b3 = document.getElementById("b3");
						assert.strictEqual("\u202b\u05d0\u05d1\u05d2 ABC\u202c", b3.labelNode.textContent,
							"auto: wrong displayed value for 'label'");
						assert.strictEqual("\u202aABC \u05d0\u05d1\u05d2\u202c", b3.title,
							"auto: wrong value for 'title'");
					},
					auto2: function () {
						var b4 = document.getElementById("b4");
						assert.strictEqual("\u202aABC \u05d2\u05d1\u05d0\u202c", b4.labelNode.textContent,
							"auto2: wrong displayed value for 'label'");
						assert.strictEqual("\u202aABC \u05d2\u05d1\u05d0\u202c", b4.title,
							"auto2: wrong value for 'title'");
					}
				},

				afterEach: function () {
					container.innerHTML = "";
				}
			},

			dynChanges: {
				beforeEach: function () {
					container.innerHTML = html;
				},

				tests: {
					textDir: function () {
						var b1 = new Button({
							id: "b1",
							label: "\u05d0\u05d1\u05d2 ABC",
							title: "ABC \u05d0\u05d1\u05d2"
						});
						b1.textDir = "ltr";
						b1.placeAt(container);
						assert.strictEqual("\u202a\u05d0\u05d1\u05d2 ABC\u202c", b1.labelNode.textContent,
							"ltr: wrong displayed value for 'label'");
						assert.strictEqual("\u202aABC \u05d0\u05d1\u05d2\u202c", b1.title,
							"ltr: wrong default value for 'title'");
						b1.textDir = "rtl";
						b1.deliver();
						assert.strictEqual("\u202b\u05d0\u05d1\u05d2 ABC\u202c", b1.labelNode.textContent,
							"rtl: wrong displayed value for 'label'");
						assert.strictEqual("\u202bABC \u05d0\u05d1\u05d2\u202c", b1.title,
							"rtl: wrong default value for 'title'");
						b1.textDir = "auto";
						b1.deliver();
						assert.strictEqual("\u202b\u05d0\u05d1\u05d2 ABC\u202c", b1.labelNode.textContent,
							"auto: wrong displayed value for 'label'");
						assert.strictEqual("\u202aABC \u05d0\u05d1\u05d2\u202c", b1.title,
							"auto: wrong default value for 'title'");
					},

					label: function () {
						var b2 = new Button({id: "b2"});
						b2.textDir = "rtl";
						b2.label = "ABC \u05d0\u05d1\u05d2";
						b2.placeAt(container);
						assert.strictEqual("\u202bABC \u05d0\u05d1\u05d2\u202c", b2.labelNode.textContent,
							"label: wrong displayed rtl value");
						b2.textDir = "ltr";
						b2.label = "\u05d0\u05d1\u05d2 ABC";
						b2.deliver();
						assert.strictEqual("\u202a\u05d0\u05d1\u05d2 ABC\u202c", b2.labelNode.textContent,
							"label: wrong displayed ltr value");
					},

					title: function () {
						var b3 = new Button({id: "b3"});
						b3.textDir = "auto";
						b3.title = "\u05d0\u05d1\u05d2 ABC";
						b3.placeAt(container);
						assert.strictEqual("\u202b\u05d0\u05d1\u05d2 ABC\u202c", b3.title,
							"title: wrong value for 'auto' (1)");
						b3.textDir = "ltr";
						b3.title = "ABC \u05d0\u05d1\u05d2";
						b3.deliver();
						assert.strictEqual("\u202aABC \u05d0\u05d1\u05d2\u202c", b3.title,
							"title: wrong value for 'auto' (2)");
					}
				},

				afterEach: function () {
					container.innerHTML = "";
				}
			}
		},

		after: function () {
			container.parentNode.removeChild(container);
		}
	});
});
