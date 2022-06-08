// 7.7.3.0
using System;
using System.Data;
using System.Configuration;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;

/// <summary>
/// Summary description for ContextItem
/// </summary>
namespace ASL
{
    public class ContextItem
    {
        private string _error;
        private string _result;
        private object _input;
        private string _connStr;
        private int _userId;

        public string Error
        {
            get { return _error; }
            set { _error = value; }
        }

        public string Result
        {
            get { return _result; }
            set { _result = value; }
        }

        public object Input
        {
            get { return _input; }
            set { _input = value; }
        }

        public int UserId
        {
            get { return _userId; }
            set { _userId = value; }
        }

        public string ConnStr
        {
            get { return _connStr; }
            set { _connStr = value; }
        }

        public string XMLString
        {
            get
            {
                string res = "";
                res = "<item result=\"" + _result + "\"";
                if (_error != "")
                {
                    res += " error=\"" + _error + "\"";
                }
                res += " />";
                return res;
            }
        }
    }
}