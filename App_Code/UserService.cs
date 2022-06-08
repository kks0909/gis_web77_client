// 7.7.5.0
using System;
using System.Data;
using System.Web;
using System.Collections;
using System.Collections.Generic;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.Xml;
using System.Configuration;
using System.Collections.Specialized;
using System.IO;
using ASL.Web;
using ASL.Security;
using System.Reflection;
using System.Transactions;



/// <summary>
/// Пользовательский сервис
/// </summary>
namespace ASL
{
    public class UserService : System.Web.Services.WebService
    {

        public UserService()
        {

            //Uncomment the following line if using designed components 
            //InitializeComponent(); 
        }
        [WebMethod]
        public String GetClientConfig()
        {
            NameValueCollection clientConfig = ConfigurationManager.GetSection("clientSettings") as NameValueCollection;
            String result = "<configuration><appSettings>";
            foreach (string s in clientConfig)
            {
                result += "<add key=\"" + s + "\" value='" + clientConfig[s] + "' />";
            }
            result += "</appSettings></configuration>";
            return result;
        }
        /* получение идентификатора активного пользователя */
        public int getActiveUserId(string login, string password)
        {
            using (TransactionScope ts = new TransactionScope(TransactionScopeOption.Suppress))
            {
                IDbConnection conn = null;
                bool success = false;
                string user_id = "";
                string status = "";
                string aModule = "";
                string pass = "";

                try
                {
                    conn = Util.CreateConnection(true);

                    // Проверка существования пользователя
                    IDbCommand cmd = conn.CreateCommand();                    
                    cmd.CommandText =
                        string.Format("select au.MODULE, up.USER_ID, up.STATUS, up.PASSWORD PASS from web50.B_USER_PRIVATE up LEFT JOIN web50.B_USER_AUTHMAPS au ON up.USER_ID = au.USER_ID WHERE UPPER(up.LOGIN) =UPPER('{0}')",
                        login);
                    IDataReader reader = cmd.ExecuteReader();
                    if (reader.Read())
                    {
                        if (reader["USER_ID"] != null)
                        {
                            user_id = reader["USER_ID"].ToString();
                        }
                        if (reader["STATUS"] != null)
                        {
                            status = reader["STATUS"].ToString();
                        }
                        if (reader["MODULE"] != null)
                        {
                            aModule = reader["MODULE"].ToString();
                        }
                        if (reader["PASS"] != null)
                        {
                            pass = reader["PASS"].ToString();
                        }
                    }
                    if (status != "A")
                        throw new Exception("Пользователь " + login + " заблокирован");

                    if (aModule == "")
                    {// обычная авторизация
                        if (Md5Hash.GetHash(password) == pass)
                        {
                            return Int32.Parse(user_id);
                        }
                        else
                        {
                            throw new Exception("Неверный логин/пароль");
                        }
                    }
                }
                finally
                {
                    if (conn != null) conn.Close();
                }
            }
            return -1;
        }

        [WebMethod]
        public string Login(string login, string password)
        {
            int userId;
            
            try
            {
                userId = getActiveUserId(login, password);
            }
            catch (Exception ex)
            {
                return Util.PackError(ex.Message, Server);
            }
            if (userId >= 0)
            {
                return "<user uid=\"" + Guid.NewGuid().ToString() + "\" id=\"" + userId + "\" />";
            }
            else
            {
                return "<user uid=\"-1\" />";
            }
        }
        [WebMethod]
        /// <summary>
        /// Закрывает указанную сессию.
        /// </summary>
        /// <param name="sessionId">идентификатор сесии.</param>
        /// <returns>1</returns>
        
        public string Logout(string sessionId)
        {
            // code to close session
            //Hashtable details = new Hashtable(1);
            //string login = "N/A";
            //if (HttpContext.Current.User != null)
            //    login = HttpContext.Current.User.Identity.Name;
            //details.Add("login", login);
            //Proxy.Audit(sessionId, (int)AuthEvents.UserLogout, details, true);
            //try
            //{
            //    using (Proxy proxy = new Proxy())
            //    {
            //        proxy.Disconnect(sessionId);
            //    }
            //}
            //catch (Exception ex)
            //{
            //    Trace.WriteLine("Не удалось закрыть сессию " + sessionId + ". " + ex.Message);
            //}
            return "1";
        }

        [WebMethod]
        /* 
         * login - логин пользователя, который производит смену пароля
         * password - пароль текущего пользователя (для проверки авторизации текущего пользователя)
         * newPassword - хеш нового пароля пользователя
         * changeLogin - имя пользователя, которому меняют пароль. если пустой, то пароль меняется пользователю с логином login
         * useExtAuth - включить/выключить внешнюю авторизацию для пользователя, указанного в changeLogin. 
         */
        public string ChangePass(string login, string password, string newPassword, string changeLogin, bool useExtAuth)
        {
            bool success = false;
            object result;
            int userId;
            string returnValue = "<error>Ошибка при изменении пароля. Обратитесь к администратору системы.</error>";
            using (TransactionScope ts = new TransactionScope(TransactionScopeOption.Suppress))
            {
                IDbConnection conn = null;
                IDbCommand cmd;
                string schema = "web50";               

                try
                {
                    // Изменение пароля пользователя в базе
                    // Если пользователь меняет свой пароль - проверяем авторизацию
                    if (changeLogin == "")
                    {
                        userId = getActiveUserId(login, password);
                        // если пользователь упешно авторизован - меняем пароль в базе (даже если внешняя авторизация)
                        if (userId >= 0)
                        {
                            conn = Util.CreateConnection(true);
                            cmd = conn.CreateCommand();
                            cmd.CommandText = string.Format("update web50.b_user_private set password = '{3}' where UPPER(login) = UPPER('{0}') and lower(password) = lower('{1}')",
                                login, Md5Hash.GetHash(password),schema, newPassword);
                            cmd.ExecuteNonQuery();

                            returnValue = "<user id=\"1\" />";
                        }
                    }
                    else
                    {
                        // проверяем, что пользователю, меняющему пароль другого пользователя, выдана роль администратора (ROLE_ID=0)
                        conn = Util.CreateConnection(true);
                        cmd = conn.CreateCommand();
                        cmd.CommandText =
                            string.Format("SELECT bup.USER_ID FROM {1}.B_USER_PRIVATE bup JOIN {1}.B_USER_TO_B_ROLE bubr ON bubr.USER_ID=bup.USER_ID AND bubr.ROLE_ID=0 WHERE UPPER(bup.LOGIN) = UPPER('{0}')",
                            login, schema);
                        result = cmd.ExecuteScalar();
                        // пользователь не имеет прав администратора - выводим соответствующее сообщение об ошибке
                        if (result == null)
                        {
                            returnValue = "<error>У вас недостаточно прав на смену пароля.</error>";
                        }
                        else
                        {
                            // если указано включить внешнюю авторизацию - добавляем ее
                            if (useExtAuth)
                            {
                                // добавляем внешнюю аторизацию указанному в changeLogin пользователю, если ее не было. Пароль не меняем.
                                cmd.CommandText = string.Format("INSERT INTO {1}.B_USER_AUTHMAPS (USER_ID,NAME,MODULE,CUSER_ID) SELECT USER_ID,'Авторизация в БД Oracle','ASL.Web.ExternalOracleDB',0 FROM {1}.B_USER_PRIVATE WHERE UPPER(LOGIN) = UPPER('{0}') AND NOT EXISTS (SELECT 1 FROM {1}.B_USER_AUTHMAPS WHERE USER_ID = (SELECT USER_ID FROM {1}.B_USER_PRIVATE WHERE UPPER(LOGIN)=UPPER('{0}')))",
                                        changeLogin, schema);
                                cmd.ExecuteNonQuery();
                            }
                            else
                            {
                                // если у пользователя из changeLogin была внешняя авторизация - удаляем ее
                                cmd.CommandText = string.Format("DELETE FROM {1}.B_USER_AUTHMAPS WHERE USER_ID = (SELECT USER_ID FROM WEB50.B_USER_PRIVATE WHERE UPPER(LOGIN)=UPPER('{0}'))",
                                        changeLogin, schema);
                                cmd.ExecuteNonQuery();
                                // изменяем пароль указанного в changeLogin пользователя
                                cmd.CommandText = string.Format("update {2}.b_user_private set password = '{1}' where UPPER(login) = UPPER('{0}')",
                                        changeLogin, newPassword, schema);
                                cmd.ExecuteNonQuery();
                            }

                            returnValue = "<user id=\"1\" />";
                        }
                    }
                }
                catch (Exception ex)
                {
                    return Util.PackError("Ошибка при смене пароля: " + ex.Message, Server);
                }
                finally
                {
                    if (conn != null) conn.Close();
                }
            }

            return returnValue;
        }

        [WebMethod]
        /// <summary>
        /// Возвращает список задач, доступных пользователю
        /// </summary>
        /// <returns></returns>
        public string GetUserTasks(string user)
        {
            //if (HttpContext.Current.User == null)
            //    return null;
            string login = user; // HttpContext.Current.User.Identity.Name;
            
            List<UserTask> res = new List<UserTask>();
            List<string> roles = new List<string>();
            string resultMenu = "";
            using (TransactionScope ts = new TransactionScope(TransactionScopeOption.Suppress))
            {
                IDbConnection conn = null;
                try
                {
                    // Получаем список идентификаторов задач
                    conn = Util.CreateConnection(true);
                    IDbCommand cmd = conn.CreateCommand();
                    string schema = "web50";
                    cmd.CommandText =
                         string.Format("select r.ROLE_ID from {1}.b_user_to_b_role ur, {1}.b_role r, {1}.b_user_private u  " +
                                       "where ur.user_id = u.user_id and r.role_id = ur.role_id and UPPER(u.login) = UPPER('{0}') order by r.role_id",
                                       login, schema);
                    IDataReader reader = cmd.ExecuteReader();
                    // Получаем список ролей
                    while (reader.Read())
                    {
                        string role_id = reader["role_id"].ToString();
                        roles.Add(role_id);
                    }
                    reader.Close();
                    // -1 - роль по-умолчанию
                    if (roles.Count == 0)
                        roles.Add("-1");

                    string rolesPath = "Core\\UITasks\\B_ROLE_TO_TASKS.xml";
                    FileStream fs = null;
                    XmlReader treader = null;
                    try
                    {
                        fs = new FileStream(Server.MapPath(rolesPath), FileMode.Open,
                                                                        FileAccess.Read, FileShare.ReadWrite);
                        treader = XmlReader.Create(fs);
                        treader.MoveToContent();
                        bool d;
                        d = treader.ReadToDescendant("role");
                        int founded = 0;
                        while (d)
                        {
                            string r_id = treader.GetAttribute("id");
                            if (roles.Contains(r_id))
                            {
                                treader.ReadToDescendant("tasks");
                                resultMenu += treader.ReadInnerXml();
                                founded++;
                            }
                            d = treader.ReadToFollowing("role");

                            if (roles.Count == founded) // если все нашли, прекращаем
                            {
                                d = false;
                            }
                        }
                    }
                    catch (Exception e)
                    {
                        Util.Debug(string.Format("Не удалось получить список задач. \n{0}\n{1}",
                            e.Message, e.StackTrace));
                        return Util.PackError(e.Message, Server);
                    }
                    finally
                    {
                        if (treader != null)
                            treader.Close();
                        if (fs != null)
                            fs.Close();
                    }
                }
                catch (Exception ex)
                {
                    Util.Debug(string.Format("Proxy.GetUserTasks() - Не удалось получить список задач. \n{0}\n{1}",
                            ex.Message, ex.StackTrace));
                    return Util.PackError(ex.Message, Server);
                }
                finally
                {
                    if (conn != null)
                        conn.Close();

                }
            }
            string xmlRes = "<data>"+ resultMenu+ "</data>";
            return xmlRes;
        }

        [WebMethod]
        /// <summary>
        /// Возвращает настройки пользовательской задачи
        /// </summary>
        /// <param name="template_id"></param>
        /// <returns></returns>
        public string GetTaskSettings(string template_id, string user)
        {
            string res = "";
            string tasksPath = "Core\\UITasks\\" + template_id + ".xml";
            try
            {
                using (StreamReader sr = File.OpenText(Server.MapPath(tasksPath)))
                {
                    res = sr.ReadToEnd();                   
                }
            }
            catch (Exception ex)
            {
                Util.Debug(string.Format("Proxy.GetTaskSettings() - Не удалось получить информацию о задаче. \n{0}\n{1}",
                           ex.Message, ex.StackTrace));
                return Util.PackError(ex.Message, Server);
            }
            finally
            {
            }

            // Формируем результат

            //content = "<task><box percentWidth='50' percentHeight='50'><panel id='moduleId'><settings><wsp>10100</wsp></settings>" +
            //          "</panel></box><box percentWidth='50' percentHeight='50'><panel id='moduleId2'><settings>" + 
            //          "<user>ltg</user></settings></panel></box></task>";
            //settings = "<task><box percentWidth='50' percentHeight='50'>" +
            //          "</box><box percentWidth='50' percentHeight='50'><panel id='moduleId2'><settings>" +
            //          "<user>ltg333</user><dummy>4</dummy></settings></panel></box></task>";
            if (res == "")
                res = "<ROOT prevTask=\"close\"></ROOT>";
            
            return res;
        }

        [WebMethod]
        /// <summary>
        /// Возвращает список имен файлов задач (имена файлов, лежащих в директории "Core\\UITasks\\" и имеющих расширение "*.xml")
        /// </summary>
        /// <returns></returns>
        public string GetTaskNames(string user)
        {
            string res = "";
            string tasksPath = "Core\\UITasks\\";
            string [] tasks;
            try
            {
                tasks = Directory.GetFiles(Server.MapPath(tasksPath),"*.xml");
                res += "<data>";
                foreach (string s in tasks)
                {
                    res += "<task name='" + Path.GetFileName(s) + "' />";
                }
                res += "</data>";
                return res;
            }
            catch (Exception ex)
            {
                Util.Debug(string.Format("Proxy.GetTaskNames() - Не удалось получить список задач. \n{0}",
                           ex.Message, ex.StackTrace));
                return Util.PackError(ex.Message, Server);
            }
            finally
            {
            }

            // Формируем результат
            if (res == "")
                res = "<data></data>";

            return res;
        }
    }

    
}
