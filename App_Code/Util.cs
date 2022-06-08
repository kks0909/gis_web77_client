// 7.7.3.0
using System;
using System.Data;
using System.IO;
using System.Text;
using System.Collections;
using System.Collections.Generic;
using System.Configuration;
using System.Web;
using Devart.Data.Oracle;
using System.Diagnostics;
using System.Globalization;
using System.Threading;
using X3M.Core.Common.Cryptography;
using X3M.Core.Common.Database;
using System.Transactions;
using System.Xml;
using X3M.GeoLib.Params;
using System.Xml.XPath;

namespace ASL
{
    /// <summary>
    /// Summary description for Util
    /// </summary>
    public class Util
    {
        // NEED: rename
        public static DatabaseType GetStringDataSourceType()
        {
            string src_type = ConfigurationManager.AppSettings["src_type"];
            return new DatabaseType( src_type );
        }

        public static string GetDataSourceType()
        {
            string src_type = ConfigurationManager.AppSettings["src_type"];
            return src_type;
        }


        public static string GetConnectionString()
        {
            try
            {
                string sys_user_id = ConfigurationManager.AppSettings["Sys_User_Id"];
                string sys_pass = ConfigurationManager.AppSettings["Sys_User_Pass"];
                string database = ConfigurationManager.AppSettings["DB_Name"];
                string server = ConfigurationManager.AppSettings["DB_Server"];
                string port = ConfigurationManager.AppSettings["DB_Port"];
                //string mode = ConfigurationManager.AppSettings["access"]; //if (mode == null) mode = "";
                string trusted_conn = ConfigurationManager.AppSettings["Trusted_Conn"];
                bool isTrusted = GetBoolean(trusted_conn);

                try
                {
                    sys_pass = CryptoString.Decrypt( sys_pass ).Trim( '\0' );
                }
                catch( Exception ex )
                {
                    LogL( "Error", "Невозможно расшифровать пароль " + ex.Message );
                    Trace.WriteLine( ex.Message );
                }
                
                DatabaseType src_type = GetStringDataSourceType();

                //case "oracle": return GetBoolean( trusted_conn ) ? string.Format( "Server={0};Persist Security Info=False;Integrated Security=Yes;", database ) : string.Format( "User Id={0};Password={1};Server={2};Pooling=true;Min Pool Size=1;Max Pool Size=40;", sys_user_id, sys_pass, database );
                //case "mssql": return GetBoolean( trusted_conn ) ? string.Format( "Initial Catalog={0};Server={1};Trusted_Connection=True;MultipleActiveResultSets=True;Asynchronous Processing=true;", database, server ) : string.Format( "Persist Security Info=False;User ID={0};Password={1};Initial Catalog={2};Server={3};MultipleActiveResultSets=True;Asynchronous Processing=true;", sys_user_id, sys_pass, database, server );
                return DatabaseHelper.GetConnectionString( src_type, sys_user_id, sys_pass, database, server, isTrusted, true, port );
            }
            catch( Exception ex )
            {
                Debug( string.Format( "Proxy.GetConnectionString() - Не удалось сформировать строку подключения. \n{0}\n{1}", ex.Message, ex.StackTrace ) );
                throw ex;
            }
        }

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

        /// <summary>
        /// Создает подключение к источнику данных
        /// </summary>
        public static IDbConnection CreateConnection( bool doOpen )
        {
            DatabaseType databaseType = GetStringDataSourceType();
            string connectionString = GetConnectionString();
            IDbConnection connection = DatabaseHelper.CreateConnection(databaseType, connectionString, doOpen);

            return connection;
        }

        public static IDbConnection CreateConnectionOracle(DatabaseType databaseType, string connectionString, bool doOpen)
        {
            IDbConnection conn = null;
            conn = new OracleConnection(connectionString);
            if (doOpen)
            {
                try
                {
                    conn.Open();
                }
                catch (Exception ex)
                {
                    throw new Exception("Не удалось установить подключение к БД", ex);
                }
            }
            return conn;
        }
        public static void Debug( string msg )
        {
            Debug( msg, null );
        }

        public static void DebugInfo(string msg)
        {
            LogLInfo("DEBUG", msg);
        }

        public static void Debug( string msg, IDictionary<string, object> context )
        {
            LogL( "DEBUG", msg );
        }

        /// <summary>
        /// Протоколирует пользовательское сообщение
        /// </summary>
        public static void Log( string message, List<string> category, int severity, IDictionary<string, object> context )
        {
            return;
            // var contextPart = string.Join( ";", context.Keys.Select( k => k + "=" + context[k].ToString() ).ToArray() );
            List<string> contextPartPeices = new List<string>();
            if (context != null)
            {
                foreach (string key in context.Keys)
                {
                    contextPartPeices.Add(key + "=" + context[key]);
                }
            }
            string contextPart = string.Join( ";", contextPartPeices.ToArray() );
            string categoryPart = "";
            if (category != null)
            {
            categoryPart = string.Join(",", category.ToArray());
            }

            string text = string.Format("{3}   Categories: {0}, Severity: {1}, Context: ({2})", categoryPart, severity, contextPart, message );

            LogL( "Log", text );
        }
        public static void LogTileL(string descr, string msg)
        {
            return;            

            StreamWriter writer = null;
            try
            {
                string logUrl = ConfigurationManager.AppSettings["UTE_Service_Log"];
                logUrl = logUrl.Substring(0, logUrl.IndexOf("UTEService"));
                writer = new StreamWriter(logUrl+"getTileLog.txt", true, Encoding.GetEncoding(1251));
                writer.WriteLine("{0}: {1}\n\t{2}", DateTime.Now.ToLongTimeString(), descr, msg.Replace("\n", "\n\t"));
            }
            //catch { }
            finally
            {
                if (writer != null)
                    writer.Close();
            }
        }
        public static void LogLInfo(string descr, string msg)
        {
            return;            

            StreamWriter writer = null;
            try
            {
                string logUrl = ConfigurationManager.AppSettings["UTE_Service_Log"];
                logUrl = logUrl.Substring(0, logUrl.IndexOf("UTEService"));
                writer = new StreamWriter(logUrl+"getInfoLog.txt", true, Encoding.GetEncoding(1251));
                writer.WriteLine("{0}: {1}\n\t{2}", DateTime.Now.ToLongTimeString(), descr, msg.Replace("\n", "\n\t"));
            }
            //catch { }
            finally
            {
                if (writer != null)
                    writer.Close();
            }
        }

        public static void LogLUTE(string msg)
        {
            StreamWriter writer = null;
            try
            {
                string logUrl = ConfigurationManager.AppSettings["UTE_Service_Log"];
                logUrl = logUrl.Replace("UTEService","WebSite");
                string filePath = logUrl;//+"log.txt";
                writer = new StreamWriter(filePath, true);
                writer.WriteLine( "{0}: \t{1}", DateTime.Now.ToString("dd.MM.yyyy HH:mm:ss"), msg.Replace( "\n", "\n\t" ) );
                chmod(filePath);
            }
            catch { }
            finally
            {
                if( writer != null )
                    writer.Close();
            }
        }

        public static void LogLGeo(string descr, string msg)
        {
            //return;            
            StreamWriter writer = null;
            try
            {
                string logUrl = ConfigurationManager.AppSettings["UTE_Service_Log"];
                logUrl = logUrl.Substring(0, logUrl.IndexOf("UTEService"));
                writer = new StreamWriter(logUrl+"WebSite/getGeoLog.txt", true, Encoding.GetEncoding(1251));
                writer.WriteLine("{0}: {1}\n\t{2}", DateTime.Now.ToLongTimeString(), descr, msg.Replace("\n", "\n\t"));
            }
            catch { }
            finally
            {
                if (writer != null)
                    writer.Close();
            }
        }


        public static void LogL( string descr, string msg )
        {
            return;
            StreamWriter writer = null;
            try
            {
                string logUrl = ConfigurationManager.AppSettings["UTE_Service_Log"];
                logUrl = logUrl.Substring(0, logUrl.IndexOf("UTEService"));
		        string filePath = logUrl+"log.txt";
                writer = new StreamWriter(filePath, true);
                writer.WriteLine( "{0}: {1}\n\t{2}", DateTime.Now.ToLongTimeString(), descr, msg.Replace( "\n", "\n\t" ) );
		        chmod(filePath);
            }
            //catch { }
            finally
            {
                if( writer != null )
                    writer.Close();
            }
        }
        /// <summary>
        /// Регистрирует событие аудита
        /// </summary>
        public static string Audit( string sessionId, int eventId, Hashtable details, bool success, string userId )
        {
            using (TransactionScope ts = new TransactionScope(TransactionScopeOption.Suppress))
            {
                IDbConnection conn = null;
                try
                {
                    // Получаем ID пользователя
                    //string userId = GetUserId(true);
                    // Получаем шаблон сообщения аудита
                    conn = CreateConnection( true );
                    IDbCommand cmd = conn.CreateCommand();
                    string schema = ConfigurationManager.AppSettings["policy_schema"];
                    cmd.CommandText = string.Format( "select detailed_message from {1}.b_audit_event_template where event_id = {0}", eventId, schema );
                    string msg = cmd.ExecuteScalar().ToString();
                    // Заполняем шаблон переданными значениями
                    foreach( DictionaryEntry de in details )
                        msg = msg.Replace( string.Format( "{{{0}}}", de.Key ), string.Format( "{0}", de.Value ) );
                    // Записываем полученное сообщение в БД
                    cmd.CommandText = string.Format(
                        "insert into {6}.b_audit_event (event_id, session_id, user_id, hostname, detailed_message, success) " +
                        "values ({0}, '{1}', {2}, '{3}', '{4}', {5})", 
                        eventId, sessionId, userId, HttpContext.Current.Server.MachineName, msg, success ? 1 : 0, schema );
                    return cmd.ExecuteNonQuery().ToString();
                }
                catch( Exception ex )
                {
                    Debug( string.Format( "Proxy.Audit() - Не удалось зарегистрировать событие аудита. \n{0}\n{1}", ex.Message, ex.StackTrace ) );
                    throw ex;
                }
                finally
                {
                    if( conn != null ) {conn.Close();}
                }
            }
        }

        public static string PackError( string msg, HttpServerUtility server )
        {
            return "<error>" + server.HtmlEncode( msg ) + "</error>";
        }

        public static string GetFlagFromQuery(string flagName, string query, string filePath)
        {
            Dictionary<string, string> varsDict = null;
            string[] descrSp = query.Split('#');
            string descrType = "select";
            bool finded = false;
            try
            {
                XPathDocument metaDoc = new XPathDocument(filePath);
                XPathNavigator metaNav = metaDoc.CreateNavigator().SelectSingleNode("/root/data[@id='" + descrSp[1] + "']/" + descrType);
                XPathNodeIterator provIterator = metaNav.Select("*");
                while (provIterator.MoveNext())
                {
                    varsDict = (provIterator.Current != null) ? DictOps.ExtractValues(provIterator.Current, "var", "string(@name)", "string(@default)") : null;
                    if (varsDict != null && varsDict.ContainsKey("USE_SERVER_CACHE") && varsDict["USE_SERVER_CACHE"] == "true")
                        return "true";
                }
            }
            catch (Exception e) {
            }
            return "false";
        }
        
        public static bool IsXMLFileRequest(string descrId, string descrType, string filePath)
        {            
            FileStream fs = null;
            XmlReader treader = null;
            try
            {
                string[] descrSp = descrId.Split('#');
                fs = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite);
                treader = XmlReader.Create(fs);
                treader.MoveToContent();
                bool d;
                d = treader.ReadToDescendant("data");
                while (d)
                {
                    string r_id = treader.GetAttribute("id");
                    if (r_id == descrSp[1])
                    {
                        bool finded = treader.ReadToDescendant(descrType);
                        if (!finded)
                            return false;
                        if (descrType == "select" && treader.ReadToDescendant("xmlQuery"))
                            return true;
                        else if (treader.ReadToDescendant("xmlCommand"))
                            return true;
                        return false;
                    }
                    d = treader.ReadToFollowing("data");
                }
            }
            catch (Exception e)
            {
                throw new Exception("$$ filePath=" + filePath+"|message=" + e.Message);
                return false;
            }
            finally
            {
                if (treader != null)
                    treader.Close();
                if (fs != null)
                    fs.Close();
            }
            return false;
        }

        public static void GetUTECommands(string dataProviderId, string descrType, string filePath, string data, out Dictionary<string, string> startUTEs, out Dictionary<string, string> endUTEs)
        {
            startUTEs = null;
            endUTEs = null;
            string[] descrSp = dataProviderId.Split('#');
            try
            {
                var metaDoc = new XPathDocument(filePath);
                XPathNavigator metaNav = metaDoc.CreateNavigator().SelectSingleNode("/root/data[@id='" + descrSp[1] + "']/" + descrType);                
                XPathNodeIterator provIterator = metaNav.Select("*");
                while (provIterator.MoveNext()){

                    XPathNavigator startUTENavigator = provIterator.Current.SelectSingleNode("start_ute_command");
                    XPathNavigator endUTENavigator = provIterator.Current.SelectSingleNode("end_ute_command");

                    startUTEs = (startUTENavigator != null) ? DictOps.ExtractValues(startUTENavigator, "ute_command", "string(@call)", "string(@input)") : null;
                    endUTEs = (endUTENavigator != null) ? DictOps.ExtractValues(endUTENavigator, "ute_command", "string(@call)", "string(@input)") : null;
                    //получили команды, теперь нужно заменить параметры {PARAM_NAME}, если они есть и пришли с командой
                    FillUTECommandsFromData(startUTEs, data);
                    FillUTECommandsFromData(endUTEs, data);
                }
            }
            catch (Exception e)
            {
                throw new Exception("GetUTECommands error: filePath=" + filePath + "|message=" + e.Message + "$dataProviderId=" + dataProviderId + ",descrType=" + descrType + ",data=" + data);
            }            
            return;
        }
        private static void FillUTECommandsFromData(Dictionary<string, string> dicts, string data)
        {
            XmlDocument doc = new XmlDocument();
            doc.LoadXml(data);
            if (dicts == null) return;

            Dictionary<string, string> dictss = new Dictionary<string, string>(dicts);
            XPathNodeIterator dataNodeIterator = doc.CreateNavigator().Select("/*/*/@*");
            while (dataNodeIterator.MoveNext())
            {
                string name = dataNodeIterator.Current.Name;
                foreach (var pair in dictss)
                {
                    if (pair.Value != null && pair.Value.IndexOf("{" + name + "}") != -1)
                    {
                        dicts[pair.Key] = pair.Value.Replace("{" + name + "}", dataNodeIterator.Current.Value);
                    }
                }

            }
        }
        public static string ConvertPdfToImg(string pdfname, string filename, string outputPath, string tempPath, string converterPath, string quality, string resQuality)
        {
            //разбиваем .pdf#
            try
            {
                if (pdfname.IndexOf(".pdf#") != -1)
                {
                    string fName = pdfname.Substring(0, pdfname.IndexOf(".pdf#") + 4);
                    string imgPage = pdfname.Substring(pdfname.IndexOf(".pdf#") + 5);
                    //-o "Папка 10.24 РГК.jpg" -sDEVICE=jpeg -dJPEGQ=100 -sPageList=12 -r30 "Папка 10.24 РГК.pdf"
                    filename = filename.Replace("\\", "_").Replace("/", "_").Substring(0, filename.IndexOf(".pdf#"));
                    //;
                    string guid = filename+"_" + Guid.NewGuid() + ".jpg";
                    string outputname = Path.Combine(outputPath, guid);//пока guid
                    string returnOutputname = Path.Combine(tempPath, guid);
                    string arguments = string.Format(@"-o ""{0}"" -sDEVICE=jpeg -dJPEGQ={3} -sPageList={1} -r{4} ""{2}""", Path.Combine(outputPath, outputname), imgPage, fName, quality, resQuality);
                    //return arguments;
                    Process proc = new Process();
                    proc.StartInfo.FileName = converterPath;// @"c:\Program Files\gs\gs9.23\bin\gswin64c";//забрать из конфига
                    proc.StartInfo.Arguments = arguments;
                    proc.StartInfo.UseShellExecute = false;
                    proc.Start();
                    proc.WaitForExit();

                    if (proc.ExitCode != 0)
                    {
                        return string.Format("Ошибка во время конвертации. Код возврата: {0}", proc.ExitCode); ;
                    }
                    else return returnOutputname;
                }
            }
            catch(Exception ex)
            {
                //return "Не удалось сформировать страницу pdf-файла.\n"+ex.Message+"";
            }
             
            return "Не удалось сформировать страницу pdf-файла.";
        }       
        

	//set permissions, default - recursively all permissions
	public static bool chmod(string file, string permissions = "-R 777")
        {
		Process process = new Process();
		process.StartInfo.FileName = "/bin/chmod";
		process.StartInfo.Arguments = String.Format ("{1} \"{0}\"",file,permissions);
		process.StartInfo.UseShellExecute = false;

		process.Start ();
		process.WaitForExit ();

		return process.ExitCode == 0;
        }
    }

    public enum LogSeverity
    {
        Information = 0,    // Informational message. 
        Warning,            // Noncritical problem. 
        Error              // Recoverable error. 
    }
}
