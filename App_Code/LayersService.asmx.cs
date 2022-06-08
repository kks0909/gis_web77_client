//7.0.0.0
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Web.Services;
using System.Xml.XPath;
using System.Globalization;
using System.Configuration;
using System.Threading;
using X3M.Core.Common.Configuration;
using X3M.Core.Common.Logging;
using X3M.GeoLib;
using System.Xml;
using System.Collections;
//Построение рамки геообъектов запроса средствами NetTopologySuite (GeoAPI)
using GeoAPI.Geometries;
using GisSharpBlog.NetTopologySuite.IO;
using GisSharpBlog.NetTopologySuite.Geometries;
using Common.Spatial.Geometry;
using CLSpatial.CoordinateSystems;
using System.Transactions;

namespace ASL
{
    /// <summary>
    /// Служба доступа к данным
    /// </summary>
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    public class LayersService : WebService
    {
        private static string path;
        private static string mPath;


        static LayersService()
        {
            
        }

        [WebMethod]
        /// <summary>
        /// Получает для запроса геометрии слоя рамку для центровки на этом слое
        /// </summary>
        /// <returns></returns>
        public string GetBounds(string descrId, string descrType, bool getSchema, string data, bool toElements)
        {
            try
            {
                string firstRowData = data;
                //Получаем строку Web.config'а "DB_Server", по которой определяем, какой у нас тип сервера
                //Важно! Просто заменяет в строке подстроку с переменной FILTER=" 1=1 " или другую на FILTER=" 1=1 "
                string dbServer = ConfigurationManager.AppSettings["DB_Server"];
                if (dbServer == "") //ORACLE
                {
                    //Добавляем переменную FILTER="1=1", если в запросе в теге <data/> нет переменной FILTER (тогда как правило будет подставлено дефолтное значение " 1=1 ")
                    if (data.IndexOf("<data") > 0 && data.IndexOf("FILTER=\"") == -1)
                    {
                        firstRowData = data.Replace("<data", "<data FILTER=\" ROWNUM = 1 \"");
                    }
                    else
                    {
                        //В запросе в data меняем переменную FILTER="" - добавляем условие " ROWNUM = 1 AND "
                        firstRowData = data.Replace(" FILTER=\"", " FILTER=\" ROWNUM = 1 AND ");
                    }
                }
                else //MSSQL
                {
                    //Добавляем переменную FILTER="1=1", если в запросе в теге <data/> нет переменной FILTER (тогда как правило будет подставлено дефолтное значение " 1=1 ")
                    /*if (data.IndexOf("<data") > 0 && data.IndexOf("FILTER=\"") == -1)
                    {
                        firstRowData = data.Replace("<data", "<data FILTER=\" LIMIT 1 \"");
                    }
                    else
                    {
                        //В запросе в data меняем переменную FILTER="" - добавляем условие " ROWNUM = 1 AND "
                        firstRowData = data.Replace("FILTER=\"", "FILTER=\" LIMIT 1 AND ");
                    }*/
                }
                //return firstRowData;
                //Получаем данные из сервиса
                string geoResultStr = ProcessQueryNew1(descrId, descrType, getSchema, firstRowData, toElements);
                /*return geoResultStr; //Проверка - что выдаст запрос с ROWNUM */
                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.LoadXml(geoResultStr);
                if (xmlDoc.HasChildNodes)
                {
                    //общий reader для WKT
                    WKTReader wktR = new WKTReader();
                    //Прямоугольник с общими границами всех геометрий
                    Envelope boundsBox = null;
                    //Для оптимизации получаем только первую точку геометрии - это свойство Coordinate
                    ICoordinate firstCoordinate = null;
                    //Собственно обрабатываем по порядку каждый узел (вычисляем по WKT рамку текущего объекта и сравниваем с имеющейся рамкой)
                    XmlNodeList elemList = xmlDoc.GetElementsByTagName("data");
                    for (int i = 0; i < elemList.Count; i++)
                    {
                        IGeometry geometry;
                        try
                        {
                            //Парсим wkt-строку со входным объектом
                            geometry = wktR.Read(elemList[i].Attributes["WKT"].Value);

                            if (geometry != null)
                            {
                                IEnvelope tmpBox = geometry.EnvelopeInternal as IEnvelope;
                                Envelope curEnvelope = new Envelope(tmpBox.MinX, tmpBox.MaxX, tmpBox.MinY, tmpBox.MaxY);
                                if (boundsBox == null) //Если прямоугольника с общими границами еще нет - берем его у первого объекта
                                {
                                    boundsBox = curEnvelope;
                                }
                                else //Иначе расширяем границы имеющегося, чтобы он вмещал очередную геометрию
                                {
                                    boundsBox.ExpandToInclude(curEnvelope);
                                }
                                //Добавляем первую координату
                                firstCoordinate = geometry.Coordinate;
                                break;
                            }
                        }
                        catch (Exception ex)
                        {
                            //Продолжаем парсить, возможно была получена некорректная строка WKT
                        }
                    }

                    //Здесь получаем рамку на основе зума и lonLat первой координаты
                    double lon = 52.12345; //x, longitude в градусах (Пулково-42)
                    double lat = 51.54321; //y, latitude в градусах (Пулково-42)
                    int mapZoom = 8; //Масштаб в котормо хотим показать рамку вокруг центра
                    int screenWidth = 1024; //Ширина пользовательского экрана (в пикселах)
                    int screenHeight = 768; //Высота пользовательского экрана (в пикселах)

                    if (firstCoordinate != null)
                    {
                        lon = firstCoordinate.X;
                        lat = firstCoordinate.Y;
                        string projection = ConfigurationManager.AppSettings["Projection"];
                        if (projection == null || projection == "")
                            projection = "EPSG:4284";
                        boundsBox = getMapBounds(lon, lat, screenWidth, screenHeight, mapZoom, projection);
                    }

                    //Возвращаем рамку или сообщение об ошибке
                    return boundsBox != null ? "<bounds maxlat=\"" + boundsBox.MaxY.ToString().Replace(",", ".") +
                                                "\" maxlon=\"" + boundsBox.MaxX.ToString().Replace(",", ".") +
                                                "\" minlat=\"" + boundsBox.MinY.ToString().Replace(",", ".") +
                                                "\" minlon=\"" + boundsBox.MinX.ToString().Replace(",", ".") +
                                                "\"></bounds>"
                                                : "<error>Не получено ни одного объекта, результат запроса: " + geoResultStr + "</error>";
                }
                else
                {
                    return "<error>Не получено ни одного объекта, т.к. в результате запроса не пришло ни одного узла. Результат запроса: " + geoResultStr + "</error>";
                }
            }
            catch (Exception ex)
            {
                Util.Debug(string.Format("GetBounds() - Не удалось выполнить запрос либо построить рамку. \n{0}\n{1}", ex.Message, ex.StackTrace));

                string stackTrace = ex.StackTrace;
                if (ex.InnerException != null)
                    stackTrace = ex.InnerException.StackTrace + "\n\n" + stackTrace;
                return "<error>" + Server.HtmlEncode(ex.Message + "\n" + stackTrace) + "</error>";
            }
            finally
            {
            }
        }

        //Получение рамки по переданным центру, масштабу (от 0 до 23), ширине и высоте пользовательского экрана (в пикселах)
        private Envelope getMapBounds(double lon, double lat, int screenWidth, int screenHeight, int mapZoom, string projection)
        {
            //Прямоугольник с результатом
            Envelope boundsBox = null;
            //Получаем центр карты в CoordinateSystemType.GoogleMercator, чтобы можно было рассчитывать рамку по прямоугольнику
            GeoCoord currentMapCenter = new GeoCoord(lon, lat);
            GeoCoord topLeft = null;
            GeoCoord topRight = null;
            GeoCoord bottomLeft = null;
            GeoCoord bottomRight = null;
            GeoCoord mapCenterMercator = currentMapCenter;
            if (projection == "EPSG:4284")
            {
                mapCenterMercator = ProjectionsHelper.TransformCoordinate(CoordinateSystemType.Pulkovo42, CoordinateSystemType.GoogleMercator, currentMapCenter);
                //Получив центр в метровых координатах, рассчитываем рамку по зуму и ширине экрана
                topLeft = GetLonLatByPxPulkovo(new GeoCoord(0, 0), screenWidth, screenHeight, mapCenterMercator, mapZoom);
                topRight = GetLonLatByPxPulkovo(new GeoCoord(screenWidth, 0), screenWidth, screenHeight, mapCenterMercator, mapZoom);
                bottomLeft = GetLonLatByPxPulkovo(new GeoCoord(0, screenHeight), screenWidth, screenHeight, mapCenterMercator, mapZoom);
                bottomRight = GetLonLatByPxPulkovo(new GeoCoord(screenWidth, screenHeight), screenWidth, screenHeight, mapCenterMercator, mapZoom);
            }
            else
            {
                //Получив центр в метровых координатах, рассчитываем рамку по зуму и ширине экрана
                topLeft = GetLonLatByPx(new GeoCoord(0, 0), screenWidth, screenHeight, mapCenterMercator, mapZoom);
                topRight = GetLonLatByPx(new GeoCoord(screenWidth, 0), screenWidth, screenHeight, mapCenterMercator, mapZoom);
                bottomLeft = GetLonLatByPx(new GeoCoord(0, screenHeight), screenWidth, screenHeight, mapCenterMercator, mapZoom);
                bottomRight = GetLonLatByPx(new GeoCoord(screenWidth, screenHeight), screenWidth, screenHeight, mapCenterMercator, mapZoom);
            }
            
            
            //Создаем по этим координатам прямоугольник - он и будет прямоугольником для центровки
            boundsBox = new Envelope(topLeft.X, bottomRight.X, bottomRight.Y, topLeft.Y);
            //Возвращаем полученный прямоугольник с координатами
            return boundsBox;
        }
        //Получаем по пикселю, ширине/высоте, центру и зуму карты (в CoordinateSystemType.GoogleMercator) значение lonLat (в CoordinateSystemType.Pulkovo42)
        private GeoCoord GetLonLatByPxPulkovo(GeoCoord mapPx, double mapWidth, double mapHeight, GeoCoord mapCenter, int mapZoom)
        {
            GeoCoord lonLat = GetLonLatFromMapPx(mapPx, mapWidth, mapHeight, mapCenter, mapZoom);
            return ProjectionsHelper.TransformCoordinate(CoordinateSystemType.GoogleMercator, CoordinateSystemType.Pulkovo42, lonLat);
        }
        //Получаем по пикселю, ширине/высоте, центру и зуму карты (в CoordinateSystemType.GoogleMercator) значение lonLat (в CoordinateSystemType.Pulkovo42)
        private GeoCoord GetLonLatByPx(GeoCoord mapPx, double mapWidth, double mapHeight, GeoCoord mapCenter, int mapZoom)
        {
            GeoCoord lonLat = GetLonLatFromMapPx(mapPx, mapWidth, mapHeight, mapCenter, mapZoom);
            return ProjectionsHelper.TransformCoordinate(CoordinateSystemType.GoogleMercator, CoordinateSystemType.Wgs84, lonLat);
        }
        //Получаем lonLat по пикселю (от 0 до mapWidth/mapHeight), центру и зуму карты (все значения в CoordinateSystemType.GoogleMercator)
        private GeoCoord GetLonLatFromMapPx(GeoCoord mapPx, double mapWidth, double mapHeight, GeoCoord mapCenter, int mapZoom)
        {
			GeoCoord lonlat = null;
            if (mapPx != null && mapCenter != null && mapZoom >= 0 && mapZoom <= 27)
            {
                //Разрешения карты. Скопированы с флеш-версии для совпадения по масштабам (зум от 0 до 27)
				double[] groundResolutions = new double[] {
                                        156550.8936759835,
                                        78275.44683799175,
                                        39137.723418995876,
                                        19568.861709497938,
                                        9784.430854748969,
                                        4892.2154273744845,
                                        2446.1077136872423,
                                        1223.0538568436211,
                                        611.5269284218106,
                                        305.7634642109053,
                                        152.88173210545264,
                                        76.44086605272632,
                                        38.22043302636316,
                                        19.11021651318158,
                                        9.55510825659079,
                                        4.777554128295395,
                                        2.3887770641476975,
                                        1.1943885320738488,
                                        0.5971942660369244,
                                        0.2985971330184622,
                                        0.1492985665092311,
                                        0.07464928325461555,
                                        0.037324641627307774,
                                        0.018662320813653887,
                                        0.009331160406826943,
                                        0.004665580203413472,
                                        0.002332790101706736,
                                        0.001166395050853368
                                    };

				double res = groundResolutions[mapZoom];

                double delta_x = mapPx.X - (mapWidth / 2);
                double delta_y = mapPx.Y - (mapHeight / 2);

                lonlat = new GeoCoord(mapCenter.X + delta_x * res, mapCenter.Y - delta_y * res);
			}
			return lonlat;
		}



        //Получение данных
        public string ProcessQueryNew1(string descrId, string descrType, bool getSchema, string data, bool toElements)
        {
            //Util.LogL("GET DATA", "BEGIN " + descrId +" "+ descrType);
            CultureInfo cultInfo = (CultureInfo)Thread.CurrentThread.CurrentCulture.Clone();
            cultInfo.NumberFormat.NumberDecimalSeparator = ".";
            Thread.CurrentThread.CurrentCulture = cultInfo;

            using (TransactionScope ts = new TransactionScope(TransactionScopeOption.Suppress))
            {
                IDbConnection conn = null;
                IDbTransaction trans = null;
                try
                {
                    conn = Util.CreateConnection(true);
                    trans = conn.BeginTransaction();
                    string rootPath = ConfigurationManager.AppSettings["Query_Path"];

                    DataProcessor proc = new DataProcessor(conn, trans, rootPath);
                    XmlDocument doc = new XmlDocument();
                    doc.LoadXml(data);
                    Dictionary<string, object> settings = new Dictionary<string, object>();
                    settings["ToElements"] = toElements;
                    IXPathNavigable res = proc.Process(descrId, descrType, doc, getSchema, settings);
                    //Util.LogL("GET DATA", "RESULT " + descrId + descrType);

                    return res != null ? res.CreateNavigator().OuterXml : @"<root/>";
                }
                catch (Exception ex)
                {
                    if (trans != null)
                        trans.Rollback();
                    trans = null;
                    Util.Debug(string.Format("ProcessQueryNew() - Не удалось выполнить запрос. \n{0}\n{1}", ex.Message, ex.StackTrace));

                    string stackTrace = ex.StackTrace;
                    if (ex.InnerException != null)
                        stackTrace = ex.InnerException.StackTrace + "\n\n" + stackTrace;
                    return "<error>" + Server.HtmlEncode(ex.Message + "\n" + stackTrace) + "</error>";
                }
                finally
                {
                    if (trans != null)
                        trans.Commit();
                    if (conn != null)
                        conn.Close();
                }
            }
        }

        [WebMethod(Description = @"Выполнение запроса к данным")]
        public IAsyncResult BeginProcessQueryNew(string descrId, string descrType, bool getSchema, string data,
            bool toElements, AsyncCallback callback, object asyncState)
        {
            Util.LogL("GET ASYNC", "BEGIN " + descrId + " " + descrType);
            CultureInfo cultInfo = (CultureInfo)Thread.CurrentThread.CurrentCulture.Clone();
            cultInfo.NumberFormat.NumberDecimalSeparator = ".";
            Thread.CurrentThread.CurrentCulture = cultInfo;
            using (TransactionScope ts = new TransactionScope(TransactionScopeOption.Suppress))
            {
                IDbConnection conn = null;
                IDbTransaction trans = null;
                Hashtable async = new Hashtable();
                try
                {
                    conn = Util.CreateConnection(true);

                    trans = conn.BeginTransaction();
                    string rootPath = ConfigurationManager.AppSettings["Query_Path"];

                    DataProcessor proc = new DataProcessor(conn, trans, rootPath);

                    XmlDocument doc = new XmlDocument();
                    doc.LoadXml(data);
                    Dictionary<string, object> settings = new Dictionary<string, object>();
                    settings["ToElements"] = toElements;
                    async.Add("DESCR_ID", descrId);
                    async.Add("DESCR_TYPE", descrType);
                    async.Add("INPUT_DATA", data);
                    async.Add("CONN", conn);
                    async.Add("TRANS", trans);
                    async.Add("PROC", proc);

                    return proc.BeginProcess(descrId, descrType, doc, getSchema, settings, callback, async);
                }
                catch (Exception ex)
                {
                    //Util.LogL("GET ASYNC", "BEGIN E " + descrId + " " + descrType + " " + ex.Message);
                    async.Add("ERROR", ex);
                    EmptyDelegate worker = new EmptyDelegate(doNothing);

                    return worker.BeginInvoke(callback, async);
                }
                finally
                {
                    if (trans != null)
                        trans.Commit();
                    if (conn != null)
                        conn.Close();
                }
            }
            return null;
            //Util.LogL("GET ASYNC", "BEGIN 3" + (res == null));
            //return res;
        }

        private void doNothing()
        {
        }

        private delegate void EmptyDelegate();

        [WebMethod]
        public string EndProcessQueryNew(IAsyncResult asyncResult)
        {
            Hashtable asyncArgs = asyncResult.AsyncState as Hashtable;
            if (asyncArgs == null)
                return "<error>Не переданы аргументы вызова. Невозможно завершить операцию</error>";

            String descrId = asyncArgs["DESCR_ID"] as String;
            String descrType = asyncArgs["DESCR_TYPE"] as String;
            String inpData = asyncArgs["INPUT_DATA"] as String;

            if (asyncArgs.ContainsKey("ERROR"))
            {
                // была ошибка вызова
                Exception ex = asyncArgs["ERROR"] as Exception;
                
                if (ex != null)
                {
                    string stackTrace = ex.StackTrace;
                    if (ex.InnerException != null)
                        stackTrace = ex.InnerException.StackTrace + "\n\n" + stackTrace;
                    return "<error>" + Server.HtmlEncode(ex.Message + "\n" + stackTrace + "\n Запрос " + descrType + " из " + descrId + "\n Входные данные: " + inpData)+ "</error>";
                }
            }

            DataProcessor proc = null;
            IDbConnection conn = null;
            IDbTransaction trans = null;
            try
            {
                CultureInfo cultInfo = (CultureInfo)Thread.CurrentThread.CurrentCulture.Clone();
                cultInfo.NumberFormat.NumberDecimalSeparator = ".";
                Thread.CurrentThread.CurrentCulture = cultInfo;
                proc = asyncArgs["PROC"] as DataProcessor;
                conn = asyncArgs["CONN"] as IDbConnection;
                trans = asyncArgs["TRANS"] as IDbTransaction;

                IXPathNavigable res = proc.EndProcess(asyncResult);
                Util.LogL("GET ASYNC", "RES " + asyncArgs["DESCR_ID"] + " " + asyncArgs["DESCR_TYPE"]);
                return res != null ? res.CreateNavigator().OuterXml : @"<root/>";
            }
            catch (Exception ex)
            {
                if (trans != null)
                    trans.Rollback();
                trans = null;
                //Util.Debug(string.Format("ProcessQueryNew() - Не удалось выполнить запрос. \n{0}\n{1}", ex.Message, ex.StackTrace));

                string stackTrace = ex.StackTrace;
                if (ex.InnerException != null)
                    stackTrace = ex.InnerException.StackTrace + "\n\n" + stackTrace;
                //Util.LogL("GET ASYNC", "RES E " + asyncArgs["DESCR_ID"] + " " + asyncArgs["DESCR_TYPE"] + " " + ex.Message);
                return "<error>" + Server.HtmlEncode(ex.Message + "\n" + stackTrace + "\n Запрос " + descrType + " из " + descrId + "\n Входные данные: " + inpData) + "</error>";
            }
            finally
            {
                if (trans != null)
                    trans.Commit();
                if (conn != null)
                    conn.Close();
            }

        }

    }
}
