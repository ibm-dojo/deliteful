define([
	"luxon",
	"delite/register",
	"delite/Widget",
	"../TimeBase"
], function (
	luxon,
	register,
	Widget,
	TimeBase
) {
	"use strict";

	var DateTime = luxon.DateTime,
		Info = luxon.Info;

	/**
	 * Dispatched when user clicks a month (even if it's the currently selected month).
	 * evt.month is a number from 1 to 12.
	 * @example
	 * document.addEventListener("month-selected", function (evt) {
	 *      console.log("selected month", evt.month);
	 * });
	 * @event module:deliteful/DatePicker/MonthPicker#month-selected
	 * @property {number} month - Integer value representing the month, beginning with 0 for January to 11 for December.
	 */

	/**
	 * DatePicker's view with names of months.
	 */
	return register("d-month-picker", [HTMLElement, Widget, TimeBase], {
		baseClass: "d-month-picker",

		/**
		 * Aria-label for the grid.
		 * @member {string}
		 */
		gridLabel: "",

		/**
		 * Currently selected month, 1-based.  This month gets the d-date-picker-selected class.
		 */
		month: -1,

		initializeRendering: function () {
			// Make 3x4 grid of abbreviated month names (Jan, Feb, Mar, ...).
			this.setAttribute("role", "grid");
			var row;
			var months = Info.months("short");
			this.cells = months.map(function (month, idx) {
				if (idx % 3 === 0) {
					row = this.appendChild(this.ownerDocument.createElement("div"));
					row.setAttribute("role", "row");
				}
				var cell = row.appendChild(this.ownerDocument.createElement("div"));
				cell.setAttribute("role", "gridcell");
				cell.month = idx + 1;

				// Store text in a nested element so vertical centering works.
				var cellText = cell.appendChild(this.ownerDocument.createElement("span"));
				cellText.textContent = month;

				return cell;
			}, this);

			this.on("click", this.clickHandler.bind(this));
		},

		refreshRendering: function (oldVals) {
			if ("gridLabel" in oldVals) {
				this.setAttribute("aria-label", this.gridLabel);
			}

			if ("month" in oldVals) {
				// If there's a selected month, then set the "d-date-picker-selected" class on it.
				// Otherwise, set the "d-date-picker-today" class on the present month.
				this.cells.forEach(function (cell) {
					cell.classList.remove("d-date-picker-selected", "d-date-picker-today");
				});

				if (this.month >= 0) {
					this.cells[this.month - 1].classList.add("d-date-picker-selected");
				} else {
					var presentMonth = DateTime.local().month;
					this.cells[presentMonth - 1].classList.add("d-date-picker-today");
				}
			}
		},

		/**
		 * Handler for click of months.
		 * @param {Event} event
		 */
		clickHandler: function (event) {
			event.stopPropagation();
			for (var node = event.target; node !== this; node = node.parentNode) {
				if ("month" in node) {
					// Mark selected month as selected to give feedback to the user.
					this.month = node.month;

					this.emit("month-selected", {
						month: node.month
					});
					return;
				}
			}
		}
	});
});
