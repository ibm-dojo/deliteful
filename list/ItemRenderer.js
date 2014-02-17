define(["dcl/dcl",
        "delite/register",
        "./Renderer"
], function (dcl, register, Renderer) {

	// module:
	//		deliteful/list/ItemRenderer

	var ItemRenderer = dcl(Renderer, {
		// summary:
		//		Default item renderer for the deliteful/list/List widget.
		//
		// description:
		//		This renderer renders generic items that can have any of the following attributes (display
		//		position of the rendering described for LTR direction) :
		//		- iconclass: css class to apply to a DIV element on the left side of the list item in order
		//				to display an icon.
		//				Rendered with CSS class d-list-item-icon + the value of the attribute;
		//		- label: string to render on the left side of the node, after the icon.
		//				Rendered with CSS class d-list-item-label;
		//		- righttext: string to render of the right side if the node.
		//				Rendered with CSS class d-list-item-right-text;
		//		- righticonclass: css class to apply to a DIV element on the right side of the list item
		//				in order to display an icon.
		//				Rendered with CSS class d-list-item-right-icon2 + the value of the attribute;
		//		All the nodes that renders the attributes are focusable with keyboard navigation
		//		(using left and right arrows).

		// baseClass: [protected] String
		//		CSS class of an item renderer. This value is expected by the deliteful/list/List widget
		//		so it must not be changed.
		baseClass: "d-list-item",

		//////////// PROTECTED METHODS ///////////////////////////////////////

		buildRendering: dcl.superCall(function (sup) {
			// summary:
			//		Create the widget render node (this.renderNode), into which an item will be rendered.
			// tags:
			//		protected
			return function () {
				sup.apply(this, arguments);
				this.renderNode = this.ownerDocument.createElement("div");
				this.renderNode.className = "d-list-item-node";
				this.appendChild(this.renderNode);
			};
		}),

		render: function () {
			// summary:
			//		render the item inside this.renderNode.
			// item: Object
			//		The item to render.
			// tags:
			//		protected
			this._renderNode("text", "labelNode",
					this.item ? this.item.label : null, "d-list-item-label", "0");
			this._renderNode("icon", "iconNode",
					this.item ? this.item.iconclass : null, "d-list-item-icon");
			this._renderNode("text", "righttextNode",
					this.item ? this.item.righttext : null, "d-list-item-right-text", "1");
			this._renderNode("icon", "righticonNode",
					this.item ? this.item.righticonclass : null, "d-list-item-right-icon");
		},

		//////////// PRIVATE METHODS ///////////////////////////////////////

		_renderNode: function (nodeType, nodeName, data, nodeClass, navindex) {
			// summary:
			//		render a node.
			// nodeType: String
			//		"text" for a text node, "icon" for an icon node.
			// nodeName: String
			//		the name of the attribute to use to store a reference to the node in the renderer.
			// data: String
			//		the data to render (null if there is no data and the node should be deleted).
			//		For a nodeType of "text", data is the text to render.
			//		For a nodeType of "icon", data is the extra class to apply to the node
			// nodeClass: String
			//		base CSS class for the node.
			// navindex: String
			//		keyboard navigation index for the node.
			// tag:
			//		private
			if (data) {
				if (!this[nodeName]) {
					this[nodeName] = this.ownerDocument.createElement("DIV");
					this[nodeName].className = nodeClass;
					if (navindex) {
						this[nodeName].setAttribute("navindex", navindex);
					}
					if (this.renderNode.firstChild) {
						this.renderNode.insertBefore(this[nodeName], this.renderNode.firstChild);
					} else {
						this.renderNode.appendChild(this[nodeName]);
					}
				}
				if (nodeType === "text") {
					this[nodeName].innerHTML = data;
				} else {
					this[nodeName].className = nodeClass + " " + data;
				}
			} else {
				if (this[nodeName]) {
					this[nodeName].parentNode.removeChild(this[nodeName]);
					delete this[nodeName];
				}
			}
		}
	});

	return register("d-list-item-renderer", [HTMLElement, ItemRenderer]);
});