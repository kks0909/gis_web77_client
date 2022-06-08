function getBrowserZoom(){
	//TODO добавлить обработку для случая, если приложение открыто в iframe
	return 1;
	//по умолчанию 100% масштаб
	//ie
	if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
		//Math.round((document.documentElement.offsetHeight / window.innerHeight) * 100) / 100;
		return Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100) / 100;
	}
	//chrome
	else if(!!window.chrome && !(!!window.opera || navigator.userAgent.indexOf(' Opera') >= 0)){
		return Math.round(((window.outerWidth) / window.innerWidth)*100) / 100;
	}
	return 1;
};
function getBrowserParamsWOtaskMdl(s){
	var newStr = '';
	var i;
	for(i in s)
		if(s[i].indexOf('task=')==-1 && s[i].indexOf('mdl=')==-1 && s[i].indexOf('?')==-1)
			newStr+='&'+s[i];
	return newStr;
};
function getParameterByName(name){
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};

function isCanvasSupported(){
	var elem = document.createElement('canvas');
	var isCanvasSupp = !!(elem.getContext && elem.getContext('2d'));
	return isCanvasSupp;
};

/**
 * Функция проверки наличия карты в задаче
 * @returns {boolean}
 */
function checkMapExisting(){
	return WidgetMap && WidgetMap.map && WidgetMap.layerManager;
}



/**
 * Функция получения типа карты по задаче
 * @returns {boolean}
 */
function getMapType(){
	return CURRENT_MAP_TYPE;
}

/**
 * Функция получения списка кнопок, которые не доступны для выбранной задачи
 * Настройки берутся из web.config. Если они же присутствую в настройках задач, то перекрываются теми, что в задачах
 * @param {MAP_TYPE} ppanelType
 * @returns {[]}
 */
function getDenyPropButtonsByTask(ppanelType){
	if(!ppanelType) ppanelType = MAP_TYPE.MAP;
	var deniedButtons = [];
	if(ppanelType){
		if(App && App.config){
			switch(ppanelType){
				case MAP_TYPE.MAP:
					deniedButtons = (App.config.MAP_DENY_PROP_BUTTONS)?App.config.MAP_DENY_PROP_BUTTONS.split(','):[];
					if(WidgetMap && WidgetMap.config && WidgetMap.config.map_deny_prop_buttons)
						deniedButtons = WidgetMap.config.map_deny_prop_buttons;
					break;
				case MAP_TYPE.CAS:
					deniedButtons = (App.config.CAS_DENY_PROP_BUTTONS)?App.config.CAS_DENY_PROP_BUTTONS.split(','):[];
					if(WidgetMap && WidgetMap.config && WidgetMap.config.cas_deny_prop_buttons)
						deniedButtons = WidgetMap.config.cas_deny_prop_buttons;
					break;
				case MAP_TYPE.SCHEMA:
					deniedButtons = (App.config.SCHEMA_DENY_PROP_BUTTONS)?App.config.SCHEMA_DENY_PROP_BUTTONS.split(','):[];
					if(WidgetMap && WidgetMap.config && WidgetMap.config.schema_deny_prop_buttons)
						deniedButtons = WidgetMap.config.schema_deny_prop_buttons;
					break;
				case 'grid':
					deniedButtons = (App.config.GRID_DENY_PROP_BUTTONS)?App.config.GRID_DENY_PROP_BUTTONS.split(','):[];
					if(WidgetMap && WidgetMap.config && WidgetMap.config.grid_deny_prop_buttons)
						deniedButtons = WidgetMap.config.grid_deny_prop_buttons;
					break;
				default:
					deniedButtons = [];
					break;
			}
		}
	}
	return deniedButtons;
}


function checkBrowserVersion() {
	var pageOpenedAsWidgetInProgram = /[?,&]w=1/.test(window.location.href);
	//Проверяем текущую версию браузера
	var currentBrowserCompatible = getBrowserCompatibility();
	//Если браузер несовместим - редиректим на страницу несовместимости
	var s = window.location.search.split('&');

	if(pageOpenedAsWidgetInProgram){
		if (!isCanvasSupported()){
			var newStr = getBrowserParamsWOtaskMdl(s);
			if(window.location.href.indexOf('tech_schema_js.html')==-1)
				window.location.href = "incompatibleBrowser.html?"+newStr+window.location.hash;
			else
				window.location.href = "incompatibleBrowserTechSchema.html";
		}
	}
	else{
		if (!currentBrowserCompatible && !pageOpenedAsWidgetInProgram){
			var newStr = getBrowserParamsWOtaskMdl(s);
			var currTask = getParameterByName('task');
			if(currTask!='')
				currTask = 'task='+currTask+'_FLASH';
			if(window.location.href.indexOf('tech_schema_js.html')==-1)
				window.location.href = "incompatibleBrowser.html?"+currTask+newStr+window.location.hash;
			else
				window.location.href = "incompatibleBrowserTechSchema.html";
		}
	}


}

/**
 * Функция конвертации фильтров(верхний, нижний) из массива в объект с ключами
 * @param filterArr
 */
function convertArrayFilterToObject(filterArr){
	var filterObj = undefined;
	try{
		if(filterArr && filterArr.length > 0){
			filterArr.forEach(function(item){
				if(item.name){
					if(!filterObj) filterObj = {};
					filterObj[item.name] = item.value;
				}
			})
		}
	}
	catch (ex){}

	return filterObj;
}

/**
 * Получение положения и размеров окна по описанным в конфиге параметрам
 * @param config
 * @param isDashboard если дашборд, то высчитываем проценты по высоте от 3000px
 * @returns {{top: number, left: number, width: number, height: number}}
 */
function getPositionFromConfig(config, isDashboard){
	var dashboardMaxHeight = 3000;
	var position = {
		left: 0,
		top: 0,
		width: 474,
		height: 360,
	}
	if(config){
		if(config.width !== undefined){
			if(config.width.toString().indexOf('%') !== -1){
				var dw = Number(config.width.toString().replace('%',''))/100;
				position.width =  $(window).width() * dw;
			}
			else position.width = config.width;
		}
		if(config.height !== undefined){
			if(config.height.toString().indexOf('%') !== -1){
				var dh = Number(config.height.toString().replace('%',''))/100;
				position.height = (isDashboard) ? dashboardMaxHeight * dh : $(window).height() * dh;
			}
			else position.height = config.height;
		}
		if(config.left !== undefined){
			if(config.left.toString().indexOf('%') !== -1){
				var dh = Number(config.left.toString().replace('%',''))/100;
				position.left =  $(window).width() * dh;
			}
			else position.left = config.left;
		}
		if(config.top !== undefined){
			if(config.top.toString().indexOf('%') !== -1){
				var dh = Number(config.top.toString().replace('%',''))/100;
				position.top =   (isDashboard) ? dashboardMaxHeight * dh : $(window).height() * dh;
			}
			else position.top = config.top;
		}
	}
	position.top = Math.ceil(position.top)
	position.left = Math.ceil(position.left)
	return position;
}

function supports_html5_storage() {
	return false;
	try {
		return 'localStorage' in window && window['localStorage'] !== null;
	} catch (e) {
		return false;
	}
}
checkBrowserVersion();

/**
 * A map that contains a lot of colors that are recognised by various browsers.
 * This list is way larger than the minimal one dictated by W3C.
 * The keys of this map are the lowercase "readable" names of the colors, while
 * the values are the "hex" values.
 *
 * клон goog.color.names с перемешанными цветами, чтобы визуально в чартах рядом стоящие блоки не были похожего цвета
 * @type {Array<string>}
 */

CHART_COLORS = [
	/*'gisblue':*/ 'rgb(49,84,213)',
	/*'darkorange':*/ '#ff8c00',
	/*'darkorchid':*/ '#9932cc',
	/*'mediumseagreen':*/ '#3cb371',
	/*'mediumslateblue':*/ '#7b68ee',
	/*'yellow':*/ '#ffff00',
	/*'yellowgreen':*/ '#9acd32',
	/*'blue':*/ '#0000ff',
	/*'firebrick':*/ '#b22222',
	/*'chartreuse':*/ '#7fff00',
	/*'aliceblue':*/ '#f0f8ff',
	/*'chocolate':*/ '#d2691e',
	/*'darkgoldenrod':*/ '#b8860b',
	/*'deeppink':*/ '#ff1493',
	/*'orangered':*/ '#ff4500',
	/*'orchid':*/ '#da70d6',
	/*'palegoldenrod':*/ '#eee8aa',
	/*'palegreen':*/ '#98fb98',
	/*'navy':*/ '#000080',
	/*'oldlace':*/ '#fdf5e6',
	/*'olive':*/ '#808000',
	/*'olivedrab':*/ '#6b8e23',
	/*'orange':*/ '#ffa500',
	/*'paleturquoise':*/ '#afeeee',
	/*'palevioletred':*/ '#db7093',
	/*'aqua':*/ '#00ffff',
	/*'purple':*/ '#800080',
	/*'red':*/ '#ff0000',
	/*'rosybrown':*/ '#bc8f8f',

	/*'powderblue':*/ '#b0e0e6',
	/*'antiquewhite':*/ '#faebd7',
	/*'aquamarine':*/ '#7fffd4',
	/*'azure':*/ '#f0ffff',
	/*'beige':*/ '#f5f5dc',
	/*'bisque':*/ '#ffe4c4',
	/*'black':*/ '#000000',
	/*'blanchedalmond':*/ '#ffebcd',
	/*'blueviolet':*/ '#8a2be2',
	/*'brown':*/ '#a52a2a',
	/*'burlywood':*/ '#deb887',
	/*'cadetblue':*/ '#5f9ea0',
	/*'coral':*/ '#ff7f50',
	/*'cornflowerblue':*/ '#6495ed',
	/*'cornsilk':*/ '#fff8dc',
	/*'crimson':*/ '#dc143c',
	/*'cyan':*/ '#00ffff',
	/*'darkblue':*/ '#00008b',
	/*'darkcyan':*/ '#008b8b',
	/*'darkgray':*/ '#a9a9a9',
	/*'darkgreen':*/ '#006400',
	/*'darkgrey':*/ '#a9a9a9',
	/*'darkkhaki':*/ '#bdb76b',
	/*'darkmagenta':*/ '#8b008b',
	/*'darkolivegreen':*/ '#556b2f',
	/*'darkred':*/ '#8b0000',
	/*'darksalmon':*/ '#e9967a',
	/*'darkseagreen':*/ '#8fbc8f',
	/*'darkslateblue':*/ '#483d8b',
	/*'darkslategray':*/ '#2f4f4f',
	/*'darkslategrey':*/ '#2f4f4f',
	/*'darkturquoise':*/ '#00ced1',
	/*'darkviolet':*/ '#9400d3',
	/*'deepskyblue':*/ '#00bfff',
	/*'dimgray':*/ '#696969',
	/*'dimgrey':*/ '#696969',
	/*'dodgerblue':*/ '#1e90ff',
	/*'floralwhite':*/ '#fffaf0',
	/*'forestgreen':*/ '#228b22',
	/*'fuchsia':*/ '#ff00ff',
	/*'gainsboro':*/ '#dcdcdc',
	/*'ghostwhite':*/ '#f8f8ff',
	/*'gold':*/ '#ffd700',
	/*'goldenrod':*/ '#daa520',
	/*'gray':*/ '#808080',
	/*'green':*/ '#008000',
	/*'greenyellow':*/ '#adff2f',
	/*'grey':*/ '#808080',
	/*'honeydew':*/ '#f0fff0',
	/*'hotpink':*/ '#ff69b4',
	/*'indianred':*/ '#cd5c5c',
	/*'indigo':*/ '#4b0082',
	/*'ivory':*/ '#fffff0',
	/*'khaki':*/ '#f0e68c',
	/*'lavender':*/ '#e6e6fa',
	/*'lavenderblush':*/ '#fff0f5',
	/*'lawngreen':*/ '#7cfc00',
	/*'lemonchiffon':*/ '#fffacd',
	/*'lightblue':*/ '#add8e6',
	/*'lightcoral':*/ '#f08080',
	/*'lightcyan':*/ '#e0ffff',
	/*'lightgoldenrodyellow':*/ '#fafad2',
	/*'lightgray':*/ '#d3d3d3',
	/*'lightgreen':*/ '#90ee90',
	/*'lightgrey':*/ '#d3d3d3',
	/*'lightpink':*/ '#ffb6c1',
	/*'lightsalmon':*/ '#ffa07a',
	/*'lightseagreen':*/ '#20b2aa',
	/*'lightskyblue':*/ '#87cefa',
	/*'lightslategray':*/ '#778899',
	/*'lightslategrey':*/ '#778899',
	/*'lightsteelblue':*/ '#b0c4de',
	/*'lightyellow':*/ '#ffffe0',
	/*'lime':*/ '#00ff00',
	/*'limegreen':*/ '#32cd32',
	/*'linen':*/ '#faf0e6',
	/*'magenta':*/ '#ff00ff',
	/*'maroon':*/ '#800000',
	/*'mediumaquamarine':*/ '#66cdaa',
	/*'mediumblue':*/ '#0000cd',
	/*'mediumorchid':*/ '#ba55d3',
	/*'mediumpurple':*/ '#9370db',
	/*'mediumspringgreen':*/ '#00fa9a',
	/*'mediumturquoise':*/ '#48d1cc',
	/*'mediumvioletred':*/ '#c71585',
	/*'midnightblue':*/ '#191970',
	/*'mintcream':*/ '#f5fffa',
	/*'mistyrose':*/ '#ffe4e1',
	/*'moccasin':*/ '#ffe4b5',
	/*'navajowhite':*/ '#ffdead',
	/*'papayawhip':*/ '#ffefd5',
	/*'peachpuff':*/ '#ffdab9',
	/*'peru':*/ '#cd853f',
	/*'pink':*/ '#ffc0cb',
	/*'plum':*/ '#dda0dd',
	/*'royalblue':*/ '#4169e1',
	/*'saddlebrown':*/ '#8b4513',
	/*'salmon':*/ '#fa8072',
	/*'sandybrown':*/ '#f4a460',
	/*'seagreen':*/ '#2e8b57',
	/*'seashell':*/ '#fff5ee',
	/*'sienna':*/ '#a0522d',
	/*'silver':*/ '#c0c0c0',
	/*'skyblue':*/ '#87ceeb',
	/*'slateblue':*/ '#6a5acd',
	/*'slategray':*/ '#708090',
	/*'slategrey':*/ '#708090',
	/*'snow':*/ '#fffafa',
	/*'springgreen':*/ '#00ff7f',
	/*'steelblue':*/ '#4682b4',
	/*'tan':*/ '#d2b48c',
	/*'teal':*/ '#008080',
	/*'thistle':*/ '#d8bfd8',
	/*'tomato':*/ '#ff6347',
	/*'turquoise':*/ '#40e0d0',
	/*'violet':*/ '#ee82ee',
	/*'wheat':*/ '#f5deb3',
	/*'white':*/ '#ffffff',
	/*'whitesmoke':*/ '#f5f5f5',

];