//Глобальный объект для внешнего взаимодействия (любые интерфейсные взаимодействия для вызова функций)
ExternalInteraction = {};

//константы задач
ExternalInteraction.MAP = "MAP";
ExternalInteraction.MULT_MAIN		= "MULT_MAIN";
ExternalInteraction.GRID 			= "GRID";
ExternalInteraction.CAS 				= "CAS";
ExternalInteraction.PROP 			= "PROP";
ExternalInteraction.EXPORT_EXCEL 	= "EXPORT_EXCEL";
ExternalInteraction.EXPORT_GPX 		= "EXPORT_GPX";
ExternalInteraction.EXPORT_IMG 		= "EXPORT_IMG";
ExternalInteraction.EXPORT_DOC 		= "EXPORT_DOC";
ExternalInteraction.EXPORT_WRL 		= "EXPORT_WRL";

ExternalInteraction.DEFAULT_URL 		= "";
ExternalInteraction.DEFAULT_WINDOW_TEMPLATE 		= "default";

//название функций синхронизации
ExternalInteraction.EXPORT_EXCEL_FUNCTION 			= "exportExcel";
ExternalInteraction.EXPORT_GPX_FUNCTION 				= "exportGPX";
ExternalInteraction.CAS_SHOW_MAP_FUNCTION 			= "showMap";
ExternalInteraction.CAS_SHOW_LINE_FUNCTION 			= "showLine";
ExternalInteraction.FILTER_DATA_FUNCTION 			= "filterData";
ExternalInteraction.FILTER_DATA_FUNCTION_CALLBACK 	= "callbackFilter";
ExternalInteraction.SHOW_OBJECTS_FUNCTION    		= "showObjects";
ExternalInteraction.SHOW_VIDEO_FUNCTION    			= "showVideo";

ExternalInteraction.FUNCTION_ERROR = gis_externalinteraction_1;
ExternalInteraction.FUNCTION_MAP_ERROR = gis_externalinteraction_2;
ExternalInteraction.FUNCTION_ERROR_TITLE = gis_externalinteraction_3;
ExternalInteraction.CALLBACK_FUNCTION_ERROR = gis_externalinteraction_4;
ExternalInteraction.CALLBACK_FUNCTION_ERROR_TITLE = gis_externalinteraction_5;
ExternalInteraction.OPEN_WINDOW_ERROR = gis_externalinteraction_6;
ExternalInteraction.OPEN_WINDOW_ERROR_TITLE = gis_externalinteraction_7;
ExternalInteraction.EXTERNAL_INTERFACE_ERROR = gis_externalinteraction_8;
ExternalInteraction.EXTERNAL_INTERFACE_ERROR_TITLE = gis_externalinteraction_9;

/*Функции для вызова функций взаимодействия (с обработкой результатов вызова)*/

ExternalInteraction.callbackFunction = function (windowId /*String*/, funcName /*String*/, params /*Array*/, showErrorMessage /*Boolean = false*/) {
    /*Сейчас проверки наличия внешнего интерфейса не делаем, однако в будущем нужно проверять наличие интерфейса для функций виджета, если это возможно*/
    if(true /*ExternalInterface.available*/)
    {
        //вызывает открытие окна и результат идентификатор окна или null
        var result = callbackFunction(windowId, funcName, params);
        if(!showErrorMessage)
            return -1;
        if(result == -1)
        {
            App.errorReport(ExternalInteraction.FUNCTION_ERROR_TITLE, ExternalInteraction.FUNCTION_MAP_ERROR, undefined, {filename:gis_filename_118, functionname:'gis_filename_118_1'});
            return -1;
        }
        if(result == 0)
        {
            App.errorReport(ExternalInteraction.FUNCTION_ERROR_TITLE, ExternalInteraction.FUNCTION_ERROR.replace('{0}',funcName), undefined, {filename:gis_filename_118, functionname:'gis_filename_118_2'});
            return 0;
        }
    }
    else
        App.errorReport(ExternalInteraction.EXTERNAL_INTERFACE_ERROR_TITLE, ExternalInteraction.EXTERNAL_INTERFACE_ERROR.replace('{0}',"callbackFunction"), undefined, {filename:gis_filename_118, functionname:'gis_filename_118_3'});
    return -1;
};

//взаимодействие с открытым окном
ExternalInteraction.callFunction = function (windowId /*String*/, funcName /*String*/, params /*Array*/) {
    /*Сейчас проверки наличия внешнего интерфейса не делаем, однако в будущем нужно проверять наличие интерфейса для функций виджета, если это возможно*/
    if(true /*ExternalInterface.available*/)
    {
        //вызывает открытие окна и результат идентификатор окна или null
        //временно перенаправляем вызов на js карту (if widgetMap != undefined или что-то подобное в качестве проверка)
        if(funcName == "showObjects")
            return WidgetMap.showObjects(params);
        if(funcName == "filterData")
            return WidgetMap.filterData(params);
        else if(funcName == "showVideo")
            return WidgetMap.showVideo();
        else if(funcName == "updateCacheLayer")
            return WidgetMap.updateCacheLayer(params);
        else
            return callFunction(windowId, funcName, params);
    }
    App.errorReport(ExternalInteraction.EXTERNAL_INTERFACE_ERROR_TITLE, ExternalInteraction.EXTERNAL_INTERFACE_ERROR.replace('{0}',"callFunction"), undefined, {filename:gis_filename_118, functionname:'gis_filename_118_4'});
    return -1;
};

/* Глобальный объект с функциями для ожидания и блокировки */
BlockingUtil = {};

//Признак, что часики крутятся
BlockingUtil._isWaiting = false;
BlockingUtil._waitCount = 0;
//Признак, что грузится геометрия
BlockingUtil._isWaitingGeo = false;
BlockingUtil._waitCountGeo = 0;
//Признак, что приложение заблокировано
BlockingUtil._isBlocked = false;
BlockingUtil._blockCount = 0;

//Добавляем часики
BlockingUtil.wait = function() {
    BlockingUtil._isWaiting = true;
    BlockingUtil._waitCount += 1;
    //Устанавливаем курсор ожидания
    $("body").css("cursor", "progress");
};

BlockingUtil.waitGeo = function() {
	BlockingUtil._isWaitingGeo = true;
	BlockingUtil._waitCountGeo += 1;
	//Устанавливаем показываем лоадер
    if(goog.isDef(WidgetMap) && goog.isDef(WidgetMap.geometryLoaderControl))
	    WidgetMap.geometryLoaderControl.setVisible(true);
};
BlockingUtil.readyGeo = function() {
	BlockingUtil._waitCountGeo -= 1;
	if (BlockingUtil._waitCountGeo <= 0) {
		BlockingUtil._waitCountGeo = 0;
		BlockingUtil._isWaitingGeo = false;
		//прячем лоадер
		if(goog.isDef(WidgetMap) && goog.isDef(WidgetMap.geometryLoaderControl))
			WidgetMap.geometryLoaderControl.setVisible(false);
	}
};

//Убираем часики
BlockingUtil.ready = function() {
    BlockingUtil._waitCount -= 1;
    if (BlockingUtil._waitCount <= 0) {
        BlockingUtil._waitCount = 0;
        BlockingUtil._isWaiting = false;
        //Устанавливаем обычный курсор
        $("body").css("cursor", "default");
        /* Для проверки курсора ожидания делаем задержку перед восстановлением */
        /*setTimeout(function (){
         $("body").css("cursor", "default");
         },5000);*/
    }
};

//Ставим блокировку на приложение
BlockingUtil.blockApplication = function() {
    BlockingUtil._isBlocked = true;
    BlockingUtil._blockCount += 1;
    //Добавляем div, который закрывает собой все приложение (сквозь него не проходят никакие события)
    var overlayDiv = '<div class="applicationBlockOverlay"></div>';
    $("body").append(overlayDiv);
};

//Снимаем блокировку с приложения (если не было других блокировок, мы их накапливаем)
BlockingUtil.unblockApplication = function() {
    BlockingUtil._blockCount -= 1;
    if (BlockingUtil._blockCount <= 0) {
        BlockingUtil._blockCount = 0;
        BlockingUtil._isBlocked = false;
        //Убираем div, который закрывает собой все приложение (сквозь него не проходят никакие события)
        $(".applicationBlockOverlay").remove();
        /* Для проверки блокировки приложения делаем задержку перед восстановлением */
        /*setTimeout(function (){
         $(".applicationBlockOverlay").remove();
         },5000);*/
    }
};


/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
    var	token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var	_ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};
//проверка, если открыт виджет w=1, и выбран сразу рубрикатор ВТД, то 1-е открытие игнорируем
//предполагается, что извне придет id обследования
//далее работа будет происходить по старой схеме с открытием окна выбора обследования при выборе вкладки
ExternalInteraction.firstCheckHead = true;

/**
 * Функция загрузки описания всех фильтров
 * @param filters
 * @param callback
 */
ExternalInteraction.loadFiltersDescr = function (filters, loadedFilters, callback) {
	var filters = [{title: gis_treeutils_11}, {title: gis_treeutils_10}]
	if (callback) callback(filters);
}

/**
 * Показать перед фильтром форму с выбором, какой из фильтров использовать
 * @param filterType
 * @param topFilterSource
 * @param middleFilterSource
 * @param showLayers
 * @param applyHandler
 */
ExternalInteraction.showSelectableFilter = function (filterType, topFilterSource, middleFilterSource, showLayers, applyHandler) {
	//сначала грузим все
	ExternalInteraction.loadFiltersDescr(middleFilterSource, [], function (filters) {
		$('#selectableFilterFormDialog').remove();
		var divv = '<div id="selectableFilterFormDialog">' +
			'<div class="filter-form-div">';
		divv += '<div>' + gis_treeutils_12 + '</div><br/>';
		var checked = '';
		var height = 160;
		for (var i = 0; i < filters.length; i++) {
			checked = (i === 0) ? 'checked' : '';
			divv += '<div class="filter-form-radio">';
			divv += '   <input name="filterRadio" id="filterRadio_' + i + '" type="radio" ' + checked + ' value="' + i + '"/>';
			divv += '   <label for="filterRadio_' + i + '" style="margin-left: 5px;">' + filters[i].title + '</label>';
			divv += '</div>';
			height += 30;
		}
		divv += '<br/><div>' + gis_treeutils_13 + '</div>';
		divv += '</div></div>';
		$('body').append(divv);
		var dlg = $('#selectableFilterFormDialog');
		var buttons = [{
			text: gis_core_16,
			click: function () {
				var selectedFilterIndex = Number($("input[name='filterRadio']:checked", dlg).val());
				if (applyHandler)
					applyHandler(selectedFilterIndex);
				$('#selectableFilterFormDialog').remove();
			}
		},
			{
				text: gis_treeutils_9,
				click: function () {
					if (applyHandler)
						applyHandler(-1);
					$('#selectableFilterFormDialog').remove();
				}
			}];
		dlg.dialog({
			modal: true,
			title: gis_treeutils_8,
			dialogClass: 'noCloseButton gsi-zindex__dialog',
			closeOnEscape: true,
			width: 470,
			height: height,
			resizable: false,
			buttons: buttons,
		});
	})
};

ExternalInteraction.showFilter = function (filterType, topFilterSource, middleFilterSource, showLayers, applyHandler) {
	var isMiddleFilter = topFilterSource === undefined || topFilterSource === '';
	//если уже был открыт средний фильтр, то игнорируем. Обход ситуации, когда от каждого фильтра рубрикатора вызывается checkHeadRadioHandler
	if ($('#middleFilterDialog').length > 0)
		return;
	$('body').append('<div id="middleFilterDialog"></div>');
	var dlg = $('#middleFilterDialog');
	dlg.append('<div id="middleFilterDiv"></div>');
	var middleFilterDiv = $('#middleFilterDiv');
	middleFilterDiv.myFilters({
		dataSource: middleFilterSource,
		handlers: {
			applyHandler: function (params) {
				//устанавливаем верхний фильтр
				var resFilterValues = middleFilterDiv.myFilters('getFilterValuesArray');
				var dotSplitArr = resFilterValues[0].values;
				//Если не выбрано ни одной записи или выбраны все - не включаем в фильтрацию
				var roughArr = [];
				for (var j = 0; j < dotSplitArr.length; j++) {
					roughArr.push(dotSplitArr[j].code);
				}
				if (dotSplitArr.length == 0) {
					roughArr.push('NULL');
				}
				var showInfo = false;
				$('#middleFilterDialog').remove();
				var idFilter = resFilterValues[0].idFilter;
				if (isMiddleFilter) {
					var rr = [];
					WidgetMap.currentRoughFilter = [];
					for (var k = 0; k < showLayers.length; k++) {
						//устанавливаем в объект идентификаторы всех показываемых на карте слоёв
						var smallLayerId = showLayers[k];
						rr.push({name: "roughFilter", value: roughArr.join(","), layerName: smallLayerId});
						WidgetMap.currentFilter[smallLayerId] = [];
						WidgetMap.currentFilter[smallLayerId].push({
							layerName: smallLayerId,
							filter: idFilter,
							value: roughArr.join(",")
						});
						WidgetMap.currentRoughFilter.push({name: idFilter, value: roughArr.join(","), layerName:smallLayerId});
					}

					//WidgetMap.currentRoughFilter = [{name:idFilter, value:}];
					if (applyHandler !== undefined)
						applyHandler();
				}
				//если был объявлен верхний фильтр, то при работе со средним выбранные значения будут заноситься в верхний
				else {
					//если открывался ещё средний фильтр, то выставляем currentRoughFilter для корректного нанесения геометрии на карту
					if (middleFilterSource !== undefined && middleFilterSource !== '' && filterType.indexOf('middle') !== -1) {
						var rr = [];
						WidgetMap.currentRoughFilter = [];
						for (var t = 0; t < showLayers.length; t++) {
							//устанавливаем в объект идентификаторы всех показываемых на карте слоёв
							var smallLayerId = showLayers[t];
							rr.push({name: "roughFilter", value: roughArr.join(","), layerName: smallLayerId});
							WidgetMap.currentRoughFilter.push({name: idFilter, value: roughArr.join(","), layerName: smallLayerId});
						}
					}
					var newData = '<data OBJ_IDS="' + roughArr.join(',') + '" TOP_FILTER="' + idFilter + '" ></data>';
					var treeDiv = $('#treeDiv');
					if(treeDiv.length > 0)
						treeDiv.myCategories('updateTopFilter', {params: newData});

					function checkFilter(filter) {
						WidgetMap.updateTopFilter(filter.params);
						var splittedFilter = filter.params[0].value.split('|');
						for (var i = 0; i < splittedFilter.length; i++) {
							if (splittedFilter[i].indexOf(filterName) != -1) {
								var filterValue = splittedFilter[i].split(':')[1];
								for (var k = 0; k < showLayers.length; k++) {
									//устанавливаем в объект идентификаторы всех показываемых на карте слоёв
									var smallLayerId = showLayers[k];
									WidgetMap.currentFilter[smallLayerId] = [];
									WidgetMap.currentFilter[smallLayerId].push({
										layerName: smallLayerId,
										filter: filterName,
										value: filterValue
									});
								}
								if (filterValue == '' || filterValue == 'VOID') {
									showInfo = true;
								}
								if (filterValue !== roughArr.join(',')) {
									return false;
								}
								break;
							}
						}
						return true;
					}

					var filter = (treeDiv.length > 0) ? treeDiv.myCategories('callbackFilter', {params: {}}) : undefined;
					if (filter && filter.params && filter.params.length > 0) {
						//добавляем проверку на выбранное кол-во записей перед открытием грида
						if (goog.isDef(idFilter)) {
							var filterName = idFilter;
							var start = Date.now();
							var timeout = 0;
							while (!checkFilter(filter) && timeout < 1000) {
								filter = (treeDiv.length > 0) ? treeDiv.myCategories('callbackFilter', {params: {}}) : undefined;
								timeout = Date.now() - start;
							}
						}
					}
					if (showInfo) {
						var text = gis_treeutils_3;
						var title = gis_treeutils_4;
						var buttons = [
							{text: gis_core_4, click: showGridDialog},
							{text: gis_core_5, click: closeDialog}
						];
						var dlg = App.confirmDialog(text, buttons, {title: title, width: 400});

						function closeDialog() {
							dlg.dialog('destroy');
							dlg.remove();
						}

						function showGridDialog() {
							if (applyHandler !== undefined)
								applyHandler();
							closeDialog();
						}
					} else if (applyHandler !== undefined)
						applyHandler(roughArr);
				}
			},
			cancelHandler: function (params) {
				$('#middleFilterDialog').remove();
			}
		}
	});

	var closeDiv = '<div id="middleFilterCloseDiv" class="middleFilterCloseDiv"></div>';
	middleFilterDiv.append(closeDiv);
	$('#middleFilterCloseDiv').on('click', function (event) {
		$('#middleFilterDialog').remove();
	});
	dlg.dialog({
		resizable: false,
		modal: true,
		dialogClass: 'noCloseButton noTitleBar gsi-zindex__dialog',
		width: 605,
		height: 440,
		title: ''
	});

};


ExternalInteraction.showLayers = function (showLayers, clearFilter) {
	if (showLayers.length > 0) {
		if (WidgetMap.layerManager !== undefined) {
			for (var index = 0; index < showLayers.length; index++) {
				var smallLayerId = showLayers[index];
				var layer = WidgetMap.layerManager.getLayerByName(smallLayerId);
				if (goog.isDef(layer)) {

					if (layer.filter !== undefined && layer.filter !== '' && WidgetMap.isModelsVector == true) {
						//если векторный слоё, и слой с фильтром, то очищасем слой и перезапрашиваем данные
						WidgetMap.layerManager.clearLayer(smallLayerId, true);
					}
					if(clearFilter === true){
						layer.filter = undefined;
						layer.filters = undefined;
						if(layer.layer){
							layer.layer.filter = undefined;
							layer.layer.filters = undefined;
						}
					}
					if (layer.visible != true)
						WidgetMap.layerManager.updateLayer(smallLayerId);
					WidgetMap.layerManager.enableLayer(smallLayerId);
				}
			}
		}
	}
}

ExternalInteraction.openTables = function (scenarioParams) {
	var timeout = 3000;
	if (scenarioParams !== undefined) {
		if (scenarioParams.openTableInterval !== undefined)
			timeout = scenarioParams.openTableInterval;
		//сначала подгружаем часть стиля для получения title грида
		var openTableTitle = scenarioParams.openTableTitle;
		var openTableGridId = scenarioParams.openTableGridId;
		var openTableLevelParams = scenarioParams.openTableLevelParams;
		var openTableShowDashboard = scenarioParams.openTableShowDashboard;
		var querySource = scenarioParams.querySource;
		var queryLayerId = scenarioParams.queryLayerId;
		var queryFileName = scenarioParams.queryFileName;
		//если есть данные для открытия гридов
		if (openTableTitle !== undefined && openTableGridId !== undefined && openTableLevelParams !== undefined
			&& querySource !== undefined && queryLayerId !== undefined && queryFileName !== undefined) {
			var openTableTitleArr = openTableTitle.replace('undefined|', '').split('|');
			var openTableGridIdArr = openTableGridId.replace('undefined|', '').split('|');
			var openTableLevelParamsArr = openTableLevelParams.replace('undefined|', '').split('|');
			var openTableShowDashboardArr = openTableShowDashboard?openTableShowDashboard.replace('undefined|', '').split('|'): undefined;
			var querySourceArr = querySource.replace('undefined|', '').split('|');
			var queryLayerIdArr = queryLayerId.replace('undefined|', '').split('|');
			var queryFileNameArr = queryFileName.replace('undefined|', '').split('|');
			var gridArr = [];

			function loadStyle() {
				if (gridArr.length > 0) {
					var gridItem = gridArr.pop();
					if (gridItem.title.indexOf('{') == -1) {
						ExternalInteraction.openTable(gridItem.gridId, gridItem.title, gridItem.levelParams, gridItem.showDashboard, scenarioParams.openTableMinimize);
						setTimeout(function () {
							loadStyle();
						}, timeout)
					} else
						App.serverQueryXmlFileNodeWithTries(Services.processQueryNodeXml,
							{
								descrId: gridItem.source,
								descrType: 'select',
								getSchema: false,
								toElements: false,
								data: '<root><data LAYER_ID="' + gridItem.layerId + '" FILE_NAME="' + gridItem.fileName + '"/></root>'
							},
							function (xmlElement) {
								var xmlData = ($.parseXML(xmlElement)).firstChild;
								var styles = xmlData.getElementsByTagName("Style");
								var i = 0;
								if (styles.length > 0) {
									var curStyle = styles[0];
									var descr = curStyle.getAttribute('descr');
									//открываем грид
									if (descr !== undefined && descr !== '') {
										ExternalInteraction.openTable(gridItem.gridId, descr, gridItem.levelParams, false, scenarioParams.openTableMinimize);
										setTimeout(function () {
											loadStyle();
										}, timeout)
									}
								}
							},
							function (xmlElement) {
							});
				}
			}

			//если количество данных для открытия гридов совпадает
			if (openTableTitleArr.length == openTableGridIdArr.length && openTableTitleArr.length == openTableLevelParamsArr.length &&
				openTableTitleArr.length == querySourceArr.length && openTableTitleArr.length == queryLayerIdArr.length &&
				openTableTitleArr.length == queryFileNameArr.length) {
				for (var i = 0; i < querySourceArr.length; i++) {
					if(queryLayerIdArr[i])
						gridArr.push({
							title: openTableTitleArr[i],
							source: querySourceArr[i],
							layerId: queryLayerIdArr[i],
							fileName: queryFileNameArr[i],
							gridId: openTableGridIdArr[i],
							levelParams: openTableLevelParamsArr[i],
							showDashboard: (openTableShowDashboardArr)?openTableShowDashboardArr[i]:undefined,
						});
				}
				loadStyle();
			}
		}
	}
}

//открытие грида
ExternalInteraction.openTable = function (gridId, descr, levelParams, showDashboard, minimize) {
	var prms = {
		event_name: 'FULL_GRID_EVENT_ID_MODULE',
		levelParams: levelParams, //"layerId=PODS_INSP_Layers.xml#"PODS_ILI_DATA_FEATURE;",
		vars: {
			functionName: '',
			gridId: gridId,
			layerId: '',
			mdl: 'Public/SWF/Grid_55.swf',
			needTopFilter: 'true',
			task: 'GRID',
			title: descr,
			useSynchCommands: 'false',
			windowTemplateId: 'gridWindow',
			onlyGrid: true,//новое, чтобы дальше не подгружались данные на карте для слоя,
			showDashboard: showDashboard,
			minimize: minimize,//нужно ли минимизировать размер грида, как при клике центровки
		}
	};
	ExternalInteraction.treeCallFunction(prms, 'clickButton');
};

/**
 * Реакция на кнопки в рубрикаторе
 * @param params
 */
ExternalInteraction.treeCallFunction = function (params, funcName) {
	var vars = params.vars;
	//флаг открытия грида в одной вкладке или каждый раз в новой
	//по умолчанию все гриды открываются в одной и той же вкладке, соответствующей данному id грида
	var useExistList = true;
	var useSynchCommands = false;//(WidgetMap && WidgetMap.config && WidgetMap.config.grid && WidgetMap.config.grid.duplicate === true);
	if (goog.isDefAndNotNull(vars)) {
		if (funcName === 'loadScenario') {
			//забираем флаг открытия среднегно фильтрна, список на открытие гридов и список на включение слоёв
			var middleFilterSource = '';//'MIDDLE_ILI_FILTER';
			var topFilterSource = '';//'ILI_INSP_FILTER;
			var filterType = '';
			if (vars.filterType !== undefined && vars.filterType !== '')
				filterType = vars.filterType;
			if (vars.middleFilterSource !== undefined && vars.middleFilterSource !== '')
				middleFilterSource = vars.middleFilterSource;
			if (vars.topFilterSource !== undefined && vars.topFilterSource !== '')
				topFilterSource = vars.topFilterSource;
			var showLayers = [];//['PODS_ILI_DATA','PODS_ILI_DATA_FEATURE'];
			if (vars.openLayers !== undefined && vars.openLayers !== '')
				showLayers = vars.openLayers;
			if (middleFilterSource !== '') {
				if (Array.isArray(middleFilterSource)) {
					ExternalInteraction.showSelectableFilter(filterType, topFilterSource, middleFilterSource, showLayers, function (selectedFilterIndex) {
						//выбираем тот средний фильтр за основу, который пришел из формы выбора
						vars.middleFilterSource = middleFilterSource[0];
						if (selectedFilterIndex < middleFilterSource.length)
							vars.middleFilterSource = middleFilterSource[selectedFilterIndex];
						if (selectedFilterIndex !== -1) {
							ExternalInteraction.showFilter(filterType, topFilterSource, vars.middleFilterSource, showLayers, function () {
								ExternalInteraction.showLayers(showLayers);
								ExternalInteraction.openTables(vars);
							})
						} else {
							//если selectedFilterIndex = -1 , значит выбрать всё
							ExternalInteraction.showLayers(showLayers, true);//флаг, чтобы удалить фильтр. нужно переработать
							ExternalInteraction.openTables(vars);
						}
					})
				} else {
					ExternalInteraction.showFilter(filterType, topFilterSource, middleFilterSource, showLayers, function () {
						//TODO рефакторинг
						if (WidgetMap.config && WidgetMap.config.grid && WidgetMap.config.grid.fullLayerId){
							var pArr = [],
								fullLayerId = WidgetMap.config.grid.fullLayerId.replace('#', '*');
							for (var key in WidgetMap.config.grid)
								pArr.push({name: key, value: WidgetMap.config.grid[key]});
							ExternalInteraction.openGrid({
									pArr: pArr,
									reload: useExistList,
									fullLayerId: fullLayerId,
									forceTopFilter: true,
								});
							return;
						}
						ExternalInteraction.showLayers(showLayers);
						ExternalInteraction.openTables(vars);
					})
				}
			} else {
				ExternalInteraction.showLayers(showLayers);
				ExternalInteraction.openTables(vars);
			}
		}
		if (funcName === 'clickButton') {
			if (params.event_name === 'FULL_GRID_EVENT_ID_MODULE') {
				var levelParams = params.levelParams;
				var fullLayerId = '';
				var smallLayerId = '';
				if (levelParams != '') {
					fullLayerId = levelParams.split('=')[1].split(';')[0];
					smallLayerId = fullLayerId.split('#')[1];
				}
				//1. Устанавливаем текущий фильтр
				var showInfo = false;
				//получили фильтры
				var treeDiv = $('#treeDiv');
				var filter = (treeDiv.length > 0) ? treeDiv.myCategories('callbackFilter', {params: params}) : undefined;
				WidgetMap.updateTopFilter(filter.params);
				var mapParams = [];
//                mapParams.push({name:'filter',value: filter.params});
				if (filter && filter.params && filter.params.length > 0) {
					mapParams.push(filter.params[0]);
					//добавляем проверку на выбранное кол-во записей перед открытием грида
					if (goog.isDef(vars.filter)) {
						var filterName = vars.filter;
						var splittedFilter = filter.params[0].value.split('|');
						for (var i = 0; i < splittedFilter.length; i++) {
							if (splittedFilter[i].indexOf(filterName) != -1) {
								var filterValue = splittedFilter[i].split(':')[1];
								WidgetMap.currentFilter[smallLayerId] = [];
								WidgetMap.currentFilter[smallLayerId].push({
									layerName: smallLayerId,
									filter: filterName,
									value: filterValue
								});
								if (filterValue == '' || filterValue == 'VOID') {
									showInfo = true;
								}
								break;
							}
						}
					}
				}

				//2.открываем грид
				var winTemplateId = 'default';
				var task = 'GRID';
				var needTopFilter = false;

				//upd 21.11.19 доавляем параметр, чтобы открывался только грид
				var onlyGrid = false;
				var pArr = [];
				var minimize = false;

				for (var item in vars) {
					switch (item) {
						//общие параметры
						case "gridId":
						case "template": {
							pArr.push({name: "template", value: vars[item]});
							break;
						}
						case "use_exist_list": {
							useExistList = vars[item];
							break;
						}
						case "task": {
							task = vars[item];
							break;
						}
						case "windowTemplateId": {
							winTemplateId = vars[item];
							break;
						}
						case "needTopFilter": {
							needTopFilter = (vars[item] == "true") ? true : false;
							break;
						}
						case "useSynchCommands": {
							useSynchCommands = (vars[item] == "true") ? true : false;
							break;
						}
						case "title": {
							pArr.push({name: item, value: "'" + vars[item] + "'"});
							break;
						}
						case "filter": {
							break;
						}
						case "layerId": {
							//забираем полный идентификатор из уровня дерева
							if (levelParams !== undefined) {
								fullLayerId = fullLayerId.replace("#", "*");
								pArr.push({name: "fullLayerId", value: fullLayerId});
							}
							break;
						}
						case "onlyGrid": {
							onlyGrid = vars[item];
							break;
						}
						case "minimize": {
							minimize = vars[item];
							break;
						}
						default: {/*остальные параметры*/
							pArr.push({name: item, value: vars[item]});
							break;
						}
					}
				}
				if (!onlyGrid)
					WidgetMap.currentRoughFilter = [];
				if (showInfo) {
					var text = gis_treeutils_3;
					var title = gis_treeutils_4;
					var buttons = [
						{text: gis_core_4, click: showGridDialog},
						{text: gis_core_5, click: closeDialog}
					];
					var dlg = App.confirmDialog(text, buttons, {title: title, width: 400});

					function closeDialog() {
						dlg.dialog('destroy');
						dlg.remove();
					}

					function showGridDialog() {
						//временное условие, если типа filteredWkbLayer, у которого есть filter
						var layer = (WidgetMap.layerManager) ? WidgetMap.layerManager.getLayerByName(smallLayerId) : undefined;
						//layer.layer.dataReady_ = false;
						if (goog.isDef(layer) && goog.isDef(layer.filter) && layer.filter != '' && !onlyGrid) {
							mapParams.push({name: 'layerId', value: smallLayerId});
							if (goog.isDefAndNotNull(WidgetMap.layerManager)) {
								if (WidgetMap.isModelsVector == true) {
									//если векторный слоё, и слой с фильтром, то очищасем слой и перезапрашиваем данные
									WidgetMap.layerManager.clearLayer(smallLayerId, true);

								}
								if (layer.visible == true)
									WidgetMap.layerManager.enableLayer(smallLayerId);
								else
									WidgetMap.layerManager.updateLayer(smallLayerId);
							}
							if (WidgetMap.isModelsVector == false)
								ExternalInteraction.callFunction('', 'updateCacheLayer', mapParams, true);
						}
						closeDialog();
						if (useExistList) {
							//открываем новое окно
							ExternalInteraction.openGrid({
								pArr: pArr,
								reload: useExistList,
								fullLayerId: fullLayerId,
								forceTopFilter: true,
								minimize: minimize,
								ignoreLabelColumn: true,
							});

						} else {
							//выбираем нулевое окно
							var funcResult = ExternalInteraction.callFunction('', funcName, params);
							//если не предусмотрены сообщения об ошибках на функциях синхронизации
						}
					}
				} else {
					if (useExistList) {
						if (WidgetMap.layerManager != undefined && !onlyGrid) {
							var layer = WidgetMap.layerManager.getLayerByName(smallLayerId);
							//if(goog.isDef(layer))
							//  layer.layer.dataReady_ = false;
							if (goog.isDef(layer) && goog.isDef(layer.filter) && layer.filter != '') {
								mapParams.push({name: 'layerId', value: smallLayerId});
								if (goog.isDefAndNotNull(WidgetMap.layerManager)) {
									if (WidgetMap.isModelsVector == true) {
										//если векторный слоё, и слой с фильтром, то очищасем слой и перезапрашиваем данные
										WidgetMap.layerManager.clearLayer(smallLayerId, true);
									}
									if (layer.visible == true)
										WidgetMap.layerManager.enableLayer(smallLayerId);
									else
										WidgetMap.layerManager.updateLayer(smallLayerId);
								}
								if (WidgetMap.isModelsVector == false)
									ExternalInteraction.callFunction('', 'updateCacheLayer', mapParams, true);
							}
						}
						ExternalInteraction.openGrid({
							pArr: pArr,
							reload: useExistList,
							fullLayerId: fullLayerId,
							forceTopFilter: true,
							minimize: minimize,
							ignoreLabelColumn: true,
						});
					} else {
						//выбираем нулевое окно
						var funcResult = ExternalInteraction.callFunction('', funcName, params);
						//если не предусмотрены сообщения об ошибках на функциях синхронизации
					}
				}
			}
			//открываем окошко среднего фильтра в попапе
			if (params.event_name === 'FULL_GRID_ROUGH_FILTER_MODULE') {
				WidgetMap.currentRoughFilter = [];
				var levelParams = params.levelParams;
				var fullLayerId = levelParams.split('=')[1].split(';')[0];
				var smallLayerId = fullLayerId.split('#')[1];
				//1. Устанавливаем текущий фильтр
				//получили фильтры
				var treeDiv = $('#treeDiv');
				var filter = (treeDiv.length > 0) ? treeDiv.myCategories('callbackFilter', {params: params}) : undefined;
				WidgetMap.updateTopFilter(filter.params);
				var mapParams = [];
//                mapParams.push({name:'filter',value: filter.params});
				if (filter && filter.params && filter.params.length > 0)
					mapParams.push(filter.params[0]);
				mapParams.push({name: 'layerId', value: smallLayerId});
				//2.открываем грид
				var winTemplateId = 'default',
					task = 'GRID',
					functionName = 'filterData',
					needTopFilter = false,
					popupTitle = '',
					requestId = '',
					variableName = '',
					addParams = undefined;

				var maxCnt = 1;

				var pArr = [];


				for (var item in vars) {
					switch (item) {
						//общие параметры
						case "gridId":
						case "template": {
							pArr.push({name: "template", value: vars[item]});
							break;
						}
						case "task": {
							task = vars[item];
							break;
						}
						case "windowTemplateId": {
							winTemplateId = vars[item];
							break;
						}
						case "use_exist_list": {
							useExistList = vars[item];
							break;
						}
						case "needTopFilter": {
							needTopFilter = (vars[item] == "true") ? true : false;
							break;
						}
						case "useSynchCommands": {
							useSynchCommands = (vars[item] == "true") ? true : false;
							break;
						}
						case "title": {
							pArr.push({name: item, value: "'" + vars[item] + "'"});
							popupTitle = vars[item];
							break;
						}
						case "winTitle": {
							popupTitle = vars[item];
							break;
						}
						case "maxRecords": {
							maxCnt = vars[item];
							break;
						}
						case "filter": {
							break;
						}
						case "requestId": {
							requestId = vars[item];
							break;
						}
						case "variableName": {
							variableName = vars[item];
							break;
						}
						case "layerId": {
							//забираем полный идентификатор из уровня дерева
							if (levelParams !== undefined) {
								fullLayerId = fullLayerId.replace("#", "*");
								pArr.push({name: "fullLayerId", value: fullLayerId});
							}
							break;
						}
						default: {/*остальные параметры*/
							pArr.push({name: item, value: vars[item]});
							break;
						}
					}
				}

				if (needTopFilter)
					addParams = '<data ' + LayerManager.getTopFiltersString(WidgetMap.currentTopFilter) + ' />';
				$('#roughFilterDialog').remove();

				$('body').append('<div id="roughFilterDialog"></div>');
				var dlg = $('#roughFilterDialog');
				var filterControl = "<mx:VBox xmlns:mx='http://www.adobe.com/2006/mxml' xmlns:components='ru.corelight.view.components.*'><components:FilterPopUpButton width='100%' isDropDown='false' minPopupWidth='610' height='22' title='" + popupTitle + "' selectAllElements='false' minCnt='0' maxCnt='" + maxCnt + "' id='" + variableName + "' dataProvider='" + requestId + "' /> </mx:VBox>";
				dlg.append('<div id="roughFilterDiv"></div>');
				//upd. 08.08.19 только для ЭХЗ среднего фильтра добавляем курсор ожидания
				var showLoader = false;
				showLoader = variableName == 'PI_CP_EVENT_ID';
				var roughFilterDiv = $('#roughFilterDiv');
				roughFilterDiv.myFilters({
					showLoader: showLoader,
					addParams: addParams,
					dataXML: filterControl, handlers: {
						applyHandler: function (params) {
							var rr = [];
							pArr.push({name: 'roughRequestId', value: requestId});
							var resFilterValues = roughFilterDiv.myFilters('getFilterValuesArray');
							var dotSplitArr = resFilterValues[0].values;
							//Если не выбрано ни одной записи или выбраны все - не включаем в фильтрацию
							var roughArr = [];
							for (var j = 0; j < dotSplitArr.length; j++) {
								roughArr.push(dotSplitArr[j].code);
							}
							//fix для postgres, т.к. пустые кавычки вызывают ошибку синтаксиса
							if (dotSplitArr.length == 0) {
								roughArr.push('NULL');
							}
							$('#roughFilterDialog').remove();
							rr.push({name: "roughFilter", value: roughArr.join(","), layerName: smallLayerId});
							pArr.push({
								name: "roughFilter",
								value: variableName + ":" + roughArr.join(","),
								layerName: smallLayerId
							});
							WidgetMap.currentFilter[smallLayerId] = [];
							WidgetMap.currentFilter[smallLayerId].push({
								layerName: smallLayerId,
								filter: variableName,
								value: roughArr.join(",")
							});
							WidgetMap.currentRoughFilter = rr;//{layerId:smallLayerId,roughFilter:rr};
							if (WidgetMap.layerManager != undefined) {
								var layer = WidgetMap.layerManager.getLayerByName(smallLayerId);
								if (goog.isDef(layer) && layer.filter != '') {
									pArr.push({name: 'layerId', value: smallLayerId});
									if (goog.isDefAndNotNull(WidgetMap.layerManager)) {
										if (WidgetMap.isModelsVector == true) {
											//если векторный слоё, и слой с фильтром, то очищасем слой и перезапрашиваем данные
											WidgetMap.layerManager.clearLayer(smallLayerId, true);

										}
										WidgetMap.layerManager.enableLayer(smallLayerId);
									}
									ExternalInteraction.callFunction('', 'updateCacheLayer', pArr, true);
								}
							}

							ExternalInteraction.openGrid({
								pArr: pArr,
								reload: useExistList,
								fullLayerId: fullLayerId,
								forceTopFilter: true,
							});
						},
						cancelHandler: function (params) {
							$('#roughFilterDialog').remove();
						}
					}
				});
				var closeDiv = '<div id="middleFilterCloseDiv" class="middleFilterCloseDiv"></div>';
				roughFilterDiv.append(closeDiv);
				$('#middleFilterCloseDiv').on('click', function (event) {
					$('#roughFilterDialog').remove();
				});
				dlg.dialog({
					resizable: false,
					modal: true,
					dialogClass: 'noCloseButton noTitleBar gsi-zindex__dialog',
					width: 605,
					height: 440,
					title: ''
				});
			}
			if (params.event_name === 'exportToExcelFromTree') {
				//получили фильтры
				var filter = $('#treeDiv').myCategories('callbackFilter', {params: params});

				var filtersObj = ExternalInteraction.topFilterStrToObject(filter.params);


				ExportUtil.exportToExcel([], 'file', 'server_export', vars['dataRequestId'], filtersObj);
			}

			if (params.event_name === 'importPointGPS') {
				ImportUtil.importPOIPointTrack('point');
			}
			if (params.event_name === 'importTrackGPS') {
				ImportUtil.importPOIPointTrack('track');
			}
			//заглушки для кнопок экспорта
			if (params.event_name === 'exportImgFromTree') {
				App.confirmDialog(gis_treeutils_2, null, {width: 482});
			}
			if (params.event_name === 'exportWrmlFromTree') {
				App.confirmDialog(gis_treeutils_1, null, {width: 467});
			}
			if (params.event_name === 'checkBufferFromTree') {
				if (goog.isDef(vars) && goog.isDef(vars.classId) && vars.classId != '')
					if (goog.isDef(WidgetMap))
						WidgetMap.checkCadastreMDR(vars.classId);
			}
			//заглушка для создания объекта
			if (params.event_name === 'createObjectFromTree') {
				if (goog.isDef(vars) && goog.isDef(vars.classId) && vars.classId != '') {
					if (goog.isDef(WidgetMap) && goog.isDef(WidgetMap.addObjectControl)) {
						widgetMoveWindowToPosition('grid');
						WidgetMap.addObjectControl.handleAddObjectClick_({addFromTree: true, layerName: vars.classId});
					}
				}
			}
		}
		if (funcName === 'enableLayer') {
			var p = vars.layerParams.split('=');
			var obj = [{name: p[0], value: p[1].split(';')[0]}];
			var lName = p[1].split(';')[0];
			var layer = WidgetMap.layerManager.getVectorLayerByName(lName);
			if (goog.isDef(layer)) {
				layer.visible = true;
			} else {
				return;
			}

			if (WidgetMap.isModelsVector == true) {//если слой векторный, то данные подгружаем на карту.
				if (layer.filter === undefined)
					layer.layer.setVisible(layer.visible);
				else {
					layer.layer.setVisible(layer.visible);
					//проверка, есть ли флаг, то эмулируем открытие среднего фильтра
					/*if (goog.isDef(vars.needPreOpenRoughFilter) && vars.needPreOpenRoughFilter == 'true' && layer.layer.needPreOpenRoughFilter == false) {
						layer.layer.needPreOpenRoughFilter = true;
						var p = {};
						if (goog.isDef(params.tree) && goog.isDef(params.tree.invokes) && goog.isDef(vars.invokeName) && vars.invokeName != '') {
							p.event_name = params.tree.invokes[vars.invokeName].event_name;

							var gridVars = params.tree.invokes[vars.invokeName].vars;
							p.vars = gridVars;
							for (var vv in gridVars) {
								if (goog.isDef(vars[vv]))
									p.vars[vv] = vars[vv];
							}
							p.levelParams = vars.levelParams;
							ExternalInteraction.treeCallFunction(p, 'clickButton');
						}
					}*/
				}
			}
		}

		if (funcName === 'disableLayer') {
			var p = vars.layerParams.split('=');
			var obj = [{name: p[0], value: p[1].split(';')[0]}];
			var lName = p[1].split(';')[0];
			var layer = WidgetMap.layerManager.getLayerByName(lName);
			if (goog.isDef(layer)) {
				layer.visible = false;
			} else {
				return;
			}
			if (WidgetMap.isModelsVector == true) {//если слой векторный, то данные подгружаем на карту.
				var params = {windowId: ''};
				/*var filter = $('#treeDiv').myCategories('callbackFilter', {params: params});
				WidgetMap.updateTopFilter(filter.params);*/
				layer.layer.setVisible(layer.visible);
			}
		}

		if (funcName === 'checkHead') {
			//проверка на виджет
			var isWidget = Auth.getParameterByName("w") == '1' && Auth.getParameterByName("task") == 'ILI_WIDGET';
			if (isWidget && ExternalInteraction.firstCheckHead == true) {
				ExternalInteraction.firstCheckHead = false;
				return;
			}
			var maxCnt = vars.maxCnt;
			var popupTitle = vars.title;
			var variableName = vars.variableName;
			var requestId = vars.dataProvider;
			//проверяем , установлено ли что-то в фильтре верхнего уровня. Если да, то добавляем id в фильтра
			var selectedItems = undefined;
			var lastSelected = [];
			if (goog.isDef(variableName) && variableName != '') {
				var filter = $('#treeDiv').myCategories('callbackFilter', {params: params});
				if (filter.params.length > 0) {
					//добавляем проверку на выбранное кол-во записей перед открытием грида
					var filterName = variableName;
					var splittedFilter = filter.params[0].value.split('|');
					for (var ii = 0; ii < splittedFilter.length; ii++) {
						if (splittedFilter[ii].indexOf(filterName) != -1) {
							var filterValue = splittedFilter[ii].split(':')[1];
							var splittedValues = filterValue.split(',');
							for (var sv in splittedValues)
								lastSelected.push({CODE: splittedValues[sv]});
							break;
						}
					}
				}
				if (lastSelected.length > 0) {
					selectedItems = {};
					selectedItems[variableName] = {lastSelected: lastSelected}
				}

			}

			$('#topFilterDialog').remove();
			$('body').append('<div id="topFilterDialog"></div>');
			var dlg = $('#topFilterDialog');
			var filterControl = "<mx:VBox xmlns:mx='http://www.adobe.com/2006/mxml' xmlns:components='ru.corelight.view.components.*'><components:FilterPopUpButton width='100%' isDropDown='false' minPopupWidth='610' height='22' title='" + popupTitle + "' selectAllElements='false' minCnt='0' maxCnt='" + maxCnt + "' id='" + variableName + "' dataProvider='" + requestId + "' /> </mx:VBox>";
			dlg.append('<div id="topFilterDiv"></div>');
			var topFilterDiv = $('#topFilterDiv');
			topFilterDiv.myFilters({
				selectedItems: selectedItems,
				dataXML: filterControl, handlers: {
					applyHandler: function (params) {
						//устанавливаем верхний фильтр
						var resFilterValues = topFilterDiv.myFilters('getFilterValuesArray');
						var dotSplitArr = resFilterValues[0].values;
						//Если не выбрано ни одной записи или выбраны все - не включаем в фильтрацию
						var roughArr = [];
						for (var j = 0; j < dotSplitArr.length; j++) {
							roughArr.push(dotSplitArr[j].code);
						}
						if (dotSplitArr.length == 0) {
							roughArr.push('NULL');
						}
						$('#topFilterDialog').remove();
						var newData = '<data OBJ_IDS="' + roughArr.join(',') + '" TOP_FILTER="' + resFilterValues[0].idFilter + '" ></data>';
						$('#treeDiv').myCategories('updateTopFilter', {params: newData});
						//эмуляция клика по кнопке "показать список" слоя PODS_ILI_DATA "Данные ВТД. Дефекты"

						var prms = {
							event_name: 'FULL_GRID_EVENT_ID_MODULE',
							levelParams: "layerId=PODS_INSP_Layers.xml#PODS_ILI_DATA;",
							vars: {
								filter: 'ILI_INSP_FILTER',
								functionName: '',
								gridId: 'PODS_ILI_DATA_LIST',
								layerId: '',
								mdl: 'Public/SWF/Grid_55.swf',
								needTopFilter: 'true',
								task: 'GRID',
								title: gis_treeutils_7,
								useSynchCommands: 'false',
								useExistList: 'true',
								windowTemplateId: 'gridWindow'
							}
						};

						var smallLayerId = "PODS_ILI_DATA";
						var filter = $('#treeDiv').myCategories('callbackFilter', {params: {}});

						function checkFilter(filter) {
							WidgetMap.updateTopFilter(filter.params);
							var splittedFilter = filter.params[0].value.split('|');
							for (var i = 0; i < splittedFilter.length; i++) {
								if (splittedFilter[i].indexOf(filterName) != -1) {
									var filterValue = splittedFilter[i].split(':')[1];
									WidgetMap.currentFilter[smallLayerId] = [];
									WidgetMap.currentFilter[smallLayerId].push({
										layerName: smallLayerId,
										filter: filterName,
										value: filterValue
									});
									if (filterValue == '' || filterValue == 'VOID') {
										showInfo = true;
									}
									if (filterValue !== roughArr.join(',')) {
										return false;
									}
									break;
								}
							}
							return true;
						}

						if (filter.params.length > 0) {
							//добавляем проверку на выбранное кол-во записей перед открытием грида
							if (goog.isDef(prms.vars.filter)) {
								var filterName = prms.vars.filter;
								var start = Date.now();
								var timeout = 0;
								while (!checkFilter(filter) && timeout < 1000) {
									filter = $('#treeDiv').myCategories('callbackFilter', {params: {}});
									timeout = Date.now() - start;
								}
							}
						}

						if (WidgetMap.layerManager != undefined) {
							var layer = WidgetMap.layerManager.getLayerByName(smallLayerId);
							if (goog.isDef(layer) && goog.isDef(layer.filter) && layer.filter != '') {
								if (WidgetMap.isModelsVector == true) {
									//если векторный слоё, и слой с фильтром, то очищасем слой и перезапрашиваем данные
									WidgetMap.layerManager.clearLayer(smallLayerId, true);
								}
								if (layer.visible == true)
									WidgetMap.layerManager.enableLayer(smallLayerId);
								else
									WidgetMap.layerManager.updateLayer(smallLayerId);
							}
						}

					},
					cancelHandler: function (params) {
						$('#topFilterDialog').remove();
					}
				}
			});

			var closeDiv = '<div id="middleFilterCloseDiv" class="middleFilterCloseDiv"></div>';
			topFilterDiv.append(closeDiv);
			$('#middleFilterCloseDiv').on('click', function (event) {
				$('#topFilterDialog').remove();
			});
			dlg.dialog({
				resizable: false,
				modal: true,
				dialogClass: 'noCloseButton noTitleBar gsi-zindex__dialog',
				width: 605,
				height: 440,
				title: ''
			});
		}
	}
};

ExternalInteraction.topFilterStrToObject = function (params) {
	for (var j = 0; j < params.length; j++) {
		var curParam = params[j];
		if (!curParam.hasOwnProperty('name')) continue;

		var newFilters = [];
		var curFilters;
		var newFilterObj = {};
		switch (curParam['name']) {
			case 'filter':
			case 'roughFilter':
				curFilters = curParam['value'].split('|');
				for (var i = 0; i < curFilters.length; i++) {
					var nameValArr = curFilters[i].split(':');
					if (nameValArr && nameValArr.length == 2) {
						//var newFilterObj = { name: nameValArr[0], value: nameValArr[1] };

						var splittedIds = nameValArr[1].split(',');

						for (var t = 0; t < splittedIds.length; t++) {
							var pp = parseInt(splittedIds[t]);
							if (isNaN(pp))
								splittedIds[t] = "'" + splittedIds[t] + "'";
						}
						newFilterObj[nameValArr[0]] = splittedIds.toString();//nameValArr[1] ;
//                        newFilters.push(newFilterObj);
					}
				}

				break;
			case 'layerId':
				break;
		}
		return newFilterObj;
	}
	return null;
};

ExternalInteraction.getLayersVisibility = function (params) {
	if (!goog.isDef(WidgetMap.layerManager)) {
		var res = [];
		for (var i in params) res.push({layerName: params[i].layer, visible: false});
		return res;
	}
	for (var i in params) {
		var isVisible = WidgetMap.layerManager.getLayerVisibility(params[i].layer);
		params[i].visible = isVisible;
		params[i].layerName = params[i].layer;
	}
	return params;
};

//открытие грида
ExternalInteraction.openGrid = function (opt_options, callback) {
	var options = opt_options !== undefined ? opt_options : {};
	var pArr = [];
	var url = options.url || location.href;
	var reload = options.reload !== undefined && options.reload === true;
	//использовать ли в Tab только один грид
	var singleTab = options.singleTab !== undefined && options.singleTab === true;
	var fullLayerId = options.fullLayerId;
	var parentRoughFilter = options.parentRoughFilter;
	var staticParentRoughFilter = options.staticParentRoughFilter;
	var parentRoughParams = options.parentRoughParams;
	var parentGridFilter = options.parentGridFilter;
	var	parentGridRowId = options.parentGridRowId;
	var minimize = options.minimize;
	var ignoreLabelColumn = options.ignoreLabelColumn || false;

	var filterMap = options.filterMap;
	var ignoreLabelColumn = options.ignoreLabelColumn === true;
	try {
		if (options.pArr) {
			pArr = options.pArr;
		} else {
			if (!options.gridId)
				return;
			var gridId = options.gridId;
			var parentGrid = options.parentGrid;
			var childGrid = options.childGrid;
			var position = (options.position !== undefined) ? options.position : -1;
			var showDashboard = options.showDashboard || false;
			if (options.pArr === undefined) {
				pArr.push({name: "fullLayerId", value: fullLayerId.replace("#", "*")});
				pArr.push({name: "template", value: gridId});
				pArr.push({name: "title", value: "'" + options.label + "'"});
				pArr.push({name: "filter", value: options.data});
				pArr.push({name: "parentRoughFilter", value: options.parentRoughFilter});
				pArr.push({name: "parentRoughParams", value: options.parentRoughParams});
				pArr.push({name: "staticParentRoughFilter", value: options.staticParentRoughFilter});
				pArr.push({name: "filterMap", value: options.filterMap});
				pArr.push({name: "parentGrid", value: parentGrid});
				pArr.push({name: "childGrid", value: childGrid});
				pArr.push({name: "position", value: position});
				pArr.push({name: "showDashboard", value: '' + showDashboard});// из-за того, что далее сравнение строковое
				pArr.push({name: "ignoreLabelColumn", value: '' + ignoreLabelColumn});// из-за того, что далее сравнение строковое
				pArr.push({name: "parentGridFilter", value: options.parentGridFilter});
				pArr.push({name: "parentGridRowId", value: options.parentGridRowId});
			}
		}
		if (reload && !singleTab) {
			var gridWidget = GridUtil.findTabByLayerName(fullLayerId.replace("#", "*"));
			if (gridWidget) {
				gridWidget.ignoreLabelColumn = ignoreLabelColumn;
				if(ignoreLabelColumn){
					GridUtil.emulateShowAllClick(gridWidget.id, true, true);
				}
				gridWidget.updateGridContent(options.data, options.forceTopFilter, reload, parentRoughFilter, filterMap, parentRoughParams, staticParentRoughFilter);
				return;
			}
		}
		if(singleTab){
			var tabNav = $('#gridTabNavigator');
			if(tabNav.length){
				var tabCount =  tabNav.jqxTabs('length');
				for(var t = 0; t < tabCount; t++){
					tabNav.jqxTabs('removeAt', t);
				}
			}
		}
		//открываем новое окно
		openNewWindow(url, "gridWindow", "GRID", pArr, callback, minimize);
	} catch (ex) {

	}
};




/**
 * Выполнение сценария для поискового движка
 * @param currentObject  "PODS_ILI_INSPECTION:1302016"
 * @param categoryId "ILI_INSP"
 */
ExternalInteraction.processScenario = function (currentObject, categoryId) {
	if (WidgetMap.config.search_engine && WidgetMap.config.search_engine.templates && WidgetMap.config.search_engine.templates[categoryId]) {
		var scenario = WidgetMap.config.search_engine.templates[categoryId].scenario;
		if (scenario) {
			var showLayers = (scenario.openLayers) ? scenario.openLayers : [];//['PODS_ILI_DATA','PODS_ILI_DATA_FEATURE'];
			//забираем флаг открытия среднегно фильтрна, список на открытие гридов и список на включение слоёв
			var middleFilterSource = '';//'MIDDLE_ILI_FILTER';
			var topFilterSource = '';//'ILI_INSP_FILTER;
			var filterType = '';
			var openTableInterval = (scenario.openTableInterval) ? scenario.openTableInterval : 3000;
			//установить верхний фильтр
			var filterParams = [{name: 'filter', value: 'ILI_INSP_FILTER:' + currentObject.split(':')[1]}]
			WidgetMap.updateTopFilter(filterParams);
			var filterName = 'ILI_INSP_FILTER';
			var splittedFilter = filterParams[0].value.split('|');
			for (var i = 0; i < splittedFilter.length; i++) {
				if (splittedFilter[i].indexOf(filterName) !== -1) {
					var filterValue = splittedFilter[i].split(':')[1];
					for (var k = 0; k < showLayers.length; k++) {
						//устанавливаем в объект идентификаторы всех показываемых на карте слоёв
						var smallLayerId = showLayers[k];
						WidgetMap.currentFilter[smallLayerId] = [];
						WidgetMap.currentFilter[smallLayerId].push({
							layerName: smallLayerId,
							filter: filterName,
							value: filterValue
						});
					}
					break;
				}
			}
			var filter = scenario.filter;
			if (filter) {
				if (filter.type)
					filterType = filter.type;
				if (filter.middleFilterSource)
					middleFilterSource = filter.middleFilterSource;
				if (filter.topFilterSource)
					topFilterSource = filter.topFilterSource;
			}

			if (middleFilterSource !== '') {
				ExternalInteraction.showFilter(filterType, topFilterSource, middleFilterSource, showLayers, function () {
					ExternalInteraction.showLayers(showLayers);
					ExternalInteraction.showTables(scenario.openTables);
				})
			} else {
				ExternalInteraction.showLayers(showLayers);
				ExternalInteraction.showTables(scenario.openTables);
			}
		}
	}
}

ExternalInteraction.showTables = function (tables) {
	if (tables && tables.length === 0)
		return;
	var table = tables.pop();
	ExternalInteraction.openTable(table.gridId, table.title, table.levelParams);
	setTimeout(function () {
		ExternalInteraction.showTables(tables);
	}, 3000);
};

/**
 * Возвращает распарсенные параметры задачи
 * @param {*} taskName
 */
ExternalInteraction.parseTask = function (taskName){
	App.serverQueryJSON('./Core/UITasks/'+taskName.toLowerCase()+'.json', result, fault);
	function fault(res) {
		App.errorReport(gis_main55_2, res, undefined, {filename:gis_filename_110, functionname:'gis_filename_110_12'});
	}
	function result(res) {
		try {
			if (res !== undefined && res.code === 200) {
				var scenario;
				if (res.tree && res.tree.trees && res.tree.trees.length > 0)
					scenario = res.tree.trees[0].startupScenario;
				if (WidgetMap) WidgetMap.config = res;
				if (scenario) {
					//забираем флаг открытия среднегно фильтрна, список на открытие гридов и список на включение слоёв
					var filter = scenario.filter;
					var middleFilterSource = '';//'MIDDLE_ILI_FILTER';
					var topFilterSource = '';//'ILI_INSP_FILTER;
					var filterType = '';
					if (filter.type !== undefined && filter.type !== '')
						filterType = filter.type;
					if (filter.middleDataSource !== undefined && filter.middleDataSource !== '')
						middleFilterSource = filter.middleDataSource;
					if (filter.topDataSource !== undefined && filter.topDataSource !== '')
						topFilterSource = filter.topDataSource;
					var showLayers = [];
					if (middleFilterSource !== '') {
						ExternalInteraction.showFilter(filterType, topFilterSource, middleFilterSource, showLayers, function (ids) {
							var objectFullId = 'PODS_ROUTE:' + ids.join(':');
							App.loadDocuments('#postswrapper', objectFullId, 'objId', true);
						});
					}
				}
			}
		}
		catch(ex) {
			App.errorReport(gis_main55_2, ex, undefined, {filename:gis_filename_110, functionname:'gis_filename_483_6'});
		}
	}
}
//Глобальный объект
GeoUtil = {};
//константы проекций
GeoUtil.PROJS = {
	'EPSG:4284':'EPSG:4284',//Пулково84
	'Pulkovo42':'EPSG:4284',//Пулково84
	'EPSG:4326':'EPSG:4326',//WGS 84
	'WGS84':'EPSG:4326',//WGS 84
	'EPSG:900913':'EPSG:900913',//Google Mercator
	'GoogleMercator':'EPSG:900913',//Google Mercator
	'EPSG:3857':'EPSG:3857',//Google Mercator
	'EPSG:3395':'EPSG:3395',//Проекция Яндекса
	'EPSG:5807':'EPSG:5807'//Проекция тех схемы и пка
};
//Функции
GeoUtil.P42WGS = function(y, x, h1) {
	if (h1===undefined || h1===null) h1 = 0;
	// y - широта
	// x - долгота
	y = y*Math.PI/180;
	x = x*Math.PI/180;

	//Параметры эллипсоида CK-42
	var a1=6378245;
	var e1=0.0066934216;

	//Параметры эллипсоида WGS
	var a2=6378137;
	var e2=0.00669438;
	var N1=a1/Math.sqrt(1-e1*Math.pow(Math.sin(y),2));

	//Геоцентрические прямоугольные координаты в CK-42
	var x1=(N1+h1)*Math.cos(y)*Math.cos(x);
	var y1=(N1+h1)*Math.cos(y)*Math.sin(x);
	var z1=((1-e1)*N1+h1)*Math.sin(y);
	var coeff = 1-0.12E-6;

	//Геоцентрические прямоугольные координаты в WGS
	var x2=coeff*(x1-4.363321062E-6*y1+1.939259378E-6*z1)+26.3;
	var y2=coeff*(4.36332313E-6*x1+y1-1.066581637E-6*z1)-132.6;
	var z2=coeff*(-1.939254724E-6*x1+1.066590098E-6*y1+z1)-76.3;

	var l2=Math.atan(y2/x2);
	if (x2<0)
	{
		if (y2<0)
		{
			l2-=Math.PI;
		}
		else
		{
			l2+= Math.PI;
		}
	}
	var b2=y;

	var N2 = 0;

	for(var i=0; i<3; i++)
	{
		N2=a2/Math.sqrt(1-e2*Math.pow(Math.sin(b2),2));
		b2 = Math.atan((z2+e2*N2*Math.sin(b2))/Math.sqrt(x2*x2+y2*y2));
	}

	var h2=x2/Math.cos(l2)/Math.cos(b2)-N2;
	b2 = b2*180/Math.PI;
	l2 = l2*180/Math.PI;
	//Объект-точка
	return {x:l2, y:b2};
};

GeoUtil.WGSP42 = function(y, x, h1) {
	if (h1===undefined || h1===null) h1 = 0;
	// y - широта
	// x - долгота
	y = y*Math.PI/180;
	x = x*Math.PI/180;

	//Параметры эллипсоида WGS
	var a1=6378137;
	var e1=0.00669438;

	//Параметры эллипсоида CK-42
	var a2=6378245;
	var e2=0.0066934216;
	var N1=a1/Math.sqrt(1-e1*Math.pow(Math.sin(y),2));

	//Геоцентрические прямоугольные координаты в WGS
	var x1=(N1+h1)*Math.cos(y)*Math.cos(x);
	var y1=(N1+h1)*Math.cos(y)*Math.sin(x);
	var z1=((1-e1)*N1+h1)*Math.sin(y);
	var coeff = 1-0.12E-6;

	//Геоцентрические прямоугольные координаты в CK-42
	/*
	 var x2=coeff*(x1+3.849423968E-6*y1-2.3755816253E-6*z1)-26.3;
	 var y2=coeff*(-3.849420628E-6*x1+y1+1.4059688198E-6*z1)+132.6;
	 var z2=coeff*(2.3755870374E-6*x1-1.4059596752E-6*y1+z1)+76.3;
	 */
	var x2=coeff*(x1+4.363321062E-6*y1-1.939259378E-6*z1)-26.3;
	var y2=coeff*(-4.36332313E-6*x1+y1+1.066581637E-6*z1)+132.6;
	var z2=coeff*(1.939254724E-6*x1-1.066590098E-6*y1+z1)+76.3;
	var l2=Math.atan(y2/x2);
	if (x2<0)
	{
		if (y2<0)
		{
			l2-=Math.PI;
		}
		else
		{
			l2+= Math.PI;
		}
	}
	var b2=y;
	var N2 = 0;
	for(var i=0; i<3; i++)
	{
		N2=a2/Math.sqrt(1-e2*Math.pow(Math.sin(b2),2));
		b2 = Math.atan((z2+e2*N2*Math.sin(b2))/Math.sqrt(x2*x2+y2*y2));
	}

	var h2=x2/Math.cos(l2)/Math.cos(b2)-N2;
	b2 = b2*180/Math.PI;
	l2 = l2*180/Math.PI;
	//Объект-точка
	return {x:l2, y:b2};
};

//Прямоугольник из пулково в WGS
GeoUtil.RectP42WGS = function(data) {
	if (data != null)
	{
		var topA = GeoUtil.P42WGS(data.top, data.right);
		var btmA = GeoUtil.P42WGS(data.bottom, data.left);
		var r = {};
		r.top = topA.y;
		r.left = btmA.x;
		r.bottom = btmA.y;
		r.right = topA.x;
		return r;
	}
	return null;
};

//Прямоугольник из WGS в пулково
GeoUtil.RectWGSP42 = function(data) {
	if (data != null)
	{
		var topA = GeoUtil.WGSP42(data.top, data.right);
		var btmA = GeoUtil.WGSP42(data.bottom, data.left);
		var r = {};
		r.top = topA.y;
		r.left = btmA.x;
		r.bottom = btmA.y;
		r.right = topA.x;
		return r;
	}
	return null;
};


/**
 * Конвертация дополнительных слоёв на карте(слой выделения, слой рисования, буферный,..)
 * @param vectorLayers
 * @param source
 * @param dest
 */
GeoUtil.convertAdditionalGeometryFromToDefault = function(vectorLayers,source,dest){
	if(source === GeoUtil.PROJS['EPSG:900913'])
		source = GeoUtil.PROJS['EPSG:3857'];
	if(dest === GeoUtil.PROJS['EPSG:900913'])
		dest = GeoUtil.PROJS['EPSG:3857'];
	if(source === dest)return;
	var i = 0;
	for(;i<vectorLayers.length;i++){
		var layer = vectorLayers[i];
		if(goog.isDef(layer)){
			var layerSource = layer.getSource();
			var features = layerSource.getFeatures();
			var j = 0;
			for(;j<features.length;j++){
				var featureGeometry = features[j].getGeometry();
				GeoUtil.convertGeometry(featureGeometry,source,dest);
			}
			if(features.length>0)
				layer.changed();
		}
	}
};

/**
 * Конвертация проекции при смене режима карты
 * @param source
 * @param dest
 */
GeoUtil.convertGeometryFromToDefault = function(vectorLayers,source,dest){
	if(source === GeoUtil.PROJS['EPSG:900913'])
		source = GeoUtil.PROJS['EPSG:3857'];
	if(dest === GeoUtil.PROJS['EPSG:900913'])
		dest = GeoUtil.PROJS['EPSG:3857'];
	if(source === dest)return;
	if(vectorLayers.length > 0){
		var i = 0;
		for(;i<vectorLayers.length;i++){
			var layer = vectorLayers[i];
			if(goog.isDef(layer.layer) && goog.isDef(layer.layer.featureProjLayer)){
				var layerSource = layer.layer.featureProjLayer.getSource().getSource();
				var features = layerSource.getFeatures();
				var j = 0;
				for(;j<features.length;j++){
					var feature = features[j];
					var labelsObjAll = feature.get('labelsObjAll');
					var k = 0;
					try {
						for (; k < labelsObjAll.length; k++) {
							var geo = labelsObjAll[k].geo;
							GeoUtil.convertGeometry(geo, source, dest);
						}
					}
					catch(ex){
					}
					var featureGeometry = feature.getGeometry();
					GeoUtil.convertGeometry(featureGeometry,source,dest);
				}
				if(features.length>0)
					layer.layer.featureProjLayer.changed();
			}
		}
	}
};

/**
 * Конвертирует массив координат для линии
 * @param coords массив координат  of Array.<ol.Coordinate>
 * @param source По умолчанию pulkovo42
 * @param dest По умолчанию pulkovo42
 * @returns {Array}
 */
GeoUtil.convertCoords1 = function(coords, source, dest){
	source = (source || GeoUtil.PROJS.Pulkovo42);
	dest = (dest || GeoUtil.PROJS.GoogleMercator);
	var source_ =  new proj4.Proj((source === GeoUtil.PROJS.Pulkovo42)?GeoUtil.PROJS.WGS84:source);
	var dest_= new proj4.Proj((dest === GeoUtil.PROJS.Pulkovo42)?GeoUtil.PROJS.WGS84:dest);
	var pnt;
	var j = 0;
	for (j; j < coords.length; j ++) {
		pnt = new proj4.toPoint(coords[j]);
		if((source === GeoUtil.PROJS.Pulkovo42)){
			var p42WgsPnt = GeoUtil.P42WGS( pnt.y, pnt.x);
			pnt= new proj4.toPoint([p42WgsPnt.x, p42WgsPnt.y]);
		}
		proj4.transform(source_, dest_, pnt);
		if(isNaN(pnt.x) || isNaN(pnt.y))
			continue;
		if((dest === GeoUtil.PROJS.Pulkovo42)){
			var pWgsP42Pnt = GeoUtil.WGSP42( pnt.y, pnt.x);
			pnt= new proj4.toPoint([pWgsP42Pnt.x, pWgsP42Pnt.y]);
		}
		coords[j] = [pnt.x, pnt.y];
	}
	return coords;
};

/**
 * Конвертирует массив координат для полигона
 * @param coords массив координат  of Array.<ol.Coordinate>
 * @param source По умолчанию pulkovo42
 * @param dest По умолчанию pulkovo42
 * @returns {Array}
 */
GeoUtil.convertCoords2 = function(coords, source, dest){
	source = (source || GeoUtil.PROJS.Pulkovo42);
	dest = (dest || GeoUtil.PROJS.GoogleMercator);
	var source_ =  new proj4.Proj((source === GeoUtil.PROJS.Pulkovo42)?GeoUtil.PROJS.WGS84:source);
	var dest_= new proj4.Proj((dest === GeoUtil.PROJS.Pulkovo42)?GeoUtil.PROJS.WGS84:dest);
	var pnt;
	var j = 0, i = 0;
	for (i; i < coords.length; i++) {
		for (j; j < coords[i].length; j ++) {
			pnt = new proj4.toPoint(coords[i][j]);
			if((source === GeoUtil.PROJS.Pulkovo42)){
				var p42WgsPnt = GeoUtil.P42WGS( pnt.y, pnt.x);
				pnt= new proj4.toPoint([p42WgsPnt.x, p42WgsPnt.y]);
			}
			proj4.transform(source_, dest_, pnt);
			if(isNaN(pnt.x) || isNaN(pnt.y))
				continue;
			if((dest === GeoUtil.PROJS.Pulkovo42)){
				var pWgsP42Pnt = GeoUtil.WGSP42( pnt.y, pnt.x);
				pnt= new proj4.toPoint([pWgsP42Pnt.x, pWgsP42Pnt.y]);
			}
			coords[i][j] = [pnt.x, pnt.y];
		}
	}
	return coords;
};
/**
 * Конвертирует массив координат
 * @param coords массив координат  of Array.<ol.Coordinate>
 * @param source По умолчанию pulkovo42
 * @param dest По умолчанию pulkovo42
 * @returns {Array}
 */
GeoUtil.convertCoords = function(coords, source, dest){
	source = (source || GeoUtil.PROJS.Pulkovo42);
	dest = (dest || GeoUtil.PROJS.GoogleMercator);
	var newCoords  = [];//of Array.<ol.Coordinate>
	var stride = 2;
	goog.asserts.assert(coords.length % stride === 0);
	var source_ =  new proj4.Proj((source === GeoUtil.PROJS.Pulkovo42)?GeoUtil.PROJS.WGS84:source);
	var dest_= new proj4.Proj((dest === GeoUtil.PROJS.Pulkovo42)?GeoUtil.PROJS.WGS84:dest);
	var pnt;
	var j = 0;
	for (j; j < coords.length; j += stride) {
		pnt = new proj4.toPoint([coords[j], coords[j+1]]);
		if((source === GeoUtil.PROJS.Pulkovo42)){
			var p42WgsPnt = GeoUtil.P42WGS( pnt.y, pnt.x);
			pnt= new proj4.toPoint([p42WgsPnt.x, p42WgsPnt.y]);
		}
		proj4.transform(source_, dest_, pnt);
		if(isNaN(pnt.x) || isNaN(pnt.y))
			continue;
		if((dest === GeoUtil.PROJS.Pulkovo42)){
			var pWgsP42Pnt = GeoUtil.WGSP42( pnt.y, pnt.x);
			pnt= new proj4.toPoint([pWgsP42Pnt.x, pWgsP42Pnt.y]);
		}
		newCoords.push(pnt.x);
		newCoords.push(pnt.y);
	}
	return newCoords;
};

/**
 * Конвертация геометрии
 * @param geometryCollection
 * @param source по умолчанию pulkovo42
 * @param dest по умолчанию google mercator 900913
 */
GeoUtil.convertGeometry = function(geometryCollection, source, dest){
	source = (source || GeoUtil.PROJS.Pulkovo42);
	dest = (dest || GeoUtil.PROJS.GoogleMercator);
	if(geometryCollection instanceof ol.geom.GeometryCollection){
		var geoArr = geometryCollection.getGeometriesArray();
		for(var i=0; i<geoArr.length;i++){
			GeoUtil.convertGeometry(geoArr[i], source, dest);
		}
	}
	else{
		var geometry = geometryCollection;
		if(geometry !== undefined){
			var coords = geometry.flatCoordinates;
			var newCoords  = [];//of Array.<ol.Coordinate>
			var stride = geometry.stride;
			var source_ = new proj4.Proj((source === GeoUtil.PROJS.Pulkovo42)?GeoUtil.PROJS.WGS84:source);
			var dest_ =  new proj4.Proj((dest === GeoUtil.PROJS.Pulkovo42)?GeoUtil.PROJS.WGS84:dest);
			goog.asserts.assert(coords.length % stride === 0);
			var pnt;
			var j;
			for ( j = 0; j < coords.length; j += stride) {
				//с двойной трансформацей отлет 2 метра пропадает
				pnt= new proj4.toPoint([coords[j], coords[j+1]]);
				if((source === GeoUtil.PROJS.Pulkovo42)){
					var p42WgsPnt = GeoUtil.P42WGS( coords[j+1], coords[j]);
					pnt= new proj4.toPoint([p42WgsPnt.x, p42WgsPnt.y]);
				}
				proj4.transform(source_, dest_, pnt);
				if((dest === GeoUtil.PROJS.Pulkovo42)){
					var pWgsP42Pnt = GeoUtil.WGSP42( coords[j+1], coords[j]);
					pnt= new proj4.toPoint([pWgsP42Pnt.x, pWgsP42Pnt.y]);
				}
				if(isNaN(pnt.x) || isNaN(pnt.y))
					continue;
				newCoords.push(pnt.x);
				newCoords.push(pnt.y);
				if(stride === 3)
					newCoords.push(coords[j+2]);
			}
			if(geometry.getType() === ol.geom.GeometryType.POLYGON || geometry.getType() === ol.geom.GeometryType.MULTI_LINE_STRING)
				geometry.setFlatCoordinates(geometry.layout,newCoords,geometry.getEnds());
			else if(geometry.getType() === ol.geom.GeometryType.MULTI_POLYGON)
				geometry.setFlatCoordinates(geometry.layout,newCoords,geometry.getEndss());
			else
				geometry.setFlatCoordinates(geometry.layout,newCoords);
		}
	}
};

/**
 * Функция перевода спец проекции в базовую.
 * Вынесена отдельно, чтобы наглядно было видно, что спец проекция в месте вызова
 * @param feature
 * @param sourceZone
 * @param destZone
 */
GeoUtil.convertFeature326NN = function (feature, sourceZone, destZone) {
	if (!goog.isDef(sourceZone))sourceZone = 'EPSG:32639';
	if (!goog.isDef(destZone))destZone = 'EPSG:32639';

	GeoUtil.convertFeature(feature, sourceZone, destZone);
};

/**
 * Конвертация фичи
 * TODO, стоит в дальшейшем объекдинить с GeoUtil.convertGeometry
 * @param feature
 * @param source
 * @param dest
 */
GeoUtil.convertFeature = function(feature, source, dest){
	source = (source || GeoUtil.PROJS.Pulkovo42);
	dest = (dest || GeoUtil.PROJS.GoogleMercator);
	var geometry = feature.getGeometry();
	if(geometry !== undefined){
		var coords = geometry.flatCoordinates;
		var newCoords  = [];//of Array.<ol.Coordinate>
		var stride = geometry.stride;
		var source_ = new proj4.Proj((source === GeoUtil.PROJS.Pulkovo42)?GeoUtil.PROJS.WGS84:source);
		var dest_ =  new proj4.Proj((dest === GeoUtil.PROJS.Pulkovo42)?GeoUtil.PROJS.WGS84:dest);
		goog.asserts.assert(coords.length % stride === 0);
		var pnt;
		var j = 0;
		for (j; j < coords.length; j += stride) {
			pnt= new proj4.toPoint([coords[j], coords[j+1]]);
			if((source === GeoUtil.PROJS.Pulkovo42)){
				var p42WgsPnt = GeoUtil.P42WGS( pnt.y, pnt.x);
				pnt= new proj4.toPoint([p42WgsPnt.x, p42WgsPnt.y]);
			}
			proj4.transform(source_, dest_, pnt);
			if((dest === GeoUtil.PROJS.Pulkovo42)){
				var pWgsP42Pnt = GeoUtil.WGSP42( pnt.y, pnt.x);
				pnt= new proj4.toPoint([pWgsP42Pnt.x, pWgsP42Pnt.y]);
			}
			if(isNaN(pnt.x) || isNaN(pnt.y))
				continue;
			newCoords.push(pnt.x);
			newCoords.push(pnt.y);
			if(stride === 3)
				newCoords.push(coords[j+2]);
		}
		if(feature.getGeometry().getType() === ol.geom.GeometryType.POLYGON || feature.getGeometry().getType() === ol.geom.GeometryType.MULTI_LINE_STRING)
			feature.getGeometry().setFlatCoordinates(geometry.layout,newCoords,feature.getGeometry().getEnds());
		else if(feature.getGeometry().getType() === ol.geom.GeometryType.MULTI_POLYGON)
			feature.getGeometry().setFlatCoordinates(geometry.layout,newCoords,feature.getGeometry().getEndss());
		else
			feature.getGeometry().setFlatCoordinates(geometry.layout,newCoords);
	}
};

/**
 * This function calls `callback` for each segment of the flat coordinates
 * array. If the callback returns a truthy value the function returns that
 * value immediately. Otherwise the function returns `false`.
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {function(this: S, ol.Coordinate, ol.Coordinate): T} callback Function
 *     called for each segment.
 * @param {S=} opt_this The object to be used as the value of 'this'
 *     within callback.
 * @return {T|boolean} Value.
 * @template T,S
 */
GeoUtil.forEach = function(flatCoordinates, offset, end, stride, callback, opt_this) {
	var point1 = [flatCoordinates[offset], flatCoordinates[offset + 1]];
	var point2 = [];
	var ret;
	for (; (offset + stride) < end; offset += stride) {
		point2[0] = flatCoordinates[offset + stride];
		point2[1] = flatCoordinates[offset + stride + 1];
		ret = callback.call(opt_this, point1, point2);
		if (ret) {
			return ret;
		}
		point1[0] = point2[0];
		point1[1] = point2[1];
	}
	return false;
};

/**
 * @param {Array.<number>} flatCoordinates Flat coordinates.
 * @param {number} offset Offset.
 * @param {number} end End.
 * @param {number} stride Stride.
 * @param {ol.Extent} extent Extent.
 * @return {boolean} True if the geometry and the extent intersect.
 */
GeoUtil.lineString = function(flatCoordinates, offset, end, stride, extent, geoExtent) {
	//убрана проверка координат, т.к. extent уже есть в сохраненной геометрии фичи
	var coordinatesExtent = (geoExtent) ? geoExtent : ol.extent.extendFlatCoordinates(
		ol.extent.createEmpty(), flatCoordinates, offset, end, stride);
	if (!ol.extent.intersects(extent, coordinatesExtent)) {
		return false;
	}
	if (ol.extent.containsExtent(extent, coordinatesExtent)) {
		return true;
	}
	if (coordinatesExtent[0] >= extent[0] &&
		coordinatesExtent[2] <= extent[2]) {
		return true;
	}
	if (coordinatesExtent[1] >= extent[1] &&
		coordinatesExtent[3] <= extent[3]) {
		return true;
	}
	return GeoUtil.forEach(flatCoordinates, offset, end, stride,
		/**
		 * @param {ol.Coordinate} point1 Start point.
		 * @param {ol.Coordinate} point2 End point.
		 * @return {boolean} `true` if the segment and the extent intersect,
		 *     `false` otherwise.
		 */
		function(point1, point2) {
			return ol.extent.intersectsSegment(extent, point1, point2);
		});
};

/**
 *
 * @param feature
 * @param extent
 * @returns {[]|*[]}
 */
GeoUtil.getIntersectedGeometry = function(feature, extent, excudeGeoTypes){
	var result = [];
	var geometry = feature.getGeometry();
	goog.asserts.assert(goog.isDefAndNotNull(geometry),
		'feature geometry is defined and not null');
	if(!goog.isDef(feature.get('labelType')))
		return [];
	if(excudeGeoTypes && excudeGeoTypes.length > 0){
		if(excudeGeoTypes.indexOf(geometry.getType()) !== -1)
			return [];
	}
	switch(geometry.getType()){
		case ol.geom.GeometryType.MULTI_LINE_STRING:
			var i, ii;
			var ends = geometry.ends_;
			var offset = 0;
			for (i = 0, ii = ends.length; i < ii; ++i) {
				if (ol.geom.flat.intersectsextent.lineString(
					geometry.flatCoordinates, offset, ends[i], geometry.stride, extent)) {
					if(goog.isDef(globalLinesLabels_[feature.get('labelType')])){
						var obj =  jQuery.extend({}, globalLinesLabels_[feature.get('labelType')][i]);
						var geosArr = [];
						if(goog.isDef(obj.id)){
							var testId = obj.id;
							if(obj.id.indexOf('@')!=-1)
								testId = obj.id.substring(0, obj.id.indexOf('@'));
							var r=0;
							//проверяем, обрабатывался ли ранее этот id, когда ткнули в объект с @, если да, то пропускаем
							var rFinded = false;
							for(;r<result.length;r++){
								if(goog.isDef(result[r].id) && result[r].id == testId){
									rFinded = true;
									break;
								}
							}
							if(rFinded)
								continue;
							geosArr.push(geometry.getLineString(i).clone());
							if( obj.id.indexOf('@')!=-1){
								//проходимся по добавленным объектам. Если нашли объект, то игнорируем, если не нашли, то
								//ищем основной и добавляем его

								var fullId = obj.id.substring(0, obj.id.indexOf('@'));
								//проходимся по всем остальным связанным объектам
								var t,tt;
								for (t = 0, tt = ends.length; t < tt; ++t) {
									if(t == i) //пропускаем индекс объекта, найденного выше
										continue;
									//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
									//, выбираем из этого списка
									var newObj;
									if(globalLinesLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
										newObj = feature.get('labelsObj')[t];
									}
									else{
										newObj = globalLinesLabels_[feature.get('labelType')][t];
									}
									if(goog.isDef(newObj) && goog.isDef(newObj.id) && (newObj.id.indexOf(fullId+'@')!=-1 || newObj.id == fullId)){//нужный id
										geosArr.push(geometry.getLineString(t).clone());
									}
								}
								obj.id = fullId;
							}
							else{
								//доп. проверка. Если в id есть @, значит работам с мультиобъектом из gdal
								//если нет @ - значит это основной объект и ищем все геометрии связанные с ним
								var fullId = obj.id;
								//проходимся по всем остальным связанным объектам
								var t,tt;
								for (t = 0, tt = ends.length; t < tt; ++t) {
									if(t == i) //пропускаем индекс объекта, найденного выше
										continue;
									//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
									//, выбираем из этого списка
									var newObj;
									if(globalLinesLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
										newObj = feature.get('labelsObj')[t];
									}
									else{
										newObj = globalLinesLabels_[feature.get('labelType')][t];
									}
									if(goog.isDef(newObj) && goog.isDef(newObj.id) && (newObj.id.indexOf(fullId+'@')!=-1 || newObj.id == fullId)){//нужный id
										geosArr.push(geometry.getLineString(t).clone());
									}
								}
							}
						}

						if(geosArr.length == 1)
							obj.geo = new ol.Feature(geosArr[0].clone());
						else{
							var gm = new ol.geom.MultiLineString(null);
							gm.setLineStrings(geosArr);
							obj.geo = new ol.Feature(gm);
						}
						obj.feature = feature;
						result.push(obj);
					}

				}
				offset = ends[i];
			}

			break;
		case ol.geom.GeometryType.LINE_STRING:
			ol.geom.flat.intersectsextent.lineString(
				geometry.flatCoordinates, 0, geometry.ends_, geometry.stride, extent);
			if(goog.isDef(globalLinesLabels_[feature.get('labelType')])){
				var obj = globalLinesLabels_[feature.get('labelType')][0];
				obj.geo = new ol.Feature(geometry.getLineString(0).clone());
				obj.feature = feature;
				result.push(obj);
			}
			break;
		case ol.geom.GeometryType.MULTI_POINT:
			var i, ii, x, y;
			for (i = 0, ii = geometry.flatCoordinates.length; i < ii; i += geometry.stride) {
				x = geometry.flatCoordinates[i];
				y = geometry.flatCoordinates[i + 1];
				if (ol.extent.containsXY(extent, x, y)) {
					if(goog.isDef(globalPointsLabels_[feature.get('labelType')]) && goog.isDef(feature.get('labelsObj'))){
						//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
						//, выбираем из этого списка
						var obj;
						if(globalPointsLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
							obj = feature.get('labelsObj')[i/2];
							if (obj === undefined)
								obj = globalPointsLabels_[feature.get('labelType')][i/2];
						}
						else{
							obj = globalPointsLabels_[feature.get('labelType')][i/2];
						}

						obj.geo = new ol.Feature(geometry.getPoint(i/2).clone());
						obj.feature = feature;
						result.push(obj);
					}
				}
			}
			break;
		case ol.geom.GeometryType.POINT:
			var x, y;
			x = geometry.flatCoordinates[0];
			y = geometry.flatCoordinates[1];
			if (ol.extent.containsXY(extent, x, y)) {
				if(goog.isDef(globalPointsLabels_[feature.get('labelType')])){
					var obj = globalPointsLabels_[feature.get('labelType')][0];
					obj.geo = new ol.Feature(geometry.clone());
					obj.feature = feature;
					result.push(obj);
				}
			}
			break;
		case ol.geom.GeometryType.MULTI_POLYGON:
			var i, ii;
			var offset = 0;
			var or = geometry.getOrientedFlatCoordinates();
			var endss = geometry.endss_;
			for (i = 0, ii = endss.length; i < ii; ++i) {
				var ends = endss[i];
				if (ol.geom.flat.intersectsextent.linearRings(
					or, offset, ends, geometry.stride, extent)) {
					if(goog.isDef(globalPolygonsLabels_[feature.get('labelType')]) && goog.isDef(feature.get('labelsObj'))){
						//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
						//, выбираем из этого списка
						var obj;
						if(globalPolygonsLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
							obj = feature.get('labelsObj')[i];
						}
						else{
							obj = jQuery.extend({}, globalPolygonsLabels_[feature.get('labelType')][i]);
						}
						var geosArr = [];
						if(goog.isDef(obj.id)){
							var testId = obj.id;
							if(obj.id.indexOf('@')!=-1)
								testId = obj.id.substring(0, obj.id.indexOf('@'));
							var r=0;
							//проверяем, обрабатывался ли ранее этот id, когда ткнули в объект с @, если да, то пропускаем
							var rFinded = false;
							for(;r<result.length;r++){
								if(goog.isDef(result[r].id) && result[r].id == testId){
									rFinded = true;
									break;
								}
							}
							if(rFinded)
								continue;
							geosArr.push(geometry.getPolygon(i).clone());
							if( obj.id.indexOf('@')!=-1){
								//проходимся по добавленным объектам. Если нашли объект, то игнорируем, если не нашли, то
								//ищем основной и добавляем его

								var fullId = obj.id.substring(0, obj.id.indexOf('@'));
								//проходимся по всем остальным связанным объектам
								var t,tt;
								for (t = 0, tt = ends.length; t < tt; ++t) {
									if(t == i) //пропускаем индекс объекта, найденного выше
										continue;
									//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
									//, выбираем из этого списка
									var newObj;
									if(globalPolygonsLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
										newObj = feature.get('labelsObj')[t];
									}
									else{
										newObj = globalPolygonsLabels_[feature.get('labelType')][t];
									}

									if(goog.isDef(newObj) && goog.isDef(newObj.id) && (newObj.id.indexOf(fullId+'@')!=-1 || newObj.id == fullId)){//нужный id
										geosArr.push(geometry.getPolygon(t).clone());
									}
								}
								obj.id = fullId;
							}
							else{
								//доп. проверка. Если в id есть @, значит работам с мультиобъектом из gdal
								//если нет @ - значит это основной объект и ищем все геометрии связанные с ним
								var fullId = obj.id;
								//проходимся по всем остальным связанным объектам
								var t,tt;
								for (t = 0, tt = ends.length; t < tt; ++t) {
									if(t == i) //пропускаем индекс объекта, найденного выше
										continue;
									//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
									//, выбираем из этого списка
									var newObj;
									if(globalPolygonsLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
										newObj = feature.get('labelsObj')[t];
									}
									else{
										newObj = globalPolygonsLabels_[feature.get('labelType')][t];
									}
									if(goog.isDef(newObj)&& goog.isDef(newObj.id) && (newObj.id.indexOf(fullId+'@')!=-1 || newObj.id == fullId)){//нужный id
										geosArr.push(geometry.getPolygon(t).clone());
									}
								}
							}
						}
						if(geosArr.length == 1)
							obj.geo = new ol.Feature(geosArr[0]);
						else{
							var gm = new ol.geom.MultiPolygon(null);
							gm.setPolygons(geosArr);
							obj.geo = new ol.Feature(gm);
						}
						obj.feature = feature;
						result.push(obj);
					}
				}
				offset = ends[ends.length - 1];
			}
			break;
		case ol.geom.GeometryType.POLYGON:
			var or = geometry.getOrientedFlatCoordinates();
			var ends = geometry.ends_;
			if (ol.geom.flat.intersectsextent.linearRings(
				or, 0, ends, geometry.stride, extent)) {
				if(goog.isDef(globalPolygonsLabels_[feature.get('labelType')])){
					var obj = globalPolygonsLabels_[feature.get('labelType')][0];
					obj.geo = new ol.Feature(geometry.clone());
					obj.feature = feature;
					result.push(obj);
				}
			}
			offset = ends[ends.length - 1];
			break;
	}
	return result;
};

GeoUtil.getIntersectedGeometry_old = function(feature, extent){
	var result = [];
	var geometry = feature.getGeometry();
	goog.asserts.assert(goog.isDefAndNotNull(geometry),
		'feature geometry is defined and not null');
	if(!goog.isDef(feature.get('labelType')))
		return [];
	switch(geometry.getType()){
		case ol.geom.GeometryType.MULTI_LINE_STRING:
			var i, ii;
			var ends = geometry.ends_;
			var offset = 0;
			if(goog.isDef(globalLinesLabels_[feature.get('labelType')])){
				for (i = 0, ii = ends.length; i < ii; ++i) {
					var geo = globalLinesLabels_[feature.get('labelType')][i].geo;
					if(geo === undefined)
						continue;
					var geoExcent = geo.getExtent();
					if(!ol.extent.intersects(geoExcent, extent))
						continue;
					/*if (GeoUtil.lineString(geometry.flatCoordinates, offset, ends[i], geometry.stride, extent, geoExcent)) {*/
					if (ol.geom.flat.intersectsextent.lineString(
						geometry.flatCoordinates, offset, ends[i], geometry.stride, extent)) {
						var obj =  jQuery.extend({}, globalLinesLabels_[feature.get('labelType')][i]);
						var geosArr = [];
						if(goog.isDef(obj.id)){
							var testId = obj.id;
							if(obj.id.indexOf('@')!=-1)
								testId = obj.id.substring(0, obj.id.indexOf('@'));
							var r=0;
							//проверяем, обрабатывался ли ранее этот id, когда ткнули в объект с @, если да, то пропускаем
							var rFinded = false;
							for(;r<result.length;r++){
								if(goog.isDef(result[r].id) && result[r].id == testId){
									rFinded = true;
									break;
								}
							}
							if(rFinded)
								continue;
							geosArr.push(geometry.getLineString(i).clone());
							if( obj.id.indexOf('@')!=-1){
								//проходимся по добавленным объектам. Если нашли объект, то игнорируем, если не нашли, то
								//ищем основной и добавляем его
								var fullId = obj.id.substring(0, obj.id.indexOf('@'));
								//проходимся по всем остальным связанным объектам
								var t,tt;
								for (t = 0, tt = ends.length; t < tt; ++t) {
									if(t == i) //пропускаем индекс объекта, найденного выше
										continue;
									//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
									//, выбираем из этого списка
									var newObj;
									if(globalLinesLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
										newObj = feature.get('labelsObj')[t];
									}
									else{
										newObj = globalLinesLabels_[feature.get('labelType')][t];
									}
									if(goog.isDef(newObj) && goog.isDef(newObj.id) && (newObj.id.indexOf(fullId+'@')!=-1 || newObj.id == fullId)){//нужный id
										geosArr.push(geometry.getLineString(t).clone());
									}
								}
								obj.id = fullId;
							}
							else{
								//доп. проверка. Если в id есть @, значит работам с мультиобъектом из gdal
								//если нет @ - значит это основной объект и ищем все геометрии связанные с ним
								var fullId = obj.id;
								//проходимся по всем остальным связанным объектам
								var t,tt;
								for (t = 0, tt = ends.length; t < tt; ++t) {
									if(t == i) //пропускаем индекс объекта, найденного выше
										continue;
									//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
									//, выбираем из этого списка
									var newObj;
									if(globalLinesLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
										newObj = feature.get('labelsObj')[t];
									}
									else{
										newObj = globalLinesLabels_[feature.get('labelType')][t];
									}
									if(goog.isDef(newObj) && goog.isDef(newObj.id) && (newObj.id.indexOf(fullId+'@')!=-1 || newObj.id == fullId)){//нужный id
										geosArr.push(geometry.getLineString(t).clone());
									}
								}
							}
						}

						if(geosArr.length == 1)
							obj.geo = new ol.Feature(geosArr[0].clone());
						else{
							var gm = new ol.geom.MultiLineString(null);
							gm.setLineStrings(geosArr);
							obj.geo = new ol.Feature(gm);
						}
						obj.feature = feature;
						result.push(obj);
					}
				}
			}
			offset = ends[i];
			break;
		case ol.geom.GeometryType.LINE_STRING:
			ol.geom.flat.intersectsextent.lineString(
				geometry.flatCoordinates, 0, geometry.ends_, geometry.stride, extent);
			if(goog.isDef(globalLinesLabels_[feature.get('labelType')])){
				var obj = globalLinesLabels_[feature.get('labelType')][0];
				obj.geo = new ol.Feature(geometry.getLineString(0).clone());
				obj.feature = feature;
				result.push(obj);
			}
			break;
		case ol.geom.GeometryType.MULTI_POINT:
			var i, ii, x, y;
			for (i = 0, ii = geometry.flatCoordinates.length; i < ii; i += geometry.stride) {
				x = geometry.flatCoordinates[i];
				y = geometry.flatCoordinates[i + 1];
				if (ol.extent.containsXY(extent, x, y)) {
					if(goog.isDef(globalPointsLabels_[feature.get('labelType')]) && goog.isDef(feature.get('labelsObj'))){
						//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
						//, выбираем из этого списка
						var obj;
						if(globalPointsLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
							obj = feature.get('labelsObj')[i/2];
						}
						else{
							obj = globalPointsLabels_[feature.get('labelType')][i/2];
						}

						obj.geo = new ol.Feature(geometry.getPoint(i/2).clone());
						obj.feature = feature;
						result.push(obj);
					}
				}
			}
			break;
		case ol.geom.GeometryType.POINT:
			var x, y;
			x = geometry.flatCoordinates[0];
			y = geometry.flatCoordinates[1];
			if (ol.extent.containsXY(extent, x, y)) {
				if(goog.isDef(globalPointsLabels_[feature.get('labelType')])){
					var obj = globalPointsLabels_[feature.get('labelType')][0];
					obj.geo = new ol.Feature(geometry.clone());
					obj.feature = feature;
					result.push(obj);
				}
			}
			break;
		case ol.geom.GeometryType.MULTI_POLYGON:
			var i, ii;
			var offset = 0;
			var or = geometry.getOrientedFlatCoordinates();
			var endss = geometry.endss_;
			for (i = 0, ii = endss.length; i < ii; ++i) {
				var ends = endss[i];
				if (ol.geom.flat.intersectsextent.linearRings(
					or, offset, ends, geometry.stride, extent)) {
					if(goog.isDef(globalPolygonsLabels_[feature.get('labelType')]) && goog.isDef(feature.get('labelsObj'))){
						//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
						//, выбираем из этого списка
						var obj;
						if(globalPolygonsLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
							obj = feature.get('labelsObj')[i];
						}
						else{
							obj = jQuery.extend({}, globalPolygonsLabels_[feature.get('labelType')][i]);
						}
						var geosArr = [];
						if(goog.isDef(obj.id)){
							var testId = obj.id;
							if(obj.id.indexOf('@')!=-1)
								testId = obj.id.substring(0, obj.id.indexOf('@'));
							var r=0;
							//проверяем, обрабатывался ли ранее этот id, когда ткнули в объект с @, если да, то пропускаем
							var rFinded = false;
							for(;r<result.length;r++){
								if(goog.isDef(result[r].id) && result[r].id == testId){
									rFinded = true;
									break;
								}
							}
							if(rFinded)
								continue;
							geosArr.push(geometry.getPolygon(i).clone());
							if( obj.id.indexOf('@')!=-1){
								//проходимся по добавленным объектам. Если нашли объект, то игнорируем, если не нашли, то
								//ищем основной и добавляем его

								var fullId = obj.id.substring(0, obj.id.indexOf('@'));
								//проходимся по всем остальным связанным объектам
								var t,tt;
								for (t = 0, tt = ends.length; t < tt; ++t) {
									if(t == i) //пропускаем индекс объекта, найденного выше
										continue;
									//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
									//, выбираем из этого списка
									var newObj;
									if(globalPolygonsLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
										newObj = feature.get('labelsObj')[t];
									}
									else{
										newObj = globalPolygonsLabels_[feature.get('labelType')][t];
									}

									if(goog.isDef(newObj) && goog.isDef(newObj.id) && (newObj.id.indexOf(fullId+'@')!=-1 || newObj.id == fullId)){//нужный id
										geosArr.push(geometry.getPolygon(t).clone());
									}
								}
								obj.id = fullId;
							}
							else{
								//доп. проверка. Если в id есть @, значит работам с мультиобъектом из gdal
								//если нет @ - значит это основной объект и ищем все геометрии связанные с ним
								var fullId = obj.id;
								//проходимся по всем остальным связанным объектам
								var t,tt;
								for (t = 0, tt = ends.length; t < tt; ++t) {
									if(t == i) //пропускаем индекс объекта, найденного выше
										continue;
									//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
									//, выбираем из этого списка
									var newObj;
									if(globalPolygonsLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
										newObj = feature.get('labelsObj')[t];
									}
									else{
										newObj = globalPolygonsLabels_[feature.get('labelType')][t];
									}
									if(goog.isDef(newObj)&& goog.isDef(newObj.id) && (newObj.id.indexOf(fullId+'@')!=-1 || newObj.id == fullId)){//нужный id
										geosArr.push(geometry.getPolygon(t).clone());
									}
								}
							}
						}
						if(geosArr.length == 1)
							obj.geo = new ol.Feature(geosArr[0]);
						else{
							var gm = new ol.geom.MultiPolygon(null);
							gm.setPolygons(geosArr);
							obj.geo = new ol.Feature(gm);
						}
						obj.feature = feature;
						result.push(obj);
					}
				}
				offset = ends[ends.length - 1];
			}
			break;
		case ol.geom.GeometryType.POLYGON:
			var or = geometry.getOrientedFlatCoordinates();
			var ends = geometry.ends_;
			if (ol.geom.flat.intersectsextent.linearRings(
				or, 0, ends, geometry.stride, extent)) {
				if(goog.isDef(globalPolygonsLabels_[feature.get('labelType')])){
					var obj = globalPolygonsLabels_[feature.get('labelType')][0];
					obj.geo = new ol.Feature(geometry.clone());
					obj.feature = feature;
					result.push(obj);
				}
			}
			offset = ends[ends.length - 1];
			break;
	}
	return result;
};

//дистанция между двумя точками. Координаты в pulkovo84
GeoUtil.GetDist = function(b1, l1, z1, b2, l2, z2) {
	var dB = (b2-b1)*3600;
	var dL = (l2-l1)*3600;
	if(dB==0 && dL==0)
		return 0;

	var Bm = (b1+b2)/2;
	var ddB = dB/10000;
	var ddL = dL/10000;
	var ddB2 = ddB*ddB;
	var ddL2 = ddL*ddL;
	var ddB2L = ddB2*ddL;
	var ddBL2 = ddB*ddL2;
	var ddB3 = ddB2*ddB;
	var ddL3 = ddL2*ddL;
	var cosB = Math.cos(Bm*Math.PI/180);
	var cosB2 = cosB*cosB;
	var cosB3 = cosB2*cosB;
	var cosB4 = cosB3*cosB;
	var cosB5 = cosB4*cosB;
	var cosB6 = cosB5*cosB;
	var sinB = Math.sin(Bm*Math.PI/180);
	var a1 = 103422.05*cosB;
	var a2 = 9.5144*cosB+0.5525*cosB3-0.0078*cosB5;
	var a3 = -10.1287*cosB+10.1287*cosB3;
	var a4 = 103422.05-696.9116*cosB2+4.6954*cosB4-0.0310*cosB6;
	var a5 = -30.3860+10.3334*cosB2-0.2061*cosB4+0.0014*cosB6;
	var a6 = -0.2048+0.4192*cosB2-0.0124*cosB4;
	var D = (593.602160+cosB2)/(197.867385+cosB2);
	var E1 = a1*ddL+a2*ddB2L+a3*ddL3;
	var E2 = a4*ddB+a5*ddBL2+a6*ddB3;
	var sinA = Math.sin(Math.atan2(E1,E2));
	var dist;
	if(sinA!=0)
		dist = Math.abs(D*E1/sinA);
	else
		dist = Math.abs(D*E2);
	return Math.sqrt(dist*dist+(z2-z1)*(z2-z1));
};

//получение координаты точки по отрезку и длине, на которой она в нём находится от первой точки
GeoUtil.PointByDistanceAndSegment1 = function(distance, segment){
	var d = GeoUtil.Distance(segment[0],segment[1]); //длина сегмента
	var d1 = distance;//от первой точки до искомой
	var coeff = d1/d;//d1/d2;
	var pX = (1-coeff)*segment[0][0]+coeff*segment[1][0];
	var pY = (1-coeff)*segment[0][1]+coeff*segment[1][1];
	return [pX,pY];// segment[1];//[pX,pY];
};

GeoUtil.PointByDistanceAndSegment = function(lat1, long1, lat2, long2, per) {
	return [lat1 + (lat2 - lat1) * per, long1 + (long2 - long1) * per];
};

//получение координаты точки по отрезку и длине, на которой она в нём находится от первой точки
GeoUtil.PointByDistanceAndSegment12 = function(distance, segment){
	var x,y = 0;
	var d = GeoUtil.Distance(segment[0],segment[1]); //длина сегмента
	var d1 = distance;//от первой точки до искомой
	var d2 = d-distance;// от искомой до 2-й точки
	var coeff = d1/d;//d1/d2;
	var aX,aY,bX,bY,pX,pY = 0;
	aX = segment[0][0];
	aY = segment[0][1];
	bX = segment[1][0];
	bY = segment[1][1];
	pX = aX + coeff*(bX-aX);
	pY = aY + coeff*(bY-aY);
	return [pX,pY];// segment[1];//[pX,pY];
};

//Compute the distance from A to B
GeoUtil.Distance =  function (pointA, pointB){
	var d1 = pointA[0] - pointB[0];
	var d2 = pointA[1] - pointB[1];
	return Math.sqrt(d1 * d1 + d2 * d2);
};

/**
 * Calculating distance between line (or line segment) and point 2D
 */
//Compute the dot product AB . AC
GeoUtil.DotProduct = function(pointA, pointB, pointC){
	var AB = [0,0];
	var BC = [0,0];
	AB[0] = pointB[0] - pointA[0];
	AB[1] = pointB[1] - pointA[1];
	BC[0] = pointC[0] - pointB[0];
	BC[1] = pointC[1] - pointB[1];
	var dot = AB[0] * BC[0] + AB[1] * BC[1];

	return dot;
};

//Compute the cross product AB x AC
GeoUtil.CrossProduct = function(pointA, pointB, pointC){
	var AB = [0,0];
	var AC = [0,0];
	AB[0] = pointB[0] - pointA[0];
	AB[1] = pointB[1] - pointA[1];
	AC[0] = pointC[0] - pointA[0];
	AC[1] = pointC[1] - pointA[1];
	var cross = AB[0] * AC[1] - AB[1] * AC[0];

	return cross;
};

//Compute the distance from AB to C
//if isSegment is true, AB is a segment, not a line.
GeoUtil.LineToPointDistance2D = function(pointA, pointB, pointC, isSegment){
	if (isSegment == true){
		var dot1 = GeoUtil.DotProduct(pointA, pointB, pointC);
		if (dot1 > 0)
			return GeoUtil.Distance(pointB, pointC);

		var dot2 = GeoUtil.DotProduct(pointB, pointA, pointC);
		if (dot2 > 0)
			return GeoUtil.Distance(pointA, pointC);
	}
	var dist = GeoUtil.CrossProduct(pointA, pointB, pointC) / GeoUtil.Distance(pointA, pointB);
	return Math.abs(dist);
};


/**
 * Удаление из геометрии объекта по индексу
 * @param geometry
 * @param index
 */
GeoUtil.removeObjectFromGeometry = function(feature, index){
	if(feature === undefined)
		return false;
	var geometry = feature.getGeometry();
	switch(geometry.getType()){
		case ol.geom.GeometryType.MULTI_POINT:
			var n = !geometry.flatCoordinates ?
				0 : geometry.flatCoordinates.length / geometry.stride;
			if (index < 0 || n <= index) {
				geometry.changed();
				return false;
			}
			var coords = geometry.flatCoordinates;
			coords.splice(index * geometry.stride, geometry.stride);
			geometry.setFlatCoordinates(geometry.layout,coords);
			break;
		case ol.geom.GeometryType.MULTI_LINE_STRING:
			if (index < 0 || geometry.ends_.length <= index) {
				return false;
			}
			var ls = geometry.getLineStrings();
			ls.splice(index,1);
			geometry.setLineStrings(ls);
			// geometry.flatCoordinates.splice(index === 0 ? 0 : geometry.ends_[index - 1], geometry.ends_[index]);
			break;
		case ol.geom.GeometryType.MULTI_POLYGON:
			if (index < 0 || geometry.endss_.length <= index) {
				return false;
			}
			var ls = geometry.getPolygons();
			ls.splice(index,1);
			geometry.setPolygons(ls);
			break;
	}
	return true;
};

GeoUtil.segmentIntersect = function(seg1, seg2){
// Check the validity of the segments
	if ((seg1[1]) < (seg1[0])){
		return false;
	}
	if ((seg2[1]) < (seg2[0])){
		return false;
	}

	// Compute some useful oriented length needed later for computing
	//   the cross product of 2D-vectors centered in (0,0).
	// Compute the X-orientedLength and Y-orientedLength of the edge seg1
	var x12_11 = ((seg1[1]) - (seg1[0]));  // seg1.x2 - seg1.x1
	var y12_11 = ((seg1[1]) - (seg1[0]));  // seg1.y2 - seg1.y1
	// Compute the X-orientedLength and Y-orientedLength of the edge seg2
	var x22_21 = ((seg2[1]) - (seg2[0]));  // seg2.x2 - seg2.x1
	var y22_21 = ((seg2[1]) - (seg2[0]));  // seg2.y2 - seg2.y1
	// Compute the X-orientedLength and Y-orientedLength between the first vertex of each edge, named seg3
	var x11_21 = ((seg1[0]) - (seg2[0]));  // seg1.x1 - seg2.x1
	var y11_21 = ((seg1[0]) - (seg2[0]));  // seg1.y1 - seg2.y1

	// Compute the cross product seg1 x seg2
	var d= (x12_11 * y22_21) - (x22_21 * y12_11);
	// Compute the cross product seg2 x seg3
	var n1 = (x22_21 * y11_21) - (x11_21 * y22_21);
	// Compute the cross product seg1 x seg3
	var n2 = (x12_11 * y11_21) - (x11_21 * y12_11);

	// Why do we use cross products ? Let's explain with d = seg1 x seg2
	// d represents the signed area of the parallelogram defined by the
	//   two segments seg1 and seg2 translated to have the same origin.
	// If d==0, then seg1 and seg2 are colinear (same or opposite sense)
	// If d<0, then seg1 is in the direct sense from seg2
	// If d>0, then seg1 is in the indirect sens from seg2

	// Test if the two segments intersect themselves or not
	var intersection = false;
	if (d == 0) {  // seg1 and seg2 are colinear and could be coincident
		if (n1 == 0 && n2 == 0) {  // coincident
			return true;
		}
		// else there is no intersection but the Boolean to return will
		//   depend on the tolerance management.
	} else {  // seg1 and seg2 are not colinear, an intersection could exist
		var along1 = n1 / d;
		var along2 = n2 / d;
		if ((along1 >= 0) && (along1 <= 1) && (along2 >=0) && (along2 <= 1)) {  // intersect
			return true;
		}
		// else there is no intersection but the Boolean to return will
		//   depend on the tolerance management.
	}

	// The tolerance must be managed to test if an approximated
	//   intersection exists or not.
	return false; // TODO
};

GeoUtil.lineIntersect = function(line,lineRing){
	if(lineRing.getType() === ol.geom.GeometryType.LINEAR_RING){
		if(!ol.extent.intersects(line.getExtent(),lineRing.getExtent()))
			return false;
		var segs1 = line.getCoordinates();
		var segs2 = lineRing.getCoordinates();
		var seg1, seg1y0, seg1y1, seg1yMin, seg1yMax;
		var seg2, seg2y0, seg2y1, seg2yMin, seg2yMax;
		var i=0;
		for(i; i<segs1.length; ++i) {
			seg1 = segs1[i];
			// Loop over each segment of the requested geometry
			for(var j=0; j<segs2.length; ++j) {
				// Before to really test the intersection between the two
				//    segments, we will test the intersection between their
				//    respective bounding boxes in four steps.
				seg2 = segs2[j];
				// If the most left vertex of seg2 is at the right of the
				//   most right vertex of seg1, there is no intersection
				if (seg2[0] > seg1[1]) {
					continue;
				}
				// If the most right vertex of seg2 is at the left of the
				//   most left vertex of seg1, there is no intersection
				if (seg2[1] < seg1[0]) {
					// seg2 still left of seg1
					continue;
				}
				// To perform similar tests along Y-axis, it is necessary to
				//   order the vertices of each segment
				seg1y0 = seg1[0];
				seg1y1 = seg1[1];
				seg2y0 = seg2[0];
				seg2y1 = seg2[1];
				seg1yMin = Math.min(seg1y0, seg1y1);
				seg1yMax = Math.max(seg1y0, seg1y1);
				seg2yMin = Math.min(seg2y0, seg2y1);
				seg2yMax = Math.max(seg2y0, seg2y1);
				// If the most bottom vertex of seg2 is above the most top
				//   vertex of seg1, there is no intersection
				if (seg2yMin > seg1yMax) {
					continue;
				}
				// If the most top vertex of seg2 is below the most bottom
				//   vertex of seg1, there is no intersection
				if (seg2yMax < seg1yMin) {
					continue;
				}
				// Now it sure that the bounding box of the two segments
				//   intersect themselves, so we have to perform the real
				//   intersection test of the two segments
				if (GeoUtil.segmentIntersect(seg1, seg2)) {
					// These two segments intersect, there is no need to
					//   continue the tests for all the other couples of
					//   segments
					return true;
				}
			}
		}
	}
	return false;
};

GeoUtil.polygonIntersect = function(polygon,geom){
	if(geom.getType() === ol.geom.GeometryType.LINE_STRING){

		// LinearRing should be tested before LineString if a different
		//   action should be made for each case..
		// Test for the intersection of each LinearRing of tis Polygon
		//   with the geometry (LineString or LinearRing)
		var linearRings = polygon.getLinearRings();
		var i=0;
		for(i; i<linearRings.length; i++) {
			if (GeoUtil.lineIntersect(geom,linearRings[i]))
				return true;
		}
		// None of the LinearRings of this Polygon intersects with the
		//  input geometry. An intersection exists in two cases:
		//  1) if the input geomety is whole contained in the first
		//    LinearRing but not in one of the holes represented by the
		//    others LinearRings.
		//  2) if the input geometry is a LinearRing (not a LineString)
		//    and this polygon is whole contained in it.
		//  Test only one vertex is sufficient in the two cases since
		//  there is no intersection.
		//      return this.containsPoint((geom as LineString).componentByIndex(0) as Point)
		//  || ((geom is LinearRing) && (geom as LinearRing).containsPoint((this.componentByIndex(0) as LinearRing).componentByIndex(0) as Point));
	}
	return false;
};

/**
 * Преобразование пришедшего массива с объектом WKT строки из пулково42 в wgs
 * @param dataArr
 * @returns {*}
 */
GeoUtil.parseP42WKTStringToWGS = function(dataArr){
	if(dataArr !== undefined){
		var i = 0;
		for(;i<dataArr.length;i++){
			var obj = dataArr[i];
			if(obj.WKT !== undefined){
				var format = new ol.format.WKT();
				var geometry = format.readGeometry(obj.WKT);
				var coords = geometry.flatCoordinates;
				var newCoords  = [];//of Array.<ol.Coordinate>
				var stride = geometry.stride;
				var j;
				for ( j = 0; j < coords.length; j += stride) {
					var p42WgsPnt = GeoUtil.P42WGS( coords[j+1], coords[j]);
					newCoords.push(p42WgsPnt.x);
					newCoords.push(p42WgsPnt.y);
					if(stride === 3)
						newCoords.push(coords[j+2]);
				}
				if(geometry.getType() === ol.geom.GeometryType.POLYGON || geometry.getType() === ol.geom.GeometryType.MULTI_LINE_STRING)
					geometry.setFlatCoordinates(geometry.layout,newCoords,geometry.getEnds());
				else if(geometry.getType() === ol.geom.GeometryType.MULTI_POLYGON)
					geometry.setFlatCoordinates(geometry.layout,newCoords,geometry.getEndss());
				else
					geometry.setFlatCoordinates(geometry.layout,newCoords);
				//преобразуем в WGS WKT строку
				obj.WKT = format.writeGeometry(geometry)
			}
		}
	}
	return dataArr;
};


/**
 * Проверка, пересекаются ли геометрии
 * @param cadGeo
 * @param bufferGeo
 * @returns {Array}
 */
GeoUtil.checkCadastreInBuffer = function(cadGeo, bufferGeo){
	var polygon1,polygon2,features;
	var result = {geo:undefined, error:''};
	try{
		if(cadGeo instanceof ol.geom.GeometryCollection)
			polygon1 =  new ol.Feature(cadGeo.getGeometries()[0]);
		else
			polygon1 = new ol.Feature(cadGeo);
		polygon2 = new ol.Feature(bufferGeo);
		var format = new ol.format.GeoJSON();
		var fpolygon1 =  format.writeFeatureObject(polygon1);
		var fpolygon2 =  format.writeFeatureObject(polygon2);
		//fpolygon2.geometry.coordinates[0].splice(fpolygon2.geometry.coordinates[0].length-2);
		//fpolygon2.geometry.coordinates[0].push(fpolygon2.geometry.coordinates[0][0]);
		var intersection = turf.intersect(fpolygon1,fpolygon2);
		if(goog.isDef(intersection)){
			features = format.readFeaturesFromObject(intersection);
		}
		result.geo = features;
		return result;
	}
	catch(ex){
		result.error = ex.message;
	}
	return result;
};

/**
 * Перевод тайла в географические координаты
 * @param x долгота
 * @param z масштаб
 * @returns {number}
 * @constructor
 */
GeoUtil.Tile2Longitude = function(x,z) {
	return (x/Math.pow(2,z)*360-180);
};

/**
 * Перевод тайла в географические координаты
 * @param y широта
 * @param z масштаб
 * @returns {number}
 * @constructor
 */
GeoUtil.Tile2Latitude = function(y,z) {
	var n=Math.PI-2*Math.PI*y/Math.pow(2,z);
	return (180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n))));
};
/**
 * Вычисление ближайшей точки до прямой
 */
GeoUtil.getClosestPointForGeo = function(objForBind, pointCoord) {
	//рассчитываем ближайшее расстояние до каждого из отрезков прямой
	//Координаты сначала переводятся из проекции базового слоя карты в метровую,
	//затем рассчитывается привязка, а потом полученные координаты привязки переводятся в проекцию базового слоя карты
	if(goog.isDef(objForBind.geo) && (objForBind.geo.getGeometry().getType() === ol.geom.GeometryType.LINE_STRING
		|| objForBind.geo.getGeometry().getType() === ol.geom.GeometryType.POLYGON)) {
		var minDist1 = Number.POSITIVE_INFINITY;
		var closestSegment1 = null;
		var srcPntArr1;
		var coeff1 = 0;
		//дополнительные переменные для привязки линейного EVENT_RANGE
		srcPntArr1 = pointCoord;//текущее положение курсора
		//получаем сегменты линии
		var point1;
		var point2;
		var lineCoordinates = objForBind.geo.getGeometry().getCoordinates();
		var numSegs = lineCoordinates.length;
		if(objForBind.geo.getGeometry().getType() === ol.geom.GeometryType.POLYGON && lineCoordinates.length > 0){
			numSegs = lineCoordinates[0].length;
			lineCoordinates = lineCoordinates[0];
		}

		var pos1 = -1;
		var i = 0;
		//var pp = ol.coordinate.closestOnSegment(lineCoordinates,)
		for (; i < numSegs - 1; ++i) {
			point1 = lineCoordinates[i];
			point2 = lineCoordinates[i + 1];
			//Длина текущего отрезка
			var segmentLength = GeoUtil.Distance(point1, point2);
			//рассчитываем ближайшее расстояние от нашей точки до текущего отрезка
			var calcDist1 = GeoUtil.LineToPointDistance2D(point1, point2, srcPntArr1, true);
			if (calcDist1 < minDist1) {
				var srcPoint1ToPoint1Dist = GeoUtil.Distance(point1, srcPntArr1);
				var srcPoint1ToPoint2Dist = GeoUtil.Distance(point2, srcPntArr1);
				//рассчитываем коэффициент отношения длины от начальной точки до точки проекции на отрезок к длине отрезка
				//Если длина от нашей точки до отрезка равна длине от нашей точки до одной из 2-х точек отрезка coeff1 = 0 если точка первая и coeff1 = 1 если точка последняя
				if (calcDist1 === srcPoint1ToPoint1Dist)
					coeff1 = 0;
				else if (calcDist1 === srcPoint1ToPoint2Dist)
					coeff1 = 1;
				else
					coeff1 = Math.sqrt(Math.pow(srcPoint1ToPoint1Dist, 2) - Math.pow(calcDist1, 2)) / segmentLength;
				//Сохраняем текущую дистанцию как минимальную, текущий отрезок как ближайший
				minDist1 = calcDist1;
				closestSegment1 = [point1, point2];
				//тут ещё можно посчитать координаты точки пересечения
				pos1 = i;
			}
		}
		if (!goog.isNull(closestSegment1)) {
			// closestsegment1 - найти проекцию
			var newPointProj = ol.coordinate.closestOnSegment(srcPntArr1, closestSegment1);
			return {segment: closestSegment1, geo: objForBind.geo, position: pos1, point: newPointProj, coeff: coeff1};
		}
	}
	return undefined;
};

GeoUtil.getIntersectedRouteGeometry = function(geometry, extent, routeId, routeLabel){
	var result = [];
	goog.asserts.assert(goog.isDefAndNotNull(geometry),
		'feature geometry is defined and not null');
	switch(geometry.getType()){
		case ol.geom.GeometryType.MULTI_LINE_STRING:
			var i, ii;
			var ends = geometry.ends_;
			var offset = 0;
			if(goog.isDef(globalLinesLabels_[feature.get('labelType')])){
				for (i = 0, ii = ends.length; i < ii; ++i) {
					var geo = globalLinesLabels_[feature.get('labelType')][i].geo;
					if(geo === undefined)
						continue;
					var geoExcent = geo.getExtent();
					if(!ol.extent.intersects(geoExcent, extent))
						continue;
					/*if (GeoUtil.lineString(geometry.flatCoordinates, offset, ends[i], geometry.stride, extent, geoExcent)) {*/
					if (ol.geom.flat.intersectsextent.lineString(
						geometry.flatCoordinates, offset, ends[i], geometry.stride, extent)) {
						var obj =  jQuery.extend({}, globalLinesLabels_[feature.get('labelType')][i]);
						var geosArr = [];
						if(goog.isDef(obj.id)){
							var testId = obj.id;
							if(obj.id.indexOf('@')!=-1)
								testId = obj.id.substring(0, obj.id.indexOf('@'));
							var r=0;
							//проверяем, обрабатывался ли ранее этот id, когда ткнули в объект с @, если да, то пропускаем
							var rFinded = false;
							for(;r<result.length;r++){
								if(goog.isDef(result[r].id) && result[r].id == testId){
									rFinded = true;
									break;
								}
							}
							if(rFinded)
								continue;
							geosArr.push(geometry.getLineString(i).clone());
							if( obj.id.indexOf('@')!=-1){
								//проходимся по добавленным объектам. Если нашли объект, то игнорируем, если не нашли, то
								//ищем основной и добавляем его
								var fullId = obj.id.substring(0, obj.id.indexOf('@'));
								//проходимся по всем остальным связанным объектам
								var t,tt;
								for (t = 0, tt = ends.length; t < tt; ++t) {
									if(t == i) //пропускаем индекс объекта, найденного выше
										continue;
									//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
									//, выбираем из этого списка
									var newObj;
									if(globalLinesLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
										newObj = feature.get('labelsObj')[t];
									}
									else{
										newObj = globalLinesLabels_[feature.get('labelType')][t];
									}
									if(goog.isDef(newObj) && goog.isDef(newObj.id) && (newObj.id.indexOf(fullId+'@')!=-1 || newObj.id == fullId)){//нужный id
										geosArr.push(geometry.getLineString(t).clone());
									}
								}
								obj.id = fullId;
							}
							else{
								//доп. проверка. Если в id есть @, значит работам с мультиобъектом из gdal
								//если нет @ - значит это основной объект и ищем все геометрии связанные с ним
								var fullId = obj.id;
								//проходимся по всем остальным связанным объектам
								var t,tt;
								for (t = 0, tt = ends.length; t < tt; ++t) {
									if(t == i) //пропускаем индекс объекта, найденного выше
										continue;
									//если количество отображаемых объектов в слое меньше, чем количество загруженных(фильтрация - оставить выбранные)
									//, выбираем из этого списка
									var newObj;
									if(globalLinesLabels_[feature.get('labelType')].length>feature.get('labelsObj').length){
										newObj = feature.get('labelsObj')[t];
									}
									else{
										newObj = globalLinesLabels_[feature.get('labelType')][t];
									}
									if(goog.isDef(newObj) && goog.isDef(newObj.id) && (newObj.id.indexOf(fullId+'@')!=-1 || newObj.id == fullId)){//нужный id
										geosArr.push(geometry.getLineString(t).clone());
									}
								}
							}
						}

						if(geosArr.length == 1)
							obj.geo = new ol.Feature(geosArr[0].clone());
						else{
							var gm = new ol.geom.MultiLineString(null);
							gm.setLineStrings(geosArr);
							obj.geo = new ol.Feature(gm);
						}
						obj.feature = feature;
						result.push(obj);
					}
				}
			}
			offset = ends[i];
			break;
		case ol.geom.GeometryType.LINE_STRING:
			ol.geom.flat.intersectsextent.lineString(
				geometry.flatCoordinates, 0, geometry.ends_, geometry.stride, extent);
			var obj = {};
			obj.geo = geometry.clone();
			obj.id = routeId;
			obj.label = routeLabel;
			result.push(obj);
			break;
	}
	return result;
};

/**
 * Вычисление ближайшей точки до прямой
 */
GeoUtil.getClosestRoutePointForGeo = function(objForBind, pointCoord) {
	//рассчитываем ближайшее расстояние до каждого из отрезков прямой
	//Координаты сначала переводятся из проекции базового слоя карты в метровую,
	//затем рассчитывается привязка, а потом полученные координаты привязки переводятся в проекцию базового слоя карты
	if(goog.isDef(objForBind.geo) && objForBind.geo.getType() === ol.geom.GeometryType.LINE_STRING) {
		var minDist1 = Number.POSITIVE_INFINITY;
		var closestSegment1 = null;
		var srcPntArr1;
		var coeff1 = 0;
		//дополнительные переменные для привязки линейного EVENT_RANGE
		srcPntArr1 = pointCoord;//текущее положение курсора
		//получаем сегменты линии
		var point1;
		var point2;
		var lineCoordinates = objForBind.geo.getCoordinates();
		var numSegs = lineCoordinates.length;
		var pos1 = -1;
		var i = 0;
		//var pp = ol.coordinate.closestOnSegment(lineCoordinates,)
		for (; i < numSegs - 1; ++i) {
			point1 = lineCoordinates[i];
			point2 = lineCoordinates[i + 1];
			//Длина текущего отрезка
			var segmentLength = GeoUtil.Distance(point1, point2);
			//рассчитываем ближайшее расстояние от нашей точки до текущего отрезка
			var calcDist1 = GeoUtil.LineToPointDistance2D(point1, point2, srcPntArr1, true);
			if (calcDist1 < minDist1) {
				var srcPoint1ToPoint1Dist = GeoUtil.Distance(point1, srcPntArr1);
				var srcPoint1ToPoint2Dist = GeoUtil.Distance(point2, srcPntArr1);
				//рассчитываем коэффициент отношения длины от начальной точки до точки проекции на отрезок к длине отрезка
				//Если длина от нашей точки до отрезка равна длине от нашей точки до одной из 2-х точек отрезка coeff1 = 0 если точка первая и coeff1 = 1 если точка последняя
				if (calcDist1 === srcPoint1ToPoint1Dist)
					coeff1 = 0;
				else if (calcDist1 === srcPoint1ToPoint2Dist)
					coeff1 = 1;
				else
					coeff1 = Math.sqrt(Math.pow(srcPoint1ToPoint1Dist, 2) - Math.pow(calcDist1, 2)) / segmentLength;
				//Сохраняем текущую дистанцию как минимальную, текущий отрезок как ближайший
				minDist1 = calcDist1;
				closestSegment1 = [point1, point2];
				//тут ещё можно посчитать координаты точки пересечения
				pos1 = i;
			}
		}
		if (!goog.isNull(closestSegment1)) {
			// closestsegment1 - найти проекцию
			var newPointProj = ol.coordinate.closestOnSegment(srcPntArr1, closestSegment1);
			return {segment: closestSegment1, geo: objForBind.geo, position: pos1, point: newPointProj, coeff: coeff1};
		}
	}
	return undefined;
};


/**
 * Перевод десятичные градусы в градусы
 */
GeoUtil.convertDecimalIntoDegree = function (text) {
	//ex. 56.530865
	var n = parseFloat(text);
	if(isNaN(n))
		return '';
	var dd = parseInt(text);//градус
	var mm = parseInt((n - dd) * 60);//минуты
	var ss = ((n - dd) * 60 - mm) * 60;
	//ss = parseInt(ss*100);//Math.round(60*(n - dd)*60 - parseInt(n - parseInt(n))*60) ;//секунды
	ss = ss.toFixed(2);
	if (dd < 10)
		dd = '0' + dd;
	dd = dd + '° ';
	if (mm < 10)
		mm = '0' + mm;
	mm = mm + "' ";
	if (ss < 10)
		ss = '0' + ss;
	ss = ss + "''";
	return dd + mm + ss;

	/*var n = parseFloat(text);
	var dd = parseInt(n);
	var ddS = (dd<10)?'0'+dd:dd;
	var mm = parseInt((n-dd)*60);
	var mmS = (mm<10)?'0'+mm:mm;
	var ss = parseInt((n - dd - mm/60)*3600);
	return ""+ddS+"°"+mmS+"\""+ss+'\'';*/
};


/**
 * Перевод градусы в десятичные градусы
 */
GeoUtil.convertDegreeIntoDecimal = function (text) {
	var dd = text.split('°')[0];
	dd = dd.replace('_', '0').replace('_', '0');
	var mm = text.split('°')[1].split("'")[0];
	mm = mm.replace('_', '0').replace('_', '0');
	var ss = text.split('°')[1].split("'")[1];
	ss = ss.replace('_', '0').replace('_', '0').replace('_', '0').replace('_', '0');

	var ddD = parseFloat(dd);
	var mmD = parseFloat(mm);
	var ssD = parseFloat(ss);
	if(isNaN(ddD) || isNaN(mmD) || isNaN(ssD))
		return -1;
	var resDD = Math.round(100000 * (ddD + mmD / 60 + ssD / 3600)) / 100000;
	return resDD;
};

/**
 * Переводим десятичные градусы в градусы в массиве объектов вида {latitude:22, longitude:22}
 */
GeoUtil.convertArrayDecimalIntoDegree = function (array) {
	for (var i = 0; i <= array.length; i++) {
		array[i].longitude = GeoUtil.convertDecimalIntoDegree(array[i].longitude);
		array[i].longitude = GeoUtil.convertDecimalIntoDegree(array[i].latitude);
	}
	return array;
};

/**
 * Переводим градусы в десятичные градусы в массиве объектов вида {latitude:22, longitude:22}
 */
GeoUtil.convertArrayDegreeIntoDecimal = function (array) {
	for (var i = 0; i <= array.length; i++) {
		array[i].longitude = GeoUtil.convertDegreeIntoDecimal(array[i].longitude);
		array[i].longitude = GeoUtil.convertDegreeIntoDecimal(array[i].latitude);
	}
	return array;
};


GeoUtil.getFontSizeByCharWidth = function(charWidth){
	return parseInt(''+(charWidth*20/11));
	if(charWidth < 10)
		return 12;
	if(charWidth < 12)
		return 20;
	if(charWidth < 14)
		return 24;
	if(charWidth < 14)
		return 24;
	/*if(charWidth < 10)
		return 12;
	if(charWidth < 10)
		return 12;*/
	return 12;
};

/**
 * Функция вырезает точки переданной геометрии, которые попали в полигон
 * @param baseGeometry
 * @param polygon
 * @returns {*}
 */
GeoUtil.truncateGeometry = function(baseGeometry, polygonGeometry) {
	var newGeometry = baseGeometry;
	if(baseGeometry){
		var coords = baseGeometry.getCoordinates();
		var newCoords = [];
		if(baseGeometry.getType() === ol.geom.GeometryType.POINT){
			if(!polygonGeometry.containsCoordinate(coords))
				newCoords.push(coords);
			newGeometry.setFlatCoordinates(newGeometry.layout, newCoords);
		}
		else if(baseGeometry.getType() === ol.geom.GeometryType.LINE_STRING){
			coords.forEach(function (coord) {
				if (!polygonGeometry.containsCoordinate(coord))
					newCoords.push(coord);
			})
			if(newCoords.length < 2){
				//обнуляем геометрию, т.к. 2 координаты в полигоне
				newCoords = [];
			}
			newGeometry.setCoordinates(newCoords, newGeometry.layout);
		}
		else {
			if(coords.length > 0){
				coords.forEach(function (pCoords) {
					pCoords.forEach(function (coord) {
						if (!polygonGeometry.containsCoordinate(coord)){
							newCoords.push(coord[0],coord[1]);
						}

					});
				});
			}
			if(newCoords.length >= 6){  //3*2 координаты
				//проверяем, что 1-я и последняя координаты совпадают. Если нет - дописываем
				if(!(newCoords[0] === newCoords[newCoords.length - 2] && newCoords[1] === newCoords[newCoords.length - 1]))
					newCoords.push(newCoords[0], newCoords[1]);
			}else{
				//обнуляем геометрию, т.к. 2 координаты в полигоне
				newCoords = [];
			}
			//newGeometry.setCoordinates(newCoords, newGeometry.layout);
			newGeometry.setFlatCoordinates(newGeometry.layout, newCoords, [newCoords.length]);
		}
	}
	return newGeometry;
}

/**
 * Функция вырезает точки переданной геометрии, которые extent
 * @param baseGeometry
 * @param extent
 * @returns {*}
 */
GeoUtil.truncateGeometryByExtent = function(baseGeometry, extent) {
	var newGeometry = baseGeometry;
	if(baseGeometry){
		var coords = baseGeometry.getCoordinates();
		var newCoords = [];
		if(baseGeometry.getType() === ol.geom.GeometryType.POINT){
			if(!ol.extent.containsCoordinate(extent,coords))
				newCoords = coords;
			newGeometry.setFlatCoordinates(newGeometry.layout, newCoords);
		}
		else if(baseGeometry.getType() === ol.geom.GeometryType.LINE_STRING){
			coords.forEach(function (coord) {
				if (!ol.extent.containsCoordinate(extent, coord))
					newCoords.push(coord);
			})
			if(newCoords.length < 2){
				//обнуляем геометрию, т.к. 2 координаты в полигоне
				newCoords = [];
			}
			newGeometry.setCoordinates(newCoords, newGeometry.layout);
		}
		else {

			if(coords.length > 0){
				coords.forEach(function (pCoords) {
					var firstCoord = pCoords[0], endCoord = pCoords[pCoords.length - 1]; //первая и последняя координаты, совпадают у полигона
					pCoords.forEach(function (coord, i) {
						if (!ol.extent.containsCoordinate(extent, coord)){
							newCoords.push(coord[0],coord[1]);
						}
					});
				});
			}
			if(newCoords.length >= 6){  //3*2 координаты
				//проверяем, что 1-я и последняя координаты совпадают. Если нет - дописываем
				if(!(newCoords[0] === newCoords[newCoords.length - 2] && newCoords[1] === newCoords[newCoords.length - 1]))
					newCoords.push(newCoords[0], newCoords[1]);
			}else{
				//обнуляем геометрию, т.к. 2 координаты в полигоне
				newCoords = [];
			}
			//newGeometry.setCoordinates(newCoords, newGeometry.layout);
			newGeometry.setFlatCoordinates(newGeometry.layout, newCoords, [newCoords.length]);
		}

	}
	return newGeometry;
}

/**
 * Получение координат по введенной строке.
 * Формат координат допускается либо в десятичном виде(57.8527438000 55.0096917000), либо обычном(55°22'15.94'' 57°50'41.10'')
 *
 * @param str
 */
GeoUtil.getCoordsByString = function(str){
	var maskLat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/;
	var maskLon = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/;
	if(str){
		var lat = '', lon = '';
		var coordsSp = str.trim().split(' ');
		coordsSp.forEach(function(item){
			if(item !== '')
				if(lon === '')
					lon = item;
				else
					lat = item;
		});
		if(lat.match(maskLat) && lon.match(maskLon))
			return {y:lon, x:lat};
	}
}

GeoUtil.getFlatGeometry = function(baseFeature){
	if(!baseFeature)
		return;
	var coords = undefined;
	try{
		if (!baseFeature.getGeometry)// если .geo это фича(выбранный обхъект), то ничего не делаемб иначе создаем новую фичу с геометрией
			baseFeature = new ol.Feature(baseFeature);
		var geometry = baseFeature.getGeometry();
		if(!geometry)
			return;

		switch(geometry.getType()){
			case ol.geom.GeometryType.LINE_STRING :
				coords = geometry;
				break;
			case ol.geom.GeometryType.POINT :
				coords = geometry.flatCoordinates;
				break;
			case ol.geom.GeometryType.POLYGON :
				var pp = new ol.geom.Polygon(null);
				var linearRing = new ol.geom.LinearRing(null);
				linearRing.setFlatCoordinates(ol.geom.GeometryLayout.XY, geometry.flatCoordinates);
				pp.appendLinearRing(linearRing);
				coords = pp;
				break;
		}
	}
	catch(ex){ }
	return coords;
}

/**
 *
 * @param feature фича для клонирования
 * @param withGeo флаг, нужно ли копировать геометрию
 * @returns {ol.Feature}
 */
GeoUtil.cloneFeature = function (feature, withGeo, recreateGeo) {
	var clone = new ol.Feature(feature.getProperties());
	clone.setGeometryName(feature.getGeometryName());
	if (withGeo) {
		var geometry = feature.getGeometry();
		if (geometry) {
			//если тип полигов
			if(recreateGeo && geometry.getType() === ol.geom.GeometryType.POLYGON){
				var polygon = new ol.geom.Polygon(null);
				polygon.setFlatCoordinates(geometry.layout, geometry.flatCoordinates,
					[geometry.flatCoordinates.length]);
				clone.setGeometry(polygon);
			}
			else
				clone.setGeometry(geometry.clone());
		}
	}
	var style = feature.getStyle();
	if (style) {
		clone.setStyle(style);
	}
	return clone;
};

/**
 * Функция для переподготовки геометрии полигона, который резался, чтобы не сбивались endss при рисовании на карте
 * @param feature
 * @returns {*}
 */
GeoUtil.recreateFeatureGeometry = function (feature) {
	//если тип полигов
	var newFeature = feature;
	var geometry = feature.getGeometry();
	if(geometry.getType() === ol.geom.GeometryType.POLYGON){
		var polygon = new ol.geom.Polygon(null);
		polygon.setFlatCoordinates(geometry.layout, geometry.flatCoordinates,
			[geometry.flatCoordinates.length]);
		newFeature.setGeometry(polygon);
	}
	else
		newFeature.setGeometry(geometry.clone());
	return newFeature;
};



/**
 * Функция корректирует положение подписи на техсхеме для слоя капитальных ремонтов
 *
 * @param {Object} lay Объект слоя LayerManager.getLayerByName
 * @param {ol.Geometry} geometry геометрия рисуемого объекта(линия, точка)
 * @param {number} x базовая координата подписи в пикселах
 * @param {number} y базовая координата подписи в пикселах
 * @param {Object} shift  объект с положением линии и текстом {position:1, text:''}
 * @param {number} textWidth ширина текста
 * @param {number} mapZoom масштаб карты
 * @returns {{x, y}}
 */
GeoUtil.kapRemAdjustment = function(lay, geometry, x, y, shift, textWidth, mapZoom){
	var labelCollisionPercent = 0.3;// 30%
	if(lay && lay.id === 'KAP_REMONT_PLAN' && geometry && mapZoom > 7){
		var extent = geometry.getExtent();
		// в кпг линия с диагональным перепадом, то рисуем подпись в конце линии(трубы идут справо налево)
		var isDiagLine = (1 - extent[1]/extent[3]) > 0.001;
		if(isDiagLine){
			var lastCoord = WidgetMap.map.getPixelFromCoordinate([geometry.flatCoordinates[geometry.flatCoordinates.length - 2],geometry.flatCoordinates[geometry.flatCoordinates.length - 1]]);
			x = lastCoord[0] + textWidth/2;
			y = lastCoord[1];
		}
		else if(shift && shift.position !== 0 && mapZoom < 10){
			var newX, newY;
			var position = shift.position;
			var firstTextPx = x;
			var lastGeoPx = WidgetMap.map.getPixelFromCoordinate([extent[2],extent[3]])[0];
			var firstGeoPx = WidgetMap.map.getPixelFromCoordinate([extent[0],extent[1]])[0];
			newX = x + textWidth * position;
			//если начало подписи выходит за линию, то двигаем её в обратную сторону влево
			if(newX > lastGeoPx){
				newX = x - textWidth/2;
				if(newX > firstGeoPx){
					x = newX;
				}
				else if(position % 2 !== 0) //если и влево выходит за пределы и position четная, тоне рисуем подпись
					x = NaN;
			}
			else if(newX > firstGeoPx){
				x = x + textWidth * position;
			}
		}
	}

	return {x: x, y:y};
}

//TODO перенести данные функции в файл утилит по canvasreplay

/**
 * Функция формирования линии по видимой рамке карты, чтобы подписывания начинались именно с границ видимой области карты
 * @param lineString
 * @param mapExtent
 * @param isPods //TODO upd. 09.02.22 в рамках работы по задаче "карта водного перехода" принято решение
 * пока хардкодить условие отображение(30px) подписи по названию PODS
 * @returns {*}
 */
GeoUtil.composeLineStringByExtent = function(lineString, mapExtent, isPods){
	isPods = isPods === true;
	if(!lineString)
		return;
	//если линия не пересекает рамку карты, не включаем её в выдачу
	if(!lineString.intersectsExtent(mapExtent))
		return;
	var geometryExtent = lineString.getExtent();
	//Обрезаем линии по рамке
	var coordinates = lineString.getCoordinates();
	var intersects = Intersection.lineclip(coordinates, mapExtent);
	var geometry = undefined;
	var geometries = [];
	var resolution = WidgetMap.map.getView().getResolution();
	if(intersects && intersects.length > 0){
		geometry = new ol.geom.LineString(intersects[0], ol.geom.GeometryLayout.XY);
		geometryExtent = geometry.getExtent();
		//проверяем, что если линия меньше допустимого размера, то не выдаем её
		var lineD = Math.sqrt(ol.extent.getWidth(geometryExtent) * ol.extent.getWidth(geometryExtent) + ol.extent.getHeight(geometryExtent) * ol.extent.getHeight(geometryExtent));
		lineD /= resolution;
		//upd. 02.09.21 если длина линии меньше 30px(размер иконки для визуального сравнения), то подпись не выводим(нет смысла для труб выводить такую подпись)
		if (lineD >= 30 || !isPods)
			geometries.push(geometry);
	}
	if(geometries && geometries.length > 0)
		return geometries;
}


GeoUtil.getLineStringsByStartPoint = function(lineString, startPoint, textWidth, findSector){
	if(!lineString)
		return [];
	if(!findSector)findSector = 'right';
	var offset = 10; //увеличиваем у рамки область захвата
	//рамка вокруг точки
	var leftOffset = (findSector === 'left') ? textWidth + offset : 0;
	var rightOffset = (findSector === 'right') ? textWidth + offset : 0;
	var pointExtent = [startPoint[0] - leftOffset, startPoint[1] - textWidth - offset, startPoint[0] + rightOffset, startPoint[1] + textWidth + offset];
	//Обрезаем линии по рамке
	var coordinates = lineString.getCoordinates();
	var geometries = [];
	var intersects = Intersection.lineclip(coordinates, pointExtent);
	var geometry = undefined;

	if(intersects && intersects.length > 0) {
		geometry = new ol.geom.LineString(intersects[0], ol.geom.GeometryLayout.XY);
		geometries.push(geometry);
	}
	return geometries;
}

/**
 * Получение координаты на прямой по двум точкам и дистанции от 1-й точки
 * @param pnt1
 * @param pnt2
 * @param distance
 * @returns {*[]}
 */
GeoUtil.getCoordsByDistance = function(pnt1, pnt2, distance){
	if(!pnt1 || !pnt2) return;
	var theta = Math.atan2(pnt2[1] - pnt1[1], pnt2[0] - pnt1[0]);
	return [pnt1[0] + distance * Math.cos(theta), pnt1[1] + distance * Math.sin(theta)];
}




GeoUtil.rotateLineTextBy2Points = function (p1, p2) {
	var p1,p2, x, y;
	var tempP = p1;
	if (p1[0] > p2[0]) {
		p1 = p2;
		p2 = tempP;
	}
	var rotation = 0;
	if (p1 !== null && p2 !== null) {
		rotation = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI;
	}
	//переводим в радианы
	rotation = rotation * Math.PI / 180;
	return [x, y, rotation];
};


/**
 * Разбиваем линию на отрезки, чтобы производить рисование подписи в рамках каждого отрезка.
 * Во время разбития возвращаем вектор подписи с корректным сдвигом по горизонтали.
 * TODO для вертикальных сдвигов пока принято решение не сдвигать
 * Зависимость от map_label_repeatRatio
 * @param {{startPoint: Array<number>, lineString: ol.geom.LineString}} startPointOptions
 * @param textObject
 * @param isCasUnits
 * @return {Array<map.renderer.vector.TextVector>}
 */
GeoUtil.composeTextVectorFromStartPoint = function(startPointOptions, textObject, isCasUnits, needTransform){
	if(!startPointOptions || startPointOptions.startPoint === undefined)
		return;
	var segmentCoords = [], lineString = startPointOptions.lineString, startPoint = startPointOptions.startPoint;
	var coords = lineString.getCoordinates();
	//переводим координаты линии в пикселы
	for(var i = 0; i < coords.length; i++) {
		var pnt = (needTransform !== false)?WidgetMap.map.getPixelFromCoordinate(coords[i]):coords[i];
		segmentCoords.push([pnt[0], pnt[1]]);
	}
	return GeoUtil.createTextVector(startPoint, segmentCoords, textObject, isCasUnits);
}

GeoUtil.getLength = function(coords){
	var length = -1;
	for(var i = 1; i < coords.length; i++) {
		var pnt1 = WidgetMap.map.getPixelFromCoordinate(coords[i - 1]);
		var pnt2 = WidgetMap.map.getPixelFromCoordinate(coords[i]);
		var distanceP1P2 = Math.sqrt(ol.coordinate.squaredDistance(pnt1, pnt2));
		length += distanceP1P2;
	}
	return length;
}

/**
 * Создание объекта вектора текста
 * @param startPoint начальная точка от которой начинать рисовать
 * @param segmentCoords
 * @param textObject
 * @param isCasUnits
 * @returns {map.renderer.vector.TextVector|undefined}
 */
GeoUtil.createTextVector = function(startPoint, segmentCoords, textObject, isCasUnits){
	if(!textObject)
		return;
	var textStyle = textObject.textStyle;
	var textWidth = textObject.textWidth;
	var textHeight = 12;
	var lineString = new ol.geom.LineString(null);
	lineString.setCoordinates(segmentCoords, ol.geom.GeometryLayout.XY);
	//пункт 5. Вращение. Определение второй точки вектора подписи
	var rotation = GeoUtil.rotateLineText(startPoint, lineString, textWidth);
	if(textObject.isTextObject){//если надпись
		rotation = GeoUtil.rotateLineTextObject(startPoint, lineString, textWidth);
	}
	if(isNaN(rotation))
		return;
	var x = startPoint[0];//координаты без смещения
	var y = startPoint[1];
	var bounds = [];//полигон
	var textProp = {
		rotation: rotation,
		textWidth: textWidth,
		textHeight: textHeight,
		text: textObject.text,
		isTextObject: textObject.isTextObject,
	};
	var text = textObject.text;
	var labelDrawType = LABEL_DRAW_TYPE;
	if (isCasUnits) labelDrawType = 'cas_units';
	if (labelDrawType === 'cut' ){
		var cutObj = GeoUtil.cutText(textProp, segmentCoords, x, y);
		if(!cutObj) return;
		text = cutObj.text;
		bounds = cutObj.bounds;
		var coordEnd = cutObj.coordEnd;
	}

	var textVector = new map.renderer.vector.TextVector({
		text: text, x: x, y: y, coordEnd: coordEnd,
		rotation: rotation,
		lineString: lineString,
		textStyle: textStyle,
		textWidth: textWidth,
		textHeight: textHeight,
		bounds: bounds,
	});

	return textVector;
}

/**
 * Функция выссчитывает начальное положение точки
 * @param lineString
 * @param align
 * @param mapWidth
 * @returns {{startPoint: Array<number>, lineString: ol.geom.LineString}}
 */
GeoUtil.alignText = function(lineString, align, mapWidth, textWidth, text){
	//var textAlign = align || 'center';
	var textAlign = 'center';
	var p1;
	var tries = 1;
	if(textAlign === 'center'){
		p1 = lineString.getFlatMidpoint();//GeoUtil.findCenter(lineString, distance);
		p1 = WidgetMap.map.getPixelFromCoordinate(p1);
		//получение начальной точки, чтобы подпись рисовалась ровно по центру
		var startPointObj = GeoUtil.getRealStartPoint(lineString, p1, textWidth, text);
		if(startPointObj && startPointObj.startPoint){
			p1 = startPointObj.startPoint;
			tries = startPointObj.tries;
		}
	}
	return {startPoint: p1, lineString: lineString, tries:tries};
}

GeoUtil.alignTextObject = function(lineString, align){
	var textAlign = align || 'right';
	var p1, p2;
	if(textAlign === 'left'){
		p1 = WidgetMap.map.getPixelFromCoordinate([lineString.flatCoordinates[0], lineString.flatCoordinates[1]]);
		/*p2 =  lineString.flatCoordinates[lineString.flatCoordinates.length - 1];
		if(p1[0] > p2[0])
			p1 = p2;*/
	}
	/*if(textAlign === 'right'){
		p1 = lineString.flatCoordinates[lineString.flatCoordinates.length - 1];
		p2 = lineString.flatCoordinates[0];
		if(p1[0] > p2[0])
			p1 = p2;
	}*/
	return {startPoint: p1, lineString: lineString, tries:1};
}

/**
 * Функция получения реального центра линии, чтобы подпись рисовалась ровно по центру
 * @param fLineString
 * @param center
 * @param radius
 */
GeoUtil.getRealStartPoint = function(fLineString, center, radius, text){
	var coords = fLineString.getCoordinates();
	//переводим координаты линии в пикселы
	var segmentCoords = [];
	for(var i = 0; i < coords.length; i++) {
		var pnt = WidgetMap.map.getPixelFromCoordinate(coords[i])
		segmentCoords.push([pnt[0], pnt[1]]);
	}
	var lineString = new ol.geom.LineString(null);
	lineString.setCoordinates(segmentCoords, ol.geom.GeometryLayout.XY);
	//проводим поиск точек пересечения сначала в левой части
	var textWidth = radius;
	var startPoint = GeoUtil.getPointOnLineByCenterAndRadius(center, lineString, textWidth/2, 'left');
	var tries = 1; //попытки обрезки
	//доп. проверка. если не нашли точку стартовую, то сокращаем размер подписи и пытаемся найти заново
	if(startPoint === undefined){
		for(var i = 0; i < 3; i++){
			textWidth -= textWidth * LABEL_CUT_RATIO;
			startPoint = GeoUtil.getPointOnLineByCenterAndRadius(center, lineString, textWidth/2, 'left');
			tries++;
			if(startPoint !== undefined)
				break;
		}
	}
	if(startPoint === undefined)
		return undefined;
	return {startPoint: startPoint, tries: tries};
	//если не нашли в левой части - ищем внизу
}


/**
 *
 * @param startPoint
 * @param fLineString
 * @param textWidth
 * @param findSector сектор, в котором ищется точки пересечения  left|right|top|bottom
 * @returns {number[]}
 */
GeoUtil.getPointOnLineByCenterAndRadius = function(startPoint, fLineString, textWidth, findSector){
	if(!findSector) findSector = 'right';
	//формируем рамку у начальной точки, как по ширине подписи * 2( 2 * R )
	var subLineStrings = GeoUtil.getLineStringsByStartPoint(fLineString, startPoint, textWidth, findSector);
	//проходимся по сегментам и ищем точки пересечения с отрезками сегментов
	var intersectPoints = [];
	for(var i = 0; i < subLineStrings.length; i++){
		var subLineString = subLineStrings[i];
		var subLineStringCoords = subLineString.getCoordinates();
		for(var j = 0; j < subLineStringCoords.length - 1; j++){
			//получаем отрезок и ищем точки пересечения
			var segment = [subLineStringCoords[j], subLineStringCoords[j + 1]];
			var segmentIntersects  = GeoUtil.intersectCircleAndSegment(segment, startPoint, textWidth)
			if(!segmentIntersects)
				continue;
			var segmentString = new ol.geom.LineString(null);
			segmentString.setCoordinates(segment, ol.geom.GeometryLayout.XY);
			//получили рамку отрезка, чтобы при выборке на те пересечения, которые попадают в рамку
			var segmentExtent = segmentString.getExtent();
			var intersects = GeoUtil.getIntersectionBetweenCircleAndLine(segmentString, startPoint, textWidth);
			if(intersects)
				intersects.forEach(function(point){
					//пункт 5.2 из массива точек убираем точки левее, т.е. оставляем точки только в правом секторе
					if (findSector === 'right' && point[0] >= startPoint[0]){
						var pointExtent = [point[0],point[1],point[0],point[1]];
						if(ol.extent.intersects(pointExtent, segmentExtent))
							intersectPoints.push(point);
					}
					if (findSector === 'left' && point[0] <= startPoint[0]){
						var pointExtent = [point[0],point[1],point[0],point[1]];
						if(ol.extent.intersects(pointExtent, segmentExtent))
							intersectPoints.push(point);
					}
				});
		}
	}
	//пункт 5.3 сортируем оставшиеся точки и выбираем максимальный Y
	var secondPoint = [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY];
	intersectPoints.forEach(function(point){
		if(point[1] >= secondPoint[1])
			secondPoint = point;
	});

	//если не нашли при повороте точку пересечения с отрезком
	if(secondPoint[0] === Number.NEGATIVE_INFINITY || secondPoint[1] === Number.NEGATIVE_INFINITY)
		return;
	return secondPoint;
}

/**
 * Поворот подписи по начальной точке
 * @param startPoint начальная точка
 * @param fLineString линий, на которой подпись рисуется
 * @param textWidth
 * @returns {number}
 */
GeoUtil.rotateLineText = function (startPoint, fLineString, textWidth) {
	var secondPoint = GeoUtil.getPointOnLineByCenterAndRadius(startPoint, fLineString, textWidth);
	if(secondPoint === undefined){
		for(var i = 0; i < 3; i++){
			textWidth -= textWidth * LABEL_CUT_RATIO;
			secondPoint = GeoUtil.getPointOnLineByCenterAndRadius(startPoint, fLineString, textWidth);
			if(secondPoint !== undefined)
				break;
		}
	}
	if(secondPoint === undefined)
		return NaN;

	var rotation = Math.atan2(secondPoint[1] - startPoint[1], secondPoint[0] - startPoint[0]) * 180 / Math.PI;
	//переводим в радианы
	rotation = rotation * Math.PI / 180;
	return rotation;
};

/**
 * Поворот подписи по начальной точке
 * @param startPoint начальная точка
 * @param fLineString линий, на которой подпись рисуется
 * @param textWidth
 * @returns {number}
 */
GeoUtil.rotateLineTextObject = function (startPoint, fLineString, textWidth) {
	var lineCoords =  fLineString.getCoordinates();
	var secondPoint = lineCoords[lineCoords.length - 1];
	var rotation = Math.atan2(secondPoint[1] - startPoint[1], secondPoint[0] - startPoint[0]) * 180 / Math.PI;
	//переводим в радианы
	rotation = rotation * Math.PI / 180;
	return rotation;
};

/**
 * Поворот подписи вдоль линии
 * @param segmentCoords
 * @param width
 * @param height
 * @param vAlign
 * @param hAlign
 * @param distance
 * @returns {[number, number, number]}
 */
GeoUtil.rotateLineText1 = function (segmentCoords, width, height, vAlign, hAlign, distance, offset) {
	hAlign = 'center';
	if(!segmentCoords || segmentCoords.length < 2)
		return;
	//меняем порядок координат, чтобы отсчет был слева направо
	if(segmentCoords[0][0] > segmentCoords[segmentCoords.length - 1][0])
		segmentCoords = segmentCoords.reverse();
	var p1,p2, newSegments = segmentCoords;// новый массив сегментов, чтобы начинать пересчет с середины
	//TODO принято решение пока для подписей линий не двигать по вертикали
	//vAlign = 'middle';
	var fObj //найденный объект
	if(hAlign === 'left')
		fObj = GeoUtil.findLeft(segmentCoords, distance);
	if(hAlign === 'center')
		fObj = GeoUtil.findCenter(segmentCoords, distance);
	if(hAlign === 'right')
		fObj = GeoUtil.findRight(segmentCoords, distance);
	if(fObj[0][0] > fObj[1][0]){
		var temp = fObj[1];
		fObj[1] = fObj[0];
		fObj[0] = temp;
	}
	p1 = fObj[0];
	p2 = fObj[1];
	newSegments = fObj[2];
	var rotation = 0;
	if (p1 !== null && p2 !== null) {
		rotation = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI;
		if(Math.abs(rotation) < 1)
			rotation = 0;
	}
	//переводим в радианы
	rotation = rotation * Math.PI / 180;
	return [p1[0], p1[1], rotation, newSegments];
};
GeoUtil.findCenter = function(lineString, distance){
	var p1 = lineString.getFlatMidpoint();
	return p1;
	var p2 = lineString.getCoordinateAt(0.51);//ищем след точку с небольшим сдвигом, для поиска поворота
	var newSegments = GeoUtil.splitLinestringAtCoordinate(lineString, p1, distance);
	if(distance){
		p1 = newSegments[0];
		p2 = GeoUtil.getCoordsByDistance(newSegments[0], newSegments[1], 30);//10px
	}
	return [p1, p2, newSegments];
}
/*GeoUtil.findCenter = function(coords, distance){
	var lineString = new ol.geom.LineString(coords, ol.geom.GeometryLayout.XY)//линия их координат в пикселях
	var p1 = lineString.getFlatMidpoint();
	var p2 = lineString.getCoordinateAt(0.51);//ищем след точку с небольшим сдвигом, для поиска поворота
	var newSegments = GeoUtil.splitLinestringAtCoordinate(lineString, p1, distance);
	if(distance){
		p1 = newSegments[0];
		p2 = GeoUtil.getCoordsByDistance(newSegments[0], newSegments[1], 30);//10px
	}
	return [p1, p2, newSegments];
}*/
GeoUtil.findLeft = function(coords, distance){
	var lineString = new ol.geom.LineString(coords, ol.geom.GeometryLayout.XY)//линия их координат в пикселях
	var p1 = coords[0];
	var p2 = lineString.getCoordinateAt(0.01);
	var newSegments = GeoUtil.splitLinestringAtCoordinate(lineString, p1, distance);
	if(distance) {
		p1 = newSegments[0];
		p2 = GeoUtil.getCoordsByDistance(newSegments[0], newSegments[1], 30);//10px
	}
	return [p1, p2, newSegments];
}
GeoUtil.findRight = function(coords, distance){
	var lineString = new ol.geom.LineString(coords, ol.geom.GeometryLayout.XY)//линия их координат в пикселях
	var p1 = lineString.getCoordinateAt(0.99);
	var p2 = coords[coords.length - 1]
	var newSegments = GeoUtil.splitLinestringAtCoordinate(lineString, p1, distance);
	if(distance){
		p1 = newSegments[0];
		p2 = GeoUtil.getCoordsByDistance(newSegments[0], newSegments[1], 30);//10px
	}
	return [p1, p2, newSegments];
}

GeoUtil.splitLinestringAtCoordinate = function(lineString, p1, dist){
	var geometry = /** @type {ol.geom.LineString} */lineString;
	var lineLength = lineString.getLength() / 2;
	var coordinates = geometry.getCoordinates();
	var newLineString = [];
	var distance = 0;
	if(dist){
		//если известна дистанция, то ищем точку
		lineLength = dist;
		for (var i = 1; i < coordinates.length; i++) {
			var pnt1 = coordinates[i - 1];
			var pnt2 = coordinates[i];
			distance += Math.sqrt(ol.coordinate.squaredDistance(pnt1, pnt2));
			if (distance >= dist) {
				p1 = GeoUtil.getCoordsByDistance(pnt1, pnt2, dist);
				break;
			}
		}
	}
	//точка старта найдена, теперь режем линию
	newLineString.push(p1);
	distance = 0;
	for (var i = 1; i < coordinates.length; i++) {
		var pnt1 = coordinates[i - 1];
		var pnt2 = coordinates[i];
		distance += Math.sqrt(ol.coordinate.squaredDistance(pnt1, pnt2));
		if (distance >= lineLength) {
			newLineString.push(pnt2);
		}
	}
	if(newLineString.length < 2)
		newLineString.push(coordinates[coordinates.length - 1]);
	return newLineString;
}


/**
 * Функция обрезки текста вдоль линии, если
 * @param textFeature
 * @param lineCoordinates
 * @param x
 * @param y
 * @returns {Object|*}
 */
GeoUtil.cutText = function (textFeature, lineCoordinates, x, y ) {
	var closestSegment1;
	var rotation = textFeature.rotation;
	var textWidth = textFeature.textWidth;
	var textHeight = textFeature.textHeight;
	var text = textFeature.text;
	var isTextObject = textFeature.isTextObject;
	var charWidth = textWidth / text.length;
	var textInp = '';
	var coordsEndPixel = [x + Math.cos(rotation) * textWidth, y + Math.sin(rotation) * textWidth];
	var closestDistance = Number.MAX_VALUE;
	var coordStart = [x, y];
	var coordEnd = coordsEndPixel;
	for (var j = 0; j < 3; j++) {
		if(isTextObject) break;
		coordsEndPixel = [x + Math.cos(rotation) * textWidth, y + Math.sin(rotation) * textWidth];
		closestDistance = Number.MAX_VALUE;
		for (var i = 0; i < lineCoordinates.length - 1; ++i) {
			closestSegment1 = [lineCoordinates[i], lineCoordinates[i + 1]];
			var coordsClosestPixel = ol.coordinate.closestOnSegment(coordsEndPixel, closestSegment1);
			var dist = GeoUtil.Distance(coordsClosestPixel, coordsEndPixel);
			if (dist < closestDistance)
				closestDistance = dist;
		}
		if (closestDistance < LABEL_CUT_TOLERANCE){
			textInp =  (textInp) ? textInp : text;
			coordEnd = coordsEndPixel;
			var bounds = GeoUtil.calcTextBounds(coordStart, coordEnd, rotation, textHeight, textWidth);
			coordEnd = GeoUtil.getCoordEnd([x, y], textWidth, lineCoordinates, coordEnd);
			return {text: textInp, coordStart: coordStart, coordEnd: coordEnd, bounds: bounds};
		}
		if (j === 2)
			return;
		textWidth -= textFeature.textWidth * LABEL_CUT_RATIO;
		var charCount = (textWidth / charWidth).toFixed(0) - 3;// -3 символа для '...'
		if (charCount > 4) //Выводим подпись, только если вмещается 5 символов
			textInp = text.slice(0, charCount) + '...';
	}
	textInp = text;
	var bounds = GeoUtil.calcTextBounds(coordStart, coordEnd, rotation, textHeight, textWidth);
	coordEnd = GeoUtil.getCoordEnd([x, y], textWidth, lineCoordinates, coordEnd);
	return {text: textInp, coordStart: coordStart, coordEnd: coordEnd, bounds: bounds};
};

//ищем начало следующего сдвинутого вектора на расттроянии половины подписи от начала старого вектора
// корректировка алгоритма. при коллизии берем не последнюю координату подписи, а середину
GeoUtil.getCoordEnd = function(startPoint, textWidth, lineCoordinates, baseCoordEnd){
	var lineString = new ol.geom.LineString(null);
	lineString.setCoordinates(lineCoordinates, ol.geom.GeometryLayout.XY);
	var coordEnd = GeoUtil.getPointOnLineByCenterAndRadius(startPoint, lineString, textWidth/2);
	if(coordEnd !== undefined)
		return coordEnd;
	return baseCoordEnd;
}


GeoUtil.calcTextBounds = function(coordStart, coordEnd, rotation, textHeight, textWidth){
	var leftTop, leftBottom, rightTop, rightBottom;
	leftTop = [Math.round(coordStart[0]), Math.round(coordStart[1] - textHeight/2)];
	leftBottom = [Math.round(coordStart[0]), Math.round(coordStart[1] + textHeight/2)];
	rightTop = [Math.round(leftTop[0] + Math.cos(rotation) * textWidth), Math.round(leftTop[1] + Math.sin(rotation) * textWidth)];
	rightBottom = [Math.round(leftBottom[0] + Math.cos(rotation) * textWidth), Math.round(leftBottom[1] + Math.sin(rotation) * textWidth)];

	var polygon = new ol.geom.Polygon(null);
	var linearRing = new ol.geom.LinearRing(null);
	linearRing.setCoordinates([leftTop, leftBottom, rightBottom, rightTop, leftTop ], ol.geom.GeometryLayout.XY);
	polygon.appendLinearRing(linearRing);
	return polygon;
}


/**
 * Функция фильтрации сегментов, что оставляем самый длинный
 * @param lines
 * @param lay
 * @returns {{}}
 */
GeoUtil.filterSegments = function(lines, lay){
	var filteredLines = {};
	for(var t = 0; t < lines.length; t++){
		var lineObj = lines[t];
		var lineId = lineObj.labelObj.id;
		var realId = (lineId.split('|').length > 1) ? lineId.split('|')[1] : lineId;
		var line = lineObj.lineString;
		var text = lineObj.labelObj.label;
		if(!text){
			if(lay && lay.layer && lay.layer.semanticUniqData && lay.layer.semanticUniqData[realId]) {
				text = lay.layer.semanticUniqData[realId].label;
			}
		}
		if(!text)
			continue;
		filteredLines[lineId + App.generateUUID()] = {
			lineString: line,
			lineStringLength: line.getLength(),
			text: text,
		}
	}
	return filteredLines;
}


/**
 * Продвинутая проверка коллизии. Помимо поиска попадания произвольного прямоугольника(с поворотами) возвращаеются свободные и занятые ячейки
 * @param {map.renderer.vector.TextVector} textVector
 * @returns {{result: boolean, collisionCells: *[], freeCells: *[]}}
 */
GeoUtil.hasComplexTextCollision = function(textVector, force){
	var type = 'label';
	var freeCells = [], collisionCells = [];
	var matrix = _visibleTextMatrix[type];
	if(!textVector || !matrix)
		return {hasCollision: true, freeCells: freeCells, collisionCells: collisionCells};
	var bounds = textVector.bounds; //Polygon
	var intersectMatrix = GeoUtil.findMatrixIntersection(bounds, matrix);
	freeCells = intersectMatrix.freeCells;
	collisionCells = intersectMatrix.collisionCells;
	return {hasCollision: collisionCells.length !== 0, freeCells: freeCells, collisionCells: collisionCells};
};

GeoUtil.addComplexText = function(feature, textVector, freeCells){
	//Считаем координату х смещенной на _matrixAddWidth, а координату y смещенной на _matrixAddHeight,
	//поскольку массив всегда начинается с 0, а объекты должны сохраняться со смещением
	var layerId = feature.get('labelType');
	var type = 'label';
	var matrix = _visibleTextMatrix[type];
	var coord = WidgetMap.map.getCoordinateFromPixel([textVector.x, textVector.y]);
	var unique = layerId+'_'+coord[0]+'_'+coord[1];
	var sav = {
		priority: 0,
		obj: feature,
		unique: unique,
	};
	if(freeCells && freeCells.length > 0 ){
		freeCells.forEach(function(el){
			var i = el[0], j = el[1];
			matrix[i][j] = sav;
		});
	}
	return unique;
}

/**
 * поиск смещения по матрице коллизий
 * @param collisionCells
 * @returns {number}
 */
GeoUtil.findOffsetDistanceByCollision = function(collisionCells){
	//если нашли коллизии, то начинаем считать сдвиг
	var nxGr = [], nyGr = [];
	for(var col in collisionCells){
		if(nxGr.indexOf(collisionCells[col][0]) === -1)
			nxGr.push(collisionCells[col][0]);
		if(nyGr.indexOf(collisionCells[col][1]) === -1)
			nyGr.push(collisionCells[col][1]);
	}
	var dist = Math.sqrt((nxGr.length * _dx) * (nxGr.length * _dx) + (nyGr.length * _dy) * (nyGr.length * _dy));//гипотенуза
	return dist;
}

/**
 * Поиск пересечений и свободных ячеек в матрице текстовых подписей
 * @param bounds
 * @param matrix
 */
GeoUtil.findMatrixIntersection = function(bounds, matrix){
	var i, j,
		freeCells = [], collisionCells = [];
	var extent = bounds.getExtent();
	//высчитываем min/max от extent полигона
	var min_x = Math.floor(extent[0]/_dx);
	var min_y = Math.floor(extent[1]/_dy);
	var max_y = Math.floor((extent[1] + ol.extent.getHeight(extent))/_dy);
	var max_x = Math.floor((extent[0] + ol.extent.getWidth(extent))/_dx);

	if (min_x < 0 || min_y < 0 || max_x >= matrix.length || max_y >= matrix[0].length)
		return {freeCells: freeCells, collisionCells: collisionCells};
	try{
		for (j = min_y; j <= max_y; j++){
			for (i = min_x; i <= max_x; i++){
				var cellExtent = [i * _dx, j * _dy, i * _dx + _dx,  j * _dy + _dy];
				//если подпись пересекает ячейку, то проверяем, есть ли в ней уже подпись
				if (bounds.intersectsExtent(cellExtent)){
					//если в ячейке ничего нет
					if (matrix[i] && !matrix[i][j]){
						freeCells.push([i, j]);
					}
					else{
						collisionCells.push([i, j]);
					}
				}
			}
		}
	}
	catch(ex){ }
	return {freeCells: freeCells, collisionCells: collisionCells};
}

GeoUtil.findNearestPoint = function(lineCoordinates, point){
	var closestPoint = point;
	var closestSegment, closestDistance = Number.MAX_VALUE;
	var index = -1;
	for (var k = 0; k < lineCoordinates.length - 1; ++k) {
		closestSegment = [lineCoordinates[k], lineCoordinates[k + 1]];
		var closestFirstProj = ol.coordinate.closestOnSegment(point, closestSegment);
		if (GeoUtil.Distance(closestFirstProj, point) < closestDistance){
			closestDistance = GeoUtil.Distance(closestFirstProj, point);
			closestPoint = closestFirstProj;
			index = k;
		}
	}
	return [closestPoint, index];
}


/**
 * Получение текста средствами canvas.context либо попытка посчитать примерную ширигу текста по размеру символа
 * @param text текст
 * @param textStyle стиль текстовой подписи
 * @param context контекст карты
 */
GeoUtil.getTextWidth = function(text, textStyle, context){
	var textWidth = 89;
	if(context){
		context.font = textStyle.getFont();
		textWidth = context.measureText(text).width;
	}
	else{
		var charWidth = 6;
		textWidth = text.length * charWidth;
	}
	return textWidth;
}

GeoUtil.getDefaultTextWidth = function(text, context){
	var textWidth = 89;
	if(context){
		context.font = 'normal 13px Times New Roman';
		textWidth = context.measureText(text).width;
	}
	else{
		var charWidth = 6;
		textWidth = text.length * charWidth;
	}
	return textWidth;
}

/**
 * Проверка, пересекает ли отрезок окружность
 * @param segment
 * @param center
 * @param radius
 */
GeoUtil.intersectCircleAndSegment = function(segment, center, radius){
	var x1 = segment[0][0],
		y1 = segment[0][1],
		x2 = segment[1][0],
		y2 = segment[1][1],
		xC = center[0],
		yC = center[1];

	var r1 = Math.sqrt(Math.pow(xC-x1, 2) + Math.pow(yC-y1, 2));
	var r2 = Math.sqrt(Math.pow(xC-x2, 2) + Math.pow(yC-y2, 2));
	if((r1 >= radius && r2 < radius) || (r1 < radius && r2 >= radius))
		return true;
	return false;

	x1 -= xC;
	y1 -= yC;
	x2 -= xC;
	y2 -= yC;

	var dx = x2 - x1;
	var dy = y2 - y1;
	//составляем коэффициенты квадратного уравнения на пересечение прямой и окружности.
	//если на отрезке [0..1] есть отрицательные значения, значит отрезок пересекает окружность
	var a = dx * dx + dy * dy;
	var b = 2 * (x1 * dx + y1 * dy);
	var c = x1 * x1 + y1 * y1 - radius * radius;

	//а теперь проверяем, есть ли на отрезке [0..1] решения
	if (-b < 0)
		return (c < 0);
	if (-b < (2 * a))
		return ((4 * a * c - b * b) < 0);

	return (a + b + c < 0);
	/*var b, c, d, v1, v2;
	v1 = {};
	v2 = {};
	v1.x = segment[1][0] - segment[0][0];
	v1.y = segment[1][1] - segment[0][1];
	v2.x = segment[0][0] - center[0];
	v2.y = segment[0][1] - center[1];
	b = (v1.x * v2.x + v1.y * v2.y);
	c = 2 * (v1.x * v1.x + v1.y * v1.y);
	b *= -2;
	d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - radius * radius));
	if(isNaN(d)){ // no intercept
		return false
	}
	return true;*/
	/*var x = x1 * (1 - t) + x2 * t;
	var y = y1 * (1 - t) + y2 * t
	var s = (x1 * (1 - t) + x2 * t)^2 + (y1 * (1 - t) + y2 * t) ^2 = R^2;*/
}


/**
 * Получение точки пересечения между линией и окружностью
 * @param lineString
 * @param center
 * @param radius
 * @returns {*}
 */
GeoUtil.getIntersectionBetweenCircleAndLine = function(lineString, center, radius){
	var intersect = function(center, k, b, radius){
		//находим дискрименант квадратного уравнения
		var x = center[0], y = center[1];
		var d = (Math.pow((2 * k * b - 2 * x - 2 * y * k), 2) - (4 + 4 * k * k) * (b * b - radius * radius + x * x + y * y - 2 * y * b));
		//если он меньше 0, уравнение не имеет решения
		if(d < 0)
			return;
		//иначе находим корни квадратного уравнения
		var x1 = ((-(2 * k * b - 2 * x - 2 * y * k) - Math.sqrt(d)) / (2 + 2 * k * k));
		var x2 = ((-(2 * k * b - 2 * x - 2 * y * k) + Math.sqrt(d)) / (2 + 2 * k * k));
		var y1 = k * x1 + b;
		var y2 = k * x2 + b;
		//если абсциссы точек совпадают, то пересечение только в одной точке
		if (x1 === x2)
			return [[x1, y1]];
		return [ [x1, y1], [x2, y2]];
	}
	if(lineString){
		var coords = lineString.getCoordinates();
		for(var i = 1; i < coords.length; i++){
			var p1 = coords[i - 1];
			var p2 = coords[i];
			var x1 = p1[0], x2 = p2[0],
				y1 = p1[1], y2 = p2[1],
				k, b;
			(x1 === x2) ? k = (y1 - y2) / (x1) : k = (y1 - y2) / (x1 - x2);
			b = y1 - k * x1;
			var intersection = intersect(center, k, b, radius);
			if(intersection && intersection.length > 0){
				return intersection;
			}
		}
	}
}
var Intersection = {};
//https://github.com/mapbox/lineclip#lineclippolylinepoints-bbox-result
// Cohen-Sutherland line clippign algorithm, adapted to efficiently
// handle polylines rather than just segments
Intersection.lineclip = function(points, bbox, result) {
	var len = points.length,
		codeA = Intersection.bitCode(points[0], bbox),
		part = [],
		i, a, b, codeB, lastCode;

	if (!result) result = [];

	for (i = 1; i < len; i++) {
		a = [points[i - 1][0],points[i - 1][1]];
		b = [points[i][0], points[i][1]];
		codeB = lastCode = Intersection.bitCode(b, bbox);

		while (true) {

			if (!(codeA | codeB)) { // accept
				part.push(a);

				if (codeB !== lastCode) { // segment went outside
					part.push(b);

					if (i < len - 1) { // start a new line
						result.push(part);
						part = [];
					}
				} else if (i === len - 1) {
					part.push(b);
				}
				break;

			} else if (codeA & codeB) { // trivial reject
				break;

			} else if (codeA) { // a outside, intersect with clip edge
				a = Intersection.intersect(a, b, codeA, bbox);
				codeA = Intersection.bitCode(a, bbox);

			} else { // b outside
				b = Intersection.intersect(a, b, codeB, bbox);
				codeB = Intersection.bitCode(b, bbox);
			}
		}

		codeA = lastCode;
	}

	if (part.length) result.push(part);

	return result;
}

// Sutherland-Hodgeman polygon clipping algorithm

/*function polygonclip(points, bbox) {

	var result, edge, prev, prevInside, i, p, inside;

	// clip against each side of the clip rectangle
	for (edge = 1; edge <= 8; edge *= 2) {
		result = [];
		prev = points[points.length - 1];
		prevInside = !(bitCode(prev, bbox) & edge);

		for (i = 0; i < points.length; i++) {
			p = points[i];
			inside = !(bitCode(p, bbox) & edge);

			// if segment goes through the clip window, add an intersection
			if (inside !== prevInside) result.push(intersect(prev, p, edge, bbox));

			if (inside) result.push(p); // add a point if it's inside

			prev = p;
			prevInside = inside;
		}

		points = result;

		if (!points.length) break;
	}

	return result;
}*/

// intersect a segment against one of the 4 lines that make up the bbox

Intersection.intersect = function(a, b, edge, bbox) {
	return edge & 8 ? [a[0] + (b[0] - a[0]) * (bbox[3] - a[1]) / (b[1] - a[1]), bbox[3]] : // top
		edge & 4 ? [a[0] + (b[0] - a[0]) * (bbox[1] - a[1]) / (b[1] - a[1]), bbox[1]] : // bottom
			edge & 2 ? [bbox[2], a[1] + (b[1] - a[1]) * (bbox[2] - a[0]) / (b[0] - a[0])] : // right
				edge & 1 ? [bbox[0], a[1] + (b[1] - a[1]) * (bbox[0] - a[0]) / (b[0] - a[0])] : null; // left
}

// bit code reflects the point position relative to the bbox:
//         left  mid  right
//    top  1001  1000  1010
//    mid  0001  0000  0010
// bottom  0101  0100  0110

Intersection.bitCode = function(p, bbox) {
	var code = 0;

	if (p[0] < bbox[0]) code |= 1; // left
	else if (p[0] > bbox[2]) code |= 2; // right

	if (p[1] < bbox[1]) code |= 4; // bottom
	else if (p[1] > bbox[3]) code |= 8; // top

	return code;
}



GeoUtil.getFontSizeByZoom = function(textWidth){
	var zoom = WidgetMap.map.getView().getZoom();
	//var coeff = 13/11;
	//var coeff = 1.75;
	var coeff = 2;

	/*var f = WidgetMap.DEFALT_FONT_SIZE;
	if(zoom > WidgetMap.DEFALT_ZOOM_FOR_FONT){
		f = Math.abs((WidgetMap.DEFALT_ZOOM_FOR_FONT - zoom) * coeff);
	}
	if(zoom < WidgetMap.DEFALT_ZOOM_FOR_FONT){
		f = Math.abs((WidgetMap.DEFALT_ZOOM_FOR_FONT - zoom) / coeff);
	}
	return f;*/
	var fontObj = {
		21: WidgetMap.DEFALT_FONT_SIZE * (Math.pow(coeff, Math.abs(WidgetMap.DEFALT_ZOOM_FOR_FONT - zoom))),//coeff * coeff * coeff,
		20: WidgetMap.DEFALT_FONT_SIZE * coeff * coeff,
		19: WidgetMap.DEFALT_FONT_SIZE * coeff,
		18: WidgetMap.DEFALT_FONT_SIZE,
		17: WidgetMap.DEFALT_FONT_SIZE / coeff,
		16: WidgetMap.DEFALT_FONT_SIZE / coeff / coeff ,
		15: WidgetMap.DEFALT_FONT_SIZE / coeff / coeff / coeff,
	}
	/*var fontObj = {
		21: 28,
		20: 22,
		19: 16.9,
		18: 13,
		17: 10,
		16: 7,
		15: 6,
		14: 4,
		13: 3,
	}*/
	return fontObj[zoom] || 1;
}
GeoUtil.getOffsetByZoom = function(){
	var zoom = WidgetMap.map.getView().getZoom();
	var offset = 10;
	return 0;
	switch (zoom){
		case 18:
			offset = 10;
			break;
		case 17:
			offset = 5;
			break;
		case 16:
			offset = 2;
			break;
		case 15:
			offset = 0;
			break;
		case 13:
			offset = 5;
			break;
		default:
			offset = 5;
			break;
	}
	return offset;
}
/*Глобальный объект с константами всех сервисов (просто адреса к ним)*/
Services = {};
/*Сервис выполняет запросы к БД или XML-файлам на сервере*/
Services.processQueryNew = './DataService.asmx/ProcessQueryNew';
/*Сервис запрашивает картинку карты по введенным координатам рамки (запрос к растеризатору)*/
Services.mapDrawService = './MapService.asmx/DrawTile';
/*Сервис запрашивает информацию об объектах растровой карты в указанной точке (запрос к растеризатору)*/
Services.mapInfoService = './MapService.asmx/GetObjectsInfo';
Services.mapWmsService = './MapService.asmx/DrawImageWMS';
/*Сервис */
Services.RunUTETaskService = './ServerTaskService.asmx/RunUTETask';

Services.ImportCP = './UTEService.asmx/ImportPI_CP';

Services.processQueryNode = './api/process-query';
Services.processQueryNodeGeo = './api/process-geoquery';
Services.processQueryNodeXml = './api/process-xml';

Services.exportExcelNode = './api/run-ute-task';

/*сервисы 2-й очереди фриланса*/
Services.sendMailNode = './api/send-mail';
/*********сервисы, работающие с геометриями***********/
//Сервис получает буферную зону (строка WKT) для переданной геометрии объекта (тоже строка WKT)
Services.bufferZoneNode =  './api/geo/buffer-zone';
/*********** ********************************************/

/*********сервисы, работающие с файловой системой***********/

Services.getFileNamesFromDirNode    = './api/files/names'; //получение списка файлов и папок в текущей директории
Services.uploadNode                 = './api/files/upload'; //загрузка файлов на сервер
Services.createImageNode            = './api/files/create-image'; //создание изображения
Services.deleteFileNode             = './api/files/delete'; //удаление файла
/*********** ********************************************/

/*Сервис для записи в лог на сервере*/
Services.logNode = './api/log';

/*Сервисы предпросмотра документов*/
Services.docPreview             = './api/doc/preview';
Services.pdfPreview             = './api/pdf/preview';
Services.pdfOriginal            = './api/pdf/original';
Services.pdfConvert             = './api/pdf/convert';
Services.pdfFullScreen         = './api/pdf-preview';// TODO Заменить как будет готов сервис
/* --------------- Конец --------------- сервисы 2-й очереди фриланса*/

/*Сервисы экспорта данных из внешних источников*/
Services.exportGdalNode         = './api/gdal/export';
Services.importGdalNode         = './api/gdal/import';
Services.parseGdalNode          = './api/gdal/parse';

/*Сервисы авторизации*/
Services.loginNode              = './api/auth/login';
Services.logoutNode             = './api/auth/logout';
Services.changePassNode         = './api/auth/change-pass';
Services.userTasksNode          = './api/auth/user-tasks';
Services.userTaskNode          = './api/auth/user-task';
Services.hasTaskNode          = './api/auth/has-task';

/* сервис проверки работоспособности nodejs*/
Services.isNodeReady            = './api/status/is-ready';

/*Сервисы ute*/
Services.uteLrsRouteCalc        = './ute/lrs-route-calc';
Services.uteKmRouteCalc         = './ute/km-route-calc';
Services.uteIliInspCalc         = './ute/ili-insp-calc';
Services.uteIliInspLink         = './ute/ili-insp-link';
Services.uteIliImportXml        = './ute/ili-import-xml';
Services.uteIliCluster          = './ute/ili-cluster';
Services.uteStoEhzInspProc      = './ute/sto-ehz-insp-proc';
Services.uteStoIliInspProc      = './ute/sto-ili-insp-proc';
Services.uteIliPressure         = './ute/ili-pressure';
Services.uteGroupRouteIdx       = './ute/group-route-idx';
Services.uteOfflineRouteIdx     = './ute/offline-line-idx';
Services.uteLineRouteIdx        = './ute/line-route-idx';
Services.uteIntervalDivining    = './ute/interval-divining';

/* Сервисы для дашбордов*/
Services.getDashboards          = './api/dashboards/list';
Services.saveDashboard          = './api/dashboards/dashboard';
Services.dashboard              = './api/dashboards/dashboard';

/*Сервисы работы с задачами*/
Services.task              = './api/task';

Services.updateMonoServices = function(){
	if(App && App.config && App.config.APP_60_SERVER){
		Services.processQueryNew = Services.processQueryNew.replace('./', App.config.APP_60_SERVER);
		Services.mapDrawService = Services.mapDrawService.replace('./', App.config.APP_60_SERVER);
		Services.mapInfoService = Services.mapInfoService.replace('./', App.config.APP_60_SERVER);
		Services.mapWmsService = Services.mapWmsService.replace('./', App.config.APP_60_SERVER);
		Services.RunUTETaskService = Services.RunUTETaskService.replace('./', App.config.APP_60_SERVER);
		Services.ImportCP = Services.ImportCP.replace('./', App.config.APP_60_SERVER);
	}
}
/*
 * Общие глобальные функции
 */
/*
 * Расширение стадартноего объекто String. Экранирование XML символов.
 */
if(!String.prototype.xmlEscape) {
    String.prototype.xmlEscape = function () {
        return this
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    };
};

/* 
 * Эмуляция наследования для старых браузеров 
 */
//if(typeof Object.create !== 'function') {
Object.create = function (o) {
    function F() {}
    F.prototype = o;
    return new F();
};
//}


// Настройки datepicker
$.datepicker.setDefaults($.datepicker.regional['ru']);
$.datepicker.setDefaults({
    dateFormat: 'dd-mm-yy',
    changeYear: true,
    yearRange: '-100:+100'
});


$.cookie.raw = true;

App = {};
//уникальный идентификатор окна. Будет использоваться в синхронизации
App.UNIQUE_ID = undefined;
//счетчик открытия ПКА для дальнейшей выдачи сообщения, что могут быть артефакты из-за некорректной работы ie - не чистит память нормально
App.GLOBAL_CAS_OPEN_LIMIT = 5;
App.GLOBAL_MAP_OPEN_LIMIT = 5;
//Строка для проверки на пустой файл
App.EMPTY_FILE_RESPONSE = '<string><root fileName=';
App.EMPTY_FILE_TEMPLATE = '<string><root/></string>';

App.name = gis_app_55_1;
App.version = gis_app_55_2;

App.SERVER_ERRORS = {
    'OK':gis_app_55_25, //случай, если запросили тип xml, а пришло не то
    'Internal Server Error':gis_app_55_26,
    'error':gis_app_55_27,
    'abort':gis_app_55_28,
    'Not Found':gis_app_55_30,
    'Service Unavailable':gis_app_55_30,//случай, если не работает сервер nodejs
    'Proxy Error':gis_app_55_30,//случай, если не работает сервер nodejs
    '404':gis_app_55_31 // файл не найден
};

/**
 * Возврачает читаемый текст ошибки от сервера
 * @param textStatus
 * @param errorThrown
 * @returns {string|*}
 */
App.prettyCodeError = function(textStatus, errorThrown){
    if(textStatus === '' || errorThrown === '')
        textStatus = gis_app_55_26 + '. ' + gis_app_55_23 + '. textStatus='+textStatus ;
    var result = textStatus;
    try{
        if(App.SERVER_ERRORS[errorThrown] !== undefined)
            result = App.SERVER_ERRORS[errorThrown];
        else if(App.SERVER_ERRORS[textStatus] !== undefined)
            result = App.SERVER_ERRORS[textStatus];
        else if(errorThrown.indexOf('Service Unavailable'))
            result = App.SERVER_ERRORS['Service Unavailable'] + '. textStatus='+textStatus;
        else if(errorThrown.indexOf('Internal Server Error'))
            result = App.SERVER_ERRORS['Internal Server Error'] + '. textStatus='+textStatus;
        return result;
    }
    catch(ex){}

    return textStatus;
};


/**
 * Возврачает читаемый текст ошибки от сервера, если он вернулся в успешном результате
 * @param textStatus
 * @param errorThrown
 * @returns {string|*}
 */
App.prettyCodeSuccessError = function(text){
    var result = text;
    try{
        if(text && text !== ''){
            if(text.indexOf(App.SERVER_ERRORS['Internal Server Error']) !== -1)
                result = App.SERVER_ERRORS['Internal Server Error'] + '. ' + text;
            if(text.indexOf(App.SERVER_ERRORS['Service Unavailable']) !== -1)
                result = App.SERVER_ERRORS['Service Unavailable'] + '. ' + text;
        }
        return result;
    }
    catch(ex){}

    return result;
};

/**
 * Возвращает читаемы текст ошибки без спец символов в окно с ошибкой
 * @param str
 * @returns {*}
 */
App.formatErrorString = function(str){
    try{
        if (str.indexOf('&amp;') != -1) {
            str = str.replace(/&amp;/g, '&');
        }
        if (str.indexOf('&lt;') != -1) {
            str = str.replace(/&lt;/g, '<');
        }
        if (str.indexOf('&gt;') != -1) {
            str = str.replace(/&gt;/g, '>');
        }
        if (str.indexOf('&quot;') != -1) {
            str = str.replace(/&quot;/g, '"');
        }
        if (str.indexOf('&#39;') != -1) {
            str = str.replace(/&#39;/g, '\'');
        }
        if (str.indexOf('&#xA;') != -1) {
            str = str.replace(/&#xA;/g, '\\n');
        }
        if (str.indexOf('\\"') != -1) {
            str = str.replace(/\\"/g, '"');
        }
    }
    catch(e){}
    return str;
};

/**
 * НОРМАЛЬНАЯ обертка для отправки запросов на сервер.
 * При успехе вызывается функция callbackResult с содержимым из тега <string></string>
 * При ошибке вызывается функция callbackFail с текстом критической ошибки.
 * Функция возвращает ссылку на запрос для возможности отмены запроса через .abort()
 */

App.serverQueryXML = function (url, params, callbackResult, callbackFail, returnReq) {
    var req = $.ajax({
        type: "POST",
        url: url,
        data: params,
        timeout: App.clientRequestTimeout,
        dataType: 'xml'
    });

    var xmlData = "";

    req.done(function (resp) {
        xmlData = $(resp).find('string').text();
        //Вызываем переданную функцию для обработки результата
        callbackResult(xmlData);
    });

    req.fail(function (jqXHR, textStatus, errorThrown) {
        textStatus = App.prettyCodeError(textStatus, errorThrown);
        xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
        //Отдельно обрабатываем если таймаут
        if (jqXHR.statusText === "timeout") {
            xmlData = gis_app_55_13;
        }
        //Вызываем переданную функцию для обработки результата
        callbackFail(xmlData);
    });

    return req;
};

App.serverQueryXMLWithTries = function (url, params, callbackResult, callbackFail, triesCount) {
    if (!triesCount)
        triesCount = 4;
    function sendRequest(triesCount) {
        var req = $.ajax({
            type: "POST",
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: 'xml'
        });
        var xmlData = "";
        req.done(function (resp) {
            xmlData = $(resp).find('string').text();
            //Вызываем переданную функцию для обработки результата
            callbackResult(xmlData);
        });

        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            //Отдельно обрабатываем если таймаут
            if (jqXHR.statusText === "timeout") {
                xmlData = gis_app_55_13;
            }else if(triesCount > 0){
                --triesCount;
                setTimeout(function(){
                    sendRequest(triesCount);
                }, 2000)
                return;
            }
            //Вызываем переданную функцию для обработки результата
            callbackFail(xmlData);
        });
        return req;
    }
    return sendRequest(triesCount);
};

App.serverQueryXMLGrid = function (url, params, callbackResult, callbackFail, returnReq) {
    var internalServerErrorCounter = 5;
    function sendRequest(internalServerErrorCounter){
        var req = $.ajax({
            type: "POST",
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: 'xml'
        });

        var xmlData = "";

        req.done(function (resp) {
            xmlData = $(resp).find('string').text();
            //Вызываем переданную функцию для обработки результата
            callbackResult(xmlData);
        });

        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            //Отдельно обрабатываем если таймаут
            if (jqXHR.statusText === "timeout") {
                xmlData = gis_app_55_13;
            }
            //если запрос вызвал Internal Server Error апачем, то
            else if(jqXHR.state() === "rejected" && internalServerErrorCounter>0){
                --internalServerErrorCounter;
                sendRequest(internalServerErrorCounter);
                return;
            }
            //Вызываем переданную функцию для обработки результата
            callbackFail(xmlData);
        });
        return req;
    }
    return sendRequest(internalServerErrorCounter);
};

App.serverQueryXMLGridNew = function (url, params, callbackResult, callbackFail, returnReq, processId) {
    var internalServerErrorCounter = 5;
    function sendRequest(internalServerErrorCounter){
        var req = $.ajax({
            type: "POST",
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: 'xml'
        });

        var xmlData = "";

        req.done(function (resp) {
            xmlData = $(resp).find('string').text();
            //Вызываем переданную функцию для обработки результата
            callbackResult(xmlData, processId);
        });

        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            //Отдельно обрабатываем если таймаут
            if (jqXHR.statusText === "timeout") {
                xmlData = gis_app_55_13;
            }
            //если запрос вызвал Internal Server Error апачем, то
            else if(jqXHR.state() === "rejected" && internalServerErrorCounter>0){
                --internalServerErrorCounter;
                sendRequest(internalServerErrorCounter);
                return;
            }
            //Вызываем переданную функцию для обработки результата
            callbackFail(xmlData, processId);
        });
        return req;
    }
    return sendRequest(internalServerErrorCounter);
};




/**
 * Запрос для получения информации по кадастровому слою
 * @param url
 * @param callbackResult
 * @param callbackFail
 * @returns {*}
 */
App.serverCadastreQueryXML = function (url, callbackResult, callbackFail) {
    $.support.cors = true;
    // Create the XHR object.
    function createCORSRequest(method, url) {
        var xhr = new XMLHttpRequest();
        if ("withCredentials" in xhr) {
            // XHR for Chrome/Firefox/Opera/Safari.
            xhr.open(method, url, true);
        } else if (typeof XDomainRequest != "undefined") {
            // XDomainRequest for IE.
            xhr = new XDomainRequest();
            xhr.open(method, url);
        } else {
            // CORS not supported.
            xhr = null;
        }
        return xhr;
    }

    // Make the actual CORS request.
    function makeCorsRequest(url) {
        // All HTML5 Rocks properties support CORS.
        var xhr = createCORSRequest('GET', url);
        xhr.timeout = 5000;//30 секунд = 30000 (в миллисекундах)
        if (!xhr) {
            callbackFail('CORS not supported');
            return;
        }
        var res = false;

        // Response handlers.
        xhr.onload = function() {
            res = true;
            var text = xhr.responseText;
            try{
                var doc = $($.parseXML(text));
                var xmlData = $(doc).children('FeatureInfoResponse');
                //Вызываем переданную функцию для обработки результата
                callbackResult(xmlData);
            }
            catch(ex){
                callbackFail(text);
            }
        };
        xhr.ontimeout  = function() {
            res = true;
            callbackFail(gis_app_55_18);
        };
        xhr.onerror = function(xhr, textStatus, errorThrown) {
            res = true;
            callbackFail(gis_app_55_17);
        };
        xhr.onabort = function() {
            res = true;
            callbackFail(gis_app_55_16);
        };
        /*xhr.onreadystatechange = function() {
            if (this.readyState != 4) return;
            // по окончании запроса доступны:
            // status, statusText
            // responseText, responseXML (при content-type: text/xml)
            if (this.status != 200) {
                // обработать ошибку
                alert( 'ошибка: ' + (this.status ? this.statusText : 'запрос не удался') );
                return;
            }
            // получить результат из this.responseText или this.responseXML
        };*/
        function abortRequest(){
            xhr.abort();
            if( !res )
                callbackFail(gis_app_55_19);
        }

        setTimeout(abortRequest,5000);
        xhr.send();
    }
    makeCorsRequest(url);
    return;

};

/**
 * Отчет об ошибке
 * @param text - основной текст ошибки
 * @param detail - детализация
 * @param closeCallback - колбек на закрытие
 * @param params - дополнительные параметры, которые уйдут в письме
 */
App.errorReport = function(text, detail, closeCallback, params) {
    var errDetail = detail;
    detail = App.formatErrorString(detail);
    var genId = App.generateUUID();
    var id = 'errorReportDialog_'+genId;
    var smallDivErrText = 'smallDivErrText_'+genId;
    var dlg = undefined;
    var dId = getParameterByName('dialogId');
    if(dId){
        parent.App.resizeIframeMap(dId);
    }
   /* if(parent){
        parent.$('body').append('<div id="'+id+'" class="error-report-dialog" title="'+gis_app_55_5+'"></div>');
        dlg = parent.$('#'+id);
    }
    else{*/
        $('body').append('<div id="'+id+'" class="error-report-dialog" title="'+gis_app_55_5+'"></div>');
        dlg = $('#'+id);
    /*}*/

    var buttons = [];
    if(detail) {
        buttons.push({text:gis_app_55_6, click:moreHandler, 'class':'errorReportDialogMore', tabindex:-1});
    }
    buttons.push({text:gis_app_55_8, click:send, tabindex:-1, 'class':'errorReportDialogMail'});
    buttons.push({text:gis_app_55_9, click:close, tabindex:1,'class':'errorReportDialogOk'});

    var smallErr = '<div><table cellpadding="0" cellspacing="0" class="error-dialog-table">'+
        '<tbody><tr>'+
        '<td class="error-dialog-img">'+
        '<img src="/ui/images/err.png" width="50" height="50">'+
        '</td><td><div id="'+smallDivErrText+'" class="text"></div></td></tr></tbody></table>' +
        '</div>' +
        '<div class="detail" contenteditable="true" style="width:100%;height: 100%;"></div>';

    dlg.append(smallErr);
    $('#'+smallDivErrText).text(text);
    if(detail) {
        var address = (App.config && App.config.SUPPORT_ADDRESS !== undefined)?App.config.SUPPORT_ADDRESS:'';
        var paramStr = '';
        if(params !== undefined) {
            if(params.filename != undefined)
                paramStr += gis_senderrorreportdialog_16 + params.filename+"\n";
            if(params.functionname != undefined)
                paramStr += gis_senderrorreportdialog_17 + params.functionname+"\n";
            if(params.rawresponse != undefined)
                paramStr += 'rawresponse:' + params.rawresponse+"\n";
        }
        $('.detail', dlg).text(paramStr+gis_app_55_22+detail+'\n\n'+address);
    }
    dlg.dialog({
        resizable: false,
        modal:     true,
        dialogClass: 'ui-error-dialog gsi-zindex__global',
        width:     705,
        height:    135,
        close:     close,
        buttons:   buttons
    });

    function send() {
        var text   = $('.text',   dlg).text();
        var detail = errDetail;//$('.detail', dlg).text();

        var dialog = Object.create(SendErrorReportDialog);
        dialog.setData(
            gis_app_55_10+
            text+"\n\n"+
            gis_app_55_11+
            detail+"\n\n"
            , params, id, closeCallback);

        dialog.build();
    }

    function close() {
        if(closeCallback != undefined)
            closeCallback();
        dlg.dialog("close");
    }

    function moreHandler() {
        var detail = $('.detail', dlg);
        var text = $('.ui-dialog-buttonset .ui-button.errorReportDialogMore span.ui-button-text');
        if(detail.is(':visible')) {
            dlg.dialog({resizable:false, width:705, height: 135});
            text.text(gis_app_55_6);
            $('.error-dialog-table').show();
            detail.hide();
        }
        else {
            dlg.css({width: 705, height: 358});
            dlg.dialog({resizable:true});
            text.text(gis_app_55_7);
            $('.error-dialog-table').hide();
            detail.show();
        }
    }
};

/**
 * Диалог
 */
App.confirmDialog = function(text, buttons, params) {

    var dlg = undefined;
    /*if(parent){
        parent.$('body').append('<div class="confirmDialog"></div>');
        dlg = parent.$('.confirmDialog');
    }
    else{
        $('body').append('<div class="confirmDialog"></div>');
        dlg = $('.confirmDialog');
    }*/
    var dlg = $('<div class="confirmDialog"></div>');
    dlg.appendTo('body');
    if(params && params.html){
        dlg.html(text);
    }
    else{
        dlg.text(text);
    }
    var bts = buttons || {"   OK   ": function() { App.destroyDialog(null, dlg) }};
    var dialogClass = (params && params.dialogClass)? params.dialogClass: 'gsi-zindex__global';
    var defaultParams = {
        resizable: true,
        modal:     true,
        buttons:   bts,
        width:     400,
        minWidth:  150,
        maxWidth:  4000,
        minHeight: 10,
        dialogClass: dialogClass
    };
    dlg.dialog($.extend(defaultParams, params));
    return dlg;
};

App.infoDialog = function(text, id) {
    var defaultParams = {
        resizable: false,
        modal:     true,
        buttons:   null,
        width:     200,
        height:  55,
        dialogClass: 'ui-dialog-confirm noCloseButton'
    };
    id = id || App.generateUUID();
    var dlg = $('<div class="infoDialog" id="'+id+'"></div>');
    dlg.appendTo('body');
    dlg.text(text);
    dlg.dialog(defaultParams);
    return dlg;
};

App.showConfirmForm = function(opt_options) {
    var options = opt_options ? opt_options : {};
    var title = options.title || gis_core_1;
    var descr = options.descr || gis_core_17;
    var successCallback = options.successCallback;
    var bts = {
        "Да": function() {
            if(successCallback) successCallback();
            $( this ).dialog("close");
        },
        "Нет": function() {
            $( this ).dialog("close");
    }
    };

    var defaultParams = {
        resizable: false,
        modal:     true,
        buttons:   bts,
        width:     400,
        minWidth:  150,
        maxWidth:  400,
        minHeight: 10,
        title: title,
        dialogClass: 'ui-dialog-confirm'
    };

    var dlg = $('<div class="confirmDialog"></div>');
    dlg.appendTo('body');
    dlg.html(descr);
    dlg.dialog(defaultParams);
    return dlg;
};

/**
 * Диалог
 */
App.notSupportedDialog = function(text, buttons, params) {
    var bts = buttons || {"   OK   ": function() { $( this ).dialog("close"); }};

    var defaultParams = {
        resizable: true,
        modal:     true,
        buttons:   bts,
        width:     400,
        minWidth:  150,
        maxWidth:  4000,
        minHeight: 10
    };


    var dlg = $('<div class="confirmDialog"></div>');
    dlg.appendTo('body');
    dlg
        .text((text) ? text : gis_core_error_0)
        .dialog($.extend(defaultParams, params));

    return dlg;
};

/**
 * Открывает задачу. Структура Task может формироваться объектом UserSettings
 */
App.openTask = function(task, authStr, params) {
    // Хардкодные компоненты
    var dialog;
    var paramsStr = '';
    if(params){
        for(var p in params)
            paramsStr+='&'+p+'='+params[p];
    }
    if(task.name && (task.name === 'USER_OFFICE_DIALOG' || task.name === 'USER_OFFICE')) {
        dialog = Object.create(UserOfficeDialog);
        dialog.init();
        dialog.build();
    }
    else if(task.name && (task.name === 'TASK_OFFICE_DIALOG' || task.name === 'TASK_OFFICE')) {
        dialog = new TaskOfficeForm();
        dialog.build();
    }
    else if(task.name && task.name == 'USER_CHANGE') {
        dialog = new UserChangeDialog();
        dialog.setTargetUrl('main.html');
        dialog.build();
    }
        // Статическая HTML страничка в новом окне браузера
    // В mdl задан URL статического HTML файла
    else if(task.mdl && /\.html$/.test(task.mdl)) {
        //Условие для добавления к тестовому гриду параметров task и mdl, необходимых для корректной работы открытого окна
        //window.open(task.mdl, 'STATIC__'+task.name, 'height=600,width=800,menubar=no,location=no,directories=no,status=no,resizable=yes,scrollbars=yes');
        var url = task.mdl+
            "?task="+escape(task.name)+
            "&mdl="+escape(task.mdl) +
            "&rand="+Math.random()*1000000+escape(paramsStr);
        var currAuth  = '';
        if(task.auth == 'true'){
            if(authStr)
                currAuth = authStr;
            else
                currAuth = Auth.getAuthStr();
            url += '#'+currAuth;
        }
        if(task.newWindow == 'true')
            window.open(task.mdl+currAuth, 'EXTRA__'+task.name, 'height=600,width=800,menubar=no,location=no,directories=no,status=no,resizable=yes,scrollbars=yes');
        else
            window.location.href = url;
    }
        // Дополнительное окно с модулем в новом окне браузера
    // В mdl задан URL страницы mail.html с дополнительными параметрами
    else if(task.mdl && /\.html?$/.test(task.mdl)) {
        //window.open(task.mdl, 'EXTRA__'+task.name, 'height=600,width=800,menubar=no,location=no,directories=no,status=no,resizable=yes,scrollbars=yes');
        window.location.href = task.mdl;
    }
        // Переход на другую задачу в том же самом окне браузера
    // Иначе открываем задачу в том же самом окне
    else if(task.name && task.mdl) {
        //если флеш вариант, то выходим из main_js.html и переводим для обработки в main.html
        var url =
            "main.html"+
            "?task="+escape(task.name)+
            "&mdl="+escape(task.mdl) +
            "&rand="+Math.random()*1000000;
        if(task.mdl.indexOf('http://') !== -1 || task.mdl.indexOf('https://') !== -1) {
            url = task.mdl;
            var target = (task.newWindow !== 'true')?'_self':'_blank';
            window.open(url, target);
            return;
        }

        if(authStr) {
            url += '#'+authStr;
        }
        else {
            url += '#'+Auth.getAuthStr();
        }

        window.location.href = url;
    }
    else {
        //В остальных случаях генерируем ошибку, чтобы знать, почему не удалось запустить задачу
        App.errorReport(gis_app_55_14,gis_app_55_15+' name='+task.name+', mdl='+task.mdl,undefined,{filename:gis_filename_9, functionname:'App.openTask'});
    }
};


/*
 * Аналог config-a - объект, в котором хранятся все глобальные переменные
 * Получаем и парсим web.config так: var config = App.getClientConfig();
 * Используем так: var someParameter = App.config.hasOwnProperty(someProperty);
 * */
App.config = null;
/* Сразу по получению web.config'a нужно установить requestTimeout, чтобы все запросы уходили с этим таймаутом (значение таймаута в минутах) */
App.clientRequestTimeout = 0;
//путь к криватной директории из web.config
App.privatePath = "";
//Проекция геоданных из БД
App.projection = 'EPSG:4284';
//путь к предыдущей версии сайта
App.prevSite = '';//'/old55/main_js.html?task=MULT_MAIN&mdl=main_js.html';
App.newSite = '';
//флаг использования сервисов nodejs напрямую минуя апач
App.useDirectlyNodeService = false;
//Считывание конфига из web.config
App.getClientConfig = function(resultCallback){
    if (App.config===null) {
        function onGetClientConfigResult(resultXml) {
            App.config = {};
            try { // Иногда ответ в формате XML, а иногда в виде просто строки
                var doc = $($.parseXML(resultXml));
                //var nodes = doc.children('configuration').children('appSettings').children('add');
                var nodes = doc.find('add');
                // Цикл по текущему уровню
                nodes.each(function(){
                    var node = $(this);
                    //Обязательно поднимаем регистр ключа
                    App.config[node.attr('key').toUpperCase()] = node.attr('value');
                });
                //Сразу устанавливаем значение App.clientRequestTimeout из App.config['REQUEST_TIMEOUT']
                if (App.config.hasOwnProperty('REQUEST_TIMEOUT')) {
                    var timeout = parseFloat(App.config['REQUEST_TIMEOUT']);
                    if (timeout && timeout != undefined && !isNaN(timeout)) {
                        App.clientRequestTimeout = Math.round(timeout*60*1000);
                    }
                }
                if (App.config.hasOwnProperty('USE_DIRECTLY_NODEJS')) {
                    App.useDirectlyNodeService = App.config['USE_DIRECTLY_NODEJS'] === 'true';
                }

                //Сразу устанавливаем значение приватной директории App.PrivatePath из App.config['PRIVATE_PATH']
                if (App.config.hasOwnProperty('PRIVATE_PATH'))
                    App.privatePath = App.config['PRIVATE_PATH'];

                //Сразу устанавливаем значение приватной директории App.PrivatePath из App.config['PRIVATE_PATH']
                if (App.config.hasOwnProperty('PROJECTION'))
                    App.projection = App.config['PROJECTION'];
                if(App.config.hasOwnProperty('APP_60_SERVER')){
                    Services.updateMonoServices();
                }
            }
            catch(e) { // Распарсить XML не удалось, видимо это просто строка
                //Конфиг запрашиваем 1 раз для приложения, поэтому при любых ошибках сохраняем конфиг как пустой объект
            }
            finally {
                if(resultCallback)
                    resultCallback();
            }
        }

        function onGetClientConfigFail(resultXml) {
            App.config = {};
            if (resultXml.indexOf(gis_app_55_30) !== -1){
                App.errorReport(gis_app_55_33, resultXml.toString(),undefined,{filename:gis_filename_9, functionname:'App.getClientConfig_onGetClientConfigFail'});
                return;
            }
            App.errorReport(gis_app_55_20, resultXml.toString(),undefined,{filename:gis_filename_9, functionname:'App.getClientConfig_onGetClientConfigFail'});
            if(resultCallback)
                resultCallback();
        }

        function getReqParams() {
            return {
                descrId: 'SYS_SEM.xml#GET_CLIENT_CONFIG',
                descrType: 'select',
                data:'<root><data FILE="../../Web.config" /></root>'
            };
        }

        //При обращении к сервису без параметров, все равно нужно указывать пустой объект (null вызовет ошибку сервиса)
        //Возвращаем ссылку на запрос
        return App.serverQueryXmlFileNodeWithTries(Services.processQueryNodeXml, getReqParams(), onGetClientConfigResult, onGetClientConfigFail);
    }
    else {
        //Конфиг уже загружен, возвращаем его
        if(resultCallback)
            resultCallback();
        return App.config;
    }
};


/*
 * Создание динамических iframe-ов
 * */
App.iframeIdsCount = 0;
//Создание очередного iframe с новым id по переданной ссылке
App.createIFrame = function(linkUrl,name){
    //Прибавляем общее количество iframe
    App.iframeIdsCount++;
    var iframe = document.createElement('iframe');
    iframe.frameBorder=0;
    iframe.name = name;
    iframe.width="100%";
    iframe.height="100%";
    iframe.id="iframe" + App.iframeIdsCount;
    iframe.setAttribute("src", linkUrl);
    return iframe;
};

/**
 * Функция генерайции UUID
 * */

App.generateUUID = function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};

// Установим заголовки приложения
$(document).ready(function(){
    //document.title = App.name+' '+App.version;
    //$('body.login h1').text(App.name+' '+App.version);
});



//устанавливаем куки
App.setCookie = function(cookieName, value, expires){
    var options = {
        path:    '/',
        expires: expires || 365*20 // Запомнить на 20 лет
    };
    $.cookie(cookieName, value, options);
};

//удаляем куки
App.removeCookie = function(cookieName){
    //код из флеша, т.к jquery $.removeCookie(this.cookieName);  не удаляет куки
    function  setCookie(name, value, days){
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = '; expires='+date.toGMTString();
        }
        else
            var expires = '';
        document.cookie = name + '=' + value+expires+'; path=/';
    }
    setCookie(cookieName,'',-1);
};

//проверяем наличие куков
App.hasCookie = function(cookieName){
    if(!$.cookie || !$.cookie(cookieName)) {
        return false;
    }
    return true;
};

App.getCookie = function(cookieName){
    return $.cookie(cookieName);
};

App.serverQueryXMLSplit1 = function (url, params, callbackResult, callbackFail) {
    var filename = params.descrId.split('#')[1];
    var xmlIndex =  params.xmlIndex;
    filename = filename+'_'+xmlIndex+'.xml';
    filename = filename.replace('_0.xml','.xml');//нулевой элемент без индекса
    var lpuHash = '';
    //добавлено хэширование лпу для доступа к персональной папке геокэша. Используем начальные ЛПУ
    if (WidgetMap.preloadLpuValues) {
        var lpus = [];
        WidgetMap.preloadLpuValues.forEach(function(lpu){
            if(lpu)lpus.push(Number(lpu.CODE));
        })
        lpuHash = CryptoJS.MD5(lpus.sort().join()) + '/';
    }

    var reqParams = {
        descrId: 'SYS_SEM.xml#GET_XML_FILE',
        descrType: 'select',
        dataType: 'text',
        data: '<root><data FILE="../../../' + App.privatePath + '/geo/' + lpuHash + filename + '"/></root>'
    };
    App.serverQueryXmlFileNodeWithTries(Services.processQueryNodeXml, reqParams, callbackResult, callbackFail, undefined, undefined, false);

    return undefined;
};

App.serverQueryJSON = function (url, callbackResult, callbackFail, triesCount) {
    if(!triesCount) triesCount = 4;
    var fileName = url.substr(url.lastIndexOf('/')+1);
    function sendRequest(triesCount){
        var req = $.ajax({
            url: url,
            timeout: 20000,
            cache: false,
            dataType: "json",
        });
        req.done(function(data) {
            callbackResult(data);
        });
        req.fail(function(jqXHR, textStatus, errorThrown){
            if(errorThrown === 'Not Found') errorThrown = '404'
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            if (fileName && textStatus === gis_app_55_31)
                textStatus = textStatus.replace(gis_app_55_34,gis_app_55_34 + ': ' + fileName);
            if(textStatus.indexOf('timeout')!=-1)
                callbackFail(gis_app_55_13+textStatus+' .'+errorThrown);
            else if(triesCount > 0){
                --triesCount;
                setTimeout(function(){
                    sendRequest(triesCount);
                }, 2000)
                return;
            }
            callbackFail(textStatus+'. '+errorThrown);
        });
        return req;
    }
    return sendRequest(triesCount);
};

App.serverQueryCadastreJSON = function (url, callbackResult, callbackFail,triesCount) {
    if(!triesCount)
        triesCount = 4;
    function sendRequest(triesCount){
        var req = $.ajax({
            url: url,
            timeout: 20000,
            cache: false,
            dataType: "json",
        });
        req.done(function(data) {
            callbackResult(data);
        });
        req.fail(function(jqXHR, textStatus, errorThrown){
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            if(textStatus.indexOf('timeout')!=-1)
                callbackFail(gis_app_55_21+textStatus+' .'+errorThrown);
            else if(triesCount > 0){
                --triesCount;
                setTimeout(function(){
                    sendRequest(triesCount);
                }, 2000)
                return;
            }
            callbackFail(textStatus+'. '+errorThrown);
        });
        return req;
    }
    return sendRequest(triesCount);
};

/**
 * Полное удаление диалогового окна
 * @param selector
 */
App.destroyDialog = function(id, selector){
    if(id)
        selector = '#' + id;
    try{
        $(selector).empty();
        $(selector).dialog('destroy').remove();
    }
    catch(ex){
    }
    finally {
        $(selector).empty();
    }
};

App.serverQueryXMLNode = function (url, params, callbackResult, callbackFail, returnReq) {
    url = App.formatNodeServiceUrl(url);
    var req = $.ajax({
        type: "POST",
        url: url,
        data: params,
        timeout: App.clientRequestTimeout,
        dataType: 'text'
    });

    var xmlData = "";

    req.done(function (resp) {
        xmlData = resp;//$(resp).find('string').text();
        //Вызываем переданную функцию для обработки результата
        callbackResult(xmlData);
    });

    req.fail(function (jqXHR, textStatus, errorThrown) {
        textStatus = App.prettyCodeError(textStatus, errorThrown);
        xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
        //Отдельно обрабатываем если таймаут
        if (jqXHR.statusText=="timeout") {
            xmlData = gis_app_55_13;
        }
        //Вызываем переданную функцию для обработки результата
        callbackFail(xmlData);
    });

    return req;
};

App.serverQueryXMLNodeWithTries = function (url, params, callbackResult, callbackFail, triesCount) {
    url = App.formatNodeServiceUrl(url);
    if(!triesCount)
        triesCount = 4;
    function sendRequest(triesCount){
        var req = $.ajax({
            type: "POST",
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: 'text'
        });
        var xmlData = "";
        req.done(function (resp) {
            xmlData = resp;//$(resp).find('string').text();
            //Вызываем переданную функцию для обработки результата
            callbackResult(xmlData);
        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            var xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            if (jqXHR.statusText === "timeout") {
                xmlData = gis_app_55_13;
            }
            else if(triesCount > 0){
                --triesCount;
                setTimeout(function(){
                    sendRequest(triesCount);
                }, 2000);
                return;
            }
            callbackFail(xmlData);
        });
        return req;
    }
    return sendRequest(triesCount);
};


App.serverQueryXML2Node = function (url, params, callbackResult, callbackFail, handleEmptyFileError) {
    url = App.formatNodeServiceUrl(url);
    var internalServerErrorCounter = 5;
    handleEmptyFileError = handleEmptyFileError !== false;
    function sendRequest(internalServerErrorCounter){
        //url = window.location.origin+':3000'+ url.replace('.','');
        var req = $.ajax({
            type: "POST",
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: 'text'
        });

        var xmlData = "";

        req.done(function (resp) {
            var isEmptyFile = resp.indexOf(App.EMPTY_FILE_RESPONSE) !== -1;
            if (isEmptyFile && handleEmptyFileError)
                callbackFail(gis_core_21 + App.getAttributeFromXml(resp, 'fileName') + '. '+ gis_core_19);
            else{
                if(isEmptyFile) resp = App.EMPTY_FILE_TEMPLATE;
                xmlData = resp.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                callbackResult(xmlData);
            }
        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            //Отдельно обрабатываем если таймаут
            if (jqXHR.statusText === "timeout") {
                xmlData = gis_app_55_13;
            }
            //если запрос вызвал Internal Server Error апачем, то
            else if(jqXHR.state()=="rejected" && internalServerErrorCounter>0){
                --internalServerErrorCounter;
                sendRequest(internalServerErrorCounter);
                return;
            }
            else{
                if(jqXHR.statusText !== '' || jqXHR.statusText !== 'error')
                    xmlData = jqXHR.statusText;
                else xmlData = gis_app_55_23;
                xmlData = '<error>'+xmlData+'</error>';
            }

            //Вызываем переданную функцию для обработки результата
            callbackFail(xmlData);
        });
        return req;
    }
    return sendRequest(internalServerErrorCounter);

};

App.serverQueryXML3Node = function (url, params, callbackResult, callbackFail, handleEmptyFileError) {
    url = App.formatNodeServiceUrl(url);
    var internalServerErrorCounter = 5;
    handleEmptyFileError = handleEmptyFileError !== false;
    function sendRequest(internalServerErrorCounter){
        //url = window.location.origin+':3000'+ url.replace('.','');
        var req = $.ajax({
            type: "POST",
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: 'text'
        });

        var xmlData = "";

        req.done(function (resp) {
            var isEmptyFile = resp.indexOf(App.EMPTY_FILE_RESPONSE) !== -1;
            if (isEmptyFile && handleEmptyFileError)
                callbackFail(gis_core_21 + App.getAttributeFromXml(resp, 'fileName') + '. '+ gis_core_19);
            else{
                if(isEmptyFile) resp = App.EMPTY_FILE_TEMPLATE;
                xmlData = resp.replace(/&amp;/g, "&");//.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
                callbackResult(xmlData);
            }
        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            //Отдельно обрабатываем если таймаут
            if (jqXHR.statusText === "timeout") {
                xmlData = gis_app_55_13;
            }
            //если запрос вызвал Internal Server Error апачем, то
            else if(jqXHR.state()=="rejected" && internalServerErrorCounter>0){
                --internalServerErrorCounter;
                sendRequest(internalServerErrorCounter);
                return;
            }
            else{
                if(jqXHR.statusText !== '' || jqXHR.statusText !== 'error')
                    xmlData = jqXHR.statusText;
                else xmlData = gis_app_55_23;
                xmlData = '<error>'+xmlData+'</error>';
            }

            //Вызываем переданную функцию для обработки результата
            callbackFail(xmlData);
        });
        return req;
    }
    return sendRequest(internalServerErrorCounter);

};

/**
 * Обертка для отправки запросов на сервер.
 * При успехе - возвращает вложенную XML.
 */
App.serverQueryNode = function(url, params, callback, fault) {
    url = App.formatNodeServiceUrl(url);
    var dfd = new $.Deferred();
    params.user =  Auth.getUserId();
    //url = window.location.origin+':3000'+ url.replace('.','');
    var req = $.ajax({
        type:     'POST',
        url:      url,
        data:     params,
        timeout:  App.clientRequestTimeout,
        dataType: 'text'
    });

    req.done(function(resp){
        var xmlData = resp;
        var doc;
        var errorText;

        try { // Иногда ответ в формате XML, а иногда в виде просто строки
            doc = $($.parseXML(xmlData));
            errorText = doc.find('error').text();
        }
        catch(e) { // Распарсить XML не удалось, видимо это просто строка
            doc = xmlData;
        }

        if(errorText) {
            if(fault)
                fault(errorText);
            dfd.rejectWith(null, [errorText]);
        }
        else {
            if(callback) {
                callback(doc);
            }
            dfd.resolveWith(null, [doc]);
        }
    });

    req.fail(function(jqXHR, textStatus, errorThrown){
        textStatus = App.prettyCodeError(textStatus, errorThrown);
        var errorText = gis_app_55_4 + '. ' + textStatus + '. ' + errorThrown;
        //Отдельно обрабатываем если таймаут
        if (jqXHR.statusText === "timeout") {
            errorText = gis_app_55_13;
        }
        if(fault)
            fault(errorText);
        dfd.rejectWith(null, [errorText]);
    });

    return dfd;
};
/**
 *
 * @param {*} url
 * @param {*} params
 * @param {*} callbackResult
 * @param {*} callbackFail
 * @param {*} triesCount количество попыток
 * @param {*} handleEmptyFileError являющийся флагом, который используется для регулирования показа сообщения об ошибке.
 * @returns
 */
App.serverQueryNodeWithTries = function(url, params, callbackResult, callbackFail, triesCount, handleEmptyFileError) {
    url = App.formatNodeServiceUrl(url);
    handleEmptyFileError = handleEmptyFileError !== false;
    if (!triesCount)
        triesCount = 4;
    var dfd = new $.Deferred();
    params.user =  Auth.getUserId();
    //url = window.location.origin+':3000'+ url.replace('.','');
    function sendRequest(triesCount){
        var req = $.ajax({
            type:     'POST',
            url:      url,
            data:     params,
            timeout:  App.clientRequestTimeout,
            dataType: 'text'
        });
        req.done(function(resp){
            var xmlData = resp, doc, errorText;
            var isEmptyFile = resp.indexOf(App.EMPTY_FILE_RESPONSE) !== -1;
            if (isEmptyFile && handleEmptyFileError)
                callbackFail(gis_core_21 + App.getAttributeFromXml(xmlData, 'fileName') + '. '+ gis_core_19);
            else{
                if(isEmptyFile) xmlData = App.EMPTY_FILE_TEMPLATE;
                try { // Иногда ответ в формате XML, а иногда в виде просто строки
                    doc = $($.parseXML(xmlData));
                    errorText = doc.find('error').text();
                }
                catch(e) { // Распарсить XML не удалось, видимо это просто строка
                    doc = xmlData;
                }

                if(errorText) {
                    if(callbackFail)
                        callbackFail(errorText);
                    dfd.rejectWith(null, [errorText]);
                }
                else {
                    if(callbackResult) {
                        callbackResult(doc);
                    }
                    dfd.resolveWith(null, [doc]);
                }
            }
        });
        req.fail(function(jqXHR, textStatus, errorThrown){
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            var errorText = gis_app_55_4 + '. ' + textStatus + '. ' + errorThrown;
            //Отдельно обрабатываем если таймаут
            if (jqXHR.statusText === "timeout") {
                errorText = gis_app_55_13;
            }else if(triesCount > 0){
                --triesCount;
                setTimeout(function(){
                    sendRequest(triesCount);
                }, 2000)
                return;
            }
            if(callbackFail)
                callbackFail(errorText);
            dfd.rejectWith(null, [errorText]);
            callbackFail(xmlData);
        });
        return dfd;
    }
    return sendRequest(triesCount);
};


App.serverQueryXMLGridNode = function (url, params, callbackResult, callbackFail, canAbort) {
    url = App.formatNodeServiceUrl(url);
    var internalServerErrorCounter = 5;
    //url = window.location.origin+':3000'+ url.replace('.','');
    function sendRequest(internalServerErrorCounter){
        var req = $.ajax({
            type: "POST",
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: 'text'
        });

        var xmlData = "";

        req.done(function (resp) {
            xmlData = resp;
            //Вызываем переданную функцию для обработки результата
            callbackResult(xmlData);
        });

        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            //Отдельно обрабатываем если таймаут
            if (jqXHR.statusText === "timeout") {
                xmlData = gis_app_55_13;
            }
            //случай, если происходит отмена запроса во время фильтра грида
            if(canAbort === true && errorThrown === 'abort' && jqXHR.status === 0){
                return;
            }
            //если запрос вызвал Internal Server Error апачем, то
            else if(jqXHR.state() === "rejected" && internalServerErrorCounter>0){
                --internalServerErrorCounter;
                sendRequest(internalServerErrorCounter);
                return;
            }
            //Вызываем переданную функцию для обработки результата
            callbackFail(xmlData);
        });
        return req;
    }
    return sendRequest(internalServerErrorCounter);
};


App.serverQueryXMLNode1 = function (url, params, callbackResult, callbackFail, returnReq) {
    url = App.formatNodeServiceUrl(url);
    var req = $.ajax({
        type: "POST",
        url: url,
        data: params,
        timeout: App.clientRequestTimeout,
        dataType: 'xml'
    });

    var xmlData = "";

    req.done(function (resp) {
        xmlData = $(resp).find('string').text();
        //Вызываем переданную функцию для обработки результата
        callbackResult(xmlData);
    });

    req.fail(function (jqXHR, textStatus, errorThrown) {
        textStatus = App.prettyCodeError(textStatus, errorThrown);
        xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
        //Отдельно обрабатываем если таймаут
        if (jqXHR.statusText === "timeout") {
            xmlData = gis_app_55_13;
        }
        //Вызываем переданную функцию для обработки результата
        callbackFail(xmlData);
    });

    return req;
};

App.serverQueryXML2Node1 = function (url, params, callbackResult, callbackFail) {
    var internalServerErrorCounter = 5;
    function sendRequest(internalServerErrorCounter){
        url = App.formatNodeServiceUrl(url);
        var req = $.ajax({
            type: "POST",
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: 'text'
        });

        var xmlData = "";

        req.done(function (resp) {
            xmlData = resp.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
            //Вызываем переданную функцию для обработки результата
            callbackResult(xmlData);
        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            //Отдельно обрабатываем если таймаут
            if (jqXHR.statusText === "timeout") {
                xmlData = gis_app_55_13;
            }
            //если запрос вызвал Internal Server Error апачем, то
            else if(jqXHR.state() === "rejected" && internalServerErrorCounter>0){
                --internalServerErrorCounter;
                sendRequest(internalServerErrorCounter);
                return;
            }
            //Вызываем переданную функцию для обработки результата
            callbackFail(xmlData);
        });
        return req;
    }
    return sendRequest(internalServerErrorCounter);

};

App.serverQueryXMLGridNewNode = function (url, params, result, fail, returnReq, processId) {
    var internalServerErrorCounter = 5;
    function sendRequest(internalServerErrorCounter){
        var req = $.ajax({
            type: "POST",
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            jsonp: "jsonp",
            cache: false
        });

        var xmlData = "";
        //результат может прийти, как удачный json, там и ошибка в xml
        req.done(function (resp) {
            try{
                if(resp){
                    var xmlData = $(resp).find('string').text();
                    if(xmlData !== '')
                        resp = $(resp);
                }
            }
            catch (e) {}
            if(result){
                result(resp, processId);
            }
        });

        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            //Отдельно обрабатываем если таймаут
            if (jqXHR.statusText === "timeout") {
                xmlData = gis_app_55_13;
            }
            //если запрос вызвал Internal Server Error апачем, то
            else if(jqXHR.state() === "rejected" && internalServerErrorCounter>0){
                --internalServerErrorCounter;
                sendRequest(internalServerErrorCounter);
                return;
            }
            //Вызываем переданную функцию для обработки результата
            if(fail)
                fail(xmlData, processId);
        });
        return req;
    }
    return sendRequest(internalServerErrorCounter);
};

/******** nodejs json requests *********/
App.getJsonNode = function(url, params, result, fault, method, triesCount) {
    if(!triesCount) triesCount = 4;
    if(!method) method = 'POST';
    url = App.formatNodeServiceUrl(url);
    var url = App.formatNodeServiceUrl(url );
    if(params === undefined)
        params = {};
    function sendRequest(triesCount){
        var req = $.ajax({
            type: method,
            url: url,
            data:params,
            timeout: App.clientRequestTimeout,
            dataType: 'json',
            jsonp: "jsonp",
            cache: false
        });
        req.done(function (resp) {
            (resp && (resp.status === 200 || resp.code === 200 )) ?
                result(resp) : fault(resp);
        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            if(triesCount > 0){
                --triesCount;
                setTimeout(function(){
                    sendRequest(triesCount);
                }, 2000)
            }else if(fault) {
                fault(textStatus);
            }
        });
        return req;
    }
    return sendRequest(triesCount);
};

App.jsonNode = function(url, params, result, fault, method, triesCount) {
    if(!triesCount) triesCount = 4;
    if(!method) method = 'POST';
    function sendRequest(triesCount){
        var req = $.ajax({
            type: method,
            url: url,
            data: params || {},
            timeout: App.clientRequestTimeout,
            dataType: 'json',
            jsonp: "jsonp",
            cache: false
        });
        req.done(function (resp) {
            (resp && (resp.status === 200 || resp.code === 200 )) ?
                result(resp) : fault(resp);
        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            if(triesCount > 0){
                --triesCount;
                setTimeout(function(){
                    sendRequest(triesCount);
                }, 2000)
            }else if(fault) {
                fault(textStatus);
            }
        });
        return req;
    }
    return sendRequest(triesCount);
};

/**
 *
 * @param url
 * @param params
 * @param result
 * @param fault
 * @param processId
 * @param triesCount
 * @param requestOptions
 * @returns {*}
 */
App.getJsonTextNode = function (url, params, result, fault, processId, requestOptions, triesCount) {
    var url = App.formatNodeServiceUrl(url);
    if (!triesCount)
        triesCount = 4;
    if (params === undefined)
        params = {};
    var method = (requestOptions && requestOptions.method) ? requestOptions.method : 'POST';
    var dataType = (requestOptions && requestOptions.dataType) ? requestOptions.dataType : 'text';

    function sendRequest(triesCount) {
        var req = $.ajax({
            type: method,
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: dataType,
            jsonp: "jsonp",
            cache: false
        });
        req.done(function (resp) {
            if(result)
                result(resp, processId);
        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            textStatus = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            if (jqXHR.statusText === "timeout") {
                textStatus = gis_app_55_13;
            }
            else if (triesCount > 0) {
                --triesCount;
                setTimeout(function () {
                    sendRequest(triesCount);
                }, 2000)
                return;
            }
            if (fault)
                fault(textStatus, processId);
        });
        return req;
    }

    return sendRequest(triesCount);
};

App.getUTEProcessStatus = function(processId, isNodeMonitor, result, fault) {
    var url = App.formatNodeServiceUrl('./api/status/ute-process-status');
    var req = $.ajax({
        type: "GET",
        url: url,
        data: { processId: processId, place: (isNodeMonitor)?'node':'ute'},
        timeout: 9000,// на секунду меньше, чем интервал вызова
        dataType: 'json',
        jsonp: "jsonp",
        cache: false
    });
    req.done(function (resp) {
        result(resp);
    });
    req.fail(function (jqXHR, textStatus, errorThrown) {
        textStatus = App.prettyCodeError(textStatus, errorThrown);
        textStatus = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
        fault(textStatus);
    });
    return req;
};
//upd. 03.03.21 принято решение не выносить в конфиг
App.REQUEST_ERROR_TRIES = 5;
App.getUTEProcessStatus1 = function(processId, result, fault) {
    var internalServerErrorCounter = App.REQUEST_ERROR_TRIES; //5
    function sendRequest(internalServerErrorCounter) {
        var url = App.formatNodeServiceUrl('./api/status/ute-process-status');
        var req = $.ajax({
            type: "GET",
            url: url,
            data: {processId: processId},
            dataType: 'json',
            jsonp: "jsonp",
            cache: false
        });
        req.done(function (resp) {
            result(resp);
        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            if (internalServerErrorCounter > 0) {
                --internalServerErrorCounter;
                sendRequest(internalServerErrorCounter);
                return;
            }
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            fault(textStatus);
        });
    };
    return sendRequest(internalServerErrorCounter);
}


/**
 *
 * @param url
 * @param params
 * @param callbackResult
 * @param callbackFail
 * @param method
 * @param triesCount количество попыток
 * @param handleEmptyFileError являющийся флагом, который используется для регулирования показа сообщения об ошибке.
 * @returns {jQuery|{getAllResponseHeaders: function(): *|null, abort: function(*=): this, setRequestHeader: function(*=, *): this, readyState: number, getResponseHeader: function(*): null|*, overrideMimeType: function(*): this, statusCode: function(*=): this}}
 */
App.serverQueryXmlFileNodeWithTries = function (url, params, callbackResult, callbackFail, method, triesCount, handleEmptyFileError) {
    if(!method) method = 'POST';
    url = App.formatNodeServiceUrl(url);
    handleEmptyFileError = handleEmptyFileError !== false;
    if(!triesCount)
        triesCount = 4;

    function sendRequest(triesCount){
        var req = $.ajax({
            type: method,
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: 'text'
        });
        req.done(function (resp) {
            var isEmptyFile = resp.indexOf(App.EMPTY_FILE_RESPONSE) !== -1;
            if (isEmptyFile && handleEmptyFileError)
                callbackFail(gis_core_21 + App.getAttributeFromXml(resp, 'fileName') + '. '+ gis_core_19);
            else{
                if(isEmptyFile) resp = App.EMPTY_FILE_TEMPLATE;
                callbackResult(resp);
            }

        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            var xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            if (jqXHR.statusText === "timeout") {
                xmlData = gis_app_55_13;
            }
            else if(triesCount > 0){
                --triesCount;
                setTimeout(function(){
                    sendRequest(triesCount);
                }, 2000)
                return;
            }
            callbackFail(xmlData);
        });
        return req;
    }
    return sendRequest(triesCount);
};
/**
 *
 * @param {*} url
 * @param {*} descrId
 * @param {*} fileName
 * @param {*} callback
 * @param {*} handleEmptyFileError являющийся флагом, который используется для регулирования показа сообщения об ошибке.
 * @returns
 */
App.serverQueryXmlFileNode1 = function(url, descrId, fileName, callback, handleEmptyFileError) {
    url = App.formatNodeServiceUrl(url);
    handleEmptyFileError = handleEmptyFileError !== false;
    var params = {
        descrId: descrId,
        descrType: 'select',
        data:'<root ><data FILE="'+fileName+'"/></root>'
    };
    var dfd = new $.Deferred();
    params.user =  Auth.getUserId();
    var req = $.ajax({
        type:     "POST",
        url:      url,
        data:     params,
        timeout:  App.clientRequestTimeout,
        dataType: 'text'
    });

    req.done(function(resp){
        var xmlData = resp, doc, errorText;
        var isEmptyFile = resp.indexOf(App.EMPTY_FILE_RESPONSE) !== -1;

        if (isEmptyFile && handleEmptyFileError)
            callback(gis_core_21 + App.getAttributeFromXml(xmlData, 'fileName') + '. '+ gis_core_19);
        else{
            if (isEmptyFile) xmlData = App.EMPTY_FILE_TEMPLATE;
            try { // Иногда ответ в формате XML, а иногда в виде просто строки
                doc = $($.parseXML(xmlData));
                errorText = doc.find('error').text();
            }
            catch(e) { // Распарсить XML не удалось, видимо это просто строка
                doc = xmlData;
            }
            if(errorText) {
                dfd.rejectWith(null, [errorText]);
            }
            else {
                if(callback)
                    callback(doc);
                dfd.resolveWith(null, [doc]);
            }
        }
    });

    req.fail(function(jqXHR, textStatus, errorThrown){
        textStatus = App.prettyCodeError(textStatus, errorThrown);
        var errorText = gis_app_55_4 + '. ' + textStatus + '. ' + errorThrown;
        //Отдельно обрабатываем если таймаут
        if (jqXHR.statusText === "timeout") {
            errorText = gis_app_55_13;
        }
        dfd.rejectWith(null, [errorText]);
    });

    return dfd;
};

App.formatNodeServiceUrl = function(url){
    $.support.cors = true;
    if(App.useDirectlyNodeService){
        if(window.location.origin)
            url = window.location.origin+':3000'+ url.replace('.','');
        else
            url = window.location.protocol+'//'+window.location.host+':3000'+ url.replace('.','');
    }
    return url;
}

App.areCookiesEnabled = function() {
    try {
        document.cookie = 'cookietest=1';
        var cookiesEnabled = document.cookie.indexOf('cookietest=') !== -1;
        document.cookie = 'cookietest=1; expires=Thu, 01-Jan-1970 00:00:01 GMT';
        return cookiesEnabled;
    } catch (e) {
        return false;
    }
}

App.showCookieMessage = function(message){
    var div = $('.cookie-button');
    if(div.length > 0)
        div.remove();

    $('body').append('<div class="cookie-button show" >' + message + '<button>X</button></div>');
    $('.cookie-button :button').click(function(){
        $('.cookie-button').remove();
    });
}


/**
 * Базовая функция подготовки параметров запроса.
 * @param requestId
 * @param data
 */
App.composeRequestParams = function(requestId, data){
    var userId = AbstractFormDialog.sendUser ? '' + Auth.getUserId() : '-1';
    var userLogin = AbstractFormDialog.sendUser ? '' + Auth.getUserName() : 'guest';
    return {
        descrId: requestId,
        descrType: 'select',
        data:  '<root USER_ID="'+userId.xmlEscape()+
            '" USER_LOGIN="'+userLogin.xmlEscape()+
            '" PODS_USER="'+userLogin.xmlEscape()+
            '" >'+
            DBUtil.serializeData(data) +
            '</root>'
    };
};



App.formattedQueryNode = function (url, params, callbackResult, callbackFail,triesCount) {
    url = App.formatNodeServiceUrl(url);
    if (!triesCount)
        triesCount = 4;
    function sendRequest(triesCount){
        var req = $.ajax({
            type: "POST",
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: 'text'
        });
        var xmlData = "";
        req.done(function (resp) {
            try{
                var er = HTTPServiceUtil.getError(resp);
                if (er !== '') {
                    callbackResult({error:er});
                }
                else{
                    var resData = $($.parseXML(resp)).find("data");
                    var resArr = [];
                    if(resData && resData.length > 0 ){
                        var obj = {};
                        for (var i=0; i< resData[0].attributes.length; i++) {
                            obj[resData[0].attributes[i].name] = resData[0].attributes[i].value;
                        }
                        resArr.push(obj);
                    }
                    callbackResult({data: resArr});
                }
            }
            catch(ex){
                callbackResult({error:ex.message});
            }
        });

        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            //Отдельно обрабатываем если таймаут
            if (jqXHR.statusText=="timeout") {
                xmlData = gis_app_55_13;
            }else if(triesCount > 0){
                --triesCount;
                setTimeout(function(){
                    sendRequest(triesCount);
                }, 2000)
                return;
            }
            //Вызываем переданную функцию для обработки результата
            callbackFail({error: xmlData});
        });
        return req;
    }
    return sendRequest(triesCount);
};

App.saveMultigeomDataWithTries = function (dataObject, pasteMultiFeature,callbackResult, callbackFail, triesCount) {  
    if (!triesCount)
        triesCount = 4;
    function sendRequest(triesCount){
        var req = $.ajax({
            type: 'POST',
            url: dataObject.requestUrl,
            data: dataObject.requestParams,
            timeout: App.clientRequestTimeout,
            dataType: 'xml',
        });
        req.done(function (resp) {
            callbackResult(resp);
        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            var xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            if (jqXHR.statusText === "timeout") {
                xmlData = gis_app_55_13;
            }else if(triesCount > 0){
                --triesCount;
                setTimeout(function(){
                    sendRequest(triesCount);
                }, 2000)
                return;
            }
            callbackFail(xmlData);
        });
    }
    return sendRequest(triesCount);
};
App.getClosestPointWithTries = function (url,callbackResult,callbackFail,triesCount){
    if (!triesCount)
        triesCount = 4;
    function sendRequest(triesCount){
        var req = $.ajax({
            type: "GET",
            url: url,
            data: {},
            timeout: 5000,
            dataType: 'json',
            jsonp: "jsonp",
            cache: true
        });
        req.done(function (data) {
            callbackResult(data);
        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            var xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            if (jqXHR.statusText === "timeout") {
                xmlData = gis_app_55_13;
            }else if(triesCount > 0){
                --triesCount;
                setTimeout(function(){
                    sendRequest(triesCount);
                }, 2000)
                return;
            }
            callbackFail();
        });
        //Возвращаем ссылку на запрос (для возможности отмены запроса)
        return req;
    }
    return sendRequest(triesCount);
}

App.getClosestPathWithTries = function (url,callbackResult,callbackFail,triesCount){
    if (!triesCount)
        triesCount = 4;
    function sendRequest(triesCount){
        var req = $.ajax({
            type: "GET",
            url: url,
            data: {},
            timeout: 5000,
            dataType: 'json',
            jsonp: "jsonp",
            cache: true
        });
        req.done(function (data) {
            callbackResult(data);
        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            var xmlData = '<error>' + gis_app_55_3 + '. ' + textStatus + '. ' + errorThrown + '</error>';
            if (jqXHR.statusText === "timeout") {
                xmlData = gis_app_55_13;
            }else if(triesCount > 0){
                --triesCount;
                setTimeout(function(){
                    sendRequest(triesCount);
                }, 2000)
                return;
            }
            callbackFail(xmlData);
        });
        //Возвращаем ссылку на запрос (для возможности отмены запроса)
        return req;
    }
    return sendRequest(triesCount);
}
App.serverQueryStringWithTries = function (url, params, callbackResult, callbackFail, triesCount){
    if (!triesCount)
        triesCount = 4;
    function sendRequest(triesCount){
        var req = $.ajax({
            type: 'POST',
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: 'xml',
        });
        req.done(function (data) {
            callbackResult(data);
        });
        req.fail(function(jqXHR, textStatus, errorThrown){
            var errorText = gis_app_55_4 + '. ' + textStatus + '. ' + errorThrown;
            //Отдельно обрабатываем если таймаут
            if (jqXHR.statusText === "timeout") {
                errorText = gis_app_55_13;
            }else if(triesCount > 0){
                --triesCount;
                setTimeout(function(){
                    sendRequest(triesCount);
                }, 2000)
                return;
            }
            callbackFail(errorText);
        });
        return req;
    }
    return sendRequest(triesCount);
}

App.serverQueryStringNodeWithTries = function (url, params, callbackResult, callbackFail, triesCount){
    if (!triesCount)
        triesCount = 4;

    function sendRequest(triesCount) {
        var req = $.ajax({
            type: 'POST',
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: 'text',
        });
        req.done(function (data) {
            callbackResult(data);
        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            var errorText = gis_app_55_4 + '. ' + textStatus + '. ' + errorThrown;
            //Отдельно обрабатываем если таймаут
            if (jqXHR.statusText === "timeout") {
                errorText = gis_app_55_13;
            } else if (triesCount > 0) {
                --triesCount;
                setTimeout(function () {
                    sendRequest(triesCount);
                }, 2000)
                return;
            }
            callbackFail(textStatus);
        });
        return req;
    }
    return sendRequest(triesCount);    
}
/**
 *
 * @param {*} url
 * @param {*} params
 * @param {*} callbackResult
 * @param {*} callbackFail
 * @param {*} triesCount
 * @param {*} handleEmptyFileError являющийся флагом, который используется для регулирования показа сообщения об ошибке.
 * @returns
 */
App.serverQueryNodeWithTries2 = function(url, params, callbackResult, callbackFail, triesCount, handleEmptyFileError){
    if (!triesCount)
        triesCount = 4;
    handleEmptyFileError= handleEmptyFileError !== false;
    function sendRequest(triesCount) {
        var req = $.ajax({
            type: 'POST',
            url: url,
            data: params,
            timeout: App.clientRequestTimeout,
            dataType: 'text',
        });
        req.done(function (data) {
            var isEmptyFile = data.indexOf(App.EMPTY_FILE_RESPONSE) !== -1;
            if (isEmptyFile) data = App.EMPTY_FILE_TEMPLATE;
            if (isEmptyFile && handleEmptyFileError)
                callbackFail(gis_core_21 + App.getAttributeFromXml(data, 'fileName') + '. '+ gis_core_19);
            else
                callbackResult(data);
        });
        req.fail(function (jqXHR, textStatus, errorThrown) {
            var errorText = gis_app_55_4 + '. ' + textStatus + '. ' + errorThrown;
            //Отдельно обрабатываем если таймаут
            if (jqXHR.statusText === "timeout") {
                errorText = gis_app_55_13;
            } else if (triesCount > 0) {
                --triesCount;
                setTimeout(function () {
                    sendRequest(triesCount);
                }, 2000)
                return;
            }
            callbackFail(errorText);
        });
        return req;
    }
    return sendRequest(triesCount);
}
/**
 * Пасринг ошибки при отсутсвие на сервере файла.
 * @param {*} inputXmlStr <string><root attributes/></string>
 * @returns значение атрибута
 */
App.getAttributeFromXml = function (inputXmlStr, attribute) {
    try{
        //Получаем xml с данными в виде структуры (берем корневой элемент, т.е. root)
        var inputXml = ($.parseXML(inputXmlStr)).firstChild;
        return inputXml.firstElementChild.getAttribute(attribute);
    }catch(ex){};
};


App.convertDataXmlToArray = function(inputDataStr, toUpper){
    var dataArr = []
    try{
        $(inputDataStr).find('data').each(function () {
            var newDataObj = {};
            //TODO то modern loop
            for (var curAttrInd = 0; curAttrInd < this.attributes.length; curAttrInd++) {
                var name = this.attributes[curAttrInd].name;
                if(toUpper) name = name.toUpperCase();
                newDataObj[name] = this.attributes[curAttrInd].value;
            }
            dataArr.push(newDataObj);
        });
    }
    catch (ex){}
    return dataArr;
}

/**
 * Функция ресайза карты, открытой в iframe
 *
 * @param dialogId
 */
App.resizeIframeMap = function(dialogId){
    var dashboard = App.dashboardManager.getCurrentDashboard();
    var maps = dashboard.getMaps();
    maps.forEach(function(map){
        if(map.mapId === dialogId){
            var mapDlg = $('#'+map.mapId);
            mapDlg.dialog("option", "height", $(window).height() - 40);
            mapDlg.dialog("option", "width", $(window).width() - 40);
            mapDlg.dialog("option", "position", [20, 20]);
        }
        //var parent = mapDlg.parent();
    });
}
/**
 * Всякие действия по авторизации
 */
Auth = {};
Auth.getParameterByName = function(name){
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

// Запомитаем хеш с которым была открыта страница (а то потом он будет убран из адресной строки)
Auth.hash = window.location.hash;

// Сотрем хеш, если не указана флешка.
// Иначе хеш потребуется самой флешке, которая его прочитает и сама потом почистит
if(! /task=([^&#\^]+)&mdl=([^&#\^]+)/.test(window.location.href)) {
    var m = /^(.*)#(.*)$/.exec(window.location.href);
    if(m) {
        window.location.href = m[1]+'#';
    }
}

Auth.cookieName = "gis_gots_web53_cookie";

/**
 * Пытаемся залогинится.
 * Если не получилось то ругаемся.
 * Если получилось, то переходим на дефолтную страницу пользователя
 */
Auth.login = function(login, password, remember, targetUrl) {
    function rememberLastLogin(login) {
        var options = {
            path:    '/',
            expires: 365*20 // Запомнить на 20 лет
        };
        var str = 'login='+login;
        $.cookie(Auth.cookieName+'_last_login', str, options);
    }

    var loginDfd = $.Deferred();

    // Запрашиваем авторизацию
    $.post(Services.loginNode, {login:login, password:password},
        function(resp){
        var er = HTTPServiceUtil.getError(resp);
        if(er !== ''){
            //вызываем доп форматирование ошибки логина, чтобы не выводило пользователям пароль в чистом виде
            er = HTTPServiceUtil.getLoginError(resp, login);
            //send audit event
            LogUtil.sendAuditEvent( login, AuditEventType.USER_LOGIN, 'false');
            App.errorReport(gis_auth_55_1 + gis_auth_55_1_1, er, undefined,{filename:gis_filename_110, functionname:'gis_filename_110_8'});
            loginDfd.rejectWith(this, [er]);
            return;
        }
        var jsonData = JSON.parse(resp);

        Auth._removeCookie();
        // Нам вернули юзера. Запомним в куках.
        if(jsonData.id) {
            var chk    = CryptoJS.MD5(login+'system_check'+login);
            var uid    = jsonData.uid;
            var userId = jsonData.id;

            //Проверяем, первый ли раз мы заходим под этим пользователем. Если первый - нужно выдавать диалог смены пароля.
            var userLogonTime = null;
            var requestParams = { descrType: 'select', descrId: 'SYS_SEM.xml#WEB50_B_USER_PRIVATE', toElements: false, getSchema: false,
                data: '<root USER_ID="'+userId+'" USER_LOGIN="'+login+'" PODS_USER="'+login+'" ><data SYS_OBJ_ID="'+userId+'"/></root>' };
            //Устанавливаем курсор ожидания
            BlockingUtil.wait();
            App.serverQueryXMLNodeWithTries(Services.processQueryNode, requestParams, function onCheckUserResult(resultXML){
                //Снимаем курсор ожидания
                BlockingUtil.ready();
                if (resultXML) {
                    var er = HTTPServiceUtil.getError(resultXML);
                    if (er=='') {
                        userLogonTime = $($.parseXML(resultXML)).find('data').attr('LOGONTIME');
                        checkLogon(userLogonTime);
                    } else {
                        App.errorReport(gis_auth_55_1, er, undefined, {filename:gis_filename_110, functionname:'gis_filename_110_1'});
                    }
                }
            },
            function onCheckUserFault(resultXML){
                //Снимаем курсор ожидания
                BlockingUtil.ready();
                if (resultXML) {
                    var er = HTTPServiceUtil.getError(resultXML);
                    App.errorReport(gis_auth_55_1, er, undefined, {filename:gis_filename_110, functionname:'gis_filename_110_2'});
                }
                //checkLogon();
            });
            function checkLogon(userLogonTime){
                //Пользователь залогинился успешно, но устанавливать  - устанавли
                //Если первый раз заходим - атрибута нет или в нем пусто
                if (!userLogonTime || userLogonTime=='') {
                    //Показываем форму смены пароля
                    var dialog = Object.create(ChangeFirstPasswordDialog);
                    dialog.userLoginPassChange = login;
                    dialog.userIdChange = userId;
                    dialog.build();
                    loginDfd.reject(this);
                    return;
                } else {
                    //Иначе фиксируем последнее время входа
                    var requestParams = { descrType: 'update', descrId: 'SYS_SEM.xml#WEB50_B_USER_PRIVATE_REG', toElements: false, getSchema: false,
                        data: '<root><data SYS_OBJ_ID="'+userId+'"/></root>' };
                    App.serverQueryNodeWithTries(Services.processQueryNode, requestParams);
                }

                // Выбрано "запомнить"
                if(remember) {
                    var str = "login="+login+"||UID="+uid+"||chk="+chk+"||ID="+userId;
                    var options = {
                        path:    '/',
                        expires: 365*20 // Запомнить на 20 лет
                    };
                    $.cookie(Auth.cookieName, str, options);
                }

                // Надо считать главное меню, чтобы перети на дефолтную задачу пользователя
                var tasksDef = $.get(Services.userTasksNode, {user:login,"_": $.now()}, null, 'text');
                tasksDef.done(function(resultXml){
                    var er = HTTPServiceUtil.getError(resultXml);
                    if(er !== ''){
                        App.errorReport(gis_main55_4, er, undefined, {filename:gis_filename_110, functionname:'gis_filename_110_3'});
                        return;
                    }
                    //var xml = $($.parseXML(xmlData));
                    var xml = $($.parseXML(resultXml));
                    var menu = new UserSettings();
                    menu.setContainer($('nav.menu'));
                    menu.setXml(xml);

                    var defaultTask = menu.getDefaultTask();
                    var authStr = Auth.makeAuthStr(login, uid, userId);

                    //проверка, если в url указан task, то он должен быть в списке новом, иначе игнорируем и грузим дефолтную задачу
                    var urlTask = Auth.getParameterByName('task');
                    var urlMdl = Auth.getParameterByName('mdl');

                    if(!menu.hasTaskAndMdlInMenu(urlTask,urlMdl)){
                        if(urlTask != '' && urlMdl != '' && targetUrl != undefined){
                            App.errorReport(gis_auth_55_7, gis_auth_55_8, function(){
                                var splitHref = window.location.href.split('?')[0];
                                window.location.href = splitHref;//+'?#'+authStr;
                            });
                        }
                        else{
                            if(defaultTask) {
                                App.openTask(defaultTask, authStr);
                            }
                            // Нет дефолтной задачи у этого пользователя
                            else {
                                var splitHref = window.location.href.split('?')[0];
                                window.location.href = splitHref + '?#' + authStr;
                            }
                        }
                    }else{
                        // Переходим на URL если какой то был задан
                        if(targetUrl) {
                            window.location.href = targetUrl+'#'+authStr;
                        }
                        else {
                            // Переходим на дефолтную задачу
                            if(defaultTask) {
                                App.openTask(defaultTask, authStr);
                            }
                            // Нет дефолтной задачи у этого пользователя
                            else {
                                var splitHref = window.location.href.split('?')[0];
                                window.location.href = splitHref+'?#'+authStr;
                            }
                        }
                    }
                    rememberLastLogin(login);

                    loginDfd.resolveWith(this, [login]);
                });
            }

        }
        // Не пустили
        else if(resp) {
            //send audit event
            LogUtil.sendAuditEvent(login, AuditEventType.USER_LOGIN, 'false');

            var errorText = resp;
            App.errorReport(gis_auth_55_1, errorText, undefined, {filename:gis_filename_110, functionname:'gis_filename_110_5'});
            loginDfd.rejectWith(this, [errorText]);
        }
        // Вообще неадекватный ответ сервера
        else {
            //send audit event
            LogUtil.sendAuditEvent(login, AuditEventType.USER_LOGIN, Auth.getUid(), 'false');
            App.errorReport(gis_auth_55_1, gis_auth_55_2, undefined, {filename:gis_filename_110, functionname:'gis_filename_110_6'});
            loginDfd.reject(this);
        }
    }, 'text')
        .fail(function(jqXHR, textStatus, errorThrown) {
            textStatus = App.prettyCodeError(textStatus, errorThrown);
            App.errorReport(gis_auth_55_1, textStatus, undefined, {filename:gis_filename_110, functionname:'gis_filename_110_7'});
            loginDfd.reject(this);
        });

    return loginDfd.promise(this);
};

/**
 * Устанавливает хеш авторизации, если параметры были запомнены в куках
 */
Auth.autoAuthorization = function(){
    // Уже авторизованы
    if(Auth.isAuthorized()) {
        //send audit event
        LogUtil.sendAuditEvent(Auth.getUserId(), AuditEventType.USER_LOGIN, 'true');
        return;
    }

    // Нет куки
    if(!$.cookie || !$.cookie(Auth.cookieName)) {
        return;
    }
    /*if($.cookie(Auth.cookieName)==null)
        return;*/

    var targetUrl;
    var m = /task=([^&#\^]+)&mdl=([^&#\^]+)([^$#]*)/.exec(window.location.href);
    if(m) {
        targetUrl = 'main_js.html?task='+m[1]+'&mdl='+m[2]+'&rand='+Math.random()+m[3];
    }
    else {
        targetUrl = 'main_js.html?rand='+Math.random();
    }

    var authStr = Auth.makeAuthStr(
        Auth.parseCookiePart('user'),
        Auth.parseCookiePart('uid'),
        Auth.parseCookiePart('id')
    );

    window.location.href = targetUrl+'#'+authStr;
};

/**
 * Выход и перескок на стартовую страницу
 */
Auth.logout = function() {
    //send audit event
    LogUtil.sendAuditEvent(Auth.getUserId(), AuditEventType.USER_LOGOUT, 'true');

    Auth._removeCookie();
    window.location.href = 'login.html';
};

/**
 * Проверка что мы авторизованы (по параметрам их хэша)
 */
Auth.isAuthorized = function() {
    return !!Auth.getUserName() && !!Auth.getUserId() && Auth.isChkOk();
};

Auth.isChkOk = function() {
    return (Auth.parseHashPart('chk') === CryptoJS.MD5(Auth.getUserName() + 'system_check' + Auth.getUserName()).toString());
};

Auth.getUserName = function() {
    return Auth.parseHashPart('user');
};

Auth.getUserId = function() {
    return Auth.parseHashPart('id');
};

Auth.getUid = function() {
    return Auth.parseHashPart('uid');
};

Auth.getPass = function(){
    if(!!Auth.hash){
        var arr = Auth.hash.split('&');
        var i = 0;
        for(;i<arr.length;i++){
            if(arr[i].indexOf('pass=') != -1){
                return arr[i].substring(5);
            }
        }
    }
    return null;
};

Auth._removeCookie = function() {
    //код из флеша, т.к jquery $.removeCookie(Auth.cookieName);  не удаляет куки
    function  setCookie(name, value, days){
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = '; expires='+date.toGMTString();
        }
        else
            var expires = '';
        document.cookie = name + '=' + value+expires+'; path=/';
    }
    setCookie(Auth.cookieName,'',-1);
};


/**
 * Возвращает якорную строку авторизации для текущего пользователя
 */
Auth.getAuthStr = function() {
    if(!Auth.getUserName()) {
        return null;
    }
    else {
        var str =
            "login=" + Auth.getUserName() +
            "&UID="  + Auth.getUid() +
            "&chk="  + CryptoJS.MD5(Auth.getUserName() + 'system_check' + Auth.getUserName()) +
            "&ID="   + Auth.getUserId();
        return str;
    }
};

Auth.makeAuthStr = function(userName, uid, userId) {
    var str = "";
    str += "login=" + userName;
    str += "&UID="  + uid ;
    str += "&chk="  + CryptoJS.MD5(userName + 'system_check' + userName).toString();
    str += "&ID="   + userId;
    return str;
};

/**
 * Вытаскивает запрошенный кусок из авторизационной куки
 */
Auth.parseCookiePart = function(partName) {
    var str = $.cookie(Auth.cookieName);

    var m = /^login=(.+)\|\|UID=(.+)\|\|chk=(.+)\|\|ID=(.+)$/.exec(str);
    if(m) {
        var parts = {user:m[1], uid:m[2], chk:m[3], id:m[4]};
        return parts[partName];
    }
    return null;
};

Auth.parseHashPart = function(partName) {
    //замена парминха хэш части
    if(!!Auth.hash){
        var parts = {};
        var authStr = Auth.hash.replace('#','');
        var arr = authStr.split('&');
        var i = 0;
        for(;i<arr.length;i++){
            if(arr[i].indexOf('pass=') != -1){
                parts['pass'] = arr[i].substring(5);
            }
            if(arr[i].indexOf('chk=') != -1){
                parts['chk'] = arr[i].substring(4);
            }
            if(arr[i].indexOf('ID=') != -1){
                parts['id'] = arr[i].substring(3);
            }
            if(arr[i].indexOf('login=') != -1){
                parts['user'] = arr[i].substring(6);
            }
            if(arr[i].indexOf('UID=') != -1){
                parts['uid'] = arr[i].substring(4);
            }
        }
        return parts[partName];
    }
    return null;
    var m = /^#login=(.+)&UID=(.+)&chk=(.+)&ID=(.+)$/.exec(Auth.hash);
    if(m) {
        var parts = {user:m[1], uid:m[2], chk:m[3], id:m[4]};
        return parts[partName];
    }
    return null;
};

Auth.registration = function() {
    var text = gis_auth_55_3;

    var buttons = [
        {text:gis_core_4,  click:launchRegistrationDialog},
        {text:gis_core_5, click:closeDialog}
    ];

    var dlg = App.confirmDialog(text, buttons, {title:gis_auth_55_6, width:700});

    function closeDialog() {
        dlg.dialog('destroy');
        dlg.remove();
    }

    function launchRegistrationDialog() {
        closeDialog();

        var dialog = Object.create(UserRegistrationDialog);
        dialog.init();
        dialog.build();
    }
};

Auth.getLastLogin = function() {
    var lastLoginStr = $.cookie(Auth.cookieName+'_last_login');
    var re = /^login=([a-z0-9\.\_\-]+)$/i;
    var m = re.exec(lastLoginStr);
    if(m) {
        return m[1];
    }
    else {
        return '';
    }
};

Auth.Autorization = function(){
    //Устанавливаем параметры авторизации из cookies, если их нет (перезагружаем страницу с добавленными в url параметрами авторизации)
    //Новая проверка на наличие атрибука pass в хэше
    if(!!Auth.getPass()){
        var userPass = Auth.getPass();
        //удаляем из хеша pass
        var str = '&pass='+userPass;
        window.location.href = window.location.href.replace(str,'');
        Auth.hash = Auth.hash.replace(str,'');
        var userN = Auth.getUserName();
        Auth.login(userN, userPass, true);
        return;
    }

    Auth.autoAuthorization();

    // Если не авторизованы, то просим авторизовываться
    if(!Auth.isAuthorized()) {
        var dialog = new UserLoginDialog();
        dialog.setTargetUrl(window.location.href);
        dialog.build();
    }
    // Если авторизованы, то загружаем меню задач
    else {
        //Функция обратного вызова для получения списка задач пользователя
        function onGetUserTasksResult(resultXml){
            var er = HTTPServiceUtil.getError(resultXml);
            if(er !== ''){
                if(App.userTasksLoadErrorCounter > 1)
                    if(resultXml.indexOf(gis_app_55_13) != -1) {
                        --App.userTasksLoadErrorCounter;
                        reLoadUserTasks();
                        return;
                    }
                App.errorReport(gis_main55_4, er, undefined, {filename:gis_filename_110, functionname:'gis_filename_110_9'});
                return;
            }
            App.userTasksLoadErrorCounter = 0;
            //если в mdl есть .html, то остается на main_js.html, иначе редирект на main.html c теми же параметрами
            if(window.location.pathname.indexOf('main_js.html') != -1  && window.location.search.indexOf('mdl=') != -1){
                if (window.location.search.indexOf('.html') == -1){
                    window.location.href = window.location.pathname.replace('main_js.html','main.html')+window.location.search+window.location.hash;
                    return;
                }
            }
            var xml = $($.parseXML(resultXml));
            var menu = new UserSettings();
            menu.setContainer($('nav.menu-user'));
            menu.setXml(xml);
            menu.onChoice(function(task){
                App.openTask(task);
            });
            //Сохраняем экземпляр меню в App.menu
            App.menu = menu;
            // Если страница открыта без соответствующих параметров task и mdl, то откроем задачу по умолчанию
            if(!/task=([^&#\^]+)&mdl=([^&#\^]+)([^$#]*)/.test(window.location.href)) {
                var task = menu.getDefaultTask();
                if(task) {
                    App.openTask(task);
                }
                $('nav').show();
                menu.build();
            }
            // Страница загружена со всеми нужными параметрами
            else {
                menu.setMask(menu.getTaskFromUrl());
                var type = menu.getTaskType(menu.getTaskFromUrl());
                //если нашли по задаче из url её тип
                //прячем меню изначально(показываем, если тип задачи подходит)
                $('nav').hide();
                if(type !== undefined){
                    //если тип == "", то не показываем меню
                    if(type !== ''){
                        $('nav').show();
                        menu.build();
                    }
                    else{
                        fixSizes(false);
                    }
                    menu.setTitleByCurrentTask();
                }
                else{
                    //добавляем проверку, есть ли эта задачи в private/uitasks
                    fixSizes(false);
                }

                // Если авторизованы и загружено главное меню, то выясняем какой нам нужен swf
                if(Auth.isAuthorized()) {
                    //Менеджер панелей, конструирует по описанию задачи панели, в которых содержатся отдельные модули
                    $('.taskContent').append('<div class="panels" style="width:100%; height:100%; padding:0">'+gis_main55_1+'</div>');
                    //Запускаем получение описания задачи
                    var taskName = menu.getTaskFromUrl();
                    var urlMdl = menu.getMdlFromUrl();
                    var pm = new PanelManagerJson();
                    pm.setContainer($('.panels'));
                    if(urlMdl !== null && (urlMdl === 'main_js.html' || urlMdl === 'tech_schema_js.html'))
                        taskName = taskName.toLowerCase();
                    var taskMdl = menu.getTaskMdl(taskName);
                    //условие, что работаем с новой версией. Если не нашли в нижнем регистре, пробуем в верхнем
                    if(taskMdl !== null && (taskMdl === 'main_js.html' || taskMdl === 'shurf_schema_js.html' || taskMdl === 'tech_schema_js.html' )
                        || taskMdl === 'cas_js.html'
                    ){
                        App.serverQueryJSON('./Core/UITasks/'+taskName.toLowerCase()+'.json', result, fault);
                        function fault(res) {
                            App.errorReport(gis_main55_2, res, undefined, {filename:gis_filename_110, functionname:'gis_filename_110_12'});
                        }
                        function result(res) {
                            try {
                                if (res !== undefined && res.code === 200) {
                                    pm.build(res, taskName);
                                }
                            }
                            catch(ex) {
                                App.errorReport(gis_main55_2, ex.message, undefined, {filename:gis_filename_110, functionname:'gis_filename_483_6'});
                            }
                        }
                    }else{
                        //проверка, является ли задача приватной, если да, то грузим её
                        App.getJsonNode(Services.hasTaskNode, {task: taskName}, function result(res) {
                            if (res !== undefined && res.code === 200) {
                                App.getJsonNode(Services.userTaskNode, {task: taskName}, function result(res) {
                                    try {
                                        if (res !== undefined && res.code === 200) {
                                           if(res.bRoleToTasks && res.bRoleToTasks.type === 'main'){
                                               $('nav').show();
                                               menu.build();
                                           }
                                            pm.build(res, taskName);
                                        }
                                    }
                                    catch(ex) {
                                        App.errorReport(gis_main55_2, ex.message, undefined, {filename:gis_filename_110, functionname:'gis_filename_483_6'});
                                    }
                                }, function fault(res) {
                                    App.errorReport(gis_main55_2, res.message, undefined, {filename:gis_filename_110, functionname:'gis_filename_110_15'});
                                }, 'GET');
                            }
                        }, function fault(res) {
                            App.errorReport(gis_main55_2, res.message, undefined, {filename:gis_filename_110, functionname:'gis_filename_110_16'});
                        }, 'GET');
                    }
                }
                else if (menu.getTaskFromUrl().indexOf('GRID') >= 0) {
                    App.errorReport(gis_main55_3, '', {filename:gis_filename_110, functionname:'gis_filename_110_13'});
                }
            }

        }

        //Функция обратного вызова для получения списка задач пользователя
        function onGetUserTasksFail(resultXml){
            if(App.userTasksLoadErrorCounter > 1)
                if(resultXml.indexOf(gis_app_55_13) != -1) {
                    --App.userTasksLoadErrorCounter;
                    reLoadUserTasks();
                    return;
                }
            App.userTasksLoadErrorCounter = 0;
            App.errorReport(gis_main55_4, resultXml.toString(), undefined, {filename:gis_filename_110, functionname:'gis_filename_110_14'});
        }
        function reLoadUserTasks(){
            var getUserTasksParams = {user:Auth.getUserName()};
            App.serverQueryXmlFileNodeWithTries(Services.userTasksNode,getUserTasksParams, onGetUserTasksResult, onGetUserTasksFail, 'GET');
        }

        //Запускаем получение списка задач пользователя
        var getUserTasksParams = {user:Auth.getUserName()};
        App.serverQueryXmlFileNodeWithTries(Services.userTasksNode,getUserTasksParams, onGetUserTasksResult, onGetUserTasksFail, 'GET');
    }
}

App.collectUserTasks = function(response){
    var xmlTasks = $('<data></data>');
    if(response){
        response.find('tasks').each(function () {
            xmlTasks.append($(this).children());
        });
    }
    return xmlTasks
}

//Глобальный объект
HTTPServiceUtil = {};



HTTPServiceUtil.getLoginError = function (error, login) {
    if(error && error.indexOf(gis_httpserviceutil_2) !== -1)
        return gis_httpserviceutil_3+login;
    return error;
}
HTTPServiceUtil.getError = function getError(result/*Object*/) {
    var innXML;
    var errorObjectStr = '[object Object]';
    var resultErrorString = '';
    try {
        if (typeof result === 'string') {
            var resultStr = result.toString();
            if (resultStr.indexOf("<error") >= 0 || resultStr.indexOf("<critic_errors>") >= 0 ) {
                innXML = $(resultStr);//try to make xml from string
                if (innXML && innXML.length>0 && (innXML[0].nodeName.toLowerCase() === "error" || innXML[0].nodeName.toLowerCase() === "critic_errors")) {
                    resultErrorString = resultStr.replace("<error>", '').replace("</error>", '');
                    //Заменяем в результирующей строке xml-escaped последовательности на корректные читаемые символы
                    resultErrorString = resultErrorString.replace(/&apos;/g, "'").replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&');
                    if(resultErrorString.indexOf(errorObjectStr) !== -1)
                        return resultStr;
                    return resultErrorString;
                }
                //Иначе ищем в дочерних элементах
                var innChildErr = innXML.find("error, critic_errors");
                if (innChildErr && innChildErr.length > 0) {
                    return resultStr;
                }
            }
            if (resultStr.indexOf("error=") >= 0)
            {
                innXML = $(resultStr);//try to make xml from string
                var innAttrErr = innXML.find("[error]");
                if (innAttrErr && innAttrErr.length>0)
                    return resultStr;
            }
            if(resultStr.indexOf("&lt;error&gt;") >= 0 || resultStr.indexOf("&lt;critic_errors&gt;") >= 0)
                return resultStr;
            if(resultStr.indexOf("503 Service Unavailable") >= 0 || resultStr.indexOf("Service Unavailable") >= 0){
                return App.SERVER_ERRORS['Service Unavailable']+' . details=' + resultStr;
            }
            if(resultStr.indexOf("500 Internal Server Error") >= 0 || resultStr.indexOf("Internal Server Error") >= 0) {
                return App.SERVER_ERRORS['Internal Server Error'] + ' . details=' + resultStr;
            }
        }
        if (result instanceof jQuery) {
            var errorsArr = result.find("error, critic_errors, [error]");
            if (errorsArr !== undefined && errorsArr && errorsArr.length > 0){
                resultErrorString = HTTPServiceUtil.xmlToString(result);
                if(resultErrorString.indexOf(errorObjectStr) !== -1)
                    return resultStr;
                return resultErrorString;
            }
        }
    } catch (e) { }

    return resultErrorString;
};

/* Возвращает объект jQuery (XML)*/
HTTPServiceUtil.getXMLData = function getXMLData(result/*XML*/) {
    var res;
    try
    {
        res = $(result);
    }
    catch(e)
    {
        App.errorReport(gis_httpserviceutil_1+e, result.toString(), undefined, {filename:gis_filename_611, functionname:'gis_filename_611_1'});
        return null;
    }
    return res;
};

HTTPServiceUtil.getStringData = function getStringData(result/*XML*/) {
    return result.toString();
};

HTTPServiceUtil.xmlToString = function(xmlData) { // this functions waits jQuery XML
    var xmlString = undefined;

    if (window.ActiveXObject){
        xmlString = xmlData[0].xml;
    }

    if (xmlString === undefined)
    {
        var oSerializer = new XMLSerializer();
        xmlString = oSerializer.serializeToString(xmlData[0]);
    }
    if (xmlString === undefined)
    {
        xmlString = xmlData[0].outerHTML;
        /*var oSerializer = new XMLSerializer();
         xmlString = oSerializer.serializeToString(xmlData[0]);*/
    }
    return xmlString;

    var xmlString = undefined;
    if (window && window.ActiveXObject){
        /*xmlString = xmlData[0].xml;*/
        xmlString = xmlData[0].outerHTML;
    }
    if (xmlString === undefined)
    {
        xmlString = xmlData[0].outerHTML;
        /*var oSerializer = new XMLSerializer();
         xmlString = oSerializer.serializeToString(xmlData[0]);*/
    }
    return xmlString;
};

/* Функция проверки существования файла на сервере */
HTTPServiceUtil.isUrlExists = function isUrlExists(url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', url, false);
    http.send();
    return http.status !== 404 && http.status !== 403; /* можно доработать, включив проверку статусов вроде 200 (успешно скачан) и других */
};

/**
 * Функция открытия файла
 * @param fileName
 * @param options
 */
HTTPServiceUtil.openFile = function (fileName, options) {
    var target = (options && options.target)? options.target : '_blank';
    var parentDir = (options && options.parentDir)? options.parentDir : '';
    var errMessage = (options && options.errMessage)? options.errMessage : gis_core_error_5;
    //если для разных открытий файлов используются разные имена
    var specificPdfFileName = (options && options.specificPdfFileName)? options.specificPdfFileName : fileName;
    //var link = window.location.protocol+'//'+window.location.host+'/'+fileName;
    if(fileName.indexOf('.pdf#') === -1){//если в url не содержится .pdf#, значит нужно выполнить запрос на генерацию картинки
        //для обычных файлов добавляем возможность указывать родительскую директорию. Например, Public/Data/LIB
        fileName = parentDir + fileName;
        if (HTTPServiceUtil.isUrlExists(fileName))
            window.open(fileName, target);
        else
            App.confirmDialog(errMessage, null, {title: gis_core_1});
    }
    else{
        fileName = specificPdfFileName;
        App.getJsonNode(Services.pdfConvert, {file_name: fileName.replace('#','$')},
            function (result) {
                if (result !== undefined && result.status === 200) {
                    if (result.generated_file !== undefined) {
                        HTTPServiceUtil.openFile(result.generated_file, {errMessage: gis_core_error_6});
                    }
                }
            },
            function (resultXML) {
                //Снимаем курсор ожидания
                var er = HTTPServiceUtil.getError(resultXML);
                App.errorReport(errMessage, er, undefined, {filename:gis_filename_611, functionname:'gis_filename_611_3'});
            }, 'GET');
    }
};
//Глобальный объект
ExportUtil = {};

//константы
ExportUtil.GPX = gis_exportutil_1;
ExportUtil.KML = gis_exportutil_2;
ExportUtil.RESULT_TITLE_TEXT = gis_exportutil_3;
ExportUtil.RESULT_GPX_TEXT = gis_exportutil_4;

ExportUtil.RESULT_KML_TEXT = gis_exportutil_5;

ExportUtil.NO_GEO = gis_exportutil_6;
ExportUtil.INCORRECT_GEO = gis_exportutil_7;

ExportUtil.EXPORT_EXCEL_ERROR = gis_exportutil_8;
ExportUtil.EXPORT_EXCEL_EMPTY_DATA_ERROR = gis_exportutil_9;
ExportUtil.EXPORT_WRL_ERROR = gis_exportutil_10;
ExportUtil.EXPORT_IMG_ERROR = gis_exportutil_11;
ExportUtil.PACK_IMG_ERROR = gis_exportutil_12;
ExportUtil.PACK_FILES_AND_DIRS_ERROR = gis_exportutil_13;

/**
 * Общие функции для экспорта
 * */
//Формирование запроса для вызова UTEService
ExportUtil.makeUTETaskServiceDataReqParams = function makeUTETaskServiceDataReqParams(templateName, inputData) {
    return {
        templateName: templateName,
        input: inputData
    };
};
//Формирование запроса для вызова PackIMG
ExportUtil.makePackIMGServiceDataReqParams = function makePackIMGServiceDataReqParams(fileName, imgRelatePath) {
    return {
        outFile: fileName,
        inList: imgRelatePath
    };
};
//Формирование запроса для вызова PackFiles (упаковка файлов и директорий в один архив)
//Пример строки файлов для выгрузки: "LIB\МГ Миннибаево-Казань\Переезды через газопровод.pdf@LIB\МГ Миннибаево-Казань\Приказы на присвоении клейма сварщикам, списки сварщиков.pdf"
ExportUtil.makePackFilesServiceDataReqParams = function makePackFilesServiceDataReqParams(inFilesOrDirs, outFile) {
    return {
        inFilesOrDirs: inFilesOrDirs,
        outFile: outFile
    };
};
//Получение адреса сайта без html-страницы, т.е. 'http://site_address/'
ExportUtil.getCurrentUrl = function getCurrentUrl() {
    var curUrl = getURL(); //получить URL без параметров в строке
    //Обрезаем последний символ '#' и всё после него, он относился к авторизации
    if (curUrl.lastIndexOf("#") != -1) curUrl = curUrl.substr(0, curUrl.lastIndexOf("#"));
    //Убираем последнюю ссылку на html-страницу, нам нужен путь, оканчивающийся на /
    curUrl = curUrl.substr(0, curUrl.lastIndexOf("/") + 1);
    return curUrl;
};

/**
 * Функции для экспорта в GPX или KML
 * */
ExportUtil.exportFinalObjectsFromXML = function(objs /*XMLList, но тут наверняка будет array*/, type /*String = ExportUtil.GPX*/) {
    if (objs.length > 0){
        // если получили идентификаторы, то выгружаем их
        var gpx = null;
        var kml = null;
        var boundsObj = {};
        boundsObj.minX = Number.POSITIVE_INFINITY;
        boundsObj.minY = Number.POSITIVE_INFINITY;
        boundsObj.maxX = Number.NEGATIVE_INFINITY;
        boundsObj.maxY = Number.NEGATIVE_INFINITY;

        var today = new Date();
        //Формат даты - 'YYYY-MM-DDT00:00:00Z'
        function pad(number) {
            if ( number < 10 ) {
                return '0' + number;
            }
            return number;
        }
        //Получаем собственно время в нужном формате
        //upd06.06.18 решено выставлять дату всегда одну дату 10:00:00
        var time = today.getUTCFullYear() + '-' + pad( today.getUTCMonth() + 1 ) + '-' + pad( today.getUTCDate() )
            + 'T10:00:00'
            /*+ '.' + (today.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5)*/ /*раскомментировать, если нужно уточнение до 'YYYY-MM-DDT00:00:00.000Z'*/
            + 'Z';

        var ii;
        switch(type)
        {
            case ExportUtil.GPX:
            {
                var finalGpx = '<gpx xmlns="http://www.topografix.com/GPX/1/1" creator="MapSource 6.11.6" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">';
                for (ii = 0; ii < objs.length; ii++)
                {
                    var xmlObj/*:XML*/ = objs[ii];
                    var wktStr = xmlObj.hasOwnProperty('WKT') ? xmlObj.WKT : "";
                    var format = new ol.format.WKT();
                    try{
                        var geom = format.readGeometry(wktStr);
                    }catch (e) {
                        format = new map.format.WKT({dimension: 3});
                        geom = format.readGeometry(wktStr);
                    }
                            /*'POLYGON((10.689697265625 -25.0927734375, 34.595947265625 ' +
                            '-20.1708984375, 38.814697265625 -35.6396484375, 13.502197265625 ' +
                            '-39.1552734375, 10.689697265625 -25.0927734375))');*/
                    if(!gpx) gpx = "";
                        /*gpx = '<gpx xmlns="http://www.topografix.com/GPX/1/1" creator="MapSource 6.11.6" version="1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd">';*/
                    if (geom){
                        var objName = xmlObj.hasOwnProperty('LABEL') ? xmlObj.LABEL : "";
                        var gType = geom.getType();

                        //Пересчитываем общую рамку
                        var curExtent = geom.getExtent(); //[minx, miny, maxx, maxy]
                        if (curExtent && curExtent.length==4) {
                            boundsObj.minX = Math.min(curExtent[0], boundsObj.minX);
                            boundsObj.minY = Math.min(curExtent[1], boundsObj.minY);
                            boundsObj.maxX = Math.max(curExtent[2], boundsObj.maxX);
                            boundsObj.maxY = Math.max(curExtent[3], boundsObj.maxY);
                        }
                        var i,g;
                        switch (gType){
                            // точечный
                            case "Point":
                                gpx += ExportUtil.addPointGPX(geom, objName, time);
                                break;
                            case "MultiPoint":
                                var points = geom.getPoints();
                                for (i = 0; i<points.length; i++) {
                                    g = points[i];
                                    gpx += ExportUtil.addPointGPX(g, objName+"_"+i.toString(), time);
                                }
                                break;
                            // линейный
                            case "LineString":
                                gpx += ExportUtil.addLineGPX(geom, objName, time);
                                break;
                            case "MultiLineString":
                                var lineStrings = geom.getLineStrings();
                                for (i = 0; i<lineStrings.length; i++) {
                                    g = lineStrings[i];
                                    gpx += ExportUtil.addLineGPX(g, objName+"_"+i.toString(), time);
                                }
                                break;
                            case "Polygon":
                            case "MultiPolygon":
                                // площадной
                                var pix = ol.extent.getCenter(geom.getExtent());
                                var pp = new ol.geom.Point(pix);
                                gpx += ExportUtil.addPointGPX(pp, objName, time);
                                break;
                        }
                    }
                    else{
                        App.errorReport(ExportUtil.INCORRECT_GEO, ExportUtil.INCORRECT_GEO, undefined, {filename:gis_filename_594, functionname:'gis_filename_594_1'});
                    }
                }
                var meta = '<metadata><link href="http://www.garmin.com"><text>Garmin International</text></link><time>'+time+'</time>' +
                            '<bounds maxlat="'+boundsObj.maxY+'" maxlon="'+boundsObj.maxX+'" minlat="'+boundsObj.minY+'" minlon="'+boundsObj.minX+'"/></metadata>';
                /*gpx += meta + '</gpx>';
                var finalContext = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>' + gpx;*/
                finalGpx += meta + gpx + '</gpx>';
                var finalContext = '<?xml version="1.0" encoding="UTF-8" standalone="no" ?>' + finalGpx;
                return finalContext;
            }
            case ExportUtil.KML:
            {
                kml = '<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">';
                //FF00008B - dark red для kml файла. Почему-то не RGB формат, а BGR
                var document = '<Document><Style id="lineStyle"><LineStyle><color>FF00008B</color><width>4</width></LineStyle></Style>';
                var addKml = "";
                for (ii = 0; ii < objs.length; ii++){
                    var xmlObj/*:XML*/ = objs[ii];
                    var wktStr = xmlObj.hasOwnProperty('WKT') ? xmlObj.WKT : "";
                    var format = new ol.format.WKT();
                    try{
                        var geom = format.readGeometry(wktStr);
                    }catch (e) {
                        format = new map.format.WKT({dimension: 3});
                        geom = format.readGeometry(wktStr);
                    }
                    if (geom){
                        var objName = xmlObj.hasOwnProperty('LABEL') ? xmlObj.LABEL : "";
                        var gType = geom.getType();
                        var i,g;
                        switch (gType) {
                            // точечный
                            case "Point":
                                document += ExportUtil.addPointKML(geom, objName);
                                break;
                            case "MultiPoint":
                                var points = geom.getPoints();
                                for (i = 0; i<points.length; i++) {
                                    g = points[i];
                                    document += ExportUtil.addPointKML(g, objName+"_"+i.toString());
                                }
                                break;
                            // линейный
                            case "LineString":
                                document += ExportUtil.addLineKML(geom, objName);
                                break;
                            case "MultiLineString":
                                var lineStrings = geom.getLineStrings();
                                for (i = 0; i<lineStrings.length; i++) {
                                    g = lineStrings[i];
                                    document += ExportUtil.addLineKML(g, objName+"_"+i.toString());
                                }
                                break;
                            case "Polygon":
                            case "MultiPolygon":
                                // площадной
                                var pix = ol.extent.getCenter(geom.getExtent());
                                var pp = new ol.geom.Point(pix);
                                document += ExportUtil.addPointKML(pp, objName);
                                break;
                        }
                    }
                    else{
                        App.errorReport(ExportUtil.INCORRECT_GEO, ExportUtil.INCORRECT_GEO, undefined, {filename:gis_filename_594, functionname:'gis_filename_594_2'});
                    }
                }
                //Закрываем тег документа
                kml += document + '</Document>';
                //Добавляем остальные элементы, которые идут в самом kml
                kml += addKml + '</kml>';

                var finalContextKml = '<?xml version="1.0" encoding="UTF-8" ?>' + kml;
                return finalContextKml;
            }
            default: break;
        }
    }
    else
    {
        App.errorReport(ExportUtil.NO_GEO, ExportUtil.NO_GEO, undefined, {filename:gis_filename_594, functionname:'gis_filename_594_3'});
    }
    return "";
};

//Получение строки из XML
ExportUtil.xmlToString = function(xmlData) { // this functions waits jQuery XML
    var xmlString = undefined;

    if (window.ActiveXObject){
        xmlString = xmlData[0].xml;
    }

    if (xmlString === undefined)
    {
        var oSerializer = new XMLSerializer();
        xmlString = oSerializer.serializeToString(xmlData[0]);
    }
    if (xmlString === undefined)
    {
        xmlString = xmlData[0].outerHTML;
        /*var oSerializer = new XMLSerializer();
         xmlString = oSerializer.serializeToString(xmlData[0]);*/
    }
    return xmlString;

    var xmlString = undefined;
    if (window && window.ActiveXObject){
        /*xmlString = xmlData[0].xml;*/
        xmlString = xmlData[0].outerHTML;
    }
    if (xmlString === undefined)
    {
        xmlString = xmlData[0].outerHTML;
        /*var oSerializer = new XMLSerializer();
        xmlString = oSerializer.serializeToString(xmlData[0]);*/
    }
    return xmlString;
};

//Добавление очередной точки в xml для GPX
ExportUtil.addPointGPX = function(geoObj/*ol.Geom.Point*/, name/*:String*/, time/*:String*/, res/*:XML*/, boundsObj/*:Object*/) {
    if (geoObj == null) return "";
    var p = {x:geoObj.flatCoordinates[0], y:geoObj.flatCoordinates[1]};
    if(App.projection === GeoUtil.PROJS.Pulkovo42)
        p = GeoUtil.P42WGS(p["y"], p["x"]);
    var res = '<wpt lat="' + p.y + '" lon="' + p.x + '"><time>' + time + '</time><name>' + name + '</name><sym>Flag, Blue</sym></wpt>';
    return res;
};

//Добавление очередной линии в xml для GPX
ExportUtil.addLineGPX = function(geoObj/*ol.geom.LineString*/, name/*:String*/, time/*:String*/, res/*:XML*/, boundsObj/*:Object*/) {
    if (geoObj == null)
        return "";
    var trk = '<trk><name>' + name + '</name>' +
    '<extensions><gpxx:TrackExtension xmlns:gpxx="http://www.garmin.com/xmlschemas/GpxExtensions/v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/GpxExtensions/v3 http://www.garmin.com/xmlschemas/GpxExtensions/v3/GpxExtensionsv3.xsd">' +
    '<gpxx:DisplayColor>DarkRed</gpxx:DisplayColor></gpxx:TrackExtension></extensions>';
    var trkP = '<trkseg>';
    for (var i = 0; i< geoObj.flatCoordinates.length; i+=geoObj.stride)
    {
        var p = {x:geoObj.flatCoordinates[i], y:geoObj.flatCoordinates[i+1]};
        if(App.projection === GeoUtil.PROJS.Pulkovo42)
            p = GeoUtil.P42WGS(p["y"], p["x"]);
        trkP += '<trkpt lat="' + p.y + '" lon="' + p.x + '"><time>' + time + '</time></trkpt>';
    }
    trkP += '</trkseg>';
    trk += trkP + '</trk>';
    return trk;
};

//Добавление очередной точки в xml для KML
ExportUtil.addPointKML = function(geoObj/*ol.Geom.Point*/, name/*:String*/, res/*:XML*/) {
    if (geoObj == null)
        return "";
    //Проекция геоданных из БД
    var dataProjection = App.projection;
    var p = {x:geoObj.flatCoordinates[0], y:geoObj.flatCoordinates[1]};
    if(dataProjection === GeoUtil.PROJS.Pulkovo42){
        p = GeoUtil.P42WGS(p["y"], p["x"]);
    }
    var placemark = '<Placemark><name>' + name + '</name><description>' + name + '</description><Point><coordinates>' + p.x + ',' + p.y + ',0</coordinates></Point></Placemark>';
    return placemark;
};

//Добавление очередной линии в xml для KML
ExportUtil.addLineKML = function(geoObj/*ol.geom.LineString*/, name/*:String*/, res/*:XML*/) {
    if (geoObj == null)
        return "";
    var placemark = '<Placemark><name>' + name + '</name><description>' + name + '</description>';
    var coords = [];
    var lineString = '<LineString><tessellate>1</tessellate>';
    for (var i = 0; i < geoObj.flatCoordinates.length; i+=geoObj.stride)
    {
        var p = {x:geoObj.flatCoordinates[i], y:geoObj.flatCoordinates[i+1]};
        if(App.projection === GeoUtil.PROJS.Pulkovo42)
            p = GeoUtil.P42WGS(p["y"], p["x"]);
        coords.push(p.x);//longitude долгота
        coords.push(p.y);//latitude широта
        coords.push(0);//altitude  высота
    }
    var coordXml = '<coordinates>' + coords.toString() + '</coordinates>';
    lineString += coordXml + '</LineString>';
    var styleXml = '<styleUrl>#lineStyle</styleUrl>';
    placemark += styleXml + lineString + '</Placemark>';
    return placemark;
};

/**
 * Функции для экспорта в Excel
 * */
//Переменная хранит последнее имя генерируемого файла
ExportUtil.exportExcelFileName = "";


/**
 * Экспорт в Excel пикетаза из административной задачи
 * @param dataArray
 * @param fileName
 * @param excelTemplate
 * @param requestSource
 */
ExportUtil.exportAdmPicketingToExcel = function exportFinalXML(dataArray, excelTemplate, requestSource) {
	var alertForm, requestParams;
	if (dataArray !== undefined && dataArray.length>0) {
        /* Групповой экспорт:
         * templateName DATA_LAY_Exp.xml
         * input <input file_name="Public\Data\TAB\8135B2A5-1AF8-805E-E727-2D164400319B.xls" template="server_export" data="&lt;root>&#xA;  &lt;data LINE_ID_FILTER=&quot;1300347,1300064,1300066,1300067,1300069,1300348,1300070,1300350,1300071,1300079,1300080,1300029,1300376,1300351,1300032,1300341,1300035,1300081,1300377,1300082,1300084,1300352,1300085,1300086,1300378,1300088,1300089,1300353,1300342,1300092,1300036,1300037,1300094,1300096,1300097,1300098,1300354,1300379,1300099,1300100,1300102,1300104,1300380,1300381,1300382,1300106,1300028,1300107,1300355,1300109,1300111,1300113,1300356,1300115,1300436,1300357,1300117,1300023,1300119,1300384,1300385,1300120,1300386,1300387,1300388,1300063,1300358,1300389,1300359,1300123,1300344,1300360,1300345,1300441,1300125,1300126,1300128,1300439,1300130,1300132,1300134,1300440,1300034,1300031,1300136,1300138,1300390,1300039,1300139,1300361,1300391,1300141,1300033,1300143,1300145,1300392,1300146,1300026,1300393,1300362,1300030,1300147,1300394,1300395,1300363,1300396,1300149,1300397,1300151,1300398,1300153,1300399,1300364,1300365,1300154,1300156,1300400,1300157,1300366,1300402,1300159,1300060,1300061,1300403,1300162,1300404,1300164,1300167,1300169,1300171,1300405,1300172,1300173,1300174,1300175,1300176,1300178,1300406,1300179,1300181,1300183,1300187,1300199,1300221,1300233,1300237,1300059,1300253,1300257,1300261,1300265,1300277,1300279,1300291,1300370,1300293,1300407,1300018,1300019,1300447,1300375,1300408,1300409,1300410,1300411,1300295,1300412,1300413,1300371,1300414,1300297,1300415,1300299,1300416,1300003,1300004,1300005,1300020,1300027,1300300,1300417,1300302,1300303,1300418,1300419,1300420,1300304,1300421,1300422,1300423,1300424,1300425,1300426,1300346,1300305,1300306,1300434,1300435,1300006,1300007,1300427,1300307,1300308,1300309,1300312,1300313,1300314,1300315,1300428,1300316,1300429,1300317,1300318,1300319,1300320,1300321,1300430,1300431,1300322,1300323,1300324,1300373,1300432,1300325,1300000,1300327,1300433,1300329,1300330,1300331,1300332,1300012,1300017,1300013,1300016,1300014,1300015,1300025,1300024,1300334,1300001,1300021,1300002,1300022,1300008,1300011,1300009,1300010,0&quot; ROUTE_TYPE_FILTER=&quot;'ROUTE_TYPE_12','ROUTE_TYPE_10','ROUTE_TYPE_03','ROUTE_TYPE_04','ROUTE_TYPE_11','ROUTE_TYPE_02','ROUTE_TYPE_01','UNKNOWN'&quot; OLD_LPU_ACCESS_FILTER=&quot;13006,13022,13009,13011,13004,13003,13000,13023,13008,13013,13002,13005,13001,13007,13021,0&quot; FILTER=&quot;8=8 AND ID IN (1301709,1300249)&quot; LPU_ACCESS_FILTER=&quot;13006,13022,13009,13011,13004,13003,13000,13023,13008,13013,13002,13005,13001,13007,13021,0&quot;/>&#xA;&lt;/root>" keep_files="true" ext_data_id="PODS_GRID.XML#PODS_ROUTE"/>
         * */
        /* Экспорт одного объекта
         * templateName DATA_LAY_Exp.xml
         * input <input file_name="Public\Data\TAB\B6CC9B4C-A9EF-8378-02B1-2D1A50BB73CF.xls" template="PODS_ROUTE" data="&lt;root>&#xA;  &lt;data LINE_ID=&quot;1300000&quot; OPERATING_STATUS_GCL=&quot;ACTIVE&quot; SRV_DISTRICT_ID=&quot;13006&quot; ID=&quot;1301709&quot; TYPE_LBL=&quot;Магистральный&quot; ROUTE_TYPE_CL=&quot;ROUTE_TYPE_10&quot; mx_internal_uid=&quot;F6052EAE-5832-1190-E3E5-2D159C634C63&quot; SYS_OBJ_ID=&quot;1301709&quot; RWN=&quot;1&quot; DESCRIPTION=&quot;СРТО-Урал&quot; STATION_BEG=&quot;1690&quot; FILTER=&quot;ID=1301709&quot; STATION_END=&quot;1840&quot;/>&#xA;&lt;/root>" keep_files="true" ext_data_id="PODS_EXPORT.xml#PODS_ROUTE"/>
         * */
		//генерируем UID для текущей выгрузки
		var currentUID = App.generateUUID();
		var itemXmlEscaped = '&lt;root>';
		for(var i = 0;i < dataArray.length; i++){
			itemXmlEscaped += ExportUtil.Obj2StrXML(dataArray[i], 'data');
		}
		itemXmlEscaped += '&lt;/root>';

		//формируем  шаблон для задачи AA
		var resFileName = 'Public/Data/TAB/'+currentUID+'.xls';
		ExportUtil.exportExcelFileName = resFileName;
		//Формируем команду на выполнение сервису
		var inputData = '<input file_name="'+resFileName+'" template="'+excelTemplate+'" data="'+itemXmlEscaped+'" keep_files="true" ext_data_id="'+requestSource+'"/>';
		if (requestSource=="export") {
			inputData = '<input file_name="'+resFileName+'" template="export" data="'+itemXmlEscaped+'" keep_files="true"/>';
		}
		alertForm = new AlertForm();
		alertForm.build("utilExportExcelAlertForm",gis_exportutil_14,gis_core_1,AlertForm.OK);
		//Добавляем слушатель закрытия формы
		$("body").on(CloseEvent.CLOSE, function gridExportLimitAlertFormClose(evt/*CloseEvent*/) {
			$("body").off(CloseEvent.CLOSE);
			if (evt && evt.detail == 1) {
				var processExportForm = new ProcessExportExcelForm();
				processExportForm.inputData = inputData;
				//Собственно создаем форму
				processExportForm.build();
			}
		});
	}
	else{
		App.confirmDialog(ExportUtil.EXPORT_EXCEL_EMPTY_DATA_ERROR);
	}
};

ExportUtil.exportToExcel = function exportFinalXML(dataArray, fileName, excelTemplate, requestSource, topFilter, extendedExport) {
    var alertForm, requestParams;

    if (dataArray && dataArray.length>0) {
        /* Групповой экспорт:
         * templateName DATA_LAY_Exp.xml
         * input <input file_name="Public\Data\TAB\8135B2A5-1AF8-805E-E727-2D164400319B.xls" template="server_export" data="&lt;root>&#xA;  &lt;data LINE_ID_FILTER=&quot;1300347,1300064,1300066,1300067,1300069,1300348,1300070,1300350,1300071,1300079,1300080,1300029,1300376,1300351,1300032,1300341,1300035,1300081,1300377,1300082,1300084,1300352,1300085,1300086,1300378,1300088,1300089,1300353,1300342,1300092,1300036,1300037,1300094,1300096,1300097,1300098,1300354,1300379,1300099,1300100,1300102,1300104,1300380,1300381,1300382,1300106,1300028,1300107,1300355,1300109,1300111,1300113,1300356,1300115,1300436,1300357,1300117,1300023,1300119,1300384,1300385,1300120,1300386,1300387,1300388,1300063,1300358,1300389,1300359,1300123,1300344,1300360,1300345,1300441,1300125,1300126,1300128,1300439,1300130,1300132,1300134,1300440,1300034,1300031,1300136,1300138,1300390,1300039,1300139,1300361,1300391,1300141,1300033,1300143,1300145,1300392,1300146,1300026,1300393,1300362,1300030,1300147,1300394,1300395,1300363,1300396,1300149,1300397,1300151,1300398,1300153,1300399,1300364,1300365,1300154,1300156,1300400,1300157,1300366,1300402,1300159,1300060,1300061,1300403,1300162,1300404,1300164,1300167,1300169,1300171,1300405,1300172,1300173,1300174,1300175,1300176,1300178,1300406,1300179,1300181,1300183,1300187,1300199,1300221,1300233,1300237,1300059,1300253,1300257,1300261,1300265,1300277,1300279,1300291,1300370,1300293,1300407,1300018,1300019,1300447,1300375,1300408,1300409,1300410,1300411,1300295,1300412,1300413,1300371,1300414,1300297,1300415,1300299,1300416,1300003,1300004,1300005,1300020,1300027,1300300,1300417,1300302,1300303,1300418,1300419,1300420,1300304,1300421,1300422,1300423,1300424,1300425,1300426,1300346,1300305,1300306,1300434,1300435,1300006,1300007,1300427,1300307,1300308,1300309,1300312,1300313,1300314,1300315,1300428,1300316,1300429,1300317,1300318,1300319,1300320,1300321,1300430,1300431,1300322,1300323,1300324,1300373,1300432,1300325,1300000,1300327,1300433,1300329,1300330,1300331,1300332,1300012,1300017,1300013,1300016,1300014,1300015,1300025,1300024,1300334,1300001,1300021,1300002,1300022,1300008,1300011,1300009,1300010,0&quot; ROUTE_TYPE_FILTER=&quot;'ROUTE_TYPE_12','ROUTE_TYPE_10','ROUTE_TYPE_03','ROUTE_TYPE_04','ROUTE_TYPE_11','ROUTE_TYPE_02','ROUTE_TYPE_01','UNKNOWN'&quot; OLD_LPU_ACCESS_FILTER=&quot;13006,13022,13009,13011,13004,13003,13000,13023,13008,13013,13002,13005,13001,13007,13021,0&quot; FILTER=&quot;8=8 AND ID IN (1301709,1300249)&quot; LPU_ACCESS_FILTER=&quot;13006,13022,13009,13011,13004,13003,13000,13023,13008,13013,13002,13005,13001,13007,13021,0&quot;/>&#xA;&lt;/root>" keep_files="true" ext_data_id="PODS_GRID.XML#PODS_ROUTE"/>
         * */
        /* Экспорт одного объекта
        * templateName DATA_LAY_Exp.xml
        * input <input template="PODS_ROUTE" ext_data_id="PODS_EXPORT.xml#PODS_ROUTE" data="&lt;root>&#xA;  &lt;data LINE_ID=&quot;1300000&quot; OPERATING_STATUS_GCL=&quot;ACTIVE&quot; SRV_DISTRICT_ID=&quot;13006&quot; ID=&quot;1301709&quot; TYPE_LBL=&quot;Магистральный&quot; ROUTE_TYPE_CL=&quot;ROUTE_TYPE_10&quot; mx_internal_uid=&quot;F6052EAE-5832-1190-E3E5-2D159C634C63&quot; SYS_OBJ_ID=&quot;1301709&quot; RWN=&quot;1&quot; DESCRIPTION=&quot;СРТО-Урал&quot; STATION_BEG=&quot;1690&quot; FILTER=&quot;ID=1301709&quot; STATION_END=&quot;1840&quot;/>&#xA;&lt;/root>" keep_files="true" file_name="Public\Data\TAB\B6CC9B4C-A9EF-8378-02B1-2D1A50BB73CF.xls" />
        * */
        //генерируем UID для текущей выгрузки
        var currentUID = App.generateUUID();
        var itemXmlEscaped = '&lt;root>';
        var filterStr = "ID IN (";
        var propertiesStr = "";
        for (var i = 0; i < dataArray.length; i++) {
            if(!dataArray[i]["ID"] && requestSource !== "export")
                continue;
            filterStr += dataArray[i]["ID"];
            //К последнему ID сзади запятую не добавляем
            if (i < dataArray.length-1) {
                filterStr += ",";
            }
            //Добавляем остальные атрибуты только при экспорте одиночной записи
            if (excelTemplate !== "server_export") {
                if (requestSource === "export") {
                    //Просто выгрузка строки с русским текстом атрибутов
                    $.each(dataArray[i], function (index, value) {
                        var propValEscaped = value.replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/&/g, '&amp;');
                        propertiesStr += index + '=&quot;' + propValEscaped + '&quot; ';
                    });
                } else {
                    $.each(dataArray[i], function (index, value) {
                        var propValEscaped = value.replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/&/g, '&amp;');
                        propertiesStr += index.toUpperCase() + '=&quot;' + propValEscaped + '&quot; ';
                    });
                    //Добавляем особые атрибуты которые хз зачем нужны но без них не работает
                    propertiesStr += 'SYS_OBJ_ID=&quot;' + dataArray[i]["ID"] + '&quot; ';
                    //propertiesStr += 'mx_internal_uid=&quot;4F019BC1-3901-E875-1249-0C5760BB5B9E&quot ';
                }
            }
        }
        filterStr += ")";
        if(filterStr === 'ID IN ()')// если не нашли ни одного ID, то не экспортируем в excel
            return;
        //Если экспортируем один объект - меняем FILTER="ID IN ()" на FILTER="ID=value"
        if (excelTemplate!="server_export" && !extendedExport)
            filterStr = "ID="+dataArray[0]["ID"];
        if (requestSource=="export") {
            itemXmlEscaped += '&lt;data '+propertiesStr+'/>';
        } else {
            if(extendedExport)propertiesStr = '';// если расширенный экспорт, то не передает доп. атрибуты, только выбранные идентификаторы в фильтре
            itemXmlEscaped += '&lt;data FILTER=&quot;'+filterStr+'&quot; '+propertiesStr+'/>'; //атрибут filter обязательно должен быть в верхнем регистре!!!
        }
        itemXmlEscaped += '&lt;/root>';

        //формируем  шаблон для задачи AA
        var resFileName = 'Public/Data/TAB/'+currentUID+'.xls';
        ExportUtil.exportExcelFileName = resFileName;
        //Формируем команду на выполнение сервису
        var inputData = '<input file_name="'+resFileName+'" template="'+excelTemplate+'" data="'+itemXmlEscaped+'" keep_files="true" ext_data_id="'+requestSource+'"/>';
        if (requestSource=="export") {
            inputData = '<input file_name="'+resFileName+'" template="export" data="'+itemXmlEscaped+'" keep_files="true"/>';
        }

        alertForm = new AlertForm();
        alertForm.build("utilExportExcelAlertForm",gis_exportutil_14,gis_core_1,AlertForm.OK);
        //Добавляем слушатель закрытия формы
        $("body").on(CloseEvent.CLOSE, function gridExportLimitAlertFormClose(evt/*CloseEvent*/) {
            $("body").off(CloseEvent.CLOSE);
            if (evt && evt.detail == 1) {
                var processExportForm = new ProcessExportExcelForm();
                processExportForm.inputData = inputData;
                //Собственно создаем форму
                processExportForm.build();
            }
        });


    }
    else{
        if(topFilter !== undefined || extendedExport !== undefined){
            //генерируем UID для текущей выгрузки
            var currentUID = App.generateUUID();
            var item = $('<root></root>');
            var child = ExportUtil.Obj2XML(topFilter, 'data');
            child.appendTo(item);
            var itemStr = ExportUtil.xmlToString(item);
            //переводим атрибуты в верхний регистр, хардкод
            itemStr = itemStr.replace('lpu_access_filter','LPU_ACCESS_FILTER');
            itemStr = itemStr.replace('ili_insp_filter','ILI_INSP_FILTER');
            itemStr = itemStr.replace('route_type_filter','ROUTE_TYPE_FILTER');
            itemStr = itemStr.replace('line_id_filter','LINE_ID_FILTER');

            var itemXmlEscaped = itemStr.xmlEscape();
            //формируем  шаблон для задачи AA
            var resFileName = 'Public/Data/TAB/'+currentUID+'.xls';
            ExportUtil.exportExcelFileName = resFileName;
            //Формируем команду на выполнение сервису
            var inputData = '<input file_name="'+resFileName+'" template="'+excelTemplate+'" data="'+itemXmlEscaped+'" keep_files="true" ext_data_id="'+requestSource+'"/>';
            //Добавляем слушатель закрытия формы
            alertForm = new AlertForm();
            alertForm.build("utilExportExcelAlertForm",gis_exportutil_14,gis_core_1,AlertForm.OK);
            $("body").on(CloseEvent.CLOSE, function gridExportLimitAlertFormClose(evt/*CloseEvent*/) {
                $("body").off(CloseEvent.CLOSE);
                if (evt && evt.detail == 1) {
                    var processExportForm = new ProcessExportExcelForm();
                    processExportForm.inputData = inputData;
                    //Собственно создаем форму
                    processExportForm.build();
                }
            });
        }
    }
};

ExportUtil.exportShurfToExcel = function (dataArray, fileName, excelTemplate, requestSource, topFilter) {
    var alertForm;
    if (dataArray && dataArray.length>0) {
         //генерируем UID для текущей выгрузки
        var currentUID = App.generateUUID();
        var itemXmlEscaped = '&lt;root>';
        var propertiesStr = "";
        var ids = [];
        for (var i = 0; i < dataArray.length; i++) {
            //добавляем только идентификаторы выбранных объектов
            ids.push(dataArray[i]["ID"]);
        }
        propertiesStr += 'SYS_OBJ_ID=&quot;' + ids.join() + '&quot; ';
        itemXmlEscaped += '&lt;data '+propertiesStr+'/>&lt;/root>';

        //формируем  шаблон для задачи AA
        var resFileName = 'Public/Data/TAB/'+currentUID+'.xls';
        ExportUtil.exportExcelFileName = resFileName;
        //Формируем команду на выполнение сервису
        var inputData = '<input file_name="'+resFileName+'" template="'+excelTemplate+'" data="'+itemXmlEscaped+'" keep_files="true" ext_data_id="'+requestSource+'"/>';
        if (requestSource=="export") {
            inputData = '<input file_name="'+resFileName+'" template="export" data="'+itemXmlEscaped+'" keep_files="true"/>';
        }

	    alertForm = new AlertForm();
	    alertForm.build("utilExportExcelAlertForm",gis_exportutil_14,gis_core_1,AlertForm.OK);
	    //Добавляем слушатель закрытия формы
	    $("body").on(CloseEvent.CLOSE, function gridExportLimitAlertFormClose(evt/*CloseEvent*/) {
		    $("body").off(CloseEvent.CLOSE);
		    if (evt && evt.detail == 1) {
			    var processExportForm = new ProcessExportExcelForm();
			    processExportForm.inputData = inputData;
			    //Собственно создаем форму
			    processExportForm.build();
		    }
	    });
    }
};

/**
 * Экспорт в Excel из справочника
 * @param dataArray
 * @param fileName
 * @param excelTemplate
 * @param requestSource
 */
ExportUtil.exportToExcelFromDirectory = function exportFinalXML(dataArray, fileName, excelTemplate, requestSource) {
    var alertForm, requestParams;
    if (dataArray !== undefined && dataArray.length>0) {
        /* Групповой экспорт:
         * templateName DATA_LAY_Exp.xml
         * input <input file_name="Public\Data\TAB\8135B2A5-1AF8-805E-E727-2D164400319B.xls" template="server_export" data="&lt;root>&#xA;  &lt;data LINE_ID_FILTER=&quot;1300347,1300064,1300066,1300067,1300069,1300348,1300070,1300350,1300071,1300079,1300080,1300029,1300376,1300351,1300032,1300341,1300035,1300081,1300377,1300082,1300084,1300352,1300085,1300086,1300378,1300088,1300089,1300353,1300342,1300092,1300036,1300037,1300094,1300096,1300097,1300098,1300354,1300379,1300099,1300100,1300102,1300104,1300380,1300381,1300382,1300106,1300028,1300107,1300355,1300109,1300111,1300113,1300356,1300115,1300436,1300357,1300117,1300023,1300119,1300384,1300385,1300120,1300386,1300387,1300388,1300063,1300358,1300389,1300359,1300123,1300344,1300360,1300345,1300441,1300125,1300126,1300128,1300439,1300130,1300132,1300134,1300440,1300034,1300031,1300136,1300138,1300390,1300039,1300139,1300361,1300391,1300141,1300033,1300143,1300145,1300392,1300146,1300026,1300393,1300362,1300030,1300147,1300394,1300395,1300363,1300396,1300149,1300397,1300151,1300398,1300153,1300399,1300364,1300365,1300154,1300156,1300400,1300157,1300366,1300402,1300159,1300060,1300061,1300403,1300162,1300404,1300164,1300167,1300169,1300171,1300405,1300172,1300173,1300174,1300175,1300176,1300178,1300406,1300179,1300181,1300183,1300187,1300199,1300221,1300233,1300237,1300059,1300253,1300257,1300261,1300265,1300277,1300279,1300291,1300370,1300293,1300407,1300018,1300019,1300447,1300375,1300408,1300409,1300410,1300411,1300295,1300412,1300413,1300371,1300414,1300297,1300415,1300299,1300416,1300003,1300004,1300005,1300020,1300027,1300300,1300417,1300302,1300303,1300418,1300419,1300420,1300304,1300421,1300422,1300423,1300424,1300425,1300426,1300346,1300305,1300306,1300434,1300435,1300006,1300007,1300427,1300307,1300308,1300309,1300312,1300313,1300314,1300315,1300428,1300316,1300429,1300317,1300318,1300319,1300320,1300321,1300430,1300431,1300322,1300323,1300324,1300373,1300432,1300325,1300000,1300327,1300433,1300329,1300330,1300331,1300332,1300012,1300017,1300013,1300016,1300014,1300015,1300025,1300024,1300334,1300001,1300021,1300002,1300022,1300008,1300011,1300009,1300010,0&quot; ROUTE_TYPE_FILTER=&quot;'ROUTE_TYPE_12','ROUTE_TYPE_10','ROUTE_TYPE_03','ROUTE_TYPE_04','ROUTE_TYPE_11','ROUTE_TYPE_02','ROUTE_TYPE_01','UNKNOWN'&quot; OLD_LPU_ACCESS_FILTER=&quot;13006,13022,13009,13011,13004,13003,13000,13023,13008,13013,13002,13005,13001,13007,13021,0&quot; FILTER=&quot;8=8 AND ID IN (1301709,1300249)&quot; LPU_ACCESS_FILTER=&quot;13006,13022,13009,13011,13004,13003,13000,13023,13008,13013,13002,13005,13001,13007,13021,0&quot;/>&#xA;&lt;/root>" keep_files="true" ext_data_id="PODS_GRID.XML#PODS_ROUTE"/>
         * */
        /* Экспорт одного объекта
         * templateName DATA_LAY_Exp.xml
         * input <input file_name="Public\Data\TAB\B6CC9B4C-A9EF-8378-02B1-2D1A50BB73CF.xls" template="PODS_ROUTE" data="&lt;root>&#xA;  &lt;data LINE_ID=&quot;1300000&quot; OPERATING_STATUS_GCL=&quot;ACTIVE&quot; SRV_DISTRICT_ID=&quot;13006&quot; ID=&quot;1301709&quot; TYPE_LBL=&quot;Магистральный&quot; ROUTE_TYPE_CL=&quot;ROUTE_TYPE_10&quot; mx_internal_uid=&quot;F6052EAE-5832-1190-E3E5-2D159C634C63&quot; SYS_OBJ_ID=&quot;1301709&quot; RWN=&quot;1&quot; DESCRIPTION=&quot;СРТО-Урал&quot; STATION_BEG=&quot;1690&quot; FILTER=&quot;ID=1301709&quot; STATION_END=&quot;1840&quot;/>&#xA;&lt;/root>" keep_files="true" ext_data_id="PODS_EXPORT.xml#PODS_ROUTE"/>
         * */
        //генерируем UID для текущей выгрузки
        var currentUID = App.generateUUID();
        var itemXmlEscaped = '&lt;root>';
        for(var i = 0;i < dataArray.length; i++){
            itemXmlEscaped += ExportUtil.Obj2StrXML(dataArray[i], 'data');
        }
        itemXmlEscaped += '&lt;/root>';

        //формируем  шаблон для задачи AA
        var resFileName = 'Public/Data/TAB/'+currentUID+'.xls';
        ExportUtil.exportExcelFileName = resFileName;
        //Формируем команду на выполнение сервису
        var inputData = '<input file_name="'+resFileName+'" template="'+excelTemplate+'" data="'+itemXmlEscaped+'" keep_files="true" ext_data_id="'+requestSource+'"/>';
        if (requestSource=="export") {
            inputData = '<input file_name="'+resFileName+'" template="export" data="'+itemXmlEscaped+'" keep_files="true"/>';
        }
	    alertForm = new AlertForm();
	    alertForm.build("utilExportExcelAlertForm",gis_exportutil_14,gis_core_1,AlertForm.OK);
	    //Добавляем слушатель закрытия формы
	    $("body").on(CloseEvent.CLOSE, function gridExportLimitAlertFormClose(evt/*CloseEvent*/) {
		    $("body").off(CloseEvent.CLOSE);
		    if (evt && evt.detail == 1) {
			    var processExportForm = new ProcessExportExcelForm();
			    processExportForm.inputData = inputData;
			    //Собственно создаем форму
			    processExportForm.build();
		    }
	    });
    }
    else{
        App.confirmDialog(ExportUtil.EXPORT_EXCEL_EMPTY_DATA_ERROR);
    }
};


ExportUtil.exportToExcelFault = function exportToExcelFault(resultXml) {
    //Снимаем курсор ожидания
    BlockingUtil.ready();
    //BlockingUtil.unblockApplication();
    App.errorReport(ExportUtil.EXPORT_EXCEL_ERROR, resultXml.toString(), undefined, {filename:gis_filename_594, functionname:'gis_filename_594_5'});
    ExportUtil.exportExcelFileName = "";
};

/**
 * Функции для экспорта в WRL
 * */
//Переменная хранит последнее имя генерируемого файла (уже с расширением .wrz)
ExportUtil.exportWRLFileName = "";

ExportUtil.exportToWRL = function exportToWRL(wrlId, wrlFileName) {
    //Запоминаем имя файла (русскоязычное) для последующего вызова
    ExportUtil.exportWRLFileName = wrlId;//wrlFileName;
    var templateName = "TAB_BLOB_Exp.xml";
    //var inputData = '<item folder_name="Public/Data/VRML" file_id="'+wrlId+'" keep_files="false" table_name="WEB50.LIB_DOC_VERSION" blob_field="BODY" file_name_field="FILE_NAME" id_field="DOC_VERSION_ID"/>';
	var inputData = '<item folder_name="Public/Data/VRML" file_id="'+wrlId+'" keep_files="false" table_name="WEB50.LIB_DOC_VERSION" blob_field="BODY" file_name_field="DOC_ID" id_field="DOC_VERSION_ID"/>';
    var requestParams = ExportUtil.makeUTETaskServiceDataReqParams(templateName, inputData);
    App.serverQueryXMLWithTries(Services.RunUTETaskService, requestParams
        ,ExportUtil.exportToWRLResult
        ,ExportUtil.exportToWRLFault
        ,4
    );
};

ExportUtil.exportToWRLResult = function exportToWRLResult(resultXml) {
    if (!resultXml || resultXml==undefined || resultXml!="<result>1</result>") {
        App.errorReport(ExportUtil.EXPORT_WRL_ERROR, resultXml.toString(), undefined, {filename:gis_filename_594, functionname:'gis_filename_594_6'});
    } else {
        var curUrl = ExportUtil.getCurrentUrl();
        /* будет такой запрос : /web55/Public/Modules/VRML/Wrl.htm?wrl=http://192.168.3.244/Public/Data/VRML/FILE_NAME.wrz */
        var fileUrl = curUrl + 'Public/Modules/VRML/Wrl.htm?wrl=' + curUrl + 'Public/Data/VRML/' + ExportUtil.exportWRLFileName;
        //Предоставляем пользователю ссылку на этот файл
        var win = window.open(fileUrl, '_blank');
        win.focus();
    }
    ExportUtil.exportWRLFileName = "";
};

ExportUtil.exportToWRLFault = function exportToWRLFault(resultXml) {
    App.errorReport(ExportUtil.EXPORT_WRL_ERROR, resultXml.toString(), undefined, {filename:gis_filename_594, functionname:'gis_filename_594_7'});
    ExportUtil.exportWRLFileName = "";
};

/**
 * Функции для экспорта в IMG
 * */
//Переменная хранит последнее имя генерируемого файла (уже с расширением .img)
ExportUtil.exportIMGFileName = "";

ExportUtil.exportToIMG = function exportToIMG(imgId, imgFileName) {
    //Запоминаем имя файла (русскоязычное) для последующего вызова
    ExportUtil.exportIMGFileName = imgFileName;
    var templateName = "TAB_BLOB_Exp.xml";
    var inputData = '<item folder_name="Public/Data/IMG" file_id="'+imgId+'" keep_files="false" table_name="WEB50.LIB_DOC_VERSION" blob_field="BODY" file_name_field="FILE_NAME" id_field="DOC_VERSION_ID"/>';
    var requestParams = ExportUtil.makeUTETaskServiceDataReqParams(templateName, inputData);
    App.serverQueryXMLWithTries(Services.
            RunUTETaskService, requestParams
        ,ExportUtil.exportToIMGResult
        ,ExportUtil.exportToIMGFault
        ,4
    );
};

ExportUtil.exportToIMGResult = function exportToIMGResult(resultXml) {
    if (!resultXml) {
        App.errorReport(ExportUtil.PACK_IMG_ERROR, resultXml.toString(), undefined, {filename:gis_filename_594, functionname:'gis_filename_594_10'});
    } else {
        var realtivePath = 'Public/Data/IMG/'+ExportUtil.exportIMGFileName;
        var curUrl = ExportUtil.getCurrentUrl();
        /* будет такой запрос : /Public/Data/Temp/IMG/{file_name}.img  */
        var fileUrl = curUrl + realtivePath;
        //Предоставляем пользователю ссылку на этот файл
        var win = window.open(fileUrl, '_blank');
        win.focus();
    }
    ExportUtil.exportIMGFileName = "";
};

ExportUtil.exportToIMGFault = function exportToIMGFault(resultXml) {
    App.errorReport(ExportUtil.EXPORT_IMG_ERROR, resultXml.toString(), undefined, {filename:gis_filename_594, functionname:'gis_filename_594_9'});
    ExportUtil.exportIMGFileName = "";
};


/* Вспомогательные функции */

ExportUtil.Obj2XML = function(obj, name){
    var item = $('<' + name + '/>');
    for(var prop in obj){
        item.attr(prop.toUpperCase(),obj[prop]);
        //item[0].setAttribute(prop.toUpperCase(),obj[prop]);
    }
    return item;
};

ExportUtil.Obj2StrXML = function(obj, name){
    var item = '&lt;' + name ;
    for(var prop in obj){
        item += ' '+prop+'=&quot;'+obj[prop]+'&quot; ';
    }
    item += ' />';
    return item;
};
/* Глобальный объект с функциями логирования */
LogUtil = {};

/* Константы для логирования */
LogUtil.Severity_CRITICAL = 1; // Фатальная ошибка
LogUtil.Severity_ERROR = 2; // Ошибка
LogUtil.Severity_WARNING = 4; // предупреждение
LogUtil.Severity_INFO = 8; // информационное сообщение

LogUtil.Severity_VERBOSE = 16; // отладка

LogUtil.Severity_START = 256; // начало процесса
LogUtil.Severity_STOP = 512; // остановка процесса
LogUtil.Severity_SUSPEND = 1024; // приостановка процесса
LogUtil.Severity_RESUME = 2048; // возобновление процесса
LogUtil.Severity_TRANSFER = 4096; // передача управления другому процессу

//Запись в лог сервера текста
/**
 *
 * @param {String} message
 * @param {AuditEventType} category
 * @param {int} severity
 * @param {String} context
 * @returns {*}
 */
LogUtil.sendLog = function(message , category , severity , context ) {
    /* Закомментировать return; для отладки */
    /*return;*/
    message = (message) || ' ';
    category = (category) || AuditEventType.DEFAULT;
    severity = (severity) || LogUtil.Severity_CRITICAL;
    context = (context) || ' ';
    var req = $.ajax({
        type: "POST",
        url: Services.logNode,
        data: {
            message: message,
            categories: category,
            severity: severity,
            context: context
        },
        timeout: App && App.clientRequestTimeout !== undefined ? App.clientRequestTimeout : 0,
        dataType: 'json'
    });
    //Возвращаем ссылку на запрос (для возможности отмены запроса)
    return req;
};

/* Типы событий аудита */
AuditEventType = {
    USER_LOGIN: 32,
    USER_LOGOUT: 34,
    TASK_START: 256,
    TASK_STOP: 257,
    MODULE_START: 258,
    MODULE_STOP: 259,
    DEFAULT: 260
};
//Запись в журнал аудита события
//upd 20
/**
 *
 * @param {int} userId
 * @param {AuditEventType} auditType
 * @param {String} success 'true' or 'false'
 * @param {String} details
 */
LogUtil.sendAuditEvent = function (userId, auditType , success, details ) {
    LogUtil.sendLog(logutil_1, auditType, LogUtil.Severity_INFO, logutil_2 + userId + ", " + logutil_3 + success);
};

//Глобальный объект
GroupOperationsUtil = {};

GroupOperationsUtil.PROCESS_FORM_DIV = "processStatusForm";
GroupOperationsUtil.GROUP_OPERATION_ERROR_TEXT = gis_groupoperationutil_1;

//Создаем форму статуса процесса групповой последовательной обработки
/**
 * titleStr:String - Заголовок формы
 * array:Array=null - массив обрабатываемых объектов
 * thisObject:Object=null - Объект, от которого выполняются функции (модуль или форма, от которой запустили эту форму)
 * processFunction:Function=null - Функция обработки текущего элемента массива и ее аргументы
 * endFunction:Function=null - Функция, выполняемая при завершении обработки и ее аргументы
 * cancelFunction:Function=null - Функция, выполняемая при отмене обработки - обычно в ней будет отменяться текущий выполняемый вызов
 * */
GroupOperationsUtil.createProcessStatusForm = function createProcessStatusForm(titleStr/*String*/, array/*Array*/, thisObject/*Object*/,
    processFunction/*Function*/,endFunction/*Function*/,cancelFunction/*Function*/, modal/*Boolean*/) {
        var processStatusForm = new ProcessStatusForm();
    processStatusForm.title = titleStr;
    if (array) {
        processStatusForm.totalCount = array.length;
    }
    processStatusForm.objectsArray = array;
    processStatusForm.thisObject = thisObject;
    processStatusForm.processFunction = processFunction;
    processStatusForm.endFunction = endFunction;
    processStatusForm.cancelFunction = cancelFunction;
    processStatusForm.build(GroupOperationsUtil.PROCESS_FORM_DIV);//Форма выполнения групповых операций всегда одна!
    return processStatusForm;
};

//Показываем форму работы с групповыми ошибками, если она есть
GroupOperationsUtil.showActionOnErrorForm = function showActionOnErrorForm(actionOnErrorForm/*ActionOnErrorForm*/, listenerFunc/*Function*/, fullStr/*String*/) {
    if (actionOnErrorForm && listenerFunc!=null) {
        /*PopUpManager.addPopUp(actionOnErrorForm, (Application.application as DisplayObject), true);
        PopUpManager.centerPopUp(actionOnErrorForm);*/
        actionOnErrorForm.shortMessage = GroupOperationsUtil.GROUP_OPERATION_ERROR_TEXT;
        actionOnErrorForm.fullMessage = fullStr;
        actionOnErrorForm.addEventListener(CloseEvent.CLOSE,listenerFunc);
    }
};
/**
 * Класс всплывающей формы отображения статуса процесса выполнения (груповая обработка)
 */
/* TEXT CONSTANTS */
/**/
var PROCESS_STATUS_FORM_TOTAL_COUNT_TEXT = gis_processstatusform_1;
var PROCESS_STATUS_FORM_PROCESSED_COUNT_TEXT = gis_processstatusform_2;
var PROCESS_STATUS_FORM_ERRORS_COUNT_TEXT = gis_processstatusform_3;

function ProcessStatusForm() {
    this.title = gis_processstatusform_4;
    this.closable = false;
    this.htmlUrl = 'ui/html/ProcessStatusForm.html';

    this.totalCount = 0;
    this.processedCount = 0;
    this.errorsCount = 0;
    this.proceedIds = [];
    this.proceedLayerName = '';

    this.cancelBtnPressed = false;
    //Обрабатываемый массив
    this.objectsArray = [];
    //Объект, от которого выполняются функции (модуль или форма, от которой запустили эту форму)
    this.thisObject;
    //Функция обработки текущего элемента массива и ее аргументы
    this.processFunction = null;
    //Функция, выполняемая при завершении обработки и ее аргументы
    this.endFunction = null;
    //Функция, выполняемая при отмене обработки - обычно в ней будет отменяться текущий выполняемый вызов
    this.cancelFunction = null;

    //Форма выбора действия при возникновении ошибки в операции
    this.actionOnErrorForm;
    //Запомнить ли выбор в форме выбора действия
    this.continueToAll = false;
};

ProcessStatusForm.prototype.build = function(elementId) {
    var that = this;
    //После загрузки html-описания формы устанавливаем все умолчания и слушатели элементам
    function build() {
        //Функция обновления значения в форме
        that.changeFormValues = function changeFormValues() {
            //Устанавливаем всем элементам формы нужный текст
            $("div[name='totalCountText']").text(PROCESS_STATUS_FORM_TOTAL_COUNT_TEXT + that.totalCount);
            $("div[name='processedCountText']").text(PROCESS_STATUS_FORM_PROCESSED_COUNT_TEXT + that.processedCount);
            $("div[name='errorsCountText']").text(PROCESS_STATUS_FORM_ERRORS_COUNT_TEXT + that.errorsCount);
        };
        //Обновляем значения в полях формы
        that.changeFormValues();
        //Создаем диалоговую форму
        dlg.dialog({
            modal: true,
            title: that.title,
            dialogClass: that.closable ? 'gsi-zindex__dialog' : 'noCloseButton gsi-zindex__dialog',
            closeOnEscape: that.closable,
            width: 410,
            height: 120,
            open: function( event, ui ) {
                that.processArray();
            }
        });

        //Кнопка отмены
        $("input[name='cancel']", dlg).click(function () {
            //that.cancel();
            that.onCancelClick();
        });
    }

    that.elementId = elementId;

    $('#'+elementId).remove();
    //Создаем форму экспорта в GPX или KML
    $('body').append('<div id="'+elementId+'"></div>');
    var dlg = $('#'+elementId);

    dlg.load(this.htmlUrl, build);
};

ProcessStatusForm.prototype.cancel = function() {
    $('#'+this.elementId).remove();
};

ProcessStatusForm.prototype.processArray = function processArray() {
    var that = this;
    //Если в форме статуса нажали кнопку отмены - завершаем операции
    if (that.cancelBtnPressed==true) {
        if (that.endFunction!=null && that.endFunction!=undefined) {
            that.endFunction.apply(that.thisObject,[that.errorsCount,that.processedCount, false, that.proceedLayerName, that.proceedIds]);
            that.endFunction = null; //Результат все равно вернется в callback и сделает processArray(), поэтому убираем функцию чтобы не вызывать дважды
        }
        that.endProcess();
        return;
    }
    if (that.objectsArray && that.objectsArray.length>0) {
        var curObj = that.objectsArray.pop();
        if(curObj){
            that.proceedLayerName = curObj.classId;
            that.proceedIds.push(curObj.objectId);
        }
        if (that.processFunction!=null)
            that.processFunction.apply(that.thisObject,[curObj]);
    } else {
        if (that.endFunction!=null && that.endFunction!=undefined)
            that.endFunction.apply(that.thisObject,[that.errorsCount,that.processedCount, false, that.proceedLayerName, that.proceedIds]);
        that.endProcess();
    }
};
//слушатель результата
ProcessStatusForm.prototype.processResultString = function processResultString(error/*String*/) {
    var that = this;
    if (error != "") {
        that.errorsCount++;
        //Обновляем значения в полях формы
        that.changeFormValues();
        //Если не было формы, реагирующей на ошибку, создаем ее
        if (!that.continueToAll && that.cancelBtnPressed==false) {
            that.actionOnErrorForm = new ActionOnErrorForm();
            that.actionOnErrorForm.parentProcessStatusForm = that;
            that.actionOnErrorForm.fullMessage = error;
            //Создаем форму
            that.actionOnErrorForm.build("actionOnErrorForm");//Форма выбора действия тоже всегда одна!
            //Добавляем слушатель (с дополнительным агрументом, чтобы по завершении иметь возможность вызова функций ProcessStatusForm)
            $("body").on(CloseEvent.CLOSE, that.onActionOnErrorFormClose);
        } else {
            that.processArray();
        }
    } else {
        that.processedCount++;
        //Обновляем значения в полях формы
        that.changeFormValues();
        that.processArray();
    }
};
//Слушатель события закрытия формы - нужно дальше обрабатывать, если detail==1 (продолжили)
ProcessStatusForm.prototype.onActionOnErrorFormClose = function onActionOnErrorFormClose(evt/*CloseEvent*/) {
    var that = this;
    $("body").off(CloseEvent.CLOSE);
    if (evt && evt.eventData) {
        that = evt.eventData.parent;
    }
    if (evt.eventData && evt.eventData['continue']) {
        //Сохраняем ли текущий выбор для следующих ошибок
        that.continueToAll = evt.eventData.saveChoose;
        //Если есть еще объекты для обработки - обрабатываем, иначе заканчиваем обработку
        that.processArray();
    } else {
        if (that.endFunction!=null){
            var isCancel = evt.eventData && evt.eventData['continue'] !== true;
            that.endFunction.apply(that.thisObject,[that.errorsCount,that.processedCount, isCancel, that.proceedLayerName, that.proceedIds]);
        }
        that.endProcess();
    }
};
//По завершении процесса обработки нужно закрывать созданные формы
ProcessStatusForm.prototype.endProcess = function endProcess() {
    var that = this;
    //Убираем форму выбора действия при ошибке
    that.deleteActionOnErrorForm();
    //Убираем форму статуса
    that.onCancel();
};
//Удаляем форму работы с групповыми ошибками, если она есть
ProcessStatusForm.prototype.deleteActionOnErrorForm = function deleteActionOnErrorForm() {
    var that = this;
    if (that.actionOnErrorForm) {
        that.actionOnErrorForm.cancel();
        that.actionOnErrorForm = null;
    }
};

ProcessStatusForm.prototype.onCancelClick = function onCancelClick() {
    var that = this;
    that.cancelBtnPressed = true;
    //2012_12_05 - при нажатии кнопки "Отмена" реально отменяем текущий запрос и заканчиваем работу
    if (that.cancelFunction!=null)
        that.cancelFunction.apply(that.thisObject,[]);
    //Для завершения работы нужно вызвать последнюю обработку - результата текущей операции мы уже не получим
    that.processArray();
};

ProcessStatusForm.prototype.onCancel = function onCancel() {
    var that = this;
    that.removeMe();
};

ProcessStatusForm.prototype.removeMe = function removeMe(hasChanges/*Boolean*/) {
    var that = this;
    /*that.dispatchEvent(new CloseEvent(CloseEvent.CLOSE,false,false,hasChanges ? 1 : -1));*/
    //Закрываем форму
    that.cancel();
    /*PopUpManager.removePopUp(this);*/
};
/**
 * Класс всплывающей формы для выбора действия при прерывании групповой обработки
 */
function ActionOnErrorForm() {
    this.title = gis_actiononerrorform_3;
    this.closable = false;
    this.htmlUrl = 'ui/html/ActionOnErrorForm.html';
    this.shortMessage = gis_actiononerrorform_4;
    this.fullMessage = "";
    this.onChooseFunction = null; //Функция выбора опции. В нее передается 2 аргумента: true/false (продолжать или нет) и true/false (запомнить выбор или нет)
    this.isContinue = false;
    this.parentProcessStatusForm = null;
};

ActionOnErrorForm.prototype.build = function(elementId) {
    var that = this;

    //После загрузки html-описания формы устанавливаем все умолчания и слушатели элементам
    function build() {
        //Создаем диалоговую форму
        dlg.dialog({
            modal: true,
            resizable: false,
            title: that.title,
            dialogClass: that.closable ? '' : 'noCloseButton',
            closeOnEscape: that.closable,
            width: 370,
            height: 130
        });

        function onChoose() {
            try {
                var closeEvt = new CloseEvent(CloseEvent.CLOSE);
                closeEvt.eventData = {'continue': that.isContinue, saveChoose: $("input[name='inputCheck']")[0].checked, parent:that.parentProcessStatusForm};
                closeEvt.dispatch();
            } catch (e) {
                App.errorReport(gis_actiononerrorform_2, e, undefined, {filename:gis_filename_301, functionname:'gis_filename_301_1'});
            }
        }

        //Добавляем текст детальной информации
        var detailInfoTextArea = $("#actionOnErrorForm_detailInfoText");
        var formattedErrorString = App.formatErrorString(that.fullMessage);
        detailInfoTextArea.text(formattedErrorString);

        //Кнопки выбора опции
        $("input[name='inputCheck']", dlg).click(function () {
            //Ничего не делаем, понадобится при нажатии кнопки
        });
        //Кнопку "Переслать в службу поддержки" создаем через jqxButton (чтобы с картинкой была и подсказкой)
        var sendMailButton = $("#actionOnErrorForm_sendMailButton");
        sendMailButton.jqxButton({ width: '22px', height: '18px'});
        sendMailButton.on('click', function () {
            var text   = gis_actiononerrorform_1;
            var detail = detailInfoTextArea.text();

            var dialog = Object.create(SendErrorReportDialog);
            dialog.setData(
                gis_app_55_10+
                text+"\n\n"+
                gis_app_55_11+
                detail+"\n\n"+
                gis_app_55_12
            );
            dialog.build();
        });
        //sendMailButton.jqxTooltip({position: 'top', content: gis_actiononerrorform_5});
        sendMailButton.attr('title', gis_actiononerrorform_5);
        //Кнопки detailInfo, continue, cancel
        $("input[name='detailInfo']", dlg).click(function () {
            var detailInfoBtnText = detailInfoTextArea.css('display') == 'none' ? gis_actiononerrorform_6 : gis_actiononerrorform_7;
            $("input[name='detailInfo']", dlg)[0].value = detailInfoBtnText;
            var displayTextArea = detailInfoTextArea.css('display') == 'none' ? 'block' : 'none';
            //Расширяем/сжимаем форму на высоту подробной информации
            var dlgHeight = dlg.dialog("option","height");
            var displayTextAreaHeight = displayTextArea == 'none' ? -detailInfoTextArea.outerHeight() : detailInfoTextArea.outerHeight();
            dlg.dialog("option","height", dlgHeight + displayTextAreaHeight);
            //Показываем текст
            detailInfoTextArea.css('display', displayTextArea);
        });
        $("input[name='continue']", dlg).click(function () {
            that.isContinue = true;
            onChoose();
            that.cancel();
        });
        $("input[name='cancel']", dlg).click(function () {
            that.isContinue = false;
            onChoose();
            that.cancel();
        });
    }

    that.elementId = elementId;
    $('#'+elementId).remove();
    //Создаем форму
    $('body').append('<div id="'+elementId+'"></div>');

    var dlg = $('#'+elementId);

    dlg.load(this.htmlUrl, build);
};

ActionOnErrorForm.prototype.cancel = function() {
    $('#'+this.elementId).remove();
};

/**
 * Абстрактный класс диалога с формой редактирования записей БД
 * Умеет считывать конфигурацию формы, загружать в нее данны и сохранять их на диске
 * Формирует всплывающий диалог и кнопочками. По умолчанию есть кнопки Сохранить и Отменить
 */

/* TEXT CONSTANTS */
var ABSTRACT_FORM_DIALOG_BUTTON_SAVE = gis_abstractformdialog_1;
var ABSTRACT_FORM_DIALOG_BUTTON_CLOSE = gis_abstractformdialog_2;
var ABSTRACT_FORM_DIALOG_LOADING_TEXT = gis_abstractformdialog_3;
var ABSTRACT_FORM_DIALOG_ERROR_LOADING_FORM = gis_abstractformdialog_4;
var ABSTRACT_FORM_DIALOG_ERROR_CREATING_FORM = gis_abstractformdialog_5;
var ABSTRACT_FORM_DIALOG_ERROR_SAVE_FORM = gis_abstractformdialog_6;
/**/


AbstractFormDialog = {};

AbstractFormDialog.dialogId = 'popupDialog';
 
AbstractFormDialog.form = null;

AbstractFormDialog.defaultValues = {};

AbstractFormDialog.loadData = true;
AbstractFormDialog.sendUser = true;

AbstractFormDialog.title = 'AbstractFormDialog';
AbstractFormDialog.formDescrId = null;
AbstractFormDialog.sysClassId = null;
AbstractFormDialog.descrId = null;
AbstractFormDialog.dbSchemaId = null; 
AbstractFormDialog.dbTableId = null; 
AbstractFormDialog.saveDescrType = 'update'; 
AbstractFormDialog.buttons = {                
    save           :ABSTRACT_FORM_DIALOG_BUTTON_SAVE,
    close          :ABSTRACT_FORM_DIALOG_BUTTON_CLOSE
};    
AbstractFormDialog.defaultAction = 'save';

AbstractFormDialog.init = function() {   
    this.form = new Form();
    
    var m = /^([^_]+)_(.+)$/.exec(this.sysClassId);
    if(m) {
        this.dbSchemaId = m[1]; // sysClassId до первого подчеркивания
        this.dbTableId  = m[2]; // sysClassId после первого подчеркивания
    }
};

AbstractFormDialog.makeLoadDataReqParams = function() {
    var userId    = this.sendUser ? ''+Auth.getUserId()   : '-1';
    var userLogin = this.sendUser ? ''+Auth.getUserName() : 'guest';

    return {
        getSchema:  false,
        descrId:    this.descrId,
        toElements: false,
        descrType:  'select',
        data:
            '<root USER_ID="'+userId.xmlEscape()+'" USER_LOGIN="'+userLogin.xmlEscape()+'" PODS_USER="'+userLogin.xmlEscape()+'">'+
            '<data SYS_FULL_ID="'+this.sysClassId+'/'+userId.xmlEscape()+'" SYS_CLASS_ID="'+this.sysClassId+'" SYS_OBJ_ID="'+userId.xmlEscape()+'" DB_SCHEMA_ID="'+this.dbSchemaId+'" DB_TABLE_ID="'+this.dbTableId+'" CURRENT_USER_LOGIN="'+userLogin.xmlEscape()+'" CURRENT_USER_ID="'+userId.xmlEscape()+'" />'+
            '</root>'
    };
};

AbstractFormDialog.makeSaveDataReqParams = function(values) {
    var userId    = this.sendUser ? ''+Auth.getUserId()   : '-1';
    var userLogin = this.sendUser ? ''+Auth.getUserName() : 'guest';

    return {
        descrType:  this.saveDescrType,
        getSchema:  false,
        descrId:    this.descrId,
        toElements: false,
        data:              
            '<root USER_ID="'+userId.xmlEscape()+'" USER_LOGIN="'+userLogin.xmlEscape()+'" PODS_USER="'+userLogin.xmlEscape()+'">'+
            '<data '+this.structToXmlAttrs(values)+' SYS_FULL_ID="'+this.sysClassId+'/'+userId.xmlEscape()+'" SYS_CLASS_ID="'+this.sysClassId+'" SYS_OBJ_ID="'+userId.xmlEscape()+'" DB_SCHEMA_ID="'+this.dbSchemaId+'" />'+
            '</root>'                                  
    };       
};

AbstractFormDialog.structToXmlAttrs = function(values) {
    var fieldsAttrs = '';
    $.each(values, function(name, value){
        fieldsAttrs += ' '+name.toUpperCase()+'="'+value.toString().xmlEscape()+'"';
    });        
    return fieldsAttrs;
};

/*
 * Построение всего диалога и обработка событий
 */
AbstractFormDialog.build = function() {    
    var that = this;
    
    // Создадим диалог. Сначала пустой
    $('#'+this.dialogId).remove();
    $('body').append('<div id="'+this.dialogId+'">'+ABSTRACT_FORM_DIALOG_LOADING_TEXT+'</div>');
    $('#'+this.dialogId+'').dialog({
        dialogClass: 'appDialog',
        modal  : true,
        title  : this.title,
        width  : 800,
        height : 100        
    });

    //Устанавливаем курсор ожидания
    BlockingUtil.wait();
    try {
        // Запрос данных
        var values = this.defaultValues;
        function dataReq() {
            return App.serverQueryNodeWithTries(Services.processQueryNode, that.makeLoadDataReqParams(), function(xml){
                $.each(xml.find('data:first').get(0).attributes, function(){
                    if(this.specified) {
                        values[this.name] = this.value;                        
                    }                                    
                });                         
            });
        }        

        // Запрос структуры формы
        var formStruct;
        function formReq() {
            var fileName = '../../Public/Modules/Form/'+that.formDescrId+'.mxml';
            return App.serverQueryXmlFileNode1(Services.processQueryNodeXml, 'SYS_SEM.xml#GET_XML_FILE', fileName,
                function (xml) {
                var er = HTTPServiceUtil.getError(xml);
                if (er !== '')
                    App.errorReport(gis_core_error_1, er,undefined,{filename:gis_filename_4, functionname:'gis_filename_4_1'});
                else 
                    formStruct = xml;
            });
        }

        // Построим форму, когда данные и описание формы загрузятся
        var prom;
        if(this.loadData) {
            prom = $.when(formReq(), dataReq());
        }
        else {
            prom = $.when(formReq());
        }
        
        prom.then(function(){     
            var dlg = $('#'+that.dialogId);
            dlg
                .empty()
                .append('<form class="form" method="post"></form>');

            that.form.setContainer($('.form', dlg));
            that.form.setXml(formStruct);
            that.form.setValues(values);
            that.form.build();                                 

            // Ставим фокус на первое поле
            $('form input[type="text"]:first', dlg).attr('autofocus', 'autofocus').focus();

            var w = that.form.getWidth();
            var h = that.form.getHeight();                

            // Готовим кнопки, и добавляем обработчики
            var buttons = [];
            $.each(that.buttons, function(name, text){                
                buttons.push({ 
                    text: text,
                    click: function(){
                        var funcName = name+'Action';
                        if(that[funcName]) {
                            that[funcName].apply(that);
                        }
                    }
                });                    
            });

            // Формируем диалог
            dlg.dialog({
                width   : w ? w+10  : 800,
                height  : h ? h     : 'auto',                    
                buttons : buttons                  
            }); 
                        
            // Костыль: Исправление бага в Chrome который приводит к скаканию высоты диалога при наличии в нем select-ов            
            $('select', dlg).hide().show();                       
            
            // При нажатии Enter автоматичеcки делаем действие по умолчанию
            dlg.keydown(function(event) {
                if (event.keyCode == 13) {                    
                    var func = that[that.defaultAction+'Action'];
                    if(func) {
                        func.apply(that);
                    }                    
                    event.preventDefault();
                    return false;
                }                
            });
            //Снимаем курсор ожидания
            BlockingUtil.ready();
        });
        prom.fail(function(){
            //Снимаем курсор ожидания
            BlockingUtil.ready();
            App.errorReport(ABSTRACT_FORM_DIALOG_ERROR_LOADING_FORM+' "'+that.title+'"', '',undefined,{filename:gis_filename_4, functionname:'AbstractFormDialog.build_fail'});
        });
    }
    catch(e) {
        //Снимаем курсор ожидания
        BlockingUtil.ready();
        App.errorReport(ABSTRACT_FORM_DIALOG_ERROR_CREATING_FORM+' "'+that.title+'"', e,undefined,{filename:gis_filename_4, functionname:'AbstractFormDialog.build_catch'});
    }               
};

AbstractFormDialog.saveAction = function() {
    var that = this;
    //Устанавливаем курсор ожидания
    BlockingUtil.wait();

    var formValues = this.form.getValues();

    if(formValues.theme !== undefined){
        //пока хардкодятся элементы
        var mode = (formValues.map_mode_raster === true) ? WidgetMap.MODES.RASTER : WidgetMap.MODES.VECTOR;
        mode = MapUtil.getAvailableMapMode(mode);
        MapUtil.applyThemeParams({
            mapMode: mode,
            showOverviewMap: formValues.show_overview_map === true,
            showTree: formValues.show_tree === true,
            sendCadastreEmail: formValues.send_cadastre_email === true,
            showCenterMap: formValues.show_center_map === true,
            coordMode: (formValues.coord_mode_decimal === true)?'decimal':'grad',
            useSynchronization: formValues.use_synchronization === true,
        });
    }

    var req = App.serverQueryNode(Services.processQueryNode, this.makeSaveDataReqParams(formValues));
    req.done(function(resultXml){
        var er = HTTPServiceUtil.getError(resultXml);
        if (er !== ''){
            App.errorReport(ABSTRACT_FORM_DIALOG_ERROR_SAVE_FORM+' "'+that.title+'"', er,undefined,{filename:gis_filename_4, functionname:'AbstractFormDialog.saveAction_done'});
            BlockingUtil.ready();
        }
        else {
            //Снимаем курсор ожидания
            BlockingUtil.ready();
            $('#'+that.dialogId).dialog('destroy').remove();
        }
    }); 
    req.fail(function(errorText){
        var er = HTTPServiceUtil.getError(errorText);
        if (er !== '')
            App.errorReport(ABSTRACT_FORM_DIALOG_ERROR_SAVE_FORM+' "'+that.title+'"', er,undefined,{filename:gis_filename_4, functionname:'AbstractFormDialog.saveAction_fail'});
        //Снимаем курсор ожидания
        BlockingUtil.ready();
        //BlockingUtil.unblockApplication();
        
    });        
};

AbstractFormDialog.closeAction = function() {
    $('#'+this.dialogId).dialog('destroy').remove(); 
};


/**
 * Класс всплывающей формы для выбора подтверждения
 */

AlertForm.OK = "AlertForm.OK";
AlertForm.CANCEL = "AlertForm.CANCEL";

function AlertForm(opt_options) {
    var options = opt_options || {};
    this.title = gis_alertform_1;
    //Текст внутри формы сообщения
    this.messageText = gis_alertform_2;
    this.closable = false;
    //Путь шаблона для формы (в шаблоне указывается текст сообщения)
    this.htmlUrl = 'ui/html/AlertForm.html';
    this.isContinue = false;
    this.parent = null;
    this.width = 300;
    this.height = 100;
    this.alertOkButtonText = (options.objectType !== undefined)?options.objectType:gis_core_12;
    this.alertCancelButtonText = gis_core_6;
};

AlertForm.prototype.build = function(elementId, message, title, flags) {
    var that = this;
    that.messageText = message;
    that.title = title;

    //После загрузки html-описания формы устанавливаем все умолчания и слушатели элементам
    function build() {
        //Создаем диалоговую форму
        dlg.dialog({
            modal: true,
            title: that.title,
            dialogClass: that.closable ? '' : 'noCloseButton',
            closeOnEscape: that.closable,
            width: that.width,
            height: that.height,
            create: function(event, ui) {
                dlg.parent('.ui-dialog').css('z-index', 30004)
                    .nextAll('.ui-widget-overlay').css('z-index', 1003);
            }
        });
        function onChoose(detail) {
            try {
                var closeEvt = new CloseEvent(CloseEvent.CLOSE);
                closeEvt.detail = detail;
                closeEvt.parent = that;
                closeEvt.dispatch();
            } catch (e) {
                App.errorReport(e, e, undefined, {filename:gis_filename_304, functionname:'gis_filename_304_1'});
            }
        }

        //Обрабатываем флаги
        if (flags && flags!=undefined && flags!='') {
            if (flags.indexOf(AlertForm.OK)==-1) $("input[name='continue']", dlg).hide();
            if (flags.indexOf(AlertForm.CANCEL)==-1) $("input[name='cancel']", dlg).hide();
        }

        //Устанавливаем в форму текст из messageText
        $("div[name='descriptionText']", dlg)[0].innerHTML = that.messageText;

        //Корректируем высоту по контенту
        var newDlgHeight = 80 + $("div[name='descriptionText']", dlg).height();
        dlg.dialog("option", "height", newDlgHeight);
        //Устанавливаем текст кнопок
        $("input[name='continue']", dlg).attr('value',that.alertOkButtonText);
        $("input[name='cancel']", dlg).attr('value',that.alertCancelButtonText);

        $("input[name='continue']", dlg).click(function () {
            onChoose(1); //Подтверждаем
            that.cancel();
        });
        $("input[name='cancel']", dlg).click(function () {
            that.isContinue = false;
            onChoose(0); //Отменяем
            that.cancel();
        });
    }

    that.elementId = elementId;

    $('#'+elementId).remove();
    //Создаем форму
    $('body').append('<div id="'+elementId+'"></div>');
    var dlg = $('#'+elementId);

    dlg.load(this.htmlUrl, build);
};

AlertForm.prototype.cancel = function() {
    $('#'+this.elementId).remove();
};

function CloseEvent(eventType) {
    // Apply the super constructor to get properly wire
    // core event properties.
    jQuery.Event.call(this, eventType);
    // Store the custom attributes. We can store any custom
    // attribute we want so long as we don't override core
    // jQuery Event properties.
    this._eventType = eventType;

    this.detail = 0; //По-умолчанию событие закрытия с отменой
    this.eventData = null; //По-умолчанию дополнительных данных нет
    this.parent = null; //По-умолчанию дополнительных данных нет

    //Функция отправки самого события
    this.dispatch = function dispatch() {
        $("body").trigger(this);
    };
};

// Extend the core jQuery event object.
CloseEvent.prototype = new $.Event("");

CloseEvent.CLOSE = "CloseEvent.close";
/**
 * Класс диалога отправки отчета об ошибке
 */
SendErrorReportDialog = {
    dialogId: 'sendErrorReportDialog',    
    data: '',
    params: '',
	opener:undefined,
	closeCallback: undefined,//функция закрытия из формы ошибки
    
    setData: function(data, params, opener, closeCallback){
        this.data = data;
		this.closeCallback = closeCallback;
        //если дополнительные данные пришли(название файла, название функции,..), то заполняем переменную
        if(params !== undefined) {
            if(params.filename != undefined)
	            this.params += gis_senderrorreportdialog_16 + params.filename+"\n\n";
	        if(params.functionname != undefined)
	            this.params += gis_senderrorreportdialog_17 + params.functionname+"\n\n";
	        if(params.datatext != undefined)
		        this.params += gis_senderrorreportdialog_18 + params.datatext+"\n\n";
        }
        this.opener = opener;
    },
    
    build: function() {
        var that = this;

        $('#'+this.dialogId).remove();
        $('body').append('<div id="'+this.dialogId+'"></div>');
        var dlg = $('#'+this.dialogId);
        dlg.load('ui/html/SendErrorReportDialog.html', build);
        function build() {
            $('input[name="user"]',    dlg).val(Auth.getUserName());
            $('textarea[name="data"]', dlg).val(that.data);
	        $('textarea[name="paramsdata"]', dlg).val(that.params);

	        var buttons = {};
	        buttons[gis_senderrorreportdialog_19] = function(){ that.send()};
		    buttons[gis_senderrorreportdialog_20] = function(){ that.cancel()};

            dlg.dialog({
                modal : true,
                title : gis_senderrorreportdialog_1,
	            dialogClass: 'ui-send-error-dialog',
                width : 460,
                buttons: buttons
            });
        }
    },
    
    send: function() { 
        var that = this;
        
        var dlg = $('#'+this.dialogId);
        
        var type        = $("select[name='type']",          dlg).val();
        var email       = $("input[name='email']",          dlg).val();        
        var name        = $("input[name='name']",           dlg).val();
        var description = $("textarea[name='description']", dlg).val();
        var data        = $("textarea[name='data']",        dlg).val();
	    var paramsdata  = $("textarea[name='paramsdata']",  dlg).val();



	    if(paramsdata != '')
		    data += gis_senderrorreportdialog_15 + paramsdata + gis_app_55_12;
	    else
		    data += gis_app_55_12;

        var message =
	        gis_senderrorreportdialog_2 + Auth.getUserId() + "<br>" +
	        gis_senderrorreportdialog_3 + Auth.getUserName() + "<br>" +
	        gis_senderrorreportdialog_4 + name + "<br>" +
	        gis_senderrorreportdialog_5 + "<br><pre>"+description+"</pre><br>"+
	        gis_senderrorreportdialog_6 + "<br><pre>"+data+"</pre><br>";

	    App.getJsonTextNode(Services.sendMailNode, {
            addMailTo : email,
            subject   : type,
            fileName1  : '',
            message   : message
        },function(resp){
	    },function(textError){
		    App.errorReport(gis_senderrorreportdialog_11,gis_senderrorreportdialog_9+'. '+textError, undefined, {filename:gis_filename_292, functionname:'gis_filename_292_1'});
	    });
	    if(this.closeCallback)
		    this.closeCallback();
        App.destroyDialog(that.dialogId);
        if(this.opener)
	        App.destroyDialog(this.opener);
    },
    cancel: function() {
    	if(this.closeCallback)
		    this.closeCallback();
        App.destroyDialog(this.dialogId);
    }        
};




/*** GLOBAL VARS  ***/
try{
	goog.provide('map.render.canvas.Replay');
}
catch(ex){}
try{
	goog.provide('map.renderer.vector');
}
catch(ex){}

var _TRANSFORM = {};
var _CONTEXT = undefined;
var _LABELS = [];
MAP_MATRIX_DX = 1;
MAP_MATRIX_DY = 1;
var _dx = MAP_MATRIX_DX;
var _dy = MAP_MATRIX_DY;
var _visibleMatrix = {};
var _visibleTextMatrix = {};
ol.render.canvas.BATCH_CONSTRUCTORS_ = {
	'Image': (map && map.render && map.render.canvas)?map.render.canvas.ImageReplay:ol.render.canvas.ImageReplay,
	'LineString': (map && map.render && map.render.canvas)?map.render.canvas.LineStringReplay:ol.render.canvas.LineStringReplay,
	'Polygon': (map && map.render && map.render.canvas)?map.render.canvas.PolygonReplay:ol.render.canvas.PolygonReplay,
	'Text': (map && map.render && map.render.canvas)?map.render.canvas.TextReplay:ol.render.canvas.TextReplay,
};
ol.renderer.vector.GEOMETRY_RENDERERS_['Point'] = (map && map.renderer && map.renderer.vector)?
	map.renderer.vector.renderPointGeometry_: ol.renderer.vector.renderPointGeometry_;
ol.renderer.vector.GEOMETRY_RENDERERS_['MultiPoint'] = (map && map.renderer && map.renderer.vector)?
	map.renderer.vector.renderMultiPointGeometry_:ol.renderer.vector.renderMultiPointGeometry_;
ol.renderer.vector.GEOMETRY_RENDERERS_['MultiLineString'] = (map && map.renderer && map.renderer.vector)?
	map.renderer.vector.renderMultiLineStringGeometry_:ol.renderer.vector.renderMultiLineStringGeometry_;
ol.renderer.vector.GEOMETRY_RENDERERS_['MultiPolygon'] =(map && map.renderer && map.renderer.vector)?
	map.renderer.vector.renderMultiPolygonGeometry_:ol.renderer.vector.renderMultiPolygonGeometry_;

var MAP_TYPE = {
	MAP: 'map',
	CAS: 'cas',
	SCHEMA: 'schema'
}

var CURRENT_MAP_TYPE = MAP_TYPE.MAP;
goog.provide('ru.corelight.classes.map');
ru.corelight.classes.map.BaseWidget = function(opt_options){
	this.map = undefined;
	this.kinetic = null;//new ol.Kinetic(-0.005, 0.05, 100);//дефолтные настройки перемещения карты
	//список предзагруженных ЛПУ, чтобы фильтры не подгружали данные;
	this.preloadLpuValues = undefined;
	//теже предзагруженные ЛПУ, только в виде справочника с ключом по коду ЛПУ
	this.preloadLpuValuesDict = {};
	//массив дефолтных идентификаторов ЛПУ для сверки с текущим. Если не совпадают с пользовательскими - гео данные из БД всегда
	this.defaultLpuIds = [];

	this.config = null;
	this.mapHistory = undefined;

	//текущая выбранная кнопка
	this.selectedMapButton = undefined;
	this.baseLayersControl = undefined;
	//текущий контрол для рисования, чтобы могли из любых мест его удалить
	this.drawControl = undefined;
	this.panControl = undefined;
	this.managelayersControl = undefined;
	this.mapInfoControl = undefined;
}

ru.corelight.classes.map.BaseWidget.prototype.build = function(){

}
ru.corelight.classes.map.BaseWidget.prototype.regenerateMatrix = function(layerId){
	//Значение ширины, которое добавляется к матрице слева и справа,
	//чтобы при разрядке точечные объекты не пропадали как только их центр выйдет за границы карты
	var matrixAddWidth = _dx;
	//Значение высоты, которое добавляется к матрице сверху и снизу,
	//чтобы при разрядке точечные объекты не пропадали как только их центр выйдет за границы карты
	var matrixAddHeight = _dy;
	//Расширяем матрицу при генерации, чтобы не происходила разрядка точечных объектов, центр которых вышел за границу но часть объекта должна отображаться
	var mapSize = WidgetMap.map.getSize();
	var i = Math.ceil((mapSize[0]*2 + matrixAddWidth*2) / _dx);
	var j = Math.ceil((mapSize[1]*2 + matrixAddHeight*2) / _dy);
	_visibleMatrix[layerId] = new Array(i);
	var k = 0;
	for (k; k<i; k++){
		_visibleMatrix[layerId][k] = new Array(j);
	}
	if(layerId == 'label'){
		i = Math.ceil((mapSize[0]*2 + matrixAddWidth*2) / _dx);
		j = Math.ceil((mapSize[1]*2 + matrixAddHeight*2) / _dy);
		_visibleTextMatrix[layerId] = new Array(i);
		var k = 0;
		for (k; k<i; k++){
			_visibleTextMatrix[layerId][k] = new Array(j);
		}
	}
};


ru.corelight.classes.map.BaseWidget.prototype.updateTopFilter = function (params) {
	var layerId = '';
	var j = 0;
	for (j; j < params.length; j++) {
		var curParam = params[j];
		if(curParam['name'] === 'layerId')
			layerId = curParam['value'];
	}
	for (j = 0; j < params.length; j++) {
		var curParam = params[j];
		if (!curParam.hasOwnProperty('name')) continue;
		var newFilters = [];
		var curFilters;
		switch (curParam['name']) {
			case 'filter':
			case 'roughFilter':
				curFilters = curParam['value'].split('|');
				for (var i = 0; i < curFilters.length; i++) {
					var nameValArr = curFilters[i].split(':');
					if (nameValArr && nameValArr.length == 2) {
						var newFilterObj = {name: nameValArr[0], value: nameValArr[1], layerName: layerId};
						newFilters.push(newFilterObj);
					}
				}

				if (curParam['name'] == 'filter') {
					//Переписываем массив фильтров верхнего уровня, из которых формируются запросы
					newFilters.forEach(function(val){
						if(val && val.name){
							if(WidgetMap.currentTopFilter.length == 0)
								WidgetMap.currentTopFilter = newFilters;
							else{
								var finded = false;
								for(var ni = 0; ni < WidgetMap.currentTopFilter.length; ni++){
									if(WidgetMap.currentTopFilter[ni].name !== undefined ){
										if(WidgetMap.currentTopFilter[ni].name === val.name ){
											WidgetMap.currentTopFilter[ni].value = val.value;
											finded = true;
											break;
										}
									}
								}
								if(!finded)
									WidgetMap.currentTopFilter.push(val);
							}
						}
						//WidgetMap.currentTopFilter = newFilters;
					});

				}
				else if (curParam['name'] == 'roughFilter') {
					//Переписываем массив фильтров среднего уровня, из которых формируются запросы
					WidgetMap.currentRoughFilter = newFilters;
				}
				break;
			case 'layerId':
				layerId = curParam['value'];
				break;
		}
	}

};

/**
 * Центрируемся на карте по экстенту
 * @param extent экстент текущей геометрии
 */
ru.corelight.classes.map.BaseWidget.prototype.centerOnMap = function(extent){
	if (App.config.MAP_CENTERING_MIN_ZOOM === undefined){
		App.errorReport(gis_core_17, 'MAP_CENTERING_MIN_ZOOM' + gis_core_18, undefined, {filename:gis_filename_408, functionname:'gis_filename_408_13'});
		return;
	}
	var minZoom = App.config.MAP_CENTERING_MIN_ZOOM;
	if(goog.isDef(minZoom) && goog.isNumber(parseFloat(minZoom)) && parseFloat(minZoom) > 0 && WidgetMap.getZoomForExtent(extent) >= parseFloat(minZoom)){

		map.controls.FullMapControl.prototype.centerOn_(ol.extent.getCenter(extent),minZoom);
	}
	else{
		WidgetMap.map.getView().fit(extent, WidgetMap.map.getSize());
	}
};

/**
 * Получить зум для переданного экстента
 * @param extent
 * @returns {number}
 */
ru.corelight.classes.map.BaseWidget.prototype.getZoomForExtent = function(extent){
	var viewSize =  WidgetMap.map.getSize();
	var idealResolution ;//= Math.max(extent[0]/viewSize[0],extent[1] / viewSize[1]);
	var view = WidgetMap.map.getView();
	var RESOLUTION_TOLERANCE = 0.000001;
	idealResolution = Math.max(ol.extent.getWidth(extent)/ viewSize[0], ol.extent.getHeight(extent) / viewSize[1]);//view.getResolutionForExtent(extent,viewSize);
	var offset;
	var resolution = idealResolution;

	if (goog.isDef(resolution)) {
		var res, z = 0;
		do {
			res = view.constrainResolution(view.maxResolution_, z);
			if (res < resolution && Math.abs(res - resolution) > RESOLUTION_TOLERANCE) {
				offset = z;
				break;
			}
			++z;
		} while (res > view.minResolution_);
	}
	return z + view.minZoom_ - 1;//view.maxResolution_ соответствует minZoom, поэтому добавляем. И отнимаем 1, как во флеш
};

/**
 * Получить зум для переданной resolution
 * @param resolution
 * @returns {number}
 */
ru.corelight.classes.map.BaseWidget.prototype.getZoomForResolution = function(resolution){
	var offset;
	var view = WidgetMap.map.getView();
	if (goog.isDef(resolution)) {
		var res, z = 0;
		do {
			res = view.constrainResolution(view.maxResolution_, z);
			if (res == resolution) {
				offset = z;
				break;
			}
			++z;
		} while (res > view.minResolution_);
	}

	return goog.isDef(offset) ? view.minZoom_ + offset : offset;
};

ru.corelight.classes.map.BaseWidget.prototype.createVectorLayer = function(){
	//добавляем на карту векторный слой для рисования
	var source = new ol.source.Vector();
	WidgetMap.currentVectorLayer = new ol.layer.Vector({
		source: source
	});
	WidgetMap.map.addLayer(WidgetMap.currentVectorLayer);
};
/**
 * Слой для выделения объектов на карте
 *
 */
ru.corelight.classes.map.BaseWidget.prototype.addMapSelectionLayer = function(){
	if(goog.isDef(WidgetMap.map)) {
		try {
			var vector = new ol.layer.Vector({
				source: new ol.source.Vector({
				})
			});
			WidgetMap.mapSelectionLayer = vector;
			WidgetMap.map.addLayer(WidgetMap.mapSelectionLayer);
		}
		catch (ex) {
		}
	}
};

//прячем подписи по инциденту #1505
ru.corelight.classes.map.BaseWidget.prototype.hideLabels = function(layerName,objects){
	var layer = WidgetMap.layerManager.getLayerByName(layerName);
	if(goog.isDef(layer) && goog.isDef(layer.layer)){
		//проходим по всем фичам и забираем по id Объекта геометрию из _globalPointLabels,
		var features = layer.layer.featureProjLayer.getSource().getSource().getFeatures();
		var i = 0;
		var j = 0;
		var hideGeos = [];
		for(j;j<objects.length;j++){
			i = 0;
			for(i;i<features.length;i++){
				//ищем только в multiPoint
				var oId = objects[j];
				if(features[i].getGeometry().getType() == ol.geom.GeometryType.MULTI_POINT && goog.isDef(features[i].get('pointsObj')) && goog.isDef(features[i].get('pointsObj')[oId])){
					var coords = features[i].get('pointsObj')[oId].flatCoordinates;
					hideGeos.push({id:oId, unique:features[i].get('labelType')+'_'+coords[0]+'_'+coords[1]});
				}
			}
		}
		WidgetMap.hideLabelsArr = hideGeos;
		layer.layer.featureProjLayer.changed();
	}
};
/**
 * Оставить на карте выбранные объекты
 * @param layerName
 * @param layerIds
 * @param that
 */
ru.corelight.classes.map.BaseWidget.prototype.selectFeatures = function (layerName, layerIds, that, findCallback) {
	if(!checkMapExisting())
		return;
	var layerObj = WidgetMap.layerManager.getLayerByName(layerName);
	if(goog.isDef(layerObj) && goog.isDef(layerObj.layer)) {
		if (!layerObj.layer.hasData) {//если данных нет в слое вообще
			if(findCallback)
				findCallback(false);
			else
				MapUtil.showObjectError(that, layerObj, this);
			return;
		}
		var features = WidgetMap.layerManager.getGeometryByLayerNameAndObjId(layerObj.layer,layerIds);
		MapUtil.clearSelectionLayer();
		if(features.length == 0){
			/*if(showObjectsIsGroupButton == true)//если нажата была групповая кнопка, то не показываем ошибки
			 return;*/
			if(findCallback)
				findCallback(false);
			else
				MapUtil.showObjectError(that, layerObj, this);
		}
		else{
			if(findCallback)
				findCallback(true);
			var layer = WidgetMap.layerManager.getLayerByName(layerName);
			if(goog.isDef(layer) && goog.isDef(layer.layer))
				layer.layer.showObjectsByIds(layerIds, that.showObjectsCentering);
			//прячем подписи для слоя
			//WidgetMap.hideLabels(layerName,layerIds);
		}

	}
};
ru.corelight.classes.map.BaseWidget.prototype.selectAndCenterByFoundedGeom = function(centering){
	//добавляем массив найденных фич в слой для выделений
	//если надо, масштабируемся
	if(WidgetMap.rasterLayersFeatures.length==0)
		return;
	WidgetMap.mapSelectionLayer.getSource().addFeatures(WidgetMap.rasterLayersFeatures);
	WidgetMap.rasterLayersFeatures = [];
	//зуммируемся к ним
	var extent = WidgetMap.mapSelectionLayer.getSource().getExtent();
	if(centering){
		WidgetMap.centerOnMap(extent);
	}
};
ru.corelight.classes.map.BaseWidget.prototype.setStartupScenario = function(){
	try{
		if (goog.isDefAndNotNull(WidgetMap.config)) {
			var tree = WidgetMap.config.tree;
			if(tree && tree.trees && tree.trees.length > 0){
				var startupScenario = tree.trees[0].startupScenario;
				if(startupScenario){
					var openLayers =  startupScenario.openLayers;
					if(openLayers){
						WidgetMap.startupLayers = openLayers;
						//меняем порядок слодования, чтобы при добавлении в список через pop добавлялся первый
						//WidgetMap.startupLayers =  WidgetMap.startupLayers.reverse();
					}
				}
			}
		}
		//если выполниласьт обработка сценария с показом слоёв
		if(App.scenarioParams && App.scenarioParams.vars){
			WidgetMap.startupLayers = App.scenarioParams.vars.openLayers;
			App.scenarioParams = undefined;
		}
	}
	catch(ex){}
}
ru.corelight.classes.map.BaseWidget.prototype.changeMapView = function(maxZoom, viewName, projection){
	throw new Error(gis_core_error_4);
};
/**
 * Проверяем, есть ли в url параметры, пришедшие из внешней системы
 * Если есть, то работаем через externalFunctionaAPI
 */
ru.corelight.classes.map.BaseWidget.prototype.checkExternalParamsFromURL = function(){
	throw new Error(gis_core_error_4);
};
/**
 * Реакция на нажатие ESC
 * @private
 */
ru.corelight.classes.map.BaseWidget.prototype.handleEscClick_ = function () {
	throw new Error(gis_core_error_4);
};


/*** STATIC  ***/
ru.corelight.classes.map.BaseWidget.getHideButtonsConfig = function(){
	var mapConfig = (WidgetMap.config && WidgetMap.config.map) ? WidgetMap.config.map: WidgetMap.config;
	if (mapConfig) {
		var buttons = mapConfig.hideButtons;
		if (goog.isDef(buttons)) {
			return buttons;
		}
	}
	return [];
};

WidgetMap = {};
WidgetMap.map = undefined;
WidgetMap.kinetic = null;//new ol.Kinetic(-0.005, 0.05, 100);//дефолтные настройки перемещения карты

_CURRENT_RENDERING_LAYERS = [];//массив слоёв, которые в данные момент перерисовываются полностью при отпускании мыши

WidgetMap.MAP_BUTTON_STATE = {
	PAN: 'pan',
	ZOOM: 'zoom',
	INFO: 'info',
	EDIT: 'edit',
	ROUTE: 'route',
	MEASURE: 'measure',
	DRAW: 'draw'
};

WidgetMap.MAP_NUM_ZOOM_LEVELS = 21;

//типы моделей, которые могут быть растровыми
WidgetMap.MULTI_MODE_LAYERS = [];
WidgetMap.MODES = {
	VECTOR: 'vector',
	RASTER: 'raster'
};
WidgetMap.COORD_MODES = {
	DECIMAL: 'decimal',
	GRAD: 'grad'
};

//поля с координатам, которые необходимо заменять на те, которые выставляены у пользователя
WidgetMap.COORD_FIELDS = ['X_COORD', 'Y_COORD', 'X', 'Y'];
//режим отображения координат
WidgetMap.coordMode = WidgetMap.COORD_MODES.DECIMAL;

WidgetMap.showOverviewMap = false;
//показывать рубрикатор свёрнутым при старте приложения или назвернутым
WidgetMap.showTree = true;
//флаг получения информации по кадастру через email, замена кукам в 7.7.0
WidgetMap.sendCadastreEmail = false;
//флаг показа центра карты и навигации по трубе
WidgetMap.showCenterMap = true;
//текущий режим отобраюения основных данных
WidgetMap.CURRENT_MODE = WidgetMap.MODES.VECTOR;

//текущая выбранная кнопка
WidgetMap.selectedMapButton = undefined;
//список удаленных с карты объектов, чтобы в дальнейшем была возможность их восстановить после закрытия панели свойств
WidgetMap.recentlyDeletedObjectsFromMap = {};
// объект на карте, который подвергается удалению узлов для корректного отката геометрии в случае закрытия панели свойств или ошибочная команда в БД
WidgetMap.currentCutFeature = {};

WidgetMap.BaseLayersParser = undefined;

WidgetMap.baseLayersControl = undefined;
//текущий контрол для рисования, чтобы могли из любых мест его удалить

//TODO переработать! забирать из map.getConntrols
WidgetMap.drawControl = undefined;
WidgetMap.panControl = undefined;
WidgetMap.searchControl = undefined;
WidgetMap.searchChooserControl = undefined;
WidgetMap.addObjectControl = undefined;
WidgetMap.moveGeometryControl = undefined;
WidgetMap.overviewMapControl = undefined;
WidgetMap.managelayersControl = undefined;
WidgetMap.zoomSliderControl = undefined;
WidgetMap.geometryLoaderControl = undefined;
WidgetMap.navigateRouteControl = undefined;
WidgetMap.mapCenterPointControl = undefined;
WidgetMap.infoControl = undefined;
WidgetMap.measureChooserControl = undefined;
WidgetMap.shareChoose = undefined;
WidgetMap.exportImageChooserControl = undefined;
WidgetMap.linkObjectControl = undefined;
WidgetMap.viewMapChoose = undefined;

//положение карты по умолчанию
WidgetMap.config = undefined;
WidgetMap.treeConfig = undefined;

WidgetMap.mapHistory = undefined;

//временный слой, в который помещается выделенный объект, чтобы прятать подписи
WidgetMap.tempLayerWithoutLabels = {layerName: '', allowText: true};

WidgetMap.currentMapButtonState = WidgetMap.MAP_BUTTON_STATE.PAN;

//текущие данные для привязки объекта при сохранении
WidgetMap.CURRENT_SAVING_BIND_GEOMETRY = undefined;
//текущие данные для привязки объекта при сохранении без геометрии
WidgetMap.CURRENT_SAVING_BIND_WO_GEOMETRY = undefined;

WidgetMap.canFirstTimeCentering = true;

/*  Какого типа модель в задачах(вектор или быстрые кеши). Используется, чтобы определить в каком виде изначально зуммироваться
 * через вектор или через сервис */
WidgetMap.isModelsVector = false;

WidgetMap.START_X = 30.1781558936;
WidgetMap.START_Y = 59.9872715363;
WidgetMap.START_ZOOM = 5;
WidgetMap.DEFAULT_PROJECTION = GeoUtil.PROJS.GoogleMercator;
WidgetMap.DEFALT_ZOOM_FOR_FONT = 18;//дефолтный масштаб для шрифта, который будет считаться базовым и от него будет высчитываться размер в пунктах для техсхемы
WidgetMap.DEFALT_FONT_SIZE = 15;
//границы ЛПУ, которые доступны пользователю
WidgetMap.LPURestrictExtent = [];
//масштаб, начиная с которого будет использоваться ограничение тайлов по ЛПУ
WidgetMap.LPURestrictZoom = undefined;

WidgetMap.currentMapId = undefined;
WidgetMap.baseLayer = undefined;
WidgetMap.isBaseLayerCadastre = false;
WidgetMap.isBaseLayerRosreestr = false;

WidgetMap.filterDataMessageId = undefined;//Это не ID запроса. Это сам текущий запрос на грид, который можно отменить через currentGridCountMessageId.abort()

//Фильтры верхнего уровня по-умолчанию, которые передаются в запрос
WidgetMap.currentTopFilter = [
	//{name: 'LPU_ACCESS_FILTER', value: '13332,0'}
];
//список предзагруженных ЛПУ, чтобы фильтры не подгружали данные;
WidgetMap.preloadLpuValues = undefined;
//теже предзагруженные ЛПУ, только в виде справочника с ключом по коду ЛПУ
WidgetMap.preloadLpuValuesDict = {};
//массив дефолтных идентификаторов ЛПУ для сверки с текущим. Если не совпадают с пользовательскими - гео данные из БД всегда
WidgetMap.defaultLpuIds = [];

//список route_id с их line_id
WidgetMap.preloadRoutesWithLinesList = undefined;


//Фильтры среднего уровня по-умолчанию, которые передаются в запрос
WidgetMap.currentRoughFilter = [];
//текущие фильтры для слоя
WidgetMap.currentFilter = {};
//фильтр, который передается из грида в грид
WidgetMap.transitFilter = {};

WidgetMap.layerManager = undefined;

//векторный слоя для рисования
WidgetMap.currentVectorLayer = undefined;

//векторный слоя для рисования маршрутов
WidgetMap.findPathLayer = undefined;
WidgetMap.findPathLineLayer = undefined;

//слой для рисования точек при расчете расстояний по оси трубы
WidgetMap.pipeLengthLayer = undefined;
//слой для буфера
WidgetMap.bufferLayer = undefined;

WidgetMap.mapSelectionLayer = undefined;
//текущий выбранный объект
WidgetMap.mapSelectedObject = undefined;


//слоя для видеомониторинга
WidgetMap.mapVideoMonitoringTrackLayer = undefined;
WidgetMap.mapVideoMonitoringPointLayer = undefined;

//флаг, можно ли искать в данной подложке по растрам
WidgetMap.showRasterInfo = false;

//базовое взаимодействие на карте. Чтобы была возможность менять его при режиме зуммирования, перемещения,..
WidgetMap.baseInteraction = undefined;
/*TODO потом всё объединить в объект с массивом интеракций для каждой кнопки*/
WidgetMap.baseInteractionEditGeometry = undefined;

//текущий групповой слой с данными из распарсенных настроек карты <Models>
WidgetMap.currentVectorGroupLayer = undefined;
WidgetMap.currentVectorGroupLayerModel = {};
//список интернет слоёв, у которых видимость включена в json
WidgetMap.defaultDisablePrint = false;

WidgetMap.isPrintDisabled_ = function() {
	if(WidgetMap.defaultDisablePrint)
		return true;
	var internetSrcDisable = (goog.isDef(App.config.INTERNET_SRC_DISABLE) && App.config.INTERNET_SRC_DISABLE.length > 0)?App.config.INTERNET_SRC_DISABLE:'';
	var internetSrcDisableSplit = internetSrcDisable.split(',');
	if(WidgetMap !== undefined && WidgetMap.baseLayersControl !== undefined){
		var blayersIds = [];
		//&& internetSrcDisableSplit.indexOf(WidgetMap.baseLayer.value)!=-1){

		return true;
	}
	return false;
};



WidgetMap.getTreeMaximizedFlag = function () {
	//TODO upd 21.01.20 если виджет то для него прячем рубрикатор. Принято решение хардкодить, потом убрать в настройки пользователя
	//для ili_widget показываем
	if(getParameterByName('w') === '1')// && getParameterByName('task').toLowerCase() !== 'ili_widget')
		WidgetMap.showTree = false;
	return WidgetMap.showTree;
};

WidgetMap.getShowErrorInGridDictationary = function () {
	if (goog.isDefAndNotNull(WidgetMap.config)) {
		var flag = WidgetMap.config.showErrorInGridDictionary;
		if (goog.isDef(flag))
			return flag;
	}
	return true;
};

WidgetMap.getTreePercentWidth = function () {
	if (goog.isDefAndNotNull(WidgetMap.config)) {
		var treePercentWidth = WidgetMap.config.treePercentWidth;
		if (goog.isDef(treePercentWidth)) {
			var percentWidth = parseInt(treePercentWidth);
			if (!isNaN(percentWidth) && percentWidth >= 0 && percentWidth <= 100)
				return percentWidth;
		}
	}
	return -1; //Возвращаем -1 если значение не определено или не число
};

var MIN_VISIBLE_RATIO = 0.001;
var MAX_LABEL_RATIO = 1.5;
var LABEL_FONT_RATIO = 0.9;
var LABEL_REPEAT_RATIO = 0.8;
var LABEL_CUT_TOLERANCE = 25;
var LABEL_CUT_RATIO = 0.2;
var LABEL_OFFSET = 0.2;
var LABEL_DRAW_TYPE = 'cut';

//Флаг, для первоначального отображения кнопки "показать трубопровод"
WidgetMap.getMapDrawParams = function () {
	var mode = getParameterByName('mode');
	if (mode !== '')
		WidgetMap.CURRENT_MODE = (mode === WidgetMap.MODES.RASTER) ? WidgetMap.MODES.RASTER : WidgetMap.MODES.VECTOR;
	WidgetMap.CURRENT_MODE = MapUtil.getAvailableMapMode(WidgetMap.CURRENT_MODE);
	var mapConfig = (WidgetMap.config && WidgetMap.config.map) ? WidgetMap.config.map: WidgetMap.config;
	if (mapConfig) {
		if (mapConfig.MAP_Label_Len_Ratio !== undefined)
			MAX_LABEL_RATIO = parseFloat(mapConfig.MAP_Label_Len_Ratio);
		if (mapConfig.MAP_Len_Ratio !== undefined)
				MIN_VISIBLE_RATIO = parseFloat(mapConfig.MAP_Len_Ratio);
		if (mapConfig.MAP_Label_Font_Ratio !== undefined)
				LABEL_FONT_RATIO = parseFloat(mapConfig.MAP_Label_Font_Ratio);
		if (mapConfig.MAP_Label_Repeat_Ratio !== undefined)
				LABEL_REPEAT_RATIO = parseFloat(mapConfig.MAP_Label_Repeat_Ratio);
		if (mapConfig.MAP_Label_Cut_Tolerance !== undefined)
                LABEL_CUT_TOLERANCE = parseFloat(mapConfig.MAP_Label_Cut_Tolerance);
		if (mapConfig.MAP_Label_Cut_Ratio !== undefined)
                LABEL_CUT_RATIO = parseFloat(mapConfig.MAP_Label_Cut_Ratio);
		if (mapConfig.MAP_Label_Offset !== undefined)
				LABEL_OFFSET = parseFloat(mapConfig.MAP_Label_Offset);
		if (mapConfig.MAP_Label_Draw_Type !== undefined)
                LABEL_DRAW_TYPE = mapConfig.MAP_Label_Draw_Type;
		if (mapConfig.MAP_Use_Kinetic !== undefined && mapConfig.MAP_Use_Kinetic)
				WidgetMap.kinetic = new ol.Kinetic(-0.005, 0.05, 100);
		if (mapConfig.MAP_Num_Zoom_Levels !== undefined)
			WidgetMap.MAP_NUM_ZOOM_LEVELS = parseFloat(mapConfig.MAP_Num_Zoom_Levels);
		if (mapConfig.MAP_Centering_Min_Zoom !== undefined)
			App.config.MAP_CENTERING_MIN_ZOOM = parseFloat(mapConfig.MAP_Centering_Min_Zoom);
		//устанавливаем режим в том случае, если из url он не приходил
		//забирается из UserSettings
		/*if (App.config.MAP_MODE !== undefined)
			WidgetMap.CURRENT_MODE = App.config.MAP_MODE;*/

		//TODO upd. 21.01.20 хардкод. Если виджеты, то всё сворачиваем и растровый режим
		if(getParameterByName('w') === '1'){
			WidgetMap.sendCadastreEmail = false;
			WidgetMap.CURRENT_MODE = WidgetMap.MODES.RASTER;
			WidgetMap.showCenterMap = false;
			WidgetMap.showOverviewMap = false;
		}
	}
};

WidgetMap.init = function () {
	CURRENT_MAP_TYPE = MAP_TYPE.MAP;
	WidgetMap.getMapDrawParams();
	WidgetMap.addMap();
	//загружаем дефолтные стили
	if (!goog.isDefAndNotNull(WidgetMap.layerManager))
		WidgetMap.layerManager = new LayerManager({layersReadyCallback: WidgetMap.layersAndStylesParsed});
	WidgetMap.layerManager.loadDefaultStyles('Default_STYLE.xml', "default_map_style.xml");

	//добавляем базовый слой
	WidgetMap.addBaseLayer();
	WidgetMap.addModelLayers();
	WidgetMap.addMapSelectionLayer();
	WidgetMap.addBufferLayer();
	WidgetMap.addVideoMonitoringLayer();
	WidgetMap.addBaseControls();
	//посылаем событие taskReady
	taskReady('mapReady', true);
};

WidgetMap.addMap = function () {
	var mapX = WidgetMap.START_X;
	var mapY = WidgetMap.START_Y;
	var mapZoom = WidgetMap.START_ZOOM;
	if (App.config && App.config.POSITION_X &&
		App.config.POSITION_Y &&
		App.config.POSITION_ZOOM){
		mapX = parseFloat(App.config.POSITION_X);
		mapY = parseFloat(App.config.POSITION_Y);
		mapZoom = parseInt(App.config.POSITION_ZOOM);
		WidgetMap.canFirstTimeCentering = false;
		WidgetMap.START_X = mapX;
		WidgetMap.START_Y = mapY;
		WidgetMap.START_ZOOM = mapZoom;
	}
	var mapConfig = (WidgetMap.config && WidgetMap.config.map) ? WidgetMap.config.map: WidgetMap.config;
	var position = mapConfig.position;
	//пытаемся читать из конфига
	if(position && ((position.x && position.y) || position.zoom)){
		if(goog.isDef(position.x))
			mapX = parseFloat(position.x);
		WidgetMap.START_X = mapX;
		if(goog.isDef(position.y))
			mapY = parseFloat(position.y);
		WidgetMap.START_Y = mapY;
		if(goog.isDef(position.zoom))
			mapZoom = parseFloat(position.zoom);
		WidgetMap.START_ZOOM = mapZoom;
		WidgetMap.canFirstTimeCentering = false;
	}

	var mapId = getParameterByName('mapId');
	if(mapId !== '')
		WidgetMap.currentMapId = mapId;
	//если в url лежат зум, центр, текущий режим, то меняем их
	if (getParameterByName('ll') !== '') {
		var splitterLL = getParameterByName('ll').split(',');
		if (goog.isDef(splitterLL[0]))
			mapX = parseFloat(splitterLL[0]);
		if (goog.isDef(splitterLL[1]))
			mapY = parseFloat(splitterLL[1]);
		WidgetMap.canFirstTimeCentering = false;
	}
	if (getParameterByName('func') === 'findExternalObject' || getParameterByName('func') === 'findExternalPipeKm'
		|| getParameterByName('func') === 'findExternalPipePart' || getParameterByName('func') === 'refreshLayer') {
		//убираем флаг центровки
		WidgetMap.canFirstTimeCentering = false;
	}
	if (getParameterByName('z') !== '') {
		mapZoom = parseFloat(getParameterByName('z'));
		WidgetMap.canFirstTimeCentering = false;
	}
	var arr = ol.proj.transform([mapX, mapY], 'EPSG:4326', 'EPSG:3857');
	//устанавливаем дефолтные элементы взаимодействия
	var interactions = new ol.Collection();
	//устанавливаем базовое взаимодействие на карте
	WidgetMap.baseInteraction = new ol.interaction.DragPan({
		kinetic: (goog.isDef(WidgetMap.kinetic)) ? WidgetMap.kinetic : null
	});
	interactions.push(WidgetMap.baseInteraction);
	//зуммирование по колесику мыши
	interactions.push(new ol.interaction.MouseWheelZoom({
		duration: 0
	}));
	//перемещение по стрелкам
    interactions.push(new ol.interaction.KeyboardPan ());

	ol.MOUSEWHEELZOOM_TIMEOUT_DURATION = 800;

	proj4.defs("EPSG:3395", "+title=Yandex +proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs");
	ol.proj.get('EPSG:3395').setExtent(
		[-20037508.342789244, -20037508.342789244, 20037508.342789244, 20037508.342789244]
	);
	//добавляем проекцию 'EPSG:2154' (проекция Ламберта), чтобы не искажались площади
	proj4.defs("EPSG:2154","+title=RGF93 / Lambert-93 +proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs");
	//25.10.18 из-за подгрузки карты после загрузки слоёв,
	// у них не корректно выставлялись границы видимости от view.resolutions - брались дефолтные у view
	var resolutions = MapUtil.setDefaultResolutions();

	//устанавливаем карту
	WidgetMap.map = new ol.Map({
		target: 'map',
		renderer: 'canvas',
		ol3Logo: false,
		view: new ol.View({
			maxZoom: WidgetMap.MAP_NUM_ZOOM_LEVELS,
			projection: WidgetMap.DEFAULT_PROJECTION,
			minZoom: 4,
			center: arr,
			zoom: mapZoom,
			resolutions:resolutions
		}),
		interactions: interactions,
		controls: new ol.Collection().extend([
			new map.control.ScaleTextControl(),
			new map.control.ScaleLineControl()
		])
	});

	//фокус на карту, чтобы при старте приложения были доступны кнопки перемещения карты
	$('#map').focus();
	function onPreCompose(evt) {
		_CURRENT_RENDERED_LAYERS = [];
		_CONTEXT = evt.context;
		_visibleMatrix = {};
		WidgetMap.regenerateMatrix('label');
	}

	function onPostCompose(evt) {
		if (_pointLabels.length > 0 && _LABELS.length == 0) {//если на экстенте карты нет точечных объектов
			_LABELS = _pointLabels;
		}
		else
			_pointLabels = _LABELS;

		var i = _LABELS.length - 1;
		for (i; i >= 0; i--) {
			_LABELS[i]['finded'] = false;
			_LABELS[i].hide = false;
		}
		//когда мы закончили рендерить, нужно отбросить неиспользуемые подписи
		var t = 0;
		if (_LABELS.length > 0) {
			for (t; t < _CURRENT_RENDERING_LAYERS.length; t++) {
				var i = _LABELS.length - 1;
				for (i; i >= 0; i--) {
					if (_LABELS[i].unique.indexOf(_CURRENT_RENDERING_LAYERS[t]) != -1)
						_LABELS[i]['finded'] = true;
				}
			}
		}

		//удаляем
		var i = _LABELS.length - 1;
		for (i; i >= 0; i--) {
			if (_LABELS[i].finded != true)
				_LABELS.splice(i, 1);
		}
		if (goog.isDef(WidgetMap.hideLabelsArr)) {
			var t = 0;
			for (t; t < WidgetMap.hideLabelsArr.length; t++) {
				var k = 0;
				for (k; k < _LABELS.length; k++) {
					if (_LABELS[k].unique == WidgetMap.hideLabelsArr[t].unique) {
						_LABELS[k].hide = true;
						break;
					}
				}
			}
		}
		if (_LABELS.length > 0) {
			var context = evt.context;
			var i = 0;
			for (i; i < _LABELS.length; i++) {
				var obj = _LABELS[i];
				//если есть флаг, то не отрисовываем подпись
				if (obj.hide == true)
					continue;
				var coordsXY = WidgetMap.map.getPixelFromCoordinate([obj.coordX, obj.coordY]);
				coordsXY[0]*=getBrowserZoom();
				coordsXY[1]*=getBrowserZoom();
				obj.x = coordsXY[0] + obj.textStyle.offsetX_;
				obj.y = coordsXY[1] + obj.textStyle.offsetY_;
				var tf = obj.textStyle.getFont()
				/*if(tf.indexOf(' -1px ') !== -1){
					var fontSize = GeoUtil.getFontSizeByZoom();
					var offset = GeoUtil.getOffsetByZoom();
					tf = tf.replace(' -1px ', ' ' + fontSize + 'px ');
					obj.y -= offset;
				}*/
				context.font = tf;//obj.textStyle.getFont();
				context.textAlign = obj.textStyle.getTextAlign();
				context.textBaseline = obj.textStyle.getTextBaseline();
				obj.localTransform = _TRANSFORM;
				if (obj.scale != 1 || obj.rotation !== 0) {
					ol.vec.Mat4.makeTransform2D(
						obj.localTransform, obj.x, obj.y, obj.scale, obj.scale, obj.rotation, -obj.x, -obj.y);
					context.setTransform(
						goog.vec.Mat4.getElement(obj.localTransform, 0, 0),
						goog.vec.Mat4.getElement(obj.localTransform, 1, 0),
						goog.vec.Mat4.getElement(obj.localTransform, 0, 1),
						goog.vec.Mat4.getElement(obj.localTransform, 1, 1),
						goog.vec.Mat4.getElement(obj.localTransform, 0, 3),
						goog.vec.Mat4.getElement(obj.localTransform, 1, 3));
				}

				if (obj.stroke) {
					context.lineWidth = 2;
					context.strokeStyle = '#fff';//obj.textStyle.getStroke().getColor();
					context.strokeText(obj.text, obj.x, obj.y);
				}
				if (obj.fill) {
					context.fillStyle = obj.textStyle.getFill().getColor();
					context.fillText(obj.text, obj.x, obj.y);
				}
				if (obj.scale != 1 || obj.rotation !== 0) {
					context.setTransform(1, 0, 0, 1, 0, 0);
				}
			}
		}
		_IS_FULL_REDRAW = false;
	}

	function onMoveEnd(evt) {
		if (goog.isDef(WidgetMap)) {
			var i = 0;
			var needCenteringLayers = WidgetMap.layerManager.getNeedCenteringLayers();
			for (; i < needCenteringLayers.length; i++) {
				needCenteringLayers[i].canFirstTimeCentering = false;
			}
		}
		_IS_FULL_REDRAW = true;
		_TEMP_LAYERS_LABELS = {};
	}

	WidgetMap.map.on('precompose', onPreCompose);
	WidgetMap.map.on('postcompose', onPostCompose);
	//TODO такое же событие повесить на движение обзорной карты
	WidgetMap.map.on('moveend', onMoveEnd);

	//создаем объект для работы с табнейлами
	//TODO PREVIEW
	/*var preview = new PreviewPopUp({map: WidgetMap.map});
	preview.build();*/

	WidgetMap.mapHistory = new MapHistory({map: WidgetMap.map});

	//добавляем на карту листенер по esc, отменять все интеракции и включать ладошку
	$('body').on('keyup', function (event) {
		if (event.keyCode == 27 && WidgetMap.currentMapButtonState != WidgetMap.MAP_BUTTON_STATE.PAN) {
			if (goog.isDef(WidgetMap.baseInteraction) && goog.isDef(WidgetMap.baseInteraction.box_)) {
				WidgetMap.baseInteraction.box_.setMap(null);
			}
			WidgetMap.handleEscClick_();
		}
	});

};
/**
 * Реация на нажатие ESC
 * @private
 */
WidgetMap.handleEscClick_ = function () {
	BlockingUtil.wait();
	try {
		//прячем попап с измерениями линейкой
		if(map.controls.MeasureControl)
			map.controls.MeasureControl.reset()
		if (goog.isDef(WidgetMap.baseInteraction) && goog.isDef(WidgetMap.baseInteraction.abortDrawing_))
			WidgetMap.baseInteraction.abortDrawing_();
		if (goog.isDef(WidgetMap.currentVectorLayer))
			WidgetMap.currentVectorLayer.getSource().clear();
		WidgetMap.map.removeInteraction(WidgetMap.baseInteraction);
		WidgetMap.map.removeInteraction(WidgetMap.baseInteractionEditGeometry);
		WidgetMap.map.removeControl(WidgetMap.drawControl);
		//удалить interaction и выставить ладошку
		if(goog.isDef(WidgetMap.panControl))
			map.controls.PanControl.prototype.handlePanClick_();
        //WidgetMap.infoControl.handleMapInfoClick_();

	}
	catch (ex) {}
	finally {
		BlockingUtil.ready();
	}
};

/**
 * Закрыть выпадающий список кнопок
 * @private
 */


//создаем 2 флага, чтобы различать, было ли просто вкл/выкл видимости из рубрикатора или движение карты
var _TEMP_LAYERS_LABELS = {};// временные подписи, если просто вкл/выкл видимость слоя
var _IS_CHANGE_LAYER_VISIBILITY = {};//заносим сюда подписи из отдельных слоев
var _IS_FULL_REDRAW = false; // в этом случае перерисовывается все векторы, т.к. зхуммировались или т.п.

var _CURRENT_RENDERED_LAYERS = [];

WidgetMap.stubMatrixLayer = undefined;
WidgetMap.stubTextLayer = undefined;
createTextExtentLayer = function(){
	if(!WidgetMap.stubTextLayer){
		WidgetMap.stubTextLayer = new ol.layer.Vector({
			source: new ol.source.Vector(),
			id: 'stubTextLayer',
		});
		WidgetMap.map.addLayer(WidgetMap.stubTextLayer);
	}
};
generateStubMatrixLayer = function(){
	if(!WidgetMap.stubMatrixLayer){
		WidgetMap.stubMatrixLayer = new ol.layer.Vector({
			source: new ol.source.Vector(),
			id: 'stubMatrixLayer',
		});
		WidgetMap.map.addLayer(WidgetMap.stubMatrixLayer);

	}
	WidgetMap.stubMatrixLayer.getSource().clear()
	var lineMatrixGeo = new ol.geom.MultiLineString(null);
	//формируем линии матрицы
	//_visibleTextMatrix['kap_remont_label']
	//добавляем вертикальные
	for(var i = 0; i < 200; i++){
		var pntLeft = [0, i * _dx];
		var pntRight = [200 * _dx, i * _dx];
		pntLeft = WidgetMap.map.getCoordinateFromPixel(pntLeft);
		pntRight = WidgetMap.map.getCoordinateFromPixel(pntRight);
		var lineAddGeo = new ol.geom.LineString([pntLeft,pntRight],ol.geom.GeometryLayout.XY);
		//Добавляем незаметные линии по вертикали, чтобы удобнее было просматривать километры
		lineMatrixGeo.appendLineString(lineAddGeo);
	}
	//горизонтальные линии
	for(var j = 0; j < 200; j++){
		var pntTop = [j * _dx, 0];
		var pntBottom = [j * _dx, 200 * _dy];
		pntTop = WidgetMap.map.getCoordinateFromPixel(pntTop);
		pntBottom = WidgetMap.map.getCoordinateFromPixel(pntBottom);
		var lineAddGeo = new ol.geom.LineString([pntTop,pntBottom],ol.geom.GeometryLayout.XY);
		//Добавляем незаметные линии по вертикали, чтобы удобнее было просматривать километры
		lineMatrixGeo.appendLineString(lineAddGeo);
	}

	var lineMatrixGeoFtr = new ol.Feature(lineMatrixGeo);
	lineMatrixGeoFtr.setStyle(function(){ //стили ПКА берем за основу полувидимых линий
			var s = WidgetMap.layerManager.getStyleByNameAndType('CAS_LIGHT_AXES', 'LineString');
			if(!goog.isNull(s)) {
				if (goog.isArray(s))
					return [s];
				return [s];
			}
		}
	);
	WidgetMap.stubMatrixLayer.getSource().addFeature(lineMatrixGeoFtr);
}

WidgetMap.regenerateMatrix = function (layerId) {
	//Значение ширины, которое добавляется к матрице слева и справа,
	//чтобы при разрядке точечные объекты не пропадали как только их центр выйдет за границы карты
	var matrixAddWidth = _dx;
	//Значение высоты, которое добавляется к матрице сверху и снизу,
	//чтобы при разрядке точечные объекты не пропадали как только их центр выйдет за границы карты
	var matrixAddHeight = _dy;
	var i = Math.ceil((WidgetMap.map.getSize()[0] * 2 + matrixAddWidth * 2) / _dx);
	var j = Math.ceil((WidgetMap.map.getSize()[1] * 2 + matrixAddWidth * 2) / _dy);
	_visibleMatrix[layerId] = new Array(i);
	var k = 0;
	for (k; k < i; k++) {
		_visibleMatrix[layerId][k] = new Array(j);
	}
	if (layerId === 'label' || layerId === 'kap_remont_label') {
		i = Math.ceil((WidgetMap.map.getSize()[0] * 2 + matrixAddWidth * 2) / _dx);
		j = Math.ceil((WidgetMap.map.getSize()[1] * 2 + matrixAddHeight * 2) / _dy);
		_visibleTextMatrix[layerId] = new Array(i);
		var k = 0;
		for (k; k < i; k++) {
			_visibleTextMatrix[layerId][k] = new Array(j);
		}
	}
	return;
	generateStubMatrixLayer();
	createTextExtentLayer();
};

WidgetMap.addBaseLayer = function () {
	if (WidgetMap.map) {
		try {
			//добавляем базовые слои на карту
			if(WidgetMap.BaseLayersParser)
				WidgetMap.map.addLayer(WidgetMap.BaseLayersParser.currentBaseLayers);
			//добавляем кнопку на карту
			WidgetMap.baseLayersControl = new map.controls.LayersControl({baseLayers:WidgetMap.BaseLayersParser.rasterLayers});
			WidgetMap.map.addControl(WidgetMap.baseLayersControl);
		}
		catch (ex) {
		}
	}

};


WidgetMap.addModelLayers = function () {
	if (!goog.isDef(WidgetMap.currentVectorGroupLayer)) {
		//добавляем групповой слой на карту
		WidgetMap.currentVectorGroupLayer = new ol.layer.Group();
		WidgetMap.map.addLayer(WidgetMap.currentVectorGroupLayer);

		if (!goog.isDefAndNotNull(WidgetMap.layerManager))
			WidgetMap.layerManager = new LayerManager();

		var models = WidgetMap.config.vectorlayers;
		WidgetMap.isModelsVector = true;
		var mapConfig = (WidgetMap.config && WidgetMap.config.map) ? WidgetMap.config.map: WidgetMap.config;
		var canRasterArr = mapConfig.canRaster;
		var mixedLayer = {};
		if(goog.isDef(canRasterArr)){
			for(var i=0; i< canRasterArr.length; i++){
				var el = canRasterArr[i].split(':');
				mixedLayer[el[0]] = el[1];

			}
		}
		var mapOrder = 0;
		for(var i=0;i < models.length; i++){
			var modelName = models[i];
			var canRaster = mixedLayer[modelName];
			var name = modelName.replace('_Layers.xml','');
			if (canRaster)
				WidgetMap.MULTI_MODE_LAYERS.push(modelName);
			if (goog.isDefAndNotNull(name)) {
				WidgetMap.currentVectorGroupLayerModel[modelName] = new ol.layer.Group();
				if (name == 'PODS_INSP') {
					WidgetMap.currentVectorGroupLayerModel[modelName+'1'] = new ol.layer.Group();
					WidgetMap.currentVectorGroupLayerModel[modelName+'2'] = new ol.layer.Group();
				}
				WidgetMap.layerManager._vectorMapOrders[name] = mapOrder++;
				WidgetMap.layerManager.parseLayersDescr(modelName);
			}
		}
	}
};

WidgetMap.createVectorLayer = function () {
	//добавляем на карту векторный слой для рисования
	var source = new ol.source.Vector();
	WidgetMap.currentVectorLayer = new ol.layer.Vector({
		source: source
	});
	WidgetMap.map.addLayer(WidgetMap.currentVectorLayer);
};

/*
 Фильтрация геометрии из грида
 */
WidgetMap.filterData = function (params) {
	if(WidgetMap.filterDataMessageId !== undefined){
		WidgetMap.filterDataMessageId.abort();
	}
	var that = this;
	that.showObjectsCentering = true;
	that.showObjectsValue = '';
	that.showObjectsRequest = '';
	that.showObjectFilterXML = '';
	that.showObjectsIsGroupButton = false;
	that.showObjectsSelect = false;
	that.showObjectsLayerName = '';
	var i;
	for (i = 0; i < params.length; i++) {
		var objects = params[i];
		if (objects.name === "objects") that.showObjectsValue = objects.value;
		if (objects.name === "requestId") that.showObjectsRequest = objects.value;
		if (objects.name === "layer") that.showObjectsLayerName = objects.value;
		if (objects.name === "zoom") that.showObjectsCentering = (objects.value == 'true' || objects.value == true);
		if (objects.name === "highlight") that.showObjectsSelect = (objects.value == 'true' || objects.value == true);
		if (objects.name === "isGroupButton") that.showObjectsIsGroupButton = (objects.value == 'true' || objects.value == true);
		if (objects.name === "filterXML") that.showObjectFilterXML = objects.value;
	}
	function getLayerGeoReqParams(filter, request) {
		var userId = AbstractFormDialog.sendUser ? '' + Auth.getUserId() : '-1';
		var userLogin = AbstractFormDialog.sendUser ? '' + Auth.getUserName() : 'guest';
		return {
			getSchema: false,
			descrId: request,
			toElements: false,
			descrType: 'select',
			data: '<root USER_ID="' + userId.xmlEscape() + '" USER_LOGIN="' + userLogin.xmlEscape() + '" PODS_USER="' + userLogin.xmlEscape() + '" >' +
			filter +
			'</root>'
		};
	}

	function getLayerGeoResult(resultXml) {
		var er = HTTPServiceUtil.getError(resultXml);
		if (er !== ''){
			App.errorReport(gis_core_error_1, er, undefined, {filename:gis_filename_3, functionname:'gis_filename_3_1'});
			return;
		}
		var layerGeoXml = ($.parseXML(resultXml)).firstChild;
		var datas = layerGeoXml.getElementsByTagName("data");
		var objectsStr = '';
		var objects = [];
		var layerObj = (WidgetMap.layerManager)?WidgetMap.layerManager.getRasterLayerByName(that.showObjectsLayerName):undefined;
		var dataLength = datas.length;

		var showDialog = false;
		if (layerObj &&  WidgetMap.CURRENT_MODE === WidgetMap.MODES.RASTER && dataLength > 100) {
			dataLength = 101;
			showDialog = true;
		}

		for (var t = 0; t < dataLength; t++) {
			var idAttr = datas[t].getAttribute("ID");
			objectsStr += idAttr + ',';
			objects.push(idAttr);
		}
		objectsStr = that.showObjectsLayerName + ':' + objectsStr.substr(0, objectsStr.length - 1);
		//формируем объект для вызова WidgetMap.showObjects;
		var objParams = [];
		objParams.push({name: 'centering', value: that.showObjectsCentering});
		objParams.push({name: 'objects', value: objectsStr});
		objParams.push({name: 'isGroupButton', value: true});
		objParams.push({name: 'select', value: that.showObjectsSelect});
		objParams.push({name: 'fromFilter', value: true});
		var dlg;
		function closeDialog() {
			if (goog.isDef(dlg)) {
				dlg.dialog('destroy');
				dlg.remove();
			}
		}
		if (!goog.isDef(layerObj) || WidgetMap.CURRENT_MODE === WidgetMap.MODES.VECTOR) {//слой векторный
			function showAlertVectorDialog() {
				WidgetMap.showObjects(objParams, undefined, false, true);
				closeDialog();
			}
			if (showDialog) {
				var buttons = [{text: gis_core_12, click: showAlertVectorDialog}];
				dlg = App.confirmDialog(gis_widgetmap_21, buttons, {
					title: gis_widgetmap_22,
					dialogClass: 'noCloseButton gsi-zindex__dialog'
				});
			}
			else
				WidgetMap.showObjects(objParams, undefined, false, true);
		}
		else {

			function showAlertDialog() {
				//растровые слои, для которых получаем выделение.
				WidgetMap.rasterLayersObj = [];
				WidgetMap.rasterLayersObj = objects;
				WidgetMap.rasterLayersFeatures = [];//массив фич
				//индекс текущего обрабатываемого растрового слоя
				//слой растровый
				WidgetMap.currentRasterLayerInd = WidgetMap.rasterLayersObj.length - 1;

				MapUtil.clearSelectionLayer();
				if (goog.isDef(layerObj) && goog.isDef(layerObj.dataProvider) && goog.isDef(layerObj.dataProvider.spatial)) {
					WidgetMap.processRasterLayerGeometry(layerObj.dataProvider.spatial, that.showObjectsCentering);
				}
				closeDialog();
			}

			if (showDialog) {
				var buttons = [{text: gis_core_12, click: showAlertDialog}];
				dlg = App.confirmDialog(gis_widgetmap_21, buttons, {
					title: gis_widgetmap_22,
					dialogClass: 'noCloseButton gsi-zindex__dialog'
				});
			}
			else
				showAlertDialog();
		}
	}

	function getLayerGeoFault(resultXml) {
		var er = HTTPServiceUtil.getError(resultXml);
		if (er !== '')
			App.errorReport(gis_core_error_1, er, undefined, {filename:gis_filename_3, functionname:'gis_filename_3_2'});
	}
	WidgetMap.filterDataMessageId = App.serverQueryXMLNode(Services.processQueryNode, getLayerGeoReqParams(that.showObjectFilterXML, that.showObjectsRequest), getLayerGeoResult, getLayerGeoFault);
};


WidgetMap.getLayerGeoReqParams = function (filter, request) {
	var userId = AbstractFormDialog.sendUser ? '' + Auth.getUserId() : '-1';
	var userLogin = AbstractFormDialog.sendUser ? '' + Auth.getUserName() : 'guest';
	var topFiltersStr = LayerManager.getTopFiltersString(WidgetMap.currentTopFilter);
	return {
		getSchema: false,
		descrId: request,
		toElements: false,
		descrType: 'select',
		data: '<root USER_ID="' + userId.xmlEscape() +
		'" USER_LOGIN="' + userLogin.xmlEscape() +
		'" PODS_USER="' + userLogin.xmlEscape() +
		'" ' + topFiltersStr + '' +
		'>' +
		'<data FILTER="ID=' + filter + '"/>' +
		'</root>'
	};
};

WidgetMap.selectAndCenterByFoundedGeom = function (centering) {
	//добавляем массив найденных фич в слой для выделений
	//если надо, мосштабируемся
	if (WidgetMap.rasterLayersFeatures.length == 0)
		return;
	WidgetMap.mapSelectionLayer.getSource().addFeatures(WidgetMap.rasterLayersFeatures);
	WidgetMap.rasterLayersFeatures = [];
	//зуммируемся к ним
	var extent = WidgetMap.mapSelectionLayer.getSource().getExtent();
	if (centering) {
		WidgetMap.centerOnMap(extent);
	}

};

/**
 * Запрашиваем по идентификаторам геометрию. Когда подгрузится - обновляем экстент карты
 */
WidgetMap.processRasterLayerGeometry = function (request, centering) {
	if (goog.isDef(WidgetMap.rasterLayersObj) && WidgetMap.rasterLayersObj.length > 0) {
		var curId = WidgetMap.rasterLayersObj[WidgetMap.currentRasterLayerInd];
		if (goog.isDef(curId)) {
			function getLayerGeoFault(resultXml) {
				var er = HTTPServiceUtil.getError(resultXml);
				if (er !== '')
					App.errorReport(gis_core_error_1, er, undefined, {filename:gis_filename_3, functionname:'gis_filename_3_5'});
				BlockingUtil.ready();
				WidgetMap.currentRasterLayerInd--;
				//Запускаем центровку по найденной геометрии, если больше растровых слоев не осталось
				if (WidgetMap.currentRasterLayerInd < 0)
					WidgetMap.selectAndCenterByFoundedGeom(centering);
				else
					WidgetMap.processRasterLayerGeometry(request, centering);
				
			}

			function getLayerGeoResult(resultXml) {
				BlockingUtil.ready();
				WidgetMap.currentRasterLayerInd--;
				try { // Иногда ответ в формате XML, а иногда в виде просто строки
					var er = HTTPServiceUtil.getError(resultXml);
					if (er !== ''){
						App.errorReport(gis_core_error_1, er, undefined, {filename:gis_filename_3, functionname:'gis_filename_3_3'});
					}
					else{
						var layerGeoXml = ($.parseXML(resultXml)).firstChild;
						var datas = layerGeoXml.getElementsByTagName("data");
						var stride = 2;
						for (var i = 0; i < datas.length; i++) {
							//парсим фичу, меняем проекцию, добавляем в слой для выделенных объектов
							var format = new ol.format.WKT({dimension: stride});
							var wktStr = datas[i].getAttribute("WKT");//;"POINT(-1 -1)";
							var fGeometry = undefined;
							try {
								fGeometry = format.readGeometry(wktStr);
							}
							catch (ex) {
								//для случая с видеозаписями, приходит 3 координаты
								stride = 3;
								format = new map.format.WKT({dimension: stride});
								fGeometry = format.readGeometry(wktStr);
							}
							if (fGeometry.getType() == 'Point') {
								if (fGeometry.flatCoordinates[0] == -1 && fGeometry.flatCoordinates[1] == -1)
									continue;
							}
							GeoUtil.convertGeometry(fGeometry, App.projection, WidgetMap.DEFAULT_PROJECTION);
							var ff = new ol.Feature(fGeometry);
							if(WidgetMap.layerManager)
								WidgetMap.layerManager.setDefaultSelectionStyle(ff);
							WidgetMap.rasterLayersFeatures.push(ff);
						}
					}
				}
				catch (ex) {}
				finally {
					if (WidgetMap.currentRasterLayerInd < 0)
						WidgetMap.selectAndCenterByFoundedGeom(centering);
					else
						WidgetMap.processRasterLayerGeometry(request, centering);
				}
			}

			//Для выделения объекта получаем его слой и используем его dataProvider.spatial для запроса с условием
			BlockingUtil.wait();
			App.serverQueryXMLNodeWithTries(Services.processQueryNodeGeo, WidgetMap.getLayerGeoReqParams(curId, request), getLayerGeoResult, getLayerGeoFault,4);
		}
		else {
			WidgetMap.currentRasterLayerInd--;
			//Запускаем центровку по найденной геометрии, если больше растровых слоев не осталось
			if (WidgetMap.currentRasterLayerInd < 0) {
				WidgetMap.selectAndCenterByFoundedGeom(centering);
			}
			else
				WidgetMap.processRasterLayerGeometry(request, centering);
		}
	}

};

/**
 * Оставить на карте выбранные объекты
 * @param layerName
 * @param layerIds
 * @param that
 */
WidgetMap.selectFeatures = function (layerName, layerIds, that, findCallback) {
	if(!checkMapExisting())
		return;
	var layerObj = WidgetMap.layerManager.getLayerByName(layerName);
	if (goog.isDef(layerObj) && goog.isDef(layerObj.layer)) {
		if (!layerObj.layer.hasData) {//если данных нет в слое вообще
			MapUtil.showObjectError(that, layerObj, this);
			return;
		}
		var features = WidgetMap.layerManager.getGeometryByLayerNameAndObjId(layerObj.layer, layerIds);
		MapUtil.clearSelectionLayer();
		if (features.length == 0) {
			/*if(showObjectsIsGroupButton == true)//если нажата была групповая кнопка, то не показываем ошибки
			 return;*/
			//если выборка из грида, и не нашли объекты, то не выдаем ошибки
			if(that.showObjectsFromFilter === true){
				layerObj.layer.showObjectById([-99999999999], false);
				return;
			}
			if(findCallback)
				findCallback(false);
			else
				MapUtil.showObjectError(that, layerObj, this);
		}
		else {
			if(findCallback)
				findCallback(true);
			layerObj.layer.showObjectsByIds(layerIds, that.showObjectsCentering);
			//прячем подписи для слоя
			//WidgetMap.hideLabels(layerName,layerIds);
		}

	}
};

/**
 * Подсветить на карте выбранные объекты
 * @param layerName
 * @param layerIds
 * @param that
 */
WidgetMap.highlightFeatures = function (layerName, layerIds, that, findCallback) {
	var layerObj = WidgetMap.layerManager.getLayerByName(layerName);
	if (goog.isDef(layerObj) && goog.isDef(layerObj.layer)) {
		if (!layerObj.layer.hasData) {//если данных нет в слое вообще
			MapUtil.showObjectError(that, layerObj, this);
			return;
		}
		var features = WidgetMap.layerManager.getGeometryByLayerNameAndObjId(layerObj.layer, layerIds);
		MapUtil.clearSelectionLayer();
		if (features.length == 0) {
			/*if(showObjectsIsGroupButton == true)//если нажата была групповая кнопка, то не показываем ошибки
			 return;*/
			if(findCallback)
				findCallback(false);
			else
				MapUtil.showObjectError(that, layerObj, this);
		}
		else {
			if(findCallback)
				findCallback(true);
			WidgetMap.mapSelectionLayer.getSource().addFeatures(features);
			var extent = WidgetMap.mapSelectionLayer.getSource().getExtent();
			//прячем подписи для слоя
			WidgetMap.hideLabels(layerName, layerIds);
			if (that.showObjectsCentering)
				WidgetMap.centerOnMap(extent);
		}
	}
};
//прячем подписи по инциденту #1505
WidgetMap.hideLabels = function (layerName, objects) {
	var layer = WidgetMap.layerManager.getLayerByName(layerName);
	if (goog.isDef(layer) && goog.isDef(layer.layer)) {
		//проходим по всем фичам и забираем по id Объекта геометрию из _globalPointLabels,
		var features = layer.layer.featureProjLayer.getSource().getSource().getFeatures();
		var i = 0;
		var j = 0;
		var hideGeos = [];
		for (j; j < objects.length; j++) {
			i = 0;
			for (i; i < features.length; i++) {
				//ищем только в multiPoint
				var oId = objects[j];
				if (features[i].getGeometry().getType() == ol.geom.GeometryType.MULTI_POINT && goog.isDef(features[i].get('pointsObj')) && goog.isDef(features[i].get('pointsObj')[oId])) {
					var coords = features[i].get('pointsObj')[oId].flatCoordinates;
					hideGeos.push({id: oId, unique: features[i].get('labelType') + '_' + coords[0] + '_' + coords[1]});
				}
			}
		}
		WidgetMap.hideLabelsArr = hideGeos;
		layer.layer.featureProjLayer.changed();
	}
};

//перезагрузка объекта через синхронизацию
WidgetMap.syncShowObjects = function (layName, uniqueLayerName, selectedObject, ignoreErrors) {
	if (!checkMapExisting())
		return;
	var layers = WidgetMap.layerManager.getLayersBySynonym(layName);
	layers.forEach(function (layerId) {
		var objParams = [];
		if (CURRENT_MAP_TYPE === MAP_TYPE.CAS) {// обрабатываем случай ПКА, когда центрируемся из карты
			var layer = WidgetMap.layerManager.getCasLayerByName(layerId);
			if (layer && layer.layer)
				uniqueLayerName = layer.layer.uniqueLayerName;
			else
				layer = WidgetMap.layerManager.getCasLayerByName(layerId.split('#')[0]);
			if (layer && layer.layer) {
				uniqueLayerName = layer.layer.uniqueLayerName;
			}
			else
				return;
		}
		objParams.push({name: 'centering', value: true});
		objParams.push({name: 'objects', value: selectedObject.replace(layName, layerId)});
		objParams.push({name: 'uniqueLayerName', value: uniqueLayerName});
		objParams.push({name: 'isGroupButton', value: false});
		objParams.push({name: 'select', value: true});
		objParams.push({name: 'fromFilter', value: false});
		objParams.push({name: 'ignoreErrors', value: ignoreErrors === true ? ignoreErrors : false});
		objParams.push({name: 'loadDynamicData', value: true});//нужно ли грузить слой с динамической подгрузкой данных
		WidgetMap.showObjects(objParams, undefined, ignoreErrors, true, function () {

		});
	});
}

/* TODO надо будет перенести подобные функции в некий mapUtil или ещё какой-нибудь хелпер */
/**
 *
 * @param params
 * @param clearSelectionLayer - флаг, нужно ли чистить слой с выделениями   TODO Используется?
 * @param isCurrentTab - центровка происходит в текущей вкладке?
 * @param findCallback коллбек найденного объекта
 */
WidgetMap.showObjects = function (params, clearSelectionLayer, ignoreErrors, isCurrentTab, findCallback) {
	if(!checkMapExisting())
		return;
	var that = this;
	that.showObjectsCentering = true;
	that.showObjectsSelect = true;
	that.showObjectsValue = '';
	that.showObjectsGeo = undefined;
	that.showObjectsLayerDescr = '';
	that.showObjectError = '';
	that.showObjectsIsGroupButton = true;
	that.showObjectsErrorHandler = undefined;
	that.showObjectsFromFilter = false;
	that.ignoreErrors = false;
	that.loadDynamicData = true;
	that.isCurrentTab = isCurrentTab === true;

	var i = 0;
	for (i; i < params.length; i++) {
		var objects = params[i];
		if (objects.name == "objects") {
			that.showObjectsValue = objects.value;
			if (goog.isDef(objects.geo))
				that.showObjectsGeo = objects.geo;
		}
		if (objects.name == "centering")  that.showObjectsCentering = (objects.value == 'true' || objects.value == true);
		if (objects.name == "select") that.showObjectsSelect = (objects.value == 'true' || objects.value == true);
		if (objects.name == "gridCenteringResultFunction") that.showObjectsErrorHandler = objects.value;
		if (objects.name == "isGroupButton") that.showObjectsIsGroupButton = (objects.value == 'true' || objects.value == true);
		if (objects.name == "fromFilter") that.showObjectsFromFilter = (objects.value == 'true' || objects.value == true);
		if (objects.name == "ignoreErrors") that.ignoreErrors = (objects.value == 'true' || objects.value == true);
		if (objects.name == "loadDynamicData") that.loadDynamicData = (objects.value == 'true' || objects.value == true);
	}
	if (that.showObjectsValue != '') {
		var arr = that.showObjectsValue.split(':');
		var layerName = arr[0];
		var layerIds = arr[1].split(',');//array
		var layerObj = WidgetMap.layerManager.getLayerByName(layerName);
		//если слоя нет в _rasterLayers
		var isRasterLayer = false;
		var layerRasterObj = WidgetMap.layerManager.getRasterLayerByName(layerName);
		if (goog.isDef(layerRasterObj) && WidgetMap.CURRENT_MODE === WidgetMap.MODES.RASTER)
			isRasterLayer = true;
		if (goog.isDef(layerObj) && goog.isDef(layerObj.layer))
			that.showObjectsLayerDescr = layerObj.layer.sourceDescr;
		else {
			if(!that.ignoreErrors)
				App.errorReport(gis_widgetmap_1, gis_widgetmap_6, undefined, {filename:gis_filename_393, functionname:'gis_filename_393_5'});
			return;
		}
		if (goog.isDef(that.showObjectsGeo)) {
			if(clearSelectionLayer !== false)
				MapUtil.clearSelectionLayer();
			//переустанавливаем стиль у клона геометрии на тот, дефолтный для выделения
			WidgetMap.layerManager.defaultSelectionStyle(that.showObjectsGeo);

			WidgetMap.mapSelectionLayer.getSource().addFeature(that.showObjectsGeo);
			//добавляем выбранный объект в глобальную переменную
			WidgetMap.mapSelectedObject = that.showObjectsValue;
			if(clearSelectionLayer !== false)
				WidgetMap.hideLabels(layerName, layerIds);
			//зуммируемся к ним
			if (that.showObjectsCentering) {
				var extent = WidgetMap.mapSelectionLayer.getSource().getExtent();
				WidgetMap.centerOnMap(extent);
			}
			return;
		}
		//формируем строку ошибочную, если не найдем геометрию
		that.showObjectError = gis_widgetmap_3 + ': ' + that.showObjectsLayerDescr + gis_widgetmap_23 + that.showObjectsLayerDescr + gis_widgetmap_24 + arr[1];
		if (that.showObjectsFromFilter == true)
			that.showObjectError = gis_widgetmap_4 + gis_widgetmap_23 + that.showObjectsLayerDescr + gis_widgetmap_24 + arr[1];
		that.showObjectNoDataError = gis_widgetmap_5 + ': ' + that.showObjectsLayerDescr;


		//TODO сделать кооректным поведение при подсветке вектора, растра
		//1. при растре должен идти запрос на геометрию и она подсвечиваться на карте
		//3. для вектора поиск в уже пришедшей геометрии
		//var layerObj = WidgetMap.layerManager.getLayerByName(layerName);
		//вариант в вектором
		//LogUtil.sendLog('$$ isModelsVector isRasterLayer=' +isRasterLayer);
		//that.loadDynamicData = that.loadDynamicData || that.isCurrentTab;
		//if(that.isCurrentTab && layerObj.layer.filter === undefined)
		if(that.isCurrentTab/* && layerObj.layer.filter === undefined*/)
			that.loadDynamicData = true;
		if (WidgetMap.isModelsVector == true && goog.isDef(layerObj) && goog.isDef(layerObj.layer.zIndex) && !isRasterLayer) {//zindex - только в векторных слоях есть, либо использовать другой параметр
			if (layerObj.visible) {
				//если не нашли из фильтров, то не показываем сообщение об ошибке

				if (layerObj.layer.dataReady_ == false) {
					if(that.loadDynamicData) {
						layerObj.layer.layerLoadCallback = function (result) {
							layerObj.layer.layerLoadCallback = undefined;
							//LogUtil.sendLog('$$ layerLoadCallback');
							if (that.showObjectsSelect) {
								if (that.showObjectsFromFilter == true && layerIds.length == 1 && layerIds[0] == '')
									return;
								WidgetMap.highlightFeatures(layerName, layerIds, that, findCallback);
							} else {
								WidgetMap.selectFeatures(layerName, layerIds, that, findCallback);
							}
							WidgetMap.mapSelectedObject = that.showObjectsValue;
						};
						layerObj.layer.loadData(true);//форсируем загрузку данных, если текущий масштаб не попал в проверку отрисовки по стилям}
					}
				}
				else {
					//ищем геометрии, выделяем по ним и, если надо, центрируемся
					//нужно разделить ids с PODS_COMPRESSOR_STATION:13001654,13001655 на массив PODS_COMPRESSOR_STATION/13001654, PODS_COMPRESSOR_STATION/13001655
					//LogUtil.sendLog('$$ dataReady_= true');
					if (that.showObjectsSelect){
						if (that.showObjectsFromFilter == true && layerIds.length == 1 && layerIds[0] == '')
							return;
						WidgetMap.highlightFeatures(layerName, layerIds, that, findCallback);
					}
					else{
						WidgetMap.selectFeatures(layerName, layerIds, that, findCallback);
					}
					WidgetMap.mapSelectedObject = that.showObjectsValue;
				}
			}
			else {
				if (that.showObjectsFromFilter == true)
					return;
				if(that.ignoreErrors)// если центровка синхронизации не в текущей вкладке, то не включаем слой
					return;
				//добавляем callback, чтобы после загрузки прицентрироваться
				if (layerObj.layer.dataReady_ == false) {
					if(that.loadDynamicData ) {
						layerObj.layer.layerLoadCallback = function (result) {
							layerObj.layer.layerLoadCallback = undefined;
							if (that.showObjectsSelect) {
								if (that.showObjectsFromFilter == true && layerIds.length == 1 && layerIds[0] == '')
									return;
								WidgetMap.highlightFeatures(layerName, layerIds, that, findCallback);
							} else
								WidgetMap.selectFeatures(layerName, layerIds, that, findCallback);
							WidgetMap.mapSelectedObject = that.showObjectsValue;
						};
						WidgetMap.layerManager.enableLayer(layerName);
						layerObj.layer.loadData(true);//форсируем загрузку данных, если текущий масштаб не попал в проверку отрисовки по стилям}
					}
				}
				else {
					//LogUtil.sendLog('$$ raster dataReady_= true');
					if(that.loadDynamicData) {
						WidgetMap.layerManager.enableLayer(layerName);
						//нужно разделить ids с PODS_COMPRESSOR_STATION:13001654,13001655 на массив PODS_COMPRESSOR_STATION/13001654, PODS_COMPRESSOR_STATION/13001655
						if (that.showObjectsSelect) {
							if (that.showObjectsFromFilter == true && layerIds.length == 1 && layerIds[0] == '')
								return;
							WidgetMap.highlightFeatures(layerName, layerIds, that, findCallback);
						} else
							WidgetMap.selectFeatures(layerName, layerIds, that, findCallback);
						WidgetMap.mapSelectedObject = that.showObjectsValue;
					}
				}
			}
		}
		else {
			//запрос геометрии
			var spatialRequest = layerObj.dataProvider.spatial;
			if (that.showObjectsIsGroupButton == false) {
				getLayerGeoRequest(layerIds, spatialRequest,layerObj);
			}
			else {
				getLayerGroupGeoRequest(layerIds, spatialRequest);
			}
		}
	}

	function getLayerGeoReqParams(filter, request) {
		var userId = AbstractFormDialog.sendUser ? '' + Auth.getUserId() : '-1';
		var userLogin = AbstractFormDialog.sendUser ? '' + Auth.getUserName() : 'guest';
		return {
			getSchema: false,
			descrId: request,
			toElements: false,
			descrType: 'select',
			data: '<root USER_ID="' + userId.xmlEscape() + '" USER_LOGIN="' + userLogin.xmlEscape() + '" PODS_USER="' + userLogin.xmlEscape() + '" >' +
			'<data FILTER="' + filter + '"/>' +
			'</root>'
		};
	}


	function getLayerGeoRequest(filter, request, layerObj) {
		var filterStr = generateFilterStr(filter);
		App.serverQueryXMLNodeWithTries(Services.processQueryNodeGeo, getLayerGeoReqParams(filterStr, request), getLayerGeoResult, getLayerGeoFault,4);


		function getLayerGeoResult(resultXml) {
			// Иногда ответ в формате XML, а иногда в виде просто строки
			//var resultXml = WidgetMap.getStubPolygon();
			var er = HTTPServiceUtil.getError(resultXml);
			if (er !== ''){
				App.errorReport(gis_core_error_1, er, undefined, {filename:gis_filename_3, functionname:'gis_filename_3_4'});
				MapUtil.showObjectError(that, layerObj, this);
				return;
			}
			var layerGeoXml = ($.parseXML(resultXml)).firstChild;
			var datas = layerGeoXml.getElementsByTagName("data");
			if(clearSelectionLayer !== false)
				MapUtil.clearSelectionLayer();
			if (datas.length == 0) {
				if (that.showObjectsIsGroupButton == true)//если нажата была групповая кнопка, то не показываем ошибки
					return;
				MapUtil.showObjectError(that, layerObj, this);
				return;
			}
			var stride = 2;
			for (var i = 0; i < datas.length; i++) {
				//парсим фичу, меняем проекцию, добавляем в слой для выделенных объектов
				var format = new ol.format.WKT({dimension: stride});
				var wktStr = datas[i].getAttribute("WKT");//;"POINT(-1 -1)";
				var feature = undefined;
				try {
					feature = format.readFeature(wktStr);
				}
				catch (ex) {
					//для случая с видеозаписями, приходит 3 координаты
					stride = 3;
					format = new map.format.WKT({dimension: stride});
					feature = format.readFeature(wktStr);
				}
				if (goog.isDef(feature)) {
					//забираем координаты и переводим их в нормальную проекцию
					var flatCoordinates = feature.getGeometry().flatCoordinates;
					if (flatCoordinates.length > 1 && flatCoordinates[0] != -1 && flatCoordinates[1] != -1) {
						//устанавливаем в фичу стиль дефолтный
						if (stride == 3) {
							var newArr = [];
							for (var j = 0; j < flatCoordinates.length; j += stride) {
								var lng = flatCoordinates[j];
								var lat = flatCoordinates[j + 1];
								newArr.push(lng);
								newArr.push(lat);
							}
							//геометрия выделяемого участка трубопровода
							var geometry = new ol.geom.LineString(null);
							geometry.setFlatCoordinates(ol.geom.GeometryLayout.XY, newArr);
							var newLineFeature = new ol.Feature(geometry);
							WidgetMap.layerManager.defaultSelectionStyle(newLineFeature);
							GeoUtil.convertFeature(newLineFeature, App.projection, WidgetMap.DEFAULT_PROJECTION);
							WidgetMap.mapSelectionLayer.getSource().addFeature(newLineFeature);
						}
						else {
							WidgetMap.layerManager.defaultSelectionStyle(feature);
							GeoUtil.convertFeature(feature, App.projection, WidgetMap.DEFAULT_PROJECTION);
							WidgetMap.mapSelectionLayer.getSource().addFeature(feature);
						}
						//добавляем выбранный объект в глобальную переменную
						WidgetMap.mapSelectedObject = that.showObjectsValue;
					}
					else {
						//if(that.showObjectsIsGroupButton == true)//если нажата была групповая кнопка, то не показываем ошибки
						//    continue;
						MapUtil.showObjectError(that, layerObj, this);
						return;
					}
				}
			}
			//зуммируемся к ним
			var extent = WidgetMap.mapSelectionLayer.getSource().getExtent();
			if (that.showObjectsCentering) {
				WidgetMap.centerOnMap(extent);
			}
		}

		function getLayerGeoFault(resultXml) {
			var er = HTTPServiceUtil.getError(resultXml);
			if (er !== '')
				App.errorReport(gis_core_error_1, er, undefined, {filename:gis_filename_3, functionname:'gis_filename_3_6'});
			MapUtil.showObjectError(that, layerObj, this);
		}

		function generateFilterStr(filter) {
			return "ID in (" + filter.join(",") + ")";
		}
	}

	function getLayerGroupGeoRequest(filter, request) {
		if(clearSelectionLayer !== false)
			MapUtil.clearSelectionLayer();
		var filterCount = filter.length;
		var features = [];//все фичи, полученные после группового запроса
		for (var fi in filter) {
			var filterStr = generateFilterStr([filter[fi]]);
			App.serverQueryXMLNodeWithTries(Services.processQueryNodeGeo, getLayerGeoReqParams(filterStr, request), getLayerGeoResult, getLayerGeoFault,4);
		}

		function getLayerGeoResult(resultXml) {
			var er = HTTPServiceUtil.getError(resultXml);
			if (er !== ''){
				App.errorReport(gis_core_error_1, er, undefined, {filename:gis_filename_3, functionname:'gis_filename_3_8'});
				--filterCount;
				if (filterCount == 0) {
					//зуммируемся к ним
					var extent = WidgetMap.mapSelectionLayer.getSource().getExtent();
					if (that.showObjectsCentering && WidgetMap.mapSelectionLayer.getSource().getFeatures().length > 0) {
						WidgetMap.centerOnMap(extent);
					}
				}
				return;
			}
			// Иногда ответ в формате XML, а иногда в виде просто строки
			var layerGeoXml = ($.parseXML(resultXml)).firstChild;
			var datas = layerGeoXml.getElementsByTagName("data");
			--filterCount;
			if (datas.length != 0) {
				var stride = 2;
				for (var i = 0; i < datas.length; i++) {
					//парсим фичу, меняем проекцию, добавляем в слой для выделенных объектов
					var format = new ol.format.WKT({dimension: stride});
					var wktStr = datas[i].getAttribute("WKT");
					var idStr = datas[i].getAttribute("ID");///;"POINT(-1 -1)";
					var feature = undefined;
					try {
						feature = format.readFeature(wktStr);
					}
					catch (ex) {
						//для случая с видеозаписями, приходит 3 координаты
						stride = 3;
						format = new map.format.WKT({dimension: stride});
						feature = format.readFeature(wktStr);
					}
					if (goog.isDef(feature)) {
						//забираем координаты и переводим их в нормальную проекцию
						var flatCoordinates = feature.getGeometry().flatCoordinates;
						if (flatCoordinates.length > 1 && flatCoordinates[0] != -1 && flatCoordinates[1] != -1) {
							//устанавливаем в фичу стиль дефолтный
							if (stride == 3) {
								var newArr = [];
								for (var j = 0; j < flatCoordinates.length; j += stride) {
									var lng = flatCoordinates[j];
									var lat = flatCoordinates[j + 1];
									newArr.push(lng);
									newArr.push(lat);
								}
								//геометрия выделяемого участка трубопровода
								var geometry = new ol.geom.LineString(null);
								geometry.setFlatCoordinates(ol.geom.GeometryLayout.XY, newArr);
								var newLineFeature = new ol.Feature(geometry);
								WidgetMap.layerManager.defaultSelectionStyle(newLineFeature);
								GeoUtil.convertFeature(newLineFeature, App.projection, WidgetMap.DEFAULT_PROJECTION);
								newLineFeature.setId('DEFAULT_SELECTED_' + idStr);
								WidgetMap.mapSelectionLayer.getSource().addFeature(newLineFeature);
							}
							else {
								WidgetMap.layerManager.defaultSelectionStyle(feature);
								GeoUtil.convertFeature(feature, App.projection, WidgetMap.DEFAULT_PROJECTION);
								feature.setId('DEFAULT_SELECTED_' + idStr);
								WidgetMap.mapSelectionLayer.getSource().addFeature(feature);
							}
							//добавляем выбранный объект в глобальную переменную
							WidgetMap.mapSelectedObject = that.showObjectsValue;
						}
						else {
							if (that.showObjectsIsGroupButton == true)//если нажата была групповая кнопка, то не показываем ошибки
								continue;
						}
					}
				}
			}
			if (filterCount == 0) {
				//зуммируемся к ним
				var extent = WidgetMap.mapSelectionLayer.getSource().getExtent();
				if (that.showObjectsCentering && WidgetMap.mapSelectionLayer.getSource().getFeatures().length > 0) {
					WidgetMap.centerOnMap(extent);
				}
			}
		}

		function getLayerGeoFault(resultXml) {
			var er = HTTPServiceUtil.getError(resultXml);
			if (er !== '')
				App.errorReport(gis_core_error_1, er, undefined, {filename:gis_filename_3, functionname:'gis_filename_3_7'});
			--filterCount;
			if (filterCount == 0) {
				//зуммируемся к ним
				var extent = WidgetMap.mapSelectionLayer.getSource().getExtent();
				if (that.showObjectsCentering && WidgetMap.mapSelectionLayer.getSource().getFeatures().length > 0) {
					WidgetMap.centerOnMap(extent);
				}
			}
		}
		function generateFilterStr(filter) {
			return "ID in (" + filter.join(",") + ")";
		}
	}


};

/**
 * Сентрируемся на карте по экстенту
 * @param extent экстент текущей геометрии
 */
WidgetMap.centerOnMap = function (extent) {
	if (App.config.MAP_CENTERING_MIN_ZOOM === undefined){
		App.errorReport(gis_core_17, 'MAP_CENTERING_MIN_ZOOM' + gis_core_18, undefined, {filename:gis_filename_3, functionname:'gis_filename_3_11'});
		return;
	}
	var minZoom = App.config.MAP_CENTERING_MIN_ZOOM;
	if (goog.isDef(minZoom) && goog.isNumber(parseFloat(minZoom)) && parseFloat(minZoom) > 0 && WidgetMap.getZoomForExtent(extent) >= parseFloat(minZoom)) {
		map.controls.FullMapControl.prototype.centerOn_(ol.extent.getCenter(extent), minZoom);
	}
	else {
		WidgetMap.map.getView().fit(extent, WidgetMap.map.getSize());
	}
};


/**
 * Получить зум для переданного экстента
 * @param extent
 * @returns {number}
 */
WidgetMap.getZoomForExtent = function (extent) {
	var viewSize = WidgetMap.map.getSize();
	var idealResolution;//= Math.max(extent[0]/viewSize[0],extent[1] / viewSize[1]);
	var view = WidgetMap.map.getView();
	var RESOLUTION_TOLERANCE = 0.000001;
	idealResolution = Math.max(ol.extent.getWidth(extent) / viewSize[0], ol.extent.getHeight(extent) / viewSize[1]);//view.getResolutionForExtent(extent,viewSize);
	var offset;
	var resolution = idealResolution;

	if (goog.isDef(resolution)) {
		var res, z = 0;
		do {
			res = view.constrainResolution(view.maxResolution_, z);
			if (res < resolution && Math.abs(res - resolution) > RESOLUTION_TOLERANCE) {
				offset = z;
				break;
			}
			++z;
		} while (res > view.minResolution_);
	}
	return z + view.minZoom_ - 1;//view.maxResolution_ соответствует minZoom, поэтому добавляем. И отнимаем 1, как во флеш
};

/**
 * Получить зум для переданной resolution
 * @param extent
 * @returns {number}
 */
WidgetMap.getZoomForResolution = function (resolution) {
	var offset;
	var view = WidgetMap.map.getView();
	if (goog.isDef(resolution)) {
		var res, z = 0;
		do {
			res = view.constrainResolution(view.maxResolution_, z);
			if (res == resolution) {
				offset = z;
				break;
			}
			++z;
		} while (res > view.minResolution_);
	}

	return goog.isDef(offset) ? view.minZoom_ + offset : offset;
};

/**
 * Слой для выделения объектов на карте
 *
 */
WidgetMap.addMapSelectionLayer = function () {
	if (goog.isDef(WidgetMap.map)) {
		try {
			var vector = new ol.layer.Vector({
				source: new ol.source.Vector({})
			});
			WidgetMap.mapSelectionLayer = vector;
			WidgetMap.map.addLayer(WidgetMap.mapSelectionLayer);
		}
		catch (ex) {
		}
	}
};


/**
 * Слой для обображения данных для видеомониторинга
 *
 */
WidgetMap.addVideoMonitoringLayer = function () {
	if (goog.isDef(WidgetMap.map)) {
		try {
			var vector1 = new ol.layer.Vector({
				source: new ol.source.Vector({})
			});
			var vector2 = new ol.layer.Vector({
				source: new ol.source.Vector({})
			});
			this.mapVideoMonitoringTrackLayer = vector1;
			WidgetMap.map.addLayer(this.mapVideoMonitoringTrackLayer);
			this.mapVideoMonitoringPointLayer = vector2;
			WidgetMap.map.addLayer(this.mapVideoMonitoringPointLayer);

		}
		catch (ex) {
			//console.error(ex);
		}
	}
};

/**
 * Слой для построения буфера
 *
 */
WidgetMap.addBufferLayer = function () {
	if (goog.isDef(WidgetMap.map)) {
		try {
			var styles = [new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: 'blue',
					width: 2
				}),
				fill: new ol.style.Fill({
					//color: 'rgba(255, 255, 255, 0.3)'
					color: 'rgba(255, 255, 255, 0.8)'
				})
			})];
			var vector = new ol.layer.Vector({
				source: new ol.source.Vector({}),
				style: styles
			});
			WidgetMap.bufferLayer = vector;
			WidgetMap.map.addLayer(WidgetMap.bufferLayer);

		}
		catch (ex) {
		}
	}
};

WidgetMap.updateCacheLayer = function (params, visible) {
	var layerId = '';
	var j = 0;
	for (j = 0; j < params.length; j++) {
		var curParam = params[j];
		if(curParam['name'] === 'layerId')
			layerId = curParam['value'];
	}
	for (j = 0; j < params.length; j++) {
		var curParam = params[j];
		if (!curParam.hasOwnProperty('name')) continue;

		var newFilters = [];
		var curFilters;
		switch (curParam['name']) {
			case 'filter':
			case 'roughFilter':
				curFilters = curParam['value'].split('|');
				for (var i = 0; i < curFilters.length; i++) {
					var nameValArr = curFilters[i].split(':');
					if (nameValArr && nameValArr.length >= 2) {
						//для кадастровых районов вида "1:23:23.."
						var nameVal = nameValArr[0];
						nameValArr.splice(0, 1);
						var newFilterObj = {name: nameVal, value: nameValArr.join(':'), layerName: layerId};
						newFilters.push(newFilterObj);
					}
				}

				if (curParam['name'] == 'filter') {
					//Переписываем массив фильтров верхнего уровня, из которых формируются запросы
					newFilters.forEach(function(val){
						if(val && val.name){
							if(WidgetMap.currentTopFilter.length == 0)
								WidgetMap.currentTopFilter = newFilters;
							else{
								var finded = false;
								for(var ni = 0; ni < WidgetMap.currentTopFilter.length; ni++){
									if(WidgetMap.currentTopFilter[ni].name !== undefined ){
										if(WidgetMap.currentTopFilter[ni].name === val.name ){
											WidgetMap.currentTopFilter[ni].value = val.value;
											finded = true;
											break;
										}
									}
								}
								if(!finded)
									WidgetMap.currentTopFilter.push(val);
							}
						}
						//WidgetMap.currentTopFilter = newFilters;
					});
				}
				else if (curParam['name'] == 'roughFilter') {
					//Переписываем массив фильтров среднего уровня, из которых формируются запросы
					WidgetMap.currentRoughFilter = newFilters;
				}
				break;
			case 'layerId':
				layerId = curParam['value'];
				break;
		}
	}
};


WidgetMap.addBaseControls = function () {
	try {
		var hideButtons = ru.corelight.classes.map.BaseWidget.getHideButtonsConfig();
		var mapConfig = (WidgetMap.config && WidgetMap.config.map) ? WidgetMap.config.map: WidgetMap.config;
		var taskType = (WidgetMap && WidgetMap.config && mapConfig.type === 'raspr') ? mapConfig.type : 'common';
		//иконка лоадинга процесса загрузки геометрий
		WidgetMap.geometryLoaderControl = new map.controls.GeometryLoaderControl({loadingText:gis_loadercontrol_1});
		WidgetMap.map.addControl(WidgetMap.geometryLoaderControl);
		WidgetMap.geometryLoaderControl.setVisible(false);
		var hideSearch = WidgetMap.config !== undefined && WidgetMap.config.search_engine !== undefined && WidgetMap.config.search_engine.show === false;
		if(WidgetMap.config !== undefined && WidgetMap.config.search_engine === undefined)
			hideSearch = true;
		if ( !hideSearch ) {
			WidgetMap.map.addControl(new map.controls.SearchControl({config: WidgetMap.config.search_engine}));
		}

		if (hideButtons.indexOf("PrevSite") === -1) {
			WidgetMap.map.addControl(new map.controls.PreviousSiteControl());
		}
		if(WidgetMap.config && WidgetMap.config.open_task && WidgetMap.config.open_task && WidgetMap.config.open_task.url && WidgetMap.config.open_task.text)
			if (hideButtons.indexOf("FastTask") === -1) {
				WidgetMap.map.addControl(new map.controls.FastTaskAccessControl({
					url: WidgetMap.config.open_task.url,
					text: WidgetMap.config.open_task.text,
					target: WidgetMap.config.open_task.target,
				}));
			}

		//добавляем контролы для зуммирования
		if (hideButtons.indexOf("ZoomBox") === -1) // лупы
			WidgetMap.map.addControl(new map.controls.ZoomBoxControl());

		if (hideButtons.indexOf("ZoomSlider") === -1) {
			WidgetMap.map.addControl(new map.controls.ZoomControl());
			WidgetMap.zoomSliderControl = new map.controls.ZoomSliderControl();
			WidgetMap.map.addControl(WidgetMap.zoomSliderControl);
		}

		if (hideButtons.indexOf("MeasureChooser") === -1) {
			var needLine = hideButtons.indexOf("MeasureLine") === -1;
			var needArea = hideButtons.indexOf("MeasureArea") === -1;
			var needPipeLength = hideButtons.indexOf("MeasurePipeLength") === -1;
			var needPipeDirection = hideButtons.indexOf("MeasurePipeDirection") === -1;
			var needBufferZoneAll = hideButtons.indexOf("BufferZoneAll") === -1;

			WidgetMap.measureChooserControl = new map.controls.MeasureChooserControl({noElement:(!needLine && !needArea && !needPipeLength && !needPipeDirection && !needBufferZoneAll)});
			WidgetMap.map.addControl(WidgetMap.measureChooserControl);
			WidgetMap.measureControl = new map.controls.MeasureControl({
				needLine:needLine,
				needArea:needArea,
				needPipeLength:needPipeLength,
				needPipeDirection:needPipeDirection,
				needBufferZoneAll:needBufferZoneAll
			});
			WidgetMap.map.addControl(WidgetMap.measureControl);
		}

		if (hideButtons.indexOf("MapInfo") === -1) {
			WidgetMap.infoControl = new map.controls.MapInfoControl();
			WidgetMap.map.addControl(WidgetMap.infoControl);
            /*WidgetMap.infoControl = new map.controls.MapInfoV7Control();
            WidgetMap.map.addControl(WidgetMap.infoControl);
            WidgetMap.infoControl.handleMapInfoClick_();*/
		}
		if (hideButtons.indexOf("Pan") === -1) {
			WidgetMap.panControl = new map.controls.PanControl();
			WidgetMap.map.addControl(WidgetMap.panControl);
			/*WidgetMap.infoControl = new map.controls.MapInfoV7Control();
			WidgetMap.map.addControl(WidgetMap.infoControl);
			WidgetMap.infoControl.handleMapInfoClick_();*/
		}

		if (hideButtons.indexOf("ExportImageChooser") === -1) {
			var needExport = hideButtons.indexOf("ExportImage") === -1;
			var needPrint = hideButtons.indexOf("PrintImage") === -1;
			WidgetMap.exportImageChooserControl = new map.controls.ExportImageChooserControl({noElement: (!needExport && !needPrint)});
			WidgetMap.map.addControl(WidgetMap.exportImageChooserControl);
			WidgetMap.exportImageControl = new map.controls.ExportImageControl({needExport:needExport, needPrint:needPrint});
			WidgetMap.map.addControl(WidgetMap.exportImageControl);
		}

		if (hideButtons.indexOf("FindRoute") === -1) {
            WidgetMap.findRoute = new map.controls.FindRouteV5Control({noElement: true});

			WidgetMap.map.addControl(WidgetMap.findRoute);
		}
		//TODO добавить проверку на user uid и anonym uid
		if (hideButtons.indexOf("DSP") === -1)
			WidgetMap.map.addControl(new map.controls.DSPControl());
		if (hideButtons.indexOf("MapCenterPoint") === -1){
			var needCarousel = true, needCas = true;
			if(hideButtons.indexOf("NavigateRoute") !== -1 || hideButtons.indexOf("NavigateRouteSlider") !== -1){
				needCarousel = false;
				needCas = false;
			}
			WidgetMap.mapCenterPointControl = new map.controls.MapCenterPointControl({needCarousel: needCarousel, needCas: needCas});
			WidgetMap.map.addControl(WidgetMap.mapCenterPointControl);
		}


		if (hideButtons.indexOf("BufferZoneChooser") === -1) {
            WidgetMap.bufferZoneChooserControl = new map.controls.BufferZoneChooserControl({noElement: true});
			WidgetMap.bufferZoneControl = new map.controls.BufferZoneControl({noElement: true});
			WidgetMap.map.addControl(WidgetMap.bufferZoneControl);
		}

        if (hideButtons.indexOf("MapViewChooser") === -1) {
            if (hideButtons.indexOf("ClearCosmetic") === -1) {
                WidgetMap.map.addControl(new map.controls.ClearCosmeticV7Control({noElement: true}));
			}
            if (hideButtons.indexOf("FullMap") === -1) {
            	WidgetMap.fullMap = new map.controls.FullMapControl({noElement: true});
                WidgetMap.map.addControl(WidgetMap.fullMap);
			}

            if(hideButtons.indexOf("History") === -1){
            	WidgetMap.history = new map.controls.HistoryControl({mapHistory: WidgetMap.mapHistory, noElement: true});
                WidgetMap.map.addControl(WidgetMap.history);
			}
	        var needClearCosmetic = hideButtons.indexOf("ClearCosmetic") === -1;
	        var needFullMap = hideButtons.indexOf("FullMap") === -1;
	        var needPrevView = hideButtons.indexOf("PrevView") === -1;
	        var needNextView = hideButtons.indexOf("NextView") === -1;
	        var needWms = hideButtons.indexOf("Wms") === -1;
            WidgetMap.viewMapChoose = new map.controls.MapViewChooserControl({noElement:(!needClearCosmetic && !needFullMap && !needPrevView && !needNextView && !needWms)});
            WidgetMap.viewMap = new map.controls.MapViewControl({
	            needClearCosmetic:needClearCosmetic,
	            needFullMap:needFullMap,
	            needPrevView:needPrevView,
	            needNextView:needNextView,
	            needWms:needWms
            });
            WidgetMap.map.addControl(WidgetMap.viewMap);
            WidgetMap.map.addControl(WidgetMap.viewMapChoose);
        }
        if (hideButtons.indexOf("ShareChooser") === -1) {
        	var needLink = hideButtons.indexOf("LinkMap") === -1;
	        var needSendMail = hideButtons.indexOf("SendMail") === -1;
            if (needLink){
                WidgetMap.linkMap = new map.controls.LinkMapControl({noElement: true});
                WidgetMap.map.addControl(WidgetMap.linkMap);
			}

            if(needSendMail) {
            	WidgetMap.sendMail = new map.controls.SendMailControl({noElement: true});
                WidgetMap.map.addControl(WidgetMap.sendMail);
			}
            WidgetMap.shareChoose = new map.controls.ShareChooserControl({noElement:(!needLink && !needSendMail)});
            WidgetMap.share = new map.controls.ShareControl({needLink:needLink, needSendMail:needSendMail});
            WidgetMap.map.addControl(WidgetMap.share);
            WidgetMap.map.addControl(WidgetMap.shareChoose);
        }
		if (hideButtons.indexOf('SearchOnMap') === -1){
			var needSearch = hideButtons.indexOf("SearchAddress") === -1;
			var needCentering = hideButtons.indexOf("MapCentering") === -1;
			if (needCentering){
				WidgetMap.mapCentering = new map.controls.MapCenteringControl({noElement: true});
				WidgetMap.map.addControl(WidgetMap.mapCentering);
			}
			if (needSearch){
				WidgetMap.searchAddress = new map.controls.SearchAddressControl({noElement: true, taskType: taskType});
				WidgetMap.map.addControl(WidgetMap.searchAddress);
			}
			WidgetMap.searchOnMapChooser = new map.controls.SearchOnMapChooserControl({noElement:(!needCentering && !needSearch)});
			WidgetMap.searchOnMap = new map.controls.SearchOnMapControl({needCentering:needCentering, needSearch:needSearch});
			WidgetMap.map.addControl(WidgetMap.searchOnMap);
			WidgetMap.map.addControl(WidgetMap.searchOnMapChooser);
		}

		//кнопки редактирования векторных данных
		var needFullEdit = hideButtons.indexOf("EditGeometryChooser") === -1
		var needEdit = hideButtons.indexOf("EditGeometryChooser") === -1;
		var needMove = hideButtons.indexOf("MoveGeometry") === -1;
		var needCopy = hideButtons.indexOf("CopyPasteGeometry") === -1;
		var needLink = hideButtons.indexOf("LinkGeometry") === -1;
		var needAdd = hideButtons.indexOf("AddObject") === -1;
		var needDelete = hideButtons.indexOf("DeleteBufferObject") === -1;
		if(!needFullEdit){
			needEdit = false; needMove = false; needCopy = false; needLink = false; needAdd = false; needDelete = false;
		}
		WidgetMap.editGeometryControl = new map.controls.EditGeometryControl({noElement:!needEdit});
		WidgetMap.map.addControl(WidgetMap.editGeometryControl);
		WidgetMap.moveGeometryControl = new map.controls.MoveGeometryControl({noElement:!needMove});
		WidgetMap.map.addControl(WidgetMap.moveGeometryControl);
		WidgetMap.copyPasteGeometryControl = new map.controls.CopyPasteGeometryControl({noElement:!needCopy});
		WidgetMap.map.addControl(WidgetMap.copyPasteGeometryControl);
		WidgetMap.linkControl = new map.controls.LinkControl({noElement:!needLink});
		WidgetMap.map.addControl(WidgetMap.linkControl);
		WidgetMap.addObjectControl = new map.controls.AddObjectControl({noElement:!needAdd});
		WidgetMap.map.addControl(WidgetMap.addObjectControl);
		WidgetMap.deleteBufferObjectControl = new map.controls.DeleteBufferObjectControl({noElement:!needDelete});
		WidgetMap.map.addControl(WidgetMap.deleteBufferObjectControl);
		WidgetMap.map.addControl(new map.controls.EditGeometryChooserControl({noElement:!needFullEdit}));

		var overviewLayers = [];
		if (goog.isDef(WidgetMap.overviewLayers))
			overviewLayers = WidgetMap.overviewLayers;
		var collapsed = true;
		if (goog.isDef(WidgetMap.showOverviewMap) && WidgetMap.showOverviewMap)
			collapsed = false;
		var mapConfig = (WidgetMap.config && WidgetMap.config.map) ? WidgetMap.config.map: WidgetMap.config;
		if (hideButtons.indexOf("OverviewMap") == -1 && mapConfig.overview_map){
				WidgetMap.overviewMapControl = new map.controls.OverviewMapControl({
					className: 'ol-overviewmap map-custom-overviewmap',
					layers: overviewLayers,
					collapsed: collapsed
				});
			WidgetMap.map.addControl(WidgetMap.overviewMapControl);
		}
		if (hideButtons.indexOf("NavigateRoute") == -1) {
			var needNavigateSlider = hideButtons.indexOf("NavigateRouteSlider") === -1;
			WidgetMap.navigateRouteControl = new map.controls.NavigateRouteControl({needNavigateSlider: needNavigateSlider, taskType: taskType});
			WidgetMap.map.addControl(WidgetMap.navigateRouteControl);
		}


		/*$(document).mouseup(function () {
			MapUtil.closeButtons('');
		});*/
	}
	catch (ex) {
		App.errorReport(gis_widgetmap_25 + ex, ex, undefined, {filename:gis_filename_393, functionname:'gis_filename_393_10'});
	}
};


/**
 * TODO перевести на вызов события
 * @param currentState  WidgetMap.MAP_BUTTON_STATE
 * @param currentButton  Текущий контрол, чтобы, по возможности, мы могли его удалить с карты
 */
WidgetMap.changeToolState = function (currentState, currentButton) {
	if (goog.isDef(WidgetMap.selectedMapButton))
		$(WidgetMap.selectedMapButton).removeClass('selectedMapButton');
	switch (currentState) {
		case WidgetMap.MAP_BUTTON_STATE.PAN:
			WidgetMap.currentMapButtonState = WidgetMap.MAP_BUTTON_STATE.PAN;
			map.controls.MeasureControl.reset();
			map.controls.ZoomBoxControl.reset();
			/*if(WidgetMap.findRoute !== undefined)
				WidgetMap.findRoute.reset();*/
			map.controls.DrawGeometryControl.reset();
			break;
		case WidgetMap.MAP_BUTTON_STATE.ZOOM:
			WidgetMap.currentMapButtonState = WidgetMap.MAP_BUTTON_STATE.ZOOM;
			map.controls.PanControl.reset();
			map.controls.MeasureControl.reset();
			/*if(WidgetMap.findRoute !== undefined)
				WidgetMap.findRoute.reset();*/
			map.controls.DrawGeometryControl.reset();
			break;
		case WidgetMap.MAP_BUTTON_STATE.MEASURE:
			WidgetMap.currentMapButtonState = WidgetMap.MAP_BUTTON_STATE.MEASURE;
			map.controls.PanControl.reset();
			map.controls.ZoomBoxControl.reset();
			/*if(WidgetMap.findRoute !== undefined)
				WidgetMap.findRoute.reset();*/
			map.controls.DrawGeometryControl.reset();
			break;
		case WidgetMap.MAP_BUTTON_STATE.ROUTE:
			WidgetMap.currentMapButtonState = WidgetMap.MAP_BUTTON_STATE.ROUTE;
			map.controls.PanControl.reset();
			map.controls.MeasureControl.reset();
			map.controls.ZoomBoxControl.reset();
			map.controls.DrawGeometryControl.reset();
			break;
		case WidgetMap.MAP_BUTTON_STATE.DRAW:
			WidgetMap.currentMapButtonState = WidgetMap.MAP_BUTTON_STATE.DRAW;
			map.controls.PanControl.reset();
			map.controls.MeasureControl.reset();
			map.controls.ZoomBoxControl.reset();
			/*if(WidgetMap.findRoute !== undefined)
				WidgetMap.findRoute.reset();*/
			break;
	}
	if (goog.isDefAndNotNull(currentButton))
		$(currentButton).addClass('selectedMapButton');
	WidgetMap.selectedMapButton = currentButton;
};

WidgetMap.currentVideoTrackCoords = [];
WidgetMap.isAddedVideoEvent = false;
WidgetMap.isVideoPlayerClosed = true;
WidgetMap.forceAutoFocus = false;
WidgetMap.isVideoAutoFocus = true;
//флаг, который устанавливается с showVideo, чтобы запомнить состояние в прошлой открытой флешке в текущей сессии
WidgetMap.startVideoAutoFocusFlag = undefined;
WidgetMap.videoStartPixelClick = [0, 0];

WidgetMap.showVideo = function (geoRes) {

	WidgetMap.currentVideoTrackCoords = [];
	WidgetMap.isVideoPlayerClosed = false;
	var that = this;
	if (!WidgetMap.isAddedVideoEvent) {
		WidgetMap.map.on(ol.MapBrowserEvent.EventType.POINTERUP, function (event) {
			if (WidgetMap.isVideoPlayerClosed)
				return;
			if (!(WidgetMap.videoStartPixelClick[0] == event.pixel[0] && WidgetMap.videoStartPixelClick[1] == event.pixel[1])) {
				widgetVideoSetAutoFocus(false, true);
			}
		});
		WidgetMap.map.on(ol.MapBrowserEvent.EventType.POINTERDOWN, function (event) {
			if (WidgetMap.isVideoPlayerClosed)
				return;
			WidgetMap.videoStartPixelClick = event.pixel;
		});
		$("body").on(VideoPlayerEvent.CLOSE, function () {
			WidgetMap.videoCloseHandler();
		});
		WidgetMap.map.on(ol.MapBrowserEvent.EventType.SINGLECLICK, function (event) {
			that.mapClickHandler_(event)
		});
		WidgetMap.isAddedVideoEvent = false;
	}

	//var resultXml = WidgetMap.getStubTrack();
	var resultXml = geoRes;
	var layerGeoXml = ($.parseXML(resultXml)).firstChild;
	var datas = layerGeoXml.getElementsByTagName("data");
	WidgetMap.mapVideoMonitoringTrackLayer.getSource().clear();
	WidgetMap.mapVideoMonitoringPointLayer.getSource().clear();
	var videoTitle = '';
	var stride = 3;
	for (var i = 0; i < datas.length; i++) {
		if (i == 0) {
			videoTitle = datas[0].getAttribute('LABEL');
			$('#videoWindow').jqxVideoWindow({title: videoTitle});//поменять название формы
		}
		//парсим фичу, меняем проекцию, добавляем в слой для выделенных объектов
		var format = new map.format.WKT({dimension: stride});
		var wktStr = datas[i].getAttribute("WKT");//;"POINT(-1 -1)";
		var feature = format.readFeature(wktStr);

		//забираем координаты и переводим их в нормальную проекцию
		var flatCoordinates = feature.getGeometry().flatCoordinates;
		if (flatCoordinates.length > 1 && flatCoordinates[0] != -1 && flatCoordinates[1] != -1) {
			//устанавливаем в фичу стиль дефолтный
			//перестраиваем фичу без z координаты, а данные с z сохраняем отдельно, чтобы использовать по клику на карте
			var arr = [];
			goog.asserts.assert(flatCoordinates.length % stride === 0);
			var j = 0;
			for (; j < flatCoordinates.length; j += stride) {
				var lng = flatCoordinates[j];
				var lat = flatCoordinates[j + 1];
				arr.push(lng);
				arr.push(lat);
				WidgetMap.currentVideoTrackCoords.push({
					X_COORD: lng,
					Y_COORD: lat,
					Z_COORD: flatCoordinates[j + 2]
				});
			}
			//геометрия выделяемого участка трубопровода
			var geometry = new ol.geom.LineString(null);
			geometry.setFlatCoordinates(ol.geom.GeometryLayout.XY, arr);
			var newLineFeature = new ol.Feature(geometry);
			//WidgetMap.layerManager.defaultSelectionStyle(newLineFeature,'LIB_DOC_GEO_VIDEO_TRACK');
			var videoLineStyle = WidgetMap.layerManager.getLineStyle('LIB_DOC_GEO_VIDEO_TRACK');
			newLineFeature.setStyle(videoLineStyle);
			GeoUtil.convertFeature(newLineFeature, App.projection, WidgetMap.DEFAULT_PROJECTION);
			WidgetMap.mapVideoMonitoringTrackLayer.getSource().addFeature(newLineFeature);
			var extent = WidgetMap.mapVideoMonitoringTrackLayer.getSource().getExtent();
			WidgetMap.centerOnMap(extent);

			// и добавляем начальную точку в вертолёт
			var currPoint = new ol.Feature(new ol.geom.Point([newLineFeature.getGeometry().flatCoordinates[0], newLineFeature.getGeometry().flatCoordinates[1]]));
			currPoint.setStyle(WidgetMap.layerManager.getPointStyle('LIB_DOC_GEO_VIDEO_POINT'));
			WidgetMap.mapVideoMonitoringPointLayer.getSource().addFeature(currPoint);
			break;
		}
	}


};

WidgetMap.isDrawingVideo = false;
WidgetMap.videoShowOnMap = function (geoRes) {
	if (WidgetMap.isDrawingVideo == true)
		return;
	WidgetMap.isDrawingVideo = true;
	var resultXml = geoRes;
	//resultXml = '<root> <data ID="LIB_DOC_GEO_VIDEO_POINT" WKT="POINT(30.4032653377244 59.9584813404373)"/> </root>';

	var layerGeoXml = ($.parseXML(resultXml)).firstChild;
	var datas = layerGeoXml.getElementsByTagName("data");
	WidgetMap.mapVideoMonitoringPointLayer.getSource().clear();
	var i = 0;
	for (i; i < datas.length; i++) {
		///console.log(geoRes);
		//парсим фичу, меняем проекцию, добавляем в слой для выделенных объектов
		var format = new ol.format.WKT();
		var wktStr = datas[i].getAttribute("WKT");//;"POINT(-1 -1)";
		var currStyleName = (datas[i].getAttribute("ID") != '') ? datas[i].getAttribute("ID") : 'LIB_DOC_GEO_VIDEO_POINT';
		var feature = format.readFeature(wktStr);
		if (feature.getGeometry().getType() != 'Point')
			return;
		//забираем координаты и переводим их в нормальную проекцию
		var flatCoordinates = feature.getGeometry().flatCoordinates;
		if (flatCoordinates.length > 1 && flatCoordinates[0] != -1 && flatCoordinates[1] != -1) {
			//устанавливаем в фичу стиль дефолтный
			//console.log(feature.getGeometry().flatCoordinates[0], feature.getGeometry().flatCoordinates[1]);
			WidgetMap.layerManager.defaultSelectionStyle(feature, currStyleName);
			GeoUtil.convertFeature(feature, App.projection, WidgetMap.DEFAULT_PROJECTION);
			WidgetMap.mapVideoMonitoringPointLayer.getSource().addFeature(feature);
			if (WidgetMap.isVideoAutoFocus || WidgetMap.forceAutoFocus) {
				//добавил пока простую проверку на попадание координаты фичи в текущий экстент карты
				var mapExtent = WidgetMap.map.getView().calculateExtent(WidgetMap.map.getSize());
				var featureCoords = feature.getGeometry().flatCoordinates;
				if (!(featureCoords[0] > mapExtent[0] && featureCoords[0] < mapExtent[2] && featureCoords[1] > mapExtent[1] && featureCoords[1] < mapExtent[3])) {
					//var extent = WidgetMap.mapVideoMonitoringPointLayer.getSource().getExtent();
					//WidgetMap.centerOnMap(extent);
					if (goog.isDef(WidgetMap.map.getView().getZoom()))
						map.controls.FullMapControl.prototype.centerOn_(featureCoords, WidgetMap.map.getView().getZoom());
				}
				WidgetMap.forceAutoFocus = false;
			}
		}
	}
	WidgetMap.isDrawingVideo = false;
};

WidgetMap.calculatingMinDist_ = false;
WidgetMap.mapClickHandler_ = function (event) {
	if (WidgetMap.MAP_BUTTON_STATE.PAN != WidgetMap.currentMapButtonState)
		return;
	if (WidgetMap.isVideoPlayerClosed)
		return;
	WidgetMap.mapVideoMonitoringPointLayer.getSource().clear();
	var currPoint = new ol.Feature(new ol.geom.Point([event.coordinate[0], event.coordinate[1]]));
	WidgetMap.layerManager.defaultSelectionStyle(currPoint, 'LIB_DOC_GEO_VIDEO_POINT_NO_TIME');
	WidgetMap.mapVideoMonitoringPointLayer.getSource().addFeature(currPoint);

	if (!WidgetMap.calculatingMinDist_) {
		WidgetMap.calculatingMinDist_ = true;
		var clickPoint = [event.coordinate[0], event.coordinate[1]];
		var source_ = new proj4.Proj(WidgetMap.DEFAULT_PROJECTION);
		var dest_ = new proj4.Proj(GeoUtil.PROJS.WGS84);
		//с двойной трансформацей отлет 2 метра пропадает
		var pnt = new proj4.toPoint(clickPoint);
		proj4.transform(source_, dest_, pnt);
		var p42WgsPnt = GeoUtil.WGSP42(pnt.y, pnt.x);
		pnt = new proj4.toPoint([Math.abs(p42WgsPnt.x), Math.abs(p42WgsPnt.y)]);
		clickPoint = [pnt.x, pnt.y];
		//Проверяем, что щелчком попали на трек. Если не попали - перемещаться и искать точку не будем.
		var clickedOnTrack = this.isPixelOnTrack([event.coordinate[0], event.coordinate[1]]);
		if (!clickedOnTrack) {
			WidgetMap.calculatingMinDist_ = false;
			return;
		}
		//Ищем ближайшую точку трека и перемещаемся к ее времени
		var minDist = Number.MAX_VALUE;
		var minDistObj = undefined;
		//Для поиска ближайшей точки нужно перевести координаты обеих точек в метровую проекцию и найти расстояние между ними
		for (var i in WidgetMap.currentVideoTrackCoords) {
			//Координаты X и Y
			var xCoord = WidgetMap.currentVideoTrackCoords[i].X_COORD;
			var yCoord = WidgetMap.currentVideoTrackCoords[i].Y_COORD;
			if (!isNaN(xCoord) && !isNaN(yCoord)) {
				//Считаем расстояние в проекции данных
				//если данные не в пулково, то преобразуем их в p42 для функции GetDist
				if(App.projection != GeoUtil.PROJS.Pulkovo42){
					var p42WgsPnt = GeoUtil.WGSP42(yCoord, xCoord);
					xCoord = p42WgsPnt.x;
					yCoord = p42WgsPnt.y;
				}
				var curPointDist = GeoUtil.GetDist(yCoord, xCoord, 0, clickPoint[1], clickPoint[0], 0);
				if (curPointDist < minDist) {
					minDist = curPointDist;
					//Если у текущего объекта есть время - сохраняем его как найденный
					if (goog.isDef(WidgetMap.currentVideoTrackCoords[i].Z_COORD))
						minDistObj = WidgetMap.currentVideoTrackCoords[i];
				}
			}
		}
		if (goog.isDef(minDistObj)) {
			var xC = minDistObj.X_COORD;
			var yC = minDistObj.Y_COORD;
			//преобразуем в пулково, т.к. widgetVideoMovePlayheadToCoords принимает такую проекцию
			if(App.projection != GeoUtil.PROJS.Pulkovo42){
				var p42WgsPnt = GeoUtil.WGSP42(yC, xC);
				xC = p42WgsPnt.x;
				yC = p42WgsPnt.y;
			}
			widgetVideoMovePlayheadToCoords(xC, yC);
			WidgetMap.calculatingMinDist_ = false;
		}
	}
};

WidgetMap.isPixelOnTrack = function (coords) {
	//Для перемещения ищем не просто ближайшую точку, а ближайшую точку в радиусе на карте
	var vSearchRad = 15;// По-умолчанию радиус поиска равен 15 пикселей
	vSearchRad = goog.isDef(App.config.MAP_BINDING_RADIUS) ? parseFloat(App.config.MAP_BINDING_RADIUS) : vSearchRad;
	//Рассчитываем по аналогии с инструментом получения информации рамку вокруг точки щелчка для определения пересечения трека с ней
	//если трек пересекается с полигоном вокруг точки - ищем ближайшую точку, иначе не перемещаемся к точке трека
	var pixel = WidgetMap.map.getPixelFromCoordinate([coords[0], coords[1]]);
	//pixel[0]*=getBrowserZoom();
	//pixel[1]*=getBrowserZoom();

	var leftBottom = WidgetMap.map.getCoordinateFromPixel([pixel[0] - vSearchRad, pixel[1] - vSearchRad]);
	var rightTop = WidgetMap.map.getCoordinateFromPixel([pixel[0] + vSearchRad, pixel[1] + vSearchRad]);

	//геометрия выделяемого участка трубопровода
	var geometry = new ol.geom.Polygon(null);
	var linearRing = new ol.geom.LinearRing(null);
	linearRing.setCoordinates([[leftBottom[0], leftBottom[1]],
		[leftBottom[0], rightTop[1]],
		[rightTop[0], rightTop[1]],
		[rightTop[0], leftBottom[1]],
		[leftBottom[0], leftBottom[1]]
	], ol.geom.GeometryLayout.XY);
	geometry.appendLinearRing(linearRing);

	var newLineFeature = new ol.Feature(geometry);
	var trackLayer = WidgetMap.mapVideoMonitoringTrackLayer;
	if (goog.isDef(trackLayer)) {

		var extent1 = trackLayer.getSource().getExtent();
		var extent2 = geometry.getExtent();
		var isIntersect = (extent1[0] <= extent2[2] &&
		extent1[2] >= extent2[0] &&
		extent1[1] <= extent2[3] &&
		extent1[3] >= extent2[1]);
		isIntersect = GeoUtil.polygonIntersect(geometry, trackLayer.getSource().getFeatures()[0].getGeometry());
		if (isIntersect)
			return true;
	}

	return false;
};

WidgetMap.videoCloseHandler = function () {
	WidgetMap.isVideoPlayerClosed = true;
	WidgetMap.mapVideoMonitoringPointLayer.getSource().clear();
	WidgetMap.mapVideoMonitoringTrackLayer.getSource().clear();
};

WidgetMap.changeMapView = function (maxZoom, viewName, projection) {
	var zz = WidgetMap.map.getView().getZoom();
	var cc = WidgetMap.map.getView().getCenter();
	var resolutions = [];
	var DEFAULT_MAX_RESOLUTION = 156543.0339;
	var minZoom = 4;
	//дизейблим форму перехода по координатам, если она открыта
	if ($('#mapCenteringDialog').length > 0) {
		//map.controls.MapCenteringControl.updateValues();
		$('#mapCenteringDialog').remove();
	}
	var zoom = maxZoom + 1;
	resolutions.push(DEFAULT_MAX_RESOLUTION);
	var i = 1;
	for (; i < zoom; i++) {
		resolutions.push(resolutions[i - 1] / 2);
	}
	resolutions = resolutions.slice(minZoom);
	if (WidgetMap.DEFAULT_PROJECTION !== projection/*  WidgetMap.DEFAULT_PROJECTION == 'EPSG:3395'*/) {
		//переводим весь вектор в проекцию базового слоя
		var pnt = new proj4.toPoint([cc[0], cc[1]]);
		var source_ = new proj4.Proj(WidgetMap.DEFAULT_PROJECTION);
		var dest_ = new proj4.Proj(projection);
		proj4.transform(source_, dest_, pnt);
		cc = [pnt.x, pnt.y];
		//Добавляем сюда все слои временные: выделения, буферы, рисование,...
		var layersArr = [];
		if(goog.isDef(WidgetMap.mapSelectionLayer))layersArr = layersArr.concat(WidgetMap.mapSelectionLayer);
		if(goog.isDef(WidgetMap.currentVectorLayer))layersArr = layersArr.concat(WidgetMap.currentVectorLayer);
		if(goog.isDef(WidgetMap.findPathLayer))layersArr = layersArr.concat(WidgetMap.findPathLayer);
		if(goog.isDef(WidgetMap.findPathLineLayer))layersArr = layersArr.concat(WidgetMap.findPathLineLayer);
		if(goog.isDef(WidgetMap.pipeLengthLayer))layersArr = layersArr.concat(WidgetMap.pipeLengthLayer);
		if(goog.isDef(WidgetMap.bufferLayer))layersArr = layersArr.concat(WidgetMap.bufferLayer);
		if(goog.isDef(WidgetMap.mapVideoMonitoringTrackLayer ))layersArr = layersArr.concat(WidgetMap.mapVideoMonitoringTrackLayer );
		if(goog.isDef(WidgetMap.mapVideoMonitoringPointLayer ))layersArr = layersArr.concat(WidgetMap.mapVideoMonitoringPointLayer );
		if(goog.isDef(WidgetMap.measureControl) && goog.isDefAndNotNull(WidgetMap.measureControl.sketch_)){
			WidgetMap.measureControl.reprojectGeometry(WidgetMap.DEFAULT_PROJECTION, projection);
			//WidgetMap.currentMapButtonState === WidgetMap.MAP_BUTTON_STATE.MEASURE
			/*var featureGeometry = WidgetMap.measureControl.sketch_.getGeometry();
			GeoUtil.convertGeometry(featureGeometry,WidgetMap.DEFAULT_PROJECTION, projection);*/
		}
		GeoUtil.convertGeometryFromToDefault(WidgetMap.layerManager.getAllLayers(), WidgetMap.DEFAULT_PROJECTION, projection);
		GeoUtil.convertAdditionalGeometryFromToDefault(layersArr, WidgetMap.DEFAULT_PROJECTION, projection);
		WidgetMap.DEFAULT_PROJECTION = projection;
	}

	WidgetMap.map.setView(new ol.View({
		maxZoom: maxZoom,
		projection: WidgetMap.DEFAULT_PROJECTION,
		minZoom: minZoom,
		center: cc,
		zoom: zz,
		resolutions: resolutions
	}));
	if(goog.isDef(WidgetMap.zoomSliderControl)){
		//устанавливаем ползунок слайдера масштабирования
		WidgetMap.zoomSliderControl.forceSetThumbPosition();
	}
	//WidgetMap.map.renderSync();
};

WidgetMap.isCheckedExternalParamsFromURL = false;
//когда мы распарсили всё, то смотрим на урл и забирает objects, lineId,..
WidgetMap.layersAndStylesParsed = function () {
	if (goog.isDef(WidgetMap.layerManager)) {
		if (WidgetMap.layerManager._rasterLayersQuery == 0 &&
			WidgetMap.layerManager._layersQuery == 0 &&
			WidgetMap.layerManager._styleQuery == 0) {

			MapUtil.reorderVectorLayers();
			//грузим данные для всех видимых слоёв
			WidgetMap.loadAllLayersData();

			//устанавливаем в кнопку с базовыми слоями грид с векторными
			if(goog.isDef(WidgetMap.baseLayersControl))
				WidgetMap.baseLayersControl.setVectorLayers();

			if (getParameterByName('objects') != '') {
				var params = [];
				params.push({name: 'objects', value: getParameterByName('objects')});
				var centering = getParameterByName('centering') == 'true';
				params.push({name: 'centering', value: centering});
				WidgetMap.showObjects(params, undefined, false, true);
			}
			//проверяем наличие параметров, пришедших из внешней системы
			if(!WidgetMap.isCheckedExternalParamsFromURL)
				WidgetMap.checkExternalParamsFromURL();
			WidgetMap.isCheckedExternalParamsFromURL = true;
			//TODO Добавить нормальную проверку
			if (goog.isDef(WidgetMap.baseLayer) && (WidgetMap.baseLayer.value == 'RosMap' || WidgetMap.baseLayer.value == 'RosMap_RASTERMODE')) {
				WidgetMap.map.once("postcompose", function () {
						var params = WidgetMap.BaseLayersParser.currentBaseLayers.getLayers().item(0).getSource().getParams();
						WidgetMap.BaseLayersParser.currentBaseLayers.getLayers().item(0).getSource().updateParams(params);
					}
				);
			}

			//если были установлены параметры в начальном сценарии, то вызываем дальнейшее открытие гридов и включение слоёв
			if(App.scenarioParams){
				var params = App.scenarioParams;
				App.scenarioParams = undefined;
				ExternalInteraction.treeCallFunction(params, 'loadScenario');
			}
		}
	}
};


WidgetMap.hasFitMapAndVisible = false;
WidgetMap.hasFitMapAndVisibleAndApplied = false;
WidgetMap.loadAllLayersData = function () {
	if (WidgetMap.isModelsVector == true) {
		var layers = WidgetMap.layerManager.getAllLayers();//все векторые слои
		var i;
		try{
			var filter = $('#treeDiv').myCategories('callbackFilter', {params: {windowId: ''}});
			WidgetMap.updateTopFilter(filter.params);
		}
		catch(ex){}
		for (i in layers) {

			//если нашли fitMap=true и слой включаем, то меняем режим карты после его подгрузки
			//если слоя нет с fitMap, то выставляем флаг, подгружаем сразу подложки
			var layerObj = layers[i];
			if (layerObj.visible === 'true' || layerObj.visible == true) {
				if (goog.isDef(layerObj.layer) && layerObj.layer.fitMap == true && layerObj.layer.name == 'PODS_ROUTE')//TODO ПЕРЕДЕЛАТЬ, чтобы не было pods_route)
					WidgetMap.hasFitMapAndVisible = true;
				WidgetMap.layerManager.enableLayer(layerObj.id);
			}
			else {
				WidgetMap.layerManager.disableLayer(layerObj.id);
			}
			//привязываем событие, чтобы мониторить, нужно ли подгружать данные для слоев
			if (goog.isDef(layerObj.layer))
				layerObj.layer.bindDataRequest();
		}
		if(!WidgetMap.hasFitMapAndVisible && goog.isDef(WidgetMap.baseLayersControl) && !WidgetMap.hasFitMapAndVisibleAndApplied){
			WidgetMap.hasFitMapAndVisibleAndApplied = true;
			//WidgetMap.baseLayersControl.changeListByMode();
		}
	}
};

WidgetMap.updateTopFilter = function (params) {
	var layerId = '';
	var j = 0;
	for (j; j < params.length; j++) {
		var curParam = params[j];
		if (!curParam.hasOwnProperty('name')) continue;
		var newFilters = [];
		var curFilters;
		switch (curParam['name']) {
			case 'filter':
			case 'roughFilter':
				curFilters = curParam['value'].split('|');
				for (var i = 0; i < curFilters.length; i++) {
					var nameValArr = curFilters[i].split(':');
					if (nameValArr && nameValArr.length == 2) {
						var newFilterObj = {name: nameValArr[0], value: nameValArr[1]};
						newFilters.push(newFilterObj);
					}
				}

				if (curParam['name'] == 'filter') {
					//Переписываем массив фильтров верхнего уровня, из которых формируются запросы
					newFilters.forEach(function(val){
						if(val && val.name){
							if(WidgetMap.currentTopFilter.length == 0)
								WidgetMap.currentTopFilter = newFilters;
							else{
								var finded = false;
								for(var ni = 0; ni < WidgetMap.currentTopFilter.length; ni++){
									if(WidgetMap.currentTopFilter[ni].name !== undefined ){
										if(WidgetMap.currentTopFilter[ni].name === val.name ){
											WidgetMap.currentTopFilter[ni].value = val.value;
											finded = true;
											break;
										}
									}
								}
								if(!finded)
									WidgetMap.currentTopFilter.push(val);
							}
						}
						//WidgetMap.currentTopFilter = newFilters;
					});

				}
				else if (curParam['name'] == 'roughFilter') {
					//Переписываем массив фильтров среднего уровня, из которых формируются запросы
					WidgetMap.currentRoughFilter = newFilters;
				}
				break;
			case 'layerId':
				layerId = curParam['value'];
				break;
		}
	}

};


/**
 * Привязка объекта пришедшего извне
 * @param systemId
 * @param objectId
 * @constructor
 */
WidgetMap.ExternalLinkToObject = function (systemId, objectId) {
	WidgetMap.map.removeControl(WidgetMap.linkObjectControl);
	WidgetMap.linkObjectControl = new map.controls.LinkObjectControl({systemId: systemId, objectId: objectId});
	WidgetMap.map.addControl(WidgetMap.linkObjectControl);
};




WidgetMap.externalFunc = '';

//проверка, если извне передавались 2 функции, то запускаем расчет по 2-й
WidgetMap.checkSecondExternalFunction = function () {
	if (WidgetMap.externalFunc != '') {
		WidgetMap.checkExternalParamsFromURL();
	}
};
/**
 * Проверяем, есть ли в url параметры, пришедшие из внешней системы
 * Если есть, то работаем через externalFunctionaAPI
 */
WidgetMap.checkExternalParamsFromURL = function () {
	var funcName = getParameterByName('func');
	if (WidgetMap.externalFunc != '')
		funcName = WidgetMap.externalFunc;
	WidgetMap.externalFunc = '';
	if (funcName != '') {
		var systemId = getParameterByName('systemId');
		switch (funcName) {
			case 'findExternalObject':
				findExternalObject(systemId, getParameterByName('objectId'), getParameterByName('needBind') == "true", getParameterByName('lineId'), getParameterByName('beginKm'), getParameterByName('endKm'));
				break;
			case 'findExternalPipeKm':
				findExternalPipeKm(systemId, getParameterByName('lineId'), getParameterByName('beginKm'));
				break;
			case 'findExternalPipePart':
				findExternalPipePart(systemId, getParameterByName('lineId'), getParameterByName('beginKm'), getParameterByName('endKm'));
				break;
			case 'refreshLayer':
				//<data SYSTEM_ID="ASMO" OBJ_ID="90801076947118" TOP_FILTER="ILI_INSP_FILTER"
				var params = '<data SYSTEM_ID="' + getParameterByName('systemId') + '"  OBJ_ID="' + getParameterByName('objectId') + '" TOP_FILTER="' + getParameterByName('topFilter') + '"  />';
				refreshLayer(getParameterByName('layerName'), params);
				break;
			case 'showVideo':
				showVideo(getParameterByName('docId'), getParameterByName('videoUrl'), getParameterByName('videoName'), getParameterByName('lineId'));
				break;
			case 'openVRML':
				openVRML(systemId, getParameterByName('objectId'));
				break;
			case 'exportIMG':
				exportIMG(systemId, getParameterByName('objectId'));
				break;
			case 'exportGPX':
				exportGPX(systemId, getParameterByName('objectId'));
				break;
			case 'exportExcel':
				exportExcel(systemId, getParameterByName('objectId'));
				break;
			case 'showCAS':
				showCAS(getParameterByName('type'), systemId, getParameterByName('objectId'), getParameterByName('objectName'), getParameterByName('beginKm'), getParameterByName('endKm'));
				break;
			default: {
				if (funcName.indexOf(',') != -1) {//если определены 2 функции
					var funcs = funcName.split(',');
					WidgetMap.externalFunc = funcs[1];
					switch (funcs[0]) {
						case 'findExternalPipeKm':
							findExternalPipeKm(systemId, getParameterByName('lineId'), getParameterByName('beginKm'));
							break;
						case 'findExternalPipePart':
							findExternalPipePart(systemId, getParameterByName('lineId'), getParameterByName('beginKm'), getParameterByName('endKm'));
							break;
						case 'refreshLayer':
							//<data SYSTEM_ID="ASMO" OBJ_ID="90801076947118" TOP_FILTER="ILI_INSP_FILTER"
							var params = '<data SYSTEM_ID="' + getParameterByName('systemId') + '"  OBJ_ID="' + getParameterByName('objectId') + '" TOP_FILTER="' + getParameterByName('topFilter') + '"  />';
							refreshLayer(getParameterByName('layerName'), params);
							break;
					}

				}
			}
		}
	}
}
;


/**
 * Отбор попадающих в зоны МДР земельных участков на основании номера кадастрового квартала участка.
 * @param classId - идентификатор кадастрового слоя
 */
WidgetMap.checkCadastreMDR = function (classId) {
	$('#cadastreNumberDiv').remove();
	function cancel() {
		dlg.dialog('destroy').remove();
	}

	function create() {
		var cadastreNumber = $('#cadastreKvartalInput').jqxInput('val');
		dlg.dialog('destroy').remove();
		WidgetMap.bufferLayer.getSource().clear();
		setTimeout(function () {
			WidgetMap.getMDRByCadastreNumber_(classId, cadastreNumber);
		}, 100);

	}

	var element = $('<div id="cadastreNumberDiv" style="display: block;">\
                        <div class="map-cadastre-label"><label >Кадастровый номер участка:</label><input class="smallText" type="text" style="margin-left: 25px" id="cadastreInput" /></div>\
                        <div class="map-cadastre-label"><label >Кадастровый номер :</label><input class="smallText" type="text" style="margin-left: 65px" id="cadastreKvartalInput" /></div>\
                        <div class="map-cadastre-label">Кадастровый номер квартала должен иметь вид хх:хххх:ххххххх(первые 3 числа кадастрового номера участка).\
                         После нажатия "ОК" будет проведена проверка наличия пересечений границы кадастрового квартала и зон МДР. В случае обнаружения пересечений, они будут предъявлены на карте.<br/>\
                         Внимание! Операция поиска пересечений является длительной.</div>\
                      </div>');
	$('body').append(element);
	var buttons = [];
	buttons.push({text: gis_core_12, click: create});
	buttons.push({text: gis_core_6, click: cancel});
	var dlg = $(element).dialog({
		modal: true,
		title: gis_widgetmap_11,
		dialogClass: 'noCloseButton gsi-zindex__dialog',
		closeOnEscape: true,
		width: 360,
		height: 235,
		resizable: false,
		buttons: buttons
	});

	$('#cadastreInput').jqxInput({height: 22, width: 110, maxLength: 80});
	$('#cadastreInput').keydown(function (event) {
		if (event.keyCode == 13) {
			create();
			return false;
		}
	});
	$('#cadastreInput').on('keyup',
		function (event) {
			var value = $('#cadastreInput').val();
			var splitted = value.split(':');
			var kadNum = value;
			if (splitted.length > 2)
				kadNum = splitted[0] + ':' + splitted[1] + ':' + splitted[2];
			$('#cadastreKvartalInput').jqxInput('val', kadNum);
		});
	//для ie с таймаутом выставляем фокус
	setTimeout(function () {
		$('#cadastreInput').focus();
	}, 10);
	$('#cadastreKvartalInput').jqxInput({height: 22, width: 110, maxLength: 45});
	$('#cadastreKvartalInput').keydown(function (event) {
		if (event.keyCode == 13) {
			create();
			return false;
		}
	});

};

/**
 * Получение геометрии для выбранного кадастра
 * @param layerName - имя слоя
 * @private
 */
WidgetMap.getMDRByCadastreNumber_ = function (layerName, cadastreNumber) {
	var layObj = WidgetMap.layerManager.getLayerByName(layerName);
	var splitted = cadastreNumber.split(':');
	var kadNum = cadastreNumber;
	if (splitted.length > 2)
		kadNum = splitted[0] + ':' + splitted[1] + ':' + splitted[2];
	if (goog.isDef(layObj) && goog.isDef(layObj.layer)) {
		var geo = WidgetMap.getCadastreGeometryByCadNum(layObj.layer, kadNum);
		if (goog.isDef(geo)) {
			if (geo instanceof ol.Feature) {
				geo = geo.getGeometry();
			}
			//преобразуем геометрию в нормальный полигон c нормальными ends
			var pp = new ol.geom.Polygon(null);
			var linearRing = new ol.geom.LinearRing(null);
			linearRing.setFlatCoordinates(ol.geom.GeometryLayout.XY, geo.flatCoordinates);
			pp.appendLinearRing(linearRing);
			//преобразуем в WGS84, чтобы искать пересечение в turf
			GeoUtil.convertGeometry(pp, WidgetMap.DEFAULT_PROJECTION, layObj.layer.projection);
			WidgetMap.checkBuffer(kadNum, pp);

			return;
		}
	}

	function getLayerGeoReqParams(cad_num, request) {
		var userId = AbstractFormDialog.sendUser ? '' + Auth.getUserId() : '-1';
		var userLogin = AbstractFormDialog.sendUser ? '' + Auth.getUserName() : 'guest';
		return {
			getSchema: false,
			descrId: request,
			toElements: false,
			descrType: 'select',
			data: '<root USER_ID="' + userId.xmlEscape() +
			'" USER_LOGIN="' + userLogin.xmlEscape() +
			'" PODS_USER="' + userLogin.xmlEscape() +
			'" >' +
			'<data FILTER="CAD_NUM=\'' + cad_num + '\'" />' +
			'</root>'
		};
	}

	function getLayerGeoFault(resultXml) {
		BlockingUtil.ready();
		App.errorReport(gis_widgetmap_12, resultXml, undefined, {filename:gis_filename_393, functionname:'gis_filename_393_11'});
	}

	function getLayerGeoResult(resultXml) {
		BlockingUtil.ready();
		try {
			var er = HTTPServiceUtil.getError(resultXml);
			if (er !== '') {
				App.errorReport(gis_widgetmap_12, er, undefined, {filename:gis_filename_393, functionname:'gis_filename_393_12'});
				return;
			}
			var layerGeoXml = ($.parseXML(resultXml)).firstChild;
			var datas = layerGeoXml.getElementsByTagName("data");
			var stride = 2;
			var i = 0;
			if (datas.length == 0) {
				App.confirmDialog(gis_widgetmap_7 + kadNum + gis_widgetmap_8, null, {
					width: 340,
					title: gis_core_1
				});
				return;
			}
			var hasWKT = false;
			for (i; i < datas.length; i++) {
				//парсим фичу, меняем проекцию, добавляем в слой для выделенных объектов
				var format = new ol.format.WKT({dimension: stride});
				var wktStr = datas[i].getAttribute("WKT");
				var cNum = datas[i].getAttribute("CAD_NUM");
				var fGeometry = undefined;
				if (goog.isNull(wktStr))
					continue;
				hasWKT = true;
				try {
					fGeometry = format.readGeometry(wktStr);
				}
				catch (ex) {
					//для случая с видеозаписями, приходит 3 координаты
					stride = 3;
					format = new map.format.WKT({dimension: stride});
					fGeometry = format.readGeometry(wktStr);

				}
				//получаем все зоны и ищем пересечения
				WidgetMap.checkBuffer(cNum, fGeometry);
			}
			if (!hasWKT)
				App.confirmDialog(gis_widgetmap_9 + kadNum + gis_widgetmap_10, null, {
					width: 340,
					title: gis_core_1
				});
		}
		catch (e) {
		}
	}

	BlockingUtil.wait();
	var spatialRequest = 'KADASTR_GEO.xml#WEB50_KADASTR_KVARTAL';
	if (goog.isDef(layObj) && goog.isDef(layObj.layer) && goog.isDef(layObj.layer.dataProvider) && goog.isDef(layObj.layer.dataProvider.spatial) && layObj.layer.dataProvider.spatial != '')
		spatialRequest = layObj.layer.dataProvider.spatial;
	App.serverQueryXML2Node(Services.processQueryNodeGeo, getLayerGeoReqParams(kadNum, spatialRequest), getLayerGeoResult, getLayerGeoFault);
};


/**
 * Загрузка буферов и проверка на попадание в них квартала кадастрового
 * @param cadNum -  номер кадастрового квартала
 * @param geometry - его геометрия. приходит в wgs84
 * если не нашли пересечения то, нужно преобразовать в EPSG:900913
 */
WidgetMap.checkBuffer = function (cadNum, geometry) {
	var bufferLayerName = 'WEB50_KADASTR_PODS_MDR';
	var layObj = WidgetMap.layerManager.getLayerByName(bufferLayerName);
	if (goog.isDef(layObj) && goog.isDef(layObj.layer)) {
		//ищем геометрию в слое, если геометрий нет, то грузим через запросы
		var geoArr = layObj.layer.getAllGeometries();
		if (geoArr.length > 0) {
			var k = 0;
			BlockingUtil.wait();
			var errorText = '';
			var success = false;
			for (; k < geoArr.length; k++) {
				//получаем все зоны и ищем пересечения
				var pp;
				if (geoArr[k] instanceof ol.geom.GeometryCollection) {
					pp = new ol.geom.Polygon(null);
					var linearRing = new ol.geom.LinearRing(null);
					linearRing.setFlatCoordinates(ol.geom.GeometryLayout.XY, geoArr[k].getGeometries()[0].flatCoordinates);
					pp.appendLinearRing(linearRing);
				}
				else {
					pp = new ol.geom.Polygon(null);
					/*if(k == 196)
						console.log('d');*/ // проблемный полигон с незавершенной линией
					var linearRing = new ol.geom.LinearRing(null);
					linearRing.setFlatCoordinates(ol.geom.GeometryLayout.XY, geoArr[k].flatCoordinates);
					pp.appendLinearRing(linearRing);
				}
				//преобразуем проекцию WEB50_KADASTR_PODS_MDR в wgs84 для поиска пересечений в turf
				GeoUtil.convertGeometry(pp, WidgetMap.DEFAULT_PROJECTION, layObj.layer.projection);
				var result = GeoUtil.checkCadastreInBuffer(geometry, pp);
				if (goog.isDef(result)) {
					if (goog.isDef(result.geo) && result.geo.length > 0) {
						//добавлям квартал
						for (var ff in result.geo) {
							GeoUtil.convertFeature(result.geo[ff], layObj.layer.projection, WidgetMap.DEFAULT_PROJECTION);
							WidgetMap.layerManager.defaultSelectionStyle(result.geo[ff]);
							WidgetMap.bufferLayer.getSource().addFeature(result.geo[ff]);
							success = true;
						}
					}
					else if (result.error !== '')
						errorText += result.error + '\n';
				}
			}
			BlockingUtil.ready();
			if (success) {
				App.confirmDialog(gis_widgetmap_13 + cadNum + gis_widgetmap_14, null, {title: gis_core_1});
				WidgetMap.centerOnMap(WidgetMap.bufferLayer.getSource().getExtent());
			}
			else {
				GeoUtil.convertGeometry(geometry,App.projection,WidgetMap.DEFAULT_PROJECTION);
				WidgetMap.showNoCadastreIntersectsDialog(cadNum, geometry, errorText);
			}
			return;
		}
	}

	function getLayerGeoReqParams() {
		var userId = AbstractFormDialog.sendUser ? '' + Auth.getUserId() : '-1';
		var userLogin = AbstractFormDialog.sendUser ? '' + Auth.getUserName() : 'guest';
		return {
			getSchema: false,
			descrId: 'KADASTR_GEO.xml#WEB50_KADASTR_PODS_MDR',
			toElements: false,
			descrType: 'select',
			data: '<root USER_ID="' + userId.xmlEscape() +
			'" USER_LOGIN="' + userLogin.xmlEscape() +
			'" PODS_USER="' + userLogin.xmlEscape() +
			'" >' +
			'<data />' +
			'</root>'
		};
	}

	function getLayerGeoFault(resultXml) {
		BlockingUtil.ready();
		App.errorReport(gis_widgetmap_15, resultXml, undefined, {filename:gis_filename_393, functionname:'gis_filename_393_13'});
	}

	function getLayerGeoResult(resultXml) {
		try {
			var er = HTTPServiceUtil.getError(resultXml);
			if (er !== '') {
				App.errorReport(gis_widgetmap_12, er, undefined, {filename:gis_filename_393, functionname:'gis_filename_393_14'});
				return;
			}
			var layerGeoXml = ($.parseXML(resultXml)).firstChild;
			var datas = layerGeoXml.getElementsByTagName("data");
			var stride = 2;
			var i = 0;

			var errorText = '';
			var success = false;
			for (i; i < datas.length; i++) {
				//парсим фичу, меняем проекцию, добавляем в слой для выделенных объектов
				var format = new ol.format.WKT({dimension: stride});
				var wktStr = datas[i].getAttribute("WKT");
				var fGeometry = undefined;
				if (goog.isNull(wktStr))
					continue;
				try {
					fGeometry = format.readGeometry(wktStr);
				}
				catch (ex) {
					//для случая с видеозаписями, приходит 3 координаты
					stride = 3;
					format = new map.format.WKT({dimension: stride});
					fGeometry = format.readGeometry(wktStr);

				}
				//получаем все зоны и ищем пересечения
				var result = GeoUtil.checkCadastreInBuffer(geometry, fGeometry);
				if (goog.isDef(result)) {
					if (goog.isDef(result.geo) && result.geo.length > 0) {
						for (var ff in result.geo) {
							GeoUtil.convertFeature(result.geo[ff], App.projection, WidgetMap.DEFAULT_PROJECTION);
							WidgetMap.layerManager.defaultSelectionStyle(result.geo[ff]);
							WidgetMap.bufferLayer.getSource().addFeature(result.geo[ff]);
							success = true;
						}
					}
					else if (result.error !== '')
						errorText += result.error + '\n';
				}
			}
			if (success) {
				App.confirmDialog(gis_widgetmap_13 + cadNum + gis_widgetmap_14, null, {title: gis_core_1});
				WidgetMap.centerOnMap(WidgetMap.bufferLayer.getSource().getExtent());
			}
			else {
				GeoUtil.convertGeometry(geometry,App.projection,WidgetMap.DEFAULT_PROJECTION);
				WidgetMap.showNoCadastreIntersectsDialog(cadNum, geometry, errorText);
			}
		}
		catch (e) {
		}
		BlockingUtil.ready();
	}

	BlockingUtil.wait();
	App.serverQueryXML2Node(Services.processQueryNodeGeo, getLayerGeoReqParams(), getLayerGeoResult, getLayerGeoFault);
};


/**
 * Получение геометрии по кадастру по его номеру
 * @param id
 */
WidgetMap.getCadastreGeometryByCadNum = function (layer, cadNum) {
	if (!goog.isDef(cadNum) || cadNum == '')
		return undefined;
	//выбираем все features, в которых возможно хранить наш тип геометрии
	var features = layer.featureProjLayer.getSource().getSource().getFeatures();
	var j = 0;
	for (j; j < features.length; j++) {
		var points = features[j].get('labelsObjAll');
		var aa;
		for (aa in points) {
			if (points[aa].label == cadNum) {
				return points[aa].geo;
			}
		}
	}
	return undefined;
};

/**
 * Показать диалог, когда не нашли пересечения выбранного кадастрового квартала с зонами МДР
 * @param cadNum - номер кадастроворго квартала
 * @param geometry - геометрия кадастрового квартала
 */
WidgetMap.showNoCadastreIntersectsDialog = function (cadNum, geometry, errorText) {
	errorText = '';
	function closeDialog() {
		dlg.dialog('destroy');
		dlg.remove();
	}

	function showCadastre() {
		var ff = new ol.Feature(geometry);
		WidgetMap.layerManager.defaultSelectionStyle(ff);
		WidgetMap.bufferLayer.getSource().addFeature(ff);
		WidgetMap.centerOnMap(geometry.getExtent());
		closeDialog();
	}

	var buttons = [
		{text: gis_ppanel_6, click: showCadastre},
		{text: gis_ppanel_7, click: closeDialog}
	];
	if (errorText != '') {
		errorText = gis_widgetmap_16 + errorText;
		App.errorReport(gis_widgetmap_17 + cadNum + gis_widgetmap_18, errorText, undefined, {filename:gis_filename_393, functionname:'gis_filename_393_15'});
	}
	var dlg = App.confirmDialog(gis_widgetmap_19 + cadNum + gis_widgetmap_20, buttons, {title: gis_core_1});
};


WidgetMap.loadRoutesWithLines = function(params){
	var request = params.request;
	var loadedCallback = params.loadedCallback;
	WidgetMap.preloadRoutesWithLinesList = {};
	function getRouteStationParams() {
		var userId = AbstractFormDialog.sendUser ? '' + Auth.getUserId() : '-1';
		var userLogin = AbstractFormDialog.sendUser ? '' + Auth.getUserName() : 'guest';
		return {
			getSchema: false,
			descrId: 'SYS_SEM.xml#PODS_ROUTE_STATION_LIST',
			toElements: false,
			descrType: 'select',
			data: '<root USER_ID="'+userId.xmlEscape()+'" USER_LOGIN="'+userLogin.xmlEscape()+'" PODS_USER="'+userLogin.xmlEscape()+'" >'+
				'<data/>'+
				'</root>'
		};
	}
	function getLayerResult(resultXml) {
		var er = HTTPServiceUtil.getError(resultXml);
		if (er !== ''){
			App.errorReport(gis_core_error_1, er, undefined, {filename:gis_filename_3, functionname:'gis_filename_3_9'});
			if(loadedCallback)
				loadedCallback();
			return;
		}
		 	// Иногда ответ в формате XML, а иногда в виде просто строки
			var layerGeoXml = ($.parseXML(resultXml)).firstChild;
			var datas = layerGeoXml.getElementsByTagName("data");
			if(datas.length == 0)
				return;
			//объекты, у которых есть геометрия
			var i = 0;
			for (; i < datas.length; i++) {
				//парсим фичу, меняем проекцию, добавляем в слой для выделенных объектов
				var routeId = datas[i].getAttribute("ROUTE_ID");
				var lineId = datas[i].getAttribute("LINE_ID");
				WidgetMap.preloadRoutesWithLinesList[routeId] = lineId;
			}
			
		
	}
	function getLayerFault(resultXml){
		var er = HTTPServiceUtil.getError(resultXml);
		if (er !== '')
			App.errorReport(gis_core_error_1, er, undefined, {filename:gis_filename_3, functionname:'gis_filename_3_10'});
		if(loadedCallback)
			loadedCallback();
	}
	App.serverQueryXMLNodeWithTries(Services.processQueryNode, getRouteStationParams(), getLayerResult,getLayerFault,4);
};

/**
 * Запрос профиля трубы
 */
WidgetMap.loadLineProfile = function(lineId, stationBegin, stationEnd) {
	var sendingData = '<data LINE_ID="'+lineId+
		'" KM_START="' +stationBegin+ '" KM_END="'+ stationEnd + '"/>';
	var reqParams = QueryDataProvider.prototype.getReqParams('GAZPROM_SYS_SEM.xml#MG_PROFILE',sendingData);
	//результат получения геометрии
	function fault_(resultXml){
		var er = HTTPServiceUtil.getError(resultXml);
		if(er !== ''){
			App.errorReport(gis_core_error_1, er, undefined, {filename:gis_filename_393, functionname:'gis_filename_393_20'});
		}
	}
	function result_(resultXml) {
		var er = HTTPServiceUtil.getError(resultXml);
		if (er !== '') {
			App.errorReport(gis_core_error_1, er, undefined, {filename:gis_filename_393, functionname:'gis_filename_393_21'});
		}
		else {
			var layerGeoXml = ($.parseXML(resultXml)).firstChild;
			var datas = layerGeoXml.getElementsByTagName("data");
			var lineSegmentList = [];
			if(datas.length > 0){
				for (var i = 0; i < datas.length; i++) {
					//Добавляем точки в участок, если они находятся между граничными значениями
					lineSegmentList.push({
						STATION:  parseFloat(datas[i].getAttribute("STATION")),
						X_COORD:  parseFloat(datas[i].getAttribute("X_COORD")),
						Y_COORD:  parseFloat(datas[i].getAttribute("Y_COORD"))
					});
				}
			}
			WidgetMap.showPipePart(lineSegmentList);
		}
	}
	App.serverQueryXMLNodeWithTries(Services.processQueryNode,reqParams, result_, fault_,4);
};

/**
 * Выделяем на карте участок
 * @param pntList
 * @private
 */
WidgetMap.showPipePart = function(pntList) {
	MapUtil.clearSelectionLayer();
	if(pntList && pntList.length > 0){
		var flatCoordinates = [];
		for(var i = 0; i < pntList.length; i++){
			var lng = pntList[i].X_COORD;
			var lat = pntList[i].Y_COORD;
			flatCoordinates.push(parseFloat(lng));
			flatCoordinates.push(parseFloat(lat));
		}
		if(flatCoordinates.length > 2){
			//геометрия выделяемого участка трубопровода
			var geometry = new ol.geom.LineString(null);
			geometry.setFlatCoordinates(ol.geom.GeometryLayout.XY,flatCoordinates);
			var newLineFeature = new ol.Feature(geometry);
			GeoUtil.convertFeature(newLineFeature, App.projection, WidgetMap.DEFAULT_PROJECTION);
			if(WidgetMap.layerManager)
				WidgetMap.layerManager.defaultSelectionStyle(newLineFeature);
			if(WidgetMap.mapSelectionLayer){
				WidgetMap.mapSelectionLayer.getSource().addFeature(newLineFeature);
				var extent = WidgetMap.mapSelectionLayer.getSource().getExtent();
				WidgetMap.map.getView().fit(extent, WidgetMap.map.getSize());
				//перемещаем грид вниз экрана
				widgetMoveWindowToPosition('grid');
			}
			return;
		}
	}
	App.errorReport(gis_core_error_1, gis_widgetmap_29, undefined, {filename:gis_filename_393, functionname:'gis_filename_393_22'});
};
/*Объект, сохраняющий глобально данные каждого поста по ключу post_id*/
App.postsDataObject = {};
//количество запрашиваемых записей
App.POSTS_STEP_LIMIT = 20;
/* генератор обертки одного конкретного поста (заголовок + текст + картинка + футер) */
App.getHtmlWrapper = function getHtmlWrapper(params,postTemplate) {
	if (postTemplate==undefined) postTemplate = "ui/html/templates/DefaultPostTemplate.html";
	/* функция для экранирования спецсимволов regExp, если они есть в заменяемой строке */
	function escapeRegExp(stringToGoIntoTheRegex) {
		return stringToGoIntoTheRegex.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
	}

	var curHtmlTemplate = '';
	$.ajax({
		type: "GET",
		url:postTemplate+'?'+Math.random(),
		timeout: App.clientRequestTimeout,
		async: false, /* Делаем асинхронным для возврата полученного результата как return функции App.getHtmlWrapper */
		success:function(data) {
			curHtmlTemplate = data;
			//Подставляем переменные, пришедшие в объекте params в html-шаблон, переменные в шаблоне обернуты в { и }
			$.each(params, function(index, value) {
				var stringToGoIntoTheRegex = escapeRegExp(index);
				var regex = new RegExp("{" + stringToGoIntoTheRegex + "}", "g");
				curHtmlTemplate = curHtmlTemplate.replace(regex, value);
			});
			//Под конец заменяем все не найденные в данных переменные шаблона
			var regex = new RegExp("{\\w*}", "g");
			curHtmlTemplate = curHtmlTemplate.replace(regex, '');
		}
	});
	return curHtmlTemplate;
};

//Функция форматирования даты в виде dd.mm.yyyy HH:MM
App.formatDateToString = function formatDateToString(d) {
	if(d === '') return '';
	var curDate = d.getDate() < 10 ? '0'+d.getDate() : d.getDate();
	var curMonth = d.getMonth()+1 < 10 ? '0'+(d.getMonth()+1).toString() : d.getMonth()+1;
	var curHours = d.getHours() < 10 ? '0'+d.getHours() : d.getHours();
	var curMinutes = d.getMinutes() < 10 ? '0'+d.getMinutes() : d.getMinutes();
	var dformat = curDate+'.'+curMonth+'.'+d.getFullYear()+' '+curHours+':'+curMinutes;
	return dformat;
};

App.openCurPostDocLink = function(getCurPostDocLink,curPostId){
	App.closePostDialogLinkDialog_();
	var divv = '<div id="getCurPostDocLinkDialog"><textarea id="getCurPostDocLinkText" style="width:265px;margin: 1px;color: #005d98;height: 55px;font-size: 11px; font-family: Verdana,Arial,sans-serif;" class="map-link-text">' + getCurPostDocLink + '</textarea></div>';
	$('body').append(divv);
	var dlg = $('#getCurPostDocLinkDialog');
	// Готовим кнопки, и добавляем обработчики
	var buttons = [];
	buttons.push({
		text: gis_postsloader_4,
		click: function(){
			App.closePostDialogLinkDialog_();
		}
	});
	dlg.dialog({
		modal: false,
		title: gis_postsloader_1,
		dialogClass: 'gsi-zindex__dialog',
		closeOnEscape: true,
		width: 274,
		height: 140,
		resizable: false,
		position: {my: "right bottom", at: "right bottom", of: '#postId_'+curPostId},
		buttons : buttons,
		create: function() {
			$(this).closest('div.ui-dialog')
				.find('.ui-dialog-titlebar-close')
				.click(function(e) {
					App.closePostDialogLinkDialog_();
					e.preventDefault();
				});
		}
	});
	$('#getCurPostDocLinkText').select();
};

/**
 * Закрытие формы добавления документа
 */
App.closePostDialogLinkDialog_ = function(){
	$('#getCurPostDocLinkDialog').remove();
};

/* отображение диалога со ссылкой на документ */
App.getCurPostDocLink = function getCurPostDocLink(getCurPostDocLink, curPostId) {
	if (curPostId!=undefined && curPostId!=null && curPostId!='' && curPostId!='{post_id}') {
		var curLibDocId, curLibDocFileName;
		//Получаем идентификатор документа для ссылки
		var curPostData = App.postsDataObject.hasOwnProperty(curPostId) ? App.postsDataObject[curPostId] : null;
		if (curPostData && curPostData.postData.hasOwnProperty('DOC_ID') && curPostData.postData.hasOwnProperty('FILE_NAME')) {
			curLibDocId = curPostData.postData['DOC_ID'];
			curLibDocFileName = curPostData.postData['FILE_NAME'];
		}
		if (!curLibDocId || curLibDocId=='' || !curLibDocFileName || curLibDocFileName=='') return; //Считаем что ошибка, если не можем получить данные для ссылки на документ
		//Формируем ссылку на конкретный документ (считаем документами только те, что в LIB лежат, т.е. файлы)
		var getCurPostDocLink = window.location.protocol+'//'+window.location.host+window.location.pathname.replace('/docList.html','')+'/'+((App.config !== null)?App.config.LIB_PATH:'')+'/'+curLibDocFileName;
		//var getCurPostDocLink = '{DOC_LINK:WEB50_LIB_DOC/' + curLibDocId+'}'; //Пока что ссылку заключаем в фигурные скобки. Дальше посмотрим, возможно добавятся еще параметры
		//Создаем диалог со ссылкой (как на карте в "получить ссылку")
		App.openCurPostDocLink(getCurPostDocLink,curPostId);
	}
};

/* Функция удаляет пост */
App.deletePost = function deletePost(curPostId) {
	if (curPostId!=undefined && curPostId!=null && curPostId!='' && curPostId!='{post_id}') {
		//Получаем идентификатор документа для удаления
		var curPostData = App.postsDataObject!=undefined && App.postsDataObject.hasOwnProperty(curPostId) ? App.postsDataObject[curPostId] : null;
		//Удалять имеет смысл только если для поста есть все данные, иначе все равно не удалится
		//Дополнительно проверяем, что автор поста и редактор - одни и те же (при тестировании лучше комментировать)
		if (curPostData!=null &&
			(curPostData.postData.hasOwnProperty('USERNAME') && Auth.getUserName()!=null && curPostData.postData['USERNAME'].toLowerCase()==Auth.getUserName().toLowerCase()
				|| (curPostData.postsData.userData && curPostData.postsData.userData.attr('ROLE_ID')=='0'))
			&& (curPostData.postData.hasOwnProperty('GATE_ID') || curPostData.postsData.objectType === 'folderId')) {
			//Показываем форму подтверждения удаления поста
			var alertForm = new AlertForm();
			alertForm.alertOkButtonText = gis_ppanel_6;
			alertForm.alertCancelButtonText = gis_ppanel_7;
			alertForm.build("deletePostAlertFormDiv",gis_postloader_11, gis_postloader_12);
			//Добавляем слушатель закрытия формы
			$("body").on(CloseEvent.CLOSE, function deletePostAlertFormClose(evt/*CloseEvent*/) {
				$("body").off(CloseEvent.CLOSE);
				if (evt && evt.detail==1) {
					var postsData = curPostData.postsData;
					var postsContainer = $(postsData.postsContainer);
					var requestParams;
					//Если объект, к которому прикреплен документ - папка, то удаляем сам документ а не связь, причем другим запросом
					if (postsData.objectType=='folderId') {
						var postParentDocId = curPostData.postData['DOC_ID'];
						requestParams = {descrType:'delete', descrId:'SYS_SEM.xml#WEB50_LIB_DOC', toElements:false, getSchema:false,
							data:'<root><data SYS_OBJ_ID="'+postParentDocId+'"/></root>' };
					} else {
						//Удаляем только связь с текущим объектом - этот документ может быть добавлен к другим
						var postGateId = curPostData.postData['GATE_ID'];
						requestParams = {descrType:'delete', descrId:'SYS_SEM.xml#LIB_DOC_COMMENTS_LIST', toElements:false, getSchema:false,
							data:'<root><data GATE_ID="'+postGateId+'"/></root>' };
					}
					//Устанавливаем курсор ожидания
					BlockingUtil.wait();
					//BlockingUtil.blockApplication();
					App.serverQueryXMLNodeWithTries(Services.processQueryNode, requestParams,
						function deletePostResult(resultXML){
							//Снимаем курсор ожидания
							BlockingUtil.ready();
							//BlockingUtil.unblockApplication();
							if (resultXML) {
								var er = HTTPServiceUtil.getError(resultXML);
								if (er != "")
									App.errorReport(gis_postloader_9, er, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_1'});
								else {
									//получаем сам текущий пост, чтобы удалить его
									var curPost = $('#postId_'+curPostId);
									curPost.remove();
									//Удаляем все вхождения данных об этом посте
									var curPostInd = postsData.cupPostsArr.indexOf(curPostData);
									postsData.cupPostsArr.splice(curPostInd,1);
									//Обновляем текст о количестве постов
									var endInd = $('.postWrapper',postsContainer).length;
									//Не считаем папку "Вверх" элементом
									var endIndText = endInd;
									var totalIndText = postsData.cupPostsArr.length;
									if (postsData.objectType=='folderId' && postsData.objId!='root') {
										endIndText--;
										totalIndText--;
									}
									$('.postsHeaderRecords',postsContainer).text(gis_postsloader_5+endIndText+gis_postsloader_6+totalIndText+gis_postsloader_7);
									//Удаляем ссылку на пост в текущем объекте
									delete App.postsDataObject[curPostId];
								}
							}
						},
						function deletePostFault(resultXML){
							//Снимаем курсор ожидания
							BlockingUtil.ready();
							//BlockingUtil.unblockApplication();
							if (resultXML) {
								var er = HTTPServiceUtil.getError(resultXML);
								App.errorReport(gis_postloader_9, er, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_2'});
							}
						},4
					);
				}
			});
		} else {
			var alert = new AlertForm();
			alert.build('alertFormDiv', gis_postloader_10, gis_postloader_13, AlertForm.OK);
		}
	}
};

/* Функция делает пост редактируемым (при условии что редактирует автор или админ) */
App.makePostEditable = function makePostEditable(curPostId) {
	if (curPostId!=undefined && curPostId!=null && curPostId!='' && curPostId!='{post_id}') {
		//Получаем идентификатор документа для редактирования
		var curPostData = App.postsDataObject!=undefined && App.postsDataObject.hasOwnProperty(curPostId) ? App.postsDataObject[curPostId] : null;
		//Редактировать имеет смысл только если для поста есть все данные, иначе все равно не сохранится
		//Дополнительно проверяем, что автор поста и редактор - одни и те же (при тестировании лучше комментировать)
		if (curPostData!=null &&
			(curPostData.postData.hasOwnProperty('USERNAME') && Auth.getUserName()!=null && curPostData.postData['USERNAME'].toLowerCase()==Auth.getUserName().toLowerCase()
				|| (curPostData.postsData.userData && curPostData.postsData.userData.attr('ROLE_ID')=='0'))) {
			var curLibDocId;
			if (curPostData.postData.hasOwnProperty('DOC_ID')) curLibDocId = curPostData.postData['DOC_ID'];
			if (!curLibDocId || curLibDocId=='') return; //Считаем что ошибка, если не можем получить данные для ссылки на документ
			//получаем сам текущий пост, чтобы заменить его на диалог редактирования и вернуть в прежнем виде если отменили
			var curPost = $('#postId_'+curPostId);
			$.get("./ui/html/templates/EditPostTemplate.html?_"+Math.random(), function(data) {
				try {
					var postsData = curPostData.postsData;
					var postsContainer = $(postsData.postsContainer);
					//Обрабатываем пришедшие данные
					var receivedHtml = $(data);
					curPost.hide();
					curPost.after(receivedHtml);
					var postsEditPost = receivedHtml;
					//Функция ограничения вводимых символов по maxlength атрибуту
					function checkMaxLength() {
						var maxlength = $(this).attr('maxlength');
						var val = $(this).val();
						if (val.length > maxlength) {
							$(this).val(val.slice(0, maxlength));
						}
					}
					//Поле названия
					var postsAddPostName = $('.postsAddPostName',receivedHtml);
					var labelBtnName = $('.btn',receivedHtml);
					labelBtnName.click(function(){
						$("#iFI_myElement",receivedHtml).trigger('click');
					});
					//Сразу ставим ограничение для ввода в поле не более 250 символов
					postsAddPostName.on('keyup blur', checkMaxLength);
					//Поле описания
					var postsAddPostDescr = $('.postsAddPostDescr',receivedHtml);
					//Сразу ставим ограничение для ввода в поле не более 250 символов
					postsAddPostDescr.on('keyup blur', checkMaxLength);
					//Поле пути к файлу
					var postsAddPostFileFolder = $('.postsAddPostFileFolder',receivedHtml);
					//Заполняем поля редактирования имеющимися данными
					var curPostName = curPostData.postData.hasOwnProperty('NAME') ? curPostData.postData['NAME'] : '';
					var curPostDescr = curPostData.postData.hasOwnProperty('DESCR') ? curPostData.postData['DESCR'] : '';
					var curPostEditTitle = gis_postloader_14 + curPostName; //Пока что в заголовке показываем название документа
					var curPostFileName = curPostData.postData.hasOwnProperty('FILE_NAME') ? curPostData.postData['FILE_NAME'] : '';
					$('.postsAddPostButtons span.postsAddPostButtonsTitle',receivedHtml).text(curPostEditTitle);
					postsAddPostName.focus().text(curPostName);
					postsAddPostDescr.text(curPostDescr);
					postsAddPostFileFolder.val(curPostFileName);

					function importFile() {
						var fileName = $("#myElement",receivedHtml).val();
						//Проверяем, что поле выбранного файла не пустое
						if(fileName != '' && fileName == $("#myElementText",receivedHtml).val()){// если называние файла не редактировали, то сначала загружаем его
							var form = $('#fr_myElement',receivedHtml);
							form.attr('action',form.data('action')+'&fileNameGUID='+encodeURI(fileName));//.submit();
							form.submit();
							EditPost();
						}
						else{
							//если пустое поле, то всё равно создаем новый пост
							EditPost();
						}
					}
					$('#ifr_myElement',receivedHtml).load(function(){
						if($("#myElement",receivedHtml).val() == ''){
							return;
						}
						$("#myElement",receivedHtml).val('');
						EditPost();
					});
					function getUniqueId(){return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
						var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);return v.toString(16);});
					};
					$("#iFI_myElement",receivedHtml).change(function(){
						var fileName = $("#iFI_myElement",receivedHtml).val().split('\\');
						if(fileName.length != 1)fileName = fileName[fileName.length-1].split('.');
						else fileName = fileName[0].split('.');
						fileName[0] += '_'+getUniqueId();
						fileName = fileName.join('.');
						$("#myElement",receivedHtml).val(fileName);
						$("#myElementText",receivedHtml).val(fileName);
					});
					function EditPost(){
						var newPostName = postsAddPostName.val();
						var newPostDescr = postsAddPostDescr.val();
						var newPostFileFolder = postsAddPostFileFolder.val();
						var userId = Auth.getUserId();
						var userLogin = Auth.getUserName();
						//Мы можем либо прикрепить файлы либо задать ссылку на файл.
						//Ссылку обязательно проверяем на валидность (пример: http://192.168.1.47/Public/Data/LIB/МГ Миннибаево-Казань\Папка 0176 книга 10 Паспорта на материалы\IMG_640007104.jpg)
						if (newPostFileFolder!='') {
							var libFolderIndex = newPostFileFolder.indexOf((App.config !== null)?App.config.LIB_PATH:'');
							if (libFolderIndex > 0) {
								//Перезатираем ссылку на имя файла из ссылки
								newPostFileFolder = newPostFileFolder.substring(libFolderIndex + 17);
							} else {
								//Проверяем, является ли вставленное значение ссылкой. Если является - значит ссылка невалидная.
								if (newPostFileFolder.indexOf('http://')>=0 || newPostFileFolder.indexOf('https://')>=0) {
									//Если это не набор имен файлов
									App.errorReport(gis_postloader_6, gis_postloader_18, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_6'});
									return;
								} else {
									//Если файлов несколько, то при редактировании заменяем только на первый из списка
									var newPostFileNamesArr = newPostFileFolder.split('|');
									newPostFileFolder = newPostFileNamesArr[0];
								}
							}
						} else {
							//Иначе просто вставляем документ без файла
						}
						//Сохраняем отредактированные значения и перезапрашиваем текущий пост
						var sendingData = '<data SYS_FULL_ID="WEB50_LIB_DOC/'+curLibDocId+'" SYS_CLASS_ID="WEB50_LIB_DOC" SYS_OBJ_ID="'+curLibDocId+'" DB_SCHEMA_ID="WEB50" DB_TABLE_ID="LIB_DOC" ' +
							'CURRENT_USER_LOGIN="'+userLogin+'" CURRENT_USER_ID="'+userId+'" STATUS_ID="0" FILE_NAME="'+newPostFileFolder+'" NAME="'+newPostName+'" DESCR="'+newPostDescr+'"/>';
						if (curPostData.postsData.objectType=='folderId' && curPostData.postData.hasOwnProperty('PARENT_DOC_ID') && curPostData.postData.PARENT_DOC_ID!=null) {
							sendingData = '<data SYS_FULL_ID="WEB50_LIB_DOC/'+curLibDocId+'" SYS_CLASS_ID="WEB50_LIB_DOC" SYS_OBJ_ID="'+curLibDocId+'" DB_SCHEMA_ID="WEB50" DB_TABLE_ID="LIB_DOC" ' +
								'PARENT_DOC_ID="'+curPostData.postData.PARENT_DOC_ID+'" CURRENT_USER_LOGIN="'+userLogin+'" CURRENT_USER_ID="'+userId+'" STATUS_ID="0" FILE_NAME="'+newPostFileFolder+'" NAME="'+newPostName+'" DESCR="'+newPostDescr+'"/>';
						}
						var requestParams = { descrType: 'update', descrId: 'SYS_SEM.xml#WEB50_LIB_DOC', toElements: false, getSchema: false,
							data: '<root USER_ID="'+userId+'" USER_LOGIN="'+userLogin+'" PODS_USER="'+userLogin+'" >' + sendingData + '</root>' };
						//Устанавливаем курсор ожидания
						BlockingUtil.wait();
						//BlockingUtil.blockApplication();
						//Дополнительно блокируем контент в блоке редактирования новости
						postsEditPost.attr('disabled','disabled');
						App.serverQueryXMLNodeWithTries(Services.processQueryNode, requestParams,
							function onEditPostResult(resultXML) {
								//Снимаем курсор ожидания
								BlockingUtil.ready();
								//BlockingUtil.unblockApplication();
								//Дополнительно разблокируем контент в блоке редактирования новости
								postsEditPost.removeAttr('disabled');
								if (resultXML) {
									var er = HTTPServiceUtil.getError(resultXML);
									if (er != "")
										App.errorReport(gis_postloader_7, gis_postsloader_2 + er, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_7'});
									else {
										//Меняем в оригинальных данных изменившиеся атрибуты и заново получаем объект с полными данными текущего поста
										var curPostXml = curPostData.originalXml;
										curPostXml.attr('NAME',newPostName);
										curPostXml.attr('DESCR',newPostDescr);
										curPostXml.attr('FILE_NAME',newPostFileFolder);
										curPostXml.attr('MTIME',(new Date()).toUTCString());
										curPostXml.attr('MUSER_ID',userId);
										curPostXml.attr('MUSER',userLogin);

										var curPostFullData = App.getCurPostFullData(curPostXml);
										curPostFullData.postsData = postsData; //Добавляем в объект ссылку на общие свойства всех постов (для обновления и взаимодействия внутри виджета постов)
										App.postsDataObject[curPostFullData.postTemplateParams.post_id] = curPostFullData;
										//Закрываем редактирование и заменяем предыдущий пост на новый
										curPost.remove();
										receivedHtml.after(curPostFullData.postHtml);
										receivedHtml.remove();
										//Показываем заголовок с формой добавления новой записи
										$('.postsAddPost',postsContainer).removeClass('postsAddPostDisabled');
										$('.postsAddPost *',postsContainer).removeProp('disabled');
									}
								}
							},
							function onEditPostFault(resultXML) {
								//Снимаем курсор ожидания
								BlockingUtil.ready();
								//BlockingUtil.unblockApplication();
								//Дополнительно разблокируем контент в блоке редактирования новости
								postsEditPost.removeAttr('disabled');
								if (resultXML) {
									var er = HTTPServiceUtil.getError(resultXML);
									App.errorReport(gis_postloader_7, er, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_8'});
								}
							},4
						);
					}


					//Событие нажатия кнопки "Сохранить"
					$('.postsEditPostSave',receivedHtml).on('click', function(){
						//Сохраняем введенные данные только в LIB_DOC, в PODS_COMMENTS вообще не добавляем информацию.
						var newPostName = postsAddPostName.val();
						var newPostDescr = postsAddPostDescr.val();
						var newPostFileFolder = postsAddPostFileFolder.val();

						//Проверяем, заполнены ли обязательные для заполнения поля
						if (newPostFileFolder=='') {
							App.errorReport(gis_postloader_7, gis_postloader_15, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_3'});
							return;
						}
						//Проверяем длину поля newPostName (должно быть не больше 250 символов)
						if (newPostName.length > 250) {
							App.errorReport(gis_postloader_7, gis_postloader_16, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_4'});
							return;
						}
						//Проверяем длину поля newPostDescr (должно быть не больше 250 символов)
						if (newPostDescr.length > 250) {
							App.errorReport(gis_postloader_7, gis_postloader_17, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_5'});
							return;
						}
						importFile();

					});
					//Событие нажатия кнопки "Отменить"
					$('.postsEditPostCancel',receivedHtml).on('click', function(){
						//Закрываем редактирование и возвращаем пост как он был
						receivedHtml.remove();
						curPost.show();
						//Показываем заголовок с формой добавления новой записи
						$('.postsAddPost',postsContainer).removeClass('postsAddPostDisabled');
						$('.postsAddPost *',postsContainer).removeProp('disabled');
					});
					//Прячем заголовок с формой добавления новой записи
					$('.postsAddPost',postsContainer).addClass('postsAddPostDisabled');
					$('.postsAddPost *',postsContainer).prop('disabled',true);
				} catch (err){
					var alert = new AlertForm();
					alert.build('alertFormDiv', gis_postloader_8, err.message, AlertForm.OK);
				}
			});
		} else {
			var alert = new AlertForm();
			alert.build('alertFormDiv', gis_postloader_8, gis_postloader_13, AlertForm.OK);
		}
	}
};

App.createSinglePostDoc = function createSinglePostDoc(docInfoObj) {
	try {
		//Получаем параметры для запроса и исправляем их на нужные нам
		var sendingData = '<data SYS_FULL_ID="" SYS_CLASS_ID="WEB50_LIB_DOC" SYS_OBJ_ID="" DB_SCHEMA_ID="WEB50" DB_TABLE_ID="LIB_DOC" CURRENT_USER_LOGIN="' + docInfoObj.userLogin + '" ' +
			'CURRENT_USER_ID="' + docInfoObj.userId + '" STATUS_ID="0" FILE_NAME="' + docInfoObj.newDocFileName + '" NAME="' + docInfoObj.newPostName + '" DESCR="' + docInfoObj.newPostDescr + '"/>';
		//Если объект, к которому прикрепляем документ - папка, тогда переделываем запрос, сразу подставляя PARENT_DOC_ID
		if (docInfoObj.objectType=='folderId' && docInfoObj.objectFullId!='' && docInfoObj.objectFullId.indexOf(':')>0) {
			var folderId = docInfoObj.objectFullId.split(':')[1];
			sendingData = sendingData.replace('<data','<data PARENT_DOC_ID="'+(folderId === 'root'? null : folderId)+'"');
		}

		var requestParams = {
			descrType: 'insert', descrId: 'SYS_SEM.xml#WEB50_LIB_DOC', toElements: false, getSchema: false,
			data: '<root USER_ID="' + docInfoObj.userId + '" USER_LOGIN="' + docInfoObj.userLogin + '" PODS_USER="' + docInfoObj.userLogin + '" >' + sendingData + '</root>'
		};
		//Устанавливаем курсор ожидания
		BlockingUtil.wait();
		//BlockingUtil.blockApplication();
		App.serverQueryXMLNodeWithTries(Services.processQueryNode, requestParams,
			function onAddPostResult(resultXML) {
				//Снимаем курсор ожидания
				BlockingUtil.ready();
				//BlockingUtil.unblockApplication();
				if (resultXML) {
					var er = HTTPServiceUtil.getError(resultXML);
					if (er != "")
						App.processStatusForm.processResultString(er);
					else {
						//Если прикрепляем к папке, то сразу обрабатываем результат - прикрепление уже прошло по PARENT_DOC_ID при вставке документа
						if (docInfoObj.objectType=='folderId') {
							App.processStatusForm.processResultString(er);
						} else {
							if (docInfoObj.objectFullId.split(':').length > 2){
								App.processStatusForm.endProcess();
								return;
							}
							//Получаем из пришедшего запроса ID созданного документа
							var newDocIdInd = resultXML.indexOf('ID="');
							var newDocId = resultXML.substring(newDocIdInd + 4, resultXML.indexOf('"', newDocIdInd + 4));
							var requestParams = {
								descrType: 'insert',
								descrId: 'SYS_SEM.xml#LIB_DOC_COMMENTS_LIST',
								toElements: false,
								getSchema: false,
								data: '<root><data USER_ID="' + docInfoObj.userId + '" LEFT_OBJ_ID="WEB50_LIB_DOC/' + newDocId + '" RIGHT_OBJ_ID="' + docInfoObj.objectFullId.replace(':', '/') + '" /></root>'
							};
							//Устанавливаем курсор ожидания
							BlockingUtil.wait();
							//BlockingUtil.blockApplication();
							App.serverQueryXMLNodeWithTries(Services.processQueryNode, requestParams,
								function addDocToObjResult(resultLinkXML) {
									//Снимаем курсор ожидания
									BlockingUtil.ready();
									//BlockingUtil.unblockApplication();
									if (resultLinkXML) {
										var er = HTTPServiceUtil.getError(resultLinkXML);
										App.processStatusForm.processResultString(er);
									} else {
										App.processStatusForm.processResultString(gis_postloader_6 + gis_postloader_19);
									}
								},
								function addDocToObjFault(resultLinkXML) {
									//Снимаем курсор ожидания
									BlockingUtil.ready();
									//BlockingUtil.unblockApplication();
									if (resultLinkXML) {
										var er = HTTPServiceUtil.getError(resultLinkXML);
										App.processStatusForm.processResultString(er);
										/*App.errorReport(gis_postloader_6, "Текст ошибки:\n" + er);*/
									} else {
										App.processStatusForm.processResultString(gis_postloader_6 + gis_postloader_19);
									}
								},4
							);
						}
					}
				} else {
					App.processStatusForm.processResultString(gis_postloader_6 + gis_postloader_20);
				}
			},
			function onAddPostFault(resultXML) {
				//Снимаем курсор ожидания
				BlockingUtil.ready();
				//BlockingUtil.unblockApplication();
				if (resultXML) {
					var er = HTTPServiceUtil.getError(resultXML);
					App.processStatusForm.processResultString(er);
				} else {
					App.processStatusForm.processResultString(gis_postloader_6 + gis_postloader_20);
				}
			},4
		);
	} catch (err) {
		App.processStatusForm.processResultString(gis_postloader_6 + gis_postsloader_3 + err.message);
	}
};


/* Функция обновления страницы постов после добавления нового (новых) */
App.refreshPostsPage = function refreshPostsPage() {
	App.processStatusForm = null;
	//Добавляем хеш с авторизацией
	window.location.href = (window.location.href.replace('#','')) + Auth.hash;
	//Обновляем список заново, нужно показать добавленные записи. Делаем это через полное обновление страницы
	window.location.reload(true); //true для перезагрузки без кеша, для ускорения можно поставить false
};

/* Функция запуска видеозаписи */
App.showVideoFromPosts = function showVideoFromPosts(paramsArr) {
	var callRes = callFunction('','showVideo',paramsArr); /* paramsArr = ['{DOC_ID}','{FILE_NAME}',''] */
	//Пытаемся вызвать видео напрямую, если IE8 (т.е. мы работаем с множественными окнами)
	if (callRes==0 && window.opener!=undefined && window.opener!=null && !window.opener.closed) {
		try {
			var lineId = Auth.getParameterByName('lineId');
			window.opener.showVideo(paramsArr[0],paramsArr[1],gis_postloader_23,lineId);
		} catch (errVideo) {}
	}
	var alert = new AlertForm();
	if (window.parent!=undefined && window.parent!=null && !window.parent.closed && window.opener!=undefined && window.opener!=null && !window.opener.closed) {
		alert.build('alertFormDiv', gis_postloader_24, gis_postloader_13, AlertForm.OK);
	} else {
		alert.build('alertFormDiv', gis_postloader_25, gis_postloader_26, AlertForm.OK);
	}
};

/* Функция открытия файла с проверкой на существование */
App.openDocFile = function openDocFile(curDocLink, curPostId) {
	//передать в фукнцию имя файла из FILE_NAME
	if(curDocLink.indexOf('.pdf#')!==-1){//если в url содержится .pdf#, значенит нужно выполнить запрос на генерацию картинки
		if (curPostId!=undefined && curPostId!=null && curPostId!='' && curPostId!='{post_id}') {
			//Получаем идентификатор документа для ссылки
			var curPostData = App.postsDataObject.hasOwnProperty(curPostId) ? App.postsDataObject[curPostId] : null;
			if (curPostData && curPostData.postData.hasOwnProperty('FILE_NAME')) {
				curDocLink = curPostData.postData['FILE_NAME'];
			}
		}
	}
	HTTPServiceUtil.openFile(curDocLink);
};

/* Функция открытия папки */
App.openFolderFromPosts = function openFolderFromPosts(paramsArr) {
	/* paramsArr = ['{DOC_ID}','{PARENT_DOC_ID}'] */
	//Переходим по ссылке на прикрепленные документы выбранной папки
	var curDocLink = './docList.html?folderId=WEB50_LIB_DOC:' + paramsArr[0];
	//Если текущая папка - переход на уровень вверх, то получаем folderParentId и переходим к нему (если он есть)
	if (paramsArr[0]=='-9999' && paramsArr.length>1) {
		//Получаем данные для текущей папки запросом ADM_SEM.xml#ADM_LIB_DOC_FOLDER, чтобы получить ее PARENT_DOC_ID
		var requestParams = {descrType:'select', descrId:'ADM_SEM.xml#ADM_LIB_DOC_FOLDER', toElements:false, getSchema:false,
			data:'<root><data SYS_OBJ_ID="'+paramsArr[1]+'"/></root>' };
		//Устанавливаем курсор ожидания
		BlockingUtil.wait();
		//BlockingUtil.blockApplication();
		App.serverQueryXMLNodeWithTries(Services.processQueryNode, requestParams, function getFolderDataResult(resultXML){
			//Снимаем курсор ожидания
			BlockingUtil.ready();
			//BlockingUtil.unblockApplication();
			if (resultXML) {
				var er = HTTPServiceUtil.getError(resultXML);
				if (er != '') {
					//Выдаем сообщение об ошибке
					App.errorReport(gis_postloader_4, er, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_13'});
				} else {
					var curFolderData = null;
					var userDataList = $($.parseXML(resultXML));
					userDataList.find('data').each(function getData(){
						curFolderData = $(this); //Добавляем в объект ссылку на данные о текущем пользователе
					});
					if (curFolderData!=null && curFolderData.attr('PARENT_DOC_ID')!=undefined && curFolderData.attr('PARENT_DOC_ID')!=null && curFolderData.attr('PARENT_DOC_ID')!='') {
						curDocLink = './docList.html?folderId=WEB50_LIB_DOC:' + curFolderData.attr('PARENT_DOC_ID');
					} else {
						curDocLink = './docList.html?folderId=WEB50_LIB_DOC:root';
						/*var alertForm = new AlertForm();
						alertForm.build("getFolderDataAlertFormDiv","Текущий уровень является самым верхним.","Переход выше невозможен",AlertForm.OK);*/
					}
					//Открываем ссылку с хешем авторизации
					window.location.href = curDocLink + Auth.hash;
				}
			}
		}, function getFolderDataFault(resultXML){
			//Снимаем курсор ожидания
			BlockingUtil.ready();
			//BlockingUtil.unblockApplication();
			//Выдаем сообщение об ошибке
			var er = HTTPServiceUtil.getError(resultXML);
			App.errorReport(gis_postloader_4, er, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_14'});
		},4);

	} else {
		//Открываем ссылку с хешем авторизации
		window.location.href = curDocLink + Auth.hash;
	}
};

/* Функция получает данные поста по JQuery-обертке результата запроса для одной записи */
App.getCurPostFullData = function (curDoc) {
	//Как нужно описывать параметры в шаблонах:
	//1. Параметры в шаблонах зависят от регистра символов и заключаются в фигурные скобки {}. Например {MTIME} и {mtime} - разные параметры.
	//2. Параметры, пришедшие из запроса, должны быть в верхнем регистре, например: {DOC_ID}, {FILE_NAME}, {MTIME}.
	//3. Параметры, добавленные в коде, должны быть в нижнем регистре, например: {post_id}, {file_path}, {mtime}.
	if (curDoc.length==0)
		return null;
	var that = curDoc[0];
	//проверяем, есть ли атрибуты. Если нет - игнорируем - пришела пустая <data/>
	if(that.attributes.length == 0)
		return null;
	//Получаем подробные данные для каждого документа
	var curDocId = curDoc.attr('DOC_ID');
	var curDocType = curDoc.attr('DOC_TYPE_ID') !== undefined ? curDoc.attr('DOC_TYPE_ID') : '-9999'; // -9999 => default
	var curDocCUser = curDoc.attr('USERNAME') !== undefined ? curDoc.attr('USERNAME') : '';
	var curDocCTime = curDoc.attr('CTIME');//$$$!=undefined ? App.formatDateToString(new Date(curDoc.attr('CTIME'))) : gis_postsloader_10;
	var curDocMTime = curDoc.attr('MTIME');
	var curPostMDate = '';
	var curPostCDate = '';
	try{
		curPostMDate = new Date(curDocMTime.replace(/^(\d\d)\.(\d\d)\.(\d{4}) (\d\d):(\d\d):(\d\d)$/,'$4:$5:$6 $2/$1/$3'));
		isNaN(curPostMDate) && (curPostMDate = new Date(curDocMTime));
		isNaN(curPostMDate) && (curPostMDate = '');
	}
	catch(ex){
		curPostMDate = '';
	}
	try{
		curPostCDate = new Date(curDocCTime.replace(/^(\d\d)\.(\d\d)\.(\d{4}) (\d\d):(\d\d):(\d\d)$/,'$4:$5:$6 $2/$1/$3'));
		isNaN(curPostCDate) && (curPostCDate = new Date(curDocCTime));
		isNaN(curPostCDate) && (curPostCDate = '');
	}
	catch(ex){
		curPostCDate = '';
	}
	curPostMDate = App.formatDateToString(curPostMDate);
	curPostCDate = App.formatDateToString(curPostCDate);
	//Время создания записи сохраняем в отдельное поле для последующей сортировки
	var curPostDate = (curPostCDate !== '')? curPostCDate: NaN;
	var curDocHeader, curDocDescr, curDocName, curDocFooter, curDocFileName, curPostMUser;
	//генерируем идентификатор текущего поста
	var postId = App.generateUUID();
	var curDocData = {}; //Данные для каждого поста также сохраняем в массиве (нужно для будущего редактирования и т.д.)
	var curTemplateParams = {}; //Специальные параметры для шаблонов + все пришедшие из запроса параметры как в curDocData
	//Сохраняем в объект все данные, которые получили из запроса на данный документ
	for (var i=0; i<that.attributes.length; i++) {
		curDocData[that.attributes[i].name] = that.attributes[i].value;
		curTemplateParams[that.attributes[i].name] = that.attributes[i].value;
	}
	//Заполняем поля, требующие особой обработки перед выводом в шаблон (например конвертация даты или несколько полей одним текстом)
	/* $$$ if(curPostMDate == '')
		curPostMDate = curDoc.attr('CTIME')!=undefined ? App.formatDateToString(new Date(curDoc.attr('CTIME'))) : gis_postsloader_10;*/
	curPostMUser = curDoc.attr('MUSER') !== undefined ? curDoc.attr('MUSER') : '';
	//Заголовок
	curDocHeader = curDoc.attr('TYPE_DESCR');
	if (curPostMUser !== '' && curPostMDate !== '') curDocHeader += gis_postsloader_8 + curPostMUser + ' ' + curPostMDate;
	//Описание (текст поста) - включаем DESCR и NAME, если они отличаются
	curDocDescr = curDoc.attr('DESCR') !== undefined ? curDoc.attr('DESCR') : curDoc.attr('NAME');
	curDocName = curDoc.attr('NAME') !== undefined ? curDoc.attr('NAME') : curDocDescr;
	if (curDocName !== curDocDescr) curDocDescr = curDocName + '<br/>' + curDocDescr;
	//Футер (текст снизу)
	curDocFooter = gis_postsloader_9 + curDocCUser + ', ' + curPostCDate;
	curDocFileName = curDoc.attr('FILE_NAME') !== undefined ? curDoc.attr('FILE_NAME') : '';

	//Добавляем специальные параметры для шаблона (id поста - post_id, текст заголовка - header_text, текст поста - descr_text, текст футера - bottom_text,
	//время изменения - mtime, относительный путь к файлу - file_path, путь к превью документа - image_file_name)
	//Проверка, если номер страницы pdf, то вызываем другой aspx для предпросмgeотра
	//var fpage = Math.floor(Math.random() * 40) + 1;
	//curDocFileName = "Papka 10.24 RGK\\Papka 10.24 RGK.pdf#"+fpage;
	if(curDocFileName.indexOf('.pdf#')!=-1){
		curDocType = '17';
		//убираем кнопку "ссылка на файл" 22.08.18
		$.extend(curTemplateParams,{ post_id:postId, header_text:curDocHeader, descr_text:curDocDescr, bottom_text:curDocFooter, mtime:curPostMDate,
			file_path: encodeURI(curDocFileName),
			image_file_name: Services.pdfPreview +'?maxWidth=400&maxHeight=300&sourceUrl='+encodeURI(curDocFileName.replace('.pdf#','.pdf$')) });
	}
	else {
		$.extend(curTemplateParams,{ post_id:postId, header_text:curDocHeader, descr_text:curDocDescr, bottom_text:curDocFooter, mtime:curPostMDate,
			file_path:'./'+((App.config !== null)?App.config.LIB_PATH:'')+'/'+encodeURI(curDocFileName),
			image_file_name: Services.docPreview + '?maxWidth=400&maxHeight=300&sourceUrl='+((App.config !== null)?App.config.LIB_PATH:'')+'/'+encodeURI(curDocFileName) });
	}
	//В зависимости от типа документа используем разные html-шаблоны
	var postTemplateUrl = "ui/html/templates/DefaultPostTemplate.html";
	switch (curDocType) {
		case "-1": //Папка "Вверх"
			postTemplateUrl = "ui/html/templates/UpFolderPostTemplate.html";
			curTemplateParams['file_path'] = gis_postloader_27;
			curTemplateParams['image_file_name'] = '/ui/images/folder_up_icon.png'; //иконка папки "Вверх"
			break;
		case "0": //Папка
			postTemplateUrl = "ui/html/templates/FolderPostTemplate.html";
			curTemplateParams['file_path'] = gis_postloader_27;
			curTemplateParams['image_file_name'] = '/ui/images/folder_icon.png'; //иконка папки
			break;
		case "-10":	//Комментарий из PODS.COMMENTS
			postTemplateUrl = "ui/html/templates/CommentPostTemplate.html";
			curTemplateParams['file_path'] = gis_postloader_27;
			curTemplateParams['image_file_name'] = './Public/assets/comments.png'; //иконка комментария
			break;
		case "37":	//3Dсцена
			postTemplateUrl = "ui/html/templates/VrmlPostTemplate.html";
			curTemplateParams['file_path'] = './Public/Data/VRML/'+encodeURI(curDocFileName); //путь к файлу .wrl
			curTemplateParams['image_file_name'] = './Public/assets/_wrl.png'; //иконка .wrl
			break;
		case "38":	//IMG-карта
			postTemplateUrl = "ui/html/templates/ImgPostTemplate.html";
			curTemplateParams['file_path'] = './Public/Data/IMG/'+encodeURI(curDocFileName); //путь к файлу .img
			curTemplateParams['image_file_name'] = './Public/assets/_img.png'; //иконка .img
			break;
		case "41":	//Видеофайл
			postTemplateUrl = "ui/html/templates/VideoFilePostTemplate.html";
			curTemplateParams['file_path'] = curDocFileName; //путь к файлу видео на MediaServer (ссылка)
			curTemplateParams['image_file_name'] = './Public/assets/play.png'; //иконка видео
			break;
		case "17": //Файл pdf с указанной страницей для возвращения картинки
			postTemplateUrl = "ui/html/templates/PdfImgTemplate.html";
			break;
		default:
			postTemplateUrl = "ui/html/templates/DefaultPostTemplate.html";
	}
	//Запускаем получение html-описания структуры текущего поста (документа)
	var resultHtmlWrapper = App.getHtmlWrapper(curTemplateParams,postTemplateUrl);
	var curPostFullData = {postHtml:resultHtmlWrapper, postData:curDocData, postDate:curPostDate, postTemplateParams:curTemplateParams, originalXml:curDoc};
	return curPostFullData;
};

App.loadDocuments = function loadDocuments(postsContainerSelector, objectFullId, objectType, needLineFilter) {
	var currUserId = Auth.getUserId();
	var postsContainer = $(postsContainerSelector);
	var stepLimit = WidgetMap && WidgetMap.config && WidgetMap.config.posts ? WidgetMap.config.posts.results : App.POSTS_STEP_LIMIT;
	var lowLimit = 0,
		highLimit = stepLimit;
	if(currUserId == undefined) {// если в хэше нет пользователя, то ошибка авторизации
		//Прячем заголовок с формой добавления новой записи
		$('.postsAddPost',postsContainer).addClass('postsAddPostDisabled');
		$('.postsAddPost *',postsContainer).prop('disabled',true);
		App.errorReport(gis_postloader_31, gis_postloader_32, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_21'});
		return;
	}
	//Если не передан идентификатор объекта, бесполезно грузить посты - просто ничего не делаем
	if (objectFullId==undefined || objectFullId==null || objectFullId=='') return;
	if(objectFullId)
		objectFullId = decodeURI(objectFullId);
	//Прячем элемент-кнопку для загрузки новых записей
	var postsLoadMoreButton = $(postsContainerSelector+' .loadMoreButton');
	postsLoadMoreButton.hide();
	//Показываем элемент с загрузкой новых
	var postsLoader = $(postsContainerSelector+' .postsLoader');
	postsLoader.show();
	//Запоминаем элемент-контейнер для постов
	var postsDiv = $(postsContainerSelector+' .postsContent');

	//Запоминаем элемент-контейнер для блока создания документа
	var postsAddPost = $(postsContainerSelector+' .postsAddPost');
	//Сохраняем элемент-кнопку для создания нового поста
	var postsAddButton = $('.postsAddPostButton',postsAddPost);
	postsAddButton.on('click',function(){
		var postsAddPost = $(postsContainerSelector+' .postsAddPost');
		var postsAddPostName = $('.postsAddPostName',postsAddPost);
		var postsAddPostDescr = $('.postsAddPostDescr',postsAddPost);
		var postsAddPostFileFolder = $('.postsAddPostFileFolder',postsAddPost);
		//Сохраняем введенные данные только в LIB_DOC, в PODS_COMMENTS вообще не добавляем информацию.
		var newPostName = postsAddPostName.val();
		var newPostDescr = postsAddPostDescr.val();
		var newPostFileFolder = postsAddPostFileFolder.val();
		if (newPostFileFolder && newPostFileFolder !== '') {
			//Проверяем длину поля newPostName (должно быть не больше 250 символов)
			if (newPostName.length > 250) {
				App.errorReport(gis_postloader_6, gis_postloader_16, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_21'});
				return;
			}
			//Проверяем длину поля newPostDescr (должно быть не больше 250 символов)
			if (newPostDescr.length > 250) {
				App.errorReport(gis_postloader_6, gis_postloader_17, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_22'});
				return;
			}
			importFile();
		}
		else
			App.errorReport(gis_postloader_6, gis_postloader_15, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_23'});

	});

	$('#ifr_myElement',postsAddPost).load(function(){
		if($("#myElement",postsAddPost).val() == ''){
			return;
		}
		$("#myElement",postsAddPost).val('');
		App.createNewPost(postsContainerSelector, objectFullId, objectType);
	});
	$('#iFI_myElement',postsAddPost).change(function(){
		var fileName = $("#iFI_myElement",postsAddPost).val().split('\\');
		if(fileName.length != 1)fileName = fileName[fileName.length-1].split('.');
		else fileName = fileName[0].split('.');
		fileName[0] += '_'+getUniqueId();
		fileName = fileName.join('.');
		$("#myElement",postsAddPost).val(fileName);
		$("#myElementText",postsAddPost).val(fileName);
	});
	function importFile() {
		var fileName = $("#myElement",postsAddPost).val();
		//Проверяем, что поле выбранного файла не пустое
		if(fileName != '' && fileName == $("#myElementText",postsAddPost).val()){// если называние файла не редактировали, то сначала загружаем его
			var form = $('#fr_myElement',postsAddPost);
			form.attr('action',form.data('action')+'&fileNameGUID='+encodeURI(fileName));//.submit();
			form.submit();
		}
		else{
			//если пустое поле, то всё равно создаем новый пост
			App.createNewPost(postsContainerSelector, objectFullId, objectType);
		}
	}

	//Функция пересчета размеров при изменении размеров окна и т.д.
	function recalcSizes() {
		var newPostsContentHeight = $(window).height() - 180; /* height: calc(100% - 200px); */
		postsDiv.height(newPostsContentHeight);
	}
	//Вешаем событие изменения размера окна, чтобы правильно позиционировать в ie8 контент со скроллом
	$(window).resize(recalcSizes);
	//Однократно изменяем размеры
	recalcSizes();
	function getUniqueId(){return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);return v.toString(16);});
	};

	var fullIdArr = objectFullId.split(':'),
		classId = fullIdArr[0],
		db= classId.split('_'),
		db_schema = db[0],
		db_table_id = db.slice(1).join('_'),
		objId = fullIdArr[1],
		ids = fullIdArr.slice(1).join();
	if(classId)
		classId = decodeURI(classId);
	var sysFullId = classId+'/'+objId;
	if(objectFullId.indexOf('[{"path"') !== -1){
		try{
			objectFullId = decodeURI(objectFullId);
			/*var jsonObj = JSON.parse(objectFullId);
			if(jsonObj && jsonObj.length > 0 && jsonObj[0].path){
				var decodedPath = decodeURI(jsonObj[0].path);
				jsonObj[0].path = decodedPath;//.replace(/\//g,'\\/');
				objectFullId = JSON.stringify(jsonObj);
			}*/
		}
		catch(ex){}

		fullIdArr = [objectFullId.replace(new RegExp('"','g'),'&quot;')];
		classId = "";
		db= "";
		db_schema = "";
		db_table_id = "";
		objId = "";
		sysFullId = fullIdArr.join('/');
	}
	//Количество выводимых на странице постов (при нажатии на дозагрузку будут добавляться на страницу следующие postsPageSize постов)
	//var postsPageSize = 20;
	//Сколько постов уже выведено на странице
	//var appendedPostPages = 0;
	//Массив для хранения html-содержимого постов. Нужен для выведения постов отсортированными по дате.
	//var cupPostsArr = [];
	//Роли, выданные текущему пользователю (их сначала надо получить)
	//var userData = {};
	//Общий объект с данными текущего виджета постов (общее количество записей, количество загруженных записей, контейнер постов и др.)
	var postsData = {postsContainer:postsContainer, postsPageSize:20, appendedPostPages:0, cupPostsArr:[], userData:null, objectType:objectType, objId:objId, parentFolderName:''};

	//Запрос получения данных постов
	var postsDescrId = 'SYS_SEM.xml#LIB_DOC_COMMENTS_LIST';
	var requestData = '<data FILTER="ID='+objId+'" SYS_FULL_ID="'+sysFullId+'" DB_SCHEMA_ID="'+db_schema+'" DB_TABLE_ID="'+db_table_id+'" SYS_CLASS_ID="'+classId+'" SYS_OBJ_ID="'+objId+'" LOW_LIMIT="'+lowLimit+'" HIGH_LIMIT="'+highLimit+'"/>';
	//Если текущий объект - папка, меняем запрос для получения данных
	if (objectType === 'folderId') {
		postsDescrId = 'SYS_SEM.xml#LIB_DOC_COMMENTS_BY_PARENT_LIST';
		requestData = '<data FILTER="ld.PARENT_DOC_ID='+objId+'" />';
		if (objId=='root') {
			requestData = '<data FILTER="ld.PARENT_DOC_ID IS NULL" />'; //Для получения всех записей (тех, у которых нету PARENT_DOC_ID)
		} else {
			//Запускаем получение данных для текущей папки (нам нужно название родительской папки)
			var requestFolderParams = {descrType:'select', descrId:'SYS_SEM.xml#LIB_DOC_COMMENTS_BY_PARENT_LIST', toElements:false, getSchema:false,
				data:'<root><data FILTER="ld.DOC_ID='+objId+'" /></root>' };
			//Здесь обходимся без блокировки - операция получения названия папки должна идти в фоне
			App.serverQueryXMLNodeWithTries(Services.processQueryNode, requestFolderParams, function getFolderDataResult(resultXML){
				if (resultXML) {
					var er = HTTPServiceUtil.getError(resultXML);
					if (er != '') {
						//Выдаем сообщение об ошибке
						App.errorReport(gis_postloader_3, gis_postsloader_2 + er, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_15'});
					} else {
						var folderDataList = $($.parseXML(resultXML));
						//После получения списка документов загружаем для каждого документа его данные (запрос LIB_DOC_SEM.xml#LIB_DOC)
						folderDataList.find('data').each(function getFolderData(){
							postsData.parentFolderName = $(this).attr('NAME'); //Добавляем в объект ссылку на данные о текущей папке
						});
					}
				}
			}, function getFolderDataFault(resultXML){
				//Выдаем сообщение об ошибке
				var er = HTTPServiceUtil.getError(resultXML);
				App.errorReport(gis_postloader_3, gis_postsloader_2 + er, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_16'});
			},4);
		}
	}


	//Запускаем получение списка ролей, выданных пользователю (нужно для определения прав редактирования и удаления)
	var requestParams = {descrType:'select', descrId:'ADM_SEM.xml#WEB50_B_USER_PRIVATE', toElements:false, getSchema:false,
		data:'<root><data FILTER="ID='+Auth.getUserId()+'"/></root>' };
	//Здесь обходимся без блокировки - операция получения прав должна идти в фоне
	App.serverQueryXMLNodeWithTries(Services.processQueryNode, requestParams, function getUserDataResult(resultXML){
		if (resultXML) {
			var er = HTTPServiceUtil.getError(resultXML);
			if (er != '') {
				//Выдаем сообщение об ошибке
				App.errorReport(gis_postloader_2, gis_postsloader_2 + er, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_17'});
			} else {
				var userDataList = $($.parseXML(resultXML));
				//После получения списка документов загружаем для каждого документа его данные (запрос LIB_DOC_SEM.xml#LIB_DOC)
				userDataList.find('data').each(function getUserData(){
					postsData.userData = $(this); //Добавляем в объект ссылку на данные о текущем пользователе
				});
			}
		}
	}, function getUserDataFault(resultXML){
		//Выдаем сообщение об ошибке
		var er = HTTPServiceUtil.getError(resultXML);
		App.errorReport(gis_postloader_2, er, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_18'});
	});


	//Запускаем получение списка прикрепленных документов для указанного объекта
	if (objectType === 'objId' && needLineFilter){
		postsDescrId = 'SYS_SEM.xml#LIB_DOC_COMMENTS_BY_PARENT_LIST';
		requestData = '<data LINE_ID_FILTER="'+ ids +'" LOW_LIMIT="'+lowLimit+'" HIGH_LIMIT="'+highLimit+'"/>';
	}
	var requestParams = {descrType:'select', descrId: postsDescrId, toElements:false, getSchema:false,
		data:'<root>'+requestData+'</root>' };
	//Устанавливаем курсор ожидания
	BlockingUtil.wait();
	//BlockingUtil.blockApplication();
	var loading = true;
	App.serverQueryXMLNodeWithTries(Services.processQueryNode, requestParams, function getDocumentsResult(resultXML){
		//Снимаем курсор ожидания
		BlockingUtil.ready();
		//BlockingUtil.unblockApplication();
		postsLoader.hide();

		if (resultXML) {
			var er = HTTPServiceUtil.getError(resultXML);
			if (er != '') {
				//Показываем сообщение, что постов нет
				postsDiv.html('<center>'+gis_postloader_1+'</center>');
				//Выдаем сообщение об ошибке
				App.errorReport(gis_postloader_5, er, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_19'});
			} else {
				//Функция сортировки массива постов по дате
				function sortPostsByDate() {
					//Сортируем массив полученных постов по дате
					postsData.cupPostsArr.sort(function(a,b){
						//Папки всегда показываем выше файлов, причем папки сортируем по алфавиту, а файлы - по дате
						if (a.postData['DOC_TYPE_ID']=='0' || b.postData['DOC_TYPE_ID']=='0' || a.postData['DOC_TYPE_ID']=='-1' || b.postData['DOC_TYPE_ID']=='-1') {
							if (a.postData['DOC_TYPE_ID'] != b.postData['DOC_TYPE_ID']) {
								var aType = parseInt(a.postData['DOC_TYPE_ID']);
								var bType = parseInt(b.postData['DOC_TYPE_ID']);
								if (aType < bType) return -1;
								if (aType > bType) return 1;
							} else {
								//Вот случай, когда имеем 2 одинаковые папки - их сортируем по алфавиту
								if (a.postData.hasOwnProperty('NAME') && b.postData.hasOwnProperty('NAME')) {
									var folderStrRes = $.trim(a.postData['NAME']).localeCompare($.trim(b.postData['NAME']));
									if (folderStrRes!=0) return folderStrRes;
								}
							}
						}
						// Turn your strings into dates, and then subtract them
						// to get a value that is either negative, positive, or zero.
						var res = 0;
						if(!isNaN(b.postDate) && !isNaN(a.postDate))
							res = new Date(b.postDate) - new Date(a.postDate);
						//Если даты одинаковые, то нужно отсортировать по дополнительному признаку - имени файла
						if (res==0 && a.postData.hasOwnProperty('FILE_NAME') && b.postData.hasOwnProperty('FILE_NAME')) {
							var fileNameStrRes = a.postData['FILE_NAME'].localeCompare(b.postData['FILE_NAME']);
							return fileNameStrRes;
						}
						return res;
					});
				}
				//Функция для вставки подготовленных и отсортированных по дате постов в заданный элемент
				function appendMorePosts(){
					postsLoader.show();
					postsLoadMoreButton.hide();
					if (lowLimit > 0 && loading){
						if (objectType === 'objId' && needLineFilter)
							requestParams.data = '<root><data LINE_ID_FILTER="'+ ids +'" LOW_LIMIT="'+lowLimit+'" HIGH_LIMIT="'+highLimit+'"/></root>';
						else
							requestParams.data = '<root><data FILTER="ID='+objId+'" SYS_FULL_ID="'+classId+'/'+objId+'" DB_SCHEMA_ID="'+db_schema+'" DB_TABLE_ID="'+db_table_id+'" SYS_CLASS_ID="'+classId+'" SYS_OBJ_ID="'+objId+'" LOW_LIMIT="'+lowLimit+'" HIGH_LIMIT="'+highLimit+'"/></root>'
						App.serverQueryXMLNodeWithTries(Services.processQueryNode, requestParams, getDocumentsResult, function getDocumentsFault(resultXML){
							BlockingUtil.ready();
							postsLoader.hide();
							postsContainer.html('<center>'+gis_postloader_1+'</center>');
							var er = HTTPServiceUtil.getError(resultXML);
							App.errorReport(gis_postloader_5, er, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_20'});
						})
						loading = false;
						lowLimit += stepLimit;
						highLimit += stepLimit;
						return;
					}else if (lowLimit === 0){//если это первичная загрузка устанавливаються знач для дальнейших запросов
						lowLimit += stepLimit + 1;
						highLimit += stepLimit;
					}
					var startInd = $('.postWrapper',postsContainer).length;
					var endInd = Math.min(startInd+postsData.postsPageSize, postsData.cupPostsArr.length);
					if (startInd < endInd){
						for (var i=startInd; i<endInd; i++) {
							var curPostData = postsData.cupPostsArr[i];
							postsDiv.append(curPostData.postHtml);
						}
						//Подгрузили очередную страницу - увеличиваем счетчик добавленных страниц
						postsData.appendedPostPages++;
						postsLoader.hide();
						if (postsData.cupPostsArr.length === lowLimit -1)//Если при подгрузке не загрузилось 20 записей, то записей больше нет
							postsLoadMoreButton.show();
						//Обновляем текст о количестве добавленных постов
						//Не считаем папку "Вверх" элементом
						var endIndText = endInd;
						var totalIndText = postsData.cupPostsArr.length;
						if (postsData.objectType === 'folderId' && postsData.objId !== 'root') {
							endIndText--;
							totalIndText--;
						}
						$(postsContainerSelector+' .postsHeaderRecords').text(gis_postsloader_5+endIndText+gis_postsloader_7);
					}
				}

				//Добавляем слушатель на кнопку подгрузки следующих документов
				postsLoadMoreButton.on('click', function onPostsLoadMoreButtonClick(clickEvt){
					appendMorePosts();
				});

				//Если загружаем содержимое папки (в URL стоит folderId), всегда выводим первой в списке особый тип папки - вернуться на уровень вверх
				if (objectType === 'folderId' && objId !== 'root') {
					//Добавляем с очень большой датой, чтобы точно был сверху
					if (resultXML=='<root />' || resultXML=='<root/>') resultXML = '<root></root>';
					resultXML = resultXML.replace('<root>','<root><data DOC_ID="-9999" DOC_TYPE_ID="-1" PARENT_DOC_ID="'+objId+'" DESCR="" NAME="... (Вверх) '+postsData.parentFolderName+'" PARENT_NAME="" ' +
						'CTIME="2900-01-01T01:00:00+00:00" CUSER_ID="0" USERNAME="admin" MTIME="2900-01-01T01:00:00+00:00" STATUS_ID="1" TYPE_NAME="FOLDER" TYPE_DESCR="Папка" STATUS_DESCR="Публичный статус" />');
				}
				var curDocList = $($.parseXML(resultXML));
				//После получения списка документов загружаем для каждого документа его данные (запрос LIB_DOC_SEM.xml#LIB_DOC)
				curDocList.find('data').each(function getDocContent(){
					var curDoc = $(this);
					//Получаем из результата запроса данные текущего поста
					var curPostFullData = App.getCurPostFullData(curDoc);
					if(curPostFullData === null)
						return;
					curPostFullData.postsData = postsData; //Добавляем в объект ссылку на общие свойства всех постов (для обновления и взаимодействия внутри виджета постов)
					//Сохраняем посты в массив, чтобы затем вывести их отсортированными по дате
					if (curPostFullData.postData.DOC_ID > 0 || lowLimit === 0)
						postsData.cupPostsArr.push(curPostFullData);
					//Сохраняем данные постов в глобальный массив по ключу post_id (нужно глобально для использования данных поста в любых функциях)
					App.postsDataObject[curPostFullData.postTemplateParams.post_id] = curPostFullData;
				});

				if (postsData.cupPostsArr.length>0) {
					//Сортируем посты по дате
					sortPostsByDate();
					//Добавляем очередные postsPageSize (20 по-умолчанию) постов
					appendMorePosts();
					loading = true;
				} else {
					//Показываем сообщение, что постов нет
					postsDiv.html('<center>'+gis_postloader_1+'</center>');
				}
			}
		}
	}, function getDocumentsFault(resultXML){
		//Снимаем курсор ожидания
		BlockingUtil.ready();
		//BlockingUtil.unblockApplication();
		postsLoader.hide();
		//Показываем сообщение что постов нет
		postsContainer.html('<center>'+gis_postloader_1+'</center>');
		//Выдаем сообщение об ошибке
		var er = HTTPServiceUtil.getError(resultXML);
		App.errorReport(gis_postloader_5, er, undefined, {filename:gis_filename_514, functionname:'gis_filename_514_20'});
	});
};
/* Функция добавляет новый пост по заполненным полям */
App.createNewPost = function createNewPost(postsContainerSelector, objectFullId, objectType) {
	//Запоминаем элементы для добавления постов
	var postsAddPost = $(postsContainerSelector+' .postsAddPost');
	var postsAddPostName = $('.postsAddPostName',postsAddPost);
	var postsAddPostDescr = $('.postsAddPostDescr',postsAddPost);
	var postsAddPostFileFolder = $('.postsAddPostFileFolder',postsAddPost);
	//Сохраняем введенные данные только в LIB_DOC, в PODS_COMMENTS вообще не добавляем информацию.
	var newPostName = postsAddPostName.val();
	var newPostDescr = postsAddPostDescr.val();
	var newPostFileFolder = postsAddPostFileFolder.val();
	//upd. 25.02.20 Сделать необязательными поля "описание" и "название"
	//Проверяем длину поля newPostName (должно быть не больше 250 символов)
	if (newPostName.length > 250) {
		App.errorReport(gis_postloader_6, 'Значение в поле "Название" должно содержать не более 250 символов.');
		return;
	}
	//Проверяем длину поля newPostDescr (должно быть не больше 250 символов)
	if (newPostDescr.length > 250) {
		App.errorReport(gis_postloader_6, 'Значение в поле "Описание" должно содержать не более 250 символов.');
		return;
	}
	//Массив данных для обработки групповой формой
	var newPostsDataArr = [];
	var userId = Auth.getUserId();
	var userLogin = Auth.getUserName();
	//Мы можем либо прикрепить файлы либо задать ссылку на файл.
	//Ссылку обязательно проверяем на валидность (пример: http://192.168.1.47/Public/Data/LIB/МГ Миннибаево-Казань\Папка 0176 книга 10 Паспорта на материалы\IMG_640007104.jpg)
	if (newPostFileFolder!='') {
		var libFolderIndex = newPostFileFolder.indexOf('/Public/Data/LIB/');
		if (libFolderIndex > 0) {
			//Перезатираем ссылку на имя файла из ссылки
			newPostFileFolder = newPostFileFolder.substring(libFolderIndex + 17);
			var docInfoObj = {userId:userId, userLogin:userLogin, newDocFileName:newPostFileFolder, newPostName:newPostName, newPostDescr:newPostDescr, objectFullId:objectFullId, objectType:objectType};
			newPostsDataArr.push(docInfoObj);
		} else {
			//Проверяем, является ли вставленное значение ссылкой. Если является - значит ссылка невалидная.
			if (newPostFileFolder.indexOf('http://')>=0 || newPostFileFolder.indexOf('https://')>=0) {
				//Если это не набор имен файлов
				App.errorReport(gis_postloader_6, 'Ссылка на файл имеет неправильный формат.');
				return;
			} else {
				//Если файлов несколько, то их имена в поле имен файлов разделены символом '|' - создаем записей по количеству имен файлов
				var newPostFileNamesArr = newPostFileFolder.split('|');
				for (var i = 0; i < newPostFileNamesArr.length; i++) {
					var docInfoObj = {userId:userId, userLogin:userLogin, newDocFileName:newPostFileNamesArr[i], newPostName:newPostName, newPostDescr:newPostDescr, objectFullId:objectFullId, objectType:objectType};
					newPostsDataArr.push(docInfoObj);
				}
			}
		}
	} else {
		//Иначе просто вставляем документ без файла
		var docInfoObj = {userId:userId, userLogin:userLogin, newDocFileName:newPostFileFolder, newPostName:newPostName, newPostDescr:newPostDescr, objectFullId:objectFullId, objectType:objectType};
		newPostsDataArr.push(docInfoObj);
	}
	//Запускаем процесс создания документов для всех файлов
	App.processStatusForm = GroupOperationsUtil.createProcessStatusForm("Создание объекта",newPostsDataArr,App,App.createSinglePostDoc,App.refreshPostsPage,App.refreshPostsPage);
};


(function ($) {
	var methods = {
		init: function (options) {
			var startJson = options.startJson;
			return this.each(function () {
				var params = {
					divHeadCategories: $('<div class="divHeadCategories"></div>'),
					divCategories: $(this),
					filterGroups: {},
					activeRadio: undefined,
					maximized: 'true',
					idCat: ''
				};
				var handlers = {};
				if (options.handlers != undefined) $.extend(handlers, options.handlers);
				$(this).data('handlers', handlers);
				if(startJson && startJson.filters)
					$(this).data('filtersCount', startJson.filters.length);
				params.divCategories.append(params.divHeadCategories);
				methods.parseConfig(startJson, params);
				if ((params.maximized == 'true') & (params.activeRadio != undefined))
					params.activeRadio.trigger('checked');
				var curTimeout;
				$(window).on('resize', function () {
					clearTimeout(curTimeout);
					curTimeout = setTimeout(function () {
						var id = params.activeRadio.attr('id').split('_')[0];
						methods.calcTreeHeight($('#' + id + '_tree'));
					}, 100);
				});

			});
		},
		serverQueryXML: function (url, params, callbackResult, thisObject) {
			if (thisObject.divTree == undefined) {
				methods.callbackError({
					text: gis_categories_1,
					divTree: thisObject.divTree
				});
			}
			if (params.descrId == undefined) return;
			$.ajax({
				type: 'POST',
				url: url,
				data: params,
				timeout: App.clientRequestTimeout,
				dataType: 'xml',
				success: function (data) {
					var xmlData = $.parseXML($(data).find('string').text());
					$(xmlData).children().each(function () {
						callbackResult($(this), thisObject);
					})
				},
				error: function (jqXHR, textStatus, errorThrown) {
					textStatus = App.prettyCodeError(textStatus, errorThrown);
					methods.callbackError({
						text: gis_categories_2 + '.serverQueryXML. ' + textStatus + '. ' + errorThrown,
						divTree: thisObject.divTree
					});
				}
			});
		},
		serverQueryXmlFileNode: function (url, params, callbackResult, thisObject) {
			url = App.formatNodeServiceUrl(url);
			if (thisObject.divTree === undefined) {
				methods.callbackError({
					text: gis_categories_1,
					divTree: thisObject.divTree
				});
			}
			if (params.descrId === undefined) return;
			App.serverQueryXmlFileNodeWithTries(url, params, 
				function(data){
					var er = HTTPServiceUtil.getError(data);
					if (er !== ''){
						if(params.descrId !== 'none')//случай, если не фейковый запрос фильтра fake_filter. Используется в гридах, где нет справочных колонок
							methods.callbackError({
								text: gis_core_error_1 + '. ' + params.data + '. serverQueryXmlFileNode. success.' + er,
								divTree: thisObject.divTree
							});
						return;
					}
					try{
						var xmlData = $.parseXML(data);
						$(xmlData).children().each(function () {
							callbackResult($(this), thisObject);
						})
					}
					catch(ex){
						methods.callbackError({
							text: gis_core_error_1 + '. ' + params.data + '. serverQueryXmlFileNode. success.' + ex.message,
							divTree: thisObject.divTree
						});	
					}
				},function(data){
					methods.callbackError({
						text: gis_core_error_1 + '. ' + params.data + '. serverQueryXmlFileNode. ' + data + '. ',
						divTree: thisObject.divTree
					});
				}, undefined);
			},
		checkedHeadRadio: function (event) {
			var el = $(this),
				id = el.attr('id').split('_')[0];
			$('.' + el.data('idcat')).addClass('noVisible').removeClass('activeTab');
			$('#' + id + '_tab').removeClass('noVisible').addClass('activeTab');
			if (el.data('loaded') == false) {
				var divTree = $('#' + id + '_tree');
				divTree.jqxRubrTree({
					toggleMode: 'none',
					allowDrag: false,
					allowDrop: false,
					//width: '100%',
					theme: 'myCommon'
				}).on('expand', methods.expandTree);
				methods.serverQueryXmlFileNode(Services.processQueryNodeXml,
					{
						descrId: 'SYS_SEM.xml#GET_XML_FILE',
						descrType: 'select',
						getSchema: false,
						toElements: false,
						data: '<root><data FILE="../../' + el.data('url') + '"/></root>'
					},
					methods.parseTree, {divTree: divTree, parentElement: ''});
				$('#' + id + '_filters .divFilterGroup').each(function (i,el) {
					var scenarioVars = undefined;
					var checkHeadRadioHandler = undefined;
					if(i == 0){
						scenarioVars = methods.getScenarioVars(id);
						checkHeadRadioHandler =  divTree.parent().parent().data('handlers').checkHeadRadioHandler;
					}
					var el = $(this);
					el.myFilters({
						scenarioVars:scenarioVars,
						fromTree: true,
						opener:divTree,
						dataSource: el.data('source'),
						preOpenFilterId: el.data('preopen'),
						handlers: {
							errorHandler: divTree.parent().parent().data('handlers').errorHandler,
							checkHeadRadioHandler:checkHeadRadioHandler
						}
					})
				});
				el.data('loaded', true);
				methods.calcTreeHeight(divTree);
				divTree.jqxRubrTree('refresh');
				if($('#' + id + '_filters .divFilterGroup').length == 0){
					if (divTree.parent().parent().data('handlers').checkHeadRadioHandler !== undefined) {
						var vars = methods.getScenarioVars(id);
						//if (vars !== undefined)
						divTree.parent().parent().data('handlers').checkHeadRadioHandler({vars: vars});
					}
				}
			}
			else {
				var divTree = $('#' + id + '_tree');
				//divTree.jqxRubrTree({width: '100%'});
				divTree.jqxRubrTree('refresh');
				if (divTree.parent().parent().data('handlers').checkHeadRadioHandler !== undefined) {
					var vars = methods.getScenarioVars(id);
					//if (vars !== undefined)
						divTree.parent().parent().data('handlers').checkHeadRadioHandler({vars: vars});
				}
			}
		},
		parseConfig: function (json, obj) {
			obj.idCat = methods.getUniqueId();
			for(var index in json.trees){
				var tree = json.trees[index];
				var visible = 'noVisible',
					id = methods.getUniqueId(),
					radioButton = $('<div id="w' + id + '_checkBox" data-url="" data-loaded="false" data-idcat="' + obj.idCat + '">' + tree.title + '</div>');
				obj.divHeadCategories.append(radioButton);
				if (tree.default !== undefined && tree.default) {
					visible = 'activeTab';
					radioButton.jqxRadioButton({checked: true, groupName: obj.idCat, theme: 'myCommon'});
					obj.activeRadio = radioButton;
				}
				else radioButton.jqxRadioButton({checked: false, groupName: obj.idCat, theme: 'myCommon'});
				radioButton.on('checked', methods.checkedHeadRadio);
				$(obj.divCategories).append('<div id="w' + id + '_tab" class="divTab ' + visible + ' ' + obj.idCat + '"><div id="w' + id + '_filters"></div><div id="w' + id + '_tree" class="divTree"></div></div>');
				//if (tree.topFilterId !== undefined)
					obj.filterGroups[tree.topFilterId] = $('#w' + id + '_filters');
				radioButton.data('url', tree.templateUrl);
				if(tree.startupScenario !== undefined){
					var startupScenario = tree.startupScenario;
					radioButton.data('openLayers',startupScenario.openLayers);
					radioButton.data('openTableInterval',startupScenario.openTableInterval);
					if(startupScenario.filter !== undefined){
						radioButton.data('filterType',startupScenario.filter.type);
						radioButton.data('topFilterSource',startupScenario.filter.topDataSource);
						radioButton.data('middleFilterSource',startupScenario.filter.middleDataSource);
						var id = radioButton.attr('id').replace('_checkBox','');
						var filter = $('#' + id + '_filters');
						var filterType = startupScenario.filter.type;
						var preOpenId = 'undefined';
						if(filterType !== undefined && filterType.indexOf('middle') != -1)
							preOpenId = '';
						//если есть описание верхнего фильтра, то добавляем div.
						if(filter.length > 0 && filterType !== undefined && filterType.indexOf('top') != -1){
							filter.append('<div class="divFilterGroup" data-preopen="' + preOpenId + '" data-source="' + startupScenario.filter.topDataSource + '"></div>');
						}
					}
					if(startupScenario.openTables !== undefined  && startupScenario.openTables.length > 0){
						for(var index in startupScenario.openTables){
							var openTable = startupScenario.openTables[index];
							radioButton.data('openTableTitle',radioButton.data('openTableTitle') + '|' +openTable.title);
							radioButton.data('openTableGridId',radioButton.data('openTableGridId') + '|' + openTable.gridId);
							radioButton.data('openTableLevelParams',radioButton.data('openTableLevelParams') + '|' + openTable.levelParams);
							if(openTable.query !== undefined){
								radioButton.data('querySource',radioButton.data('querySource') + '|' +openTable.query.source);
								radioButton.data('queryLayerId',radioButton.data('queryLayerId') + '|' + openTable.query.LAYER_ID);
								radioButton.data('queryFileName',radioButton.data('queryFileName') + '|' + openTable.query.FILE_NAME);
							}
						}
					}
				}


			}
			for(var index in json.filters){
				var filter = json.filters[index];
				var preOpenId = 'undefined';
				if (filter.preOpenFilterId !== undefined)
					preOpenId = filter.preOpenFilterId;
				obj.filterGroups[filter.id].append('<div class="divFilterGroup" data-preopen="' + preOpenId + '" data-source="' + filter.dataSource + '"></div>');
			}
		},
		getIdCheckBox: function (options) {
			var res = '';
			if (options.divTree != undefined) {
				var levelParams = options.xmlElement.attr('levelParams');
				if ((levelParams != undefined) && (levelParams.indexOf('layerId=') != -1)) {
					var value = levelParams.replace('layerId=', '').split('#');
					if (value.length == 1) res = 'id="' + options.divTree.attr('id') + '-' + value[0].split(';')[0] + '"';
					else res = 'id="' + options.divTree.attr('id') + '-' + value[1].split(';')[0] + '"';
				}
			}
			return res;
		},
		getItemLabel: function (options) {
			var icons = '';
			var checkBox = '<div class="divNoCheckBox"></div>';
				if ((options.xmlElement.attr('icon') !== undefined) & (options.xmlElement.attr('icon') != 'OPENSCALE'))
					icons = '<img src="' + options.xmlElement.attr('icon') + '" alt="' + options.label + '" />';
				var checkBoxType = options.xmlElement.attr('checkbox_type');
				if (checkBoxType != undefined) {
					if (checkBoxType != 'none') {
						if (checkBoxType == 'childBased')
							checkBox = '<div class="checkBoxDisabled myCheckBox"></div>';
						else {
							if ((options.xmlElement[0].getElementsByTagName('on_check').length + options.xmlElement[0].getElementsByTagName('on_uncheck').length) > 0)
								checkBox = '<div ' + methods.getIdCheckBox(options) + ' class="checkBox myCheckBox"></div>';
							else
								checkBox = '<div class="checkBoxDisabled myCheckBox"></div>';
						}
					}
				}
				else {
					if (options.xmlElement[0].tagName != 'Style') {
						if ((options.xmlElement[0].getElementsByTagName('on_check').length + options.xmlElement[0].getElementsByTagName('on_uncheck').length) > 0)
							checkBox = '<div ' + methods.getIdCheckBox(options) + ' class="checkBox myCheckBox"></div>';
						else
							checkBox = '<div class="checkBoxDisabled myCheckBox"></div>';
					}
				}
			return checkBox + '<div class="spContextIcons"></div><span class="spIcon" title="'+options.label+'" >' + icons + '</span><span class="spLabel" title="'+options.label+'" >' + options.label + '</span>';
		},
		calcTreeHeight: function (tree) {
			//5 попыток пересчитать высоту, каждую секунду. Костыль, чтобы не переписывать половину класса фильтра
			var x = 0;
			//20.07.2021 Решено завиксировать ширину рубрикатора.
			var width = $('.divHeadCategories').outerWidth(true)+'px';
			var height = $('body').outerHeight() /*кнопки*/-210-$('.divHeadCategories').outerHeight(true) - /*filters*/$(tree.parent().children()[0]).outerHeight(true)+ 'px';
			tree.jqxRubrTree({
				width:width,
				height: height
			});
			var intervalID = setInterval(function () {
				var heightInternal = $('body').outerHeight() /*кнопки*/-210-$('.divHeadCategories').outerHeight(true) - /*filters*/$(tree.parent().children()[0]).outerHeight(true)+ 'px';
				if(height !== heightInternal ){
					tree.jqxRubrTree({
						width: width,
						height: heightInternal
					});
					height = heightInternal;
				}

				if (++x === 5) {
					window.clearInterval(intervalID);
				}
			}, 1000);
		},
		//добавить jqx чекбокс и листенеры
		applyCheckbox: function (treeNode, tree) {
			var dataItem = treeNode;//tree.divTree.jqxRubrTree('getItem',treeNode.element).value;
			$('#' + treeNode.element.id + ' .myCheckBox:first').each(function () {
				if ($(this).hasClass('checkBox'))
					$(this).jqxCheckBox({theme: 'myCommon'}).on('checked', function () {
						var el = $(this);
						if (el.hasClass('noHandler')) el.removeClass('noHandler');
						else methods.checkTreeNode({tree: tree, dataItem: dataItem.value});
					})
						.on('unchecked', function () {
							var el = $(this);
							if (el.hasClass('noHandler')) el.removeClass('noHandler');
							else methods.uncheckTreeNode({tree: tree, dataItem: dataItem.value});
						});
				if ($(this).hasClass('checkBoxDisabled'))
					$(this).jqxCheckBox({disabled: true, theme: 'myCommon'});
				else
					tree.layerVisibility.push({layer: this.id.split('-')[1]});
			});
			methods.updateLayersVisibility(tree, tree.layerVisibility);
		},
		parseTree: function (xmlElement, tree) {
			switch (xmlElement[0].tagName) {
				case 'root':
				case 'dataset':
					tree.invokes = {};
					xmlElement.children().each(function () {
						methods.parseTree($(this), tree);
					});
					methods.calcTreeHeight(tree.divTree);
					break;
				case 'tree':
					var params = $.extend(tree, {layerVisibility: []});
					xmlElement.children().each(function () {
						methods.parseTree($(this), tree);
					});
					if (params.layerVisibility.length != 0) {
						methods.updateLayersVisibility(tree, params.layerVisibility);
					}
					break;
				case 'group':
					xmlElement.children().each(function () {
						methods.parseTree($(this), tree);
					});
					break;
				case 'level':
					var oldParent = tree.parentElement;
					if (xmlElement.attr('max_items') == undefined)
						xmlElement.attr('max_items', $(xmlElement[0]).parent().attr('max_items'));
					var maxItems = xmlElement.attr('max_items');
					var levelParams = xmlElement.attr('levelParams');
					if (oldParent == '')
						tree.divTree.jqxRubrTree('addTo', {
							html: methods.getItemLabel({
								label: xmlElement.attr('format'),
								xmlElement: xmlElement,
								divTree: tree.divTree
							}),
							value: {
								loaded: false,
								maxItems: maxItems,
								hasQuery: false,
								params: {LOW_LIMIT: 1, HIGH_LIMIT: parseInt(maxItems) + 1, levelParams: levelParams}
							}
						});
					else
						tree.divTree.jqxRubrTree('addTo', {
							html: methods.getItemLabel({
								label: xmlElement.attr('format'),
								xmlElement: xmlElement,
								divTree: tree.divTree
							}),
							value: {
								loaded: false,
								maxItems: maxItems,
								hasQuery: false,
								params: {LOW_LIMIT: 1, HIGH_LIMIT: parseInt(maxItems) + 1, levelParams: levelParams}
							}
						}, tree.parentElement);


					var treeItems = tree.divTree.jqxRubrTree('getItems');
					tree.parentElement = treeItems[treeItems.length - 1].element;

					var treeNode = treeItems[treeItems.length - 1];
					var dataItem = tree.divTree.jqxRubrTree('getItem', tree.parentElement).value;
					$('#' + tree.parentElement.id + ' .myCheckBox:first').each(function () {
						if ($(this).hasClass('checkBox')) $(this).jqxCheckBox({theme: 'myCommon'}).on('checked', function () {
							var el = $(this);
							if (el.hasClass('noHandler')) el.removeClass('noHandler');
							else methods.checkTreeNode({tree: tree, dataItem: dataItem});
						})
							.on('unchecked', function () {
								var el = $(this);
								if (el.hasClass('noHandler')) el.removeClass('noHandler');
								else methods.uncheckTreeNode({tree: tree, dataItem: dataItem});
							});
						if ($(this).hasClass('checkBoxDisabled')) $(this).jqxCheckBox({
							disabled: true,
							theme: 'myCommon'
						});
						else
							tree.layerVisibility.push({layer: this.id.split('-')[1]});
					});
					methods.updateLayersVisibility(tree, tree.layerVisibility);
					if (xmlElement.parent().get(0).tagName == 'tree') {
						var itemData = tree.divTree.jqxRubrTree('getItem', tree.parentElement).value;
						itemData.children = xmlElement.children();
						itemData.tree = tree;
						var hasChildren = xmlElement.children('level').length != 0;
						if (hasChildren == true) {
							//добавляем сюда тестовый див для отображения
							tree.divTree.jqxRubrTree('addTo', {html: gis_categories_3}, tree.parentElement);
						}
						xmlElement.children().each(function () {
							methods.parseLevel($(this), tree.parentElement, tree);
						});
						if (itemData.hasQuery == true) {
							var label = $('#' + tree.parentElement.id + ' .spLabel:first');
							label.data('oldlabel', label.text());
							label.text(gis_categories_3);
							var data = '';
							for (var i in itemData.params)
								data = data + ' ' + i + '="' + itemData.params[i] + '"';
							$(tree.parentElement).addClass('li-disabled');
							$(tree.parentElement).find('*').attr('disabled', true).addClass('readOnly');
							methods.serverQueryXmlFileNode(Services.processQueryNodeXml,
								{
									descrId: itemData.descrId,
									descrType: 'select',
									getSchema: false,
									toElements: false,
									data: '<root><data ' + data + '/></root>'
								}, function (xmlElement, params, parent) {
									methods.parseTreeData(xmlElement, params, parent);
									$(params.treeNode).removeClass('li-disabled');
									$(params.treeNode).find('*').attr('disabled', false).removeClass('readOnly');
								}, {treeNode: tree.parentElement, divTree: tree.divTree});
						}
					}
					tree.parentElement = oldParent;
					break;
				case 'invoke':
					var nameInvoke = xmlElement.attr('id');
					tree.invokes[nameInvoke] = {vars: {}};
					$.each(xmlElement[0].attributes, function () {
						if (this.name != 'id') tree.invokes[nameInvoke][this.name] = this.value;
					});
					xmlElement.children().each(function () {
						methods.parseTree($(this), tree.invokes[nameInvoke].vars);
					});
					break;
				case 'var':
					if (xmlElement.attr('name') == undefined)
						$.each(xmlElement[0].attributes, function () {
							tree[this.name] = this.value;
						});
					else
						tree[xmlElement.attr('name')] = xmlElement.attr('value');
					break;
				case 'context_menu':
					if (tree.invokes[xmlElement.attr('run_invoke')].icon != undefined) {
						var alt = tree.invokes[xmlElement.attr('run_invoke')].tooltip;
						//размеры, как во флеш
						var iconMenu = $('<img style="width:20px;height:20px;" src="' + tree.invokes[xmlElement.attr('run_invoke')].icon + '" alt="' + alt + '"/>');
						$('#' + tree.parentElement.id + ' .spContextIcons:first').append(iconMenu);
						//iconMenu.jqxTooltip({content: alt, theme: 'myCommon'});
						iconMenu.attr('title', alt);
						var dataItem = {};
						$.each(xmlElement[0].attributes, function () {
							if (this.name != 'id') dataItem[this.name] = this.value;
						});
						iconMenu.data('dataItem', dataItem);
						var levelParams = xmlElement.parent().attr('levelParams');
						if (levelParams == undefined) levelParams = '';
						iconMenu.click(function () {
							var dataItem = $(this).data('dataItem');
							methods.contextMenuClick({tree: tree, levelParams: levelParams, dataItem: dataItem});
						});
					}
					break;
				case 'on_check':
					/*var dataItem = {};
					 $.each(xmlElement[0].attributes,function(){if(this.name != 'id')dataItem[this.name] = this.value;});
					 iconMenu.data('dataItem',dataItem);
					 var levelParams = xmlElement.parent().attr('levelParams');
					 if(levelParams == undefined)levelParams = '';*/
					dataItem = tree.divTree.jqxRubrTree('getItem', tree.parentElement).value;
					$.extend(dataItem, {
						on_check: {
							run_invoke: xmlElement.attr('run_invoke'),
							layerParams: xmlElement.attr('layerParams')
						}
					});
					break;
				case 'on_uncheck':
					var dataItem = tree.divTree.jqxRubrTree('getItem', tree.parentElement).value;
					$.extend(dataItem, {
						on_uncheck: {
							run_invoke: xmlElement.attr('run_invoke'),
							layerParams: xmlElement.attr('layerParams')
						}
					});
					break;
				case 'query':
					var dataItem = tree.divTree.jqxRubrTree('getItem', tree.parentElement).value;
					$.extend(dataItem, {descrId: '', hasQuery: true});
					$.each(xmlElement[0].attributes, function () {
						if (this.name == 'source') {
							dataItem.descrId = this.value;
							return;
						}
						if (this.value.indexOf('{') == 0) {
							var el = tree.divTree.jqxRubrTree('getItem', tree.parentElement);
							this.value = tree.divTree.jqxRubrTree('getItem', el.parentElement).value.params[this.name];
						}
						dataItem.params[this.name] = this.value;
					});
					break;
			}
		},
		addChildToParent: function (xmlElement, parent, tree, finderCount) { //finderCount - текущий счетчик чилдрена у парента, чтобы выловить его в getItems
			var itemLabel = undefined;
			switch (xmlElement[0].tagName) {
				case 'level':
					if (xmlElement.attr('max_items') == undefined)
						xmlElement.attr('max_items', $(xmlElement[0]).parent().attr('max_items'));
					var maxItems = xmlElement.attr('max_items');
					var levelParams = xmlElement.attr('levelParams');
					itemLabel = methods.getItemLabel({
						label: xmlElement.attr('format'),
						xmlElement: xmlElement,
						divTree: tree.divTree
					});
					tree.divTree.jqxRubrTree('addTo', {
						html: itemLabel,
						value: {
							loaded: false,
							maxItems: maxItems,
							hasQuery: false,
							params: {LOW_LIMIT: 1, HIGH_LIMIT: parseInt(maxItems) + 1, levelParams: levelParams}
						}
					}, parent);
					var treeItems = tree.divTree.jqxRubrTree('getItems');
					var pI = tree.divTree.jqxRubrTree('getItem', parent);
					var i = 0;
					//вылавливаем добавленный элемент
					var treeNode = pI.nextItem;
					for (i; i < finderCount; i++) {
						treeNode = treeNode.nextItem;
					}
					if (treeNode.value != null) {
						treeNode.value.children = xmlElement.children();
						treeNode.value.tree = tree;
					}
					itemLabel = treeNode.element;
					methods.applyCheckbox(treeNode, tree);
					break;
			}
			return itemLabel;
		},
		parseLevel: function (xmlElement, currentElement, tree) {
			switch (xmlElement[0].tagName) {
				case 'context_menu':
					if (tree.invokes[xmlElement.attr('run_invoke')] != undefined && tree.invokes[xmlElement.attr('run_invoke')].icon != undefined) {
						var alt = tree.invokes[xmlElement.attr('run_invoke')].tooltip;
						//размеры, как во флеш
						var iconMenu = $('<img style="width:20px;height:20px;" src="' + tree.invokes[xmlElement.attr('run_invoke')].icon + '" alt="' + alt + '"/>');
						$('#' + currentElement.id + ' .spContextIcons:first').append(iconMenu);
						//iconMenu.jqxTooltip({content: alt, theme: 'myCommon'});
						iconMenu.attr('title',alt);
						var dataItem = {};
						$.each(xmlElement[0].attributes, function () {
							if (this.name != 'id') dataItem[this.name] = this.value;
						});
						iconMenu.data('dataItem', dataItem);
						var levelParams = xmlElement.parent().attr('levelParams');
						if (levelParams == undefined) levelParams = '';
						iconMenu.click(function () {
							var dataItem = $(this).data('dataItem');
							methods.contextMenuClick({tree: tree, levelParams: levelParams, dataItem: dataItem});
						});
					}
					break;
				case 'on_check':
					var dataItem = tree.divTree.jqxRubrTree('getItem', currentElement).value;
					$.extend(dataItem, {
						on_check: {
							run_invoke: xmlElement.attr('run_invoke'),
							layerParams: xmlElement.attr('layerParams')
						}
					});
					break;
				case 'on_uncheck':
					var dataItem = tree.divTree.jqxRubrTree('getItem', currentElement).value;
					$.extend(dataItem, {
						on_uncheck: {
							run_invoke: xmlElement.attr('run_invoke'),
							layerParams: xmlElement.attr('layerParams')
						}
					});
					break;
				case 'query':
					var dataItem = tree.divTree.jqxRubrTree('getItem', currentElement).value;
					$.extend(dataItem, {descrId: '', hasQuery: true});
					$.each(xmlElement[0].attributes, function () {
						if (this.name == 'source') {
							dataItem.descrId = this.value;
							return;
						}
						if (this.value.indexOf('{') == 0) {
							var el = tree.divTree.jqxRubrTree('getItem', currentElement);
							this.value = tree.divTree.jqxRubrTree('getItem', el.parentElement).value.params[this.name];
						}
						dataItem.params[this.name] = this.value;
					});
					break;
			}
		},
		updateLayersVisibility: function (tree, layerVisibility) {
			var el = $(tree.divTree).parent().parent().data('handlers');
			if (el.setLayerVisibility != undefined) {
				var layerVisibity = el.setLayerVisibility(layerVisibility),
					localId = tree.divTree.attr('id');
				for (var i in layerVisibity)
					if (layerVisibity[i].visible)
						$('#' + localId + '-' + layerVisibity[i].layerName)/*.addClass('noHandler')*/.jqxCheckBox('check');
					else
						$('#' + localId + '-' + layerVisibity[i].layerName).addClass('noHandler').jqxCheckBox('uncheck');
			}
		},
		getUniqueId: function () {
			return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
				var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
		},
		expandTree: function (event) {
			var divTree = $(event.target);
			var item = divTree.jqxRubrTree('getItem', event.args.element);
			if (item.value.loaded == false) {
				if (item.value.parsed != true) {
					//удаляем "загрузка" и перезаполняем, как при клике
					if (item.nextItem != null && item.nextItem.label == gis_categories_3) {
						divTree.jqxRubrTree('removeItem', item.nextItem);
					}
					var children = item.value.children;
					var counter = 0;

					if (children != undefined)
						children.each(function () {
							if ($(this)[0].nodeName == 'level') {
								if (item.value.tree != undefined) {
									var tree = item.value.tree;
									var currElement = methods.addChildToParent($(this), item.element, tree, counter);
									var hasChildren = $(this).children('level').length != 0;
									if (hasChildren == true) {
										//добавляем сюда тестовый див для отображения
										tree.divTree.jqxRubrTree('addTo', {html: gis_categories_3}, currElement);
										counter++;
									}
									//дизейблим элемент, пока к нему не подгрузились стили
									//tree.divTree.jqxRubrTree('disableItem',currElement);// в этом варианте клики проходят
									$(currElement).addClass('li-disabled');
									//получаем descr, если нет запросов на стили, то не дизейблим
									var hasQuery = false;
									$(this).children().each(function () {
										if ($(this)[0].tagName == 'query')
											hasQuery = true;
										methods.parseLevel($(this), currElement, tree);
									});
									$(currElement).find('*').attr('disabled', true).addClass('readOnly');
									if (hasQuery == false) {
										$(currElement).removeClass('li-disabled');
										$(currElement).find('*').attr('disabled', false).removeClass('readOnly');
									}
									counter++;
								}
							}
						});
					if (item.value.tree != undefined) {
						var tree = item.value.tree;
						var dataItem = tree.divTree.jqxRubrTree('getItem', item.element).value;
						$('#' + item.element.id + ' .myCheckBox:first').each(function () {
							if ($(this).hasClass('checkBox')) $(this).jqxCheckBox({theme: 'myCommon'}).on('checked', function () {
								var el = $(this);
								if (el.hasClass('noHandler')) el.removeClass('noHandler');
								else methods.checkTreeNode({tree: tree, dataItem: dataItem});
							})
								.on('unchecked', function () {
									var el = $(this);
									if (el.hasClass('noHandler')) el.removeClass('noHandler');
									else methods.uncheckTreeNode({tree: tree, dataItem: dataItem});
								});
							if ($(this).hasClass('checkBoxDisabled')) $(this).jqxCheckBox({
								disabled: true,
								theme: 'myCommon'
							});
							else
								tree.layerVisibility.push({layer: this.id.split('-')[1]});
						});
						methods.updateLayersVisibility(tree, tree.layerVisibility);
					}
					item.value.parsed = true;
				}
				item.value.loaded = true;
				var children = $(event.args.element).find('ul:first').children();
				children.each(function () {
					var itemData = divTree.jqxRubrTree('getItem', this).value;
					var label = $('#' + this.id + ' .spLabel:first');
					label.data('oldlabel', label.text());
					if (itemData.descrId != undefined) label.text(gis_categories_3);
					var data = '';
					for (var i in itemData.params)data = data + ' ' + i + '="' + itemData.params[i] + '"';
					methods.serverQueryXmlFileNode(Services.processQueryNodeXml,
						{
							descrId: itemData.descrId,
							descrType: 'select',
							getSchema: false,
							toElements: false,
							data: '<root><data ' + data + '/></root>'
						},
						function (xmlElement, params) {
							var scrollTop = $(document).scrollTop();
							methods.parseTreeData(xmlElement, params);
							//выставляем в enabled элемент с загруженными стилями
							//params.divTree.jqxRubrTree('enableItem',params.treeNode);
							$(params.treeNode).removeClass('li-disabled');
							$(params.treeNode).find('*').attr('disabled', false).removeClass('readOnly');
							$(document).scrollTop(scrollTop);
						}, {treeNode: this, divTree: divTree});
				});
				divTree.jqxRubrTree('refresh');
			}

		},
		addMoreItems: function (params) {
			var item = params.divTree.jqxRubrTree('getItem', params.treeNode);
			if (item.value.loaded == false) {
				item.value.loaded = true;
				var label = $('#' + params.treeNode.id + ' .spLabel:first');
				label.data('oldlabel', label.text());
				label.text(gis_categories_3);
				var itemData = params.divTree.jqxRubrTree('getItem', params.treeNode).value;
				var data = '';
				for (var i in itemData.params)data = data + ' ' + i + '="' + itemData.params[i] + '"';
				methods.serverQueryXmlFileNode(Services.processQueryNodeXml,
					{
						descrId: itemData.descrId,
						descrType: 'select',
						getSchema: false,
						toElements: false,
						data: '<root><data ' + data + '/></root>'
					},
					function (xmlElement, params) {
						var scrollTop = $(document).scrollTop();
						methods.parseTreeData(xmlElement, params);
						$(params.treeNode).removeClass('li-disabled');
						$(params.treeNode).find('*').attr('disabled', false).removeClass('readOnly');
						$(document).scrollTop(scrollTop);
					}, params);
			}
		},
		checkTreeNode: function (params) {
			if (params.dataItem.on_check != undefined) {
				var el = $(params.tree.divTree).parent().parent().data('handlers');
				if (el.checkHandler != undefined)
					el.checkHandler(methods.makeParams({
						invoke: params.tree.invokes[params.dataItem.on_check.run_invoke],
						dataItem: params.dataItem.on_check,
						tree: params.tree,
						levelParams: params.dataItem.params.levelParams
					}));
			}
		},
		uncheckTreeNode: function (params) {
			if (params.dataItem.on_uncheck != undefined) {
				var el = $(params.tree.divTree).parent().parent().data('handlers');
				if (el.uncheckHandler != undefined)
					el.uncheckHandler(methods.makeParams({
						invoke: params.tree.invokes[params.dataItem.on_uncheck.run_invoke],
						dataItem: params.dataItem.on_uncheck
					}));
			}
		},
		contextMenuClick: function (params) {
			if (params.dataItem.run_invoke != undefined) {
				var el = $(params.tree.divTree).parent().parent().data('handlers');
				if (el.contextMenuHandler != undefined)
					el.contextMenuHandler($.extend(methods.makeParams({
						invoke: params.tree.invokes[params.dataItem.run_invoke],
						dataItem: params.dataItem
					}), {levelParams: params.levelParams}));
			}
		},
		makeParams: function (params) {
			var prm = {event_name: params.invoke.event_name, vars: {}, tree: params.tree};
			for (var i in params.invoke.vars)prm.vars[i] = params.invoke.vars[i];
			for (i in params.dataItem)
				if (i != 'run_invoke') prm.vars[i] = params.dataItem[i];
			return prm;
		},
		parseTreeData: function (xmlElement, params, parent) {
			switch (xmlElement[0].tagName) {
				case 'root':
					var data = xmlElement.children();
					if ((data.length == 0) & ($(params.treeNode).text().indexOf(gis_categories_3) != -1))
						params.divTree.jqxRubrTree('removeItem', params.treeNode);
					else {
						var treeNode = params.treeNode;
						data.each(function () {
							methods.parseTreeData($(this), params);
						});
						params.treeNode = treeNode;
						var el = params.divTree.jqxRubrTree('getItem', params.treeNode);
						if (data.length == (el.value.params.HIGH_LIMIT - el.value.params.LOW_LIMIT)) {
							var val = $.extend({}, el.value);
							val.loaded = false;
							val.params.LOW_LIMIT = parseInt(el.value.params.HIGH_LIMIT) + 1;
							val.params.HIGH_LIMIT = parseInt(el.value.params.HIGH_LIMIT) + parseInt(el.value.maxItems) + 1;
							xmlElement.attr('checkbox_type', 'none');
							params.divTree.jqxRubrTree('addTo', {
								html: methods.getItemLabel({
									label: gis_categories_4 + el.value.maxItems + gis_categories_5,
									xmlElement: xmlElement
								}), value: val
							}, el.parentElement);
							var items = $(el.element).parent().children();
							$(items[items.length - 1]).click(function () {
								//Закоментированы для функции подгрузки слоев, дизейблился 1 слой
								//$(params.treeNode).addClass('li-disabled');
								methods.addMoreItems({treeNode: items[items.length - 1], divTree: params.divTree})
								//$(params.treeNode).find('*').attr('disabled', true).addClass('readOnly');
							});
						}
					}
					break;
				case 'Style':
					var icons;
					var label = $('#' + params.treeNode.id + ' .spLabel:first');
					if (label.text().indexOf(gis_categories_3) !== -1) {
						var oldLabel = label.data('oldlabel');
						if ((oldLabel === '{descr}') || (oldLabel.indexOf(gis_categories_4) === 0) || (oldLabel.indexOf(gis_categories_7) === 0)) {
							if (xmlElement.attr('descr'))
								label.text(xmlElement.attr('descr')).attr('title', xmlElement.attr('descr') );
							else
								label.text(gis_categories_7);
						}
						else
							label.text(oldLabel);
						icons = $('#' + params.treeNode.id + ' .spIcon:first');
						icons.children().each(function () {
							var el = $(this);
							if ((el.attr('alt') !== undefined) & (el.attr('alt') === '{descr}')) {
								el.attr('alt', xmlElement.attr('descr'));
							}
						});
					}
					else {
						var el = params.divTree.jqxRubrTree('getItem', params.treeNode);
						params.divTree.jqxRubrTree('addTo', {
							html: methods.getItemLabel({
								label: xmlElement.attr('descr'),
								xmlElement: xmlElement
							}), value: {loaded: false, hasQuery: false}
						}, el.parentElement);
						var lstLi = $(params.treeNode).parent().children();
						icons = $('#' + $(lstLi[lstLi.length - 1]).attr('id') + ' .spIcon:first');
					}
					var config = {first: true, icons: icons, alt: xmlElement.attr('descr')};
					xmlElement.children().each(function () {
						methods.parseTreeData($(this), config, xmlElement);
					});
					var contextMenu = $('#' + params.treeNode.id + ' .spContextIcons:first');
					$.each(xmlElement[0].attributes, function () {
						var itemKey = this.name,
							itemValue = this.value;
						contextMenu.children().each(function () {
							var dataItem = $(this).data('dataItem');
							if (dataItem != undefined)
								for (var i in dataItem)
									dataItem[i] = dataItem[i].replace(new RegExp('{' + itemKey + '}', 'g'), itemValue);
						});
					});
					break;

				case 'LineStyle':
					if (!params.first)return;
					//условие, если у парента есть polyStyle, то продолжаем парсить, чтобы найти polystyle
					if (parent != undefined && parent.children('PolyStyle').length > 0) {
						params.first = true;
					}
					else {
						params.first = false;
						xmlElement.children().each(function () {
							methods.parseTreeData($(this), params);
						});
						//меняем иконки в зависимости от ширины
						var lineWidth = 2;
						lineWidth = parseInt(params.width);
						var iconStyle = 'divIconLineStyle';
						//upd. 09.03.21 Принято решение ВЕЗДЕ! захардкодить в рубрикаторах показ жирной линии одного размера для читаемости
						//Замечание 20 из ПТГ
						//Падуков. Техсхема с планированием каптремонтов. Рубрикатор техсхемы с дефекностью  и капремонтами. Из-за каймы не читаются цвета. Убрать ее.
						iconStyle += '4';
						//если есть у линии канва
						/*if (lineWidth < 4)
							iconStyle += '';
						else if (lineWidth >= 4 && lineWidth < 8)
							iconStyle += '4';
						else
							iconStyle += '8';*/
						if (parent.children('LineStyle').length > 1) {
							iconStyle += 'Border';
						}
						if (params)
							params.icons.append('<div class="divIcon ' + iconStyle + '" style="background-color: ' + params.color + '"></div>');
					}
					break;
				case 'PolyStyle':
					if (!params.first)return;
					params.first = false;
					xmlElement.children().each(function () {
						methods.parseTreeData($(this), params);
					});
					//если нужна кайма, то забираем её из LineStyle
					var polystyleborder = 'border: 1px solid #000000;';
					if (params.outline == '1') {
						if (parent != undefined && parent.children('LineStyle').length > 0) {
							params.lineString = {};
							if (parent.children('LineStyle').length > 0) {
								//забираем 1-й линейный стиль
								$(parent.children('LineStyle')[0]).children().each(function () {
									methods.parseLineStyleData($(this), params.lineString);
								});
								//кайма для полигона
								if (params.lineString.color != undefined) {
									polystyleborder = 'border: 1px solid ' + params.lineString.color + ';';
								}
							}
						}
					}
					else {
						polystyleborder = '';
					}
					if (params.fill == '1') {
						var R = parseInt(params.fullColor.substring(2, 4), 16);
						var G = parseInt(params.fullColor.substring(4, 6), 16);
						var B = parseInt(params.fullColor.substring(6, 8), 16);
						var A = parseInt(params.fullColor.substring(0, 2), 16) / 255;
						//params.icons.append('<div class="divIcon divIconPolyStyle" style="background-color: '+params.color+'"></div>');
						params.icons.append('<div class="divIcon divIconPolyStyle" style="' + polystyleborder + ' background-color: rgba(' + R + ',' + G + ',' + B + ',' + A + ')"></div>');
					}
					else {
						//params.icons.append('<div class="divIcon divIconPolyStyle divIconPolyStyleBorder " ></div>');
						params.icons.append('<div class="divIcon divIconPolyStyle" style="' + polystyleborder + '" ></div>');
					}

					break;
				case 'Icon':
					if (!params.first)return;
					params.first = false;
					xmlElement.children().each(function () {
						methods.parseTreeData($(this), params);
					});
					if (params.href != undefined){
						//02.09.21 fix ie проблемы, что svg не получает корректные размеры
						if(params.href.indexOf('.svg') !== -1)
							params.href = params.href.replace('.svg', '.png');
						params.icons.append('<img src="' + params.href + '" alt="' + params.alt + '"/>');
					}

					break;
				case 'IconStyle':
					if (!params.first)return;
					xmlElement.children().each(function () {
						methods.parseTreeData($(this), params);
					});
					if ((params.form != undefined) & (params.form != 'bitmap'))
						params.icons.append('<div class="divIcon divIconStyle' + params.form + '" style="background-color: ' + params.color + '"></div>');
					break;
				case 'color':
					params['color'] = '#' + xmlElement.text().substr(2);
					params['fullColor'] = xmlElement.text();
					break;//полная строка с цветом и прозрачностью
				case 'fill':
					params['fill'] = xmlElement.text();
					break;
				case 'outline':
					params['outline'] = xmlElement.text();
					break;
				case 'width':
					params['width'] = xmlElement.text();
					break;
				case 'href':
					params['href'] = xmlElement.text();
					break;
				case 'form':
					params['form'] = xmlElement.text();
					break;
			}
		},
		parseLineStyleData: function (xmlElement, params, parent) {//вычленил функцию для отдельного парсинга линейного стиля
			switch (xmlElement[0].tagName) {
				case 'LineStyle':
					if (!params.first)return;
					//условие, если у парента есть polyStyle, то продолжаем парсить, чтобы найти polystyle
					if (parent != undefined && parent.children('PolyStyle').length > 0) {
						params.first = true;
					}
					else {
						params.first = false;
						xmlElement.children().each(function () {
							methods.parseTreeData($(this), params);
						});
						params.icons.append('<div class="divIcon divIconLineStyle" style="background-color: ' + params.color + '"></div>');
					}
					break;
				case 'color':
					params['color'] = '#' + xmlElement.text().substr(2);
					params['fullColor'] = xmlElement.text();
					break;//полная строка с цветом и прозрачностью
				case 'fill':
					params['fill'] = xmlElement.text();
					break;
				case 'outline':
					params['outline'] = xmlElement.text();
					break;
				case 'width':
					params['width'] = xmlElement.text();
					break;
			}
		},
		callbackFilter: function (params) {
			var value = '';
			var idArr = $('#' + this.attr('id') + ' .divTab.activeTab').attr('id');
			if (idArr == undefined) return {windowId: params.windowId, params: [{name: 'filter', value: value}]};
			var id = idArr.split('_')[0];
			$('#' + id + '_filters .divFilter').each(function () {
				value = value + $(this).myFilters('getFilterValuesString') + '|';
			});
			if (value != '') value = value.substr(0, value.length - 1);
			return {windowId: params.windowId, params: [{name: 'filter', value: value}]};
		},
		enableLayer: function (params) {
			var finded = false;
			$('#' + this.attr('id') + ' .divTree').each(function () {
				for (var i in params.params) {
					$('#' + this.id + '-' + params.params[i].value).each(function () {
						var el = $(this);
						if (el.jqxCheckBox('checked') == false) {
							el.jqxCheckBox('check');
							finded = true;
						}
					});
				}
			});
			return finded;
		},
		disableLayer: function (params) {
			$('#' + this.attr('id') + ' .divTree').each(function () {
				for (var i in params.params) {
					$('#' + this.id + '-' + params.params[i].value).each(function () {
						var el = $(this);
						if (el.jqxCheckBox('checked') == true) el.jqxCheckBox('uncheck');
					});
				}
			});
		},
		updateTopFilter: function (params) {
			var data = $($.parseXML(params.params)).children()[0];
			$('#' + this.attr('id') + ' .' + data.getAttribute('TOP_FILTER')).myFilters('updateTopFilter', {obj_ids: data.getAttribute('OBJ_IDS')});
		},
		callbackError: function (params) {
			var el = params.divTree.parent().parent().data('handlers');
			if (el.errorHandler != undefined) el.errorHandler(params);
			else {

				//alert(params.text);
			}
		},
		getScenarioVars: function (id) {
			var vars = undefined;
			/*$('#' + id + '_filters .divFilter').each(function () {
				var el = $(this);
				if (el.data('preopen') == el.data('filterid')) {
					vars = {};
					vars.variableName = el.data('filterid');
					vars.maxCnt = el.data('maxcnt');
					vars.dataProvider = el.data('dataprovider');
					vars.title = el.data('title');
				}
			});*/
			var radio = $('#' + id + '_checkBox');
			if (radio.length > 0) {
				vars = {
					openLayers: radio.data('openLayers'),
					openTables: radio.data('openTables'),
					topFilterSource: radio.data('topFilterSource'),
					middleFilterSource: radio.data('middleFilterSource'),
					openTableInterval: radio.data('openTableInterval'),
					filterType: radio.data('filterType'),
					/*данные для открытия грида*/
					openTableTitle: radio.data('openTableTitle'),
					openTableGridId: radio.data('openTableGridId'),
					openTableLevelParams: radio.data('openTableLevelParams'),
					querySource: radio.data('querySource'),
					queryLayerId: radio.data('queryLayerId'),
					queryFileName: radio.data('queryFileName')

				};
			}
			return vars;
		}
	};


	$.fn.myCategories = function (method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist on jQuery.fn.myCategories');
		}
	};
})(jQuery);
(function( $ ){
    var methods = {
        init : function( options ) {
            return this.each(function (){
                var handlers = {};
                if(options.handlers !== undefined)$.extend(handlers,options.handlers);
                var scenarioVars = {};
                if(options.scenarioVars !== undefined)$.extend(scenarioVars,options.scenarioVars);
                var el = $(this);
                el.data('handlers', handlers);
                el.data('scenarioVars',scenarioVars);
                el.data('needApply', false);
                el.data('infinite', !!options.infinite);//флаг, является ли фильтр с большим количеством данных, чтобы далее использовать заполнение через спец кнопку
                el.data('opener', options.opener);
                el.data('requestId', options.requestId);
                el.data('fromTree', options.fromTree === true);
	            el.data('loading',true);
                el.data('hideButtons', options.hideButtons);
                //объект со значениями, которые необходимо выбрать в списках
                var selectedItems = {};
                if(options.selectedItems !== undefined)$.extend(selectedItems,options.selectedItems);
                el.data('selectedItems',selectedItems);
                //доп. параметры, которые передаются в запрос в <data>
                if(options.addParams !== undefined)
                    el.data('addParams',options.addParams);
		        el.data('showLoader',options.showLoader === true);

                if(options.addText !== undefined)el.data('addtext','<div class="divTextFilter">'+options.addText+'</div>');
                else el.data('addtext','');
                if(options.dataSource !== undefined){
                    var getUserTasksParams = {
                        descrId: 'SYS_SEM.xml#GET_XML_FILE',
                        descrType: 'select',
                        data:'<root ><data FILE="../../Public/Modules/Form/'+options.dataSource+'.mxml"/></root>'
                    };
                    methods.serverQueryXmlFileNode(Services.processQueryNodeXml, getUserTasksParams,
                        methods.parseTopFilter,{el:el,divFilters:el});
                }
                if(options.dataXML !== undefined) {
                    var xmlData = $.parseXML(options.dataXML);
                    $(xmlData).children().each(function(){methods.parseTopFilter($(this),{el:el,divFilters:el});});
                }
            });
        },
        serverQueryXmlFileNode:function(url,params,callbackResult,thisObject) {
            if(thisObject.divFilters === undefined)
                methods.callbackError({text:gis_filters_1});
            App.serverQueryXmlFileNodeWithTries(url, params, function(data){
                var er = HTTPServiceUtil.getError(data);
                if (er !== ''){
                    if(params.descrId !== 'none')//случай, если не фейковый запрос фильтра fake_filter. Используется в гридах, где нет справочных колонок
                        methods.callbackError({
                            text: gis_core_error_1 + '. ' + params.data + '.filter_serverQueryXmlFileNode success error. ' + data + '. ',
                            divFilters: thisObject.divFilters
                        });
                    return;
                }
                try{
                        var xmlData = $.parseXML(data);
                        $(xmlData).children().each(function(){callbackResult($(this),thisObject);});
                    }catch(ex){
                        methods.callbackError({text:gis_core_error_1 + '. ' + params.data + '. filter_serverQueryXmlFileNode. success. '+ex.message,divFilters:thisObject.divFilters});}
                }, function(data){
                        methods.callbackError({
                            text: gis_core_error_1 + '. ' + params.data + '.filter_serverQueryXmlFileNode. ' + data + '. ',
                            divFilters: thisObject.divFilters
                        });
                    },undefined);
                },
        serverQueryXML1:function(url,params,callbackResult,thisObject) {
             url = App.formatNodeServiceUrl(url);
            if(thisObject.divFilters === undefined)
                methods.callbackError({text:gis_filters_1});
            BlockingUtil.wait();
            App.serverQueryXmlFileNodeWithTries(url, params, function(data){
                BlockingUtil.ready();
                var er = HTTPServiceUtil.getError(data);
                if (er !== ''){
                    if(params.descrId !== 'none')//случай, если не фейковый запрос фильтра fake_filter. Используется в гридах, где нет справочных колонок
                        methods.callbackError({
                            text: gis_core_error_1 + '. ' + params.data + '.filter_serverQueryXML1 success error. ' + data + '. ',
                            divFilters: thisObject.divFilters
                        });
                    return;
                }
                try{
                    //var layerGeoXml = ($.parseXML(data)).firstChild;
                    //var datas = layerGeoXml.getElementsByTagName("root");
                    var datas = $($.parseXML(data)).find("root");
                    callbackResult($(datas),thisObject);
                }
                catch(ex){
                    if(ex.message.indexOf('Invalid jQuery Selector') === -1){//если не ошибка поиска селектора(закрыли панель раньше прихода данных)
                        if(params.descrId !== 'none')//случай, если не фейковый запрос фильтра fake_filter. Используется в гридах, где нет справочных колонок
                            methods.callbackError({text:gis_core_error_1+ '. request:' + params.data + '.filter_serverQueryXML1. success. catch:' + ex.message+'; response:'+data, divFilters:thisObject.divFilters});
                    }
                }
            }, function(data){
                BlockingUtil.ready();
                if(params.descrId !== 'none')//случай, если не фейковый запрос фильтра fake_filter. Используется в гридах, где нет справочных колонок
                    methods.callbackError({
                        text: gis_core_error_1 + '. ' + params.data + '.filter_serverQueryXML1. fail' + data + '. ',
                        divFilters: thisObject.divFilters
                    });
            }, undefined);
        },
        callbackError: function(params){
            var el = params.divFilters.data('handlers');
            var loading = params.divFilters.data('loading');
            if(loading !== undefined)
	            params.divFilters.data('loading', false);
	        if(params.parentParams !== undefined && params.parentParams.showLoader === true)
		        BlockingUtil.ready();
            if(el && el.errorHandler !== undefined)
                el.errorHandler(params);
            else{
                App.errorReport(gis_core_error_1, params.text, undefined, {filename:gis_filename_569, functionname:'gis_filename_569_1'});
            }
            /*else
                alert(params.text);*/
        },
        parseTopFilter: function(xmlElement,divObject){
            switch(xmlElement[0].tagName){
                case 'mx:VBox':xmlElement.children().each(function(){methods.parseTopFilter($(this),divObject.el);});break;
                case 'components:FilterPopUpButton':
                    var addTitle = '(0)',
                        checkDefault = false,
                        isDropDown = true,
                        maxCnt = '-1',
                        minCnt = 1,
                        dataProvider = '',
                        idElement = 'w'+methods.getUniqueId()+'_'+xmlElement.attr('id'),
                        addText = divObject.data('addtext');
                    if(xmlElement.attr('maxCnt') !== undefined)maxCnt=xmlElement.attr('maxCnt');
                    if(xmlElement.attr('minCnt') !== undefined)minCnt=xmlElement.attr('minCnt');
                    if(xmlElement.attr('isDropDown') !== undefined)isDropDown = xmlElement.attr('isDropDown') == 'true';
                    if(xmlElement.attr('dataProvider') !== undefined)dataProvider = xmlElement.attr('dataProvider');
                    if((xmlElement.attr('selectAllElements') === undefined)||(xmlElement.attr('selectAllElements') == 'true')){
                        addTitle = gis_filters_3;
                        checkDefault = true;
                    }
                    else{
                        if(maxCnt != '-1')addTitle = gis_filters_4+maxCnt+')';
                    }
                    if((divObject.data('fromTree') || divObject.data('infinite')) && dataProvider){
                        FilterSourceDataManager[dataProvider] = {
                            selectAllElements: checkDefault
                        };
                    }
                    if((addText == '')&&(maxCnt != '-1')){
                        if(isDropDown == false)
                            addText = '<div class="divTextMiddleFilter" style="display:inline;position:absolute">Убедитесь, что количество выбранных элементов не превышает '+maxCnt+'</div>';
                        else
                            addText = '<div class="divTextFilter" style="display:inline;">Убедитесь, что количество выбранных элементов не превышает '+maxCnt+'</div>';
                    }
	                var datapreopen = '';
                    if(divObject.data('handlers')!==undefined && divObject.data('handlers').checkHeadRadioHandler !==undefined){
                        var vars = {};
                        vars.maxCnt = maxCnt;
                        vars.dataProvider = dataProvider;
                        vars.title = xmlElement.attr('title');
                        vars.variableName = xmlElement.attr('id');
                        if(divObject.data('scenarioVars') !== undefined)$.extend(vars,divObject.data('scenarioVars'));
                        var result = {vars:vars};
                        //костыль. чтобы не вызывался сценарий повторно при след парсинге
                        if(divObject.data('isHeadRadio') != true)
                            divObject.data('handlers').checkHeadRadioHandler(result);
                        divObject.data('isHeadRadio',true);
	                    datapreopen = 'data-preopen="'+divObject.data('preopen')+'"';
                    }
                    var filterDiv = '';
                    var isInfinite = divObject.data('infinite');
                    var fromTreeClass = (divObject.data('fromTree'))?'treeFilter':'';
                    var hideButtons = divObject.data('hideButtons');
                    var hideCancel = 'inline-block', hideApply = 'inline-block';
                    if (hideButtons) {
                        if (hideButtons.indexOf('cancel') !== -1)
                            hideCancel = 'none';
                        else if (hideButtons.indexOf('apply') !== -1)
                            hideApply = 'none';
                    }
                    var lightWeightButton = '';

                    if(!isDropDown) {
                        filterDiv = $('<div id="'+idElement+'" class="divFilter '+xmlElement.attr('id')+'" '+datapreopen+' data-filterid="'+ xmlElement.attr('id')+'" data-title="'+ xmlElement.attr('title')+'" data-dataprovider="'+dataProvider+'" data-getdata=true data-maxcnt='+maxCnt+' data-mincnt='+minCnt+' data-isdropdown='+isDropDown+'>\
                           <div>'+xmlElement.attr('title')+addTitle+'</div>\
                           <div>\
                            <div class="divFilterContent">\
                             <input type="text" id="'+idElement+'_input" data-lastvalue="" class="iFilterSearch"/>\
                             <div id="'+idElement+'_listCheckBoxes" data-checkdefault='+checkDefault+' class="divListCheckBoxes"></div>\
                             <div style="height: 35px;">\
                              <div class="divCheckAllMiddle">\
                               <div id="'+idElement+'_checkAll" class="myCheckBox" data-recalc=1 style="display:inline;"> </div>\
                              </div>\
                              <div class="myCheckBoxMiddle" style="display:inline">Выбрать все</div>\
                              <input type="button" value="Применить" id="'+idElement+'_apply" class="myButton filterButton" style="display: '+hideApply+';"/>\
                              <input type="button" value="Отмена" id="'+idElement+'_cancel" class="myButton filterButton" style="display: '+hideCancel+';"/>'+addText+'\
                             </div>\
                            </div>\
                           </div>\
                          </div>');
                    }
                    else {
                        filterDiv = $('<div id="'+idElement+'" class="divFilter '+xmlElement.attr('id')+'" '+datapreopen+' data-filterid="'+ xmlElement.attr('id')+'" data-title="'+ xmlElement.attr('title')+'" data-dataprovider="'+dataProvider+'" data-getdata=true data-maxcnt='+maxCnt+' data-mincnt='+minCnt+' data-isdropdown='+isDropDown+'>\
                           <div>'+xmlElement.attr('title')+addTitle+'</div>\
                           <div>\
                            <div class="divFilterContent '+fromTreeClass+'">\
                             <input type="text" id="'+idElement+'_input" data-lastvalue="" class="iFilterSearch"/>\
                             <div id="'+idElement+'_listCheckBoxes" data-checkdefault='+checkDefault+' class="divListCheckBoxes"></div>\
                             <div>\
                              <div class="divCheckAll">\
                               <div id="'+idElement+'_checkAll" class="myCheckBox" data-recalc=1>Выбрать все</div>\
                              </div>\
                              <input type="button" value="Применить" id="'+idElement+'_apply" class="myButton filterButton"/>\
                              <input type="button" value="Отмена" id="'+idElement+'_cancel" class="myButton filterButton"/>\
                             </div>'+addText+'\
                            </div>\
                           </div>\
                          </div>');
                    }
                    divObject.append(filterDiv);
                    if(isInfinite){
                        lightWeightButton = '<div style="padding-bottom: 3px;">' +
                                '<div  id="'+idElement+'_lightweightcombo" class="divFilter__fake jqx-widget-header">' +
                                xmlElement.attr('title') + addTitle +
                                '</div>' +
                                '<div id="'+idElement+'_lightweight" class="divFilter__fake-button" ></div>' +
                            '</div>';
                        divObject.append(lightWeightButton);
                    }
                    $('#'+idElement+'_apply').jqxButton({disabled:true}).on('click',function(){
                        var successApply = true;
                        if(filterDiv.data('isdropdown')){
                            //устанавливаем флаг, что именно после этой кнопки надо применять фильтр
                            filterDiv.parent().data('needApply',true);
                            filterDiv.jqxExpander('collapse');
                        }
                        else{
                            //если средний фильтр, то перед выполнением функции applyHandler сначала применяем его, чтобы корректно getSelectedItems вызывался
                            successApply = methods.applyFilter({idFilter:idElement,filterDiv:filterDiv});
                        }
                        if(successApply !== false){
                            var handlers = filterDiv.parent().data('handlers');
                            if(handlers.applyHandler !== undefined)handlers.applyHandler(filterDiv.parent());
                        }
                    });
                    $('#'+idElement+'_cancel').jqxButton({disabled:false}).on('click',function(){
                        methods.cancelEditFilter({idFilter:idElement,filterDiv:filterDiv});
                        if(filterDiv.data('isdropdown')){
                            filterDiv.parent().data('needApply',true);
                            filterDiv.jqxExpander('collapse');
                        }
                        var handlers = filterDiv.parent().data('handlers');
                        if(handlers.cancelHandler !== undefined)
                            handlers.cancelHandler(filterDiv.parent());
                    });
                    $('#'+idElement+'_checkAll').jqxCheckBox({rtl:true,checked:checkDefault,disabled:true,theme:''})
                        .on('checked',function(event){
                            methods.filterCheckAll({event:event,idElement:idElement,checkBoxAll:$(this)});
                        })
                        .on('unchecked',function(event){
                            methods.filterCheckAll({event:event,idElement:idElement,checkBoxAll:$(this)});
                        });
                    $('#'+idElement+'_input').jqxInput({placeHolder: gis_filters_5,width: '100%',disabled:true,theme:'myCommon'})
                        .keyup(function(event){
                            //16-shift, 17-ctrl, 8-backspace, 46-del
                            if((event.keyCode!=16 && event.keyCode!=17 && event.keyCode!=18))
                                methods.inputSearchCheckBoxes({input:$(this),idFilter:idElement});
                    });
                    var addParams = filterDiv.parent().data('addParams');
                    var showLoader = filterDiv.parent().data('showLoader');
                    methods.loadFilterContent({showLoader:showLoader, filterDiv:filterDiv,xmlElement:xmlElement,addParams:addParams});

                    var expParams = {width: '100%',expanded: !isDropDown,theme:'myCommon'};

                    if(isInfinite){
                        $.extend(expParams,{disabled:true,width:'95%', showArrow:false})
                        $('#'+idElement+'_lightweight').on('click',function() {
                            FilterUtil.showLightWeightFilter({
                                filterId: idElement,
                                requestId: filterDiv.parent().data('requestId'),
                            });
                        });
                        $('#'+idElement+'_lightweightcombo').on('click',function() {
                            FilterUtil.showLightWeightFilter({
                                filterId: idElement,
                                requestId: filterDiv.parent().data('requestId'),
                            });
                        });
                        //filterDiv.css('display','inline-block');
                        filterDiv.css('display','none');
                    }
                    if(!isDropDown)$.extend(expParams,{expandAnimationDuration:0,collapseAnimationDuration:0, showArrow:false});
                    filterDiv.jqxExpander(expParams).on('expanding',function(){
                        //раскрывая один фильтр, прячем остальные
                        $('.divFilter').each(
                            function(){
                                var el = $(this);
                                if(el.jqxExpander('expanded'))
                                    el.jqxExpander('collapse');
                            });
                        //Вызываем callback при сворачивании/разворачивании списка
                        var handlers = filterDiv.parent().data('handlers');
                        if(handlers.dropDownOpenCallback != undefined)
                            handlers.dropDownOpenCallback({filterDiv:filterDiv, expanded:true});

                    }).on('collapsed',function(){
                        if(!filterDiv.data('isdropdown'))filterDiv.jqxExpander('expand');
                        else {
                            if(filterDiv.parent().data('needApply') == true)
                                methods.applyFilter({idFilter:idElement,filterDiv:filterDiv});
                            else
                                methods.cancelEditFilter({idFilter:idElement,filterDiv:filterDiv});
                            filterDiv.parent().data('needApply',false);
                            //Вызываем callback при сворачивании/разворачивании списка
                            var handlers = filterDiv.parent().data('handlers');
                            if(handlers.dropDownOpenCallback != undefined)
                                handlers.dropDownOpenCallback({filterDiv:filterDiv, expanded:false});
                        }
                    });
                    //if(!isDropDown)$('#'+idElement+' .jqx-expander-header').addClass('noVisible');
                    break;
            }
        },
        filterCheckAll:function(params){
            if(params.checkBoxAll.data('skip') == true){
                params.checkBoxAll.data('skip',false);
                return;
            }

            //TODO пописать удаление из checked в эдит боксе
            var list = $('#'+params.idElement+'_listCheckBoxes');
            $('#'+params.idElement+'_input').data('lastchecked',list.data('lastchecked').slice());
            if(params.checkBoxAll.data('recalc') == 1){
                var funcName = 'clearSelection';
                var allitems = list.data('currentCodes');//забираем текущие коды
                var lastchecked =  $('#'+params.idElement+'_input').data('lastchecked');
                if(params.event.type =='checked'){
                    lastchecked = allitems;
                    funcName = 'checkAll';
                }
                else{
                    lastchecked = [];
                    funcName = 'uncheckAll';
                }
                $('#'+params.idElement+'_input').data('lastchecked',lastchecked);
                //сначала отписываемся, чтобы установить все, а затем опять подписываемся на события
                if(list.length != 0){
                    list.data('isSingle',false);
                    list.data('recalc',0).data('applyfilter',false).jqxListBox(funcName);
                    list.data('isSingle',true);
                }
                methods.recalcFilterView({idFilter:params.idElement,recalcAll:false,fromSelectAll:true});
            }
            else
                params.checkBoxAll.data('recalc',1);

        },
        parseTopFilterContent: function(xmlElement,params){
        	//устанавливаем флаг, что загрузка данных завершгена
	        var filterDiv = params.divObject.parent().data('loading');
	        if(filterDiv !== undefined)
		        params.divObject.parent().data('loading',false);
            var isInfinite = params.divObject.parent().data('infinite');
            if(isInfinite){
                var handlers = params.divObject.parent().data('handlers');
                var requestId = params.divObject.parent().data('requestId');
                if(handlers.infiniteCallback != undefined)
                    handlers.infiniteCallback(xmlElement, requestId);
                return;
            }
            switch(xmlElement[0].tagName){
                case 'root':
                    var childrenLen = xmlElement.children().length;
                    var idFilter = params.divObject.attr('id');
                    var resArr = [];
                    if(childrenLen != 0){//TODO добавить проверку на существование $('#'+idFilter+'_listCheckBoxes'), когдп пришел результат(например, закрыли форму)
                        var divListCheckBoxes = $('#'+idFilter+'_listCheckBoxes'),
                            maxCnt = params.divObject.data('maxcnt'),
                            checked = divListCheckBoxes.data('checkdefault');
                        divListCheckBoxes.addClass('divListCheckBoxes');
                        var resStrArr = [];//массив из строковых кодов
                        var filters = params.divObject.data('slicefilters');

                        if(filters !== undefined && filters !== ''){
                            var ids = filters.split(',');
                            xmlElement.children().each(function(index){
                                //Проверяем есть ли в полученном объекте и CODE и DESCR - и только если есть оба поля, добавляем в список (аналогично флешовому QueryDataProvider)
                                var curCode = $(this).attr('CODE');
                                var curDescr = $(this).attr('DESCR');
                                //#1943 upd. Еслди не пришло descr, то заполняем его ''
	                            if(curDescr === undefined)curDescr = '';
                                if (curCode !== undefined && curDescr !== undefined) {
                                    var j = 0;
                                    for(; j<=ids.length-1; j++){
                                        if(ids[j] === curCode){
                                            resArr.push({CODE:curCode,DESCR:curDescr});
                                            resStrArr.push(curCode);
                                            break;
                                        }
                                    }
                                }
                            });
                        }
                        else{
                            xmlElement.children().each(function(index){
                                //Проверяем есть ли в полученном объекте и CODE и DESCR - и только если есть оба поля, добавляем в список (аналогично флешовому QueryDataProvider)
                                var curCode = $(this).attr('CODE');
                                var curDescr = $(this).attr('DESCR');
	                            //#1943 upd. Еслди не пришло descr, то заполняем его ''
	                            if(curDescr === undefined)curDescr = '';
                                if (curCode !== undefined && curDescr !== undefined) {
                                    resArr.push({CODE:curCode,DESCR:curDescr});
                                    if(maxCnt == -1)
                                        resStrArr.push(curCode);
                                }
                            });
                        }

                        divListCheckBoxes.jqxListBox({ source: resArr,checkboxes: true, itemHeight:21,
                            displayMember: "DESCR", valueMember: "CODE",width:'100%',height:'100%',
                            theme:'filter',
                            renderer: function (index, label, value) {
                                var table = '<div class="spFilterIndex">['+(index+1)+']</div><span class="spDescr">'+label+'</span></div>';
                                return table;
                            }
                        });
                        divListCheckBoxes.data('allCodes',resStrArr.slice()).data('currentCodes',resStrArr.slice());
                        $('#'+idFilter+'_input').data('lastchecked',resStrArr.slice());//сохраняем все текущие коды
                        divListCheckBoxes.data('lastchecked',resStrArr.slice());
                        if(checked){
                            divListCheckBoxes.data('applyfilter',true);
                            divListCheckBoxes.jqxListBox('checkAll');
                        }
                        else{
                            $('#'+idFilter+'_input').data('lastchecked',[]);//сохраняем все текущие коды
                            divListCheckBoxes.data('lastchecked',[]);
                        }
                        divListCheckBoxes.data('items',resArr);
                        divListCheckBoxes.data('checkedItems',divListCheckBoxes.jqxListBox('getCheckedItems'));
                        divListCheckBoxes.data('isSingle',true);
                        divListCheckBoxes.on('checkChange', function (event) {
                            if(divListCheckBoxes.data('isSingle') == true){
                                //$('#'+idFilter+'_input').data('lastchecked',divListCheckBoxes.jqxListBox('getCheckedItems'));
                                if(event.args != undefined && event.args){
                                    var lastchecked = $('#'+idFilter+'_input').data('lastchecked');
                                    if(event.args.checked == true){
                                        var index = lastchecked.indexOf(event.args.value);
                                        if(index==-1)
                                            lastchecked.push(event.args.value);
                                    }
                                    else{
                                        var index = lastchecked.indexOf(event.args.value);
                                        if(index!=-1)
                                            lastchecked.splice(index, 1);
                                    }
                                    $('#'+idFilter+'_input').data('lastchecked',lastchecked);
                                }
                                methods.recalcFilterView({idFilter:idFilter,recalcAll:false});
                                //если выбрали все, выставляем чекбокс
                                if(divListCheckBoxes.jqxListBox('getCheckedItems').length ==  divListCheckBoxes.data('items').length) {
                                    $('#' + idFilter + '_checkAll').data('skip', true);
                                    $('#' + idFilter + '_checkAll').jqxCheckBox('check');
                                }
                                else{
                                    //и снимаем checked
                                    $('#'+idFilter+'_checkAll').data('skip',true);
                                    $('#'+idFilter+'_checkAll').jqxCheckBox('uncheck');
                                }
                                divListCheckBoxes.data('applyfilter',false);
                            }
                        });
                        //var filters = params.divObject.data('slicefilters');
                        //if(filters != undefined)
                        //    methods.setTopFilterSlice({objIds:filters,id: idFilter});
                        filters = params.divObject.data('filters');
                        if(filters !== undefined)
                            methods.setTopFilterValues({objIds:filters,id: idFilter});
                        if((maxCnt != -1)&&(checked == true)&&(maxCnt < childrenLen)){
                            var textTitle = params.divObject.jqxExpander('getHeaderContent').split('(');
                            params.divObject.jqxExpander('setHeaderContent',textTitle[0]+'('+childrenLen+gis_filters_6+maxCnt+')');
                            params.divObject.addClass('divBadFilter');
                        }
                    }

                    //вызов колбек функц
                    var selectedItems = params.divObject.parent().data('selectedItems');
                    //забираем название поля
                    var dataField = idFilter.substr(idFilter.indexOf('_')+1);
                    if(selectedItems != undefined && selectedItems[dataField] != undefined && selectedItems[dataField].lastSelected != undefined){
                        var filterArr = [];
                        for(var i=0; i<selectedItems[dataField].lastSelected.length;i++){
                            filterArr.push(selectedItems[dataField].lastSelected[i].CODE);
                        }
                        var filterStr = filterArr.join(',');
                        methods.setTopFilterValues({objIds:filterStr,id: idFilter});
                    }
                    params.divObject.data('getdata',false);
                    if(resArr.length > 0){
                        $('#'+idFilter+'_apply').jqxButton({disabled:false});
                        $('#'+idFilter+'_checkAll').jqxCheckBox({disabled:false,theme:'myCommon'});
                    }
                    $('#'+idFilter+'_cancel').jqxButton({disabled:false});
                    $('#'+idFilter+'_input').jqxInput({disabled:false,theme:'myCommon'});
                    break;
            }
        },
        parseLpuFilterContent: function(params){
            //устанавливаем флаг, что загрузка данных завершгена
            var filterDiv = params.divObject.parent().data('loading');
            if(filterDiv !== undefined)
                params.divObject.parent().data('loading',false);
            var idFilter = params.divObject.attr('id');
            var divListCheckBoxes = $('#'+idFilter+'_listCheckBoxes'),
                checked = divListCheckBoxes.data('checkdefault');
            divListCheckBoxes.addClass('divListCheckBoxes');
            var resArr = [];
            var resStrArr = [];//массив из строковых кодов

            params.lpuValues.forEach(function(item){
                resArr.push(item);
                resStrArr.push(item.CODE);
            });
            params.divObject.data('codetype',undefined);
            divListCheckBoxes.jqxListBox({ source: resArr,checkboxes: true, itemHeight:21,
                displayMember: "DESCR", valueMember: "CODE",width:'100%',height:'100%',
                theme:'filter',
                renderer: function (index, label, value) {
                    var table = '<div class="spFilterIndex">['+(index+1)+']</div><span class="spDescr">'+label+'</span></div>';
                    return table;
                }
            });
            divListCheckBoxes.data('allCodes',resStrArr.slice()).data('currentCodes',resStrArr.slice());
            $('#'+idFilter+'_input').data('lastchecked',resStrArr.slice());//сохраняем все текущие коды
            divListCheckBoxes.data('lastchecked',resStrArr.slice());
            if(checked){
                divListCheckBoxes.data('applyfilter',true);
                divListCheckBoxes.jqxListBox('checkAll');
            }
            divListCheckBoxes.data('items',resArr);
            divListCheckBoxes.data('checkedItems',divListCheckBoxes.jqxListBox('getCheckedItems'));
            divListCheckBoxes.data('isSingle',true);
            divListCheckBoxes.on('checkChange', function (event) {
                if(divListCheckBoxes.data('isSingle') == true){
                    //$('#'+idFilter+'_input').data('lastchecked',divListCheckBoxes.jqxListBox('getCheckedItems'));
                    if(event.args != undefined && event.args){
                        var lastchecked = $('#'+idFilter+'_input').data('lastchecked');
                        if(event.args.checked == true){
                            var index = lastchecked.indexOf(event.args.value);
                            if(index==-1)
                                lastchecked.push(event.args.value);

                        }
                        else{
                            var index = lastchecked.indexOf(event.args.value);
                            if(index!=-1)
                                lastchecked.splice(index, 1);
                        }
                        $('#'+idFilter+'_input').data('lastchecked',lastchecked);
                    }

                    methods.recalcFilterView({idFilter:idFilter,recalcAll:false});
                    //если выбрали все, выставляем чекбокс
                    if(divListCheckBoxes.jqxListBox('getCheckedItems').length ==  divListCheckBoxes.data('items').length) {
                        $('#' + idFilter + '_checkAll').data('skip', true);
                        $('#' + idFilter + '_checkAll').jqxCheckBox('check');
                    }
                    else{
                        //и снимаем checked
                        $('#'+idFilter+'_checkAll').data('skip',true);
                        $('#'+idFilter+'_checkAll').jqxCheckBox('uncheck');
                    }
                    divListCheckBoxes.data('applyfilter',false);
                }
            });

            //вызов колбек функц
            var selectedItems = params.divObject.parent().data('selectedItems');
            //забираем название поля
            var dataField = idFilter.substr(idFilter.indexOf('_')+1);
            if(selectedItems != undefined && selectedItems[dataField] != undefined && selectedItems[dataField].lastSelected != undefined){
                var filterArr = [];
                for(var i=0; i<selectedItems[dataField].lastSelected.length;i++){
                    filterArr.push(selectedItems[dataField].lastSelected[i].CODE);
                }
                var filterStr = filterArr.join(',');
                methods.setTopFilterValues({objIds:filterStr,id: idFilter});
            }
            params.divObject.data('getdata',false);
            $('#'+idFilter+'_apply').jqxButton({disabled:false});
            $('#'+idFilter+'_cancel').jqxButton({disabled:false});
            $('#'+idFilter+'_checkAll').jqxCheckBox({disabled:false,theme:'myCommon'});
            $('#'+idFilter+'_input').jqxInput({disabled:false,theme:'myCommon'});
        },
        loadFilterContent:function(params){
            //грузим контент фильтра
            var userId = AbstractFormDialog.sendUser ? '' + Auth.getUserId() : '-1';
            var userLogin = AbstractFormDialog.sendUser ? '' + Auth.getUserName() : 'guest';
            var dataStr = '<data/>';
            if(params.addParams!== undefined)
                dataStr = params.addParams;
            //ХАРДКОД. Если фильтр ЛПУ, то забираем его из того, что пришло после PRELOAD.xml
            if(WidgetMap && WidgetMap.preloadLpuValues !== undefined && params.xmlElement.attr('id') === 'LPU_ACCESS_FILTER'){
                methods.parseLpuFilterContent({
                    lpuValues: WidgetMap.preloadLpuValues,
                    divObject: params.filterDiv,
                    divFilters: $('#' + params.filterDiv.attr('id').split('_')[0] + '_tree')
                })
            }
            else{
                //upd.16.04.21 принято решениие для ЭХЗ убрать лоадер. Если будет неудобно - вернуть
                /*if(params.showLoader === true)
                    BlockingUtil.wait();*/
                //TDDO хардкод. Убрать! для задачи су тс тпа нужно подгружать справочники через запрос process-xml
                var serviceName = Services.processQueryNode;
                methods.serverQueryXML1(serviceName,
                    {showLoader:params.showLoader,
                        descrId:params.xmlElement.attr('dataProvider'),
                        descrType:'select',
                        getSchema:true,
                        toElements:false,
                        data:'<root USER_ID="'+userId.xmlEscape()+
                            '" USER_LOGIN="'+userLogin.xmlEscape()+
                            '" PODS_USER="'+userLogin.xmlEscape()+'" >'+
                            dataStr +
                            '</root>'},
                    methods.parseTopFilterContent,{divObject: params.filterDiv,
                        divFilters: $('#'+params.filterDiv.attr('id').split('_')[0]+'_tree')});

            }
        },
        inputSearchCheckBoxes:function(params){
            var value = params.input.val().toLowerCase(),
                oldvalue = params.input.data('lastvalue'),
                listBox = $('#'+params.idFilter+'_listCheckBoxes'),
                lstCheckBoxes = listBox.jqxListBox('getItems'),
                newChecked = listBox.jqxListBox('getCheckedItems');

            var items = listBox.data('items');
            var lstChecked = [];
            if(items.length != newChecked.length){
                lstChecked = newChecked;
            }
            else{
                params.input.data('lastchecked',[]);
            }
            if(oldvalue == value && value == ''){
                return;
            }
            var lastchecked = params.input.data('lastchecked');
            params.input.data('lastvalue',value);
            var newArr = [];

            //listBox.jqxListBox('findItems','АГРС')
            if(value != ''){
                listBox.jqxListBox('clear');
                var currCodes = [];
                for(var i in items){
                    if(items[i].DESCR.toLowerCase().indexOf(value) != -1){
                        newArr.push(items[i]);
                        currCodes.push(items[i].CODE);
                    }
                }

                listBox.jqxListBox({source:newArr});
                listBox.data('currentCodes',currCodes);
                if(lastchecked.length>0){//если были выбраны с прошлого поиска, то их применяем
                    for(var a = 0; a <= newArr.length-1; a++ ){
                        for(var i=0; i <= lastchecked.length-1; i++){
                            if(lastchecked[i] == newArr[a].CODE)
                                listBox.jqxListBox('checkIndex', a );
                        }
                    }
                }
                methods.recalcFilterView({idFilter:params.idFilter,recalcAll:false, fromSearch:true});
            }
            else{
                listBox.jqxListBox({source:items});
                listBox.data('currentCodes',listBox.data('allCodes'));
                if(lstChecked.length>0){
                    for(var a = 0; a <= items.length-1; a++ ){
                        for(var i=0; i <= lastchecked.length-1; i++){
                            if(lastchecked[i] == items[a].CODE)
                                listBox.jqxListBox('checkIndex', a );
                        }
                    }
                }
                else{
                    methods.recalcFilterView({idFilter:params.idFilter,recalcAll:false, fromSearch:true});
                    if(lstChecked.length == 0)
                        methods.cancelEditFilter(params);
                }
            }
            if(listBox.data('currentCodes').length ==  listBox.data('allCodes').length)
                $('#'+params.idFilter+'_checkAll').jqxCheckBox('enable');
            else{
                $('#'+params.idFilter+'_checkAll').jqxCheckBox('disable');
                //и снимаем checked
                $('#'+params.idFilter+'_checkAll').data('skip',true);
                $('#'+params.idFilter+'_checkAll').jqxCheckBox('uncheck');
            }
        },
        cancelEditFilter:function(params){
            var list = $('#'+params.idFilter+'_listCheckBoxes');
            list.data('recalc',0);
            var checkedItems = list.data('lastchecked');
            var items = list.data('items');
            //раздизейбливаем чекбокс "выбрать все"
            $('#'+params.idFilter+'_checkAll').jqxCheckBox('enable');
            list.data('applyfilter',true);
            if(items && items.length < 500)
                list.jqxListBox({source:items});
            list.data('isSingle',false);
            var currentCodes = [];
            var ii=0;
            //если изначально список пустой
            if(items != undefined){
                for(; ii<=items.length-1; ii++){
                    currentCodes.push(items[ii].CODE);
                }
                if(items.length < 500){
                    for(var a = 0; a<=checkedItems.length-1; a++ ){
                        for(var i=0; i<=items.length-1; i++){
                            if(items[i].CODE == checkedItems[a])
                                list.jqxListBox('checkIndex', i );
                        }
                    }
                }

            }
            list.data('currentCodes',currentCodes);
            list.data('isSingle',true);
            $('#'+params.idFilter+'_input').val('');
            methods.recalcFilterView({idFilter:params.idFilter,recalcAll:false,fromCancel:true});
            if((list.data('lastchecked') != undefined && list.data('lastchecked').length ==  list.data('allCodes').length) && list.data('lastchecked').length!=0)
                $('#'+params.idFilter+'_checkAll').data('recalc',0).jqxCheckBox('check');
            else
                $('#'+params.idFilter+'_checkAll').data('recalc',0).jqxCheckBox('uncheck');
        },
        applyFilter:function(params){
            if($('#'+params.idFilter+'_apply').jqxButton('disabled')) return ;
            if($('#'+params.idFilter).hasClass('divBadFilter')){
                methods.cancelEditFilter(params);
                methods.recalcFilterView({idFilter:params.idFilter,recalcAll:true});
                return ;
            }
            var list = $('#'+params.idFilter+'_listCheckBoxes');
            var items = list.data('items');
            //раздизейбливаем чекбокс "выбрать все"
            $('#'+params.idFilter+'_checkAll').jqxCheckBox('enable');
            var checkedItems = $('#'+params.idFilter+'_input').data('lastchecked');//list.data('lastchecked');//list.jqxListBox('getCheckedItems');

            list.data('checkedItems',checkedItems).data('applyfilter',true);
            if(items && items.length < 500)
                list.jqxListBox({source:items});
            list.data('isSingle',false);
            var currentCodes = [];
            var ii=0;
            if(items != undefined){
	            for(; ii<=items.length-1; ii++){
		            currentCodes.push(items[ii].CODE);
	            }
                var lastchecked = [];
                if(items.length < 500) {
                    for (var a = 0; a <= checkedItems.length - 1; a++) {
                        for (var i = 0; i <= items.length - 1; i++) {
                            if (items[i].CODE == checkedItems[a]) {
                                list.jqxListBox('checkIndex', i);
                                lastchecked.push(items[i].CODE);
                            }
                        }
                    }
                }
                else
                    lastchecked = checkedItems;
			}
            if(lastchecked != undefined){
	            $('#'+params.idFilter+'_input').data('lastchecked',lastchecked.slice());
	            list.data('lastchecked',lastchecked.slice());
            }

            //('#'+params.idFilter+'_checkAll').data('recalc',1);
            //возвращаем после применения все элементы, как текущие коды
            list.data('currentCodes',currentCodes);
            $('#'+params.idFilter+'_input').val('');
            list.data('isSingle',true);
            if(checkedItems.length === 0 ) return false;
        },
        recalcFilterView:function(params){
            var divFilter = $('#'+params.idFilter),
                title = divFilter.jqxExpander('getHeaderContent').split('('),
                listBox = $('#'+params.idFilter+'_listCheckBoxes'),
                input = $('#'+params.idFilter+'_input').data('lastchecked'),
                cntChecked = (listBox.jqxListBox('getCheckedItems') != undefined)?listBox.jqxListBox('getCheckedItems').length:0,
                listCheckBoxes = listBox.jqxListBox('getItems'),
                listLastChecked = listBox.data('lastchecked'),
                allCodes = (listBox.data('allCodes') != undefined)?listBox.data('allCodes'):[],
                fromSearch = params.fromSearch,//если пришел запрас на пересчет из поля текстового
                fromCancel = params.fromCancel,
                fromSelectAll = params.fromSelectAll,//от кнопки "отмена"
                maxCnt = divFilter.data('maxcnt'),
                minCnt = divFilter.data('mincnt'),
                addTitle = '';
            if(fromCancel == true && listLastChecked!=undefined)
                cntChecked = listLastChecked.length;
            else if(fromSelectAll == true){
                cntChecked = cntChecked;
            }
            else{
                //если в списке все записи
                if(listBox.data('items') != undefined && listCheckBoxes.length != listBox.data('items').length)
                    cntChecked = input.length;
            }

            //if(fromSearch == true && input != undefined){

            //}
            if(params.addCheck != undefined)cntChecked=cntChecked+params.addCheck;
            if((cntChecked < minCnt)&(params.recalcAll == true)){
                cntChecked = listCheckBoxes.length;
                if(listCheckBoxes.length != 0)listCheckBoxes/*.data('recalc',0)*/.data('applyfilter',true);//.jqxCheckBox('check');
            }
            if(cntChecked == allCodes.length){
                addTitle = gis_filters_3;
                if(maxCnt != 1 && maxCnt != -1)addTitle='('+cntChecked+gis_filters_6+maxCnt+')';
                //$('#'+params.idFilter+'_checkAll').data('recalc',0);//.jqxCheckBox('check');
            }
            else{
                if(maxCnt != 1 && maxCnt != -1)addTitle='('+cntChecked+gis_filters_6+maxCnt+')';
                else addTitle = '('+cntChecked+')';
                //$('#'+params.idFilter+'_checkAll').data('recalc',0);//.jqxCheckBox('uncheck');
            }
            if(((maxCnt != -1)&&((cntChecked>maxCnt)||(cntChecked<minCnt)))){
                divFilter.addClass('divBadFilter');
                addTitle='('+cntChecked+gis_filters_6+maxCnt+')';
                $('#'+params.idFilter+'_apply').jqxButton({disabled: true});
                //if(!divFilter.data('isdropdown'))$('#'+params.idFilter+' .jqx-expander-header').removeClass('noVisible');
            }
            else if(((maxCnt == -1)&&((cntChecked>maxCnt)&&(cntChecked<minCnt)))){  //if(((maxCnt != -1)&(cntChecked>maxCnt))||(cntChecked<minCnt))
                divFilter.addClass('divBadFilter');
                $('#'+params.idFilter+'_apply').jqxButton({disabled: true});
            }
            else{
                //if(!divFilter.data('isdropdown'))$('#'+params.idFilter+' .jqx-expander-header').addClass('noVisible');
                divFilter.removeClass('divBadFilter');
                $('#'+params.idFilter+'_apply').jqxButton({disabled: false});
            }
            divFilter.jqxExpander('setHeaderContent',title[0]+addTitle);
        },
        recalcFilterHeader:function(params){
            var divFilter = $('#'+params.idFilter),
                title = divFilter.jqxExpander('getHeaderContent').split('('),
                maxCnt = divFilter.data('maxcnt'),
                addTitle = '',
                badFilter = false;
            if(params.cntChecked == params.cntAll)addTitle = gis_filters_3;
            else addTitle = '('+params.cntChecked+')';
            if((maxCnt != -1)&(params.cntChecked>maxCnt)){
                badFilter = true;
                divFilter.addClass('divBadFilter');
                addTitle='('+params.cntChecked+gis_filters_6+maxCnt+')';
                params.cntChecked = 0;
            }
            else divFilter.removeClass('divBadFilter');
            divFilter.jqxExpander('setHeaderContent',title[0]+addTitle);
            $('#'+params.idFilter+'_apply').jqxButton({disabled: (params.cntChecked == 0)||badFilter});
        },
        getUniqueId : function(){return 'xxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);return v.toString(16);});},
        callbackFilter:function(params){
            var value = '',
                id = $('#'+this.attr('id')+' .divTab.activeTab').attr('id').split('_')[0];
            $('#'+id+'_filters .divFilter').each(function(){value = value+methods.getFilterValues(this)+'|';});
            if(value != '')value = value.substr(0,value.length-1);
            return {windowId:params.windowId,params:[{name:'filter',value:value}]};
        },
        getFilterDataProviderString:function(){
            var value = '';
            if(this.data('dataprovider')!=undefined && this.data('dataprovider')!='')
                value = this.data('dataprovider');
            return value;
        },
        getFilterValues:function(){
            var value = '';
            $('#'+this.id+' .divFilter').each(function(){value = value+$(this).myFilters('getFilterValuesString')+'|';});
            if(value != '')value = value.substr(0,value.length-1);
            return value;
        },
        getFiltersCount:function(){
            var value = '';
            $('#'+this.id+' .divFilter').each(function(){value = value+$(this).myFilters('getFilterValuesString')+'|';});
            if(value != '')value = value.substr(0,value.length-1);
            return value;
        },
        getFilterValuesString: function(){
            var idFilter = this.attr('id').split('_'),
                value = '';
            idFilter.shift();
            if($('#'+this.attr('id')+'_listCheckBoxes').data('applyfilter') == true){
                var items = $('#'+this.attr('id')+'_listCheckBoxes').jqxListBox('getCheckedItems');
                for(var a in items){
                    value=value+items[a].value+',';
                }
            }
            if(value != '')value = value.substr(0,value.length-1);
            return idFilter.join('_')+':'+value;
        },
        getFilterValuesArray: function(){
            var value = [];
            $('#'+this.attr('id')+' .divFilter').each(function(){
                var idFilter = this.id.split('_'),
                    values = [];
                idFilter.shift();
                var items = $('#'+this.id+'_listCheckBoxes').jqxListBox('getCheckedItems');
                var isCodeStringType = ($(this).data('codetype') !== undefined && $(this).data('codetype') === 'xs:string');
                for(var a in items){
                    values.push({code:(isCodeStringType)?"'"+items[a].value+"'":items[a].value,descr:items[a].label});
                }
                value.push({idFilter:idFilter.join('_'),values:values});
            });
            return value;
        },
        updateTopFilter:function(params){
            if(this.data('getdata') == true)
                this.data('filters',params.obj_ids);
            else
                methods.setTopFilterValues({objIds:params.obj_ids,id: this.attr('id')});
        },
        setTopFilterValues: function(params){
            var ids = params.objIds.split(','),
                list = $('#'+params.id+'_listCheckBoxes'),
                items = list.jqxListBox('getItems');
            list.data('recalc',0);
            if(ids.length>0){
                list.data('isSingle',false);
                list.jqxListBox('uncheckAll');
                list.data('isSingle',true);
                for(var a = 0; a <= items.length-1; a++ ){
                    for(var i=0; i <= ids.length-1; i++){
                        if(ids[i] == items[a].value)
                            list.jqxListBox('checkIndex', a );
                    }
                }
                var checkedItems = list.jqxListBox('getCheckedItems');
                list.data('checkedItems',checkedItems).data('lastchecked',ids);
                $('#'+params.id+'_input').data('lastchecked',ids);
            }
            list.data('applyfilter',true);
            methods.recalcFilterView({idFilter:params.id,recalcAll:false});
        },
        sliceListFilter:function(params){
            if(this.data('getdata') == true)
                this.data('slicefilters',params.obj_ids);
            else
                methods.setTopFilterSlice({objIds:params.obj_ids,id: this.attr('id')});
        },
        setTopFilterSlice: function(params){
            var ids = params.objIds.split(','),
                list = $('#'+params.id+'_listCheckBoxes'),
                items = list.jqxListBox('getItems');
            list.data('recalc',0);
            for(var a = 0; a <= items.length-1; a++ ){
                for(var i=0; i <= ids.length-1; i++){
                    if(ids[i] == items[a].value)
                        list.jqxListBox('checkIndex', i );
                }
            }
            list.data('isSingle',false);
            list.jqxListBox('checkAll');
            list.data('isSingle',true);
            list.data('applyfilter',true);
            methods.recalcFilterView({idFilter:params.id,recalcAll:false});
        }
    };

    $.fn.myFilters = function( method ){
        if(methods[method]) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.fn.myFilters' );
        }
    };
})(jQuery);