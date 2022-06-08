// 7.7.4.9
using System;
using System.Data;
using System.Collections;
using System.Collections.Generic;
using System.Web;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.IO;
using System.Configuration;
using NewAdm.Core;
using System.Reflection;

using System.Text;
using System.Diagnostics;
using System.ServiceModel;
using System.Xml;
//E-mail using
using System.Net;
using System.Net.Mail;
using System.Net.Mime;
using System.Threading;
using System.ComponentModel;
//Построение буфера средствами NetTopologySuite (GeoAPI)
using GeoAPI.Geometries;
using GisSharpBlog.NetTopologySuite.IO;
using GisSharpBlog.NetTopologySuite.Operation.Buffer;
using System.Transactions;
using X3M.Core.Common.Cryptography;
using X3M.Core.Common.StringHandling;

using WcfService;


namespace ASL
{
    /// <summary>
    /// Сводное описание для ServerTaskService
    /// </summary>
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]

    public class ServerTaskService : System.Web.Services.WebService {

        private static string _uteAdmTaskLockFile = "uteadmtask.lock";
        private static string[] _uteLockTemplates = { "CP_INSP_Proc.xml", "STO_EHZ_INSP_Proc.xml", 
                                                        "STO_ILI_INSP_Proc.xml", "ILI_Pressure.xml", "ILI_Cluster.xml", "ILI_INSP_Proc.xml", 
                                                        "Interval_divining_UTE.xml", "PS_TEMPLATE_Idx.xml", "ILI_ZIP_Imp_55.xml" , "ili_integr_2_proc_all.xml", "ili_integr_2_imp_55.xml", "ILI_BAT_Cluster_All.xml", "ILI_BAT_Pressure_All.xml", "ILI_BAT_STO_Insp_Proc_All.xml", "BAT_STO_EHZ_INSP_Proc.xml" };

        public ServerTaskService () {

            //Раскомментируйте следующую строку в случае использования сконструированных компонентов 
            //InitializeComponent(); 
        }
        
        [WebMethod]
        /// <summary>
        /// Вызов задачи АРМ Администратора
        /// </summary>
        /// <param name="templateName">файл шаблона</param>
        /// <param name="input">значение аргумента</param>
        /// <returns>результат выполнения задачи</returns>
        public string RunUTETask(string templateName, string input)
        {            
            input = formatBoolAttrs(input);	
            //разделяем 1-й запрос на импорт отчета
            if (templateName.IndexOf("|") == -1)
            {
                
				if (_uteLockTemplates.Length > 0 && Array.IndexOf(_uteLockTemplates, templateName) != -1)
                {
                    templateName += "*";//добавляем флаг, что задача uteService блокирующая
                    if (CheckUTELockFile())
                        return string.Format("<error type=\"{0}\" message=\"{1}\"/>", "UTEServiceLockException", "Данный вызов не может быть выполнен, поскольку в данный момент выполняется серверная задача. Повторите попытку позже.");
                    else
                    	CreateStatusFile();

                }
                
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
                    //pipeFactory = new ChannelFactory<IUTEService>("tcp");

                    IUTEService pipeProxy = pipeFactory.CreateChannel();
                    ch = (IContextChannel)pipeProxy;
                    ch.Open();

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

                    string res = pipeProxy.Process(templateName, input);
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
            else
            {
            	string[] templates = templateName.Split('|');
                string[] inputs = input.Split('|');
                if (templates != null && inputs != null && templates.Length == inputs.Length)
                {
                    string beforeInspectionId = "";
                    IDbConnection conn = null;
                    try
                    {
                        conn = Util.CreateConnection(true);
                        if (conn.State == ConnectionState.Closed)
                            conn.Open();
                        IDbCommand cmd = conn.CreateCommand();
                        cmd.CommandTimeout = 0;
                        cmd.CommandText = "select max(ili_inspection_id) id from pods.ili_inspection";

                        IDataReader rdr = cmd.ExecuteReader();
                        StringBuilder queryStr = new StringBuilder();
                        //читаем только 1-й результат
                        while (rdr.Read())
                        {
                            if (queryStr.Length > 0)
                                break;
                            queryStr.Append(rdr["id"].ToString().ToUpper());
                            beforeInspectionId = rdr["id"].ToString();
                            if (beforeInspectionId != "")
                                break;

                        }
                        rdr.Close();

                        if (beforeInspectionId != "")//выполняем основную загрузку
                        {
                            if (_uteLockTemplates.Length > 0 && Array.IndexOf(_uteLockTemplates, templates[0]) != -1)
                            {
                                templates[0] += "*";//добавляем флаг, что задача uteService блокирующая
                                if (CheckUTELockFile())
                                    return string.Format("<error type=\"{0}\" message=\"{1}\"/>", "UTEServiceLockException", "Данный вызов не может быть выполнен, поскольку в данный момент выполняется серверная задача. Повторите попытку позже.");
                                else
                    				CreateStatusFile();
                            }
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
                                //pipeFactory = new ChannelFactory<IUTEService>("tcp");

                                IUTEService pipeProxy = pipeFactory.CreateChannel();
                                ch = (IContextChannel)pipeProxy;
                                ch.Open();

                                XmlDocument inputDoc = new XmlDocument();
                                inputDoc.LoadXml(inputs[0]);
                                if (inputDoc.DocumentElement != null)
                                {
                                    if (inputDoc.DocumentElement.Attributes["root_path"] == null)
                                        inputDoc.DocumentElement.Attributes.Append(inputDoc.CreateAttribute("root_path"));
                                    string path = HttpContext.Current.Server.MapPath("a");
                                    inputDoc.DocumentElement.Attributes["root_path"].Value = path.Substring(0, path.Length - 1);
                                    input = inputDoc.OuterXml;
                                }

                                string res = pipeProxy.Process(templates[0], input);//1-й вызов - это импорт отчетов ВТД
                                cmd = conn.CreateCommand();
                                cmd.CommandTimeout = 0;
                                cmd.CommandText = "select max(ili_inspection_id) id from pods.ili_inspection";
                                rdr = cmd.ExecuteReader();
                                queryStr = new StringBuilder();
                                string afterInspectionId = "";
                                //читаем только 1-й результат
                                while (rdr.Read())
                                {
                                    if (queryStr.Length > 0)
                                        break;
                                    queryStr.Append(rdr["id"].ToString().ToUpper());
                                    afterInspectionId = rdr["id"].ToString();
                                    if (afterInspectionId != "")
                                        break;

                                }
                                //если добавился отчет в базу, то проходимся по остальным вызовам, которые передали
                                if (afterInspectionId != beforeInspectionId)
                                {
                                    //выполняем полседовательно вызовы
                                    if (templates.Length > 1)
                                    {

                                        string errors = "";
                                        for (int i = 1; i < templates.Length; i++)
                                        {
                                            try
                                            {
                                                if (_uteLockTemplates.Length > 0 && Array.IndexOf(_uteLockTemplates, templates[i]) != -1)
                                                {
                                                    templates[i] += "*";//добавляем флаг, что задача uteService блокирующая
                                                    if (CheckUTELockFile())
                                                        return string.Format("<error type=\"{0}\" message=\"{1}\"/>", "UTEServiceLockException", "Данный вызов не может быть выполнен, поскольку в данный момент выполняется серверная задача. Повторите попытку позже.");
                                                    else
                    									CreateStatusFile();
                                                }
                                                //заменяем ili_inspection_id
                                                inputs[i] = inputs[i].Replace("{ILI_INSPECTION_ID}", afterInspectionId);
                                                inputDoc = new XmlDocument();
                                                inputDoc.LoadXml(inputs[i]);
                                                if (inputDoc.DocumentElement != null)
                                                {
                                                    if (inputDoc.DocumentElement.Attributes["root_path"] == null)
                                                        inputDoc.DocumentElement.Attributes.Append(inputDoc.CreateAttribute("root_path"));
                                                    string path = HttpContext.Current.Server.MapPath("a");
                                                    inputDoc.DocumentElement.Attributes["root_path"].Value = path.Substring(0, path.Length - 1);
                                                    input = inputDoc.OuterXml;
                                                }

                                                res = pipeProxy.Process(templates[i], input);
                                                //return "<result>" + res + "</result>";
                                            }
                                            catch (Exception ex1)
                                            {
                                                return string.Format("<error type=\"{0}\" message=\"{1}\"/>", ex1.GetType().Name, HttpUtility.HtmlEncode(ex1.Message));
                                            }
                                        }

                                    }
                                    return "<result>Вызовы успешно выполнены. Идентификатор импортированного отчета:" + afterInspectionId + "</result>";
                                }
                                else
                                    return "<error type=\"Error\" message=\"Импорт отчетов завершился с ошибкой\"/>";


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
                    }
                    catch (Exception ex)
                    {
                        return string.Format("<error type=\"{0}\" message=\"{1}\"/>", ex.GetType().Name, HttpUtility.HtmlEncode(ex.Message));
                        throw ex;
                    }
                    return "";
                }
                return "<error type=\"Error\" message=\"Количество шаблонов не соответствует количеству переданных <input> с данными для шаблонов\"/>";
                
            }
        }

        private bool CheckUTELockFile()
        {
            string path = HttpContext.Current.Server.MapPath("a");
            path = path.Substring(0, path.Length - 1);
            path = Path.Combine(path, @"../../GIS_WEB60/UTEService/Bin/");
            string fileName = Path.Combine(path, _uteAdmTaskLockFile);
            if (File.Exists(fileName))
                return true;
            return false;
        }

        private void CreateStatusFile()
		{
			try
			{
				string path = HttpContext.Current.Server.MapPath("a");
	            path = path.Substring(0, path.Length - 1);
	            path = Path.Combine(path, @"../../GIS_WEB60/UTEService/Bin/");
				string fileName = Path.Combine(path, _uteAdmTaskLockFile);
				if (!File.Exists(fileName)){
					File.CreateText(fileName);
                    Util.chmod(fileName);
                }
			}
			catch (Exception ex) { 
            }
		}


       
        [WebMethod]
        /// <summary>
        /// Регистрирует событие аудита
        /// </summary>
        /// <param name="sessionId"></param>
        /// <param name="eventId"></param>
        /// <param name="details"></param>
        /// <param name="success"></param>
        /// <returns></returns>
        public string Audit(string sessionId, int eventId, string details, bool success, string userId)
        {
            using (TransactionScope ts = new TransactionScope(TransactionScopeOption.Suppress))
            {
                IDbConnection conn = null;
                try
                {
                    // Получаем шаблон сообщения аудита
                    conn = Util.CreateConnection(true);
                    IDbCommand cmd = conn.CreateCommand();
                    string schema = ConfigurationManager.AppSettings["policy_schema"];
                    cmd.CommandText =
                         string.Format("select detailed_message from {1}.b_audit_event_template where event_id = {0}",
                             eventId, schema);
                    string msg = cmd.ExecuteScalar().ToString();
                    // Заполняем шаблон переданными значениями
                    //foreach (DictionaryEntry de in details)
                    //    msg = msg.Replace(string.Format("{{{0}}}", de.Key), string.Format("{0}", de.Value));
                    msg += "\n Details" + details;
                    // Записываем полученное сообщение в БД
                    cmd.CommandText = string.Format(
                        "insert into {6}.b_audit_event (event_id, session_id, user_id, hostname, detailed_message, success, time_stamp) " +
                        "values ({0}, '{1}', {2}, '{3}', '{4}', {5}, current_timestamp)",
                        eventId, sessionId, userId, HttpContext.Current.Server.MachineName, msg, success ? 1 : 0, schema);
                    return cmd.ExecuteNonQuery().ToString();
                }
                catch (Exception ex)
                {
                    Util.Debug(string.Format("Proxy.Audit() - Не удалось зарегистрировать событие аудита. \n{0}\n{1}",
                               ex.Message, ex.StackTrace));
                    return Util.PackError(ex.Message, Server);
                }
                finally
                {
                    if (conn != null)
                        conn.Close();
                }
            }
        }

       
        [WebMethod]
        /// <summary>
        /// Протоколирует пользовательское сообщение для тестирования запросов в БД
        /// </summary>
        /// <param name="message"></param>
        /// <param name="category"></param>
        /// <param name="severity"></param>
        /// <param name="context"></param>
        /// <returns></returns>
        public string TestSQLLog(string message, string context)
        {
            StreamWriter writer = null;
string logFilesPath = "/home/websys53/GIS_WEB60/Log/WebSite/TESTSQL.txt";
            try
            {
                
                writer = new StreamWriter(logFilesPath, true, Encoding.GetEncoding("UTF-8"));
                writer.WriteLine("{0}: {1}\n\t{2}", DateTime.Now.ToLongTimeString(), message, context.Replace("\n", "\n\t"));
            }
            catch (Exception ex)
            {
                return "0";
            }
            finally
            {
                if (writer != null)
                    writer.Close();
            }
		Util.chmod(logFilesPath);
            return "1";

        }

        [WebMethod]
        /// <summary>
        /// Конвертируем страницы pdf файла в jpg
        /// </summary>
        /// <param name="path"></param>
        /// <param name="data"></param>
        /// <returns></returns>
        public string ConvertPdfToImg(string filename)
        {
            if (string.IsNullOrEmpty(filename))
                return "Указан пустой путь";
            string libDocPath = ConfigurationManager.AppSettings["Lib_Path"];//"Public/Data/LIB";
            string quality = "100";
            string dpi = "72";
            if (ConfigurationManager.AppSettings["PDF2IMG_JPEG_QUALITY"] != null)
                quality = ConfigurationManager.AppSettings["PDF2IMG_JPEG_QUALITY"];
            if (ConfigurationManager.AppSettings["PDF2IMG_JPEG_DPI"] != null)
                dpi = ConfigurationManager.AppSettings["PDF2IMG_JPEG_DPI"];
            string filePath = HttpContext.Current.Server.MapPath(Path.Combine(libDocPath, filename));
            string outputPath = HttpContext.Current.Server.MapPath(ConfigurationManager.AppSettings["Temp_Path"]);
            string converterPath = ConfigurationManager.AppSettings["Ghostscript_Path"];
            return Util.ConvertPdfToImg(filePath, filename, outputPath, ConfigurationManager.AppSettings["Temp_Path"], converterPath, quality, dpi);
        }


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

        /**
		* Форматируем атрибуты булевые в нижний регистр для унификации с шаблонами UTEService
		*/
        private string formatBoolAttrs(string input)
        {
            //быстрая замена, без преобразований в string-xml-string
            return input.Replace("\"True\"", "\"true\"").Replace("\"TRUE\"", "\"true\"")
                        .Replace("\"False\"", "\"false\"").Replace("\"FALSE\"", "\"false\"");
        }
        
    }
}
