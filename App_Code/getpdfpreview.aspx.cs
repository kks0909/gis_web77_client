// 7.0.3.2
using System;
using System.Configuration;
using System.IO;
using System.Runtime.Remoting.Channels.Ipc;
using System.Text;
using System.Reflection;
using System.Web;
using X3M.Core.Common.Database;
using X3M.Core.Common.StringHandling;
using X3M.Core.Common.Logging;

namespace ASL
{
    public partial class GetPdfPreview : System.Web.UI.Page
    {
        private const string EXTENSION_FILES_PATH = "~/Public/assets/Preview/";
        private const string NO_IMAGE_PATH = "~/Public/assets/Preview/noImage.png";
        private const string UNKNOWN_FORMAT_PATH = "~/Public/assets/Preview/unknownFormat.png";
        
        
        protected override void OnLoad(EventArgs e)
        {
            base.OnLoad(e);

            if (!IsPostBack)
            {
                AddOnPreRenderCompleteAsync(BeginAsyncOperation, EndAsyncOperation);
            }
        }

        private void EndAsyncOperation(IAsyncResult ar)
        {
            object state = ar.AsyncState;
        }

        IAsyncResult BeginAsyncOperation(object sender, EventArgs e, AsyncCallback cb, object state)
        {
            try
            {
                //Получаем из строки параметры запроса
                string query = Context.Request.QueryString.ToString();
                string url = StringHelper.DecodeUrl(query);
                //Получаем из запроса sourceUrl картинки
                string sourceUrlStr = HttpUtility.ParseQueryString(url).Get("sourceUrl");                
                //Получаем из запроса size картинки
                string sizeStr = HttpUtility.ParseQueryString(url).Get("size");
                //Если не задан параметр size, будем сжимать по дефолтному значению
                int size = string.IsNullOrEmpty(sizeStr) ? ImageResizer.DEFAULT_IMAGE_SIZE : int.Parse(sizeStr);
                //Если указанный размер <= 0, устанавливаем дефолтное значение
                if (size <= 0)
                    size = ImageResizer.DEFAULT_IMAGE_SIZE;
                //Считываем параметр отладки debug, если он есть, по-умолчанию отключен
                string isDebugStr = HttpUtility.ParseQueryString(url).Get("debug");
                bool isDebug = !string.IsNullOrEmpty(isDebugStr) && isDebugStr == "true" ? true : false;

                //Получаем из запроса maxWidth и maxHeight картинки (если нужна превьюха картинки с ограничением по макс. размеру)
                string maxWidthStr = HttpUtility.ParseQueryString(url).Get("maxWidth");
                string maxHeightStr = HttpUtility.ParseQueryString(url).Get("maxHeight");
                int maxWidth = string.IsNullOrEmpty(maxWidthStr) ? 0 : int.Parse(maxWidthStr);
                int maxHeight = string.IsNullOrEmpty(maxHeightStr) ? 0 : int.Parse(maxHeightStr);

                //Если есть параметры maxWidth и maxHeight - вместо иконки стандартного квадратного размера получаем изображение, подогнанное под эти размеры
                if (maxWidth > 0 && maxHeight > 0)
                {
                    GetPreviewAsyncCall asyncDelegate = new GetPreviewAsyncCall(GenerateAndGetPreview);
                    return asyncDelegate.BeginInvoke(sourceUrlStr, size, maxWidth, maxHeight, isDebug, EndGenerateAndGetPreview, asyncDelegate);
                }
                else
                {
                    GetPreviewAsyncCall asyncDelegate = new GetPreviewAsyncCall(GenerateAndGetPreview);
                    return asyncDelegate.BeginInvoke(sourceUrlStr, size, size, size, isDebug, EndGenerateAndGetPreview, asyncDelegate);
                }
            }
            catch (Exception ex)
            {
                return new EmptyAction(delegate { }).BeginInvoke(HandleExceptionCallback, ex);
            }
        }

        public delegate void GetPreviewAsyncCall(string sourceUrl, int size, int maxWidth, int maxHeight, bool isDebug);

        private void GenerateAndGetPreview(string sourceUrl, int size, int maxWidth, int maxHeight, bool isDebug)
        {
            //Возвращаемый результат
            //isDebug = true;
            byte[] imageBytes;           
            try
            {
                if (sourceUrl.IndexOf(".pdf$")!=-1)
                    sourceUrl = sourceUrl.Replace(".pdf$", ".pdf#");
                string libDocPath = ConfigurationManager.AppSettings["Lib_Path"]; //"Public/Data/LIB";
                string filePath = Context.Server.MapPath(Path.Combine(libDocPath, sourceUrl));
                string outputPath = Context.Server.MapPath(ConfigurationManager.AppSettings["Temp_Path"]);
                string converterPath = ConfigurationManager.AppSettings["Ghostscript_Path"];
                string quality = "60";
                string dpi = "30";
                if (ConfigurationManager.AppSettings["PDF2IMG_JPEG_QUALITY_PREVIEW"] != null)
                    quality = ConfigurationManager.AppSettings["PDF2IMG_JPEG_QUALITY_PREVIEW"];
                if (ConfigurationManager.AppSettings["PDF2IMG_JPEG_DPI_PREVIEW"] != null)
                    dpi = ConfigurationManager.AppSettings["PDF2IMG_JPEG_DPI_PREVIEW"];
                string pdfImg = Util.ConvertPdfToImg(filePath, sourceUrl, outputPath, ConfigurationManager.AppSettings["Temp_Path"], converterPath, quality, dpi);
                //Если файл найден - пытаемся получить из него картинку, иначе выводим превьюшку из NO_IMAGE_PATH
                pdfImg = Context.Server.MapPath(pdfImg);
                if (File.Exists(pdfImg))
                {
                    //Если переданы максимыльные ширина и высота - возвращаем картинку, подогнанную под эти размеры
                    if (maxWidth != size && maxHeight != size)
                    {
                        //Получение пропорционально сжатой картинки по ее url и maxWidth, maxHeight
                        imageBytes = ImageResizer.getResizedByMaxWHImageBytes(pdfImg, maxWidth, maxHeight);
                    }
                    else
                    {
                        //Получение пропорционально сжатой картинки по ее url и size
                        imageBytes = ImageResizer.getResizedImageBytes(pdfImg, size);
                    }
                }
                else
                {
                    if (File.Exists(Server.MapPath(NO_IMAGE_PATH)))
                    {
                        //Получение пропорционально сжатой картинки "файл не найден" по NO_IMAGE_PATH и size
                        imageBytes = ImageResizer.getResizedImageBytes(Server.MapPath(NO_IMAGE_PATH), size);
                    }
                    else
                    {
                        //Если не найден и файл по NO_IMAGE_PATH, выводим картинку с текстом об ошибке, зашитую в коде
                        imageBytes = ImageResizer.getResizedNoImageBytes(size);
                    }
                }
                //Отправляем результат
                WebHelper.SendBytesAsResponse(Response, imageBytes);
            }
            catch (Exception exception)
            {
                if (File.Exists(Server.MapPath(NO_IMAGE_PATH)))
                {
                    //Получение пропорционально сжатой картинки "файл не найден" по NO_IMAGE_PATH и size
                    imageBytes = ImageResizer.getResizedImageBytes(Server.MapPath(NO_IMAGE_PATH), size);
                }
                else
                {
                    //Если не найден и файл по NO_IMAGE_PATH, выводим картинку с текстом об ошибке, зашитую в коде
                    imageBytes = ImageResizer.getResizedNoImageBytes(size);
                }
                //Отправляем результат
                WebHelper.SendBytesAsResponse(Response, imageBytes);
            }
            finally
            {
            }
        }

        private void EndGenerateAndGetPreview(IAsyncResult ar)
        {
            GetPreviewAsyncCall callDelegate = (GetPreviewAsyncCall)ar.AsyncState;
            callDelegate.EndInvoke(ar);
        }

        private void HandleException(Exception ex)
        {
            string fullText = Util.PackError(ex.Message, Server);
            WebHelper.SendTextAsResponse(Request, Response, fullText);
        }

        private delegate void EmptyAction();

        private void HandleExceptionCallback(IAsyncResult ar)
        {
            Exception exception = (Exception)ar.AsyncState;

            HandleException(new Exception("Can't handle document preview request", exception));
        }
        
    }
}