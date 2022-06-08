//7.7.3.1
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Web;
using System.Web.Services;
using System.Configuration;
using System.Collections.Specialized;
using System.Xml.XPath;
using System.Globalization;
using System.Configuration;
using System.Threading;
using System.Transactions;
using X3M.Core.Common.Configuration;
using X3M.Core.Common.Logging;
using X3M.GeoLib;
using System.ServiceModel;
using System.Xml;
using System.Collections;
//Построение рамки геообъектов запроса средствами NetTopologySuite (GeoAPI)
using GeoAPI.Geometries;
using GisSharpBlog.NetTopologySuite.IO;
using GisSharpBlog.NetTopologySuite.Geometries;
using WcfService;
using System.ServiceModel;
using System.Reflection;

namespace ASL
{
    /// <summary>
    /// Служба доступа к данным
    /// </summary>
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    public class DataService : WebService
    {
        private static string path;
        private static string mPath;

        
        static DataService()
        {
            
        }

        [WebMethod]
        public string ProcessQueryNew(string descrId, string descrType, bool getSchema, string data, bool toElements)
        {
            /*descrId = "PODS_GEO.xml#PODS_ROUTE";
            getSchema = false;
            toElements = false;
            descrType = "select";
            data = "<root USER_ID='1045' USER_LOGIN='editor' PODS_USER='editor' ><data FILTER='8=8' /></root>";*/
            if(descrType == "SELECT") descrType = "select";
            if (descrId.IndexOf("IUST") != -1 || descrId.IndexOf("eco_") != -1)
            {
                ChannelFactory<IUTEService> pipeFactory = null;
                IContextChannel ch = null;

                string input = data;
                string templateName = "GDAL_Imp.xml";
                //проверка ReflectionTypeLoadExcetion
                try
                {
                    checkTCP(out pipeFactory);
                }
                catch (Exception ex)
                {
                    return string.Format("<error type=\"{0}\" message=\"{1}\"/>", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message));
                }
                try
                {
                    //pipeFactory = new ChannelFactory<IUTEService>("tcp");

                    IUTEService pipeProxy = pipeFactory.CreateChannel();
                    ch = (IContextChannel)pipeProxy;
                    ch.Open();
                    //string res = pipeProxy.Process(templateName, input);
                    //return 	"<result>"+res+"</result>";
                    XmlDocument inputDoc = new XmlDocument();
                    inputDoc.LoadXml(input);
                    if (inputDoc.DocumentElement != null)
                    {
                        if (inputDoc.DocumentElement.Attributes["root_path"] == null)
                            inputDoc.DocumentElement.Attributes.Append(inputDoc.CreateAttribute("root_path"));
                        string path = HttpContext.Current.Server.MapPath("a");

                        inputDoc.DocumentElement.Attributes["root_path"].Value = path.Substring(0, path.Length - 1);
                        input = inputDoc.OuterXml;
                    }

                    string res = pipeProxy.GDALProcess(templateName, input, descrId, descrType, getSchema, toElements);
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
            }

            Util.LogL("GET DATA", "BEGIN " + descrId +" "+ descrType);
            CultureInfo cultInfo = (CultureInfo)Thread.CurrentThread.CurrentCulture.Clone();
            cultInfo.NumberFormat.NumberDecimalSeparator = ".";
            Thread.CurrentThread.CurrentCulture = cultInfo;
            //08.08.18 вычленяем пост/предобработку и выполняем команды, чтобы избавиться от ошибки с транзакциями в postgres
            Dictionary<string, string> startUTEs = null;
            Dictionary<string, string> endUTEs = null;
            string returnRes = @"<root/>";
            string queryFilePath = "";
            try
            {
                string[] descrSp = descrId.Split('#');
                queryFilePath = Server.MapPath("Core/Query/" + descrSp[0]);
            }
            catch (Exception exx)
            {
            }
            //забираем команды пост/предобработки
			try
            {
            	Util.GetUTECommands(descrId, descrType, queryFilePath, data, out startUTEs, out endUTEs);            
                if (startUTEs != null && startUTEs.Count > 0)
                {
                    foreach (var startCommand in startUTEs)
                    {
                        string uteProcessResult = RunUTECommand(startCommand.Key, startCommand.Value);
                        if (uteProcessResult.IndexOf("error") == -1)// если удачно прошло(посчитало, не посчитало, но без ошибки)
                            continue;
                        else
                            throw new Exception(uteProcessResult);
                    }
                }
            }
            catch (Exception ex)
            {
				return Util.PackError("Возникла ошибка во время выполнения постобработки команды:"+ex.Message, Server);
            }


            using(TransactionScope ts = new TransactionScope(TransactionScopeOption.Suppress))
            {
                IDbConnection conn = null;
                IDbTransaction trans = null;
                try
                {
                    //если запрос на xml файл, то не делаем соединение к бд
                    bool isXML = false;
                    try
                    {
                        string[] descrSp = descrId.Split('#');
                        //string rolesPath = Server.MapPath("Core/Query/" + descrSp[0]);
                        isXML = Util.IsXMLFileRequest(descrId, descrType, queryFilePath);
                    }
                    catch (Exception exx)
                    {
                    }
                    if (isXML)
                    {
                        conn = Util.CreateConnection(false);
                    }
                    else
                    {
                        try
                        {
                            conn = Util.CreateConnection(true);
                        }
                        catch (Exception inEx)
                        {
                            return "<error>" + Server.HtmlEncode(inEx.Message + "\n" + inEx.StackTrace) + "</error>";
                        }                        
                        trans = conn.BeginTransaction();
                    }
                    
                    string rootPath =ConfigurationManager.AppSettings["Query_Path"];
    		
                    DataProcessor proc = new DataProcessor(conn, trans, rootPath);
                    XmlDocument doc = new XmlDocument();
                    doc.LoadXml(data);
                    Dictionary<string, object> settings = new Dictionary<string, object>();
                    settings["ToElements"] = toElements;
                    IXPathNavigable res = proc.Process(descrId, descrType, doc, getSchema, settings);
                    returnRes = res != null ? res.CreateNavigator().OuterXml : @"<root/>";
                    if (endUTEs == null || endUTEs.Count < 1)
                        return returnRes;                    
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
                    return "<error>" + Server.HtmlEncode(ex.Message+"\n"+stackTrace+"\nЗапрос "+descrType+" из "+descrId+"\n Входные данные: "+data) + "</error>";
                }
                finally
                {
                    if (trans != null)
                        trans.Commit();
                    if (conn != null)
                        conn.Close();
                }
            }
            try
            {
                if (endUTEs != null && endUTEs.Count > 0)
                {
                    foreach (var endCommand in endUTEs)
                    {
                        string uteProcessResult = RunUTECommand(endCommand.Key, endCommand.Value);
                        if (uteProcessResult.IndexOf("error") == -1)// если удачно прошло(посчитало, не посчитало, но без ошибки)
                            continue;
                        else
                            throw new Exception(uteProcessResult);
                    }
                }
            }
            catch (Exception ex)
            {
                return Util.PackError("Возникла ошибка во время выполнения постобработки команды:"+ex.Message, Server);
            }
            return returnRes;
        }

        
       
        private string GenError(string message)
        {
            return "<error>" + message + "</error>";
        }

        private const string EXTENSION_FILES_PATH = "~/Public/assets/Preview/";
        private const string NO_IMAGE_PATH = "~/Public/assets/Preview/noImage.png";
        private const string UNKNOWN_FORMAT_PATH = "~/Public/assets/Preview/unknownFormat.png";

       
        
        private void checkTCP(out ChannelFactory<IUTEService> pipeFactory)
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


        private string RunUTECommand(string callStr, string inputStr)
        {
            //<ute_command call="KM_ROUTE_Calc.xml" input="route_id={ID};"/>
            //callStr = "KM_ROUTE_Calc.xml";
            //inputStr = "route_id=1001395;"
            string[] splittedInput = inputStr.Split(';');
            string inputt = "<input ";
            foreach (string sp in splittedInput)
            {
                if (sp == "") continue;
                string[] sp1 = sp.Split('=');
                if (sp1.Length == 2)
                {
                    inputt += sp1[0] + "=\"" + sp1[1] + "\"";
                }
            }
            inputt += " />";
            if (callStr == "CALC_PIPE_SEGMENT_LENGTH")
            {
                return "1";
            }
            //переформируем пришедший input в xml строку
            //inputStr = @"<input  route_id=""1001395"" />";
            string returnStr = "";
            ChannelFactory<IUTEService> pipeFactory = null;
            IContextChannel ch = null;

            //проверка ReflectionTypeLoadExcetion
            try
            {
                checkTCP(out pipeFactory);
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

                XmlDocument inputDoc = new XmlDocument();
                inputDoc.LoadXml(inputt);
                if (inputDoc.DocumentElement != null)
                {
                    if (inputDoc.DocumentElement.Attributes["root_path"] == null)
                        inputDoc.DocumentElement.Attributes.Append(inputDoc.CreateAttribute("root_path"));
                    string path = HttpContext.Current.Server.MapPath("a");

                    inputDoc.DocumentElement.Attributes["root_path"].Value = path.Substring(0, path.Length - 1);
                    inputt = inputDoc.OuterXml;
                }

                returnStr = pipeProxy.Process(callStr, inputt);
            }
            catch (Exception ex)
            {
                returnStr = ex.Message + "   stack=" + ex.StackTrace;
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
            return returnStr;
        }
    }

}
