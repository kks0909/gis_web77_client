// 6.0.0.0
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
    public partial class GetDocumentPreview : System.Web.UI.Page
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
                string sourceUrl = string.IsNullOrEmpty(sourceUrlStr) ? Server.MapPath(NO_IMAGE_PATH) : Server.MapPath(sourceUrlStr);
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
                    return asyncDelegate.BeginInvoke(sourceUrl, size, maxWidth, maxHeight, isDebug, EndGenerateAndGetPreview, asyncDelegate);
                }
                else
                {
                    GetPreviewAsyncCall asyncDelegate = new GetPreviewAsyncCall(GenerateAndGetPreview);
                    return asyncDelegate.BeginInvoke(sourceUrl, size, size, size, isDebug, EndGenerateAndGetPreview, asyncDelegate);
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
            byte[] imageBytes;
            
            try
            {
                //Если файл найден - пытаемся получить из него картинку, иначе выводим превьюшку из NO_IMAGE_PATH
                if (File.Exists(sourceUrl))
                {
                    //Если переданы максимыльные ширина и высота - возвращаем картинку, подогнанную под эти размеры
                    if (maxWidth != size && maxHeight != size)
                    {
                        //Получение пропорционально сжатой картинки по ее url и maxWidth, maxHeight
                        imageBytes = ImageResizer.getResizedByMaxWHImageBytes(sourceUrl, maxWidth, maxHeight);
                    }
                    else
                    {
                        //Получение пропорционально сжатой картинки по ее url и size
                        imageBytes = ImageResizer.getResizedImageBytes(sourceUrl, size);
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
                //Проверяем тип исключения - если тип OutOfMemoryException, значит файл не является картинкой.
                //В этом случае нужно по возможности выводить preview для расширения с соответствующей константой
                if (exception is OutOfMemoryException)
                {
                    //Если установлен флаг отладки - генерируем текстовую ошибку в формате xml
                    if (isDebug)
                    {
                        HandleException(new Exception("Ошибка при получении уменьшенной копии картинки. Файл " + sourceUrl + " не является картинкой либо закончилась память.", exception));
                    }
                    else
                    {
                        //Получаем расширение файла без точки (регистр для файловой системы не важен) и добавляем сзади ".png"
                        string fileExtension = Path.GetExtension(sourceUrl).Remove(0, 1) + ".png";
                        //Собираем путь к файлу картинки для полученного расширения файла + папка с указанием размера, например \WebSite\Public\assets\Preview\32px\png.png
                        string filePath = Path.Combine(EXTENSION_FILES_PATH + size.ToString() + "px/", fileExtension);
                        //Если файла с указанным расширением в папке с превьюшками расширений нет, выводим иконку с неизвестным форматом
                        if (File.Exists(Server.MapPath(filePath)))
                        {
                            //Получение пропорционально сжатой картинки с иконкой типа документа по ее url и size
                            imageBytes = ImageResizer.getResizedImageBytes(Server.MapPath(filePath), size);
                        }
                        else
                        {
                            //Получение пропорционально сжатой картинки "неизвестный тип документа" по UNKNOWN_FORMAT_PATH и size
                            if (File.Exists(Server.MapPath(UNKNOWN_FORMAT_PATH)))
                            {
                                imageBytes = ImageResizer.getResizedImageBytes(Server.MapPath(UNKNOWN_FORMAT_PATH), size);
                            }
                            else //Если файла по UNKNOWN_FORMAT_PATH нет, выводим картинку unknownFormat.png, зашитую в коде
                            {
                                imageBytes = ImageResizer.getResizedUnknownFormatImageBytes(size);
                            }
                        }
                        //Отправляем результат
                        WebHelper.SendBytesAsResponse(Response, imageBytes);
                    }
                }
                else
                {
                    //Если установлен флаг отладки - генерируем текстовую ошибку в формате xml
                    if (isDebug)
                    {
                        HandleException(new Exception("Ошибка при получении уменьшенной копии картинки. Файл " + sourceUrl + ".", exception));
                    }
                    else
                    {
                        //Если при получении тамбнейла возникла ошибка преобразования, выводим картинку с текстом об ошибке, зашитую в коде
                        imageBytes = ImageResizer.getResizedNoImageBytes(size);
                        WebHelper.SendBytesAsResponse(Response, imageBytes);
                    }
                }
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