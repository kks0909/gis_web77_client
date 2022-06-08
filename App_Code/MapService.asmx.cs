// 7.7.3.1
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Data;
using System.IO;
using System.Runtime.Remoting.Channels.Ipc;
using System.Web.Services;
using System.Globalization;
using System.Diagnostics;
using System.Threading;
using System.Web;
using Common.MapGen.Proxy;
using System.ServiceModel;
using System.Transactions;
using System.Net.Sockets;

using X3M.Core.Common.Database;
using X3M.Core.Common.Serialization;

using System.Reflection;
//using Common.MapGen;
//using Common.MapGen.Proxy;


namespace ASL
{
    /// <summary>
    /// Служба доступа к данным
    /// </summary>
    [WebServiceBinding( ConformsTo = WsiProfiles.BasicProfile1_1 )]
    [System.ComponentModel.ToolboxItem( false )]
    public class MapService: WebService
    {
        
        const int maxCallAttempts = 10;
        //время запуска мапгена
        const int timeLimit = 60;

        private const string CoreQueryFolderKeyName = "Query_Path";
        private const string PrivateFolderKeyName = "PRIVATE_PATH";
        private const string PublicFolderKeyName = "Data_Path";
        private const string TilesZoneRadiusKeyName = "MAP_Tiles_Dynamic_Radius";
        private const string Error404PageRelativeUrl = "~/404.html";
        private const string DefaultTileRelativeUrl = "~/default.png";
                
        private const string WmsServerTitleKeyName = "WMS_Server_Title";
        private const string WmsPresentationUrlKeyName = "WMS_Presentation_URL";
        private const string WmsBaseUrlKeyName = "WMS_Base_URL";

           
        /// <summary> Растеризация карты </summary>
        [WebMethod(Description = @"Получение url картинки с параметрами wms")]
        public string DrawImageWMS(string url, string imageUniqueName)
        {
            Util.LogL("DRAW IMAGE_WMS", "BEGIN");
            WaitMapgenLoading();
            ChannelFactory<IMapGenService> pipeFactory = null;
            IContextChannel ch = null;
            try
            {
               
                Util.SetDecimalSeparator();

                string[] parameterNames = url.Split('?')[1].Split('&');

                Dictionary<string, string> table = new Dictionary<string, string>();

                for (int i = 0; i < parameterNames.Length; i++)
                {
                    if (!string.IsNullOrEmpty(parameterNames[i]))
                    {
                        string[] pp = parameterNames[i].Split('=');
                        if (pp.Length != 1)
                            table.Add(pp[0].ToLower(), pp[1].Replace("%3A", ":").Replace("%2C", ","));
                    }
                }
                string layersFilesFolderPath = ConfigurationManager.AppSettings[CoreQueryFolderKeyName];
                string publicFolderPathWMS = ConfigurationManager.AppSettings[PublicFolderKeyName] + @"WMS/";
                string wmsServerTitle = ConfigurationManager.AppSettings[WmsServerTitleKeyName];
                string wmsPresentationUrl = ConfigurationManager.AppSettings[WmsPresentationUrlKeyName];
                string wmsBaseUrl = ConfigurationManager.AppSettings[WmsBaseUrlKeyName];

                string REQUEST = table.ContainsKey("request") ? table["request"].ToUpper() : null;
                string sessionId = imageUniqueName != null ? imageUniqueName : "temp";

                string urlText = url;
                int splitIndex = urlText.LastIndexOf(";");
                urlText = splitIndex < 0 ? urlText : urlText.Substring(splitIndex + 1);

               
                IDbConnection conn = Util.CreateConnection(false);
                string databaseType = Util.GetDataSourceType();//GetStringDataSourceType();

                //проверка ReflectionTypeLoadExcetion
                try
                {
                    checkTCP(out pipeFactory);
                }
                catch (Exception ex)
                {
                    return string.Format("<error type=\"{0}\" message=\"{1}\" stack=\"{2}\" />", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message), HttpUtility.HtmlEncode(ex.StackTrace));
                }
                IMapGenService pipeProxy = null;
                
                string r = "";

                if (REQUEST == "GETMAP")
                {
                    string queryTableSerialized = SerializationHelper.SerializeDictionary(table);
                    r = publicFolderPathWMS;
                    //r = publicFolderPathWMS + pipeProxy.DrawLayersWMS(queryTableSerialized, layersFilesFolderPath, HttpContext.Current.Server.MapPath(publicFolderPathWMS), databaseType, conn.ConnectionString, sessionId);
                    try
                    {
                        pipeProxy = pipeFactory.CreateChannel();
                        ch = (IContextChannel)pipeProxy;
                        ch.Open();
                        r += pipeProxy.DrawLayersWMS(queryTableSerialized, layersFilesFolderPath, HttpContext.Current.Server.MapPath(publicFolderPathWMS), databaseType, conn.ConnectionString, sessionId);
                        return r;
                    }
                    catch (SocketException ex)
                    {
                        forceRestartMapgen();
                        pipeProxy = pipeFactory.CreateChannel();
                        ch = (IContextChannel)pipeProxy;
                        ch.Open();
                        r += pipeProxy.DrawLayersWMS(queryTableSerialized, layersFilesFolderPath, HttpContext.Current.Server.MapPath(publicFolderPathWMS), databaseType, conn.ConnectionString, sessionId);
                        return r;
                    }
                    catch (IOException ex)
                    {
                        forceRestartMapgen();
                        pipeProxy = pipeFactory.CreateChannel();
                        ch = (IContextChannel)pipeProxy;
                        ch.Open();
                        r += pipeProxy.DrawLayersWMS(queryTableSerialized, layersFilesFolderPath, HttpContext.Current.Server.MapPath(publicFolderPathWMS), databaseType, conn.ConnectionString, sessionId);
                        return r;
                    }
                    catch (Exception ex)
                    {
                        if (ex.GetType().Name == "IOException" || ex.GetType().Name == "SocketException" || ex.GetType().Name == "FaultException")
                        {
                            forceRestartMapgen();
                            pipeProxy = pipeFactory.CreateChannel();
                            ch = (IContextChannel)pipeProxy;
                            ch.Open();
                            r += pipeProxy.DrawLayersWMS(queryTableSerialized, layersFilesFolderPath, HttpContext.Current.Server.MapPath(publicFolderPathWMS), databaseType, conn.ConnectionString, sessionId);
                            return r;
                        }
                        return string.Format("<error type=\"{0}\" message=\"{1}\" stack=\"{2}\" />", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message), HttpUtility.HtmlEncode(ex.StackTrace));
                    }

                }
                if ((REQUEST == "GETCAPABILITIES") || (REQUEST == "CAPABILITIES"))
                {

                }
                return r;

               
            }
            catch (Exception ex)
            {
                return string.Format("<error type=\"{0}\" message=\"{1}\" stack=\"{2}\" />", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message), HttpUtility.HtmlEncode(ex.StackTrace));
            }
            finally
            {

                if (ch != null && (ch.State != CommunicationState.Faulted))
                {
                    try
                    {
                        ch.Close();
                    }
                    catch (Exception ex) { };
                }
                if (pipeFactory != null && (pipeFactory.State != CommunicationState.Faulted))
                {
                    try
                    {
                        pipeFactory.Close();
                    }
                    catch (Exception ex) { };
                }
            }
        }


        /// <summary>
        /// Возвращает информацию об объекте в заданной точке с указанным радиусом поиска (в градусах)
        /// </summary>
        [WebMethod]
        public string GetObjectsInfo(string user_uid, double x, double y, double radius, string mapDescr)
        {
            WaitMapgenLoading();
            ChannelFactory<IMapGenService> pipeFactory = null;
            IContextChannel ch = null;
            //проверка ReflectionTypeLoadExcetion
            try
            {
                checkTCP(out pipeFactory);
            }
            catch (Exception ex)
            {
                return string.Format("<error type=\"{0}\" message=\"{1}\" stack=\"{2}\" />", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message), HttpUtility.HtmlEncode(ex.StackTrace));
            }
            try
            {
                string mask = GetUserMask();
                IMapGenService pipeProxy = null;
                try
                {
                    pipeProxy = pipeFactory.CreateChannel();
                    ch = (IContextChannel)pipeProxy;
                    ch.Open();                                
                
                    return pipeProxy.GetObjectsInfo(user_uid, x, y, radius, mapDescr, mask);
                }
                catch (SocketException ex)
                {
                    forceRestartMapgen();
                    pipeProxy = pipeFactory.CreateChannel();
                    ch = (IContextChannel)pipeProxy;
                    ch.Open();     
                    return pipeProxy.GetObjectsInfo(user_uid, x, y, radius, mapDescr, mask);                        
                }
                catch (IOException ex)
                {
                    forceRestartMapgen();
                    pipeProxy = pipeFactory.CreateChannel();
                    ch = (IContextChannel)pipeProxy;
                    ch.Open();     
                    return pipeProxy.GetObjectsInfo(user_uid, x, y, radius, mapDescr, mask);
                }
                catch (Exception ex)
                {
                    if (ex.GetType().Name == "IOException" || ex.GetType().Name == "SocketException" || ex.GetType().Name == "FaultException")
                    {
                        forceRestartMapgen();
                        pipeProxy = pipeFactory.CreateChannel();
                        ch = (IContextChannel)pipeProxy;
                        ch.Open();     
                        return pipeProxy.GetObjectsInfo(user_uid, x, y, radius, mapDescr, mask);
                    }
                    return string.Format("<error type=\"{0}\" message=\"{1}\" stack=\"{2}\" />", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message), HttpUtility.HtmlEncode(ex.StackTrace));
                }
            }
            catch (Exception ex)
            {
                return string.Format("<error type=\"{0}\" message=\"{1}\" stack=\"{2}\" />", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message), HttpUtility.HtmlEncode(ex.StackTrace));
            }
            finally
            {

                if (ch != null && (ch.State != CommunicationState.Faulted))
                {
                    try
                    {
                        ch.Close();
                    }
                    catch (Exception ex) { };
                }
                if (pipeFactory != null && (pipeFactory.State != CommunicationState.Faulted))
                {
                    try
                    {
                        pipeFactory.Close();
                    }
                    catch (Exception ex) { };
                }
            }

        }

         /// <summary> Растеризация карты </summary>
        [WebMethod(Description = @"Получение тайла")]
        public string DrawTile(string url)
        {
            Util.LogL("DRAW TILE", "BEGIN");
            WaitMapgenLoading();
            ChannelFactory<IMapGenService> pipeFactory = null;
            IContextChannel ch = null;
            //проверка ReflectionTypeLoadExcetion
            try
            {
                checkTCP(out pipeFactory);
            }
            catch (Exception ex)
            {
                return string.Format("<error type=\"{0}\" message=\"{1}\" stack=\"{2}\" />", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message), HttpUtility.HtmlEncode(ex.StackTrace));
            }
            try
            {
		        string urlText = url;
                int splitIndex = urlText.LastIndexOf(";");
                urlText = splitIndex < 0 ? urlText : urlText.Substring(splitIndex + 1);
                string layersFilesFolderPath = ConfigurationManager.AppSettings[CoreQueryFolderKeyName];
                int tilesTreeId, zoomLevel, tileX, tileY;
                IMapGenService pipeProxy = null;
                
                IDbConnection conn = null; 
                conn = Util.CreateConnection(false);
                string databaseType = Util.GetDataSourceType();
                bool isUrlLikeTile = false;
                try
                {
                    pipeProxy = pipeFactory.CreateChannel();
                    ch = (IContextChannel)pipeProxy;
                    ch.Open();
                    isUrlLikeTile = IsUrlLikeTile(urlText, pipeProxy, out tilesTreeId, out zoomLevel, out tileX, out tileY);
                }
                catch (SocketException ex)
                {
                    forceRestartMapgen();
                    pipeProxy = pipeFactory.CreateChannel();
                    ch = (IContextChannel)pipeProxy;
                    ch.Open();
                    isUrlLikeTile = IsUrlLikeTile(urlText, pipeProxy, out tilesTreeId, out zoomLevel, out tileX, out tileY);
                }
                catch (IOException ex)
                {
                    forceRestartMapgen();
                    pipeProxy = pipeFactory.CreateChannel();
                    ch = (IContextChannel)pipeProxy;
                    ch.Open();
                    isUrlLikeTile = IsUrlLikeTile(urlText, pipeProxy, out tilesTreeId, out zoomLevel, out tileX, out tileY);
                }
                catch (Exception ex)
                {
                    if (ex.GetType().Name == "IOException" || ex.GetType().Name == "SocketException" || ex.GetType().Name == "FaultException")
                    {
                        forceRestartMapgen();
                        pipeProxy = pipeFactory.CreateChannel();
                        ch = (IContextChannel)pipeProxy;
                        ch.Open();
                        isUrlLikeTile = IsUrlLikeTile(urlText, pipeProxy, out tilesTreeId, out zoomLevel, out tileX, out tileY);
                    }
                    return string.Format("<error type=\"{0}\" message=\"{1}\" stack=\"{2}\" />", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message), HttpUtility.HtmlEncode(ex.StackTrace));
                }
                
                if (isUrlLikeTile)
                {
                    string tilesZoneRadiusText = ConfigurationManager.AppSettings[TilesZoneRadiusKeyName];
                    int parseResult;
                    int tilesZoneRadius = int.TryParse(tilesZoneRadiusText, out parseResult) ? parseResult : 3;
                    
                    try
                    {                        
                        string dd = pipeProxy.GenerateZoneAroundTileInOneRequest(databaseType, conn.ConnectionString, layersFilesFolderPath, tilesTreeId, zoomLevel, tileX, tileY, tilesZoneRadius);
                        Util.LogL("DRAW TILE", "END");
                        return "" + dd;
                    }
                    catch (SocketException ex)
                    {
                        forceRestartMapgen();
                        pipeProxy = pipeFactory.CreateChannel();
                        ch = (IContextChannel)pipeProxy;
                        ch.Open();
                        string dd = pipeProxy.GenerateZoneAroundTileInOneRequest(databaseType, conn.ConnectionString, layersFilesFolderPath, tilesTreeId, zoomLevel, tileX, tileY, tilesZoneRadius);
                        Util.LogL("DRAW TILE AFTER SocketException", "END");
                        return "" + dd;
                    }
                    catch (IOException ex)
                    {
                        forceRestartMapgen();
                        pipeProxy = pipeFactory.CreateChannel();
                        ch = (IContextChannel)pipeProxy;
                        ch.Open();
                        string dd = pipeProxy.GenerateZoneAroundTileInOneRequest(databaseType, conn.ConnectionString, layersFilesFolderPath, tilesTreeId, zoomLevel, tileX, tileY, tilesZoneRadius);
                        Util.LogL("DRAW TILE AFTER IOException", "END");
                        return "" + dd;
                    }
                    catch (Exception ex)
                    {
                        if (ex.GetType().Name == "IOException" || ex.GetType().Name == "SocketException" || ex.GetType().Name == "FaultException")
                        {
                            forceRestartMapgen();
                            pipeProxy = pipeFactory.CreateChannel();
                            ch = (IContextChannel)pipeProxy;
                            ch.Open();
                            string dd = pipeProxy.GenerateZoneAroundTileInOneRequest(databaseType, conn.ConnectionString, layersFilesFolderPath, tilesTreeId, zoomLevel, tileX, tileY, tilesZoneRadius);
                            Util.LogL("DRAW TILE AFTER IOException", "END");
                            return "" + dd;
                        }
                        return string.Format("<error type=\"{0}\" message=\"{1}\" stack=\"{2}\" />", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message), HttpUtility.HtmlEncode(ex.StackTrace));
                    }
			    }
                throw new Exception();

            }
            catch (Exception ex)
            {
                return string.Format("<error type=\"{0}\" message=\"{1}\" stack=\"{2}\" />", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message), HttpUtility.HtmlEncode(ex.StackTrace));
            }
            finally
            {

                if (ch != null && (ch.State != CommunicationState.Faulted))
		        {
			        try {
                    	 ch.Close();
			        }
			        catch (Exception ex) {};
		        }
                if (pipeFactory != null && (pipeFactory.State != CommunicationState.Faulted))
		        {
			        try {
                   		pipeFactory.Close();
			        }
			        catch (Exception ex) {};
		        }

            }
           
        }
        //перенес из ute.mrsintreraction
		public  bool IsUrlLikeTile(string urlText, IMapGenService proxy, out int tilesTreeId, out int zoomLevel, out int tileX, out int tileY)
        {
            tilesTreeId = -1; zoomLevel = -1; tileX = -1; tileY = -1;
            urlText = urlText.Replace("\\", "/");

            string[] urlParts = urlText.Split(new string[] { "/" }, StringSplitOptions.RemoveEmptyEntries);

            if (urlParts.Length < 5) { return false; }

            string tilesTreeName = urlParts[urlParts.Length - 4];
            string zoomText = urlParts[urlParts.Length - 3];
            string tileXText = urlParts[urlParts.Length - 2];
            string tileYText = urlParts[urlParts.Length - 1];

            if (!tileYText.EndsWith(".png")) { return false; }
            tileYText = tileYText.Substring(0, tileYText.Length - ".png".Length);

            try
            {
                tileY = int.Parse(tileYText);
                tileX = int.Parse(tileXText);
                zoomLevel = int.Parse(zoomText);
            }
            catch { return false; }

            if ((zoomLevel < 0) || (zoomLevel > 24)) { return false; }

            int maxX = (int)Math.Round(Math.Pow(2, zoomLevel)); maxX--;
            if ((tileX < 0) || (tileX > maxX)) { return false; }
            if ((tileY < 0) || (tileY > maxX)) { return false; }
            try
            {
                int returnedTilesTreeId = -1;
				//"Получение идентификатора пирамиды тайлов по имени"
                returnedTilesTreeId = proxy.GetTilesTreeIdByName(tilesTreeName);                
                tilesTreeId = returnedTilesTreeId;
                if (tilesTreeId == -1)
                {
                    return false;
                }
            }
            catch { return true; }

            return true;
        }

        private string GetUserMask()
        {
            string userMask = "1111111111111111111111111"; // максимум 25 ЛПУ
            return userMask;
            // Получаем полный список всех ЛПУ
            List<long> allLpu = new List<long>();
            using (TransactionScope ts = new TransactionScope(TransactionScopeOption.Suppress))
            {
                IDbConnection conn = null;
                try
                {
                    conn = Util.CreateConnection(true);
                    string query = ConfigurationManager.AppSettings["query_all_lpu"];
                    if (query == null || query.Length == 0)
                        return userMask;
                    IDbCommand cmd = conn.CreateCommand();
                    cmd.CommandText = query;
                    IDataReader reader = cmd.ExecuteReader();
                    while (reader.Read())
                    {
                        allLpu.Add(long.Parse(reader[0].ToString()));
                    }
                }
                catch (Exception ex)
                {
                    Util.Debug(string.Format("Proxy.GetUserMask() - Не удалось получить полный список ЛПУ. \n{1}\n{2}",
                            conn.ConnectionString, ex.Message, ex.StackTrace));
                    throw ex;
                }
                finally
                {
                    if (conn != null)
                        conn.Close();
                }
            }
            
            if (allLpu.Count == 0) return userMask;

            // Формируем маску доступа
            try
            {
                userMask = Common.Spatial.Cache.AccessMask.Create(allLpu, allLpu).ToString();
            }
            catch (Exception ex)
            {
                Util.Debug(string.Format("Proxy.GetUserMask() - Не удалось сформировать маску доступа. \n{0}\n{1}",
                    ex.Message, ex.StackTrace));
            }
            return userMask;
        }

        private void checkTCP(out ChannelFactory<IMapGenService> pipeFactory)
        {
            for(int i=0; i<15;i++)//делаем 15 попыток создать соединение
                try
                {
                    pipeFactory = new ChannelFactory<IMapGenService>("tcp");
                    return;
                }
                catch (ReflectionTypeLoadException rex)
                {
                }
                catch (Exception ex)
                {                    
                }
            throw new Exception("Ошибка при создании канала связи TCP");
        }

        private void checkTCPUTE(out ChannelFactory<IUTEService> pipeFactory)
        {
            for (int i = 0; i < 15; i++)//делаем 15 попыток создать соединение
                try
                {
                    pipeFactory = new ChannelFactory<IUTEService>("tcp");
                    return;
                }
                catch (ReflectionTypeLoadException rex)
                {
                }
                catch (Exception ex)
                {
                }
            throw new Exception("Ошибка при создании канала связи TCP");
        }



        private string CallShell()
        {
            ChannelFactory<IUTEService> pipeFactory = null;
            IContextChannel ch = null;
            //проверка ReflectionTypeLoadExcetion
            try
            {
                checkTCPUTE(out pipeFactory);
            }
            catch (Exception ex)
            {
                return string.Format("<error type=\"{0}\" message=\"{1}\"/>", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message));
            }

            try
            {
                IUTEService pipeProxy = pipeFactory.CreateChannel();
                ch = (IContextChannel)pipeProxy;
                ch.Open();
                string privatePath = ConfigurationManager.AppSettings[PrivateFolderKeyName];
                privatePath += "/mrs_force_restart/mrs_force_restart.sh";
                string res = pipeProxy.CallShell(privatePath);
                return "<result>" + res + "</result>";
            }
            catch (Exception ex)
            {
                return string.Format("<error type=\"{0}\" message=\"{1}\"/>", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message));
            }
            finally
            {
                if (ch != null && (ch.State != CommunicationState.Faulted))
                {
                    try
                    {
                        ch.Close();
                    }
                    catch (Exception ex) { };
                }
                if (pipeFactory != null && (pipeFactory.State != CommunicationState.Faulted))
                {
                    try
                    {
                        pipeFactory.Close();
                    }
                    catch (Exception ex) { };
                }
            }
            return "";
        }
        
        private void forceRestartMapgen()
        {
            CallShell();
            //Thread.Sleep(timeLimit*1000);
            return;
        }

        //проверка, что мапген в процессе загрузки
        private void WaitMapgenLoading()
        {
            try
            {
                //лимит времени загрузки мапгена, когда должен пропасть файл .tmp_loading
                string privatePath = ConfigurationManager.AppSettings[PrivateFolderKeyName];
                string loadingFilePath = privatePath + "/mrs_force_restart/.tmp_loading";
                //проверяем, что если есть файл, .tmp_loading - флаг что мапген загружается
                DateTime start = DateTime.Now;
                while (true)
                {
                    if (File.Exists(loadingFilePath))
                    {
                        //если файл очень старый. Возможно не смогли удалить, то его игнорируем
                        FileInfo fii = new FileInfo(loadingFilePath);
                        TimeSpan span = DateTime.Now - fii.CreationTime;
                        if (fii.CreationTime < DateTime.Now.AddSeconds(-50))
                            break;
                        Thread.Sleep(1000);
                        DateTime end = DateTime.Now;
                        TimeSpan tp = end - start;
                        if (tp.Seconds > timeLimit)
                            break;
                    }
                    else
                        break;
                }    
            }
            catch (Exception ex)
            {
            }
                    
            return;
        }

        
    }
    static internal class Utils
    {
        /// <summary>
        /// Устанавливает десятичный разделитель в числах с плавающей точкой
        /// </summary>
        static public void SetDecimalSeparator()
        {
            CultureInfo myCI = (CultureInfo)Thread.CurrentThread.CurrentCulture.Clone();
            myCI.NumberFormat.NumberDecimalSeparator = ".";
            Thread.CurrentThread.CurrentCulture = myCI;
        }

        /// <summary>
        /// Извлекает логическое значение из строки
        /// </summary>
        /// <param name="s"></param>
        /// <returns></returns>
        static public bool GetBoolean( string s )
        {
            if( s == null ) return false;
            switch( s.ToLower().Trim() )
            {
                case "true":
                case "1":
                    return true;
                default:
                    return false;
            }
        }       
    }
}
