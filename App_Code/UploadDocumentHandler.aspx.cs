//Version 5.3.0.2

using System;
using System.Data;
using System.Configuration;
using System.Collections.Specialized;
using ASL;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;
using System.IO;
using System.Collections;

namespace FlexUpload
{
    public partial class UploadDocumentHandler : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            string uploadPath = ConfigurationManager.AppSettings["Data_Path"];     
 string gpxUploadPath = ((NameValueCollection)(ConfigurationManager.GetSection("clientSettings")))["Upload_Path"];
            string filePath = "";
            string virtualDirectoryPath = "";
            if (string.IsNullOrEmpty(Request["path"]))
                virtualDirectoryPath = System.Web.Hosting.HostingEnvironment.MapPath("~/" + uploadPath);
            else
            {
                if (!string.IsNullOrEmpty(Request["uploadPath"]))
                    virtualDirectoryPath = Path.Combine("~/" + gpxUploadPath, Request["path"]);
                else
                    virtualDirectoryPath = Path.Combine("~/" + uploadPath, Request["path"]);

            }
     
            filePath = System.Web.Hosting.HostingEnvironment.MapPath(virtualDirectoryPath);
 
filePath=filePath.Replace("\\","/");
//WebHelper.SendTextAsResponse(Request, Response, "combinedFilePath= " + filePath );  

            if (!Directory.Exists(filePath)){		
                Directory.CreateDirectory(filePath);

}
try{
Util.chmod(filePath);
}
catch(Exception ex){

}
           //WebHelper.SendTextAsResponse(Request, Response, "uploadPath= " + virtualDirectoryPath + "   filePath=" + filePath);
            
            //return;
            for (int i = 0; i < Request.Files.Count; i++)
            {
                //Если в запросе не было переменной fileNameGUID - получаем имя из файла, иначе подставляем из переменной fileNameGUID
                string fileNameGUID = string.IsNullOrEmpty(Request["fileNameGUID"]) ? System.IO.Path.GetFileName(Request.Files[i].FileName) : Request["fileNameGUID"];
		string combinedFilePath = Path.Combine(filePath, fileNameGUID);
                Request.Files[i].SaveAs(combinedFilePath);

try{
Util.chmod(combinedFilePath);
}
catch(Exception ex){
//WebHelper.SendTextAsResponse(Request, Response, "errr= " + ex.Message );  
}
		
            }
        }
    }
}
