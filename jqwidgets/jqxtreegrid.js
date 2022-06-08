/*
 jQWidgets v3.2.2 (2014-Mar-21)
 Copyright (c) 2011-2014 jQWidgets.
 License: http://jqwidgets.com/license/
 */

(function (a) {
	a.jqx.jqxWidget("jqxTreeGrid", "jqxDataTable", {});
	a.extend(a.jqx._jqxTreeGrid.prototype, {
		defineInstance: function () {
			this.base.treeGrid = this;
			this.base.exportSettings = {
				recordsInView: false,
				columnsHeader: true,
				hiddenColumns: false,
				serverURL: null,
				characterSet: null,
				collapsedRecords: false,
				fileName: "jqxTreeGrid"
			};
			this.checkboxes = false;
			this.icons = false;
			this.showSubAggregates = false;
			this.rowDetailsRenderer = null;
			this.virtualModeCreateRecords = null;
			this.virtualModeRecordCreating = null;
			this.loadingFailed = false
		}, createInstance: function (b) {
			this.theme = this.base.theme;
			var c = this
		}, deleterow: function (b) {
			var c = this.base;
			c.deleterowbykey(b)
		}, updaterow: function (b, d) {
			var c = this.base;
			c.updaterowbykey(b, d)
		}, setcellvalue: function (c, b, e) {
			var d = this.base;
			d.setcellvaluebykey(c, b, e)
		}, getcellvalue: function (c, b) {
			var d = this.base;
			return d.getcellvaluebykey(c, b)
		}, lockrow: function (b) {
			var c = this.base;
			c.lockrowbykey(b)
		}, unlockrow: function (b) {
			var c = this.base;
			c.unlockrowbykey(b)
		}, selectrow: function (b) {
			var c = this.base;
			c.selectrowbykey(b)
		}, unselectrow: function (b) {
			var c = this.base;
			c.unselectrowbykey(b)
		}, ensurerowvisible: function (b) {
			var c = this.base;
			c.ensurerowvisiblebykey(b)
		}, beginrowedit: function (b) {
			var c = this.base;
			c.beginroweditbykey(b)
		}, endrowedit: function (b, d) {
			var c = this.base;
			c.endroweditbykey(b, d)
		}, _showLoadElement: function () {
			var b = this.base;
			if (b.host.css("display") == "block") {
				if (b.autoshowloadelement) {
					a(b.dataloadelement).css("visibility", "visible");
					a(b.dataloadelement).css("display", "block");
					b.dataloadelement.width(b.host.width());
					b.dataloadelement.height(b.host.height())
				}
			}
		}, _hideLoadElement: function () {
			var b = this.base;
			if (b.host.css("display") == "block") {
				if (b.autoshowloadelement) {
					a(b.dataloadelement).css("visibility", "hidden");
					a(b.dataloadelement).css("display", "none");
					b.dataloadelement.width(b.host.width());
					b.dataloadelement.height(b.host.height())
				}
			}
		}, getKey: function (b) {
			if (b) {
				return b.uid
			}
		}, getRows: function () {
			var b = this.base;
			if (b.source.hierarchy) {
				return b.source.hierarchy
			}
			return b.source.records
		}, getrow: function (d) {
			var e = this.base;
			var b = e.source.records;
			if (e.source.hierarchy) {
				var f = function (h) {
					for (var j = 0; j < h.length; j++) {
						if (!h[j]) {
							continue
						}
						if (h[j].uid == d) {
							return h[j]
						}
						if (h[j].records) {
							var k = f(h[j].records);
							if (k) {
								return k
							}
						}
					}
				};
				var g = f(e.source.hierarchy);
				return g
			} else {
				for (var c = 0; c < b.length; c++) {
					if (!b[c]) {
						continue
					}
					if (b[c].uid == d) {
						return b[c]
					}
				}
			}
		}, _renderrows: function () {
			var M = this.base;
			var ao = this;
			if (M._loading) {
				return
			}
			if (M._updating) {
				return
			}
			var I = M._names();
			if (M.source.hierarchy.length === 0 && !M.loadingFailed) {
				if (this.virtualModeCreateRecords) {
					var ak = function (c) {
						if (c === false) {
							M._loading = false;
							M.loadingFailed = true;
							M.source.hierarchy = new Array();
							ao._hideLoadElement();
							M._renderrows();
							M._updateScrollbars();
							M._arrange();
							return
						}
						for (var j = 0; j < c.length; j++) {
							c[j].level = 0;
							ao.virtualModeRecordCreating(c[j]);
							M.rowsByKey[c[j].uid] = c[j]
						}
						M.source.hierarchy = c;
						M._loading = false;
						ao._hideLoadElement();
						M._renderrows();
						M._updateScrollbars();
						M._arrange()
					};
					M._loading = true;
					this.virtualModeCreateRecords(null, ak);
					this._showLoadElement()
				}
			}
			if (M.rendering) {
				M.rendering()
			}
			var av = 0;
			M.table[0].rows = new Array();
			var aF = M.toTP("jqx-cell") + " " + M.toTP("jqx-widget-content") + " " + M.toTP("jqx-item");
			if (M.rtl) {
				aF += " " + M.toTP("jqx-cell-rtl")
			}
			var b = M.columns.records.length;
			var N = false;//a.jqx.browser.msie && a.jqx.browser.version < 8;
			if (N) {
				M.host.attr("hideFocus", "true")
			}
			var v = new Array();
			var aC = function (s, w) {
				for (var aG = 0; aG < s.length; aG++) {
					var c = s[aG];
					if (!c) {
						continue
					}
					var j = !M.rowinfo[c.uid] ? c.expanded : M.rowinfo[c.uid].expanded;
					if (M.dataview.filters.length == 0) {
						c._visible = true
					}
					if (c._visible !== false) {
						if (j || c[I.leaf]) {
							w.push(c);
							if (c.records && c.records.length > 0) {
								var aH = aC(c.records, new Array());
								for (var x = 0; x < aH.length; x++) {
									w.push(aH[x])
								}
							}
						} else {
							w.push(c)
						}
					}
				}
				return w
			};
			var am = M.source.hierarchy.length === 0 ? M.source.records : M.source.hierarchy;
			am = M.dataview.evaluate(am);
			M.dataViewRecords = am;
			if (this.showSubAggregates) {
				var p = function (s, c) {
					if (s != 0) {
						if (c.length > 0) {
							if (c[c.length - 1]) {
								if (!c[c.length - 1].aggregate) {
									c.push({_visible: true, level: s, siblings: c, aggregate: true, leaf: true})
								}
							} else {
								if (a.jqx.browser.msie && a.jqx.browser.version < 9) {
									if (c[c.length - 2]) {
										if (!c[c.length - 2].aggregate) {
											c.push({_visible: true, level: s, siblings: c, aggregate: true, leaf: true})
										}
									}
								}
							}
						}
					}
					for (var j = 0; j < c.length; j++) {
						if (c[j] && c[j].records) {
							p(s + 1, c[j].records)
						}
					}
				};
				p(0, am)
			}
			if (M.source.hierarchy.length === 0) {
				if (M.dataview.pagesize == "all" || !M.pageable || M.serverProcessing) {
					var ai = am;
					if (M.pageable && M.serverProcessing && am.length > M.dataview.pagesize) {
						var ai = am.slice(M.dataview.pagesize * M.dataview.pagenum, M.dataview.pagesize * M.dataview.pagenum + M.dataview.pagesize)
					}
				} else {
					var ai = am.slice(M.dataview.pagesize * M.dataview.pagenum, M.dataview.pagesize * M.dataview.pagenum + M.dataview.pagesize)
				}
				var v = ai
			} else {
				var am = aC.call(M, am, new Array());
				if (M.dataview.pagesize == "all" || !M.pageable) {
					var ai = am
				} else {
					var ai = am.slice(M.dataview.pagesize * M.dataview.pagenum, M.dataview.pagesize * M.dataview.pagenum + M.dataview.pagesize)
				}
				var v = ai;
				var H = M.dataview.pagenum;
				M.updatepagerdetails();
				if (M.dataview.pagenum != H) {
					if (M.dataview.pagesize == "all" || !M.pageable) {
						var ai = am
					} else {
						var ai = am.slice(M.dataview.pagesize * M.dataview.pagenum, M.dataview.pagesize * M.dataview.pagenum + M.dataview.pagesize)
					}
					var v = ai
				}
			}
			M.renderedRecords = v;
			var C = v.length;
			var aD = M.tableZIndex;
			var k = 0;
			var an = 0;
			if (N) {
				for (var O = 0; O < b; O++) {
					var S = M.columns.records[O];
					var at = S.width;
					if (at < S.minwidth) {
						at = S.minwidth
					}
					if (at > S.maxwidth) {
						at = S.maxwidth
					}
					var ar = a('<table><tr><td role="gridcell" style="max-width: ' + at + "px; width:" + at + 'px;" class="' + aF + '"></td></tr></table>');
					a(document.body).append(ar);
					var ae = ar.find("td");
					k = 1 + parseInt(ae.css("padding-left")) + parseInt(ae.css("padding-right"));
					ar.remove();
					break
				}
			}
			var A = M.rtl ? " " + M.toTP("jqx-grid-table-rtl") : "";
			var y = "<table cellspacing='0' class='" + M.toTP("jqx-grid-table") + A + "' id='table" + M.element.id + "'><colgroup>";
			var V = "<table cellspacing='0' class='" + M.toTP("jqx-grid-table") + A + "' id='pinnedtable" + M.element.id + "'><colgroup>";
			var aa = null;
			for (var O = 0; O < b; O++) {
				var S = M.columns.records[O];
				if (S.hidden) {
					continue
				}
				aa = S;
				var at = S.width;
				if (at < S.minwidth) {
					at = S.minwidth
				}
				if (at > S.maxwidth) {
					at = S.maxwidth
				}
				at -= k;
				if (at < 0) {
					at = 0
				}
				if (N) {
					var G = at;
					if (O == 0) {
						G++
					}
					V += "<col style='max-width: " + at + "px; width: " + G + "px;'>";
					y += "<col style='max-width: " + at + "px; width: " + G + "px;'>"
				} else {
					V += "<col style='max-width: " + at + "px; width: " + at + "px;'>";
					y += "<col style='max-width: " + at + "px; width: " + at + "px;'>"
				}
				an += at
			}
			y += "</colgroup>";
			V += "</colgroup>";
			M._hiddencolumns = false;
			var r = false;
			if (C === 0) {
				var n = '<tr role="row">';
				var q = M.host.height();
				if (M.pageable) {
					q -= M.pagerheight;
					if (M.pagerposition === "both") {
						q -= M.pagerheight
					}
				}
				q -= M.columnsheight;
				if (M.filterable) {
					var ay = M.filter.find(".filterrow");
					var z = M.filter.find(".filterrow-hidden");
					var D = 1;
					if (z.length > 0) {
						D = 0
					}
					q -= M.filterheight + M.filterheight * ay.length * D
				}
				if (M.showstatusbar) {
					q -= M.statusbarheight
				}
				if (M.showaggregates) {
					q -= M.aggregatesheight
				}
				if (q < 25) {
					q = 25
				}
				if (M.hScrollBar[0].style.visibility != "hidden") {
					q -= M.hScrollBar.outerHeight()
				}
				if (M.height === "auto" || M.height === null || M.autoheight) {
					q = 100
				}
				var at = M.host.width() + 2;
				var ar = '<td colspan="' + M.columns.records.length + '" role="gridcell" style="border-right-color: transparent; min-height: ' + q + "px; height: " + q + "px;  min-width:" + an + "px; max-width:" + an + "px; width:" + an + "px;";
				var aF = M.toTP("jqx-cell") + " " + M.toTP("jqx-grid-cell") + " " + M.toTP("jqx-item");
				aF += " " + M.toTP("jqx-center-align");
				ar += '" class="' + aF + '">';
				if (!M._loading) {
					ar += M.gridlocalization.emptydatastring
				}
				ar += "</td>";
				n += ar;
				y += n;
				V += n;
				M.table[0].style.width = an + 2 + "px";
				av = an
			}
			var m = M.source._source.hierarchy && M.source._source.hierarchy.groupingDataFields ? M.source._source.hierarchy.groupingDataFields.length : 0;
			for (var P = 0; P < v.length; P++) {
				var ap = v[P];
				var ab = ap.uid;
				if (m > 0) {
					if (ap[I.level] < m) {
						ab = ap.uid
					}
				}
				if (ap.uid === undefined) {
					ap.uid = M.dataview.generatekey()
				}
				var n = '<tr data-key="' + ab + '" role="row" id="row' + P + M.element.id + '">';
				var al = '<tr data-key="' + ab + '" role="row" id="row' + P + M.element.id + '">';
				if (ap.aggregate) {
					var n = '<tr data-role="summaryrow" role="row" id="row' + P + M.element.id + '">';
					var al = '<tr data-role="summaryrow" role="row" id="row' + P + M.element.id + '">'
				}
				var T = 0;
				if (!M.rowinfo[ab]) {
					M.rowinfo[ab] = {
						selected: ap[I.selected],
						checked: ap[I.checked],
						icon: ap[I.icon],
						aggregate: ap.aggregate,
						row: ap,
						leaf: ap[I.leaf],
						expanded: ap[I.expanded]
					}
				} else {
					if (M.rowinfo[ab].checked === undefined) {
						M.rowinfo[ab].checked = ap[I.checked]
					}
					if (M.rowinfo[ab].icon === undefined) {
						M.rowinfo[ab].icon = ap[I.icon]
					}
					if (M.rowinfo[ab].aggregate === undefined) {
						M.rowinfo[ab].aggregate = ap[I.aggregate]
					}
					if (M.rowinfo[ab].row === undefined) {
						M.rowinfo[ab].row = ap
					}
					if (M.rowinfo[ab].leaf === undefined) {
						M.rowinfo[ab].leaf = ap[I.leaf]
					}
					if (M.rowinfo[ab].expanded === undefined) {
						M.rowinfo[ab].expanded = ap[I.expanded]
					}
				}
				var h = M.rowinfo[ab];
				h.row = ap;
				if (ap.originalRecord) {
					h.originalRecord = ap.originalRecord
				}
				var o = 0;
				for (var O = 0; O < b; O++) {
					var L = M.columns.records[O];
					if (L.pinned || (M.rtl && M.columns.records[b - 1].pinned)) {
						r = true
					}
					var at = L.width;
					if (at < L.minwidth) {
						at = L.minwidth
					}
					if (at > L.maxwidth) {
						at = L.maxwidth
					}
					at -= k;
					if (at < 0) {
						at = 0
					}
					var aF = M.toTP("jqx-cell") + " " + M.toTP("jqx-grid-cell") + " " + M.toTP("jqx-item");
					if (L.pinned) {
						aF += " " + M.toTP("jqx-grid-cell-pinned")
					}
					if (M.sortcolumn === L.displayfield) {
						aF += " " + M.toTP("jqx-grid-cell-sort")
					}
					if (M.altrows && P % 2 != 0) {
						aF += " " + M.toTP("jqx-grid-cell-alt")
					}
					if (M.rtl) {
						aF += " " + M.toTP("jqx-cell-rtl")
					}
					var Q = "";
					if (m > 0 && !N) {
						if (ap[I.level] < m) {
							Q += ' colspan="' + b + '"';
							var G = 0;
							for (var J = 0; J < b; J++) {
								var R = M.columns.records[J];
								var Y = R.width;
								if (Y < R.minwidth) {
									at = R.minwidth
								}
								if (Y > R.maxwidth) {
									at = R.maxwidth
								}
								Y -= k;
								if (Y < 0) {
									Y = 0
								}
								G += Y
							}
							at = G
						}
					}
					var ar = '<td role="gridcell"' + Q + ' style="max-width:' + at + "px; width:" + at + "px;";
					var ah = '<td role="gridcell"' + Q + ' style="pointer-events: none; visibility: hidden; border-color: transparent; max-width:' + at + "px; width:" + at + "px;";
					if (O == b - 1 && b == 1) {
						ar += "border-right-color: transparent;";
						ah += "border-right-color: transparent;"
					}
					if (m > 0 && ap[I.level] < m) {
						if (M.rtl) {
							aF += " " + M.toTP("jqx-right-align")
						}
					} else {
						if (L.cellsalign != "left") {
							if (L.cellsalign === "right") {
								aF += " " + M.toTP("jqx-right-align")
							} else {
								aF += " " + M.toTP("jqx-center-align")
							}
						}
					}
					if (h) {
						if (h.selected) {
							if (M.editKey !== ab) {
								if (M.selectionmode !== "none") {
									aF += " " + M.toTP("jqx-grid-cell-selected");
									aF += " " + M.toTP("jqx-fill-state-pressed")
								}
							}
						}
						if (h.locked) {
							aF += " " + M.toTP("jqx-grid-cell-locked")
						}
						if (h.aggregate) {
							aF += " " + M.toTP("jqx-grid-cell-pinned")
						}
					}
					if (!(L.hidden)) {
						if (o == 0 && !M.rtl) {
							ar += "border-left-width: 0px;";
							ah += "border-left-width: 0px;"
						} else {
							ar += "border-right-width: 0px;";
							ah += "border-right-width: 0px;"
						}
						o++;
						T += k + at
					} else {
						ar += "display: none;";
						ah += "display: none;";
						M._hiddencolumns = true
					}
					if (L.pinned) {
						ar += "pointer-events: auto;";
						ah += "pointer-events: auto;"
					}
					var u = "";
					if ((M.source.hierarchy.length == 0 || (!ap.records || (ap.records && ap.records.length === 0))) && !this.virtualModeCreateRecords) {
						h.leaf = true
					}
					if (ap.records && ap.records.length > 0) {
						h.leaf = false
					}
					if (M.dataview.filters.length > 0) {
						if (ap.records && ap.records.length > 0) {
							var Z = false;
							for (var K = 0; K < ap.records.length; K++) {
								if (ap.records[K]._visible !== false && ap.records[K].aggregate == undefined) {
									Z = true;
									break
								}
							}
							if (!Z) {
								h.leaf = true
							} else {
								h.leaf = false
							}
						}
					}
					if (h && !h.leaf) {
						if (h.expanded) {
							u += M.toTP("jqx-tree-grid-expand-button") + " ";
							if (!M.rtl) {
								u += M.toTP("jqx-grid-group-expand")
							} else {
								u += M.toTP("jqx-grid-group-expand-rtl")
							}
							u += " " + M.toTP("jqx-icon-arrow-down")
						} else {
							u += M.toTP("jqx-tree-grid-collapse-button") + " ";
							if (!M.rtl) {
								u += M.toTP("jqx-grid-group-collapse");
								u += " " + M.toTP("jqx-icon-arrow-right")
							} else {
								u += M.toTP("jqx-grid-group-collapse-rtl");
								u += " " + M.toTP("jqx-icon-arrow-left")
							}
						}
					}
					if (!M.autorowheight || o == 1) {
						aF += " " + M.toTP("jqx-grid-cell-nowrap ")
					}
					var U = M._getcellvalue(L, h.row);
					if (m > 0) {
						if (ap[I.level] < m) {
							U = ap.label
						}
					}
					if (L.cellsformat != "") {
						if (a.jqx.dataFormat) {
							if (a.jqx.dataFormat.isDate(U)) {
								U = a.jqx.dataFormat.formatdate(U, L.cellsformat, M.gridlocalization)
							} else {
								if (a.jqx.dataFormat.isNumber(U) || (!isNaN(parseFloat(U)) && isFinite(U))) {
									U = a.jqx.dataFormat.formatnumber(U, L.cellsformat, M.gridlocalization)
								}
							}
						}
					}
					if (L.cellclassname != "" && L.cellclassname) {
						if (typeof L.cellclassname == "string") {
							aF += " " + L.cellclassname
						} else {
							var aE = L.cellclassname(P, L.datafield, M._getcellvalue(L, h.row), h.row, U);
							if (aE) {
								aF += " " + aE
							}
						}
					}
					if (L.cellsrenderer != "" && L.cellsrenderer) {
						var B = L.cellsrenderer(ab, L.datafield, M._getcellvalue(L, h.row), h.row, U);
						if (B !== undefined) {
							U = B
						}
					}
					if (h.aggregate) {
						if (L.aggregates) {
							var aq = ap.siblings.slice(0, ap.siblings.length - 1);
							var W = M._calculateaggregate(L, null, true, aq);
							ap[L.displayfield] = "";
							if (W) {
								if (L.aggregatesrenderer) {
									if (W) {
										var F = L.aggregatesrenderer(W[L.datafield], L, null, M.getcolumnaggregateddata(L.datafield, L.aggregates, false, aq), "subAggregates");
										U = F;
										ap[L.displayfield] += name + ":" + W[L.datafield] + "\n"
									}
								} else {
									U = "";
									ap[L.displayfield] = "";
									a.each(W, function () {
										var i = this;
										for (obj in i) {
											var c = obj;
											c = M._getaggregatename(c);
											var j = '<div style="position: relative; margin: 0px; overflow: hidden;">' + c + ":" + i[obj] + "</div>";
											U += j;
											ap[L.displayfield] += c + ":" + i[obj] + "\n"
										}
									})
								}
							}
						}
					}
					if ((o === 1 && !M.rtl) || (L == aa && M.rtl) || (m > 0 && ap[I.level] < m)) {
						var ac = "";
						var d = M.toThemeProperty("jqx-tree-grid-indent");
						var X = h.leaf ? 1 : 0;
						for (var E = 0; E < ap[I.level] + X; E++) {
							ac += "<span class='" + d + "'></span>"
						}
						var aj = "<span class='" + u + "'></span>";
						var aw = "";
						var e = "";
						if (this.checkboxes && !ap.aggregate) {
							var az = M.toThemeProperty("jqx-tree-grid-checkbox") + " " + d + " " + M.toThemeProperty("jqx-checkbox-default") + " " + M.toThemeProperty("jqx-fill-state-normal") + " " + M.toThemeProperty("jqx-rc-all");
							var g = true;
							if (a.isFunction(this.checkboxes)) {
								g = this.checkboxes(ab, ap);
								if (g == undefined) {
									g = false
								}
							}
							if (g) {
								if (h) {
									var au = h.checked;
									if (au) {
										aw += "<span class='" + az + "'><div class='" + M.toThemeProperty("jqx-tree-grid-checkbox-tick") + " " + M.toThemeProperty("jqx-checkbox-check-checked") + "'></div></span>"
									} else {
										aw += "<span class='" + az + "'></span>"
									}
								} else {
									aw += "<span class='" + az + "'></span>"
								}
							}
						}
						if (this.icons && !ap.aggregate) {
							var ad = M.toThemeProperty("jqx-tree-grid-icon") + " " + d;
							if (M.rtl) {
								var ad = M.toThemeProperty("jqx-tree-grid-icon") + " " + M.toThemeProperty("jqx-tree-grid-icon-rtl") + " " + d
							}
							var ax = M.toThemeProperty("jqx-tree-grid-icon-size") + " " + d;
							var f = h.icon;
							if (a.isFunction(this.icons)) {
								h.icon = this.icons(ab, ap);
								if (h.icon) {
									f = true
								}
							}
							if (f) {
								if (h.icon) {
									e += "<span class='" + ad + "'><img class='" + ax + "' src='" + h.icon + "'/></span>"
								} else {
									e += "<span class='" + ad + "'></span>"
								}
							}
						}
						var ag = ac + aj + aw + e + "<span class='" + M.toThemeProperty("jqx-tree-grid-title") + "'>" + U + "</span>";
						if (!M.rtl) {
							U = ag
						} else {
							U = "<span class='" + M.toThemeProperty("jqx-tree-grid-title") + "'>" + U + "</span>" + e + aw + aj + ac
						}
					}
					if (m > 0 && N && O >= m) {
						if (ap[I.level] < m) {
							ar += "padding-left: 5px; border-left-width: 0px;";
							ah += "padding-left: 5px; border-left-width: 0px;";
							U = "<span style='visibility: hidden;'>-</span>"
						}
					}
					ar += '" class="' + aF + '">';
					ar += U;
					ar += "</td>";
					ah += '" class="' + aF + '">';
					ah += U;
					ah += "</td>";
					if (!L.pinned) {
						n += ar;
						if (r) {
							al += ah
						}
					} else {
						al += ar;
						n += ar
					}
					if (m > 0 && !N) {
						if (ap[I.level] < m) {
							break
						}
					}
				}
				if (av == 0) {
					M.table[0].style.width = T + 2 + "px";
					av = T
				}
				n += "</tr>";
				al += "</tr>";
				y += n;
				V += al;
				if (M.rowdetails && !ap.aggregate && this.rowDetailsRenderer) {
					var l = '<tr data-role="row-details"><td valign="top" align="left" style="pointer-events: auto; max-width:' + at + "px; width:" + at + 'px; overflow: hidden; border-left: none; border-right: none;" colspan="' + M.columns.records.length + '" role="gridcell"';
					var aF = M.toTP("jqx-cell") + " " + M.toTP("jqx-grid-cell") + " " + M.toTP("jqx-item");
					aF += " " + M.toTP("jqx-details");
					aF += " " + M.toTP("jqx-reset");
					var af = this.rowDetailsRenderer(ab, ap);
					if (af) {
						l += '" class="' + aF + '"><div style="pointer-events: auto; overflow: hidden;"><div data-role="details">' + af + "</div></div></td></tr>";
						y += l;
						V += l
					}
				}
			}
			y += "</table>";
			V += "</table>";
			if (r) {
				if (M.WinJS) {
					MSApp.execUnsafeLocalFunction(function () {
						M.table.html(V + y)
					})
				} else {
					M.table[0].innerHTML = V + y
				}
				var aA = M.table.find("#table" + M.element.id);
				var aB = M.table.find("#pinnedtable" + M.element.id);
				aB.css("float", "left");
				aB.css("pointer-events", "none");
				aA.css("float", "left");
				aB[0].style.position = "absolute";
				aA[0].style.position = "relative";
				aA[0].style.zIndex = aD - 10;
				aB[0].style.zIndex = aD + 10;
				M._table = aA;
				M._table[0].style.left = "0px";
				M._pinnedTable = aB;
				M._table[0].style.width = av + "px";
				M._pinnedTable[0].style.width = av + "px";
				if (M.rtl && M._haspinned) {
					M._pinnedTable[0].style.left = 3 - av + parseInt(M.element.style.width) + "px"
				}
			} else {
				if (M.WinJS) {
					MSApp.execUnsafeLocalFunction(function () {
						M.table.html(y)
					})
				} else {
					M.table[0].innerHTML = y
				}
				var J = M.table.find("#table" + M.element.id);
				M._table = J;
				if (a.jqx.browser.msie && a.jqx.browser.version < 10) {
					M._table[0].style.width = av + "px"
				}
				if (C === 0) {
					M._table[0].style.width = (2 + av) + "px"
				}
			}
			if (C === 0) {
				M._table[0].style.tableLayout = "auto";
				if (M._pinnedTable) {
					M._pinnedTable[0].style.tableLayout = "auto"
				}
			}
			if (M.showaggregates) {
				M._updatecolumnsaggregates()
			}
			if (M._loading && C == 0) {
				M._arrange();
				this._showLoadElement()
			}
			if (M.rendered) {
				M.rendered()
			}
		}, propertyChangedHandler: function (b, c, e, d) {
			if (b.isInitialized == undefined || b.isInitialized == false) {
				return
			}
		}, checkrow: function (b, c) {
			var e = this.base;
			var g = e._names();
			if (e._loading) {
				return
			}
			var d = this;
			var f = e.rowinfo[b];
			if (f) {
				f.checked = true;
				f.row[g.checked] = true;
				if (c !== false) {
					e._renderrows()
				}
				e._raiseEvent("rowCheck", {key: b, row: f.row})
			} else {
				var h = this.getrow(b);
				if (h) {
					e.rowinfo[b] = {row: h, checked: true};
					e._raiseEvent("rowCheck", {key: b, row: h})
				}
			}
		}, uncheckrow: function (b, c) {
			var e = this.base;
			var g = e._names();
			if (e._loading) {
				return
			}
			var d = this;
			var f = e.rowinfo[b];
			if (f) {
				f.checked = false;
				f.row[g.checked] = false;
				if (c !== false) {
					e._renderrows()
				}
				e._raiseEvent("rowUncheck", {key: b, row: f.row})
			} else {
				var h = this.getrow(b);
				if (h) {
					e.rowinfo[b] = {row: h, checked: false};
					e._raiseEvent("rowUncheck", {key: b, row: h})
				}
			}
		}, expandrow: function (d) {
			var f = this.base;
			if (f._loading) {
				return
			}
			var i = f._names();
			var e = this;
			var h = f.rowinfo[d];
			if (h) {
				if (h.expanded) {
					h.row[i.expanded] = true;
					return
				}
				h.expanded = true;
				h.row[i.expanded] = true;
				if (h.originalRecord) {
					h.originalRecord[i.expanded] = true
				}
				if (this.virtualModeCreateRecords && !h.row.records) {
					var c = function (k) {
						if (k === false) {
							f._loading = false;
							e._hideLoadElement();
							h.leaf = true;
							h.row[i.leaf] = true;
							f._renderrows();
							return
						}
						for (var l = 0; l < k.length; l++) {
							k[l][i.level] = h.row[i.level] + 1;
							k[l][i.parent] = h.row;
							if (f.rowsByKey[k[l].uid]) {
								f._loading = false;
								e._hideLoadElement();
								h.leaf = true;
								h.row[i.leaf] = true;
								f._renderrows();
								throw new Error("Please, check whether you Add Records with unique ID/Key. ")
							}
							f.rowsByKey[k[l].uid] = k[l];
							e.virtualModeRecordCreating(k[l])
						}
						h.row.records = k;
						if ((!k) || (k && k.length == 0)) {
							h.leaf = true;
							h.row[i.leaf] = true
						}
						if (h.originalRecord) {
							h.originalRecord.records = k;
							h.originalRecord[i.expanded] = true;
							if (k.length == 0) {
								h.originalRecord[i.leaf] = true
							}
						}
						f._loading = false;
						e._hideLoadElement();
						var j = f.vScrollBar.css("visibility");
						f._renderrows();
						f._updateScrollbars();
						var m = j != f.vScrollBar.css("visibility");
						if (f.height === "auto" || f.height === null || f.autoheight || m) {
							f._arrange()
						}
						f._renderhorizontalscroll()
					};
					if (!h.row[i.leaf]) {
						f._loading = true;
						this._showLoadElement();
						this.virtualModeCreateRecords(h.row, c);
						return
					}
				}
				if (!f.updating()) {
					var b = f.vScrollBar.css("visibility");
					f._renderrows();
					f._updateScrollbars();
					var g = b != f.vScrollBar.css("visibility");
					if (f.height === "auto" || f.height === null || f.autoheight || g) {
						f._arrange()
					}
					f._renderhorizontalscroll();
					f._raiseEvent("rowExpand", {row: h.row, rowKey: d})
				}
			}
		}, collapserow: function (c) {
			var d = this.base;
			var g = d._names();
			if (d._loading) {
				return
			}
			var f = d.rowinfo[c];
			if (f) {
				if (!f.expanded) {
					f.row[g.expanded] = false;
					return
				}
				f.expanded = false;
				f.row[g.expanded] = false;
				if (f.originalRecord) {
					f.originalRecord[g.expanded] = false
				}
				if (!d.updating()) {
					var b = d.vScrollBar.css("visibility");
					d._renderrows();
					d._updateScrollbars();
					var e = b != d.vScrollBar.css("visibility");
					if (d.height === "auto" || d.height === null || d.autoheight || e) {
						d._arrange()
					}
					d._renderhorizontalscroll();
					d._raiseEvent("rowCollapse", {row: f.row, rowKey: c})
				}
			}
		}
	})
})(jQuery);