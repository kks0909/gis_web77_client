/**  version 6.1.6.0
 /**
 * Created by Андрей on 28.12.2016.
 */
var SOURCE = {};
var FILE_SOURCE = {};


function LOG(message, error) {
	//return;
	var req = $.ajax({
		type: "POST",
		url: './ServerTaskService.asmx/TestSQLLog',
		data: {
			message: message,
			context: error
		},
		dataType: 'xml'
	});
}

function loadQuery() {
	var query = $('#query').val();

	function result(resultXml) {
//Перед обработкой переменных инициализируем _spatialVariables
		var layerGeoXml = ($.parseXML(resultXml)).firstChild;
		SOURCE = layerGeoXml;
		$('#queryType').prop("disabled", false);
	}

	function fault(resultXml) {
		$('#queryType').prop("disabled", false);
	}

	$('#queryType').prop("disabled", true);
	serverQuery('./DataService.asmx/ProcessQueryNew', getVarsParams(query), result, fault);

}

function loadQueryType(event) {
	var value = event.options[event.selectedIndex].value;
	var varsDiv = $('#queryVars');
	if (value == 'no') {
		varsDiv.empty();
		return false;
	}

	var select = SOURCE.getElementsByTagName(value);
	if (select.length > 0) {
		var vars = select[0].getElementsByTagName("var");
		var params = select[0].getElementsByTagName("param");
		var i = 0, j = 0;
		varsDiv.empty();
		if (vars.length > 0) {
			for (; i < vars.length; i++) {
				//Получаем переменные запроса select
				var attrName = vars[i].getAttribute('name');
				var defaultVal = vars[i].getAttribute('default');
				if (defaultVal === null)
					defaultVal = "";
				varsDiv.append('<div style="border-bottom: solid 1px;height: 30px"><label style="font-size:13px;">' + attrName + '</label><input id="' + attrName + '_input" style="float:right;width: 295px;" type"text" value="' + defaultVal + '"></div>');
			}
		}
		if (params.length > 0) {
			for (; j < params.length; j++) {
				//Получаем переменные запроса select
				var attrName = params[j].getAttribute('name');
				var defaultVal = params[j].getAttribute('default');
				if (defaultVal === null)
					defaultVal = "";
				varsDiv.append('<div style="border-bottom: solid 1px;height: 30px"><label style="font-size:13px;">' + attrName + '</label><input id="' + attrName + '_input" style="float:right;width: 295px;" type"text" value="' + defaultVal + '"></div>');
			}
		}

	}
	return false;

}


function execQuery() {
	function result(resultXml) {
		$('#resultDiv').text(resultXml);
	}

	function fault(resultXml) {
		$('#resultDiv').text(resultXml);
	}

	var query = $('#query').val();
	serverQuery('./DataService.asmx/ProcessQueryNew', getQueryParams(query), result, fault);
};


function getQueryParams(query) {
	//собираем параметры
	var paramsDiv = $('#queryVars label');
	var data = '<data ';
	paramsDiv.each(function () {
		var lv = $(this).text();
		var pIn = $('#' + lv + '_input').val();
		data += ' ' + lv + '="' + pIn + '"';
	});
	data += ' />';
	var userId = '1045';
	var userLogin = 'editor';
	var qt = $('#queryType').val();
	return {
		toElements: false,
		descrId: query,
		getSchema: false,
		descrType: qt,
		data: '<root USER_ID="' + userId +
		'" USER_LOGIN="' + userLogin +
		'" PODS_USER="' + userLogin +
		'">' + data +
		'</root>'
	};
};


function getVarsParams(file) {
	var userId = '1045';
	var userLogin = 'editor';

	return {
		getSchema: false,
		descrId: 'SYS_SEM.xml#GET_DATA_XML',
		toElements: false,
		descrType: 'select',
		data: '<root USER_ID="' + userId +
		'" USER_LOGIN="' + userLogin +
		'" PODS_USER="' + userLogin +
		'" >' +
		'<data file="' + file.split("#")[0] + '" dataId="' + file.split("#")[1] + '" />' +
		'</root>'
	};
};


function serverPreQuery(url, params, mainQuery, mainParams, mainType, resultCallback, faultCallback) {
	var req = $.ajax({
		type: "POST",
		url: url,
		data: params,
		dataType: 'xml'
	});
	var xmlData = "";

	req.done(function (resp) {
		xmlData = $(resp).find('string').text();
		//Вызываем переданную функцию для обработки результата
		resultCallback(xmlData, mainQuery, mainParams, mainType);
	});

	req.fail(function () {
		xmlData = '<error>Ошибка при получении данных</error>';
		//Вызываем переданную функцию для обработки результата
		faultCallback(xmlData, mainQuery, mainParams, mainType);
	});

	return "";
}

function serverQuery(url, params, resultCallback, faultCallback) {
	var req = $.ajax({
		type: "POST",
		url: url,
		data: params,
		dataType: 'xml'
	});
	var xmlData = "";

	req.done(function (resp) {
		xmlData = $(resp).find('string').text();
		//Вызываем переданную функцию для обработки результата
		resultCallback(xmlData);
	});

	req.fail(function () {
		xmlData = '<error>Ошибка при получении данных</error>';
		//Вызываем переданную функцию для обработки результата
		faultCallback(xmlData);
	});

	return "";
}


/****************/


function getFileParams(file) {
	var userId = '1045';
	var userLogin = 'editor';

	return {
		getSchema: false,
		descrId: 'SYS_SEM.xml#GET_XML_FILE',
		toElements: false,
		descrType: 'select',
		data: '<root USER_ID="' + userId +
		'" USER_LOGIN="' + userLogin +
		'" PODS_USER="' + userLogin +
		'" >' +
		'<data FILE="' + file.split("#")[0] + '"  />' +
		'</root>'
	};
};
var ALL_COUNT = 0;//количество всех запросов, которые надо выполнить
var CURR_COUNT = 0;//сколько выполнено
var ERR_COUNT = 0;// количество ошибок
function loadFile() {
	var query = $('#query').val();
	$('#resultDiv').text('Загружается файл...');
	function result(resultXml) {
		ALL_COUNT = 0;
		CURR_COUNT = 0;
		$('#resultDiv').text('Файл загружен.');
		//Перед обработкой переменных инициализируем _spatialVariables
		var layerGeoXml = ($.parseXML(resultXml)).firstChild;
		FILE_SOURCE = layerGeoXml;
		$('#queryType').prop("disabled", false);
	}

	function fault(resultXml) {
		$('#resultDiv').text('Файл загружен с ошибкой.');
		LOG('Ошибка загрузки файла', resultXml);
		$('#queryType').prop("disabled", false);
	}

	$('#queryType').prop("disabled", true);
	serverQuery('./DataService.asmx/ProcessQueryNew', getFileParams(query), result, fault);

};


function execMultiQuery() {
	ALL_COUNT = 0;
	CURR_COUNT = 0;
	ERR_COUNT = 0;
	LOG('*****************************НАЧАЛО РАСЧЕТОВ*************************', '');
	function result(resultXml) {
		--CURR_COUNT;
		//закидываем ошибки в лог
		if (resultXml.indexOf('<error>') != -1) {
			var titleErr = resultXml.substring(resultXml.lastIndexOf('Запрос'), resultXml.lastIndexOf('Входные данные'));
			LOG('----ОШИБКА RESULT-----' + titleErr.toUpperCase(), '\n' + resultXml + '\n');
			++ERR_COUNT;
		}
		if (CURR_COUNT == 0)
			LOG('*****************************КОНЕЦ РАСЧЕТОВ*************************', '');
		$('#resultDiv').text('Выполнено(' + (ALL_COUNT - CURR_COUNT) + ' из ' + ALL_COUNT + '): ' + parseInt(100 - CURR_COUNT * 100 / ALL_COUNT) + '%. Ошибок:' + ERR_COUNT);
	}

	function fault(resultXml) {
		--CURR_COUNT;
		++ERR_COUNT;
		LOG('----ОШИБКА FAULT-------------', '\n' + resultXml + '\n');
		if (CURR_COUNT == 0)
			LOG('*****************************КОНЕЦ РАСЧЕТОВ*************************', '');
		$('#resultDiv').text('Выполнено(' + (ALL_COUNT - CURR_COUNT) + ' из ' + ALL_COUNT + '): ' + parseInt(100 - CURR_COUNT * 100 / ALL_COUNT) + '%. Ошибок:' + ERR_COUNT);
	}

	var tpSymbol = $('#tpSymbol').val();
	var tpNumber = $('#tpNumber').val();
	var tpDate = $('#tpDate').val();
	var tpWKT = $('#tpWKT').val();


	var isWKT = $('#chWKT').prop('checked');

	var isDefault = $('#chDefault').prop('checked');

	var isSelect = $('#chSelect').prop('checked');
	var isUpdate = $('#chUpdate').prop('checked');
	var isCreate = $('#chInsert').prop('checked');
	var isDelete = $('#chDelete').prop('checked');
	var selectParams = [];
	var updateParams = [];
	var createParams = [];
	var deleteParams = [];

	var datas = FILE_SOURCE.getElementsByTagName('data');
	if (datas.length > 0) {
		for (var k = 0; k < datas.length; k++) {
			var data = datas[k];
			//забираем параметры, устанавливаем значения по умолчанию и из полей и отправляем в дату
			var query = undefined;
			if (isSelect) {
				var obj = {QUERY_ID: data.getAttribute('id')};
				query = data.getElementsByTagName('select');
				selectParams.push(obj);
				if (query.length > 0) {
					var vars = query[0].getElementsByTagName("var");
					var params = query[0].getElementsByTagName("param");
					var i = 0, j = 0;
					if (vars.length > 0) {
						for (; i < vars.length; i++) {
							//Получаем переменные запроса select
							var attrName = vars[i].getAttribute('name');
							var defaultVal = vars[i].getAttribute('default');
							var typeVal = vars[i].getAttribute('type');
							if (typeVal != null) {
								if (isDefault)
									obj[attrName] = defaultVal;
								else {
									if (typeVal == 'Int64' || typeVal == 'Decimal')
										obj[attrName] = tpNumber;
									if (typeVal == 'String')
										obj[attrName] = tpSymbol;
									if (typeVal == 'DateTime')
										obj[attrName] = tpDate;
								}
							}
							else if (isDefault)
								obj[attrName] = defaultVal;
							else
								obj[attrName] = tpSymbol;
						}
					}
					if (params.length > 0) {
						for (; j < params.length; j++) {
							//Получаем переменные запроса select
							var attrName = params[j].getAttribute('name');
							var defaultVal = params[j].getAttribute('default');
							var typeVal = params[j].getAttribute('type');
							if (isDefault)
								obj[attrName] = defaultVal;
							else {
								if (typeVal == 'Int64' || typeVal == 'Decimal')
									obj[attrName] = tpNumber;
								if (typeVal == 'String')
									obj[attrName] = tpSymbol;
								if (typeVal == 'DateTime')
									obj[attrName] = tpDate;
							}
						}
					}
				}
				if (isWKT)
					obj['WKT'] = tpWKT;
			}
			if (isUpdate) {
				var obj = {QUERY_ID: data.getAttribute('id')};
				query = data.getElementsByTagName('update');
				updateParams.push(obj);
				if (query.length > 0) {
					var vars = query[0].getElementsByTagName("var");
					var params = query[0].getElementsByTagName("param");
					var i = 0, j = 0;
					if (vars.length > 0) {
						for (; i < vars.length; i++) {
							//Получаем переменные запроса select
							var attrName = vars[i].getAttribute('name');
							var defaultVal = vars[i].getAttribute('default');
							var typeVal = vars[i].getAttribute('type');
							if (typeVal != null) {
								if (isDefault)
									obj[attrName] = defaultVal;
								else {
									if (typeVal == 'Int64' || typeVal == 'Decimal')
										obj[attrName] = tpNumber;
									if (typeVal == 'String')
										obj[attrName] = tpSymbol;
									if (typeVal == 'DateTime')
										obj[attrName] = tpDate;
								}
							}
							else if (isDefault)
								obj[attrName] = defaultVal;
							else
								obj[attrName] = tpSymbol;
						}
					}
					if (params.length > 0) {
						for (; j < params.length; j++) {
							//Получаем переменные запроса select
							var attrName = params[j].getAttribute('name');
							var defaultVal = params[j].getAttribute('default');
							var typeVal = params[j].getAttribute('type');
							if (isDefault)
								obj[attrName] = defaultVal;
							else {
								if (typeVal == 'Int64' || typeVal == 'Decimal')
									obj[attrName] = tpNumber;
								if (typeVal == 'String')
									obj[attrName] = tpSymbol;
								if (typeVal == 'DateTime')
									obj[attrName] = tpDate;
							}

						}
					}
				}
				if (isWKT)
					obj['WKT'] = tpWKT;
			}
			if (isCreate) {
				var obj = {QUERY_ID: data.getAttribute('id')};
				query = data.getElementsByTagName('insert');
				createParams.push(obj);
				if (query.length > 0) {
					var vars = query[0].getElementsByTagName("var");
					var params = query[0].getElementsByTagName("param");
					var i = 0, j = 0;
					if (vars.length > 0) {
						for (; i < vars.length; i++) {
							//Получаем переменные запроса select
							var attrName = vars[i].getAttribute('name');
							var defaultVal = vars[i].getAttribute('default');
							var typeVal = vars[i].getAttribute('type');
							if (typeVal != null) {
								if (isDefault)
									obj[attrName] = defaultVal;
								else {
									if (typeVal == 'Int64' || typeVal == 'Decimal')
										obj[attrName] = tpNumber;
									if (typeVal == 'String')
										obj[attrName] = tpSymbol;
									if (typeVal == 'DateTime')
										obj[attrName] = tpDate;
								}
							}
							else if (isDefault)
								obj[attrName] = defaultVal;
							else
								obj[attrName] = tpSymbol;
						}
					}
					if (params.length > 0) {
						for (; j < params.length; j++) {
							//Получаем переменные запроса select
							var attrName = params[j].getAttribute('name');
							var defaultVal = params[j].getAttribute('default');
							var typeVal = params[j].getAttribute('type');
							if (isDefault)
								obj[attrName] = defaultVal;
							else {
								if (typeVal == 'Int64' || typeVal == 'Decimal')
									obj[attrName] = tpNumber;
								if (typeVal == 'String')
									obj[attrName] = tpSymbol;
								if (typeVal == 'DateTime')
									obj[attrName] = tpDate;
							}

						}
					}
				}
				if (isWKT)
					obj['WKT'] = tpWKT;
			}
			if (isDelete) {
				var obj = {QUERY_ID: data.getAttribute('id')};
				query = data.getElementsByTagName('delete');
				deleteParams.push(obj);
				if (query.length > 0) {
					var vars = query[0].getElementsByTagName("var");
					var params = query[0].getElementsByTagName("param");
					var i = 0, j = 0;
					if (vars.length > 0) {
						for (; i < vars.length; i++) {
							//Получаем переменные запроса select
							var attrName = vars[i].getAttribute('name');
							var defaultVal = vars[i].getAttribute('default');
							var typeVal = vars[i].getAttribute('type');
							if (typeVal != null) {
								if (isDefault)
									obj[attrName] = defaultVal;
								else {
									if (typeVal == 'Int64' || typeVal == 'Decimal')
										obj[attrName] = tpNumber;
									if (typeVal == 'String')
										obj[attrName] = tpSymbol;
									if (typeVal == 'DateTime')
										obj[attrName] = tpDate;
								}
							}
							else if (isDefault)
								obj[attrName] = defaultVal;
							else
								obj[attrName] = tpSymbol;
						}
					}
					if (params.length > 0) {
						for (; j < params.length; j++) {
							//Получаем переменные запроса select
							var attrName = params[j].getAttribute('name');
							var defaultVal = params[j].getAttribute('default');
							var typeVal = params[j].getAttribute('type');
							if (isDefault)
								obj[attrName] = defaultVal;
							else {
								if (typeVal == 'Int64' || typeVal == 'Decimal')
									obj[attrName] = tpNumber;
								if (typeVal == 'String')
									obj[attrName] = tpSymbol;
								if (typeVal == 'DateTime')
									obj[attrName] = tpDate;
							}

						}
					}
				}
				if (isWKT)
					obj['WKT'] = tpWKT;
			}
		}
	}
	ALL_COUNT = selectParams.length + createParams.length + updateParams.length + deleteParams.length;
	CURR_COUNT = ALL_COUNT;
	//проходим по массиву и вызываем все запросы
	for (var i = 0; i < selectParams.length; i++) {
		var query = $('#query').val() + '#' + selectParams[i].QUERY_ID;
		serverQuery('./DataService.asmx/ProcessQueryNew', getMultiQueryParams(query, selectParams[i], 'select'), result, fault);
	}
	//сначала делаем select запрос, чтобы получить доп параметры, которые будет передаваться в insert/update/delete
	for (var i = 0; i < createParams.length; i++) {
		var query = $('#query').val() + '#' + createParams[i].QUERY_ID;
		serverPreQuery('./DataService.asmx/ProcessQueryNew', getPreSelectMultiQueryParams(query, createParams[i], 'select'), query, createParams[i], 'insert', preresult, prefault);
		//serverQuery('./DataService.asmx/ProcessQueryNew', getMultiQueryParams(query, createParams[i], 'insert'), result, fault);
	}
	for (var i = 0; i < updateParams.length; i++) {
		var query = $('#query').val() + '#' + updateParams[i].QUERY_ID;
		serverPreQuery('./DataService.asmx/ProcessQueryNew', getPreSelectMultiQueryParams(query, updateParams[i], 'select'), query, updateParams[i], 'update', preresult, prefault);
		//serverQuery('./DataService.asmx/ProcessQueryNew', getMultiQueryParams(query, updateParams[i], 'update'), result, fault);
	}
	for (var i = 0; i < deleteParams.length; i++) {
		var query = $('#query').val() + '#' + deleteParams[i].QUERY_ID;
		serverPreQuery('./DataService.asmx/ProcessQueryNew', getPreSelectMultiQueryParams(query, deleteParams[i], 'select'), query, deleteParams[i], 'delete', preresult, prefault);
		//serverQuery('./DataService.asmx/ProcessQueryNew', getMultiQueryParams(query, deleteParams[i], 'delete'), result, fault);
	}


	function preresult(resultXml, query, params, type) {
		//парсим параметры из селекта и дописываем в команду
		//есди ошибка была, то игнорируем результат селекта и отправляем запрос на основную команду
		if (resultXml.indexOf('<error>') == -1) {
			//заменяем в пришедшем результате 'xs:' на 'XS', чтобы найти элементы
			resultXml = resultXml.replace(new RegExp("xs:", 'g'), "XS");
			var layerGeoXml = ($.parseXML(resultXml)).firstChild;
			var datas = layerGeoXml.getElementsByTagName('XSattribute');
			var tpSymbol = $('#tpSymbol').val();
			var tpNumber = $('#tpNumber').val();
			var tpDate = $('#tpDate').val();
			for (var i = 0; i < datas.length; i++) {
				//забираем название атрибута
				var data = $(datas[i]).attr('name');
				if (data == undefined)
					continue;
				//забираем тип атрибута
				var attrrType = datas[i].getElementsByTagName('XSrestriction');
				if (attrrType.length > 0)
					attrrType = $(attrrType[0]).attr('base');
				//если параметра нет в params, то добавляем его
				if (params[data] == undefined) {
					var attrval = tpNumber;
					if (attrrType == 'XSdateTime')
						attrval = tpDate;
					else if (attrrType == 'XSstring')
						attrval = tpSymbol;
					params[data] = attrval;
				}
			}
		}
		serverQuery('./DataService.asmx/ProcessQueryNew', getMultiQueryParams(query, params, type), result, fault);
	}

	function prefault(resultXml, query, params, type) {
		//есди ошибка была, то игнорируем результат селекта и отправляем запрос на основную команду
		serverQuery('./DataService.asmx/ProcessQueryNew', getMultiQueryParams(query, params, type), result, fault);
	}
};

//запрос select, который выполняется перед основным запросом для получения списка параметров для передачи в insert/uopdate/delete
//getSchema=true, чтобы получить параметры, если придет ответ без записей
function getPreSelectMultiQueryParams(query) {
	//собираем параметры
	var data = '<data FILTER="1=2" />';

	var isData = $('#chData').prop('checked');
	var tpDATA = $('#tpDATA').val();
	if (isData)
		data = tpDATA;
	var userId = '1045';
	var userLogin = 'editor';

	return {
		toElements: false,
		descrId: query,
		getSchema: true,
		descrType: 'select',
		data: '<root USER_ID="' + userId +
		'" USER_LOGIN="' + userLogin +
		'" PODS_USER="' + userLogin +
		'">' + data +
		'</root>'
	};
};

function getMultiQueryParams(query, params, type) {
	//собираем параметры
	var data = '<data ';
	for (var obj in params) {
		data += ' ' + obj + '="' + params[obj] + '"';
	}
	data += ' />';
	var isData = $('#chData').prop('checked');
	var tpDATA = $('#tpDATA').val();
	if (isData)
		data = tpDATA;
	var userId = '1045';
	var userLogin = 'editor';

	return {
		toElements: false,
		descrId: query,
		getSchema: false,
		descrType: type,
		data: '<root USER_ID="' + userId +
		'" USER_LOGIN="' + userLogin +
		'" PODS_USER="' + userLogin +
		'">' + data +
		'</root>'
	};
};



