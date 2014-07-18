define([
	"intern!object",
	"intern/chai!assert",
	"dojo/Deferred",
	"deliteful/list/List"
], function (registerSuite, assert, Deferred, List) {

	var list = null;

	registerSuite({
		name: "list/List",
		beforeEach: function () {
			if (list) {
				list.destroy();
			}
			list = new List();
			document.body.appendChild(list);
			list.startup();
			list.store.add({label: "item 1"});
			list.store.add({label: "item 2"});
			list.store.add({label: "item 3"});
		},
		"baseClass update" : function () {
			assert.strictEqual(list.className, "d-list");
			list.baseClass = "d-round-rect-list";
			assert.strictEqual(list.className, "d-round-rect-list");
			list.baseClass = "d-list";
			assert.strictEqual(list.className, "d-list");
		},
		"scrollDirection horizontal not supported": function () {
			try {
				list.scrollDirection = "horizontal";
			} catch (error) {
				assert.isNotNull(error);
				console.log(error);
				assert.strictEqual(
						"'horizontal' not supported for scrollDirection, keeping the previous value of 'vertical'",
						error.message,
						"error message");
				assert.strictEqual(list.scrollDirection, "vertical");
			}
		},
		"scrollDirection foo not supported": function () {
			try {
				list.scrollDirection = "foo";
			} catch (error) {
				assert.isNotNull(error);
				console.log(error);
				assert.strictEqual("'foo' not supported for scrollDirection, keeping the previous value of 'vertical'",
						error.message,
						"error message");
				assert.strictEqual(list.scrollDirection, "vertical");
			}
		},
		"default scroll direction is vertical": function () {
			var dfd = this.async(1000);
			setTimeout(dfd.callback(function () {
				list.scrollDirection = "vertical";
				assert.strictEqual(list.scrollableNode.className, "d-list-container d-scrollable d-scrollable-v");
			}), 10);
			return dfd;
		},
		"scroll direction none": function () {
			var dfd = this.async(1000);
			list.scrollDirection = "none";
			setTimeout(dfd.callback(function () {
				list.scrollDirection = "none";
				assert.strictEqual(list.className, "d-list");
			}), 10);
			return dfd;
		},
		"getRendererByItemId": function () {
			var children = list.getChildren();
			assert.strictEqual(list.getRendererByItemId(list.store.data[0].id), children[0], "first renderer");
			assert.strictEqual(list.getRendererByItemId(list.store.data[1].id), children[1], "second renderer");
			assert.strictEqual(list.getRendererByItemId(list.store.data[2].id), children[2], "third renderer");
			assert.isNull(list.getRendererByItemId("I'm not an existing id"), "non list item");
		},
		"getItemRendererIndex": function () {
			var children = list.getChildren();
			assert.strictEqual(0, list.getItemRendererIndex(children[0]), "first renderer");
			assert.strictEqual(1, list.getItemRendererIndex(children[1]), "second renderer");
			assert.strictEqual(2, list.getItemRendererIndex(children[2]), "second renderer");
			assert.strictEqual(-1, list.getItemRendererIndex(list), "non list renderer");
		},
		"getEnclosingRenderer": function () {
			var children = list.getChildren();
			assert.strictEqual(list.getEnclosingRenderer(children[0]), children[0], "first");
			assert.strictEqual(list.getEnclosingRenderer(children[0].getChildren()[0]), children[0], "second");
			assert.isNull(list.getEnclosingRenderer(list), "third");
		},
		"_renderNewItems": function () {
			list._renderNewItems([{label: "item a"}, {label: "item b"}, {label: "item c"}], true);
			var children = list.getChildren();
			assert.strictEqual(children.length, 6, "nb of items");
			assert.strictEqual(children[0].item.label, "item a", "first added 1");
			assert.strictEqual(children[1].item.label, "item b", "first added 2");
			assert.strictEqual(children[2].item.label, "item c", "firstd added 3");
			list._renderNewItems([{label: "item d"}, {label: "item e"}, {label: "item f"}], false);
			children = list.getChildren();
			assert.strictEqual(children.length, 9, "nb of items 2");
			assert.strictEqual(children[6].item.label, "item d", "last added 1");
			assert.strictEqual(children[7].item.label, "item e", "last added 2");
			assert.strictEqual(children[8].item.label, "item f", "last added 3");
		},
		"_getFirst": function () {
			var dfd = this.async(1000);
			var children = list.getChildren();
			assert.strictEqual(list._getFirst(), children[0].renderNode);
			list.categoryAttr = "label";
			setTimeout(dfd.callback(function () {
				children = list.getChildren();
				assert.strictEqual(children[0].className, "d-list-category", "first is category");
				assert.strictEqual(list._getFirst(), children[0].renderNode, "first renderer is category");
			}, 10));
			return dfd;
		},
		"_getLast": function () {
			var children = list.getChildren();
			assert.strictEqual(list._getLast(), children[2].renderNode);
		},
		"update item label": function () {
			var dfd = this.async(1000);
			list.store.put({label: "item a"}, {id: list.store.data[0].id});
			setTimeout(dfd.callback(function () {
				var renderer = list.getChildren()[0];
				assert.strictEqual(renderer.item.label, "item a");
				assert.strictEqual(renderer.firstChild.children[1].innerHTML, "item a");
			}), 10);
			return dfd;
		},
		"update item: add, update and remove icon" : function () {
			var dfd = this.async(1000);
			// add
			list.store.put({label: "item a", iconclass: "my-icon"}, {id: list.store.data[0].id});
			setTimeout(dfd.rejectOnError(function () {
				var renderer = list.getChildren()[0];
				assert.strictEqual(renderer.item.label, "item a");
				assert.strictEqual(renderer.firstChild.getAttribute("role"), "gridcell");
				assert.strictEqual(renderer.firstChild.firstChild.className, "d-list-item-icon my-icon");
				assert.strictEqual(renderer.firstChild.children[1].className, "d-list-item-label");
				assert.strictEqual(renderer.firstChild.children[1].innerHTML, "item a");
				// update
				list.store.put({label: "item a", iconclass: "my-other-icon"}, {id: list.store.data[0].id});
				setTimeout(dfd.rejectOnError(function () {
					var renderer = list.getChildren()[0];
					assert.strictEqual(renderer.item.label, "item a");
					assert.strictEqual(renderer.firstChild.getAttribute("role"), "gridcell");
					assert.strictEqual(renderer.firstChild.firstChild.className, "d-list-item-icon my-other-icon");
					assert.strictEqual(renderer.firstChild.children[1].className, "d-list-item-label");
					assert.strictEqual(renderer.firstChild.children[1].innerHTML, "item a");
					// remove
					list.store.put({label: "item a"}, {id: list.store.data[0].id});
					setTimeout(dfd.callback(function () {
						var renderer = list.getChildren()[0];
						assert.strictEqual(renderer.item.label, "item a");
						assert.strictEqual(renderer.firstChild.getAttribute("role"), "gridcell");
						assert.strictEqual(renderer.firstChild.children[1].className, "d-list-item-label");
						assert.strictEqual(renderer.firstChild.children[1].innerHTML, "item a");
					}), 10);
				}), 10);
			}), 10);
			return dfd;
		},
		"item category attribute is not undefined by StoreMap": function () {
			list.destroy();
			list = new List();
			list.startup();
			list.store.add({label: "item 1", category: "category 1"});
			assert.strictEqual(list.getChildren()[0].item.category, "category 1");
		},
		"query-error event": function () {
			var def = this.async(1000);
			try {
				var queryErrorEvt = null;
				var store = {
					filter: function () {
						var result = new Deferred();
						result.map = function () { return this; };
						result.reject("Query Error X");
						return result;
					}
				};
				list.destroy();
				list = new List({store: store});
				list.on("query-error", function (evt) {
					queryErrorEvt = evt;
				});
				list.startup();
				setTimeout(def.callback(function () {
					assert.isNotNull(queryErrorEvt);
					assert.strictEqual("Query Error X", queryErrorEvt.error, "error message");
					assert(!list.hasAttribute("aria-busy"));
				}), 10);
			} catch (e) {
				def.reject(e);
			}
			return def;
		},
		"first focus apply to the first visible child": function () {
			var def = this.async(1000);
			try {
				list.style.height = "200px";
				var itemHeightInPixel = 43;
				for (var i = 0; i < 50; i++) {
					list.store.add({label: "item " + (i + 4)});
				}
				list.focus();
				setTimeout(def.rejectOnError(function () {
					try {
						var focusedElement = document.activeElement;
						assert.isNotNull(focusedElement, "active element");
						assert.isDefined(focusedElement, "active element");
						assert.strictEqual("item 1", focusedElement.parentNode.item.label, "focused element label");
						list.scrollableNode.scrollTop = itemHeightInPixel * 2.5;
						setTimeout(def.rejectOnError(function () {
							list.focus();
							setTimeout(def.callback(function () {
								try {
									var focusedElement = document.activeElement;
									assert.isNotNull(focusedElement, "active element");
									assert.isDefined(focusedElement, "active element");
									assert.strictEqual("item 4", focusedElement.parentNode.item.label,
										"focused element label");
									def.resolve();
								} catch (error) {
									def.reject(error);
								}
							}), 10);
						}), 500);
					} catch (error) {
						def.reject(error);
					}
				}), 10);
			} catch (error) {
				def.reject(error);
			}
			return def;
		},
		teardown : function () {
			list.destroy();
			list = null;
		}
	});
});
