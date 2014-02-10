define(["dcl/dcl",
        "delite/register",
        "delite/Widget",
        "delite/Invalidating"
], function (dcl, register, Widget, Invalidating) {

	// module:
	//		deliteful/list/Renderer

	return dcl([Widget, Invalidating], {
		// summary:
		//		Base class for a widget that render an item or a category inside a deliteful/list/List widget.
		//
		// description:
		//		This base class provide all the infrastructure that a deliteful/list/List widget
		//		expect from a renderer, including keyboard navigation support.
		//
		//		Keyboard navigation for a concrete renderer class is defined using the setFocusableChildren method.

		// _focusableChildren: Array
		//		contains all the renderer nodes that can be focused, in the same order
		//		that they are to be focused during keyboard navigation with the left and right arrow
		//		keys.
		_focusableChildren: null,

		// _focusedChild: Widget
		//		the renderer child that currently has the focus (null if no child has the focus)
		_focusedChild: null,

		/*=====
		// renderNode: DOMNode
		//		the dom node within which the rendering will occur.
		renderNode: null,
		=====*/

		//////////// PROTECTED METHODS ///////////////////////////////////////

		buildRendering: function () {
			// summary:
			//		set containerNode and Aria attributes.
			// tags:
			//		protected
			this.containerNode = this;
			this.setAttribute("role", "listitem");
		},

		/*=====
		 render: function () {
			// summary:
			// 		render the item or category inside the renderNode of the renderer.
			// tags:
			//		protected abstract
		 },
		 =====*/

		setFocusableChildren: function (/*DomNode...*//*jshint unused:vars*/children) {
			// summary:
			//		This method set the list of children of the renderer that can
			//		be focused during keyboard navigation, by keyboard navigation
			//		order. This method is generally called from the render method
			//		implementation, after the focused node have been created and
			//		assigned as named attributes of the renderer.
			// children: DomNode
			//		The focusable children (dom nodes) of the renderer, in the order
			//		they are focusable using keyboard navigation.
			// tags:
			//		protected
			var that = this;
			var focusHandler = function () {
				that._focusedChild = this;
			};
			this._focusableChildren = [];
			this._focusedChild = null;
			for (var i = 0; i < arguments.length; i++) {
				var node = arguments[i];
				if (node) {
					node.onfocus = focusHandler;
					this._focusableChildren.push(node);
				}
			}
		},

		focus: dcl.superCall(function (sup) {
			// summary:
			//		Focus the widget.
			// tags:
			//		protected
			return function () {
				this._focusedChild = null;
				sup.apply(this, arguments);
			};
		}),

		_getNextFocusableChild: function (fromChild, dir) {
			// summary:
			//		Get the next renderer child that can be focused using arrow keys.
			// fromChild: Widget
			//		The child from which the next focusable child is requested
			// dir: int
			//		The direction, from fromChild, of the next child: 1 for the child that
			//		comes after in the focusable order, -1 for the child that comes before.
			// tags:
			//		protected
			// returns:
			//		the next focusable child if there is one.
			if (this._focusableChildren) {
				// retrieve the position of the from node
				var nextChildIndex, fromChildIndex = -1, refNode = fromChild || this._focusedChild;
				if (refNode) {
					fromChildIndex = this._focusableChildren.indexOf(refNode);
				}
				if (dir === 1) {
					nextChildIndex = fromChildIndex + 1;
				} else {
					nextChildIndex = fromChildIndex - 1;
				}
				if (nextChildIndex >= this._focusableChildren.length) {
					nextChildIndex = 0;
				} else if (nextChildIndex < 0) {
					nextChildIndex = this._focusableChildren.length - 1;
				}
				return this._focusableChildren[nextChildIndex]; // Widget
			}
		}
		
	});

});