/*
 jQWidgets v3.2.2_1 (2014-Mar-21)
 Copyright (c) 2011-2014 jQWidgets.
 License: http://jqwidgets.com/license/
 */

(function (a) {
	a.jqx.jqxWidget("jqxTreePanel", "", {});
	a.extend(a.jqx._jqxTreePanel.prototype, {
		defineInstance: function () {
			this.width = null;
			this.height = null;
			this.disabled = false;
			this.scrollBarSize = a.jqx.utilities.scrollBarSize;
			this.sizeMode = "fixed";
			this.autoUpdate = false;
			this.autoUpdateInterval = 500;
			this.touchMode = "auto";
			this.horizontalScrollBarMax = null;
			this.verticalScrollBarMax = null;
			this.touchModeStyle = "auto";
			this.rtl = false;
			this.events = ["layout"]
		}, createInstance: function (b) {
			this.render()
		}, render: function () {
			var b = this;
			if (a.jqx.utilities.scrollBarSize != 15) {
				this.scrollBarSize = a.jqx.utilities.scrollBarSize
			}
			this.host.addClass(this.toThemeProperty("jqx-panel"));
			this.host.addClass(this.toThemeProperty("jqx-widget"));
			this.host.addClass(this.toThemeProperty("jqx-widget-content"));
			this.host.addClass(this.toThemeProperty("jqx-rc-all"));
			var c = a("<div id='panelWrapper' style='overflow: hidden; width: 100%; height: 100%; background-color: transparent; -webkit-appearance: none; outline: none; align:left; border: 0px; padding: 0px; margin: 0px; left: 0px; top: 0px; valign:top; position: relative;'><div id='panelContent' style='-webkit-appearance: none; -moz-box-sizing: border-box; box-sizing: border-box; width: 100%; height: 100%; outline: none; border: none; padding: 0px; position: absolute; margin: 0px; align:left; valign:top; left: 0px; top: 0px;'/><div id='verticalScrollBar' style='align:left; valign:top; left: 0px; top: 0px; position: absolute;'/><div id='horizontalScrollBar' style='align:left; valign:top; left: 0px; top: 0px; position: absolute;'/><div id='bottomRight' style='align:left; valign:top; left: 0px; top: 0px; position: absolute;'/></div>");
			if (!this.host.jqxButton) {
				throw new Error("jqxTreePanel: Missing reference to jqxbuttons.js.")
			}
			if (!this.host.jqxScrollBar) {
				throw new Error("jqxTreePanel: Missing reference to jqxscrollbar.js.")
			}
			var d = this.host.children();
			this._rtl = false;
			if (d.length > 0 && d.css("direction") == "rtl") {
				this.rtl = true;
				this._rtl = true
			}
			this.host.wrapInner(c);
			var g = this.host.find("#verticalScrollBar");
			g[0].id = this.element.id + "verticalScrollBar";
			this.vScrollBar = g.jqxScrollBar({
				vertical: true,
				rtl: this.rtl,
				touchMode: this.touchMode,
				theme: this.theme
			});
			var f = this.host.find("#horizontalScrollBar");
			f[0].id = this.element.id + "horizontalScrollBar";
			this.hScrollBar = f.jqxScrollBar({
				vertical: false,
				rtl: this.rtl,
				touchMode: this.touchMode,
				theme: this.theme
			});
			this.content = this.host.find("#panelContent");
			this.wrapper = this.host.find("#panelWrapper");
			this.content.addClass(this.toThemeProperty("jqx-widget-content"));
			this.wrapper[0].id = this.wrapper[0].id + this.element.id;
			this.content[0].id = this.content[0].id + this.element.id;
			this.bottomRight = this.host.find("#bottomRight").addClass(this.toThemeProperty("jqx-panel-bottomright")).addClass(this.toThemeProperty("jqx-scrollbar-state-normal"));
			this.bottomRight[0].id = "bottomRight" + this.element.id;
			this.vScrollBar.css("visibility", "inherit");
			this.hScrollBar.css("visibility", "hidden");
			this.vScrollInstance = a.data(this.vScrollBar[0], "jqxScrollBar").instance;
			this.hScrollInstance = a.data(this.hScrollBar[0], "jqxScrollBar").instance;
			var e = this;
			this.propertyChangeMap.disabled = function (h, j, i, k) {
				e.vScrollBar.jqxScrollBar({disabled: e.disabled});
				e.hScrollBar.jqxScrollBar({disabled: e.disabled})
			};
			this.vScrollBar.jqxScrollBar({disabled: this.disabled});
			this.hScrollBar.jqxScrollBar({disabled: this.disabled});
			this._addHandlers();
			if (this.width == null) {
				this.width = this.content.width()
			}
			if (this.height == null) {
				this.height = this.content.height()
			}
			this._arrange();
			this.contentWidth = e.content[0].scrollWidth;
			this.contentHeight = e.content[0].scrollHeight;
			if (this.autoUpdate) {
				e._autoUpdate()
			}
			this.propertyChangeMap.autoUpdate = function (h, j, i, k) {
				if (e.autoUpdate) {
					e._autoUpdate()
				} else {
					clearInterval(e.autoUpdateId);
					e.autoUpdateId = null
				}
			};
			this.addHandler(a(window), "unload", function () {
				if (e.autoUpdateId != null) {
					clearInterval(e.autoUpdateId);
					e.autoUpdateId = null;
					e.destroy()
				}
			});
			this._updateTouchScrolling();
			this._render()
		}, hiddenParent: function () {
			return a.jqx.isHidden(this.host)
		}, _updateTouchScrolling: function () {
			var b = this;
			if (this.touchMode == true) {
				a.jqx.mobile.setMobileSimulator(this.element)
			}
			var c = this.isTouchDevice();
			if (c) {
				a.jqx.mobile.touchScroll(this.element, b.vScrollInstance.max, function (f, e) {
					if (b.vScrollBar.css("visibility") != "hidden") {
						var d = b.vScrollInstance.value;
						b.vScrollInstance.setPosition(d + e)
					}
					if (b.hScrollBar.css("visibility") != "hidden") {
						var d = b.hScrollInstance.value;
						b.hScrollInstance.setPosition(d + f)
					}
				}, this.element.id, this.hScrollBar, this.vScrollBar);
				this._arrange()
			}
			this.vScrollBar.jqxScrollBar({touchMode: this.touchMode});
			this.hScrollBar.jqxScrollBar({touchMode: this.touchMode})
		}, isTouchDevice: function () {
			var b = a.jqx.mobile.isTouchDevice();
			if (this.touchMode == true) {
				b = true
			} else {
				if (this.touchMode == false) {
					b = false
				}
			}
			if (b && this.touchModeStyle != false) {
				this.scrollBarSize = a.jqx.utilities.touchScrollBarSize
			}
			return b
		}, append: function (b) {
			if (b != null) {
				this.content.append(b);
				this._arrange()
			}
		}, setcontent: function (b) {
			this.content[0].innerHTML = b;
			this._arrange();
			var c = this;
			setTimeout(function () {
				c._arrange()
			}, 100)
		}, prepend: function (b) {
			if (b != null) {
				this.content.prepend(b);
				this._arrange()
			}
		}, clearcontent: function () {
			this.content.text("");
			this.content.children().remove();
			this._arrange()
		}, remove: function (b) {
			if (b != null) {
				a(b).remove();
				this._arrange()
			}
		}, _autoUpdate: function () {
			var b = this;
			this.autoUpdateId = setInterval(function () {
				var d = b.content[0].scrollWidth;
				var c = b.content[0].scrollHeight;
				var e = false;
				if (b.contentWidth != d) {
					b.contentWidth = d;
					e = true
				}
				if (b.contentHeight != c) {
					b.contentHeight = c;
					e = true
				}
				if (e) {
					b._arrange()
				}
			}, this.autoUpdateInterval)
		}, _addHandlers: function () {
			var b = this;
			this.addHandler(this.vScrollBar, "valuechanged", function (c) {
				b._render(b)
			});
			this.addHandler(this.hScrollBar, "valuechanged", function (c) {
				b._render(b)
			});
			this.addHandler(this.host, "mousewheel", function (c) {
				b.wheel(c, b)
			});
			this.addHandler(this.wrapper, "scroll", function (c) {
				if (b.wrapper[0].scrollTop != 0) {
					b.wrapper[0].scrollTop = 0
				}
				if (b.wrapper[0].scrollLeft != 0) {
					b.wrapper[0].scrollLeft = 0
				}
			});
			this.addHandler(this.host, "mouseleave", function (c) {
				b.focused = false
			});
			this.addHandler(this.host, "focus", function (c) {
				b.focused = true
			});
			this.addHandler(this.host, "blur", function (c) {
				b.focused = false
			});
			this.addHandler(this.host, "mouseenter", function (c) {
				b.focused = true
			});
			a.jqx.utilities.resize(this.host, function () {
				if (a.jqx.isHidden(b.host)) {
					return
				}
				b._arrange(false)
			})
		}, resize: function (c, b) {
			this.width = c;
			this.height = b;
			this._arrange(false)
		}, _removeHandlers: function () {
			var b = this;
			this.removeHandler(this.vScrollBar, "valuechanged");
			this.removeHandler(this.hScrollBar, "valuechanged");
			this.removeHandler(this.host, "mousewheel");
			this.removeHandler(this.host, "mouseleave");
			this.removeHandler(this.host, "focus");
			this.removeHandler(this.host, "blur");
			this.removeHandler(this.host, "mouseenter");
			this.removeHandler(this.wrapper, "scroll");
			this.removeHandler(a(window), "resize." + this.element.id)
		}, wheel: function (d, c) {
			var e = 0;
			if (d.originalEvent && a.jqx.browser.msie && d.originalEvent.wheelDelta) {
				e = d.originalEvent.wheelDelta / 120
			}
			if (!d) {
				d = window.event
			}
			if (d.wheelDelta) {
				e = d.wheelDelta / 120
			} else {
				if (d.detail) {
					e = -d.detail / 3
				}
			}
			if (e) {
				var b = c._handleDelta(e);
				if (!b) {
					if (d.preventDefault) {
						d.preventDefault()
					}
				}
				if (!b) {
					return b
				} else {
					return false
				}
			}
			if (d.preventDefault) {
				d.preventDefault()
			}
			d.returnValue = false
		}, scrollDown: function () {
			if (this.vScrollBar.css("visibility") == "hidden") {
				return false
			}
			var b = this.vScrollInstance;
			if (b.value + b.largestep <= b.max) {
				b.setPosition(b.value + b.largestep);
				return true
			} else {
				if (b.value + b.largestep != b.max) {
					b.setPosition(b.max);
					return true
				}
			}
			return false
		}, scrollUp: function () {
			if (this.vScrollBar.css("visibility") == "hidden") {
				return false
			}
			var b = this.vScrollInstance;
			if (b.value - b.largestep >= b.min) {
				b.setPosition(b.value - b.largestep);
				return true
			} else {
				if (b.value - b.largestep != b.min) {
					b.setPosition(b.min);
					return true
				}
			}
			return false
		}, _handleDelta: function (d) {
			if (this.focused) {
				var c = this.vScrollInstance.value;
				if (d < 0) {
					this.scrollDown()
				} else {
					this.scrollUp()
				}
				var b = this.vScrollInstance.value;
				if (c != b) {
					return false
				}
			}
			return true
		}, _render: function (c) {
			if (c == undefined) {
				c = this
			}
			var b = c.vScrollInstance.value;
			var d = c.hScrollInstance.value;
			if (this.rtl) {
				if (this.hScrollBar[0].style.visibility != "hidden") {
					if (this._rtl == false) {
						d = c.hScrollInstance.max - d
					} else {
						d = -c.hScrollInstance.value
					}
				}
			}
			c.content.css({left: -d + "px", top: -b + "px"})
		}, scrollTo: function (c, b) {
			if (c == undefined || b == undefined) {
				return
			}
			this.vScrollInstance.setPosition(b);
			this.hScrollInstance.setPosition(c)
		}, getScrollHeight: function () {
			return this.vScrollInstance.max
		}, getVScrollPosition: function () {
			return this.vScrollInstance.value
		}, getScrollWidth: function () {
			return this.hScrollInstance.max
		}, getHScrollPosition: function () {
			return this.hScrollInstance.value
		}, _getScrollSize: function () {
			var b = this.scrollBarSize;
			if (isNaN(b)) {
				b = parseInt(b);
				if (isNaN(b)) {
					b = "17px"
				} else {
					b = b + "px"
				}
			}
			if (this.isTouchDevice()) {
				b = a.jqx.utilities.touchScrollBarSize
			}
			b = parseInt(b);
			return b
		}, _getScrollArea: function () {
			var c = 0;
			this.content.css("margin-right", "0px");
			this.content.css("max-width", "9999999px");
			if (a.jqx.browser.msie && a.jqx.browser.version < 10) {
				c = parseInt(this.content.css("left"));
				this.content.css("left", 0)
			}
			this.content.css("overflow", "auto");
			if (this.rtl) {
				this.content.css("direction", "rtl")
			}
			var b = parseInt(this.content[0].scrollWidth);
			a.each(this.content.children(), function () {
				b = Math.max(b, this.scrollWidth);
				b = Math.max(b, a(this).outerWidth())
			});
			if (a.jqx.browser.msie && a.jqx.browser.version < 10) {
				this.content.css("left", c)
			}
			var d = parseInt(this.content[0].scrollHeight);
			this.content.css("overflow", "visible");
			if (a.jqx.browser.msie && a.jqx.browser.version < 9) {
				var d = parseInt(this.content[0].scrollHeight);
				switch (this.sizeMode) {
					case"wrap":
						var d = parseInt(this.content[0].scrollHeight);
						var b = parseInt(this.content[0].scrollWidth);
						break;
					case"horizontalWrap":
					case"horizontalwrap":
						break;
					case"verticalWrap":
					case"verticalwrap":
						var d = parseInt(this.content[0].scrollHeight);
						break
				}
			}
			if (this.rtl) {
				this.content.css("direction", "ltr")
			}
			return {width: b, height: d}
		}, _arrange: function (h) {
			if (h !== false) {
				if (this.width != null) {
					this.host.width(this.width)
				}
				if (this.height != null) {
					this.host.height(this.height)
				}
			}
			var b = this._getScrollSize();
			var d = this.host.width();
			var l = this.host.height();
			var e = this._getScrollArea();
			var c = e.width;
			var k = e.height;
			var i = k - parseInt(Math.round(this.host.height()));
			var g = c - parseInt(Math.round(this.host.width()));
			if (this.horizontalScrollBarMax != undefined) {
				g = this.horizontalScrollBarMax
			}
			if (this.verticalScrollBarMax != undefined) {
				i = this.verticalScrollBarMax
			}
			var j = function (o, p) {
				var n = 5;
				if (p > n) {
					o.vScrollBar.jqxScrollBar({max: p});
					o.vScrollBar.css("visibility", "inherit")
				} else {
					o.vScrollBar.jqxScrollBar("setPosition", 0);
					o.vScrollBar.css("visibility", "hidden")
				}
			};
			var m = function (o, n) {
				if (n > 0) {
					if (a.jqx.browser.msie && a.jqx.browser.version < 8) {
						if (n - 10 <= b) {
							o.hScrollBar.css("visibility", "hidden");
							o.hScrollBar.jqxScrollBar("setPosition", 0)
						} else {
							o.hScrollBar.jqxScrollBar({max: n + 4});
							o.hScrollBar.css("visibility", "inherit")
						}
					} else {
						o.hScrollBar.jqxScrollBar({max: n + 4});
						o.hScrollBar.css("visibility", "inherit")
					}
				} else {
					o.hScrollBar.css("visibility", "hidden");
					o.hScrollBar.jqxScrollBar("setPosition", 0)
				}
			};
			switch (this.sizeMode) {
				case"wrap":
					this.host.width(c);
					this.host.height(k);
					this.vScrollBar.css("visibility", "hidden");
					this.hScrollBar.css("visibility", "hidden");
					return;
				case"horizontalWrap":
				case"horizontalwrap":
					this.host.width(c);
					this.hScrollBar.css("visibility", "hidden");
					j(this, i);
					this._arrangeScrollbars(b, c, l);
					return;
				case"verticalWrap":
				case"verticalwrap":
					this.host.height(k);
					this.vScrollBar.css("visibility", "hidden");
					m(this, g);
					this._arrangeScrollbars(b, d, l);
					return
			}
			j(this, i);
			var f = 2;
			if (this.vScrollBar.css("visibility") != "hidden") {
				if (this.horizontalScrollBarMax == undefined) {
					if ((!this.isTouchDevice() && g > 0) || (g > 0)) {
						g += b + f
					}
				}
			}
			m(this, g);
			if (this.hScrollBar.css("visibility") != "hidden") {
				this.vScrollBar.jqxScrollBar({max: i + b + f})
			}
			this._arrangeScrollbars(b, d, l)
		}, _arrangeScrollbars: function (b, d, j) {
			var i = this.vScrollBar[0].style.visibility != "hidden";
			var f = this.hScrollBar[0].style.visibility != "hidden";
			var h = 2;
			var g = 2;
			this.hScrollBar.height(b);
			this.hScrollBar.css({top: j - b - h - g + "px", left: "0px"});
			this.hScrollBar.width(d - h + "px");
			this.vScrollBar.width(b);
			this.vScrollBar.height(parseInt(j) - h +17 + "px");
			this.vScrollBar.css({left: parseInt(d) - parseInt(b) - h - g + "px", top: "0px"});
			if (this.rtl) {
				this.vScrollBar.css({left: "0px"});
				var c = i ? parseInt(b) + "px" : 0;
				if (this.content.children().css("direction") != "rtl") {
					var e = false;
					if (a.jqx.browser.msie && a.jqx.browser.version < 8) {
						e = true
					}
					if (!e) {
						this.content.css("padding-left", c)
					}
				}
			} else {
				if (this.vScrollBar.css("visibility") != "hidden") {
					this.content.css("max-width", this.host.width() - this.vScrollBar.outerWidth())
				}
			}
			if ((this.vScrollBar.css("visibility") != "hidden") && (this.hScrollBar.css("visibility") != "hidden")) {
				this.bottomRight.css("visibility", "inherit");
				this.bottomRight.css({
					left: 1 + parseInt(this.vScrollBar.css("left")),
					top: 1 + parseInt(this.hScrollBar.css("top"))
				});
				this.bottomRight.css("display", "none");
				//this.bottomRight.width(parseInt(b) + 3);
				//this.bottomRight.height(parseInt(b) + 3);
				if (this.rtl) {
					this.bottomRight.css({left: "0px"});
					this.hScrollBar.css({left: b + g + "px"})
				}
				this.hScrollBar.width(d - (1 * b) - h - g + "px");
				this.vScrollBar.height(parseInt(j) - h - b - g+17 + "px")
			} else {
				this.bottomRight.css("visibility", "hidden")
			}
			//this.hScrollBar.css("display",'none');
			//this.hScrollInstance.refresh();
			this.vScrollInstance.refresh()
		}, destroy: function () {
			clearInterval(this.autoUpdateId);
			this.autoUpdateId = null;
			this.autoUpdate = false;
			a.jqx.utilities.resize(this.host, null, true);
			this._removeHandlers();
			this.removeHandler(a(window), "unload");
			this.vScrollBar.jqxScrollBar("destroy");
			this.hScrollBar.jqxScrollBar("destroy");
			this.host.remove()
		}, _raiseevent: function (g, d, f) {
			if (this.isInitialized != undefined && this.isInitialized == true) {
				var c = this.events[g];
				var e = new jQuery.Event(c);
				e.previousValue = d;
				e.currentValue = f;
				e.owner = this;
				var b = this.host.trigger(e);
				return b
			}
		}, beginUpdateLayout: function () {
			this.updating = true
		}, resumeUpdateLayout: function () {
			this.updating = false;
			this.vScrollInstance.value = 0;
			this.hScrollInstance.value = 0;
			this._arrange();
			this._render()
		}, propertyChangedHandler: function (c, d, b, e) {
			if (!c.isInitialized) {
				return
			}
			if (d == "rtl") {
				this.vScrollBar.jqxScrollBar({rtl: e});
				this.hScrollBar.jqxScrollBar({rtl: e});
				c._arrange()
			}
			if (!c.updating) {
				if (d == "scrollBarSize" || d == "width" || d == "height") {
					if (b != e) {
						c._arrange()
					}
				}
			}
			if (d == "touchMode") {
				if (e != "auto") {
					c._updateTouchScrolling()
				}
			}
			if (d == "theme") {
				c.host.removeClass();
				c.host.addClass(this.toThemeProperty("jqx-panel"));
				c.host.addClass(this.toThemeProperty("jqx-widget"));
				c.host.addClass(this.toThemeProperty("jqx-widget-content"));
				c.host.addClass(this.toThemeProperty("jqx-rc-all"));
				c.vScrollBar.jqxScrollBar({theme: this.theme});
				c.hScrollBar.jqxScrollBar({theme: this.theme});
				c.bottomRight.removeClass();
				c.bottomRight.addClass(this.toThemeProperty("jqx-panel-bottomright"));
				c.bottomRight.addClass(this.toThemeProperty("jqx-scrollbar-state-normal"));
				c.content.removeClass();
				c.content.addClass(this.toThemeProperty("jqx-widget-content"))
			}
		}, invalidate: function () {
			if (a.jqx.isHidden(this.host)) {
				return
			}
			this.refresh()
		}, refresh: function (b) {
			this._arrange()
		}
	})
})(jQuery);