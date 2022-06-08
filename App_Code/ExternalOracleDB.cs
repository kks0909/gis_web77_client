// 5.5.0.0
using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;

namespace ASL.Web
{
    /// <summary>
    /// Авторизация в другой БД под управлением СУБД Oracle
    /// </summary>
    public class ExternalOracleDB: IAuth
    {
        public bool Login(string user, string pass)
        {
            string database = ConfigurationManager.AppSettings["EXT_DB_ORACLE_Name"];

            if ((database == "") || (database == null))
            {
                throw new Exception("Не указано имя базы данных для авторизации");
            }
            string connStr = string.Format("User Id={0};Password={1};Server={2};", 
                                    user, pass, database);

            IDbConnection conn = null;
            try
            {
                conn = new Devart.Data.Oracle.OracleConnection(connStr);
            }
            catch
            {
                throw new Exception("Не удалось создать соединение с БД '" + database + "'");
            }
            try
            {
                try
                {
                    conn.Open();
                }
                catch (Exception ex)
                {
                    return false;
                }

                IDbCommand cmd = conn.CreateCommand();
                string query = ConfigurationManager.AppSettings["EXT_DB_ORACLE_Query"];
                string res = ConfigurationManager.AppSettings["EXT_DB_ORACLE_Result"];
                if (query == "" || res == "")
                {
                    throw new Exception("Не указаны параметры проверки пользователя во внешней БД");
                }
                cmd.CommandText = query;
                object result = cmd.ExecuteScalar();
                if (result == null || result.ToString() != res)
                {
                    return false;
                }
                else
                {
                    return true;
                }
            }
            finally
            {
                conn.Close();
            }

        }
    }
}