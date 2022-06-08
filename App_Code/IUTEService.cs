// 7.7.3.0
using System.ServiceModel;

namespace ASL
{
    [ServiceContract]
    public interface IUTEService
    {
        [OperationContract]
        string Process(string templateName, string input);

        [OperationContract]
        string ProcessWithStatus(string templateName, string input, string statusFileName);

		[OperationContract]
        string GDALProcess(string templateName, string input, string descrId, string descrType, bool getSchema, bool toElements);

		[OperationContract]
        string CallShell(string path);        

    }
}
