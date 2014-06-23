define(["intern!object",
        "intern/chai!assert",
        "require"
        ], function (registerSuite, assert, require) {
	
	var WAIT_TIMEOUT_MS = 180000;

	var TEST_TIMEOUT_MS = 120000;

	var clickOnStar = function (remote, widgetId, starIndex /*first index is 1*/,
			firstHalf/*true to click on the first half, false to click the second half*/) {
			var divIndex = starIndex * 2 + (firstHalf ? 0 : 1);
			return remote
				.elementByXPath("//*[@id='" + widgetId + "']/div/div[" + divIndex + "]")
					.click()
					.end();
		};

	var clickOnZeroSettingArea = function (remote, widgetId) {
//		if (/internet explorer/.test(remote.environmentType.browserName)) {
//			// Clicking the element doesn't work in firefox and internet explorer
//			// (no pointer up event received by StarRating)
//			return remote
//				.elementByXPath("//*[@id='" + widgetId + "']/div/div[1]")
//					.moveTo()
//					.end()
//				.click();
//		} else {
			return remote
				.elementByXPath("//*[@id='" + widgetId + "']/div/div[1]")
					.click()
					.end();
//		}
	};

	var checkSubmitedParameters = function (remote, /*Array*/expectedKeys, /*Array*/expectedValues) {
		var i = 0;
		return remote.wait(1)
				.then(function () {
					for (; i < expectedKeys.length; i++) {
						(function (i) {
							remote.elementByXPath("//*[@id='parameters']/tbody/tr[" + (i + 2) + "]/td[1]")
								.text()
								.then(function (value) {
									assert.equal(value, expectedKeys[i]);
								})
								.end()
							.elementByXPath("//*[@id='parameters']/tbody/tr[" + (i + 2) + "]/td[2]")
								.text()
								.then(function (value) {
									assert.equal(value, expectedValues[i]);
								})
								.end();
						})(i);
					}
				});
	};

	var checkRating = function (remote, widgetId, expectedMax, expectedValue, expectedDisabled) {
		var i, expectedClasses = [];
		for (i = 0; i < 2 * expectedMax; i++) {
			expectedClasses[i] = "d-star-rating-star-icon";
			expectedClasses[i] += i % 2 ? " d-star-rating-end" : " d-star-rating-start";
			if ((i + 1) * 0.5 <= expectedValue) {
				expectedClasses[i] += " d-star-rating-full";
			} else {
				expectedClasses[i] += " d-star-rating-empty";
			}
		}
		return remote
			.waitForCondition("document.getElementById('" + widgetId +
				"').focusNode.getAttribute('aria-valuenow') == '" + expectedValue + "'", 3000, 500)
			.then(function () {
				return remote
				.elementByXPath("//*[@id='" + widgetId + "']/div")
						.getAttribute("aria-disabled")
						.then(function (value) {
							assert.equal(value, expectedDisabled ? "true" : "false", "aria-disabled");
						})
						.getAttribute("tabindex")
						.then(function (value) {
							assert.equal(value, expectedDisabled ? null : "0", "tabIndex");
						})
						.getAttribute("role")
						.then(function (value) {
							assert.equal(value, "slider", "role");
						})
						.getAttribute("aria-label")
						.then(function (value) {
							assert.equal(value, "rating", "aria-label");
						})
						.getAttribute("aria-valuemin")
						.then(function (value) {
							assert.equal(value, "0", "aria-valuemin");
						})
						.getAttribute("aria-valuemax")
						.then(function (value) {
							assert.equal(value, expectedMax, "aria-valuemax");
						})
						.getAttribute("aria-valuetext")
						.then(function (value) {
							assert.equal(value, expectedValue + " stars", "aria-valuetest");
						})
						.elementsByClassName("d-star-rating-star-icon")
							.then(function (children) {
								assert.equal(children.length, 2 * expectedMax, "The expected number of stars is wrong");
							})
						.end()
					.then(function () {
						for (i = 0; i < 2 * expectedMax; i++) {
							(function (i) {
								remote.elementByXPath("//*[@id='" + widgetId + "']/div/div[" + (i + 2) + "]")
									.getAttribute("className")
									.then(function (result) {
										assert.equal(result, expectedClasses[i], "star " + i + " class");
									})
									.end();
							})(i);
						}
					})
					.end();
			});
	};

	var defaultEditableRatingTest = function (remote, widgetId, halfStars, zeroSetting, expectedInitialValue) {
		var expectedAfterClickOnThirdStar = halfStars ? 2.5 : 3;
		return remote
		.get(require.toUrl("./StarRating.html"))
		.waitForCondition("'ready' in window && ready", WAIT_TIMEOUT_MS)
		// Check initial rating
		.then(function () {
			return checkRating(remote, widgetId, 7, expectedInitialValue, false);
		})
		// check rating change after firing down and up events on a star
		.then(function () {
			return clickOnStar(remote, widgetId, 3, true);
		})
		.then(function () {
			return checkRating(remote, widgetId, 7, expectedAfterClickOnThirdStar, false);
		})
		// set zero rating
		.then(function () {
			if (zeroSetting) {
				return clickOnZeroSettingArea(remote, widgetId);
			}
		})
		.then(function () {
			if (zeroSetting) {
				return checkRating(remote, widgetId, 7, 0, false);
			}
		});
		///////////////////////////////////////////
		// TODO: CHECK USING MOVE TO SET VALUES
		///////////////////////////////////////////
	};

	console.log("# Registering StarRating tests");
	registerSuite({
		name: "StarRating tests",
		"read only ltr": function () {
			this.timeout = TEST_TIMEOUT_MS;
			var remote = this.remote, widgetId = "star", i;
			console.log("# running test 'read only ltr'");
			return remote
			.get(require.toUrl("./StarRating.html"))
			.waitForCondition("'ready' in window && ready", WAIT_TIMEOUT_MS)
			.then(function () {
				// Check initial rating
				return checkRating(remote, widgetId, 1, 0, false);
			})
			// click the + button and verify the value is updated
			.then(function () {
				for (i = 0; i < 2; i++) {
					(function (i) {
						remote.elementById("starplus")
							.clickElement()
							.end()
						.then(function () {
							checkRating(remote, widgetId, 1, (i + 1) * 0.5, false);
						});
					})(i);
				}
			})
			// click the - button and verify the value is updated
			.then(function () {
				for (i = 0; i < 2; i++) {
					(function (i) {
						remote.elementById("starminus")
							.clickElement()
							.end()
						.then(function () {
							checkRating(remote, widgetId, 1, (1 - i) * 0.5, false);
						});
					})(i);
				}
			})
			// click on the star: doesn't change anything
			.then(function () {
				return clickOnStar(remote, widgetId, 1, true);
			})
			.then(function () {
				return checkRating(remote, widgetId, 1, 0, false);
			});
		},
		"editable ltr": function () {
			this.timeout = TEST_TIMEOUT_MS;
			console.log("# running test 'editable ltr'");
			return defaultEditableRatingTest(this.remote, "editablestar1", false, true, 0);
		},
		"editable half values ltr": function () {
			this.timeout = TEST_TIMEOUT_MS;
			console.log("# running test 'editable half values ltr'");
			return defaultEditableRatingTest(this.remote, "editablestar2", true, true, 0);
		},
		"editable half values no zero setting ltr": function () {
			this.timeout = TEST_TIMEOUT_MS;
			console.log("# running test 'editable half values no zero setting ltr'");
			return defaultEditableRatingTest(this.remote, "editablestar5", true, false, 0.5);
		},
		"editable programmatic onchange ltr": function () {
			this.timeout = TEST_TIMEOUT_MS;
			console.log("# running test 'editable programmatic onchange ltr'");
			var remote = this.remote, id = "editablestar6";
			return remote
				.get(require.toUrl("./StarRating.html"))
				.waitForCondition("'ready' in window && ready", WAIT_TIMEOUT_MS)
				// Check initial rating
				.then(function () {
					return checkRating(remote, id, 7, 3.5, false);
				})
				// Check message
				.elementById(id + "value")
					.text()
					.then(function (text) {
						assert.equal(text, "Rating is 3.5 stars", "message is not the one expected for " + id);
					})
					.end()
				// check rating change after clicking on a star
				.then(function () {
					return clickOnStar(remote, id, 3, true);
				})
				.then(function () {
					return checkRating(remote, id, 7, 2.5, false);
				})
				// Check message
				.elementById(id + "value")
					.text()
					.then(function (text) {
						assert.equal(text, "Rating is 2.5 stars", "message is not the one expected for " + id);
					})
					.end()
				// set zero rating
				.then(function () {
					return clickOnZeroSettingArea(remote, id);
				})
				.then(function () {
					return checkRating(remote, id, 7, 0, false);
				})
				// Check message
				.elementById(id + "value")
					.text()
					.then(function (text) {
						assert.equal(text, "Rating is 0 star", "message is not the one expected for " + id);
					})
					.end();
		},
		"default": function () {
			this.timeout = TEST_TIMEOUT_MS;
			console.log("# running test 'default'");
			var remote = this.remote;
			return remote
			.get(require.toUrl("./StarRating.html"))
			.waitForCondition("'ready' in window && ready", WAIT_TIMEOUT_MS)
			// Check initial rating
			.then(function () {
				return checkRating(remote, "defaultstar", 5, 0, false);
			});
		},
		"tab order": function () {
			this.timeout = TEST_TIMEOUT_MS;
			var remote = this.remote;
			if (/safari|iPhone|selendroid/.test(remote.environmentType.browserName) || remote.environmentType.safari) {
				// SafariDriver doesn't support tabbing, see https://code.google.com/p/selenium/issues/detail?id=5403
				// Same problem with selendroid and iOS, apparently
				console.log("Skipping test '" + this.parent.name + ": " + this.name + "' on this platform");
				return;
			}
			console.log("# running test 'tab order'");
			return remote
			.get(require.toUrl("./StarRating.html"))
			.waitForCondition("'ready' in window && ready", WAIT_TIMEOUT_MS)
			// Check active element
			.execute("return document.activeElement.id")
			.then(function (value) {
				assert.equal(value, "afinput");
			})
			.keys("\uE004") // Press TAB
			.execute("return document.activeElement.parentNode.id")
			.then(function (value) {
				assert.equal(value, "firsttabindexstar");
			})
			.keys("\uE004") // Press TAB
			.execute("return document.activeElement.parentNode.id")
			.then(function (value) {
				assert.equal(value, "secondtabindexstar");
			})
			.keys("\uE004") // Press TAB
			.execute("return document.activeElement.parentNode.id")
			.then(function (value) {
				assert.equal(value, "star");
			})
			.keys("\uE004") // Press TAB
			.execute("return document.activeElement.id")
			.then(function (value) {
				assert.equal(value, "starminus");
			})
			.keys("\uE004") // Press TAB
			.execute("return document.activeElement.id")
			.then(function (value) {
				assert.equal(value, "starplus");
			})
			.keys("\uE004") // Press TAB
			.execute("return document.activeElement.parentNode.id")
			.then(function (value) {
				assert.equal(value, "editablestar1");
			})
			.keys("\uE004") // Press TAB
			.execute("return document.activeElement.parentNode.id")
			.then(function (value) {
				assert.equal(value, "editablestar2");
			})
			.keys("\uE004") // Press TAB
			.execute("return document.activeElement.parentNode.id")
			.then(function (value) {
				assert.equal(value, "editablestar5");
			})
			.keys("\uE004") // Press TAB
			.execute("return document.activeElement.parentNode.id")
			.then(function (value) {
				assert.equal(value, "editablestar6");
			})
			.keys("\uE004") // Press TAB
			.execute("return document.activeElement.parentNode.id")
			.then(function (value) {
				assert.equal(value, "defaultstar");
			});
		},
		"disabled": function () {
			this.timeout = TEST_TIMEOUT_MS;
			console.log("# running test 'disabled'");
			var remote = this.remote;
			return remote
			.get(require.toUrl("./StarRating-form.html"))
			.waitForCondition("'ready' in window && ready", WAIT_TIMEOUT_MS)
			// Check initial rating
			.then(function () {
				return checkRating(remote, "starrating3", 7, 3, true);
			});
		},
		"form back button": function () {
			this.timeout = TEST_TIMEOUT_MS;
			var remote = this.remote;
			console.log("# running test 'form back button'");
			return remote
			.get(require.toUrl("./StarRating-formback.html"))
			.waitForCondition("'ready' in window && ready", WAIT_TIMEOUT_MS)
			.then(function () {
				return clickOnStar(remote, "starratingA", 7, false);
			})
			.elementById("submitButton")
			.click()
			.end()
			.waitForElementById("parameters", WAIT_TIMEOUT_MS)
			.end()
			.then(function () {
				// Safari driver does not support the back method
				// see https://code.google.com/p/selenium/issues/detail?id=3771
				if (/safari|iPhone|selendroid/.test(remote.environmentType.browserName)) {
					console.log("Skipping 'back' on safari driver (not supported)");
					return checkSubmitedParameters(remote, ["star1", "star2"], ["7", "2"]);
				} else {
					return checkSubmitedParameters(remote, ["star1", "star2"], ["7", "2"])
						.back()
						.waitForCondition("'ready' in window && ready", WAIT_TIMEOUT_MS)
						.then(function () {
							return checkRating(remote, "starratingA", 7, 7, false);
						})
						.elementById("submitButton")
						.click()
						.end()
						.waitForElementById("parameters", WAIT_TIMEOUT_MS)
						.end()
						.then(function () {
							return checkSubmitedParameters(remote, ["star1", "star2"], ["7", "2"]);
						})
						.back()
						.waitForCondition("'ready' in window && ready", WAIT_TIMEOUT_MS)
						.then(function () {
							return checkRating(remote, "starratingA", 7, 7, false);
						});
				}
			})
		},
		"form values": function () {
			this.timeout = TEST_TIMEOUT_MS;
			var remote = this.remote;
			console.log("# running test 'form values'");
			return remote
			.get(require.toUrl("./StarRating-form.html"))
			.waitForCondition("'ready' in window && ready", WAIT_TIMEOUT_MS)
			.then(function () {
				return clickOnStar(remote, "starrating1", 2, false);
			})
			.elementById("submitButton")
			.click()
			.end()
			.waitForElementById("parameters", WAIT_TIMEOUT_MS)
			.end()
			.then(function () {
				return checkSubmitedParameters(remote, ["star1", "star2", "star4", "star5"], ["2", "2", "4", "5"]);
			});
		}
	});
});