/*
jQWidgets v3.2.2 (2014-Mar-21)
Copyright (c) 2011-2014 jQWidgets.
License: http://jqwidgets.com/license/
*/

(function (a) {
	a.extend(a.jqx._jqxGrid.prototype, {
		_handledblclick: function (t, n) {
			if (t.target == null) {
				return
			}
			if (n.disabled) {
				return
			}
			if (a(t.target).ischildof(this.columnsheader)) {
				return
			}
			var w;
			if (t.which) {
				w = (t.which == 3)
			} else {
				if (t.button) {
					w = (t.button == 2)
				}
			}
			if (w) {
				return
			}
			var B;
			if (t.which) {
				B = (t.which == 2)
			} else {
				if (t.button) {
					B = (t.button == 1)
				}
			}
			if (B) {
				return
			}
			var v = this.showheader ? this.columnsheader.height() + 2 : 0;
			var o = this._groupsheader() ? this.groupsheader.height() : 0;
			var A = this.showtoolbar ? this.toolbarheight : 0;
			o += A;
			var e = this.host.offset();
			var m = t.pageX - e.left;
			var l = t.pageY - v - e.top - o;
			var b = this._hittestrow(m, l);
			var h = b.row;
			var j = b.index;
			var q = t.target.className;
			var p = this.table[0].rows[j];
			if (p == null) {
				return
			}
			n.mousecaptured = true;
			n.mousecaptureposition = {left: t.pageX, top: t.pageY - o};
			var r = this.hScrollInstance;
			var s = r.value;
			var d = 0;
			var k = this.groupable ? this.groups.length : 0;
			for (var u = 0; u < p.cells.length; u++) {
				var f = parseInt(a(this.columnsrow[0].cells[u]).css("left"));
				var g = f - s;
				if (n.columns.records[u].pinned) {
					g = f
				}
				var c = this._getcolumnat(u);
				if (c != null && c.hidden) {
					continue
				}
				var z = g + a(this.columnsrow[0].cells[u]).width();
				if (z >= m && m >= g) {
					d = u;
					break
				}
			}
			if (h != null) {
				var c = this._getcolumnat(d);
				if (!(q.indexOf("jqx-grid-group-expand") != -1 || q.indexOf("jqx-grid-group-collapse") != -1)) {
					if (h.boundindex != -1) {
						n.begincelledit(n.getboundindex(h), c.datafield, c.defaulteditorvalue)
					}
				}
			}
		}, _getpreveditablecolumn: function (c) {
			var b = this;
			while (c > 0) {
				c--;
				var d = b.getcolumnat(c);
				if (!d) {
					return null
				}
				if (!d.editable) {
					continue
				}
				if (!d.hidden) {
					return d
				}
			}
			return null
		}, _getnexteditablecolumn: function (c) {
			var b = this;
			while (c < this.columns.records.length) {
				c++;
				var d = b.getcolumnat(c);
				if (!d) {
					return null
				}
				if (!d.editable) {
					continue
				}
				if (!d.hidden) {
					return d
				}
			}
			return null
		}, _handleeditkeydown: function (B, v) {
			if (v.handlekeyboardnavigation) {
				var n = v.handlekeyboardnavigation(B);
				if (n == true) {
					return true
				}
			}
			var F = B.charCode ? B.charCode : B.keyCode ? B.keyCode : 0;
			if (v.showfilterrow && v.filterable) {
				if (this.filterrow) {
					if (a(B.target).ischildof(this.filterrow)) {
						return true
					}
				}
			}
			if (v.pageable) {
				if (a(B.target).ischildof(this.pager)) {
					return true
				}
			}
			if (this.showtoolbar) {
				if (a(B.target).ischildof(this.toolbar)) {
					return true
				}
			}
			if (this.showstatusbar) {
				if (a(B.target).ischildof(this.statusbar)) {
					return true
				}
			}
			if (this.rowdetails) {
				if (a(B.target).ischildof(this.content.find("[role='rowgroup']"))) {
					return true
				}
			}
			if (this.editcell) {
				if (this.editmode === "selectedrow") {
					if (F === 13) {
						this.endrowedit(this.editcell.row, false)
					} else {
						if (F === 27) {
							this.endrowedit(this.editcell.row, true)
						}
					}
					if (F === 9) {
						return false
					}
					return true
				}
				if (this.editcell.columntype == null || this.editcell.columntype == "textbox" || this.editcell.columntype == "numberinput" || this.editcell.columntype == "combobox" || this.editcell.columntype == "datetimeinput") {
					if (F >= 33 && F <= 40 && v.selectionmode == "multiplecellsadvanced") {
						var h = this.editcell.columntype == "textbox" || this.editcell.columntype == null ? this.editcell.editor : this.editcell.editor.find("input");
						var G = v._selection(h);
						var w = h.val().length;
						if (G.length > 0 && this.editcell.columntype != "datetimeinput") {
							v._cancelkeydown = true
						}
						if (G.start > 0 && F == 37) {
							v._cancelkeydown = true
						}
						if (G.start < w && F == 39 && this.editcell.columntype != "datetimeinput") {
							v._cancelkeydown = true
						}
						if (this.editcell.columntype == "datetimeinput" && F == 39) {
							if (G.start + G.length < w) {
								v._cancelkeydown = true
							}
						}
					}
				} else {
					if (this.editcell.columntype == "dropdownlist") {
						if (F == 37 || F == 39 && v.selectionmode == "multiplecellsadvanced") {
							v._cancelkeydown = false
						}
					} else {
						if (this.selectionmode == "multiplecellsadvanced" && this.editcell.columntype != "textbox" && this.editcell.columntype != "numberinput") {
							v._cancelkeydown = true
						}
					}
				}
				if (F == 32) {
					if (v.editcell.columntype == "checkbox") {
						var e = v.getcolumn(v.editcell.datafield);
						if (e.editable) {
							var l = !v.getcellvalue(v.editcell.row, v.editcell.column);
							if (e.cellbeginedit) {
								var b = e.cellbeginedit(v.editcell.row, e.datafield, e.columntype, !l);
								if (b == false) {
									return false
								}
							}
							v.setcellvalue(v.editcell.row, v.editcell.column, l, true);
							v._raiseEvent(18, {
								rowindex: v.editcell.row,
								datafield: v.editcell.column,
								oldvalue: !l,
								value: l,
								columntype: "checkbox"
							});
							return false
						}
					}
				}
				if (F == 9) {
					var g = this.editcell.row;
					var t = this.editcell.column;
					var k = t;
					var y = v._getcolumnindex(t);
					var s = false;
					var d = v.getrowvisibleindex(g);
					this.editchar = "";
					if (this.editcell.validated != false) {
						if (B.shiftKey) {
							var e = v._getpreveditablecolumn(y);
							if (e) {
								t = e.datafield;
								s = true;
								if (v.selectionmode.indexOf("cell") != -1) {
									v.selectprevcell(g, k);
									setTimeout(function () {
										v.ensurecellvisible(d, t)
									}, 10)
								}
							}
						} else {
							var e = v._getnexteditablecolumn(y);
							if (e) {
								t = e.datafield;
								s = true;
								if (v.selectionmode.indexOf("cell") != -1) {
									v.selectnextcell(g, k);
									v._oldselectedcell = v.selectedcell;
									setTimeout(function () {
										v.ensurecellvisible(d, t)
									}, 10)
								}
							}
						}
						if (s) {
							v.begincelledit(g, t);
							if (this.editcell != null && this.editcell.columntype == "checkbox") {
								this._renderrows(this.virtualsizeinfo)
							}
						} else {
							if (this.editcell != null) {
								v.endcelledit(g, t, false);
								this._renderrows(this.virtualsizeinfo)
							}
							return true
						}
					}
					return false
				} else {
					if (F == 13) {
						var r = this.selectedcell;
						if (r) {
							var u = this.getrowvisibleindex(r.rowindex)
						}
						this.endcelledit(this.editcell.row, this.editcell.column, false, true);
						if (this.selectionmode == "multiplecellsadvanced") {
							var c = v.getselectedcell();
							if (c != null) {
								if (v.selectcell) {
									if (this.editcell == null) {
										if (c.rowindex + 1 < this.dataview.totalrecords) {
											if (this.sortcolumn != c.datafield) {
												var d = this.getrowvisibleindex(c.rowindex);
												var E = this.dataview.loadedrecords[d + 1];
												if (E) {
													if (!this.pageable || (this.pageable && d + 1 < (this.dataview.pagenum + 1) * this.pagesize)) {
														this.clearselection(false);
														this.selectcell(this.getboundindex(E), c.datafield);
														var c = this.getselectedcell();
														this.ensurecellvisible(E.visibleindex, c.datafield)
													}
												}
											} else {
												if (r != null) {
													var D = this.dataview.loadedrecords[u + 1];
													if (D) {
														if (!this.pageable || (this.pageable && u + 1 < this.pagesize)) {
															this.clearselection(false);
															this.selectcell(this.getboundindex(D), c.datafield)
														} else {
															if (this.pageable && u + 1 >= this.pagesize) {
																this.clearselection(false);
																var D = this.dataview.loadedrecords[u];
																this.selectcell(this.getboundindex(D), c.datafield)
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
						return false
					} else {
						if (F == 27) {
							this.endcelledit(this.editcell.row, this.editcell.column, true, true);
							return false
						}
					}
				}
			} else {
				var x = false;
				if (F == 113) {
					x = true
				}
				if (!B.ctrlKey && !B.altKey) {
					if (F >= 48 && F <= 57) {
						this.editchar = String.fromCharCode(F);
						x = true
					}
					if (F >= 65 && F <= 90) {
						this.editchar = String.fromCharCode(F);
						var q = false;
						if (B.shiftKey) {
							q = B.shiftKey
						} else {
							if (B.modifiers) {
								q = !!(B.modifiers & 4)
							}
						}
						if (!q) {
							this.editchar = this.editchar.toLowerCase()
						}
						x = true
					} else {
						if (F >= 96 && F <= 105) {
							this.editchar = F - 96;
							this.editchar = this.editchar.toString();
							x = true
						}
					}
					var p = a(".jqx-grid").length;
					x = x && (p == 1 || (p > 1 && v.focused));
					var j = a.data(document.body, "jqxgrid.edit");
					if (j !== undefined && j !== "") {
						if (F === 13 || x) {
							if (j != v.element.id) {
								return true
							}
						}
					}
				}
				if (F == 13 || x) {
					if (v.getselectedrowindex) {
						var g = v.getselectedrowindex();
						switch (v.selectionmode) {
							case"singlerow":
							case"multiplerows":
							case"multiplerowsextended":
								if (g >= 0) {
									var t = "";
									for (var z = 0; z < v.columns.records.length; z++) {
										var e = v.getcolumnat(z);
										if (e.editable) {
											t = e.datafield;
											break
										}
									}
									v.begincelledit(g, t)
								}
								break;
							case"singlecell":
							case"multiplecells":
							case"multiplecellsextended":
								var c = v.getselectedcell();
								if (c != null) {
									var e = v._getcolumnbydatafield(c.datafield);
									if (e.columntype != "checkbox") {
										v.begincelledit(c.rowindex, c.datafield)
									}
								}
								break;
							case"multiplecellsadvanced":
								var c = v.getselectedcell();
								if (c != null) {
									if (F == 13) {
										if (v.selectcell) {
											if (c.rowindex + 1 < v.dataview.totalrecords) {
												var d = this.getrowvisibleindex(c.rowindex);
												var E = this.dataview.loadedrecords[d + 1];
												if (E) {
													this.clearselection(false);
													this.selectcell(this.getboundindex(E), c.datafield);
													var c = this.getselectedcell();
													this.ensurecellvisible(E.visibleindex, c.datafield)
												}
											}
										}
									} else {
										if (v.editmode !== "selectedrow") {
											v.begincelledit(c.rowindex, c.datafield)
										}
									}
								}
								break
						}
						return false
					}
				}
				if (F == 46) {
					var f = v.getselectedcells();
					if (v.selectionmode.indexOf("cell") == -1) {
						if (v._getcellsforcopypaste) {
							f = v._getcellsforcopypaste()
						}
					}
					if (f != null && f.length > 0) {
						for (var o = 0; o < f.length; o++) {
							var c = f[o];
							if (!c.datafield) {
								continue
							}
							var e = v.getcolumn(c.datafield);
							var C = v.getcellvalue(c.rowindex, c.datafield);
							if (C !== "" && e.editable && v.enablekeyboarddelete) {
								var i = null;
								if (e.columntype == "checkbox") {
									if (!e.threestatecheckbox) {
										i = false
									}
								}
								if (e.cellbeginedit) {
									var b = e.cellbeginedit(c.rowindex, e.datafield, e.columntype, i);
									if (b == false) {
										return false
									}
								}
								v._raiseEvent(17, {rowindex: c.rowindex, datafield: c.datafield, value: C});
								if (o == f.length - 1) {
									v.setcellvalue(c.rowindex, c.datafield, i, true);
									if (e.displayfield != e.datafield) {
										v.setcellvalue(c.rowindex, e.displayfield, i, true)
									}
								} else {
									v.setcellvalue(c.rowindex, c.datafield, i, false);
									if (e.displayfield != e.datafield) {
										v.setcellvalue(c.rowindex, e.displayfield, i, true)
									}
								}
								if (e.cellendedit) {
									var A = e.cellendedit(c.rowindex, e.datafield, e.columntype, i)
								}
								v._raiseEvent(18, {rowindex: c.rowindex, datafield: c.datafield, oldvalue: C, value: i})
							}
						}
						this.dataview.updateview();
						this._renderrows(this.virtualsizeinfo);
						return false
					}
				}
				if (F == 32) {
					var c = v.getselectedcell();
					if (c != null) {
						var e = v.getcolumn(c.datafield);
						if (e.columntype == "checkbox" && e.editable) {
							var l = !v.getcellvalue(c.rowindex, c.datafield);
							if (e.cellbeginedit) {
								var b = e.cellbeginedit(c.rowindex, e.datafield, e.columntype, !l);
								if (b == false) {
									return false
								}
							}
							v._raiseEvent(17, {
								rowindex: c.rowindex,
								datafield: c.datafield,
								value: !l,
								columntype: "checkbox"
							});
							v.setcellvalue(c.rowindex, c.datafield, l, true);
							v._raiseEvent(18, {
								rowindex: c.rowindex,
								datafield: c.datafield,
								oldvalue: !l,
								value: l,
								columntype: "checkbox"
							});
							return false
						}
					}
				}
			}
			return true
		}, begincelledit: function (m, e, k, g, c) {
			var f = this.getcolumn(e);
			this._cellscache = new Array();
			if (e == null) {
				return
			}
			if (f.columntype == "number" || f.columntype == "button") {
				return
			}
			if (this.groupable) {
				if (this.groups.indexOf(e) >= 0) {
					return
				}
				if (this.groups.indexOf(f.displayfield) >= 0) {
					return
				}
			}
			if (this.editrow != undefined) {
				return
			}
			if (this.editcell) {
				if (this.editcell.row == m && this.editcell.column == e) {
					return true
				}
				if (this.editmode === "selectedrow") {
					if (this.editcell.row == m) {
						return
					}
				}
				var d = this.endcelledit(this.editcell.row, this.editcell.column, false, true, false);
				if (false == d) {
					return
				}
			}
			var h = f.columntype == "checkbox" || f.columntype == "button";
			this.host.removeClass("jqx-disableselect");
			this.content.removeClass("jqx-disableselect");
			if (f.editable) {
				if (f.cellbeginedit) {
					var j = this.getcell(m, e);
					var l = f.cellbeginedit(m, e, f.columntype, j != null ? j.value : null);
					if (l == false) {
						return
					}
				}
				var i = this.getrowvisibleindex(m);
				this.editcell = this.getcell(m, e);
				if (this.editcell) {
					this.editcell.visiblerowindex = i;
					if (!this.editcell.editing) {
						if (!h) {
							this.editcell.editing = true
						}
						this.editcell.columntype = f.columntype;
						this.editcell.defaultvalue = k;
						if (f.defaultvalue != undefined) {
							this.editcell.defaultvalue = f.defaultvalue
						}
						this.editcell.init = true;
						if (f.columntype != "checkbox" && this.editmode != "selectedrow") {
							this._raiseEvent(17, {
								rowindex: m,
								datafield: f.datafield,
								value: this.editcell.value,
								columntype: f.columntype
							})
						}
						a.data(document.body, "jqxgrid.edit", this.element.id);
						if (!h) {
							var b = this.getrowvisibleindex(m);
							if (g !== false) {
								//upd. 15.03.21 ????????????????????????????????, ??.??. ???????? ?????????? ?????????????? ???????????? ?????????????? ?? ???????????? ??????????
								//this.ensurecellvisible(b, f.datafield)
							}
							if (c !== false) {
								this._renderrows(this.virtualsizeinfo)
							}
						}
						if (this.editcell) {
							this.editcell.init = false;
							return true
						}
					}
				}
			} else {
				if (!this.editcell) {
					return
				}
				this.editcell.editor = null;
				this.editcell.editing = false;
				if (c !== false) {
					this._renderrows(this.virtualsizeinfo)
				}
				this.editcell = null
			}
		}, getScrollTop: function () {
			if (this._py) {
				return pageYOffset
			}
			this._py = typeof pageYOffset != "undefined";
			if (this._py) {
				return pageYOffset
			} else {
				var c = document.body;
				var b = document.documentElement;
				b = (b.clientHeight) ? b : c;
				return b.scrollTop
			}
		}, getScrollLeft: function () {
			if (typeof pageXOffset != "undefined") {
				return pageXOffset
			} else {
				var c = document.body;
				var b = document.documentElement;
				b = (b.clientHeight) ? b : c;
				return b.scrollLeft
			}
		}, endcelledit: function (g, m, i, e, n) {
			if (g == undefined || m == undefined) {
				if (this.editcell) {
					g = this.editcell.row;
					m = this.editcell.column
				}
				if (i == undefined) {
					i = true
				}
			}
			if (!this.editcell) {
				return
			}
			var d = this.getcolumn(m);
			var t = this;
			if (t.editmode === "selectedrow") {
				this.endrowedit(g, i);
				return
			}
			var s = function () {
				if (n != false) {
					if (t.isTouchDevice()) {
						return
					}
					if (!t.isNestedGrid) {
						var u = t.getScrollTop();
						var w = t.getScrollLeft();
						try {
							t.element.focus();
							t.content.focus();
							if (u != t.getScrollTop()) {
								window.scrollTo(w, u)
							}
							setTimeout(function () {
								t.element.focus();
								t.content.focus();
								if (u != t.getScrollTop()) {
									window.scrollTo(w, u)
								}
							}, 10)
						} catch (v) {
						}
					}
				}
			};
			if (d.columntype == "checkbox" || d.columntype == "button") {
				if (this.editcell) {
					this.editcell.editor = null;
					this.editcell.editing = false;
					this.editcell = null
				}
				return true
			}
			var h = this._geteditorvalue(d);
			var f = function (v) {
				v._hidecelleditor();
				if (d.cellendedit) {
					d.cellendedit(g, m, d.columntype, v.editcell.value, h)
				}
				v.editchar = null;
				if (d.displayfield != d.datafield) {
					var u = v.getcellvalue(v.editcell.row, d.displayfield);
					var w = v.editcell.value;
					oldvalue = {value: w, label: u}
				} else {
					oldvalue = v.editcell.value
				}
				v._raiseEvent(18, {
					rowindex: g,
					datafield: m,
					displayfield: d.displayfield,
					oldvalue: h,
					value: h,
					columntype: d.columntype
				});
				v.editcell.editor = null;
				v.editcell.editing = false;
				v.editcell = null;
				if (e || e == undefined) {
					v._renderrows(v.virtualsizeinfo)
				}
				s();
				if (!v.enablebrowserselection) {
					v.host.addClass("jqx-disableselect");
					v.content.addClass("jqx-disableselect")
				}
			};
			if (i) {
				f(this);
				return false
			}
			if (this.validationpopup) {
				this.validationpopup.hide();
				this.validationpopuparrow.hide()
			}
			if (d.cellvaluechanging) {
				var b = d.cellvaluechanging(g, m, d.columntype, this.editcell.value, h);
				if (b != undefined) {
					h = b
				}
			}
			if (d.validation) {
				var c = this.getcell(g, m);
				try {
					var o = d.validation(c, h);
					var k = this.gridlocalization.validationstring;
					if (o.message != undefined) {
						k = o.message
					}
					var l = typeof o == "boolean" ? o : o.result;
					if (!l) {
						if (o.showmessage == undefined || o.showmessage == true) {
							this._showvalidationpopup(g, m, k)
						}
						this.editcell.validated = false;
						return false
					}
				} catch (q) {
					this._showvalidationpopup(g, m, this.gridlocalization.validationstring);
					this.editcell.validated = false;
					return false
				}
			}
			if (d.displayfield != d.datafield) {
				var j = this.getcellvalue(this.editcell.row, d.displayfield);
				var p = this.editcell.value;
				oldvalue = {value: p, label: j}
			} else {
				oldvalue = this.editcell.value
			}
			if (d.cellendedit) {
				var r = d.cellendedit(g, m, d.columntype, this.editcell.value, h);
				if (r == false) {
					this._raiseEvent(18, {
						rowindex: g,
						datafield: m,
						displayfield: d.displayfield,
						oldvalue: oldvalue,
						value: oldvalue,
						columntype: d.columntype
					});
					f(this);
					return false
				}
			}
			this._raiseEvent(18, {
				rowindex: g,
				datafield: m,
				displayfield: d.displayfield,
				oldvalue: oldvalue,
				value: h,
				columntype: d.columntype
			});
			this._hidecelleditor(false);
			if (this.editcell != undefined) {
				this.editcell.editor = null;
				this.editcell.editing = false
			}
			this.editcell = null;
			this.editchar = null;
			this.setcellvalue(g, m, h, e);
			if (!this.enablebrowserselection) {
				this.host.addClass("jqx-disableselect");
				this.content.addClass("jqx-disableselect")
			}
			s();
			a.data(document.body, "jqxgrid.edit", "");
			return true
		}, beginrowedit: function (c) {
			var b = this;
			var d = -1;
			b._oldselectedrow = c;
			this._cellscache = new Array();
			a.each(this.columns.records, function (f, g) {
				if (b.editable && this.editable) {
					var e = b.getcell(c, this.datafield);
					b.begincelledit(c, this.datafield, null, false, false);
					b._raiseEvent(17, {
						rowindex: c,
						datafield: this.datafield,
						value: e.value,
						columntype: this.columntype
					})
				}
			});
			if (b.editcell) {
				b.editcell.init = true
			}
			this._renderrows(this.virtualsizeinfo)
		}, endrowedit: function (k, n) {
			var z = this;
			if (!this.editcell) {
				return false
			}
			if (this.editcell.editor == undefined) {
				return false
			}
			var y = function () {
				if (focus != false) {
					if (z.isTouchDevice()) {
						return
					}
					if (!z.isNestedGrid) {
						var i = z.getScrollTop();
						var B = z.getScrollLeft();
						try {
							z.element.focus();
							z.content.focus();
							if (i != z.getScrollTop()) {
								window.scrollTo(B, i)
							}
							setTimeout(function () {
								z.element.focus();
								z.content.focus();
								if (i != z.getScrollTop()) {
									window.scrollTo(B, i)
								}
							}, 10)
						} catch (A) {
						}
					}
				}
			};
			var h = false;
			var d = {};
			if (this.validationpopup) {
				this.validationpopup.hide();
				this.validationpopuparrow.hide()
			}
			for (var x = 0; x < this.columns.records.length; x++) {
				var e = this.columns.records[x];
				if (!e.editable) {
					continue
				}
				if (e.columntype == "checkbox") {
					continue
				}
				var l = this._geteditorvalue(e);
				var g = function (B) {
					B._hidecelleditor();
					var A = B.getcellvalue(B.editcell.row, e.displayfield);
					if (e.cellendedit) {
						e.cellendedit(k, r, e.columntype, A, l)
					}
					B.editchar = null;
					if (e.displayfield != e.datafield) {
						var i = B.getcellvalue(B.editcell.row, e.displayfield);
						var C = A;
						m = {value: C, label: i}
					} else {
						m = A
					}
					B._raiseEvent(18, {
						rowindex: k,
						datafield: r,
						displayfield: e.displayfield,
						oldvalue: A,
						value: A,
						columntype: e.columntype
					});
					B.editcell.editing = false
				};
				if (n) {
					g(this);
					continue
				}
				if (e.cellvaluechanging) {
					var m = this.getcellvalue(this.editcell.row, e.displayfield);
					var b = e.cellvaluechanging(k, r, e.columntype, m, l);
					if (b != undefined) {
						l = b
					}
				}
				var r = e.datafield;
				if (e.validation) {
					var c = this.getcell(k, e.datafield);
					try {
						var s = e.validation(c, l);
						var p = this.gridlocalization.validationstring;
						if (s.message != undefined) {
							p = s.message
						}
						var q = typeof s == "boolean" ? s : s.result;
						if (!q) {
							if (s.showmessage == undefined || s.showmessage == true) {
								this._showvalidationpopup(k, r, p)
							}
							h = true;
							this.editcell[e.datafield].validated = false;
							continue
						}
					} catch (v) {
						this._showvalidationpopup(k, r, this.gridlocalization.validationstring);
						this.editcell[e.datafield].validated = false;
						h = true;
						continue
					}
				}
				if (e.displayfield != e.datafield) {
					var o = this.getcellvalue(this.editcell.row, e.displayfield);
					var t = this.editcell.value;
					m = {value: t, label: o}
				} else {
					m = this.getcellvalue(this.editcell.row, e.displayfield)
				}
				d[e.datafield] = {newvalue: l, oldvalue: m}
			}
			var u = {};
			if (!h) {
				this._hidecelleditor(false);
				for (var x = 0; x < this.columns.records.length; x++) {
					var e = this.columns.records[x];
					var r = e.datafield;
					if (!e.editable) {
						continue
					}
					if (e.columntype == "checkbox") {
						var l = this.getcellvalue(k, e.displayfield);
						this._raiseEvent(18, {
							rowindex: k,
							datafield: e.datafield,
							displayfield: e.displayfield,
							oldvalue: l,
							value: l,
							columntype: e.columntype
						});
						continue
					}
					if (!d[e.datafield]) {
						continue
					}
					var l = d[e.datafield].newvalue;
					var m = d[e.datafield].oldvalue;
					if (e.cellendedit) {
						var w = e.cellendedit(k, r, e.columntype, m, l);
						if (w == false) {
							this._raiseEvent(18, {
								rowindex: k,
								datafield: r,
								displayfield: e.displayfield,
								oldvalue: m,
								value: m,
								columntype: e.columntype
							});
							g(this);
							continue
						}
					}
					this._raiseEvent(18, {
						rowindex: k,
						datafield: e.datafield,
						displayfield: e.displayfield,
						oldvalue: m,
						value: l,
						columntype: e.columntype
					});
					u[e.datafield] = l
				}
				var j = this.getrowid(k);
				var f = this.getrowdata(k);
				a.each(u, function (i, B) {
					if (B && B.label != undefined) {
						var A = z.getcolumn(i);
						f[A.displayfield] = B.label;
						f[A.datafield] = B.value
					} else {
						f[i] = B
					}
				});
				if (!this.enablebrowserselection) {
					this.host.addClass("jqx-disableselect");
					this.content.addClass("jqx-disableselect")
				}
				a.data(document.body, "jqxgrid.edit", "");
				this.editcell = null;
				this.editchar = null;
				this.updaterow(j, f)
			}
			return h
		}, _selection: function (b) {
			if ("selectionStart" in b[0]) {
				var g = b[0];
				var h = g.selectionEnd - g.selectionStart;
				return {start: g.selectionStart, end: g.selectionEnd, length: h, text: g.value}
			} else {
				var d = document.selection.createRange();
				if (d == null) {
					return {start: 0, end: g.value.length, length: 0}
				}
				var c = b[0].createTextRange();
				var f = c.duplicate();
				c.moveToBookmark(d.getBookmark());
				f.setEndPoint("EndToStart", c);
				var h = d.text.length;
				return {start: f.text.length, end: f.text.length + d.text.length, length: h, text: d.text}
			}
		}, _setSelection: function (e, b, d) {
			if ("selectionStart" in d[0]) {
				d[0].focus();
				d[0].setSelectionRange(e, b)
			} else {
				var c = d[0].createTextRange();
				c.collapse(true);
				c.moveEnd("character", b);
				c.moveStart("character", e);
				c.select()
			}
		}, findRecordIndex: function (g, c, b) {
			var b = b;
			if (c) {
				var e = b.length;
				for (var h = 0; h < e; h++) {
					var f = b[h];
					var d = f.label;
					if (g == d) {
						return h
					}
				}
			}
			return -1
		}, _destroyeditors: function () {
			var b = this;
			a.each(this.columns.records, function (f, j) {
				var c = a.trim(this.datafield).split(" ").join("");
				switch (this.columntype) {
					case"dropdownlist":
						var g = b.editors["dropdownlist_" + c];
						if (g) {
							g.jqxDropDownList("destroy");
							b.editors["dropdownlist_" + c] = null
						}
						break;
					case"combobox":
						var k = b.editors["combobox_" + c];
						if (k) {
							k.jqxComboBox("destroy");
							b.editors["combobox_" + c] = null
						}
						break;
					case"datetimeinput":
						var d = b.editors["datetimeinput_" + this.datafield];
						if (d) {
							d.jqxDateTimeInput("destroy");
							b.editors["datetimeinput_" + c] = null
						}
						break;
					case"numberinput":
						var e = b.editors["numberinput_" + c];
						if (e) {
							e.jqxNumberInput("destroy");
							b.editors["numberinput_" + c] = null
						}
						break;
					case"custom":
					case"template":
						if (this.destroycustomeditor) {
							this.destroycustomeditor(b.editors["customeditor_" + c]);
							b.editors["customeditor_" + c] = null
						}
						if (this.destrotemplateeditor) {
							var m = b.getrows.length();
							for (var l = 0; l < m; l++) {
								this.destrotemplateeditor(b.editors["templateeditor_" + c + "_" + l]);
								b.editors["templateeditor_" + c + "_" + l] = null
							}
						}
						break;
					case"textbox":
					default:
						var h = b.editors["textboxeditor_" + c];
						if (h) {
							b.removeHandler(h, "keydown");
							b.editors["textbox_" + c] = null
						}
						break
				}
			});
			b.editors = new Array()
		}, _showcelleditor: function (q, G, n, J, w) {
			if (n == undefined) {
				return
			}
			if (this.editcell == null) {
				return
			}
			if (G.columntype == "checkbox" && G.editable) {
				return
			}
			if (w == undefined) {
				w = true
			}
			if (this.editmode == "selectedrow") {
				this.editchar = "";
				w = false
			}
			var E = G.datafield;
			var g = a(n);
			var s = this;
			var d = this.editcell.editor;
			var H = this.getcellvalue(q, E);
			var C = this.getcelltext(q, E);
			var j = this.hScrollInstance;
			var t = j.value;
			var i = parseInt(t);
			var I = this.columns.records.indexOf(G);
			this.editcell.element = n;
			if (this.editcell.validated == false) {
				this._showvalidationpopup()
			}
			var l = function (O) {
				if (s.hScrollInstance.isScrolling() || s.vScrollInstance.isScrolling()) {
					return
				}
				if (!w) {
					return
				}
				if (s.isTouchDevice()) {
					return
				}
				if (!s.isNestedGrid) {
					O.focus()
				}
				if (s.gridcontent[0].scrollTop != 0) {
					s.scrolltop(Math.abs(s.gridcontent[0].scrollTop));
					s.gridcontent[0].scrollTop = 0
				}
				if (s.gridcontent[0].scrollLeft != 0) {
					s.gridcontent[0].scrollLeft = 0
				}
			};
			switch (G.columntype) {
				case"dropdownlist":
					if (this.host.jqxDropDownList) {
						n.innerHTML = "";
						var D = a.trim(G.datafield).split(" ").join("");
						var A = a.trim(G.displayfield).split(" ").join("");
						if (D.indexOf(".") != -1) {
							D = D.replace(".", "")
						}
						if (A.indexOf(".") != -1) {
							A = A.replace(".", "")
						}
						var k = this.editors["dropdownlist_" + D];
						d = k == undefined ? a("<div style='border-radius: 0px; -moz-border-radius: 0px; -webkit-border-radius: 0px; z-index: 99999; top: 0px; left: 0px; position: absolute;' id='dropdownlisteditor'></div>") : k;
						d.css("top", a(n).parent().position().top);
						if (this.oldhscroll) {
							d.css("left", -i + parseInt(a(n).position().left))
						} else {
							d.css("left", parseInt(a(n).position().left))
						}
						if (G.pinned) {
							d.css("left", i + parseInt(a(n).position().left))
						}
						if (k == undefined) {
							d.prependTo(this.table);
							d[0].id = "dropdownlisteditor" + this.element.id + D;
							var f = this.source._source ? true : false;
							var x = null;
							if (!f) {
								x = new a.jqx.dataAdapter(this.source, {
									autoBind: false,
									uniqueDataFields: [A],
									async: false,
									autoSort: true,
									autoSortField: A
								})
							} else {
								var o = {localdata: this.source.records, datatype: this.source.datatype, async: false};
								x = new a.jqx.dataAdapter(o, {
									autoBind: false,
									async: false,
									uniqueDataFields: [A],
									autoSort: true,
									autoSortField: A
								})
							}
							var u = !G.createeditor ? true : false;
							d.jqxDropDownList({
								enableBrowserBoundsDetection: true,
								keyboardSelection: false,
								source: x,
								rtl: this.rtl,
								autoDropDownHeight: u,
								theme: this.theme,
								width: g.width() - 2,
								height: g.height() - 2,
								displayMember: A,
								valueMember: E
							});
							this.editors["dropdownlist_" + D] = d;
							if (G.createeditor) {
								G.createeditor(q, H, d)
							}
						}
						if (G._requirewidthupdate) {
							d.jqxDropDownList({width: g.width() - 2})
						}
						var c = d.jqxDropDownList("listBox").visibleItems;
						if (!G.createeditor) {
							if (c.length < 8) {
								d.jqxDropDownList("autoDropDownHeight", true)
							} else {
								d.jqxDropDownList("autoDropDownHeight", false)
							}
						}
						var H = this.getcellvalue(q, A);
						var z = this.findRecordIndex(H, A, c);
						if (J) {
							if (H != "") {
								d.jqxDropDownList("selectIndex", z, true)
							} else {
								d.jqxDropDownList("selectIndex", -1)
							}
						}
						if (this.editcell.defaultvalue != undefined) {
							d.jqxDropDownList("selectIndex", this.editcell.defaultvalue, true)
						}
						if (w) {
							d.jqxDropDownList("focus")
						}
					}
					break;
				case"combobox":
					if (this.host.jqxComboBox) {
						n.innerHTML = "";
						var D = a.trim(G.datafield).split(" ").join("");
						var A = a.trim(G.displayfield).split(" ").join("");
						if (D.indexOf(".") != -1) {
							D = D.replace(".", "")
						}
						if (A.indexOf(".") != -1) {
							A = A.replace(".", "")
						}
						var r = this.editors["combobox_" + D];
						d = r == undefined ? a("<div style='border-radius: 0px; -moz-border-radius: 0px; -webkit-border-radius: 0px; z-index: 99999; top: 0px; left: 0px; position: absolute;' id='comboboxeditor'></div>") : r;
						d.css("top", a(n).parent().position().top);
						if (this.oldhscroll) {
							d.css("left", -i + parseInt(a(n).position().left))
						} else {
							d.css("left", parseInt(a(n).position().left))
						}
						if (G.pinned) {
							d.css("left", i + parseInt(a(n).position().left))
						}
						if (r == undefined) {
							d.prependTo(this.table);
							d[0].id = "comboboxeditor" + this.element.id + D;
							var f = this.source._source ? true : false;
							var x = null;
							if (!f) {
								x = new a.jqx.dataAdapter(this.source, {
									autoBind: false,
									uniqueDataFields: [A],
									async: false,
									autoSort: true,
									autoSortField: A
								})
							} else {
								var o = {localdata: this.source.records, datatype: this.source.datatype, async: false};
								x = new a.jqx.dataAdapter(o, {
									autoBind: false,
									async: false,
									uniqueDataFields: [A],
									autoSort: true,
									autoSortField: A
								})
							}
							var u = !G.createeditor ? true : false;
							d.jqxComboBox({
								enableBrowserBoundsDetection: true,
								keyboardSelection: false,
								source: x,
								rtl: this.rtl,
								autoDropDownHeight: u,
								theme: this.theme,
								width: g.width() - 2,
								height: g.height() - 2,
								displayMember: A,
								valueMember: E
							});
							d.removeAttr("tabindex");
							d.find("div").removeAttr("tabindex");
							this.editors["combobox_" + D] = d;
							if (G.createeditor) {
								G.createeditor(q, H, d)
							}
						}
						if (G._requirewidthupdate) {
							d.jqxComboBox({width: g.width() - 2})
						}
						var c = d.jqxComboBox("listBox").visibleItems;
						if (!G.createeditor) {
							if (c.length < 8) {
								d.jqxComboBox("autoDropDownHeight", true)
							} else {
								d.jqxComboBox("autoDropDownHeight", false)
							}
						}
						var H = this.getcellvalue(q, A);
						var z = this.findRecordIndex(H, A, c);
						if (J) {
							if (H != "") {
								d.jqxComboBox("selectIndex", z, true);
								d.jqxComboBox("val", H)
							} else {
								d.jqxComboBox("selectIndex", -1);
								d.jqxComboBox("val", H)
							}
						}
						if (this.editcell.defaultvalue != undefined) {
							d.jqxComboBox("selectIndex", this.editcell.defaultvalue, true)
						}
						if (this.editchar && this.editchar.length > 0) {
							d.jqxComboBox("input").val(this.editchar)
						}
						if (w) {
							setTimeout(function () {
								l(d.jqxComboBox("input"));
								d.jqxComboBox("_setSelection", 0, 0);
								if (s.editchar) {
									d.jqxComboBox("_setSelection", 1, 1);
									s.editchar = null
								} else {
									var O = d.jqxComboBox("input").val();
									d.jqxComboBox("_setSelection", 0, O.length)
								}
							}, 10)
						}
					}
					break;
				case"datetimeinput":
					if (this.host.jqxDateTimeInput) {
						n.innerHTML = "";
						var D = a.trim(G.datafield).split(" ").join("");
						if (D.indexOf(".") != -1) {
							D = D.replace(".", "")
						}
						var v = this.editors["datetimeinput_" + D];
						d = v == undefined ? a("<div style='border-radius: 0px; -moz-border-radius: 0px; -webkit-border-radius: 0px; z-index: 99999; top: 0px; left: 0px; position: absolute;' id='datetimeeditor'></div>") : v;
						d.show();
						d.css("top", a(n).parent().position().top);
						if (this.oldhscroll) {
							d.css("left", -i + parseInt(a(n).position().left))
						} else {
							d.css("left", parseInt(a(n).position().left))
						}
						if (G.pinned) {
							d.css("left", i + parseInt(a(n).position().left))
						}
						if (v == undefined) {
							d.prependTo(this.table);
							d[0].id = "datetimeeditor" + this.element.id + D;
							var F = {calendar: this.gridlocalization};
							d.jqxDateTimeInput({
								enableBrowserBoundsDetection: true,
								localization: F,
								_editor: true,
								theme: this.theme,
								rtl: this.rtl,
								width: g.width(),
								height: g.height(),
								formatString: G.cellsformat
							});
							this.editors["datetimeinput_" + D] = d;
							if (G.createeditor) {
								G.createeditor(q, H, d)
							}
						}
						if (G._requirewidthupdate) {
							d.jqxDateTimeInput({width: g.width() - 2})
						}
						if (J) {
							if (H != "" && H != null) {
								var K = new Date(H);
								if (K == "Invalid Date") {
									if (this.source.getvaluebytype) {
										K = this.source.getvaluebytype(H, {name: G.datafield, type: "date"})
									}
								}
								d.jqxDateTimeInput("setDate", K)
							} else {
								d.jqxDateTimeInput("setDate", null)
							}
							if (this.editcell.defaultvalue != undefined) {
								d.jqxDateTimeInput("setDate", this.editcell.defaultvalue)
							}
						}
						if (w) {
							setTimeout(function () {
								l(d.jqxDateTimeInput("dateTimeInput"))
							}, 10)
						}
					}
					break;
				case"numberinput":
					if (this.host.jqxNumberInput) {
						n.innerHTML = "";
						var D = a.trim(G.datafield).split(" ").join("");
						if (D.indexOf(".") != -1) {
							D = D.replace(".", "")
						}
						var M = this.editors["numberinput_" + D];
						d = M == undefined ? a("<div style='border-radius: 0px; -moz-border-radius: 0px; -webkit-border-radius: 0px; z-index: 99999; top: 0px; left: 0px; position: absolute;' id='numbereditor'></div>") : M;
						d.show();
						d.css("top", a(n).parent().position().top);
						if (this.oldhscroll) {
							d.css("left", -i + parseInt(a(n).position().left))
						} else {
							d.css("left", parseInt(a(n).position().left))
						}
						if (G.pinned) {
							d.css("left", i + parseInt(a(n).position().left))
						}
						if (M == undefined) {
							d.prependTo(this.table);
							d[0].id = "numbereditor" + this.element.id + D;
							var m = "";
							var y = "left";
							var L = 2;
							if (G.cellsformat) {
								if (G.cellsformat.indexOf("c") != -1) {
									m = this.gridlocalization.currencysymbol;
									y = this.gridlocalization.currencysymbolposition;
									if (y == "before") {
										y = "left"
									} else {
										y = "right"
									}
									if (G.cellsformat.length > 1) {
										L = parseInt(G.cellsformat.substring(1), 10)
									}
								} else {
									if (G.cellsformat.indexOf("p") != -1) {
										m = this.gridlocalization.percentsymbol;
										y = "right";
										if (G.cellsformat.length > 1) {
											L = parseInt(G.cellsformat.substring(1), 10)
										}
									}
								}
							} else {
								L = 0
							}
							d.jqxNumberInput({
								decimalSeparator: this.gridlocalization.decimalseparator,
								decimalDigits: L,
								inputMode: "simple",
								theme: this.theme,
								rtl: this.rtl,
								width: g.width() - 1,
								height: g.height() - 1,
								spinButtons: true,
								symbol: m,
								symbolPosition: y
							});
							this.editors["numberinput_" + D] = d;
							if (G.createeditor) {
								G.createeditor(q, H, d)
							}
						}
						if (G._requirewidthupdate) {
							d.jqxNumberInput({width: g.width() - 2})
						}
						if (J) {
							if (H != "" && H != null) {
								var N = H;
								d.jqxNumberInput("setDecimal", N)
							} else {
								d.jqxNumberInput("setDecimal", 0)
							}
							if (this.editcell.defaultvalue != undefined) {
								d.jqxNumberInput("setDecimal", this.editcell.defaultvalue)
							}
							if (this.editchar && this.editchar.length > 0) {
								var p = parseInt(this.editchar);
								if (!isNaN(p)) {
									d.jqxNumberInput("setDecimal", p)
								}
							}
							if (w) {
								setTimeout(function () {
									l(d.jqxNumberInput("numberInput"));
									d.jqxNumberInput("_setSelectionStart", 0);
									if (s.editchar) {
										if (G.cellsformat.length > 0) {
											d.jqxNumberInput("_setSelectionStart", 2)
										} else {
											d.jqxNumberInput("_setSelectionStart", 1)
										}
										s.editchar = null
									} else {
										var O = d.jqxNumberInput("spinButtons");
										if (O) {
											var P = d.jqxNumberInput("numberInput").val();
											s._setSelection(d.jqxNumberInput("numberInput")[0], P.length, P.length)
										} else {
											var P = d.jqxNumberInput("numberInput").val();
											s._setSelection(d.jqxNumberInput("numberInput")[0], 0, P.length)
										}
									}
								}, 10)
							}
						}
					}
					break;
				case"custom":
					n.innerHTML = "";
					var D = a.trim(G.datafield).split(" ").join("");
					if (D.indexOf(".") != -1) {
						D = D.replace(".", "")
					}
					var B = this.editors["customeditor_" + D + "_" + q];
					d = B == undefined ? a("<div style='overflow: hidden; border-radius: 0px; -moz-border-radius: 0px; -webkit-border-radius: 0px; z-index: 99999; top: 0px; left: 0px; position: absolute;' id='customeditor'></div>") : B;
					d.show();
					d.css("top", a(n).parent().position().top);
					if (this.oldhscroll) {
						d.css("left", -i + parseInt(a(n).position().left))
					} else {
						d.css("left", parseInt(a(n).position().left))
					}
					if (G.pinned) {
						d.css("left", i + parseInt(a(n).position().left))
					}
					if (B == undefined) {
						d.prependTo(this.table);
						d[0].id = "customeditor" + this.element.id + D + "_" + q;
						this.editors["customeditor_" + D + "_" + q] = d;
						var b = g.width() - 1;
						var e = g.height() - 1;
						d.width(b);
						d.height(e);
						if (G.createeditor) {
							G.createeditor(q, H, d, C, b, e, this.editchar)
						}
					}
					if (G._requirewidthupdate) {
						d.width(g.width() - 2)
					}
					break;
				case"template":
					n.innerHTML = "";
					var D = a.trim(G.datafield).split(" ").join("");
					if (D.indexOf(".") != -1) {
						D = D.replace(".", "")
					}
					var h = this.editors["templateeditor_" + D];
					d = h == undefined ? a("<div style='overflow: hidden; border-radius: 0px; -moz-border-radius: 0px; -webkit-border-radius: 0px; z-index: 99999; top: 0px; left: 0px; position: absolute;' id='templateeditor'></div>") : h;
					d.show();
					d.css("top", a(n).parent().position().top);
					if (this.oldhscroll) {
						d.css("left", -i + parseInt(a(n).position().left))
					} else {
						d.css("left", parseInt(a(n).position().left))
					}
					if (G.pinned) {
						d.css("left", i + parseInt(a(n).position().left))
					}
					if (h == undefined) {
						d.prependTo(this.table);
						d[0].id = "templateeditor" + this.element.id + D;
						this.editors["templateeditor_" + D] = d;
						var b = g.width() - 1;
						var e = g.height() - 1;
						d.width(b);
						d.height(e);
						if (G.createeditor) {
							G.createeditor(q, H, d, C, b, e, this.editchar)
						}
					}
					if (G._requirewidthupdate) {
						d.width(g.width() - 2)
					}
					break;
				case"textbox":
				default:
					n.innerHTML = "";
					d = this.editors["textboxeditor_" + G.datafield] || a("<input autocomplete='off' autocorrect='off' autocapitalize='off' spellcheck='false' type='textbox' id='textboxeditor'/>");
					d[0].id = "textboxeditor" + this.element.id + G.datafield;
					d.appendTo(g);
					if (this.rtl) {
						d.css("direction", "rtl")
					}
					if (J || d[0].className == "") {
						d.addClass(this.toThemeProperty("jqx-input"));
						d.addClass(this.toThemeProperty("jqx-widget-content"));
						if (this.editchar && this.editchar.length > 0) {
							d.val(this.editchar)
						} else {
							if (G.cellsformat != "") {
								H = this.getcelltext(q, E)
							}
							if (H == undefined) {
								H = ""
							}
							d.val(H)
						}
						if (this.editcell.defaultvalue != undefined) {
							d.val(this.editcell.defaultvalue)
						}
						d.width(g.width() + 1);
						d.height(g.height() + 1);
						if (G.createeditor) {
							G.createeditor(q, H, d)
						}
						if (G.cellsformat != "") {
							if (G.cellsformat.indexOf("p") != -1 || G.cellsformat.indexOf("c") != -1 || G.cellsformat.indexOf("n") != -1 || G.cellsformat.indexOf("f") != -1) {
								if (!this.editors["textboxeditor_" + G.datafield]) {
									d.keydown(function (P) {
										var V = P.charCode ? P.charCode : P.keyCode ? P.keyCode : 0;
										var S = String.fromCharCode(V);
										var T = parseInt(S);
										if (isNaN(T)) {
											return true
										}
										if (s._selection(d).length > 0) {
											return true
										}
										var R = "";
										var Q = d.val();
										if (G.cellsformat.length > 1) {
											var U = parseInt(G.cellsformat.substring(1));
											if (isNaN(U)) {
												U = 0
											}
										} else {
											var U = 0
										}
										if (U > 0) {
											if (Q.indexOf(s.gridlocalization.decimalseparator) != -1) {
												if (s._selection(d).start > Q.indexOf(s.gridlocalization.decimalseparator)) {
													return true
												}
											}
										}
										for (var W = 0; W < Q.length - U; W++) {
											var O = Q.substring(W, W + 1);
											if (O.match(/^[0-9]+$/) != null) {
												R += O
											}
										}
										if (R.length >= 11) {
											return false
										}
									})
								}
							}
						}
					}
					this.editors["textboxeditor_" + G.datafield] = d;
					if (J) {
						if (w) {
							setTimeout(function () {
								l(d);
								if (s.editchar) {
									s._setSelection(d[0], 1, 1);
									s.editchar = null
								} else {
									s._setSelection(d[0], 0, d.val().length)
								}
							}, 25)
						}
					}
					break
			}
			if (J) {
				if (G.initeditor) {
					G.initeditor(q, H, d, C, this.editchar)
				}
			}
			if (d) {
				d[0].style.zIndex = 1 + n.style.zIndex;
				if (a.jqx.browser.msie && a.jqx.browser.version < 8) {
					d[0].style.zIndex = 1 + this.columns.records.length + n.style.zIndex
				}
				d.css("display", "block");
				this.editcell.editor = d;
				if (!this.editcell[E]) {
					this.editcell[E] = {};
					this.editcell[E].editor = d
				} else {
					this.editcell[E].editor = d
				}
			}
			if (s.isTouchDevice()) {
				return
			}
			setTimeout(function () {
				if (s.content) {
					s.content[0].scrollTop = 0;
					s.content[0].scrollLeft = 0
				}
				if (s.gridcontent) {
					s.gridcontent[0].scrollLeft = 0;
					s.gridcontent[0].scrollTop = 0
				}
			}, 10)
		}, _setSelection: function (d, g, b) {
			try {
				if ("selectionStart" in d) {
					d.setSelectionRange(g, b)
				} else {
					var c = d.createTextRange();
					c.collapse(true);
					c.moveEnd("character", b);
					c.moveStart("character", g);
					c.select()
				}
			} catch (e) {
				var f = e
			}
		}, _hideeditors: function () {
			if (this.editcells != null) {
				var b = this;
				for (var c in this.editcells) {
					b.editcell = b.editcells[c];
					b._hidecelleditor()
				}
			}
		}, _hidecelleditor: function (b) {
			if (!this.editcell) {
				return
			}
			if (this.editmode === "selectedrow") {
				for (var c = 0; c < this.columns.records.length; c++) {
					var e = this.columns.records[c];
					if (this.editcell[e.datafield] && this.editcell[e.datafield].editor) {
						this.editcell[e.datafield].editor.hide();
						var d = this.editcell[e.datafield].editor;
						switch (e.columntype) {
							case"dropdownlist":
								d.jqxDropDownList({closeDelay: 0});
								d.jqxDropDownList("hideListBox");
								d.jqxDropDownList({closeDelay: 300});
								break;
							case"combobox":
								d.jqxComboBox({closeDelay: 0});
								d.jqxComboBox("hideListBox");
								d.jqxComboBox({closeDelay: 300});
								break;
							case"datetimeinput":
								if (d.jqxDateTimeInput("isOpened")) {
									d.jqxDateTimeInput({closeDelay: 0});
									d.jqxDateTimeInput("hideCalendar");
									d.jqxDateTimeInput({closeDelay: 300})
								}
								break
						}
					}
				}
				if (this.validationpopup) {
					this.validationpopup.hide();
					this.validationpopuparrow.hide()
				}
				return
			}
			if (this.editcell.columntype == "checkbox") {
				return
			}
			if (this.editcell.editor) {
				this.editcell.editor.hide();
				switch (this.editcell.columntype) {
					case"dropdownlist":
						this.editcell.editor.jqxDropDownList({closeDelay: 0});
						this.editcell.editor.jqxDropDownList("hideListBox");
						this.editcell.editor.jqxDropDownList({closeDelay: 300});
						break;
					case"combobox":
						this.editcell.editor.jqxComboBox({closeDelay: 0});
						this.editcell.editor.jqxComboBox("hideListBox");
						this.editcell.editor.jqxComboBox({closeDelay: 300});
						break;
					case"datetimeinput":
						var f = this.editcell.editor;
						if (f.jqxDateTimeInput("isOpened")) {
							f.jqxDateTimeInput({closeDelay: 0});
							f.jqxDateTimeInput("hideCalendar");
							f.jqxDateTimeInput({closeDelay: 300})
						}
						break
				}
			}
			if (this.validationpopup) {
				this.validationpopup.hide();
				this.validationpopuparrow.hide()
			}
			if (!this.isNestedGrid) {
				if (b != false) {
					this.element.focus()
				}
			}
		}, _geteditorvalue: function (h) {
			var n = new String();
			if (!this.editcell) {
				return null
			}
			var k = this.editcell.editor;
			if (this.editmode == "selectedrow") {
				if (this.editcell[h.datafield]) {
					var k = this.editcell[h.datafield].editor
				}
			}
			if (k) {
				switch (h.columntype) {
					case"textbox":
					default:
						n = k.val();
						if (h.cellsformat != "") {
							var m = "string";
							var e = this.source.datafields || ((this.source._source) ? this.source._source.datafields : null);
							if (e) {
								var o = "";
								a.each(e, function () {
									if (this.name == h.displayfield) {
										if (this.type) {
											o = this.type
										}
										return false
									}
								});
								if (o) {
									m = o
								}
							}
							var i = m === "number" || m === "float" || m === "int" || m === "integer";
							var f = m === "date" || m === "time";
							if (i || (m === "string" && (h.cellsformat.indexOf("p") != -1 || h.cellsformat.indexOf("c") != -1 || h.cellsformat.indexOf("n") != -1 || h.cellsformat.indexOf("f") != -1))) {
								if (n === "" && h.nullable) {
									return ""
								}
								if (n.indexOf(this.gridlocalization.currencysymbol) > -1) {
									n = n.replace(this.gridlocalization.currencysymbol, "")
								}
								var l = function (v, t, u) {
									var r = v;
									if (t == u) {
										return v
									}
									var s = r.indexOf(t);
									while (s != -1) {
										r = r.replace(t, u);
										s = r.indexOf(t)
									}
									return r
								};
								n = l(n, this.gridlocalization.thousandsseparator, "");
								n = n.replace(this.gridlocalization.decimalseparator, ".");
								if (n.indexOf(this.gridlocalization.percentsymbol) > -1) {
									n = n.replace(this.gridlocalization.percentsymbol, "")
								}
								var d = "";
								for (var q = 0; q < n.length; q++) {
									var b = n.substring(q, q + 1);
									if (b === "-") {
										d += "-"
									}
									if (b === ".") {
										d += "."
									}
									if (b.match(/^[0-9]+$/) != null) {
										d += b
									}
								}
								n = d;
								n = n.replace(/ /g, "");
								n = new Number(n);
								if (isNaN(n)) {
									n = ""
								}
							}
							if (f || (m === "string" && (h.cellsformat.indexOf("H") != -1 || h.cellsformat.indexOf("m") != -1 || h.cellsformat.indexOf("M") != -1 || h.cellsformat.indexOf("y") != -1 || h.cellsformat.indexOf("h") != -1 || h.cellsformat.indexOf("d") != -1))) {
								if (n === "" && h.nullable) {
									return ""
								}
								var c = n;
								n = new Date(n);
								if (n == "Invalid Date" || n == null) {
									if (a.jqx.dataFormat) {
										n = a.jqx.dataFormat.tryparsedate(c, this.gridlocalization)
									}
									if (n == "Invalid Date" || n == null) {
										n = ""
									}
								}
							}
						}
						if (h.displayfield != h.datafield) {
							n = {label: n, value: n}
						}
						break;
					case"checkbox":
						if (k.jqxCheckBox) {
							n = k.jqxCheckBox("checked")
						}
						break;
					case"datetimeinput":
						if (k.jqxDateTimeInput) {
							k.jqxDateTimeInput({isEditing: false});
							k.jqxDateTimeInput("_validateValue");
							n = k.jqxDateTimeInput("getDate");
							if (n == null) {
								return null
							}
							n = new Date(n.toString());
							if (h.displayfield != h.datafield) {
								n = {label: n, value: n}
							}
						}
						break;
					case"dropdownlist":
						if (k.jqxDropDownList) {
							var g = k.jqxDropDownList("selectedIndex");
							var p = k.jqxDropDownList("listBox").getVisibleItem(g);
							if (h.displayfield != h.datafield) {
								if (p) {
									n = {label: p.label, value: p.value}
								} else {
									n = ""
								}
							} else {
								if (p) {
									n = p.label
								} else {
									n = ""
								}
							}
							if (n == null) {
								n = ""
							}
						}
						break;
					case"combobox":
						if (k.jqxComboBox) {
							n = k.jqxComboBox("val");
							if (h.displayfield != h.datafield) {
								var p = k.jqxComboBox("getSelectedItem");
								if (p != null) {
									n = {label: p.label, value: p.value}
								}
							}
							if (n == null) {
								n = ""
							}
						}
						break;
					case"numberinput":
						if (k.jqxNumberInput) {
							if (this.touchdevice) {
								k.jqxNumberInput("_doTouchHandling")
							}
							var j = k.jqxNumberInput("getDecimal");
							n = new Number(j);
							n = parseFloat(n);
							if (isNaN(n)) {
								n = 0
							}
							if (h.displayfield != h.datafield) {
								n = {label: n, value: n}
							}
						}
						break
				}
				if (h.geteditorvalue) {
					if (this.editmode == "selectedrow") {
						n = h.geteditorvalue(this.editcell.row, this.getcellvalue(this.editcell.row, h.datafield), k)
					} else {
						n = h.geteditorvalue(this.editcell.row, this.editcell.value, k)
					}
				}
			}
			return n
		}, hidevalidationpopups: function () {
			if (this.popups) {
				a.each(this.popups, function () {
					this.validation.remove();
					this.validationrow.remove()
				});
				this.popups = new Array()
			}
			if (this.validationpopup) {
				this.validationpopuparrow.hide();
				this.validationpopup.hide()
			}
		}, showvalidationpopup: function (o, d, p) {
			if (p == undefined) {
				var p = this.gridlocalization.validationstring
			}
			var n = a("<div style='z-index: 99999; top: 0px; left: 0px; position: absolute;'></div>");
			var m = a("<div style='width: 20px; height: 20px; z-index: 999999; top: 0px; left: 0px; position: absolute;'></div>");
			n.html(p);
			m.addClass(this.toThemeProperty("jqx-grid-validation-arrow-up"));
			n.addClass(this.toThemeProperty("jqx-grid-validation"));
			n.addClass(this.toThemeProperty("jqx-rc-all"));
			n.prependTo(this.table);
			m.prependTo(this.table);
			var g = this.hScrollInstance;
			var i = g.value;
			var f = parseInt(i);
			var k = this.getcolumn(d).uielement;
			var j = a(this.hittestinfo[o].visualrow);
			n.css("top", parseInt(j.position().top) + 30 + "px");
			var b = parseInt(n.css("top"));
			m.css("top", b - 12);
			m.removeClass();
			m.addClass(this.toThemeProperty("jqx-grid-validation-arrow-up"));
			var e = false;
			if (b >= this._gettableheight()) {
				m.removeClass(this.toThemeProperty("jqx-grid-validation-arrow-up"));
				m.addClass(this.toThemeProperty("jqx-grid-validation-arrow-down"));
				b = parseInt(j.position().top) - this.rowsheight - 5;
				if (b < 0) {
					b = 0;
					this.validationpopuparrow.removeClass(this.toThemeProperty("jqx-grid-validation-arrow-down"));
					e = true
				}
				n.css("top", b + "px");
				m.css("top", b + n.outerHeight() - 9)
			}
			var l = -f + parseInt(a(k).position().left);
			m.css("left", f + l + 30);
			var c = n.width();
			if (c + l > this.host.width() - 20) {
				var h = c + l - this.host.width() + 40;
				l -= h
			}
			if (!e) {
				n.css("left", f + l)
			} else {
				n.css("left", f + parseInt(a(k).position().left) - n.outerWidth())
			}
			n.show();
			m.show();
			if (!this.popups) {
				this.popups = new Array()
			}
			this.popups[this.popups.length] = {validation: n, validationrow: m}
		}, _showvalidationpopup: function (p, e, q) {
			var k = this.editcell.editor;
			if (this.editmode == "selectedrow") {
				var c = this.editcell[e];
				if (c && c.editor) {
					k = c.editor;
					c.element = k
				}
			}
			if (!k) {
				return
			}
			if (this.validationpopup && a.jqx.isHidden(this.validationpopup)) {
				if (this.validationpopup.remove) {
					this.validationpopup.remove();
					this.validationpopuparrow.remove()
				}
				this.validationpopup = null;
				this.validationpopuparrow = null;
				if (e === undefined && q === undefined && this.editors && this.editors.length === 0) {
					return
				}
			}
			if (!this.validationpopup) {
				var n = a("<div style='z-index: 99999; top: 0px; left: 0px; position: absolute;'></div>");
				var m = a("<div style='width: 20px; height: 20px; z-index: 999999; top: 0px; left: 0px; position: absolute;'></div>");
				n.html(q);
				m.addClass(this.toThemeProperty("jqx-grid-validation-arrow-up"));
				n.addClass(this.toThemeProperty("jqx-grid-validation"));
				n.addClass(this.toThemeProperty("jqx-rc-all"));
				n.prependTo(this.table);
				m.prependTo(this.table);
				this.validationpopup = n;
				this.validationpopuparrow = m
			} else {
				this.validationpopup.html(q)
			}
			var h = this.hScrollInstance;
			var j = h.value;
			var g = parseInt(j);
			this.validationpopup.css("top", parseInt(a(this.editcell.element).parent().position().top) + (this.rowsheight + 5) + "px");
			var b = parseInt(this.validationpopup.css("top"));
			this.validationpopuparrow.css("top", b - 12);
			this.validationpopuparrow.removeClass();
			this.validationpopuparrow.addClass(this.toThemeProperty("jqx-grid-validation-arrow-up"));
			var o = this._gettableheight();
			var f = false;
			if (b >= o) {
				this.validationpopuparrow.removeClass(this.toThemeProperty("jqx-grid-validation-arrow-up"));
				this.validationpopuparrow.addClass(this.toThemeProperty("jqx-grid-validation-arrow-down"));
				b = parseInt(a(this.editcell.element).parent().position().top) - this.rowsheight - 5;
				if (b < 0) {
					b = 0;
					this.validationpopuparrow.removeClass(this.toThemeProperty("jqx-grid-validation-arrow-down"));
					f = true
				}
				this.validationpopup.css("top", b + "px");
				this.validationpopuparrow.css("top", b + this.validationpopup.outerHeight() - 9)
			}
			var l = -g + parseInt(a(this.editcell.element).position().left);
			this.validationpopuparrow.css("left", g + l + 30);
			var d = this.validationpopup.width();
			if (d + l > this.host.width() - 20) {
				var i = d + l - this.host.width() + 40;
				l -= i
			}
			if (!f) {
				this.validationpopup.css("left", g + l)
			} else {
				this.validationpopup.css("left", g + parseInt(a(this.editcell.element).position().left) - this.validationpopup.outerWidth())
			}
			this.validationpopup.show();
			this.validationpopuparrow.show()
		}
	})
})(jQuery);