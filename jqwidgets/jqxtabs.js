/*
 jQWidgets v3.2.2 (2014-Mar-21)
 Copyright (c) 2011-2014 jQWidgets.
 License: http://jqwidgets.com/license/
 */

(function (a) {
    a.jqx.jqxWidget("jqxTabs", "", {});
    a.extend(a.jqx._jqxTabs.prototype, {defineInstance: function () {
        this.scrollAnimationDuration = 200;
        this.enabledHover = true;
        this.disabled = false;
        this.collapsible = false;
        this.animationType = "none";
        this.enableScrollAnimation = true;
        this.contentTransitionDuration = 450;
        this.toggleMode = "click";
        this.selectedItem = 0;
        this.height = "auto";
        this.width = "auto";
        this.position = "top";
        this.selectionTracker = false;
        this.scrollable = true;
        this.scrollPosition = "right";
        this.scrollStep = 70;
        this.autoHeight = true;
        this.headerHeight = null;
        this.showCloseButtons = false;
        this.canCloseAllTabs = true;
        this.closeButtonSize = 16;
        this.arrowButtonSize = 16;
        this.keyboardNavigation = true;
        this.reorder = false;
        this.selectionTrackerAnimationDuration = 300;
        this._isTouchDevice = false;
        this.roundedCorners = true;
        this._headerExpandingBalance = 0;
        this._dragStarted = false;
        this._tabCaptured = false;
        this._lastUnorderedListPosition = 0;
        this._selectedItem = 0;
        this._titleList = [];
        this._contentList = [];
        this._contentWrapper = null;
        this._unorderedList = null;
        this._scrollTimeout = null;
        this.isCollapsed = false;
        this.touchMode = false;
        this.initTabContent = null;
        this.enableDropAnimation = false;
        this._currentEvent = null;
        this._needScroll = true;
        this._isAnimated = {};
        this._events = ["created", "selected", "add", "removed", "enabled", "disabled", "selecting", "unselecting", "unselected", "dragStart", "dragEnd", "locked", "unlocked", "collapsed", "expanded", "tabclick", "beforeremove"];
        this._initTabContentList = [];
        this._invalidArgumentExceptions = {invalidScrollAnimationDuration: "The scroll animation duration is not valid!", invalidWidth: "Width you've entered is invalid!", invalidHeight: "Height you've entered is invalid!", invalidAnimationType: "You've entered invalid animation type!", invalidcontentTransitionDuration: "You've entered invalid value for contentTransitionDuration!", invalidToggleMode: "You've entered invalid value for toggleMode!", invalidPosition: "You've entered invalid position!", invalidScrollPosition: "You've entered invalid scroll position!", invalidScrollStep: "You've entered invalid scroll step!", invalidStructure: "Invalid structure!", invalidArrowSize: "Invalid scroll button size!", invalidCloseSize: "Invalid close button size!"};
        this.aria = {"aria-disabled": {name: "disabled", type: "boolean"}};
        this.rtl = false
    }, createInstance: function () {
        a.jqx.aria(this);
        this.host.addClass(this.toThemeProperty("jqx-tabs"));
        this.host.addClass(this.toThemeProperty("jqx-widget"));
        this.host.addClass(this.toThemeProperty("jqx-widget-content"));
        this.host.attr("role", "tablist");
        this._unorderedList = this.host.children("ul");
        this._titleList = this.host.children("ul").children("li");
        this._contentList = this.host.children("div");
        this._selectedItem = this.selectedItem;
        this._isTouchDevice = a.jqx.mobile.isTouchDevice();
        this._needScroll = this.scrollable;
        if (this.selectionTracker) {
            this.selectionTracker = this._seletionTrackerBrowserCheck()
        }
        if (this._isTouchDevice) {
            this.reorder = false;
            this.keyboardNavigation = false
        }
        var b = this.length();
        while (b) {
            b--;
            this._titleList[b] = a(this._titleList[b]);
            this._titleList[b].attr("role", "tab");
            this._contentList[b] = a(this._contentList[b]);
            this._contentList[b].attr("role", "tabpanel")
        }
        this._validateProperties();
        this._refresh();
        this._moveSelectionTrack(this._selectedItem, 0);
        if (this.disabled) {
            this.disable()
        }
        this.element.tabIndex = 0;
        this._raiseEvent(0);
        this._enableWindowResize()
    }, _hiddenParent: function () {
        var c = this;
        if (c.host.css("display") == "none") {
            return true
        }
        var b = false;
        a.each(c.host.parents(), function () {
            if (a(this).css("display") == "none") {
                b = true;
                return false
            }
        });
        return b
    }, _enableWindowResize: function () {
        var b = this;
        var c = a.jqx.isHidden(b.host);
        a.jqx.utilities.resize(this.host, function () {
            if (c) {
                b._uiRefresh(true);
                c = false
            } else {
                b.refresh()
            }
        })
    }, resize: function (c, b) {
        this.width = c;
        this.height = b;
        var d = a.jqx.isHidden(this.host);
        if (d) {
            this._uiRefresh(true);
            d = false
        } else {
            this.refresh()
        }
    }, refresh: function (b) {
        if (true != b || b == undefined) {
            this._performResize()
        }
    }, _seletionTrackerBrowserCheck: function () {
        var b = "Browser CodeName: " + navigator.appCodeName + "";
        b += "Browser Name: " + navigator.appName + "";
        b += "Browser Version: " + navigator.appVersion + "";
        b += "Platform: " + navigator.platform + "";
        b += "User-agent header: " + navigator.userAgent + "";
        if (b.indexOf("IEMobile") != -1) {
            return false
        }
        if (b.indexOf("Windows Phone OS") != -1) {
            return false
        }
        if (a.jqx.browser.msie && a.jqx.browser.version <= 7) {
            return false
        }
        return true
    }, render: function () {
        this._refresh()
    }, _uiRefresh: function (b) {
        this._unorderedListLeftBackup = this._unorderedList.css("left");
        if (b) {
            this._render()
        }
        this._addStyles();
        this._performLayout();
        this._prepareTabs();
        this._removeEventHandlers();
        this._addEventHandlers();
        if (this._unorderedListLeftBackup === "auto") {
            this._unorderedListLeftBackup = this._getArrowsDisplacement()
        }
        this._unorderedList.css("left", this._unorderedListLeftBackup);
        if (this.rtl) {
            if (this.scrollable && this._rightArrow && this._rightArrow.css("visibility") != "hidden") {
                var d = 2 * this.arrowButtonSize;
                var c = this.host.width() - parseInt(this._unorderedList.width() + d + +parseInt(this._unorderedList.css("margin-left")), 10);
                this._unorderedList.css("left", c + "px")
            }
        }
    }, _refresh: function () {
        if (a.jqx.isHidden(this.host)) {
            return
        }
        this._uiRefresh(true)
    }, _addStyles: function () {
        this._unorderedList.addClass(this.toThemeProperty("jqx-tabs-title-container"));
        this._unorderedList.css({outline: "none", "white-space": "nowrap", "margin-top": "0px", "margin-bottom": "0px", padding: "0px", background: "transparent", border: "none", "border-style": "none", "text-indent": "0px"});
        var b = this.length();
        while (b) {
            b--;
            this._titleList[b].removeClass();
            this._titleList[b].css("padding", "");
            this._titleList[b].addClass("jqx-reset");
            this._titleList[b].addClass("jqx-disableselect");
            this._titleList[b].addClass(this.toThemeProperty("jqx-tabs-title"));
            this._titleList[b].addClass(this.toThemeProperty("jqx-item"));
            if (this.position == "bottom") {
                this._titleList[b].addClass(this.toThemeProperty("jqx-tabs-title-bottom"))
            }
            if (this._titleList[b].disabled) {
                this._titleList[b].addClass(this.toThemeProperty("jqx-tabs-title-disable"));
                this._titleList[b].addClass(this.toThemeProperty("jqx-fill-state-disabled"))
            }
            this._titleList[b].removeClass(this.toThemeProperty("jqx-rc-b"));
            this._titleList[b].removeClass(this.toThemeProperty("jqx-rc-t"));
            this._contentList[b].removeClass(this.toThemeProperty("jqx-rc-b"));
            this._contentList[b].removeClass(this.toThemeProperty("jqx-rc-t"));
            switch (this.position) {
                case"top":
                    this._titleList[b].addClass(this.toThemeProperty("jqx-rc-t"));
                    this._contentList[b].addClass(this.toThemeProperty("jqx-rc-b"));
                    break;
                case"bottom":
                    this._titleList[b].addClass(this.toThemeProperty("jqx-rc-b"));
                    this._contentList[b].addClass(this.toThemeProperty("jqx-rc-t"));
                    break
            }
        }
        if (this.selectionTracker) {
            this._selectionTracker.removeClass(this.toThemeProperty("jqx-rc-b"));
            this._selectionTracker.removeClass(this.toThemeProperty("jqx-rc-t"));
            switch (this.position) {
                case"top":
                    this._selectionTracker.addClass(this.toThemeProperty("jqx-rc-t"));
                    break;
                case"bottom":
                    this._selectionTracker.addClass(this.toThemeProperty("jqx-rc-b"));
                    break
            }
        }
    }, _raiseEvent: function (d, g) {
        var f = new a.Event(this._events[d]);
        f.owner = this;
        f.args = g;
        if (d === 6 || d === 7) {
            f.cancel = false;
            this._currentEvent = f
        }
        var b = "";
        try {
            b = this.host.trigger(f);
            if (d == 1) {
                var e = this;
                if (this.selectionTracker || this.animationType != "none") {
                    setTimeout(function () {
                        if (!e._initTabContentList[e.selectedItem]) {
                            if (e.initTabContent) {
                                e.initTabContent(e.selectedItem);
                                e._initTabContentList[e.selectedItem] = true
                            }
                        }
                        var h = new a.Event("loadContent");
                        h.owner = this;
                        if (e._contentList.length > 0 && e._contentList[e.selectedItem]) {
                            e._contentList[e.selectedItem].find("div").trigger(h)
                        }
                    }, 50 + e.selectionTrackerAnimationDuration)
                } else {
                    var f = new a.Event("loadContent");
                    if (!e._initTabContentList[e.selectedItem]) {
                        if (e.initTabContent) {
                            e.initTabContent(e.selectedItem);
                            e._initTabContentList[e.selectedItem] = true
                        }
                    }
                    f.owner = this;
                    var f = new a.Event("resize");
                    this.host.trigger(f)
                }
            }
        } catch (c) {
        }
        return b
    }, _getArrowsDisplacement: function () {
        if (!this._needScroll) {
            return 0
        }
        var d;
        var c = this.arrowButtonSize;
        var b = this.arrowButtonSize;
        if (this.scrollPosition === "left") {
            d = c + b
        } else {
            if (this.scrollPosition === "both") {
                d = c
            } else {
                d = 0
            }
        }
        return d
    }, _scrollRight: function (e, h) {
        this._unorderedList.stop();
        this._unlockAnimation("unorderedList");
        var f = parseInt(this._unorderedList.width() + parseInt(this._unorderedList.css("margin-left")), 10), i = parseInt(this.host.width(), 10), g, j, b = parseInt(this._unorderedList.css("left"), 10), c = this._getArrowsDisplacement(), d = 0, k = undefined;
        if (this.scrollable) {
            g = parseInt(this._leftArrow.outerWidth(), 10);
            j = parseInt(this._rightArrow.outerWidth(), 10)
        } else {
            g = 0;
            j = 0
        }
        e = (this.enableScrollAnimation) ? e : 0;
        if (parseInt(this._headerWrapper.width(), 10) > parseInt(this._unorderedList.css("margin-left")) + parseInt(this._unorderedList.width(), 10)) {
            d = c
        } else {
            if (Math.abs(b) + this.scrollStep < Math.abs(i - f) + g + j + c) {
                d = b - this.scrollStep;
                k = b - this.scrollStep + parseInt(this._titleList[this._selectedItem].position().left)
            } else {
                d = i - f - (2 * this.arrowButtonSize - c);
                if (d < parseInt(this._unorderedList.css("left"), 10) - 4 && d > parseInt(this._unorderedList.css("left"), 10) + 4) {
                    k = i - f - g - j + parseInt(this._titleList[this._selectedItem].position().left)
                }
            }
        }
        this._performScrollAnimation(d, k, e)
    }, _scrollLeft: function (f, g) {
        this._unorderedList.stop();
        this._unlockAnimation("unorderedList");
        var b = parseInt(this._unorderedList.css("left")), c = this._getArrowsDisplacement(), e = 0, d = undefined;
        f = (this.enableScrollAnimation) ? f : 0;
        if (parseInt(this._headerWrapper.width()) >= parseInt(this._unorderedList.width())) {
            e = c
        } else {
            if (b + this.scrollStep < c) {
                e = b + this.scrollStep;
                d = b + this.scrollStep + parseInt(this._titleList[this._selectedItem].position().left)
            } else {
                e = c;
                if (e < parseInt(this._unorderedList.css("left")) - 4 && e > parseInt(this._unorderedList.css("left")) + 4) {
                    d = parseInt(this._titleList[this._selectedItem].position().left)
                }
            }
        }
        this._performScrollAnimation(e, d, f)
    }, _performScrollAnimation: function (e, d, c) {
        var b = this;
        if (d !== undefined) {
            this._moveSelectionTrack(this._selectedItem, 0, d)
        }
        this._lockAnimation("unorderedList");
        this._unorderedList.animate({left: e}, c, function () {
            b._moveSelectionTrack(b.selectedItem, 0);
            b._unlockAnimation("unorderedList")
        })
    }, _addKeyboardHandlers: function () {
        var b = this;
        if (this.keyboardNavigation) {
            this.addHandler(this.host, "keydown", function (e) {
                if (!b._activeAnimation()) {
                    var f = b._selectedItem;
                    var d = b.selectionTracker;
                    var c = b.getContentAt(f);
                    if (a(e.target).ischildof(c)) {
                        return true
                    }
                    switch (e.keyCode) {
                        case 37:
                            if (b.rtl) {
                                b.next()
                            } else {
                                b.previous()
                            }
                            return false;
                        case 39:
                            if (b.rtl) {
                                b.previous()
                            } else {
                                b.next()
                            }
                            return false;
                        case 36:
                            b.first();
                            return false;
                        case 35:
                            b.last();
                            return false;
                        case 27:
                            if (b._tabCaptured) {
                                b._cancelClick = true;
                                b._uncapture(null, b.selectedItem);
                                b._tabCaptured = false
                            }
                            break
                    }
                    b.selectionTracker = d
                }
                return true
            })
        }
    }, _addScrollHandlers: function () {
        var b = this;
        this.addHandler(this._leftArrow, "mousedown", function () {
            b._startScrollRepeat(true, b.scrollAnimationDuration)
        });
        this.addHandler(this._rightArrow, "mousedown", function () {
            b._startScrollRepeat(false, b.scrollAnimationDuration)
        });
        this.addHandler(this._rightArrow, "mouseleave", function () {
            clearTimeout(b._scrollTimeout)
        });
        this.addHandler(this._leftArrow, "mouseleave", function () {
            clearTimeout(b._scrollTimeout)
        });
        this.addHandler(a(document), "mouseup.tab" + this.element.id, this._mouseUpScrollDocumentHandler, this);
        this.addHandler(a(document), "mouseleave.tab" + this.element.id, this._mouseLeaveScrollDocumentHandler, this)
    }, _mouseLeaveScrollDocumentHandler: function (c) {
        var b = c.data;
        if (!b._scrollTimeout) {
            return
        }
        clearTimeout(b._scrollTimeout)
    }, _mouseUpScrollDocumentHandler: function (c) {
        var b = c.data;
        clearTimeout(b._scrollTimeout)
    }, _mouseUpDragDocumentHandler: function (c) {
        var b = c.data;
        if (b._tabCaptured && b._dragStarted) {
            b._uncapture(c)
        }
        b._tabCaptured = false
    }, _addReorderHandlers: function () {
        var b = this;
        this.addHandler(a(document), "mousemove.tab" + this.element.id, this._moveElement, this);
        this.addHandler(a(document), "mouseup.tab" + this.element.id, this._mouseUpDragDocumentHandler, this)
    }, _addEventHandlers: function () {
        var e = this.length();
        while (e) {
            e--;
            this._addEventListenerAt(e)
        }
        if (this.keyboardNavigation) {
            this._addKeyboardHandlers()
        }
        if (this.scrollable) {
            this._addScrollHandlers()
        }
        if (this.reorder && !this._isTouchDevice) {
            this._addReorderHandlers()
        }
        var d = this;
        try {
            if (document.referrer != "" || window.frameElement) {
                if (window.top != null && window.top != window.self) {
                    var c = function (g) {
                        if (d._tabCaptured) {
                            d._cancelClick = true;
                            d._uncapture(null, d.selectedItem);
                            d._tabCaptured = false
                        }
                    };
                    var f = null;
                    if (window.parent && document.referrer) {
                        f = document.referrer
                    }
                    if (f && f.indexOf(document.location.host) != -1) {
                        if (window.top.document) {
                            this.addHandler(a(window.top.document), "mouseup", c)
                        }
                    }
                }
            }
        } catch (b) {
        }
    }, focus: function () {
        try {
            this.host.focus()
        } catch (b) {
        }
    }, _getFocusedItem: function (f, e) {
        var i = this.length();
        while (i) {
            i--;
            var h = this._titleList[i], g = parseInt(h.outerWidth(true)), d = parseInt(h.offset().left), c = parseInt(this._unorderedList.offset().left), j = parseInt(this.host.offset().left), b = d;
            if ((b <= f && b + g >= f) && (h !== this._capturedElement) && (!this._titleList[i].locked) && (this._titleList[i].disabled !== true)) {
                return i
            }
        }
        return -1
    }, _uncapture: function (e) {
        var d = this.selectionTracker;
        this._unorderedListLeftBackup = this._unorderedList.css("left");
        this._dragStarted = false;
        this._tabCaptured = false;
        var b = this._indexOf(this._capturedElement);
        if (!this._capturedElement) {
            return
        }
        switch (this.position) {
            case"top":
                this._capturedElement.css("bottom", 0);
                break;
            case"bottom":
                this._capturedElement.css("top", 0);
                break
        }
        if (e) {
            var c = this._getFocusedItem(e.clientX, e.clientY)
        }
        if (c === -1 || !e) {
            this._capturedElement.css("left", 0)
        } else {
            this._raiseEvent(10, {item: b, dropIndex: c});
            this._reorderItems(c, b)
        }
        a.each(this._titleList, function () {
            this.css("position", "static")
        });
        this._reorderHeaderElements();
        this._unorderedList.css({position: "relative", top: "0px"});
        this._prepareTabs();
        if (c === -1 || !e) {
            this._selectedItem = b;
            this._moveSelectionTrack(b, 0);
            this._addSelectStyle(this._selectedItem, true)
        } else {
            this._moveSelectionTrack(this._selectedItem, 0);
            this._addSelectStyle(this._selectedItem, true)
        }
        if (document.selection) {
            document.selection.clear()
        }
        this._unorderedList.css("left", this._unorderedListLeftBackup);
        this.selectionTracker = d
    }, _reorderItems: function (c, b) {
        var d = this._titleList[this.selectedItem];
        var e = this._contentList[b];
        if (typeof this._capturedElement === "undefined") {
            this._capturedElement = this._titleList[b]
        }
        this._titleList[b].remove();
        if (b < c) {
            this._titleList[b].insertAfter(this._titleList[c])
        } else {
            this._titleList[b].insertBefore(this._titleList[c])
        }
        this._reorderElementArrays(c, b);
        this._getSelectedItem(d);
        this._removeEventHandlers();
        this._addEventHandlers()
    }, _reorderElementArrays: function (d, b) {
        var e = this._titleList[this.selectedItem];
        var f = this._contentList[b];
        if (b < d) {
            for (var c = b; c <= d; c++) {
                this._titleList[c] = this._titleList[c + 1];
                this._contentList[c] = this._contentList[c + 1]
            }
            this._contentList[d] = f;
            this._titleList[d] = this._capturedElement
        } else {
            for (var c = b; c >= d; c--) {
                this._titleList[c] = this._titleList[c - 1];
                this._contentList[c] = this._contentList[c - 1]
            }
            this._contentList[d] = f;
            this._titleList[d] = this._capturedElement
        }
    }, getSelectedItem: function () {
        return this.selectedItem
    }, _getSelectedItem: function (c) {
        var b = this.length();
        while (b) {
            b--;
            if (this._titleList[b] === c) {
                this._selectedItem = this.selectedItem = b;
                break
            }
        }
    }, _moveElement: function (c, b) {
        var b = c.data;
        if (b._tabCaptured) {
            if (document.selection) {
                document.selection.clear()
            }
            if (!b._dragStarted) {
                unorderedListLeft = -parseInt(b._unorderedList.css("left"), 10);
                if (c.clientX + unorderedListLeft > b._startX + 3 || c.clientX + unorderedListLeft < b._startX - 3) {
                    b._prepareTabForDragging();
                    b._dragStarted = true
                }
            } else {
                b._performDrag(c);
                clearTimeout(b._scrollTimeout)
            }
        }
    }, _performDrag: function (c) {
        var b = this.getZoomFactor();
        unorderedListLeft = -parseInt(this._unorderedList.css("left"), 10);
        this._capturedElement.css("left", unorderedListLeft + c.clientX / b - this._startX / b);
        this._lastX = c.clientX / b;
        this._moveSelectionTrack(this.selectedItem, 0)
    }, getZoomFactor: function () {
        var c = 1;
        if (document.body.getBoundingClientRect) {
            var d = document.body.getBoundingClientRect();
            var e = d.right - d.left;
            var b = document.body.offsetWidth;
            c = Math.round((e / b) * 100) / 100
        }
        return c
    }, _prepareTabForDragging: function () {
        this._capturedElement.css({position: "relative", left: "0px", top: "0px", "z-index": "300"});
        this.selectedItem = this._indexOf(this._capturedElement);
        switch (this.position) {
            case"top":
                this._capturedElement.css("bottom", parseInt(this._capturedElement.css("top")));
                break;
            case"bottom":
                this._capturedElement.css("top", parseInt(this._capturedElement.css("top")));
                break
        }
        this._raiseEvent(9, {item: this._indexOf(this._capturedElement)})
    }, _dragScroll: function (d) {
        var c = parseInt(this._unorderedList.css("left"));
        var b = this;
        var e = parseInt(this._capturedElement.css("left"));
        if (d.clientX <= this._headerWrapper.offset().left) {
            this._scrollLeft(this.scrollAnimationDuration);
            this._capturedElement.css("left", parseInt(this._capturedElement.css("left")) + this._lastUnorderedListPosition - c)
        } else {
            if (d.clientX > this._headerWrapper.offset().left + parseInt(this._headerWrapper.width(), 10)) {
                this._scrollRight(this.scrollAnimationDuration);
                this._capturedElement.css("left", parseInt(this._capturedElement.css("left")) + this._lastUnorderedListPosition - c)
            } else {
                this._unorderedList.stop();
                this._unlockAnimation("unorderedList");
                clearTimeout(this._scrollTimeout)
            }
        }
        var b = this;
        this._scrollTimeout = setTimeout(function () {
            b._dragScroll(d)
        }, this.scrollAnimationDuration);
        this._lastUnorderedListPosition = c
    }, _captureElement: function (c, b) {
        if (!this._tabCaptured && !this._titleList[b].locked && this._titleList[b].disabled !== true && !this._activeAnimation()) {
            unorderedListLeft = -parseInt(this._unorderedList.css("left"), 10);
            this._startX = unorderedListLeft + c.clientX;
            this._startY = c.clientY;
            this._lastX = c.clientX;
            this._lastY = c.clientY;
            this._tabCaptured = true;
            this._capturedElement = this._titleList[b]
        }
    }, _titleInteractionTrigger: function (b) {
        if (this._headerExpandingBalance > 0) {
            this._removeOppositeBorder()
        }
        if (this._selectedItem !== b) {
            this.select(this._titleList[b], "toggle");
            this._titleList[b].collapsed = false;
            if (!this.collapsible) {
                if (this.height !== "auto") {
                    this._contentWrapper.css("visibility", "visible")
                } else {
                    this._contentWrapper.css("display", "block")
                }
            }
        } else {
            if (this.collapsible) {
                if (this.isCollapsed) {
                    this.expand()
                } else {
                    this.collapse()
                }
            }
        }
    }, collapse: function () {
        var c = this._selectedItem, b = this;
        this.isCollapsed = true;
        if (b.height !== "auto") {
            b._contentWrapper.css("visibility", "hidden")
        } else {
            b._contentWrapper.hide()
        }
        b._raiseEvent(13, {item: c});
        if (this.position == "top") {
            b._headerWrapper.addClass(this.toThemeProperty("jqx-tabs-header-collapsed"));
            b.host.addClass(this.toThemeProperty("jqx-tabs-collapsed"))
        } else {
            b._headerWrapper.addClass(this.toThemeProperty("jqx-tabs-header-collapsed-bottom"));
            b.host.addClass(this.toThemeProperty("jqx-tabs-collapsed-bottom"))
        }
    }, expand: function () {
        var c = this._selectedItem, b = this;
        this.isCollapsed = false;
        this._select(c, b.contentTransitionDuration, null, false, true);
        if (b.height !== "auto") {
            b._contentWrapper.css("visibility", "visible")
        } else {
            b._contentWrapper.show()
        }
        b._raiseEvent(14, {item: c});
        if (this.position == "top") {
            b._headerWrapper.removeClass(this.toThemeProperty("jqx-tabs-header-collapsed"));
            b.host.removeClass(this.toThemeProperty("jqx-tabs-collapsed"))
        } else {
            b._headerWrapper.removeClass(this.toThemeProperty("jqx-tabs-header-collapsed-bottom"));
            b.host.removeClass(this.toThemeProperty("jqx-tabs-collapsed-bottom"))
        }
    }, _addSelectHandler: function (c) {
        var b = this;
        this.addHandler(this._titleList[c], "selectstart", function (d) {
            return false
        });
        this.addHandler(this._titleList[c], this.toggleMode, function (d) {
            return function () {
                b._raiseEvent("15", {item: d});
                if (!b._tabCaptured && !b._cancelClick) {
                    b._titleInteractionTrigger(d)
                }
                return true
            }
        }(c))
    }, _addDragDropHandlers: function (c) {
        var b = this;
        this.addHandler(this._titleList[c], "mousedown", function (d) {
            b._captureElement(d, c);
            return false
        });
        this.addHandler(this._titleList[c], "mouseup", function (d) {
            if (b._tabCaptured && b._dragStarted) {
                b._cancelClick = true;
                b._uncapture(d, c)
            } else {
                b._cancelClick = false
            }
            b._tabCaptured = false;
            return false
        })
    }, _removeHoverStates: function () {
        var b = this;
        a.each(this._titleList, function () {
            this.removeClass(b.toThemeProperty("jqx-tabs-title-hover-top"));
            this.removeClass(b.toThemeProperty("jqx-tabs-title-hover-bottom"))
        })
    }, _addHoverHandlers: function (c) {
        var b = this;
        var d = this._titleList[c];
        this.addHandler(d, "mouseenter", function (f) {
            if (c != b._selectedItem) {
                if (b.position == "top") {
                    d.addClass(b.toThemeProperty("jqx-tabs-title-hover-top"))
                } else {
                    d.addClass(b.toThemeProperty("jqx-tabs-title-hover-bottom"))
                }
                d.addClass(b.toThemeProperty("jqx-fill-state-hover"));
                if (b.showCloseButtons) {
                    var e = d.children(0).children(b.toThemeProperty(".jqx-tabs-close-button", true));
                    e.addClass(b.toThemeProperty("jqx-tabs-close-button-hover", true))
                }
            }
        });
        this.addHandler(d, "mouseleave", function (f) {
            if (c != b._selectedItem) {
                if (b.position == "top") {
                    d.removeClass(b.toThemeProperty("jqx-tabs-title-hover-top"))
                } else {
                    d.removeClass(b.toThemeProperty("jqx-tabs-title-hover-bottom"))
                }
                d.removeClass(b.toThemeProperty("jqx-fill-state-hover"));
                if (b.showCloseButtons) {
                    var e = d.children(0).children(b.toThemeProperty(".jqx-tabs-close-button", true));
                    e.removeClass(b.toThemeProperty("jqx-tabs-close-button-hover", true))
                }
            }
        })
    }, _addEventListenerAt: function (d) {
        var c = this;
        if (this._titleList[d].disabled) {
            return
        }
        if (this.reorder && !this._isTouchDevice) {
            this._addDragDropHandlers(d)
        }
        this._addSelectHandler(d);
        if (this.enabledHover) {
            this._addHoverHandlers(d)
        }
        var b = this._titleList[d].find(this.toThemeProperty(".jqx-tabs-close-button", true));
        this.removeHandler(b, "click");
        this.addHandler(b, "click", function (e) {
            c.removeAt(d);
            return false
        })
    }, _removeEventHandlers: function () {
        var b = this;
        var c = this.length();
        while (c) {
            c--;
            this._removeEventListenerAt(c)
        }
        if (this.scrollable) {
            this.removeHandler(this._leftArrow, "mousedown");
            this.removeHandler(this._rightArrow, "mousedown")
        }
        this.removeHandler(a(document), "mousemove.tab" + this.element.id, this._moveElement);
        this.removeHandler(a(document), "mouseup.tab" + this.element.id, this._mouseUpScrollDocumentHandler);
        this.removeHandler(a(document), "mouseup.tab" + this.element.id, this._mouseUpDragDocumentHandler);
        this.removeHandler(this.host, "keydown")
    }, _removeEventListenerAt: function (d) {
        var c = this;
        this.removeHandler(this._titleList[d], this.toggleMode);
        this.removeHandler(this._titleList[d], "mouseenter");
        this.removeHandler(this._titleList[d], "mouseleave");
        this.removeHandler(this._titleList[d], "mousedown");
        this.removeHandler(this._titleList[d], "mouseup");
        var b = this._titleList[d].children(0).children(this.toThemeProperty(".jqx-tabs-close-button", true));
        this.removeHandler(b, "click")
    }, _moveSelectionTrack: function (l, c, b) {
        var m = this;
        if (l == -1) {
            return
        }
        if (this._titleList.length == 0) {
            return
        }
        if (l >= this._titleList.length) {
            return
        }
        if (this.selectionTracker && this._selectionTracker) {
            this._selectionTracker.stop();
            this._unlockAnimation("selectionTracker");
            if (b === undefined) {
                var h = parseInt(this._titleList[l].position().left);
                if (!isNaN(parseInt(this._unorderedList.css("left")))) {
                    h += parseInt(this._unorderedList.css("left"))
                }
                if (!isNaN(parseInt(this._unorderedList.css("margin-left")))) {
                    h += parseInt(this._unorderedList.css("margin-left"))
                }
                if (!isNaN(parseInt(this._titleList[l].css("margin-left")))) {
                    h += parseInt(this._titleList[l].css("margin-left"))
                }
                if (!isNaN(parseInt(this._titleList[l].css("margin-right")))) {
                }
            } else {
                var h = b
            }
            var g = 0;
            var e = 0;
            if (this.position === "top") {
                g = parseInt(this._headerWrapper.height()) - parseInt(this._titleList[l].outerHeight());
                if (!this.autoHeight) {
                    e += parseInt(this._titleList[l].css("margin-top"))
                }
            }
            this._lockAnimation("selectionTracker");
            var k = parseInt(this._titleList[l].css("padding-left")) + parseInt(this._titleList[l].css("padding-right"));
            var f = this.position == "top" ? 0 : 1;
            var j = parseInt(this._headerWrapper.css("padding-top"));
            var i = parseInt(this._titleList[l].css("padding-top")) + parseInt(this._titleList[l].css("padding-bottom"));
            this._selectionTracker.css("visibility", "visible");
            this._moveSelectionTrackerContainer.css("visibility", "visible");
            var d = parseInt(this._titleList[l].css("margin-top"));
            if (isNaN(d)) {
                d = 0
            }
            this._selectionTracker.animate({top: j + d - f, left: h + "px", height: parseInt(this._titleList[l].height() + i), width: this._titleList[l].width() + k}, c, function () {
                m._unlockAnimation("selectionTracker");
                m._selectionTracker.css("visibility", "hidden");
                m._addSelectStyle(l, true);
                m._moveSelectionTrackerContainer.css("visibility", "hidden")
            })
        }
    }, destroy: function () {
        a.jqx.utilities.resize(this.host, null, true);
        this.host.remove()
    }, _switchTabs: function (b, d) {
        if (b !== d && !this._activeAnimation() && !this._tabCaptured) {
            var c = this;
            this._raiseEvent(7, {item: d});
            this._raiseEvent(6, {item: b});
            if (this._currentEvent) {
                if (this._currentEvent.cancel) {
                    this._currentEvent = null;
                    return
                }
            }
            this._unselect(d, null, true);
            this._select(b, c.contentTransitionDuration, null, true);
            return true
        }
        return false
    }, _activeAnimation: function () {
        for (child in this._isAnimated) {
            if (this._isAnimated.hasOwnProperty(child)) {
                if (this._isAnimated[child]) {
                    return true
                }
            }
        }
        return false
    }, _indexOf: function (c) {
        var b = this.length();
        while (b) {
            b--;
            if (this._titleList[b][0] === c[0] || this._contentList[b][0] === c[0]) {
                return b
            }
        }
        return -1
    }, _validateProperties: function () {
        try {
            if (this.scrollAnimationDuration < 0 || isNaN(this.scrollAnimationDuration)) {
                throw new Error(this._invalidArgumentExceptions.invalidScrollAnimationDuration)
            }
            if (parseInt(this.width) < 0 && this.width !== "auto") {
                throw new Error(this._invalidArgumentExceptions.invalidWidth)
            }
            if (parseInt(this.height) < 0 && this.height !== "auto") {
                throw new Error(this._invalidArgumentExceptions.invalidHeight)
            }
            if (this.animationType !== "none" && this.animationType !== "fade") {
                throw new Error(this._invalidArgumentExceptions.invalidAnimationType)
            }
            if (this.contentTransitionDuration < 0 || isNaN(this.contentTransitionDuration)) {
                throw new Error(this._invalidArgumentExceptions.invalidcontentTransitionDuration)
            }
            if (this.toggleMode !== "click" && this.toggleMode !== "dblclick" && this.toggleMode !== "mouseenter" && this.toggleMode !== "none") {
                throw new Error(this._invalidArgumentExceptions.invalidToggleMode)
            }
            if (this.position !== "top" && this.position !== "bottom") {
                throw new Error(this._invalidArgumentExceptions.invalidPosition)
            }
            if (this.scrollPosition !== "left" && this.scrollPosition !== "right" && this.scrollPosition !== "both") {
                throw new Error(this._invalidArgumentExceptions.invalidScrollPosition)
            }
            if (this.scrollStep < 0 || isNaN(this.scrollStep)) {
                throw new Error(this._invalidArgumentExceptions.invalidScrollStep)
            }
            if (this._titleList.length !== this._contentList.length || this._titleList.length == 0) {
                throw new Error(this._invalidArgumentExceptions.invalidStructure)
            }
            if (this.arrowButtonSize < 0 || isNaN(this.arrowButtonSize)) {
                throw new Error(this._invalidArgumentExceptions.invalidArrowSize)
            }
            if (this.closeButtonSize < 0 || isNaN(this.closeButtonSize)) {
                throw new Error(this._invalidArgumentExceptions.invalidCloseSize)
            }
        } catch (b) {
            if(b.message.indexOf(this._invalidArgumentExceptions.invalidStructure)==-1)//не показываем сообщение об invalidstructue
                alert(b);
            else
	            throw new Error(this._invalidArgumentExceptions.invalidStructure)
        }
    }, _startScrollRepeat: function (d, c) {
        var b = this;
        if (d) {
            this._scrollLeft(c)
        } else {
            this._scrollRight(c)
        }
        if (this._scrollTimeout) {
            clearTimeout(this._scrollTimeout)
        }
        this._scrollTimeout = setTimeout(function () {
            b._startScrollRepeat(d, b.scrollAnimationDuration)
        }, c)
    }, _performLayout: function () {
        var b = this.length();
        while (b) {
            b--;
            if (this.position === "top" || this.position === "bottom") {
                if (this.rtl) {
                    this._titleList[b].css("float", "right")
                } else {
                    this._titleList[b].css("float", "left")
                }
            }
        }
        this._fitToSize();
        this._performHeaderLayout();
        this._fitToSize()
    }, updatetabsheader: function () {
        this._performHeaderLayout()
    }, _performResize: function () {
        var b = this;
        this._fitToSize();
        this._positionArrows(this._totalItemsWidth);
        if (this._totalItemsWidth > this.element.offsetWidth) {
            this._unorderedList.width(this._totalItemsWidth)
        } else {
            this._unorderedList[0].style.width = this.element.offsetWidth - 2 + "px"
        }
        this._fitToSize()
    }, _addArrows: function () {
        if (this._leftArrow && this._rightArrow) {
            this._leftArrow.remove();
            this._rightArrow.remove()
        }
        this._leftArrow = a('<div><span style="display: block; width: 16px; height: 16px;" class="' + this.toThemeProperty("jqx-tabs-arrow-left") + '"></span></div>');
        this._rightArrow = a('<div><span style="display: block; width: 16px; height: 16px;" class="' + this.toThemeProperty("jqx-tabs-arrow-right") + '"></span></div>');
        this._leftArrow.addClass(this.toThemeProperty("jqx-tabs-arrow-background"));
        this._rightArrow.addClass(this.toThemeProperty("jqx-tabs-arrow-background"));
        this._leftArrow.addClass(this.toThemeProperty("jqx-widget-header"));
        this._rightArrow.addClass(this.toThemeProperty("jqx-widget-header"));
        this._headerWrapper.append(this._leftArrow);
        this._headerWrapper.append(this._rightArrow);
        this._leftArrow.width(this.arrowButtonSize);
        this._leftArrow.height("100%");
        this._rightArrow.width(this.arrowButtonSize);
        this._rightArrow.height("100%");
        this._leftArrow.css({"z-index": "30"});
        this._rightArrow.css({"z-index": "30"});
        this._leftArrow.css("display", "none");
        this._rightArrow.css("display", "none")
    }, _tabsWithVisibleCloseButtons: function () {
        if (!this.showCloseButtons) {
            return 0
        }
        var c = this.length();
        var b = this;
        a.each(this._titleList, function () {
            var d = this.attr("hasclosebutton");
            if (d != undefined && d != null) {
                if (d == "false" || d == false) {
                    c--
                }
            }
        });
        return c
    }, _calculateTitlesSize: function () {
        var g = 0;
        var d = 0;
        var c = this.length();
        if (this.rtl && a.jqx.browser.msie && a.jqx.browser.version < 8) {
            this._measureItem = a("<span style='position: relative; visibility: hidden;'></span>");
            a(document.body).append(this._measureItem)
        }
        while (c) {
            c--;
            if (this._measureItem) {
                this._measureItem.html(this._titleList[c].html());
                this._titleList[c].width(this._measureItem.width())
            }
            this._titleList[c].css("position", "static");
            this._titleList[c].find(this.toThemeProperty(".jqx-tabs-close-button", true)).css("display", "none");
            d += parseInt(this._titleList[c].outerWidth(true));
            if (g < this._titleList[c].outerHeight(true)) {
                g = Math.round(parseInt(this._titleList[c].outerHeight(true)))
            }
            if (this._titleList[c].height() == 0) {
                var f = this._titleList[c].clone();
                a(document.body).append(f);
                g = Math.round(parseInt(f.outerHeight(true)));
                f.remove()
            }
            var b = this._titleList[c].attr("hasCloseButton");
            if (b != undefined && b != null) {
                var e = false;
                if (this.hiddenCloseButtons) {
                    if (this.hiddenCloseButtons[c] == 1) {
                        this._titleList[c].find(this.toThemeProperty(".jqx-tabs-close-button", true)).css("display", "none");
                        e = true
                    }
                }
                if (!e) {
                    if (b == "true" || b == true) {
                        d += this.closeButtonSize;
                        this._titleList[c].find(this.toThemeProperty(".jqx-tabs-close-button", true)).css("display", "block")
                    } else {
                        if (b == "false" || b == false) {
                            this._titleList[c].find(this.toThemeProperty(".jqx-tabs-close-button", true)).css("display", "none")
                        }
                    }
                }
            } else {
                if (this.showCloseButtons && (this.canCloseAllTabs || this._tabsWithVisibleCloseButtons() > 1)) {
                    var e = false;
                    if (this.hiddenCloseButtons) {
                        if (this.hiddenCloseButtons[c] == 1) {
                            this._titleList[c].find(this.toThemeProperty(".jqx-tabs-close-button", true)).css("display", "none");
                            e = true
                        }
                    }
                    if (!e) {
                        d += this.closeButtonSize;
                        this._titleList[c].find(this.toThemeProperty(".jqx-tabs-close-button", true)).css("display", "block")
                    }
                }
            }
            this._titleList[c].height(this._titleList[c].height())
        }
        if (this._measureItem) {
            this._measureItem.remove()
        }
        return{height: g, width: 10 + d}
    }, _reorderHeaderElements: function () {
        if (this.selectionTracker) {
            this._moveSelectionTrackerContainer.css({position: "absolute", height: "100%", top: "0px", left: "0px", width: "100%"})
        }
        this._headerWrapper.css({position: "relative", left: "0px", top: "0px"});
        if (this.scrollable) {
            this._rightArrow.css({width: this.arrowButtonSize, position: "absolute", top: "0px"});
            this._leftArrow.css({width: this.arrowButtonSize, position: "absolute", top: "0px"});
            var c = this.theme && this.theme.indexOf("ui-") != -1 ? 3 : 0;
            if (c > 0) {
                this._rightArrow.addClass(this.toThemeProperty("jqx-rc-r"));
                this._leftArrow.addClass(this.toThemeProperty("jqx-rc-l"))
            }
            var b = this.scrollPosition;
            if (this.rtl) {
                if (b == "left") {
                    b = "right"
                }
                if (b == "right") {
                    b = "left"
                }
            }
            switch (b) {
                case"both":
                    this._rightArrow.css("right", "0px");
                    this._leftArrow.css("left", "0px");
                    break;
                case"left":
                    this._rightArrow.css("left", this.arrowButtonSize + "px");
                    this._leftArrow.css("left", "0px");
                    break;
                case"right":
                    this._rightArrow.css("right", -c + "px");
                    this._leftArrow.css("right", (this.arrowButtonSize - c) + "px");
                    break
            }
        }
    }, _positionArrows: function (b) {
        if (b >= parseInt(this._headerWrapper[0].offsetWidth) && this.scrollable) {
            this._needScroll = true;
            if (this._unorderedList.position().left === 0) {
                this._unorderedListLeftBackup = this._getArrowsDisplacement() + "px"
            }
            this._leftArrow.css("display", "block");
            this._rightArrow.css("display", "block")
        } else {
            this._needScroll = false;
            this._leftArrow[0].style.display = "none";
            this._rightArrow[0].style.display = "none";
            this._unorderedList[0].style.left = "0px"
        }
    }, _performHeaderLayout: function () {
        this._removeSelectStyle();
        var b = this._calculateTitlesSize();
        var d = b.height;
        var c = b.width;
        this._headerWrapper.height(d);
        this._unorderedList.height(d);
        if (this.headerHeight != null && this.headerHeight != "auto") {
            this._headerWrapper.height(this.headerHeight);
            this._unorderedList.height(this.headerHeight)
        }
        if (c > this.host.width()) {
            this._unorderedList.width(c)
        } else {
            this._unorderedList.width(this.host.width())
        }
        if (a.jqx.browser.msie && a.jqx.browser.version < 8) {
            this._unorderedList.css("position", "relative");
            this._headerWrapper.css("overflow", "hidden")
        }
        this._reorderHeaderElements();
        c = c + parseInt(this._unorderedList.css("margin-left"));
        this._totalItemsWidth = c;
        this._positionArrows(c);
        this._unorderedList.css({position: "relative", top: "0px"});
        this._verticalAlignElements();
        this._moveSelectionTrack(this._selectedItem, 0);
        this._addSelectStyle(this.selectedItem)
    }, _verticalAlignElements: function () {
        var k = this.length();
        var p = this._maxHeightTab();
        while (k) {
            k--;
            var b = this._titleList[k].find(".jqx-tabs-titleContentWrapper"), l = b.height(), o = this._titleList[k].find(this.toThemeProperty(".jqx-tabs-close-button", true)), m = parseInt(this._titleList[k].css("padding-top"));
            if (!m) {
                m = 0
            }
            if (this.autoHeight) {
                var h = this._titleList[k].outerHeight(true) - this._titleList[k].height();
                var c = parseInt(this._titleList[k].css("padding-top"));
                var q = parseInt(this._titleList[k].css("padding-bottom"));
                var j = parseInt(this._titleList[k].css("border-top-width"));
                var f = parseInt(this._titleList[k].css("border-bottom-width"));
                this._titleList[k].height(this._unorderedList.outerHeight() - c - q - j - f)
            } else {
                if (this.position === "top") {
                    var i = parseInt(this._unorderedList.height()) - parseInt(this._titleList[k].outerHeight(true));
                    if (parseInt(this._titleList[k].css("margin-top")) !== i && i !== 0) {
                        this._titleList[k].css("margin-top", i)
                    }
                } else {
                    this._titleList[k].height(this._titleList[k].height())
                }
            }
            this._titleList[k].children(0).height("100%");
            var e = parseInt(this._titleList[k].height());
            var g = parseInt(e) / 2 - parseInt(o.height()) / 2;
            o.css("margin-top", 1 + g);
            var n = parseInt(e) / 2 - parseInt(b.height()) / 2;
            b.css("margin-top", n)
        }
        if (this.scrollable) {
            var h = parseInt(this._headerWrapper.outerHeight()) - this.arrowButtonSize;
            var d = h / 2;
            this._rightArrow.children(0).css("margin-top", d);
            this._rightArrow.height("100%");
            this._leftArrow.height("100%");
            this._leftArrow.children(0).css("margin-top", d)
        }
    }, _getImageUrl: function (c) {
        var b = c.css("background-image");
        b = b.replace('url("', "");
        b = b.replace('")', "");
        b = b.replace("url(", "");
        b = b.replace(")", "");
        return b
    }, _fitToSize: function () {
        var c = false;
        var e = false;
        var d = this;
        if (d.width != null && d.width.toString().indexOf("%") != -1) {
            c = true
        }
        if (d.height != null && d.height.toString().indexOf("%") != -1) {
            e = true
        }
        if (c) {
            this.host[0].style.width = this.width;
            this._contentWrapper[0].style.width = "100%"
        }
        if (e) {
            this.host[0].style.height = this.height;
            this._contentWrapper[0].style.width = "100%";
            this._contentWrapper[0].style.height = "auto";
            var b = this.element.offsetHeight - this._headerWrapper[0].offsetHeight;
            this._contentWrapper[0].style.height = b + "px"
        }
        if (!c) {
            this.host.width(this.width);
            if (this.width != "auto") {
                this._contentWrapper.css("width", "100%")
            }
        }
        if (!e) {
            if (this.height !== "auto") {
                this.host.height(this.height);
                var b = this.host.height() - this._headerWrapper.outerHeight();
                this._contentWrapper.height(b)
            } else {
                this._contentWrapper.css("height", "auto")
            }
        }
    }, _maxHeightTab: function () {
        var c = this.length();
        var d = -1;
        var b = -1;
        while (c) {
            c--;
            if (d < parseInt(this._titleList[c].outerHeight(true))) {
                b = c
            }
        }
        return b
    }, _addSelectionTracker: function () {
        if (this._moveSelectionTrackerContainer) {
            this._moveSelectionTrackerContainer.remove()
        }
        this._moveSelectionTrackerContainer = a('<div class="' + this.toThemeProperty("jqx-tabs-selection-tracker-container") + '">');
        var b = this.toThemeProperty("jqx-tabs-selection-tracker-" + this.position);
        this._selectionTracker = a('<div class="' + b + '">');
        this._selectionTracker.css("color", "inherit");
        this._moveSelectionTrackerContainer.append(this._selectionTracker);
        this._headerWrapper.append(this._moveSelectionTrackerContainer);
        this._selectionTracker.css({position: "absolute", "z-index": "10", left: "0px", top: "0px", display: "inline-block"})
    }, _addContentWrapper: function () {
        var d = "none";
        var b = this._contentWrapper == undefined;
        this._contentWrapper = this._contentWrapper || a('<div class="' + this.toThemeProperty("jqx-tabs-content") + '" style="float:' + d + ';">');
        this._contentWrapper.addClass(this.toThemeProperty("jqx-widget-content"));
        var c = this.length();
        while (c) {
            c--;
            this._contentList[c].addClass(this.toThemeProperty("jqx-tabs-content-element"))
        }
        if (b) {
            this.host.find(".jqx-tabs-content-element").wrapAll(this._contentWrapper);
            this._contentWrapper = this.host.find(".jqx-tabs-content")
        }
        if (this.roundedCorners) {
            if (this.position == "top") {
                this._contentWrapper.addClass(this.toThemeProperty("jqx-rc-b"))
            } else {
                this._contentWrapper.addClass(this.toThemeProperty("jqx-rc-t"))
            }
            this.host.addClass(this.toThemeProperty("jqx-rc-all"))
        }
    }, _addHeaderWrappers: function () {
        var b = this.length();
        this._unorderedList.remove();
        this._headerWrapper = this._headerWrapper || a('<div class="jqx-tabs-headerWrapper" style="outline: none;">');
        this._headerWrapper.remove();
        if (this.position == "top") {
            this._headerWrapper.prependTo(this.host)
        } else {
            this._headerWrapper.appendTo(this.host)
        }
        this._unorderedList.appendTo(this._headerWrapper);
        this._headerWrapper.addClass(this.toThemeProperty("jqx-tabs-header"));
        this._headerWrapper.addClass(this.toThemeProperty("jqx-widget-header"));
        if (this.position == "bottom") {
            this._headerWrapper.addClass(this.toThemeProperty("jqx-tabs-header-bottom"))
        } else {
            this._headerWrapper.removeClass(this.toThemeProperty("jqx-tabs-header-bottom"))
        }
        if (this.roundedCorners) {
            if (this.position == "top") {
                this._headerWrapper.addClass(this.toThemeProperty("jqx-rc-t"));
                this._headerWrapper.removeClass(this.toThemeProperty("jqx-rc-b"))
            } else {
                this._headerWrapper.removeClass(this.toThemeProperty("jqx-rc-t"));
                this._headerWrapper.addClass(this.toThemeProperty("jqx-rc-b"))
            }
        }
        while (b) {
            b--;
            if (this._titleList[b].children(".jqx-tabs-titleWrapper").length <= 0) {
                var c = a('<div class="jqx-tabs-titleWrapper" style="outline: none; position: relative;">');
                c.append(this._titleList[b].html());
                this._titleList[b].empty();
                c.appendTo(this._titleList[b])
            }
            this._titleList[b].children(".jqx-tabs-titleWrapper").css("z-index", "15")
        }
    }, _render: function () {
        this._addCloseButtons();
        this._addHeaderWrappers();
        this._addContentWrapper();
        if (this.selectionTracker) {
            this._addSelectionTracker()
        }
        this._addArrows()
    }, _addCloseButton: function (c) {
        var f = c;
        if (this._titleList[f].find(this.toThemeProperty(".jqx-tabs-close-button", true)).length <= 0 && this._titleList[f].find(".jqx-tabs-titleContentWrapper").length <= 0) {
            var d = a('<div class="jqx-tabs-titleContentWrapper"></div>');
            var g = "left";
            if (this.rtl) {
                g = "right"
            }
            d.css("float", g);
            d.addClass("jqx-disableselect");
            d.append(this._titleList[f].html());
            this._titleList[f].html("");
            var b = a('<div class="' + this.toThemeProperty("jqx-tabs-close-button") + '"></div>');
            b.css({height: this.closeButtonSize, width: this.closeButtonSize, "float": g, "font-size": "1px"});
            var e = this;
            this._titleList[f].append(d);
            this._titleList[f].append(b);
            if (!this.showCloseButtons) {
                b.css("display", "none")
            } else {
                if (this.hiddenCloseButtons) {
                    if (this.hiddenCloseButtons[c] == 1) {
                        b.css("display", "none")
                    }
                }
            }
        }
    }, _addCloseButtons: function () {
        var b = this.length();
        while (b) {
            b--;
            this._addCloseButton(b)
        }
    }, _prepareTabs: function () {
        var c = this.length();
        var b = this.selectionTracker;
        this.selectionTracker = false;
        while (c) {
            c--;
            if (this._selectedItem !== c) {
                this._unselect(c, null, false)
            }
        }
        this._select(this._selectedItem, 0, null, false);
        this.selectionTracker = b;
        if (this.initTabContent) {
            if (!this._initTabContentList[this.selectedItem]) {
                if (!this._hiddenParent()) {
                    this.initTabContent(this.selectedItem);
                    this._initTabContentList[this.selectedItem] = true
                }
            }
        }
    }, _isValidIndex: function (b) {
        return(b >= 0 && b < this.length())
    }, _removeSelectStyle: function () {
        var c = this.length();
        while (c) {
            c--;
            var b = null;
            if (this.showCloseButtons) {
                var b = this._titleList[c].children(0).children(this.toThemeProperty(".jqx-tabs-close-button", true));
                b.removeClass(this.toThemeProperty("jqx-tabs-close-button-selected"))
            }
            if (this.position == "top") {
                this._titleList[c].removeClass(this.toThemeProperty("jqx-tabs-title-selected-top"))
            } else {
                this._titleList[c].removeClass(this.toThemeProperty("jqx-tabs-title-selected-bottom"))
            }
            this._titleList[c].removeClass(this.toThemeProperty("jqx-fill-state-pressed"))
        }
    }, _addSelectStyle: function (c, e) {
        var d = this.length();
        this._removeSelectStyle();
        if (!this.selectionTracker || (e != undefined && e)) {
            if (c >= 0 && this._titleList[c] != undefined) {
                var b = null;
                if (this.showCloseButtons) {
                    var b = this._titleList[c].children(0).children(this.toThemeProperty(".jqx-tabs-close-button", true));
                    if (this.hiddenCloseButtons) {
                        if (this.hiddenCloseButtons[c] == 1) {
                            b = null
                        }
                    }
                }
                this._titleList[c].removeClass(this.toThemeProperty("jqx-fill-state-hover"));
                if (this.position == "top") {
                    this._titleList[c].removeClass(this.toThemeProperty("jqx-tabs-title-hover-top"));
                    this._titleList[c].addClass(this.toThemeProperty("jqx-tabs-title-selected-top"))
                } else {
                    this._titleList[c].removeClass(this.toThemeProperty("jqx-tabs-title-hover-bottom"));
                    this._titleList[c].addClass(this.toThemeProperty("jqx-tabs-title-selected-bottom"))
                }
                this._titleList[c].addClass(this.toThemeProperty("jqx-fill-state-pressed"));
                if (b != null) {
                    b.addClass(this.toThemeProperty("jqx-tabs-close-button-selected"))
                }
            }
        }
    }, _addItemTo: function (g, c, e) {
        if (c < g.length) {
            var b = undefined, f = undefined;
            for (var d = c; d + 1 < g.length; d++) {
                if (b === undefined) {
                    b = g[d + 1];
                    g[d + 1] = g[d]
                } else {
                    f = g[d + 1];
                    g[d + 1] = b;
                    b = f
                }
            }
            if (b === undefined) {
                b = g[c]
            }
            g[c] = e;
            g.push(b)
        } else {
            g.push(e)
        }
    }, _select: function (d, g, h, b, f) {
        if (!this._tabCaptured) {
            this.host.attr("hideFocus", "true");
            var c = this;
            if (f == undefined) {
                this._addSelectStyle(d)
            } else {
                this._addSelectStyle(d, f)
            }
            if (this.isCollapsed && this.collapsible) {
                this._contentList[d].css("display", "none");
                this._selectCallback(d, h, b);
                return
            }
            switch (this.animationType) {
                case"none":
                    if (!c.selectionTracker) {
                        for (var e = 0; e < this._contentList.length; e++) {
                            if (d != e && this._contentList[e].css("display") == "block") {
                                this._contentList[e].css("display", "none");
                                a.jqx.aria(this._titleList[e], "aria-selected", false);
                                a.jqx.aria(this._contentList[e], "aria-hidden", true)
                            }
                        }
                        this._contentList[d].css("display", "block");
                        a.jqx.aria(this._titleList[d], "aria-selected", true);
                        a.jqx.aria(this._contentList[d], "aria-hidden", false);
                        a.jqx.aria(this, "aria-activedescendant", this._titleList[d][0].id)
                    } else {
                        setTimeout(function () {
                            c._contentList[d].css("display", "block");
                            a.jqx.aria(c._titleList[d], "aria-selected", true);
                            a.jqx.aria(c._contentList[d], "aria-hidden", false);
                            a.jqx.aria(c, "aria-activedescendant", c._titleList[d][0].id)
                        }, this.selectionTrackerAnimationDuration)
                    }
                    this._selectCallback(d, h, b);
                    break;
                case"fade":
                    this._lockAnimation("contentListSelect");
                    c._selectCallback(d, h, b);
                    this._contentList[d].fadeIn(g, function () {
                        c._unlockAnimation("contentListSelect");
                        a.jqx.aria(c._titleList[d], "aria-selected", true);
                        a.jqx.aria(c._contentList[d], "aria-hidden", false);
                        a.jqx.aria(c, "aria-activedescendant", c._titleList[d][0].id)
                    });
                    break
            }
        }
    }, _selectCallback: function (c, d, b) {
        this._selectedItem = c;
        this.selectedItem = this._selectedItem;
        if (d) {
            d()
        }
        if (b) {
            this._raiseEvent(1, {item: c})
        }
    }, _unselect: function (d, e, b) {
        if (d >= 0) {
            if (!this._tabCaptured) {
                var c = this;
                this._contentList[d].stop();
                if (this.animationType == "fade") {
                    this._contentList[d].css("display", "none");
                    a.jqx.aria(c._titleList[d], "aria-selected", false);
                    a.jqx.aria(c._contentList[d], "aria-hidden", true)
                } else {
                    if (this.selectionTracker) {
                        setTimeout(function () {
                            c._contentList[d].css("display", "none");
                            a.jqx.aria(c._titleList[d], "aria-selected", false);
                            a.jqx.aria(c._contentList[d], "aria-hidden", true)
                        }, this.selectionTrackerAnimationDuration)
                    } else {
                        this._contentList[d].css("display", "none");
                        a.jqx.aria(c._titleList[d], "aria-selected", false);
                        a.jqx.aria(c._contentList[d], "aria-hidden", true)
                    }
                }
                this._unselectCallback(d, e, b);
                if (!this.selectionTracker) {
                    this._titleList[d].removeClass(this.toThemeProperty("jqx-tabs-title-selected"));
                    this._titleList[d].removeClass(this.toThemeProperty("jqx-fill-state-pressed"))
                }
            }
        }
    }, _unselectCallback: function (c, d, b) {
        if (b) {
            this._raiseEvent(8, {item: c})
        }
        if (d) {
            d()
        }
    }, disable: function () {
        var b = this.length();
        while (b) {
            b--;
            this.disableAt(b)
        }
    }, enable: function () {
        var b = this.length();
        while (b) {
            b--;
            this.enableAt(b)
        }
    }, getEnabledTabsCount: function () {
        var b = 0;
        a.each(this._titleList, function () {
            if (!this.disabled) {
                b++
            }
        });
        return b
    }, getDisabledTabsCount: function () {
        var b = 0;
        a.each(this._titleList, function () {
            if (this.disabled) {
                b++
            }
        });
        return b
    }, removeAt: function (d) {
        if (this._isValidIndex(d) && (this.canCloseAllTabs || this.length() > 1)) {
            this._removeHoverStates();
            var b = this, c = this._titleList[this._selectedItem], e = parseInt(this._titleList[d].outerWidth(true)), i = this.getTitleAt(d);
            /*Исправление для отправки события перед закрытием вкладки (чтобы дать шанс очистить контент перед удалением)*/
            this._raiseEvent(16, {item: d, title: i});
            /*Конец исправления для отправки события перед закрытием вкладки*/
            this._unorderedList.width(parseInt(this._unorderedList.width()) - e);
            this._titleList[d].remove();
            this._contentList[d].remove();
            var h = 0;
            this._titleList.splice(d, 1);
            this._contentList.splice(d, 1);
            this._addStyles();
            this._performHeaderLayout();
            this._removeEventHandlers();
            this._addEventHandlers();
            this._raiseEvent(3, {item: d, title: i});
            this._isAnimated = {};
            if (this.selectedItem > 0) {
                this._selectedItem = -1;
                var g = this._getPreviousIndex(this.selectedItem);
                this.select(g)
            } else {
                this._selectedItem = -1;
                var g = this._getNextIndex(this.selectedItem);
                this.select(g)
            }
            if (parseInt(this._unorderedList.css("left")) > this._getArrowsDisplacement()) {
                this._unorderedList.css("left", this._getArrowsDisplacement())
            }
            if (parseInt(this._unorderedList.width()) <= parseInt(this._headerWrapper.width())) {
                var f = (this.enableScrollAnimation) ? this.scrollAnimationDuration : 0;
                this._lockAnimation("unorderedList");
                this._unorderedList.animate({left: 0}, f, function () {
                    b._unlockAnimation("unorderedList")
                })
            }
        }
    }, removeFirst: function () {
        this.removeAt(0)
    }, removeLast: function () {
        this.removeAt(this.length() - 1)
    }, disableAt: function (b) {
        if (!this._titleList[b].disabled || this._titleList[b].disabled === undefined) {
            if (this.selectedItem == b) {
                var c = this.next();
                if (!c) {
                    c = this.previous()
                }
            }
            this._titleList[b].disabled = true;
            this.removeHandler(this._titleList[b], this.toggleMode);
            if (this.enabledHover) {
                this._titleList[b].off("mouseenter").off("mouseleave")
            }
            this._removeEventListenerAt(b);
            this._titleList[b].addClass(this.toThemeProperty("jqx-tabs-title-disable"));
            this._titleList[b].addClass(this.toThemeProperty("jqx-fill-state-disabled"));
            this._raiseEvent(5, {item: b})
        }
    }, enableAt: function (b) {
        if (this._titleList[b].disabled) {
            this._titleList[b].disabled = false;
            this._addEventListenerAt(b);
            this._titleList[b].removeClass(this.toThemeProperty("jqx-tabs-title-disable"));
            this._titleList[b].removeClass(this.toThemeProperty("jqx-fill-state-disabled"));
            this._raiseEvent(4, {item: b})
        }
    }, addAt: function (d, g, e) {
        if (d >= 0 || d <= this.length()) {
            this._removeHoverStates();
            var b = a("<li>" + g + "</li>");
            var f = a("<div>" + e + "</div>");
            b.addClass(this.toThemeProperty("jqx-tabs-title"));
            b.addClass(this.toThemeProperty("jqx-item"));
            f.addClass(this.toThemeProperty("jqx-tabs-content-element"));
            if (this.position == "bottom") {
                b.addClass(this.toThemeProperty("jqx-tabs-title-bottom"))
            }
            var c = false;
            if (this._titleList.length == 0) {
                this._unorderedList.append(b)
            } else {
                if (d < this.length() && d >= 0) {
                    this._titleList[d].before(b)
                } else {
                    this._titleList[this.length() - 1].after(b)
                }
            }
            f.appendTo(this._contentWrapper);
            this._addItemTo(this._titleList, d, b);
            this._addItemTo(this._contentList, d, f);
            if (this._selectedItem > d) {
                this._selectedItem++
            }
            this._switchTabs(d, this._selectedItem);
            this._selectedItem = d;
            if (this.showCloseButtons && this._titleList.length > 0) {
                this._addCloseButton(d)
            }
            this._uiRefresh(c);
            this._raiseEvent(2, {item: d});
            this._moveSelectionTrack(this._selectedItem, 0)
        }
    }, addFirst: function (c, b) {
        this.addAt(0, c, b)
    }, addLast: function (c, b) {
        this.addAt(this.length(), c, b)
    }, val: function (b) {
        if (arguments.length == 0 || typeof(b) == "object") {
            return this._selectedItem
        }
        this.select(b);
        return this._selectedItem
    }, select: function (c, b) {
        if (typeof(c) === "object") {
            c = this._indexOf(c)
        }
        var e = c >= 0 && c < this._titleList.length ? this._titleList[c].attr("canselect") : true;
        if (e == undefined || e == "true" || e == true) {
            if (c !== this._selectedItem && this._isValidIndex(c)) {
                if (!this._activeAnimation() && !this._titleList[c].disabled) {
                    var d = this._switchTabs(c, this._selectedItem);
                    if (d) {
                        this.ensureVisible(c)
                    }
                }
            }
        }
    }, previous: function (c) {
        var b = this._selectedItem;
        if (c != undefined && !isNaN(c)) {
            b = c
        }
        while (b > 0 && b < this._titleList.length) {
            b--;
            if (!this._titleList[b].disabled) {
                this.select(b);
                return true
            }
        }
        return false
    }, _getPreviousIndex: function (c) {
        if (c != undefined && !isNaN(c)) {
            var b = c;
            while (c > 0 && c <= this._titleList.length) {
                c--;
                if (!this._titleList[c].disabled) {
                    return c;
                    break
                }
            }
            return b
        } else {
            return 0
        }
    }, _getNextIndex: function (c) {
        if (c != undefined && !isNaN(c)) {
            var b = c;
            while (c >= 0 && c < this._titleList.length) {
                if (!this._titleList[c].disabled) {
                    return c;
                    break
                }
                c++
            }
            return b
        } else {
            return 0
        }
    }, next: function (c) {
        var b = this._selectedItem;
        if (c != undefined && !isNaN(c)) {
            b = c
        }
        while (b >= 0 && b < this._titleList.length - 1) {
            b++;
            if (!this._titleList[b].disabled) {
                this.select(b);
                return true
            }
        }
        return false
    }, first: function () {
        var b = 0;
        if (this._titleList[b].disabled) {
            this.next(b)
        } else {
            this.select(b)
        }
    }, last: function () {
        var b = this._titleList.length - 1;
        if (this._titleList[b].disabled) {
            this.previous(b)
        } else {
            this.select(b)
        }
    }, length: function () {
        return this._titleList.length
    }, lockAt: function (b) {
        if (this._isValidIndex(b) && (!this._titleList[b].locked || this._titleList[b].locked === undefined)) {
            this._titleList[b].locked = true;
            this._raiseEvent(11, {item: b})
        }
    }, unlockAt: function (b) {
        if (this._isValidIndex(b) && this._titleList[b].locked) {
            this._titleList[b].locked = false;
            this._raiseEvent(12, {item: b})
        }
    }, lockAll: function () {
        var b = this.length();
        while (b) {
            b--;
            this.lockAt(b)
        }
    }, unlockAll: function () {
        var b = this.length();
        while (b) {
            b--;
            this.unlockAt(b)
        }
    }, showCloseButtonAt: function (c) {
        if (this._isValidIndex(c)) {
            if (!this.showCloseButtons) {
                this.showCloseButtons = true;
                this.updatetabsheader()
            }
            var b = this._titleList[c].find(this.toThemeProperty(".jqx-tabs-close-button", true));
            b.css("display", "block");
            if (!this.hiddenCloseButtons) {
                this.hiddenCloseButtons = new Array()
            }
            this.hiddenCloseButtons[c] = 0
        }
    }, hideCloseButtonAt: function (c) {
        if (this._isValidIndex(c)) {
            var b = this._titleList[c].find(this.toThemeProperty(".jqx-tabs-close-button", true));
            b.css("display", "none");
            if (!this.hiddenCloseButtons) {
                this.hiddenCloseButtons = new Array()
            }
            this.hiddenCloseButtons[c] = 1
        }
    }, hideAllCloseButtons: function () {
        var b = this.length();
        while (b) {
            b--;
            this.hideCloseButtonAt(b)
        }
    }, showAllCloseButtons: function () {
        var b = this.length();
        while (b) {
            b--;
            this.showCloseButtonAt(b)
        }
    }, getTitleAt: function (b) {
        if (this._titleList[b]) {
            return this._titleList[b].text()
        }
        return null
    }, getContentAt: function (b) {
        if (this._contentList[b]) {
            return this._contentList[b]
        }
        return null
    }, setTitleAt: function (b, c) {
        if (this._titleList[b]) {
            this._titleList[b].text(c);
            if (this.showCloseButtons) {
                this._addCloseButton(b);
                this._removeEventHandlers();
                this._addEventHandlers()
            }
            this.render();
            this.refresh()
        }
    }, setContentAt: function (b, c) {
        if (this._contentList[b]) {
            this._contentList[b].html(c)
        }
    }, ensureVisible: function (d) {
        var k = this;
        if (d == undefined || d == -1 || d == null) {
            d = this.selectedItem
        }
        if (!this._isValidIndex(d)) {
            return false
        }
        var j = parseInt(this._titleList[d].position().left) + parseInt(this._unorderedList.css("margin-left"));
        var f = parseInt(this._unorderedList.css("left"));
        var i = parseInt(this._headerWrapper.outerWidth(true));
        var e = parseInt(this._titleList[d].outerWidth(true));
        var h = f - this._getArrowsDisplacement();
        var b = i - this._getArrowsDisplacement() - h;
        var g, c;
        if (j < -h) {
            g = -j + this._getArrowsDisplacement();
            c = this._getArrowsDisplacement()
        } else {
            if (j + e > b - this._getArrowsDisplacement()) {
                g = -j + i - e - ((this.scrollable) ? (2 * this.arrowButtonSize - this._getArrowsDisplacement()) : 0);
                c = i - e - this._getArrowsDisplacement()
            } else {
                this._moveSelectionTrack(d, this.selectionTrackerAnimationDuration);
                return true
            }
        }
        this._lockAnimation("unorderedList");
        this._unorderedList.animate({left: g}, this.scrollAnimationDuration, function () {
            k._unlockAnimation("unorderedList");
            k._moveSelectionTrack(k._selectedItem, 0);
            return true
        });
        this._moveSelectionTrack(d, this.selectionTrackerAnimationDuration, c);
        return true
    }, isVisibleAt: function (d) {
        var k = this;
        if (d == undefined || d == -1 || d == null) {
            d = this.selectedItem
        }
        if (!this._isValidIndex(d)) {
            return false
        }
        var j = parseInt(this._titleList[d].position().left) + parseInt(this._unorderedList.css("margin-left"));
        var f = parseInt(this._unorderedList.css("left"));
        var i = parseInt(this._headerWrapper.outerWidth(true));
        var e = parseInt(this._titleList[d].outerWidth(true));
        var h = f - this._getArrowsDisplacement();
        var b = i - this._getArrowsDisplacement() - h;
        var g, c;
        if (j < -h) {
            return false
        } else {
            if (j + e > b) {
                return false
            } else {
                return true
            }
        }
        return true
    }, isDisabled: function (b) {
        return this._titleList[b].disabled
    }, _lockAnimation: function (b) {
        if (this._isAnimated) {
            this._isAnimated[b] = true
        }
    }, _unlockAnimation: function (b) {
        if (this._isAnimated) {
            this._isAnimated[b] = false
        }
    }, propertyChangedHandler: function (b, c, e, d) {
        this._validateProperties();
        switch (c) {
            case"touchMode":
                if (d) {
                    b.enabledHover = false;
                    b.keyboardNavigation = false
                }
                break;
            case"width":
            case"height":
                b._performResize();
                return;
            case"disabled":
                if (d) {
                    this.disable()
                } else {
                    this.enable()
                }
                return;
            case"showCloseButtons":
                if (d) {
                    this.showAllCloseButtons()
                } else {
                    this.hideAllCloseButtons()
                }
                this._moveSelectionTrack(this._selectedItem, this.selectionTrackerAnimationDuration);
                return;
            case"selectedItem":
                if (this._isValidIndex(d)) {
                    this.select(d)
                }
                return;
            case"scrollStep":
            case"contentTransitionDuration":
            case"scrollAnimationDuration":
            case"enableScrollAnimation":
                return;
            case"selectionTracker":
                if (d) {
                    this._refresh();
                    this.select(this._selectedItem)
                } else {
                    if (this._selectionTracker != null) {
                        this._selectionTracker.remove()
                    }
                }
                return;
            case"scrollable":
                if (d) {
                    this._refresh();
                    this.select(this._selectedItem)
                } else {
                    this._leftArrow.remove();
                    this._rightArrow.remove();
                    this._performHeaderLayout()
                }
                return;
            case"autoHeight":
                this._performHeaderLayout();
                return;
            case"theme":
                a.jqx.utilities.setTheme(e, d, this.host);
                return
        }
        this._unorderedList.css("left", "0px");
        this._refresh();
        this.select(this._selectedItem);
        this._addSelectStyle(this._selectedItem, true)
    }})
}(jQuery));