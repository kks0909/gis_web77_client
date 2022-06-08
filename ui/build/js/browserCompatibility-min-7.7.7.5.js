/* Исправление для IE8, чтобы на окнах (window) метод hasOwnProperty() не вызывал ошибки */
window.hasOwnProperty = window.hasOwnProperty || Object.prototype.hasOwnProperty;

/* Массив несовместимых с js-версией сайта браузеров в формате '<код браузера> + <пробел> + <версия браузера>'
Значения префикса самого браузера: 'MSIE' - Internet Explorer, 'Chrome' - Google Chrome, 'Firefox' - Mozilla Firefox, 'Safari' - Safari or IPad)
Значения версии: число с версией или символ *, если ни одна из версий такого браузера не поддерживается.
Пример: для Internet Explorer 8 будет строка 'MSIE 8', а если не поддерживается ни одна версия Firefox, нужно добавить в массив элемент 'Firefox *'
* */
var INCOMPATIBLE_BROWSERS = ['MSIE 7', 'MSIE 8','Safari *'];

/* Функция определения совместимости браузера для отображения полного функционала сайта */
function getBrowserCompatibility() {
    try {
        var currentBrowserWithVersion = getBrowserWithVersion();

        //Ищем версию браузера в массиве несовместимости
        for (var i = 0; i < INCOMPATIBLE_BROWSERS.length; i++) {
            var curIncompatibleBrowser = INCOMPATIBLE_BROWSERS[i];
            //Если конкретно эта версия браузера запрещена
            if (curIncompatibleBrowser==currentBrowserWithVersion)
                return false;
            //Если текущий браузер попадает в условие запрета всех версий конкретного браузера
            var curIncompatibleBrowserSplitArr = curIncompatibleBrowser.split(' ');
            if (curIncompatibleBrowserSplitArr.length==2) {
                if (curIncompatibleBrowserSplitArr[1]=='*' && currentBrowserWithVersion.indexOf(curIncompatibleBrowserSplitArr[0])>=0)
                    return false;
            }
        }
    } catch (err) {
        //При любом сбое считаем что браузер по какой-то причине несовместим
        return false;
    }
    return true;
};

/* Функция определения текущего браузера с версией */
function getBrowserWithVersion() {
    try {
        var currentBrowserWithVersion = (function(){
            var ua= navigator.userAgent, tem,
                M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
            if(/trident/i.test(M[1])){
                tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
                return 'IE '+(tem[1] || '');
            }
            if(M[1]=== 'Chrome'){
                tem= ua.match(/\bOPR\/(\d+)/);
                if(tem!= null) return 'Opera '+tem[1];
            }
            M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
            if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
            return M.join(' ');
        })();

        return currentBrowserWithVersion;
    } catch (err) {
        //При любом сбое считаем что браузер по какой-то причине несовместим
        return undefined;
    }
};