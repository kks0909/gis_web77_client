// VERSION 4.3.1.2
var MAX_LEN = 1000; // максимальная высота над поверхностью (выше - ничего не видно)
var highlightedObject = null; // подсвеченный объект
/* Устанавливает камеру в точку с географическими координатами x, y и областью видимости len.
    Высота над землей расчитывается автоматически для охвата территории длиной len.
    x - долгота, y - широта (везде)
 */
var header = "";
 
function setPositionToXYL (x, y, len)
{
    if (len < MAX_LEN)
    {
        setPositionToXYH(x,y, len);
    }
    else
    {
        setPositionToXYH(x, y, MAX_LEN);
    }
}
/* Устанавливает камеру в точку с географическими координатами x, y и высота над землей в этой точке (м) - h.
 */
function setPositionToXYH(x, y, h)
{
    var en = getEngine();
    var dPos = getPointByXYH(y, x, h);
    var s = "";
    if (!setCurrentPositionFromArray(dPos, en))
    {
        writeToLog('DEBUG_3D', '[DEBUG 3D ADD] : Невозможно обработать сообщение синхронизации - в указанной точке не найдена поверхность.');
    }
}
/* Устанавливает камеру в точку с географическими координатами x, y, z.
 */
function setPositionToXYZ(x, y, z)
{
    var en = getEngine();
    var dPos = getPointByXYZ(y, x, z);
    if (!setCurrentPositionFromArray(dPos, en))
    {
        writeToLog('DEBUG_3D', '[DEBUG 3D ADD] : Невозможно обработать сообщение синхронизации - в указанной точке не найдена поверхность.');
    }
}
/* Устанавливает камеру в точку с географическими координатами x, y, z
 */
function setPositionToPoint(x, y, z)
{
    var en = getEngine();
    var dPos = getPointByXYZ(y, x, z);
    if (!setCurrentPositionFromArray(dPos, en))
    {
        writeToLog('DEBUG_3D', '[DEBUG 3D ADD] : Невозможно обработать сообщение синхронизации - в указанной точке не найдена поверхность.');
    }
}
/* Добавляет объект на сцену из XML описания.
    url - адрес xml файла
    xslUrl - адрес xsl преобразования
    params - параметры
 */
function addObjectFromXML(url, xslUrl, params)
{
    var en = getEngine();
    var c = getStringSceneCenter(en);
    //var beginTime = new Date();
    if (header == "")
    {
        var headXML = new ActiveXObject('Msxml2.DOMDocument.5.0');
        headXML.loadXML("<root></root>");
        var headXSLT = new ActiveXObject('MSXML2.FreeThreadedDOMDocument.5.0');
        headXSLT.load("base_vrml.xslt");
        headXSL = new ActiveXObject("Msxml2.XSLTemplate.5.0");
        headXSL.stylesheet = headXSLT;
        var headXSLProc = headXSL.createProcessor();
        headXSLProc.input = headXML;
        headXSLProc.addParameter("geocoord", c, "");
        headXSLProc.transform();
        header = headXSLProc.output;
    }
    var tstXML = new ActiveXObject('Msxml2.DOMDocument.5.0');
    tstXML.async = false;
    tstXML.validateOnParse = false;
    tstXML.load(url);
    var objXSLT=new ActiveXObject('MSXML2.FreeThreadedDOMDocument.5.0');
    objXSLT.async = false;
    objXSLT.load(xslUrl);

    objCache   = new ActiveXObject("Msxml2.XSLTemplate.5.0");
    objCache.stylesheet = objXSLT;

    // установка параметров!
    var objXSLTProc = objCache.createProcessor();
    objXSLTProc.input = tstXML;
    objXSLTProc.addParameter("geocoord", c, ""); // координаты центра сцены
    //Установка доп. параметров преобразования
    if (params != '')
    {
        var pair = params.split('#');
        var val = null;
        for (var i=0; i<pair.length; i++)
        {
            val = pair[i].split('=');
            if ((val[0] != '') && (val.length > 1))
            {
                objXSLTProc.addParameter(val[0], val[1], "");
            }
        }
    }
    objXSLTProc.transform();
    var t = objXSLTProc.output;
    writeToLog('INFO_3D', '[INFO 3D ADD] На 3D сцену будет добавлено: ' + header+'\n' + t);
    en.ValidateNodes = 1;
    var resVRML = en.CreateVrmlFromString(header+'\n' + t); // MFNode
    addDataNode = resVRML.value(resVRML.Count-1);
    if (addDataNode != null)
    {
        var lName = getLayerName(addDataNode);
        if (isLayerExists(lName))
        {
            deleteLayer(lName);
        }
        var rootNodes = en.RootNodes;
        var dNode = rootNodes.Item(rootNodes.Count);
        var innerNodes = dNode.Fields.Item("children"); // MFNode
        innerNodes.Add(addDataNode);
        innerNodes.Assign(dNode.Fields.Item("children"));
        if (dataNode != null)
        {
            var origNodes = dataNode.Fields.Item("children"); // MFNode
            origNodes.Add(addDataNode.Clone());
            origNodes.Assign(dataNode.Fields.Item("children"));
            checkLayersList();
        }
    }
}
function deleteLayer(name)
{
    if (name != "")
    {
        if (isLayerExists(name))
        {
            if (isLayerVisible(name))
            {
                // видимый слой
                dropVisibleLayer(name);
                checkLayersList();
            }
            else
            {
                // невидимый слой
                dropInvisibleLayer(name);
                checkLayersList();
            }
        }
        else
        {
            writeToLog('INFO_3D', '[INFO 3D DELETE] Слой ' + name +' не найден.');
            return false;
        }
    }
    return false;
}
function checkLayersList()
{
    if (dataNode != null)
    {
        var dest = document.frames["listFrame"].document.all.item("dataDiv");
        if (dest != null)
        {
            var dStr = generateFullLayerList();
            dest.innerText = dStr;
            document.frames["listFrame"].setList();
        }
    }
}
/* Добавляет объект на сцену из VRML описания.
    url - адрес VRML файла
    params - параметры
 */
function addObjectFromVRML(url, params)
{
}
/* Выделение объекта сцены.
    id - id объекта (MI_PRINX)
    layer - имя слоя, в котором находится объект
 */
 
function hightlightObjectByIdLayer(id, layer)
{
    if (!isLayerVisible(layer))
        return false;
        
    var obj = getObjectByIdLayer(id, layer);
    if (highlightedObject == obj)
        return true;
    
    if (highlightedObject != null)
    {
        resetHighlighting();
    }
    highlightedObject = obj;
    saveColor(obj);
    return true;
}
function hightlightObject(object)
{
    var obj = object;
    if (highlightedObject == obj)
        return true;
    if (highlightedObject != null)
    {
        resetHighlighting();
    }
    highlightedObject = obj;
    saveColor(obj);
    return true;
}
/* Сброс выделения */
function resetHighlighting()
{
    if (highlightedObject != null)
    {
        restoreColor(highlightedObject);
    }
    var res = highlightedObject;
    highlightedObject = null;
    return res;
}
/* Переход к объекту сцены.
    id - id объекта (MI_PRINX)
    layer - имя слоя, в котором находится объект
    h - расстояние до объекта, на котором установить камеру
    position - флаг, указывающий, какое направление оси z камеры установить.
        -n - попытаться автоматически определить положение камеры, если не получиться, то расположить, как при флаге n
        0 - под углом 45
        1 - сверху (к центру земли)
        2 - снизу (от центра земли)
        х4 - слева 
        х8 - справа
        х16 - прямо (вдоль поверхности земли по направлению текущей)
        х32 - сбоку (под углом 45 к поверхности, направления задаются 1, 2 и 3 битами)
 */
function gotoObject(id, layer, h, position)
{
    // Проверяем видимость слоя
    if (!isLayerVisible(layer))
    {
        // найден среди невидимых
        alert("Слой, на котором находится объект невидим.\nСделайте слой "+layer+" видимым.");
        return false;
    }
    if (!isLayerExists(layer))
    {
        // слой не найден
        alert("Слой содержащий объект не добавлен.\nДобавьте слой "+layer+" на сцену.");
        return false;
    }
        
    var obj = getObjectByIdLayer(id, layer);
    if (obj == null)
    {
        alert("В слое "+layer+" выбранный объект не найден.\nВыделение невозможно.");
        return false; // объект не найден
    }
    
    hightlightObject(obj);   // подсветка объекта!    
    var objBound = obj.Bounds;
    var i=0;
    var newPos = new Array();
    var curPos = getEngine().ViewpointPosition;
    var len = 0;
    for (i=3; i<6; i++)
    {
        len += Math.pow(objBound.getItem(i), 2);
    }
    len = Math.sqrt(len);
    
    if (position < 0)
    {
        // пытаемся определить положение автоматически
        // если возможно, ставим камеру так, чтобы объект был виден полностью
        
        if (len <= MAX_LEN)
        { // объект можно показывать
            if ((h > 0) && (h < MAX_LEN))
            { // встаем на расстоянии h
                newPos[0] = objBound.getItem(0) + objBound.getItem(3)/2. + h*curPos.getItem(9);
                newPos[1] = objBound.getItem(1) + objBound.getItem(4)/2. + h*curPos.getItem(10);
                newPos[2] = objBound.getItem(2) + objBound.getItem(5)/2. + h*curPos.getItem(11);
            }
            else
            { // встаем на расстоянии len
                newPos[0] = objBound.getItem(0) + objBound.getItem(3)/2. + len*curPos.getItem(9);
                newPos[1] = objBound.getItem(1) + objBound.getItem(4)/2. + len*curPos.getItem(10);
                newPos[2] = objBound.getItem(2) + objBound.getItem(5)/2. + len*curPos.getItem(11);
            }
            setCurrentPositionFromArray(newPos, null);
            return true;
        }
    }
    if (position >= 0)
    { 
        if (len > MAX_LEN)
        {
            // объект слишком большой, берем первую точку
            var coordData =  getGroupGeometry(obj).Coord;
            newPos[0] = coordData.x(1);
            newPos[1] = coordData.y(1);
            newPos[2] = coordData.z(1);
        }
        else
        {
            for (i=0; i<3; i++)
            {
                newPos[i] = objBound.getItem(i) + objBound.getItem(i+3)/2.;
            }
        }
        var en = getEngine();
        var camVertex = getCameraPositionToPoint(newPos, position, en); // направление камеры
        setCameraPositionFromArray(camVertex, en);
        if (h > 0 && h <= MAX_LEN)
        {
            n = h;
        }
        else
        {
            if (h < 0)
            {
                n = len;
            }
            else
            {
                n = MAX_LEN;
            }
        }
        for (i=0; i<3; i++)
        {
            newPos[i] += n*camVertex[i+6];
        }
        setCurrentPositionFromArray(newPos, en);
        return true;
    }
}
/* Переход к объекту сцены.
    x, y - географические координаты
    id - id объекта (MI_PRINX)
    layer - имя слоя, в котором находится объект
    h - расстояние до объекта, на котором установить камеру
    position - флаг, указывающий, какое направление оси z камеры установить.
        -n - попытаться автоматически определить положение камеры, если не получиться, то расположить, как при флаге n
        0 - оставить, как есть
        1 - сверху (к центру земли)
        2 - снизу (от центра земли)
        х4 - слева 
        х8 - справа
        х16 - прямо (вдоль поверхности земли по направлению текущей)
        х32 - сбоку (под углом 45 к поверхности, направления задаются 1, 2 и 3 битами)
 */
function gotoObjectByXYId(x, y, id, layer, h, position)
{
    // 1. Проверяем, что слой не отключен
    // 2. Получаем объект сцены
    
    // Проверяем видимость слоя
    if (!isLayerVisible(layer))
        return false;
    
    var obj = getObjectByIdLayer(id, layer);
    if (obj == null)
        return false; // объект не найден
    
    hightlightObject(obj);   // подсветка объекта!    
    var objBound = obj.Bounds;
    var i=0;
    var newPos;
    var n = 1;
    if ((h < 0) || (position < 0))
    {
        var len = 0;
        for (i=3; i<6; i++)
        {
            len += Math.pow(objBound.getItem(i), 2);
        }
        len = Math.sqrt(len);
        n = len;
    }
    else
    {
        if (h < MAX_LEN)
        {
            n = h;
        }
        else
        {
            n = h;
        }
    }
    var h = getEarthSurfaceH(y, x);
    newPos = getPointByXYH(y, x, h);
    var en = getEngine();
    var camVertex = getCameraPositionToPoint(newPos, position, en); // направление камеры
    setCameraPositionFromArray(camVertex, en);
    for (i=0; i<3; i++)
    {
        newPos[i] += n*camVertex[i+6];
    }
    setCurrentPositionFromArray(newPos, en);
    return true;
}
/* Получение дополнительной информации об объекте
 */
function getInfo(obj)
{
    if (obj != null)
    {
        if (getMetadataValueByName(obj, '_sync') != '1')
        {
            var id = getMetadataValueByName(obj, 'id');
            var layerName = getMetadataValueByName(obj, 'class');
            
            if (window.external != null) // значит втроено в приложение
            {
                return setInfo(window.external.getInfo(id, layerName));
            }
            else // пытаемся достучаться до flash - значит данные будут получены асинхронно!
            {
                //return '';
            }
        }
    }
    return null;
}
/* Установка информации об объекте - результат запроса (XML)
 */
function setInfo(data)
{
    var xmlDoc = new ActiveXObject('Msxml2.DOMDocument.5.0');
    xmlDoc.async = false;
    xmlDoc.validateOnParse = false;
    xmlDoc.loadXML(data);
    var elem = xmlDoc.selectSingleNode('//item');
    var id = elem.getAttribute('id');
    var layer = elem.getAttribute('class');
    var obj = getObjectByIdLayer(id, layer);
    if (obj != null)
    {
        var attr = elem.attributes;
        if (obj != null)
        {
            // добавляем в метаданные
            for (var i=0; i<attr.length; i++)
            {
                setMetadataValue(obj, attr[i].name, attr[i].value);
            }
            setMetadataValue(obj, '_sync', '1');
        }
        refreshData(id, layer, elem.xml);
    }
}
/* Оповещение внешних приложений о загрузке сцены
 */
function infoSceneLoad()
{
    if (window.external != null) // значит втроено в приложение
    {
        try
        {
            window.external.onSceneLoad();
        }
        catch (err) {}
    }
    else // пытаемся достучаться до flash - значит данные будут получены асинхронно!
    {
        //return '';
    }
}
/* Функция общего назначения. Для добавления функционала без изменения ядра АП.
    Пока никакой функциональности не реализует. 
*/
function generalFunc(str)
{
}
/* 
*/
function writeToLog(status, mess)
{
    if (window.external != null) // значит втроено в приложение
    {
        try
        {
            window.external.logMessage(status, mess);
        }
        catch (err)
        {
            //alert("Ошибка при попытке записи в лог " + err.description);
        }
    }
}
/* Оповещение внешних приложений об изменении положения камеры
 */
function infoChangePosition(newPosition)
{
    var data;
    var i = 0;
    if (newPosition != null)
    {
        if (typeof(newPosition) == undefined)
        { // Variant
            data = getVariantGeoPosition(newPosition);
        }
        else
        { // массив
            data = getArrayGeoPosition(newPosition);
        }
    }
    else
    {
        var en = getEngine();
        data = getCurrentGeoPosition(en);
    }
    if (data == null)
        return null;
        
    var hEarth = getEarthSurfaceH(data[0], data[1]);
    if (window.external != null) // значит втроено в приложение
    {
        try
        {
            window.external.setMapCenter(data[1], data[0], Math.max(Math.abs(data[2] - hEarth), 20));
        }
        catch (err)
        {
            // пытаемся достучаться до flash
            //alert("Ошибка синхронизации " + err.description);
        }
    }
    else // пытаемся достучаться до flash
    {
    
    }
}