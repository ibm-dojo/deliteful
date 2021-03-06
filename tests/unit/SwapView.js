define(function (require) {
	"use strict";

	var registerSuite = intern.getPlugin("interface.object").registerSuite;
	var assert = intern.getPlugin("chai").assert;
	var register = require("delite/register");
	require("deliteful/SwapView");

	var container, node;
	var aaa, bbb;
	var asyncHandler;
	var htmlContent = "<d-swap-view id='vs'><div id='aaa'>AAA</div><div id='bbb'>BBB</div><div id='ccc'>CCC</div>" +
		"<div id='ddd'>DDD</div></d-swap-view>";

	function checkNodeVisibility(vs, target) {
		for (var i = 0; i < vs.children.length; i++) {
			assert.isTrue(
				((vs.children[i] === target && vs.children[i].style.display !== "none" &&
					vs.selectedChildId === target.id)) ||
					(vs.children[i] !== target && vs.children[i].style.display === "none")
			);
		}
	}
	registerSuite("SwapView Markup", {
		before: function () {
			container = document.createElement("div");
			document.body.appendChild(container);
			container.innerHTML = htmlContent;
			register.deliver();
			node = document.getElementById("vs");
			aaa = document.getElementById("aaa");
			bbb = document.getElementById("bbb");
		},

		tests: {
			"Default CSS": function () {
				assert.isTrue(node.classList.contains("d-swap-view"));
				assert.isTrue(node.classList.contains("d-view-stack"));
			},

			"Default values": function () {
				assert.deepEqual(node.transition, "slide");
				assert.deepEqual(node.reverse, false);
			},

			"Show (by widget)": function () {
				var d = this.async(1000);
				asyncHandler = node.on("delite-after-show", d.callback(function () {
					checkNodeVisibility(node, bbb);
				}));
				node.show(bbb);
			},

			"Show (by id)": function () {
				var d = this.async(1000);
				asyncHandler = node.on("delite-after-show", d.callback(function () {
					checkNodeVisibility(node, aaa);
				}));
				node.show("aaa");
			}
		},

		after: function () {
			container.parentNode.removeChild(container);
		},

		afterEach: function () {
			if (asyncHandler) {
				asyncHandler.remove();
			}
		}
	});
});
