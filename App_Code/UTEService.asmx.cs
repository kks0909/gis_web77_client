// 7.7.5.0
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Configuration;
using System.Data;
using System.IO;
using System.Xml;
//using System.Xml.Linq;
using System.Runtime.Remoting.Channels.Ipc;
using System.Web.Services;
using System.Globalization;
using System.Diagnostics;
using System.Threading;
using NewAdm.Core;
using System.Web;
using Common.MapGen.Proxy;
using X3M.Core.Common.Database;
using System.Transactions;

//using Common.MapGen;
//using Common.MapGen.Proxy;


namespace ASL
{
    /// <summary>
    /// Служба доступа к данным
    /// </summary>
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    public class UTEService : WebService
    {

        [WebMethod(Description = @"Импорт ЭХЗ")]
        //useXmlAbout - использовать пришедшие из параметров в <data> или из xml
        public string ImportPI_CP(string path, string input)
        {
            string zip_file_name = "";
            Util.LogLUTE("ImportPI_CP input:" + input);

            //TODO
            //<object name="ZIP_FILE_NAME" value="{xpath_view.CONTEXT.root_path}{xpath_view.CONTEXT.zip_file_name}" />
            //<object name="PS_IDX" value="{xpath_view.CONTEXT.ps_idx}" />
            using (TransactionScope ts = new TransactionScope(TransactionScopeOption.Suppress))
            {
                IDbConnection conn = null;
                try
                {
                    //path = @"Public\Data\UploadedFiles\";
                    //input = @"<input DESCR='' KM_START='' KM_END='' PRODUCER='UNKNOWN' LINK_KIP='true' JUST_KIP='true' WGS='true' CRITERIA='UNKNOWN' TYPE='UNKNOWN' RESULT='UNKNOWN' TOOL='UNKNOWN' SOURCE='UNKNOWN' NOMINAL_SPACING='1000' USE_XML='true' zip_file_name='Public\Data\UploadedFiles\dataЭхз.xml' />";
                    string PODS_USER = ConfigurationManager.AppSettings["PODS_USER"];
                    bool just_kip = false;
                    bool link_kip = false;
                    string date = "";// "01.03.2002 0:00:00";//{xpath_view.REPORT_VIEW.date:dd.MM.yyyy}
                    string source = "UNKNOWN";
                    string type = "UNKNOWN";//"UNKNOWN";//{xpath_view.REPORT_VIEW.source}
                    string descr = "";
                    string km_start = "";
                    string km_end = "";
                    string criteria = "UNKNOWN";
                    string result = "UNKNOWN";
                    string nominal_spacing = "";
                    string tool = "UNKNOWN";
                    bool wgs = false;
                    XmlDocument inputDoc = new XmlDocument();
                    inputDoc.LoadXml(input);
                    zip_file_name = Server.MapPath(inputDoc.DocumentElement.Attributes["zip_file_name"].Value);
                    if (false && zip_file_name.IndexOf(".zip") != -1)
                    {

                        string v = zip_file_name.Substring(0, zip_file_name.IndexOf(".zip"));
                        v = v.Substring(zip_file_name.LastIndexOf(@"\") + 1);

                        string new_zip_file_name = Server.MapPath(ConfigurationManager.AppSettings["WORK_PATH"] + @"\" + v);

                        Process proc = new Process();
                        proc.StartInfo.FileName = Server.MapPath(ConfigurationManager.AppSettings["SERVICE_PATH"] + @"\unzip.exe");
                        proc.StartInfo.Arguments = zip_file_name + " -d " + new_zip_file_name;
                        proc.StartInfo.RedirectStandardOutput = false;
                        proc.StartInfo.UseShellExecute = false;

                        proc.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                        proc.StartInfo.CreateNoWindow = true;
                        return proc.StartInfo.FileName;
                        try
                        {
                            proc.Start();
                            zip_file_name = new_zip_file_name + @"\data.xml";
                        }
                        catch (Exception ex)
                        {
                            return ex.Message;
                             Util.LogLUTE(ex.Message);
                        }
                        return "v = " + v + "  n=" + new_zip_file_name;

                    }
                    if (inputDoc.DocumentElement != null)
                    {
                         Util.LogLUTE("Загружается " + zip_file_name);
                        XmlDocument xmlDoc = new XmlDocument();
                        xmlDoc.Load(zip_file_name);
                        //парсим из xml
                        Util.LogLUTE("Загружен " + zip_file_name);

                        if (inputDoc.DocumentElement.Attributes["USE_XML"].Value != null && inputDoc.DocumentElement.Attributes["USE_XML"].Value == "true")
                        {
                            if (xmlDoc.DocumentElement.Attributes["JUST_KIP"] != null)
                            {
                                just_kip = xmlDoc.DocumentElement.Attributes["JUST_KIP"].Value.ToString() == "True";
                                //return "just_kip11=" + xmlDoc.DocumentElement.Attributes["JUST_KIP"].Value+"   ss";
                            }
                            if (xmlDoc.DocumentElement.Attributes["LINK_KIP"] != null)
                                link_kip = xmlDoc.DocumentElement.Attributes["LINK_KIP"].Value == "True";
                            if (xmlDoc.DocumentElement.Attributes["DATE"] != null)
                                date = xmlDoc.DocumentElement.Attributes["DATE"].Value;// "01.03.2002 0:00:00";//{xpath_view.REPORT_VIEW.date:dd.MM.yyyy}
                            if (xmlDoc.DocumentElement.Attributes["SOURCE"] != null)
                                source = xmlDoc.DocumentElement.Attributes["SOURCE"].Value;
                            if (xmlDoc.DocumentElement.Attributes["TYPE"] != null)
                                type = xmlDoc.DocumentElement.Attributes["TYPE"].Value;//"UNKNOWN";//{xpath_view.REPORT_VIEW.source}
                            if (xmlDoc.DocumentElement.Attributes["DESCR"] != null)
                                descr = xmlDoc.DocumentElement.Attributes["DESCR"].Value;
                            if (xmlDoc.DocumentElement.Attributes["KM_START"] != null)
                                km_start = xmlDoc.DocumentElement.Attributes["KM_START"].Value;
                            if (xmlDoc.DocumentElement.Attributes["KM_END"] != null)
                                km_end = xmlDoc.DocumentElement.Attributes["KM_END"].Value;
                            if (xmlDoc.DocumentElement.Attributes["CRITERIA"] != null)
                                criteria = xmlDoc.DocumentElement.Attributes["CRITERIA"].Value;
                            if (xmlDoc.DocumentElement.Attributes["RESULT"] != null)
                                result = xmlDoc.DocumentElement.Attributes["RESULT"].Value;
                            if (xmlDoc.DocumentElement.Attributes["NOMINAL_SPACING"] != null)
                                nominal_spacing = xmlDoc.DocumentElement.Attributes["NOMINAL_SPACING"].Value;
                            if (xmlDoc.DocumentElement.Attributes["TOOL"] != null)
                                tool = xmlDoc.DocumentElement.Attributes["TOOL"].Value;
                            if (xmlDoc.DocumentElement.Attributes["WGS"] != null)
                                wgs = xmlDoc.DocumentElement.Attributes["WGS"].Value == "True";

                        }
                        else
                        {
                            //парсим из клиента
                            if (inputDoc.DocumentElement.Attributes["JUST_KIP"] != null)
                                just_kip = inputDoc.DocumentElement.Attributes["JUST_KIP"].Value == "true";
                            if (inputDoc.DocumentElement.Attributes["LINK_KIP"] != null)
                                link_kip = inputDoc.DocumentElement.Attributes["LINK_KIP"].Value == "true";
                            if (inputDoc.DocumentElement.Attributes["DATE"] != null)
                                date = inputDoc.DocumentElement.Attributes["DATE"].Value;// "01.03.2002 0:00:00";//{xpath_view.REPORT_VIEW.date:dd.MM.yyyy}
                            if (inputDoc.DocumentElement.Attributes["SOURCE"] != null)
                                source = inputDoc.DocumentElement.Attributes["SOURCE"].Value;
                            if (inputDoc.DocumentElement.Attributes["TYPE"] != null)
                                type = inputDoc.DocumentElement.Attributes["TYPE"].Value;//"UNKNOWN";//{xpath_view.REPORT_VIEW.source}
                            if (inputDoc.DocumentElement.Attributes["DESCR"] != null)
                                descr = inputDoc.DocumentElement.Attributes["DESCR"].Value;
                            if (inputDoc.DocumentElement.Attributes["KM_START"] != null)
                                km_start = inputDoc.DocumentElement.Attributes["KM_START"].Value;
                            if (inputDoc.DocumentElement.Attributes["KM_END"] != null)
                                km_end = inputDoc.DocumentElement.Attributes["KM_END"].Value;
                            if (inputDoc.DocumentElement.Attributes["CRITERIA"] != null)
                                criteria = inputDoc.DocumentElement.Attributes["CRITERIA"].Value;
                            if (inputDoc.DocumentElement.Attributes["RESULT"] != null)
                                result = inputDoc.DocumentElement.Attributes["RESULT"].Value;
                            if (inputDoc.DocumentElement.Attributes["NOMINAL_SPACING"] != null)
                                nominal_spacing = inputDoc.DocumentElement.Attributes["NOMINAL_SPACING"].Value;
                            if (inputDoc.DocumentElement.Attributes["TOOL"] != null)
                                tool = inputDoc.DocumentElement.Attributes["TOOL"].Value;
                            if (inputDoc.DocumentElement.Attributes["WGS"] != null)
                                wgs = inputDoc.DocumentElement.Attributes["WGS"].Value == "true";
                            //return "just_kip12=" + just_kip;
                        }
                        if (descr == "")
                            return "Наименование трубопровода не должно быть пустым.";
                        conn = Util.CreateConnection(true);
                        IDbCommand cmd = conn.CreateCommand();
                        try
                        {

                            cmd.CommandText = string.Format(
                                    @"DO $$
			                DECLARE
			                    returnId integer;
			                BEGIN 
			                    INSERT INTO pods.event_range(FEATURE_ID,STATION_ID_BEGIN,STATION_ID_END,PODS_USER,CREATE_DATE,VALIDITY_TOLERANCE,EFFECTIVE_FROM_DATE,CURRENT_INDICATOR_LF,POSITIONING_TYPE_CL) 
 			                    VALUES ('PI_CP_INSPECTION', 0, 0, '{0}', current_timestamp, 0, current_timestamp, 'Y', 'UNKNOWN') RETURNING EVENT_ID INTO returnId;
 			                    INSERT INTO pods.pi_cp_inspection(EVENT_ID, TYPE_CL, DESCRIPTION, COMMENTS, INSPECTION_DATE, CRITERIA_CL, RESULT_CL, TOOL_CL, SOURCE_GCL, NOMINAL_SPACING, PI_EVENT_ID) 
 			                    VALUES (returnId, '{1}', '{2}', '{3}-{4}', TO_DATE('{5}','DD.MM.YYYY'), '{6}', '{7}', '{8}', '{9}',  NULLIF('{10}','')::numeric, -90) ; 
 			                END $$;",
                                    PODS_USER, type, descr, km_start, km_end, date, criteria, result,
                                    tool, source, nominal_spacing);

                            cmd.ExecuteScalar();

                            /*для постгреса не добавляем параметры типа Output*/
                            cmd = conn.CreateCommand();
                            cmd.CommandTimeout = 0;
                            cmd.CommandText = "select max(event_id) id from pods.event_range";
                            IDataReader rdr = cmd.ExecuteReader();
                            string eventId = "";
                            //читаем только 1-й результат
                            while (rdr.Read())
                            {
                                eventId = rdr["id"].ToString();
                                if (eventId != "")
                                    break;
                            }
                            rdr.Close();

                            Util.LogLUTE("EVENT_ID=" + eventId);
                            string EVENT_ID = eventId;
                            // проходим по всем MEASURE
                            foreach (XmlNode node in xmlDoc.DocumentElement.ChildNodes)
                            {
                                //write_readings
                                //TODO все поля
                                Util.LogLUTE("start write_readings");
                                string DESCR = (node.Attributes["DESCR"] != null) ? node.Attributes["DESCR"].Value : "NULL";
                                string U_вкл = (node.Attributes["U_вкл"] != null && node.Attributes["U_вкл"].Value != "") ? node.Attributes["U_вкл"].Value : "NULL";
                                string U_откл = (node.Attributes["U_откл"] != null && node.Attributes["U_откл"].Value != "") ? node.Attributes["U_откл"].Value : "NULL";
                                string min_пот = (node.Attributes["min_пот"] != null && node.Attributes["min_пот"].Value != "") ? node.Attributes["min_пот"].Value : "NULL";
                                string G_вкл = (node.Attributes["G_вкл"] != null && node.Attributes["G_вкл"].Value != "") ? node.Attributes["G_вкл"].Value : "NULL";
                                string G_откл = (node.Attributes["G_откл"] != null && node.Attributes["G_откл"].Value != "") ? node.Attributes["G_откл"].Value : "NULL";
                                string dG = (node.Attributes["dG"] != null && node.Attributes["dG"].Value != "") ? node.Attributes["dG"].Value : "NULL";
                                string ddG = (node.Attributes["ddG"] != null && node.Attributes["ddG"].Value != "") ? node.Attributes["ddG"].Value : "NULL";
                                string R = (node.Attributes["R"] != null && node.Attributes["R"].Value != "") ? node.Attributes["R"].Value : "NULL";
                                string NUMKIP = (node.Attributes["NUMKIP"] != null) ? node.Attributes["NUMKIP"].Value : "NULL";
                                string REF_EVENT_ID = (node.Attributes["REF_EVENT_ID"] != null) ? node.Attributes["REF_EVENT_ID"].Value : "NULL";
                                string COMM = (node.Attributes["COMM"] != null) ? node.Attributes["COMM"].Value : "NULL";
                                string COORD_B = (node.Attributes["COORD_B"] != null && node.Attributes["COORD_B"].Value != "") ? node.Attributes["COORD_B"].Value : "NULL";
                                string COORD_L = (node.Attributes["COORD_L"] != null && node.Attributes["COORD_L"].Value != "") ? node.Attributes["COORD_L"].Value : "NULL";

                                if (wgs)
                                {
                                    double b_res, l_res, h_res;
                                    if (COORD_B != "NULL" && COORD_L != "NULL")
                                    {
                                        GeoFuncs.WGSP42(Double.Parse(COORD_B, CultureInfo.InvariantCulture), Double.Parse(COORD_L, CultureInfo.InvariantCulture), 0, out b_res, out l_res, out h_res);
                                        COORD_B = b_res.ToString(); COORD_B = COORD_B.Replace(",", ".");
                                        COORD_L = l_res.ToString(); COORD_L = COORD_L.Replace(",", ".");
                                        //доп проверка. Если в числе ",", то меняем её на точку 
                                    }
                                }
                                /// заменяем {4}/1000 в sql. случай, если null
                                if (R != "NULL") R += "/1000";
                                if (DESCR != "NULL") DESCR = "'"+DESCR+"'";
                                   

                                if (!just_kip)
                                {
                                	cmd.CommandText = string.Format(
                                        @"DO $$
	                                DECLARE
	                                    returnId integer;
	                                BEGIN
	                                    INSERT INTO pods.event_range(FEATURE_ID,STATION_ID_BEGIN,STATION_ID_END,PODS_USER,CREATE_DATE,VALIDITY_TOLERANCE,EFFECTIVE_FROM_DATE,CURRENT_INDICATOR_LF,POSITIONING_TYPE_CL) 
	                                        VALUES ('PI_CIS_READING', 0, 0, '{0}', current_timestamp, 0, current_timestamp, 'Y', 'UNKNOWN') RETURNING EVENT_ID INTO returnId; 
	                                    INSERT INTO pods.pi_cis_reading(EVENT_ID, PS_ON, PS_OFF, DC_POTENTIAL_VOLTS, GRAD_ON, GRAD_OFF, D_GRAD, DD_GRAD, DESCRIPTION, INSPECTION_DATE, PI_CP_EVENT_ID, COMMENTS, SOURCE_GCL)
	                                        VALUES (returnId, {2}, {3}, {5}, {6}, {7}, {8}, {9}, SUBSTR('{10}',1,50), TO_DATE('{11}','DD.MM.YYYY'), {16}, trim('{1}')||';'||trim('{13}')||';'||trim('{14}'), '{15}');
	                                    IF '{10}' LIKE 'КИП%' AND {1} IS NOT NULL THEN
	                                    INSERT INTO pods.event_range(FEATURE_ID,STATION_ID_BEGIN,STATION_ID_END,PODS_USER,CREATE_DATE,VALIDITY_TOLERANCE,EFFECTIVE_FROM_DATE,CURRENT_INDICATOR_LF,POSITIONING_TYPE_CL) 
	                                        VALUES ('PI_CP_READING', 0, 0, '{0}', current_timestamp, 0, current_timestamp, 'Y', 'UNKNOWN') RETURNING EVENT_ID INTO returnId; 
	                                    INSERT INTO pods.pi_cp_reading(EVENT_ID, TYPE_CL, PS_ON, PS_OFF, RESISTANCE_READING, POTENTIAL_READING, GRAD_ON, GRAD_OFF, D_GRAD, DD_GRAD, DESCRIPTION, INSPECTION_DATE, PI_CP_EVENT_ID, REF_TEST_LEAD_EVENT_ID, COMMENTS, SOURCE_GCL)
	                                        VALUES (returnId, 'UNKNOWN', {2}, {3}, {4},  {5}, {6}, {7}, {8}, {9}, SUBSTR('{10}',1,50), TO_DATE('{11}','DD.MM.YYYY'), {16}, {12}, trim({1})||';'||trim('{13}')||';'||trim('{14}'), '{15}');
	                                    END IF;
	                                END $$;",
                                        PODS_USER, DESCR, U_вкл, U_откл, R, min_пот, G_вкл, G_откл,
                                        dG, ddG, COMM, date, REF_EVENT_ID, COORD_B, COORD_L, source, EVENT_ID);
                                }                                    
                                else
                                {
									cmd.CommandText = string.Format(
                                          @"DO $$
		                            DECLARE 
                                        returnId integer;
		                            BEGIN
		                                IF {1} IS NOT NULL THEN
		                                    INSERT INTO pods.event_range(FEATURE_ID,STATION_ID_BEGIN,STATION_ID_END,PODS_USER,CREATE_DATE,VALIDITY_TOLERANCE,EFFECTIVE_FROM_DATE,CURRENT_INDICATOR_LF,POSITIONING_TYPE_CL) 
		                                        VALUES ('PI_CP_READING', 0, 0, '{0}', current_timestamp, 0, current_timestamp, 'Y', 'UNKNOWN') RETURNING EVENT_ID INTO returnId; 
		                                    INSERT INTO pods.pi_cp_reading(EVENT_ID, TYPE_CL, PS_ON, PS_OFF, RESISTANCE_READING, POTENTIAL_READING, GRAD_ON, GRAD_OFF, D_GRAD, DD_GRAD, DESCRIPTION, INSPECTION_DATE, PI_CP_EVENT_ID, REF_TEST_LEAD_EVENT_ID, COMMENTS, SOURCE_GCL)
		                                        VALUES (returnId, 'UNKNOWN', {2}, {3}, {4}, {5}, {6}, {7}, {8}, {9}, SUBSTR(coalesce('{10}','КИП '||'{10}'||';','')||'{11}',1,50), TO_DATE('{12}','DD.MM.YYYY'), {17}, {13}, trim({1})||';'||trim('{14}')||';'||trim('{15}'), '{16}');
		                                END IF;
		                            END $$;",
                                            PODS_USER, DESCR, U_вкл, U_откл, R, min_пот, G_вкл, G_откл,
                                            dG, ddG, NUMKIP, COMM, date, REF_EVENT_ID, COORD_B, COORD_L, source, EVENT_ID);
                                }

                                cmd.CommandText = cmd.CommandText.Replace("'NULL'","''");
                                cmd.ExecuteScalar();
                            }

                        }
                        catch (Exception ex)
                        {
Util.LogLUTE(ex.Message + ", Command=" + cmd.CommandText);
                            return Util.PackError(ex.Message + ", Command=" + cmd.CommandText, Server);
                        }
                    }
                }
                catch (Exception ex)
                {
                    Util.LogLUTE(string.Format("ImportCP - Не удалось зарегистрировать событие Импорта ЭХЗ. \n{0}\n{1}",
                               ex.Message, ex.StackTrace));
                    return Util.PackError(ex.Message, Server);
                }
                finally
                {
                    if (conn != null)
                        conn.Close();
                }

                //start delete_xml_file
                Util.LogLUTE("start delete_xml_file");
                File.Delete(zip_file_name);
                Util.LogLUTE("end delete_xml_file");
                //end delete_xml_file
                Util.LogLUTE("Операция импорта ЭХЗ прошла успешно");

                return "1";

            }
        }
    }
}
