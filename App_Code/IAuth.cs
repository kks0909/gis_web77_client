// 7.7.5.0
using System;
using System.Data;
using System.Configuration;
using System.Reflection;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;

/// <summary>
/// Сводное описание для IAuth
/// </summary>
namespace ASL.Web
{
    public interface IAuth
    {
        bool Login(string user, string pass);
    }
}