// 7.7.3.0
using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;

/// <summary>
/// Summary description for ResultItem
/// </summary>
namespace ASL
{
    public class ResultItem
    {
        private string _error;
        private string _result;

        public ResultItem(ContextItem ci)
        {
            _error = ci.Error != null ? ci.Error.Trim() : null;
            _result = ci.Result;
        }

        public string Result
        {
            get { return _result; }
            set { _result = value; }
        }

        public string Error
        {
            get { return _error; }
            set { _error = value; }
        }

        public string GetXMLString(HttpServerUtility server)
        {
            string res = "";
            res = "<item result=\"" + server.HtmlEncode(_result) + "\"";
            if (_error != "")
            {
                res += " error=\"" + server.HtmlEncode(_error) + "\"";
            }
            res += " />";
            return res;
        }
    }
}