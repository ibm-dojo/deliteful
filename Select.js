/** @module deliteful/Select */
define([
	"dcl/dcl",
	"dojo/on", // TODO: replace (when replacement confirmed)
	"dojo/dom-class", // TODO: replace (when replacement confirmed)
	"dstore/Memory",
	"dstore/Observable",
	"delite/register",
	"delite/FormWidget",
	"delite/StoreMap",
	"delite/Selection",
	"delite/handlebars!./Select/Select.html",
	"delite/theme!./Select/themes/{{theme}}/Select_css"
], function (dcl, on, domClass, Memory, Observable, register,
	FormWidget, StoreMap, Selection, template) {

	/**
	 * A form-aware and store-aware widget leveraging the native HTML5 `<select>`
	 * element.
	 * It has the following characteristics:
	 * * The corresponding custom tag is `<d-select>`.
	 * * Store support (limitation: to avoid graphic glitches, the updates to the
	 * store should not be done while the native dropdown of the select is open).
	 * * The item rendering has the limitations of the `<option>` elements of the
	 * native `<select>`, in particular it is text-only.
	 * 
	 * TODO: improve doc.
	 * 
	 * Remarks:
	 * * The option items must be added, removed or updated exclusively using
	 * the store API. Direct operations using the DOM API are not supported.
	 * * The handling of the selected options of the underlying native `<select>`
	 * must be done using the API inherited by deliteful/Select from delite/Selection.
	 * 
	 * @example <caption>Using the default store</caption>
	 * JS:
	 * require("deliteful/Select", "dom/domReady!"],
	 *   function () {
	 *     select1.store.add({text: "Option 1", value: "1"});
	 *     ...
	 *   });
	 * HTML:
	 * <d-select id="select1"></d-select>
	 * @example <caption>Using user's store</caption>
	 * JS:
	 * require("dstore/Memory", "dstore/Observable",
	 *         "deliteful/Select", "dom/domReady!"],
	 *   function (Memory, Observable) {
	 *     var store = new (Memory.createSubclass(Observable))({});
	 *     select1.store = store;
	 *     store.add({text: "Option 1", value: "1"});
	 *     ...
	 *   });
	 * HTML:
	 * <d-select selectionMode="multiple" id="select1"></d-select>
	 * 
	 * @class module:deliteful/Select
	 * @augments {module:delite/FormWidget}
	 * @augments {module:delite/Store}
	 */
	return register("d-select", [HTMLElement, FormWidget, StoreMap, Selection],
		/** @lends module:deliteful/Select# */ {
		
		// Note: the properties `store` and `query` are inherited from delite/Store, and
		// the property `disabled` is inherited from delite/FormWidget.
		
		/**
		 * The number of rows that should be visible at one time when the widget
		 * is presented as a scrollable list box. Corresponds to the `size` attribute
		 * of the underlying native HTML `<select>`.
		 * @member {number}
		 * @default 0
		 */
		size: 0,
		
		/**
		 * The name of the property of store items which contains the text
		 * of Select's options.
		 * @member {string}
		 * @default "text"
		 */
		textAttr: "text",
		
		/**
		 * The name of the property of store items which contains the value
		 * of Select's options.
		 * @member {string}
		 * @default "value"
		 */
		valueAttr: "value",
		
		/**
		 * The name of the property of store items which contains the disabled
		 * value of Select's options. To disable a given option, the `disabled`
		 * property of the corresponding data item must be set to a truthy value.
		 * Otherwise, the option is enabled if data item property is absent, or
		 * its value is falsy or the string "false".
		 * @member {string}
		 * @default "disabled"
		 */
		disabledAttr: "disabled",
		
		baseClass: "d-select",
		
		/**
		 * Indicates whether multiple options can be selected. If `false`, only one option
		 * can be selected at a time. This private property is used in the widget template
		 * for binding the `multiple` attribute of the underlying native select.
		 * @member {boolean}
		 * @default false
		 * @private
		 */
		multipleSelect: false, // unfortunately an underscore prefix would break the binding in the template
		
		/**
		 * The chosen selection mode.
		 *
		 * Valid values are:
		 *
		 * 1. "single": Only one option can be selected at a time.
		 * 2. "multiple": Several options can be selected (by taping or using the
		 * control key modifier).
		 *
		 * Changing this value impacts the currently selected items to adapt the
		 * selection to the new mode. However, regardless of the selection mode,
		 * it is always possible to set several selected items using the
		 * `selectedItem` or `selectedItems` properties.
		 * The mode will be enforced only when using `setSelected` and/or
		 * `selectFromEvent` APIs.
		 *
		 * @member {string} module:deliteful/Select#selectionMode
		 * @default "single"
		 */
		// The purpose of the above pseudo-property is to adjust the documentation
		// of selectionMode as provided by delite/Selection.
		  
		buildRendering: template,
		
		preCreate: function () {
			// The properties "store" and "query" are added as invalidating properties
			// by delite/Store.preCreate(). delite/FormWidget adds "disabled".
			this.addInvalidatingProperties(
				// renderItems is delite/Store's property; see delite issue #188
				// TODO: check if still needed depending on the result of this issue.
				"renderItems",
				"textAttr",
				"valueAttr",
				"disabledAttr"
			);
		},
		
		postCreate: function () {
			if (!this.store) { // If not specified by the user
				this.store = new (Memory.createSubclass(Observable))({});
			}
			
			this.focusNode = this.valueNode; // for delite/FormWidget's sake
			
			// To provide graphic feedback for focus, react to focus/blur events
			// on the underlying native select. The CSS class is used instead
			// of the focus pseudo-class because the browsers give the focus
			// to the underlying select, not to the widget.
			this.own(on(this.valueNode, "focus, blur", function (evt) {
				domClass.toggle(this, "d-select-focus", evt.type === "focus");
			}.bind(this)));
			
			// Keep delite/Selection's selectedItem/selectedItems in sync after
			// interactive selection of options.
			this.own(on(this.valueNode, "change", function (event) {
				var selectedItems = this.selectedItems,
					selectedOptions = this.valueNode.selectedOptions;
				// HTMLSelectElement.selectedOptions is not present in all browsers...
				// At least IE10/Win misses it. Hence:
				if (selectedOptions === undefined) {
					// Convert to array
					var options = [].map.call(this.valueNode.options,
						function (option) {
							return option;
						});
					selectedOptions = options.filter(function (option) {
						return option.selected;
					});
				} else {
					// convert HTMLCollection into array (to be able to use array.indexOf)
					selectedOptions = [].map.call(selectedOptions,
						function (option) {
							return option;
						});
				}
				var nSelectedItems = selectedItems ? selectedItems.length : 0,
					nSelectedOptions = selectedOptions ? selectedOptions.length : 0;
				var i;
				var selectedOption, selectedItem;
				// Identify the options which changed their selection state. Two steps:
				// Step 1. Search options previously selected (currently in widget.selectedItems)
				// which are no longer selected in the native select.
				for (i = 0; i < nSelectedItems; i++) {
					selectedItem = selectedItems[i];
					if (selectedOptions.indexOf(selectedItem.visualItem) === -1) {
						this.selectFromEvent(event, selectedItem, selectedItem.visualItem, true);
					}
				}
				// Step 2. Search options newly selected in the native select which are not
				// present in the current selection (widget.selectedItems).
				for (i = 0; i < nSelectedOptions; i++) {
					selectedOption = selectedOptions[i];
					if (selectedItems.indexOf(selectedOption.renderItem) === - 1) {
						this.selectFromEvent(event, selectedOption.renderItem, selectedOption, true);
					}
				}
			}.bind(this)));
			
			// Thanks to the custom getter defined in deliteful/Select for widget's
			// `value` property, there is no need to add code for keeping the
			// property in sync after a form reset.
		},
		
		hasSelectionModifier: function () {
			// Override of the method from delite/Selection because the
			// default implementation is inappropriate: the "change" event
			// has no key modifier.
			return this.selectionMode === "multiple";
		},
		
		refreshRendering: function (props) {
			if (props.renderItems) {
				// Populate the select with the items retrieved from the store.
				var renderItems = this.renderItems;
				var n = renderItems ? renderItems.length : 0;
				// TODO: CHECKME/IMPROVEME. Also called after adding, deleting or updating just one item.
				// Worth optimizing to avoid recreating from scratch?
				this.valueNode.innerHTML = ""; // Remove the existing options from the DOM
				if (n > 0) {
					var fragment = this.ownerDocument.createDocumentFragment();
					var renderItem, option;
					for (var i = 0; i < n; i++) {
						renderItem = renderItems[i];
						option = this.ownerDocument.createElement("option");
						option.renderItem = renderItem;
						renderItem.visualItem = option;
						
						// According to http://www.w3.org/TR/html5/forms.html#the-option-element, we 
						// could use equivalently the label or the text IDL attribute of the option element.
						// However, using the label attr. breaks the rendering in FF29/Win7!
						// This is https://bugzilla.mozilla.org/show_bug.cgi?id=40545.
						// Hence don't do
						// option.label = renderItem.label;
						// Instead:
						if (renderItem.text !== undefined) { // optional
							option.text = renderItem.text;
						}
						if (renderItem.value !== undefined) { // optional
							option.setAttribute("value", renderItem.value);
						}
						if (this.isSelected(renderItem)) { // delite/Selection's API
							option.setAttribute("selected", "true");
						}
						if (renderItem.disabled !== undefined &&
							!!renderItem.disabled && renderItem.disabled !== "false") { // optional
							// Note that for an enabled option the attribute must NOT be set
							// (<option disabled="false"> is a disabled option!)
							option.setAttribute("disabled", "true");
						}
						
						fragment.appendChild(option);
					}
					this.valueNode.appendChild(fragment);
					
					if (this.selectionMode === "single") {
						// Since there is no native "change" event initially, initialize
						// the delite/Selection's selectedItem property with the currently
						// selected option of the native select.
						this.selectedItem =
							this.valueNode.options[this.valueNode.selectedIndex].renderItem;
					} // else for the native multi-select: it does not have any
					// option selected by default.
				}
			}
		},
		
		getIdentity: function (renderItem) {
			// Override of delite/Selection's method
			return renderItem.id;
		},
		
		updateRenderers: function () {
			// Override of delite/Selection's method
			// Trigger recreation from scratch:
			this.invalidateRendering("renderItems");
		},
		
		_setValueAttr: function (value) {
			if (this.valueNode) {
				this.valueNode.value = value;
			}
		},
		
		_getValueAttr: function () {
			return this.valueNode ? this.valueNode.value : "";
		},
		
		_setSelectionModeAttr: dcl.superCall(function (sup) {
			// Override of the setter from delite/Selection for 2 purposes:
			// Forbid the value "none" and convert the value of selectionMode
			// into the appropriate value of the non-documented property multiple
			// which is used as target for the binding of the multiple attribute
			// of the native select in the widget template.
			return function (value) {
				if (value !== "single" && value !== "multiple") {
					throw new TypeError("'" + value +
						"' not supported for selectionMode; keeping the previous value of '" +
						this.selectionMode + "'");
				} else {
					// Update the internal widget property used for the binding in the template
					this.multipleSelect = (value === "multiple");
				}
				sup.call(this, value);
			};
		})
	});
});
