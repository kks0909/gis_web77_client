// 7.7.3.0
using System;
using System.Data;
using System.Configuration;
using System.Collections;
using System.Collections.Generic;
using System.Web;
using System.Web.Security;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.WebControls.WebParts;
using System.Web.UI.HtmlControls;

/// <summary>
/// Summary description for UserTask
/// </summary>
namespace ASL
{
    public class UserTask
    {
        string template_id;
        string name;
        string description;
        List<string> groups;

        public UserTask(string template_id, string name, string description, List<string> groups)
        { 
            this.template_id = template_id; 
            this.name = name; 
            this.description = description; 
            this.groups = groups; 
        }

        public string TemplateId 
        { 
            get { return template_id; } 
        }
        public string Name 
        { 
            get { return name; } 
        }
        public string Description 
        { 
            get { return description; } 
        }
        public List<string> Groups 
        { 
            get { return groups; } 
        }
    }
}