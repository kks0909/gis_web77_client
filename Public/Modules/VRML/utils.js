// VERSION 4.3.1.1
var SCENE_CENTER = null;
var SURFACE_LAYER_NAME = "Поверхность"; // имя атрибута class у поверхности земли
var savedColors = new Array();

/* выделение параметра с именем name из строки param=value&param1=value1 */
function GetParam(search, name)
{
    name=name+"=";
    var gp="";
    if (search!='') 
    {
        if (search.indexOf (name, 0)!= -1)
        {
            var startpos=search.indexOf(name, 0)+name.length;
            var endpos=search.indexOf("&",startpos);
            if (endpos < startpos) {endpos=search.length;}
            var gp=p.substring(startpos,endpos);
        } 
        else 
        {
            gp=""; 
        }
    }
    else 
    {
        gp="";
    }
    return gp;
}
/* Получение CortonaEngine
*/
function getEngine()
{
    return document.getElementById('SceneIE').Engine;
}
/* Получение строки с координатами центра сцены
*/
function getStringSceneCenter(engine)
{
    if (engine == null)
        engine = getEngine();
    if (engine != null)
    {
        try
        {
            if (engine.Nodes.Item("ORIGIN") != null)
            {
                return String(engine.Nodes.Item("ORIGIN").Fields.Item("geoCoords").value);
            }
        }
        catch (err)
        {}
    }
    return null;
}
/* Получение массива с координатами центра сцены
*/
function getSceneCenter(engine)
{
    if (SCENE_CENTER != null)
        return SCENE_CENTER;
        
    if (engine == null)
        engine = getEngine();
    if (engine != null)
    {
        var s = getStringSceneCenter(engine);
        if (s != null)
        {
            var scCenter = s.split(' ');
            var SCENE_CENTER = new Array();
            for (var i=0; i<scCenter.length; i++)
            {
                SCENE_CENTER[i] = Number(scCenter[i]);
            }
            return SCENE_CENTER;
        }
    }
    return null;
}

/* Установка текущей позиции камеры из массива
*/
function setCurrentPositionFromArray(data, engine)
{
    if (data != null)
    {
	    if (data[0] == null || isNaN(data[0]))
		    return false;

        if (engine == null)
        {
            engine = getEngine();
        }
        if (engine == null)
            return false;
        var m = engine.CreateMatrix();
        var p = engine.ViewpointPosition;
        m.position = p;
        for (var i=0; i<3; i++)
        {
            m.value(3, i) = data[i];
        }
        p = m.position;
        engine.ViewpointPosition = p;
        return true;
    }
}
/* Установка направления камеры из массива
*/
function setCameraPositionFromArray(data, engine)
{
    if (data != null)
    {
        if (engine == null)
        {
            engine = getEngine();
        }
        if (engine == null)
            return false;
        var m = engine.CreateMatrix();
        var p = engine.ViewpointPosition;
        m.position = p;
        for (var j=0; j < 3; j++)
        {
            for (var i=0; i<3; i++)
            {
                m.value(j, i) = data[j*3+i];
            }
        }
        p = m.position;
        engine.ViewpointPosition = p;
        return true;
    }
}
/* Получение массива с текущими географическими координатами
*/
function getCurrentGeoPosition(engine)
{
    var p = engine.ViewpointPosition;
    var pos = new Array();
    var scCenter = getSceneCenter(engine); // центр сцены
    
    if (scCenter == null)
        return null;
        
    var i = 0;
    for (i=0; i<3; i++)
    {
        pos[i] = p.getItem(i) + scCenter[i];
    }
    var geoP = Dekart2Geo(pos);
    return geoP;
}
/* Получение массива с географическими координатами точки
    point - Variant с декартовыми координатами точки
*/
function getVariantGeoPosition(point)
{
    var c = getSceneCenter(null);
    if (c == null)
        return null;
        
    var p = new Array();
    for (var i=0; i<3; i++)
    {
        p[i] = point.getItem(i) + c[i];
    }
    var geo = Dekart2Geo(p);
    return geo;
}
/* Получение массива с географическими координатами точки
    point - Array с декартовыми координатами точки
*/
function getArrayGeoPosition(point)
{
    var c = getSceneCenter(null);
    if (c == null)
        return null;
        
    var p = new Array();
    for (var i=0; i<3; i++)
    {
        p[i] = point[i] + c[i];
    }
    var geo = Dekart2Geo(p);
    return geo;
}
/* Получение точки сцены по гео-координатам
    geo - Array с геокоординатами
*/
function getPointByGeo(geo)
{
    if (geo != null)
    {
        var c = getSceneCenter();
        if (c == null)
            return null;
            
        var p = Geo2Dekart(geo);
        for (var i=0; i<3; i++) // отнимаем координаты центра сцены
        {
            p[i] -= c[i];
        }
        return p;
    }
    return null;
}
/* Получение точки сцены по гео-координатам
*/
function getPointByXYZ(x, y, z)
{
    var c = getSceneCenter();
    if (c == null)
        return null;
    var outP = new Array();
    outP[0] = Number(x);
    outP[1] = Number(y);
    outP[2] = Number(z);
    var p = Geo2Dekart(outP);
    for (var i=0; i<3; i++) // отнимаем координаты центра сцены
    {
        p[i] -= c[i];
    }
    return p;
}
/* Получение точки сцены по x,y (широта, долгота)-координатам и высоте НАД ЗЕМЛЕЙ
*/
function getPointByXYH(x, y, h)
{
    var c = getSceneCenter();
    if (c == null)
        return null;
    // p - точка на уровне моря
    var dh = getEarthSurfaceH(x, y);
    if (!isNaN(dh))
    {
        var p = Geo2Dekart([x, y, (Number(h)+Number(dh))]);
        for (var i=0; i<3; i++) // отнимаем координаты центра сцены
        {
            p[i] -= c[i];
        }
        return p;
    }
    else
    {
        return null;
    }
}
/* Получение вектора "от земли" в точке 
    point - Variant с декартовыми координатами точки
 */
function getUpVectorByVariant(point, engine)
{
    if (engine == null)
        engine = getEngine();
    if (engine == null)
        return null;
    
    var geoP = getVariantGeoPosition(point);
    geoP[2] += 1; // на метр выше текущей
    var upP = getPointByGeo(geoP);
    var result = new Array();
    for (var i=0; i<3; i++)
    {
        result[i] = upP[i] - point.getItem(i);
    }
    return result;
}
function getUpVectorByArray(point, engine)
{
    if (engine == null)
        engine = getEngine();
    if (engine == null)
        return null;
        
    var geoP = getArrayGeoPosition(point);
    geoP[2] += 1; // на метр выше текущей
    var upP = getPointByGeo(geoP);
    var result = new Array();
    for (var i=0; i<3; i++)
    {
        result[i] = upP[i] - point[i];
    }
    return result;
}
/* Получение высоты земли относительно уровня моря в точке с геокоординатами X,Y
*/
function getEarthSurfaceH(x, y)
{
    var en = getEngine();
    var c = getSceneCenter(en);
    if (c == null)
        return null;
        
    var p0 = Geo2Dekart([x, y, 0]);
    var p1 = Geo2Dekart([x, y, 1]);
    var aP = new Array();
    var i;
    // p - точка на уровне моря
    // ищем землю
    var v = new Array(); // вектор для поиска земли
    for (i=0; i<3; i++)
    {
        v[i] = p1[i] - p0[i];
        aP[i] = p0[i] - c[i];
    }
    var sPoint = en.CreateMatrix(); // просто для создания variant!
    var sVec = en.CreateMatrix();
    //var sVec = en.PointTo3D(1, 1, 1);
    for (i=0; i<3; i++)
    {
        sPoint.value(3, i) = aP[i];
     	//sVec.setItem(i, v[i]);
	sVec.value(3, i) = v[i];
    }

    var sPp = sPoint.position;
    var sVp = sVec.position;
    var dl;
    try
	{
        dl = en.DistanceAlong(sPp, sVp);
    	
        var objs = en.TouchNodes;
        var gr;
        var node;
        while ((objs != null) && (objs.Count != 0))
        { // проверяем, какой объект задели
            for (i=objs.Count-1; i>=0; i--)
            {
               gr = objs.GetValue(i);
               if ((gr.TypeName == "Group") && (getGroupName(gr) == SURFACE_LAYER_NAME))
               {
                    i = -2;
                    en.ClearSkipNodes();
                    return dl;
               } 
            }
            node = objs.GetValue(objs.Count - 1);
            en.AddSkipNode(node); // убираем объект с обозрения
            dl = en.DistanceAlong(sPp, sVp);
            objs = en.TouchNodes;
        }
	}
    catch (err)
    {
	    //return NaN;
    }
    // если не нашли, то разворачиваем вектор вниз
    for (i=0; i<3; i++)
    {
        sVec.value(3, i) = -v[i];
    }
    sVp = sVec.position;
    try
    {
        dl = en.DistanceAlong(sPp, sVp);
        objs = en.TouchNodes;
        while ((objs != null) && (objs.Count != 0))
        { // проверяем, какой объект задели
            for (i=objs.Count-1; i>=0; i--)
            {
               gr = objs.GetValue(i);
               if ((gr.TypeName == "Group") && (getGroupName(gr) == SURFACE_LAYER_NAME))
               {
                    i = -2;
                    en.ClearSkipNodes();
                    return -dl;
               } 
            }
            node = objs.GetValue(objs.Count - 1);
            en.AddSkipNode(node); // убираем объект с обозрения
            dl = en.DistanceAlong(sPp, sVp);
            objs = en.TouchNodes;
        }
    }
    catch (err)
    {

    }
    en.ClearSkipNodes();
    return NaN;
}
/* Расчет положения камеры. 
    param:
        0 - под 45; 
        1 - сверху; 
        2 - снизу */
function getCameraPositionToPoint(point, param, engine)
{
    if ((point != null) && (param <= 2))
    {
        if (engine == null)
            engine = getEngine();
        if (engine == null)
            return null;
        
        var p = engine.ViewpointPosition;
        var vUp = getUpVectorByArray(point); // направление от земли
        var i=0;
        var result = new Array(); // текущее положение камеры
        var vX;
        var vY;
        var vZ = new Array();
        var n = 0;
        for (i=3; i < 12; i++)
        {
            result[i-3] = p.getItem(i);
        }
        if (param == 0)
        { // ставим под 45 к оси
            for (i=0; i<3; i++)
            {
                vZ[i] = result[i+6];
            }
            n = scalMult(vZ, vUp);
            for (i=0; i<3; i++)
            {
                vZ[i] -= n*vUp[i];
            }
            normalize(vZ);
            for (i=0; i<3; i++)
            {
                vZ[i] += vUp[i];
            }
            normalize(vZ); // вот это ось Z
            // далее ортонормируем остальные оси
        }
        else
        {
            n = 1;
            if (param == 2)
            {
                // разворачиваем z
                n = -1;
            }
            for (i=0; i<3; i++)
            {
                vZ[i] = n*vUp[i];
            }
        }
        vX = new Array();
        for (i=0; i<3; i++)
        {
            vX[i] = result[i];
        }
        n = scalMult(vX, vZ);
        for (i=0; i<3; i++)
        {
            vX[i] -= n*vZ[i];
        }
        normalize(vX);
        vY = vectMult(vZ, vX);
        for (i=0; i<3; i++)
        {
            result[i] = vX[i];
            result[i+3] = vY[i];
            result[i+6] = vZ[i];
        }
        return result;
    }
}
/* Расчет базиса для объекта. 
    param:
        0 - под 45; 
        1 - сверху; 
        2 - снизу */

function getObjectVertex(obj, param)
{
    if ((obj != null) && (param <= 2))
    {
        var en = getEngine();
        var p = new Array();
        var result = new Array();
        var gBox = obj.Bounds;
        var i=0;
        for (i=0; i<3; i++)
        {
            p[i] = gBox.getItem(i);
        }
        var upV = getUpVectorByArray(p); // вектор вверх (y)
        var yV = [0, 1, 0];
        var xV;
        
        if (param > 0)
        {
            var n = scalMult(upV, yV);
            for (i=0; i<3; i++)
            {
                yV[i] -= n*upV[i];
            }
            xV = vectMult(yV, upV); // вектор z
            if (param == 1)
            {
                for (i=0; i<3; i++)
                {
                  result[i] = -xV[i];
                  result[i+3] = yV[i];
                  result[i+6] = -upV[i];  
                }
            }
            if (param == 2)
            {
                for (i=0; i<3; i++)
                {
                  result[i] = xV[i];
                  result[i+3] = yV[i];
                  result[i+6] = upV[i];  
                }
            }
        }
        else
        { // под углом 45
            
        }
    }
    return null;
}
/*Получение объекта сцены по id и имени слоя*/
function getObjectByIdLayer(id, layerName)
{
    var en = getEngine();
    var root = en.RootNodes;
    var dataRoot = root.Item(root.Count); // узел с данными последний
    var layerList = dataRoot.Fields.Item("children");     // список групп=список слоев
    var layer = null;
    var i = 0;
    var s = ''
    while ((layer == null) && (i<layerList.Count))
    {
        layer = layerList.value(i);
        if (layer.TypeName == 'Group')
        {
            if (getLayerName(layer) != layerName)
            {
                layer = null;
            }
        }
        else
        {
            layer = null;
        }
        i++;
    }
    if (layer == null)
        return null;
    // ищем объект в слое
    var objList = layer.Fields.Item("children");
    var obj = null;
    i = 0;
    while ((obj == null) && (i<objList.Count))
    {
        obj = objList.value(i);
        if (obj.TypeName == 'Group')
        {
            if (getMetadataValueByName(obj, 'id') != id)
            {
                obj = null;
            }
        }
        else
        {
            obj = null;
        }
        i++;
    }
    return obj;
}
/* Получение пользовательского имени слоя
*/
function getGroupName(group)
{
    var n = '';
    var n = getMetadataValueByName(group, '#layer_group');
    return n;
}
/* Получение имени слоя (имя таблицы)
*/
function getLayerName(group)
{
    var n = '';
    var n = getMetadataValueByName(group, '#layer_name');
    return n;
}
/* Получение значения свойства из метаданных по имени */
function getMetadataValueByName(obj, name)
{
    if ((obj != null) && (name != ''))
    {
        var meta = getGroupMetadata(obj);
        var i=0;
        var val = '';
        while (i < meta.Count)
        {
            val = meta.value(i);
            if (name == val)
            {
                return meta.value(i+1);
            }
            i+=2;
        }
    }
    return null;
}
/* Добавление метаданных */
function setMetadataValue(obj, name, value)
{
    if ((obj != null) && (name != ''))
    {
        var meta = getGroupMetadata(obj);
        if (getMetadataValueByName(obj, name) != null)
        {
            var i=0;
            var val = '';
            while (i < meta.Count)
            {
                val = meta.value(i);
                if (name == val)
                {
                    meta.SetValue(i+1, value);
                    return true;
                }
                i+=2;
            }
       }
       else
       {
            meta.Add(name);
            meta.Add(value);
            return true;
       }
    }
    return false;
}
/* Получение MFString с метаданными
*/
function getGroupMetadata(group)
{
    return group.Fields.Item("children").value(0).Fields.Item("summary");
}
/* */
function getGroupGeometry(group)
{
    return obj.Fields.Item("children").value(obj.Fields.Item("children").Count - 1).Fields.Item("geometry").value;
}
/*------------------------------------------------------------------
                        Работа со слоями
--------------------------------------------------------------------*/
/* Определение видимости слоя. На существование не проверяется */
function isLayerVisible(name)
{
    if (invisibleNodes == null)
        return true;
    var i=0;
    for (i=0; i<invisibleNodes.Count; i++)
    {
        if (getLayerName(invisibleNodes.value(i)) == name)
            return false;
    }
    return true;
}
function isLayerExists(name)
{
    var ch;
    if (dataNode != null)
    {
        ch = dataNode.Fields.Item("children");
    }
    else
    {
        var rootNodes = getEngine().RootNodes;
        var chNodes = rootNodes.Item(rootNodes.Count).Fields; // список слоев
        ch = chNodes.Item("children");
    }
    var o;
    for (var i=0; i<ch.Count; i++)
    {
        o = ch.value(i);
        if (o.TypeName == "Group")
        {   
            if (getLayerName(o) == name)
            {
                return true;
            }
        }
    }
    // если dataNode = null, то невидимых слоев нет
    return false;
}
function dropVisibleLayer(name)
{
    var rootNodes = getEngine().RootNodes;
    var rootNode = rootNodes.Item(rootNodes.Count);
    var chNodes = rootNodes.Item(rootNodes.Count).Fields; // список слоев
    var ch = chNodes.Item("children");
    var o;
    var f = false;
    for (var i=0; i<ch.Count; i++)
    {
        o = ch.value(i);
        if (o.TypeName == "Group")
        {   
            if (getLayerName(o) == name)
            {
                ch.Remove(i);
                rootNode.Validate();
                f = true;
            }
        }
    }
    if (f && (dataNode != null))
    {
        ch = dataNode.Fields.Item("children");
        for (var i=0; i<ch.Count; i++)
        {
            o = ch.value(i);
            if (o.TypeName == "Group")
            {   
                if (getLayerName(o) == name)
                {
                    ch.Remove(i);
                    //dataNode.Validate();
                    ch.Assign(dataNode.Fields.Item("children"));
                    return true;
                }
            }
        }
    }
    return f;
}
function dropInvisibleLayer(name)
{
    if (invisibleNodes == null)
        return true;
    var i=0;
    var f = false;
    for (i=0; i<invisibleNodes.Count; i++)
    {
        if (getLayerName(invisibleNodes.value(i)) == name)
        {
            invisibleNodes.Remove(i);
            f = true;
        }
    }
    if (f && (dataNode != null))
    {
        var ch = dataNode.Fields.Item("children");
        for (var i=0; i<ch.Count; i++)
        {
            o = ch.value(i);
            if (o.TypeName == "Group")
            {   
                if (getLayerName(o) == name)
                {
                    ch.Remove(i);
                    //dataNode.Validate();
                    ch.Assign(dataNode.Fields.Item("children"));
                    return true;
                }
            }
        }
    }
    return f;
}
function generatelayerXML(item)
{
    if (item != null)
    {
        if (item.TypeName == "Group")
        {   
            var res = '<item visible="true" name="' + getGroupName(item)+ '"/>';
            return res;
        }
    }
    return "";
}
/*------------------------------------------------------------------
            Подсветка объектов
-------------------------------------------------------------------*/
function getHighlightInterpolator(engine)
{
    if (engine == null)
        engine = getEngine();
    if (engine != null)
    {
        return engine.Nodes.Item("highlightInt");
    }
    return null;
}
function setHighlighting(material)
{
    var en = getEngine();
    var highlightColor = getHighlightInterpolator();
    en.AddRoute(highlightColor, 'value_changed', material, 'set_emissiveColor');
}
function removeHighlighting(material)
{
    var en = getEngine();
    var highlightColor = getHighlightInterpolator();
    en.RemoveRoute(highlightColor, 'value_changed', material, 'set_emissiveColor');
}
function saveColor(obj)
{
    // сохранение цветов в порядке следования
    var chNodes = null;
    var n = 0;
    var m = 0;
    if (obj.TypeName == undefined)
    {
        return;
    }
    if (obj.TypeName == 'MFNode')
    {
        chNodes = obj;
        m = chNodes.Count-1;
    }
    else
    {
        chNodes = obj.Fields;
        n = 1;
        m = chNodes.Count;
    }
    var i = 0;
    var ch = null;
    var color = null;
    for (i=n; i <= m; i++)
    {
        if (chNodes.TypeName == 'MFNode')
        {
            ch = chNodes.value(i);
        }
        else
        {
            ch = chNodes.Item(i);
        }
        if ('SFNode' == ch.TypeName)
        {
            ch = ch.value;
        }
        if (ch.TypeName.toLowerCase() == 'appearance')
        {
            // сохраняем
            material = ch.Fields.Item("material").value;
            savedColors.push(material.Clone());
            setHighlighting(material);
        }
        else
        { // другой узел 
            if ((ch.Name == 'children') || (ch.TypeName == 'Transform') || (ch.TypeName == 'Shape') || (ch.TypeName == 'GeoLocation'))
            {   
                saveColor(ch);
            }
        }
    }
}

function restoreColor(obj)
{
    if (savedColors.length > 0)
    {
        // восстановление цветов
        var chNodes = null;
        var n = 0;
        var m = 0;
        var col = null;
        if (obj.TypeName == undefined)
        {
            return;
        }
        if (obj.TypeName == 'MFNode')
        {
            chNodes = obj;
            m = chNodes.Count-1;
        }
        else
        {
            chNodes = obj.Fields;
            n = 1;
            m = chNodes.Count;
        }
        var i = 0;
        var ch = null;
        var color = null;
        for (i=n; i <= m; i++)
        {
            if (chNodes.TypeName == 'MFNode')
            {
                ch = chNodes.value(i);
            }
            else
            {
                ch = chNodes.Item(i);
            }
            if ('SFNode' == ch.TypeName)
            {
                ch = ch.value;
            }
            if (ch.TypeName.toLowerCase() == 'appearance')
            {
                // восстанавливаем
                setHighlighting(ch.Fields.Item("material").value);
                col = savedColors.shift();
                ch.Fields.Item("material").value = col;
            }
            else
            { // другой узел 
                if ((ch.Name == 'children') || (ch.TypeName == 'Transform') || (ch.TypeName == 'Shape') || (ch.TypeName == 'GeoLocation'))
                {   
                    restoreColor(ch);
                }
            }
        }
   }
}
/*-----------------------------------------------------------------
                Преобразование векторов
------------------------------------------------------------------*/
function normalize(vect) // нормализация вектора
{
    var l = len(vect);
    for (var i=0; i<3; i++)
    {
        vect[i] /= l;
    }
}
function len(vect) // длина вектора
{
    var len = 0;
    for (var i=0; i<3; i++)
    {
        len += vect[i]*vect[i];
    }
    len = Math.sqrt(len);
    return len;
}
function vectMult(v1, v2) // векторное произведение
{
    var res = new Array();
    res[0] = v1[1]*v2[2] - v1[2]*v2[1];
    res[1] = v1[2]*v2[0] - v1[0]*v2[2];
    res[2] = v1[0]*v2[1] - v1[1]*v2[0];
    return res;
}
function scalMult(v1, v2) // векторное произведение
{
    var res = 0;
    for (var i=0; i<3; i++)
    {
        res += v1[i]*v2[i];
    }
    return res;
}
/**----------------------------------------------------------------
                    Преобразование координат
-------------------------------------------------------------------*/
function Dekart2Geo(dekCoord)
{
    if (dekCoord == null)
        return;
         
    var a1 = 6378137;
	var e1 = 0.00669438;

	var l2 = Math.atan(dekCoord[1]/dekCoord[0]);
	var b2 = 0;
	var N2 = 0;
	var geoCoord = new Array();
	for(var j = 0; j < 15; j++)  //количество итераций - степень точности
	{
		N2 = a1 / Math.sqrt(1 - e1 * Math.pow(Math.sin(b2), 2));
		b2 = Math.atan((dekCoord[2] + e1 * N2 * Math.sin(b2)) / Math.sqrt(dekCoord[0] * dekCoord[0] + dekCoord[1] * dekCoord[1]));
	}
	geoCoord[0] = b2 * 180 / Math.PI;
	geoCoord[1] = l2 * 180 / Math.PI;
	geoCoord[2] = dekCoord[0] / Math.cos(l2) / Math.cos(b2) - N2;
	
	return geoCoord;
}
function Geo2Dekart(geoCoord)
{
    if (geoCoord == null) 
        return;
	var a1 = 6378137;
	var e1 = 0.00669438;
	////смотреть здесь возможно перепутаны x и y c b и l
	var b1 = geoCoord[0] * Math.PI/180;
	var l1 = geoCoord[1] * Math.PI/180;
	var h1 = geoCoord[2];
	//Параметры эллипсоида WGS
	var N1 = a1/Math.sqrt(1-e1*Math.sin(b1)*Math.sin(b1));
	var dekCoord = new Array();
	//Геоцентрические прямоугольные координаты в CK-42
	dekCoord[0] = (N1+h1)*Math.cos(b1)*Math.cos(l1);
	dekCoord[1] = (N1+h1)*Math.cos(b1)*Math.sin(l1);
	dekCoord[2] = ((1-e1)*N1+h1)*Math.sin(b1);
	
	return dekCoord;
}