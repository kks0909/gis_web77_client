// 6.0.0.0
using System;
using System.IO;
using System.Web;
using System.Drawing;
using System.Drawing.Imaging;
using System.Drawing.Drawing2D;

namespace ASL
{

    public static class ImageResizer
    {
        public const int DEFAULT_IMAGE_SIZE = 32;

        //Получение информации о картинке по ее url
        public static string getImageInfo(string filename)
        {
            System.Drawing.Image inputImg = System.Drawing.Image.FromFile(filename);
            int imageWidth = inputImg.Width;
            int imageHeight = inputImg.Height;
            object imageTag = inputImg.Tag;
            //Освобождаем ресурсы выводимой картинки
            inputImg.Dispose();
            //Массив со свойствами картинки
            string imageInfo = "{type:'image', width:" + imageWidth.ToString() + ", height:" + imageHeight.ToString() + "}";
            return imageInfo;
        }

        //Получение сжатой с сохранением пропорций картинки по ее url, ширине и высоте
        public static byte[] getResizedByMaxWHImageBytes(string filename, int maxWidth, int maxHeight)
        {
            Image resizedImage = ResizeImageByMaxWH(filename, maxWidth, maxHeight);
            byte[] resBytes = imageToByteArray(resizedImage);
            //Освобождаем ресурсы выводимой картинки
            resizedImage.Dispose();
            return resBytes;
        }

        //Получение сжатой с сохранением пропорций картинки по ее url и размеру
        public static byte[] getResizedImageBytes(string filename, int size)
        {
            Image resizedImage = ResizeImage(filename, size);
            byte[] resBytes = imageToByteArray(resizedImage);
            //Освобождаем ресурсы выводимой картинки
            resizedImage.Dispose();
            return resBytes;
        }

        //Конвертация картинки в массив байтов
        private static byte[] imageToByteArray(System.Drawing.Image image)
        {
            MemoryStream ms = new MemoryStream();
            image.Save(ms, ImageFormat.Png);
            return ms.ToArray();
        }

        //Пропорциональное сжатие дефолтной иконки для случая, когда иконка не найдена
        public static byte[] getResizedNoImageBytes(int size)
        {
            Image resizedImage = TextToImage("No\nimage", size);
            byte[] resBytes = imageToByteArray(resizedImage);
            //Освобождаем ресурсы выводимой картинки
            resizedImage.Dispose();
            return resBytes;
        }

        //Пропорциональное сжатие дефолтной иконки для случая, когда иконка с нужным форматом не найдена
        public static byte[] getResizedUnknownFormatImageBytes(int size)
        {
            Image resizedImage = TextToImage("Unknown\nformat", size);
            byte[] resBytes = imageToByteArray(resizedImage);
            //Освобождаем ресурсы выводимой картинки
            resizedImage.Dispose();
            return resBytes;
        }

        //Вспомогательная функция для рисования текста на картинке заданного размера
        private static Image TextToImage(string textToDraw, int size)
        {
            int bmpSize = size > 0 ? size : DEFAULT_IMAGE_SIZE;
            Bitmap bmp = new Bitmap(size, size);
            Graphics g = Graphics.FromImage((Image)bmp);
            g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.AntiAlias;
            g.DrawString(textToDraw, new Font("Arial", 6), Brushes.Red, new PointF(0, 0));
            g.Dispose();
            return (Image)bmp;
        }

        //Пропорциональное сжатие картинки переданной по filename
        public static Image ResizeImage(string filename, int size)
        {
            System.Drawing.Image inputImg = System.Drawing.Image.FromFile(filename);
            System.Drawing.Image resImage = ResizeImage(inputImg, size);
            //Освобождаем ресурсы
            inputImg.Dispose();
            return resImage;
        }
        //Пропорциональное сжатие картинки Image
        public static Image ResizeImage(Image inputImg, int size)
        {
            int sourceWidth = inputImg.Width;
            int sourceHeight = inputImg.Height;

            //Размеры генерируемой картинки
            int newWidth = DEFAULT_IMAGE_SIZE;
            int newHeight = DEFAULT_IMAGE_SIZE;

            //Коэффициент сжатия
            float nPercent = 0;

            //Минимальный из исходных размеров
            int minDim = Math.Min(sourceWidth, sourceHeight);

            if (sourceWidth > size && sourceHeight > size)
            {
                //Определяем насколько нужно сжать по горизонтали и по вертикали по меньшей стороне
                nPercent = ((float)size / (float)minDim);
                //Устанавливаем соответствующие сжатию размеры генерируемой картинки
                newWidth = (int)(nPercent * sourceWidth);
                newHeight = (int)(nPercent * sourceHeight);
            }
            else
            {
                //Сжимать исходную картинку в этом случае не будем
                nPercent = 1;
                //Если исходный размер в точности совпадает с size, картинку отдаем в первоначальном виде
                if (sourceWidth == size && sourceHeight == size)
                {
                    newWidth = size;
                    newHeight = size;
                }
                else
                {
                    //Если исходный размер меньше, чем size и по высоте и по ширине, то картинку рисуем с размером по высоте = size, а по ширине авной исходному размеру
                    if (sourceWidth < size && sourceHeight < size)
                    {
                        newHeight = size;
                        newWidth = sourceWidth;
                    }
                    else //Если только меньший из размеров меньше size
                    {
                        //Если меньший размер - высота, то формируем картинку без сжатия с высотой size и с исходной шириной
                        if (minDim == sourceHeight)
                        {
                            newHeight = size;
                            newWidth = sourceWidth;
                        }
                        else //Если меньший размер - ширина, то отдаем исходное изображение без изменений
                        {
                            newWidth = sourceWidth;
                            newHeight = sourceHeight;
                        }
                    }
                }
            }

            //получаем размеры сжатого исходного изображения
            int destWidth = (int)(sourceWidth * nPercent);
            int destHeight = (int)(sourceHeight * nPercent);
                
            //Определяем в каком месте нужно рисовать прямоугольник чтобы сжатая пропорционально картинка была по центру в новой
            int x = (int)((newWidth - destWidth) / 2);
            int y = (int)((newHeight - destHeight) / 2);
            
            Bitmap b = new Bitmap(newWidth, newHeight);
            Graphics g = Graphics.FromImage((Image)b);
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                
            g.DrawImage(inputImg, x, y, destWidth, destHeight);
            //Освобождаем ресурсы
            inputImg.Dispose();
            g.Dispose();

            return (Image)b;
        }

        //Пропорциональное сжатие картинки Image по ширине и высоте по filename
        public static Image ResizeImageByMaxWH(string filename, int maxWidth, int maxHeight)
        {
            System.Drawing.Image inputImg = System.Drawing.Image.FromFile(filename);
            System.Drawing.Image resImage = ResizeImageByMaxWH(inputImg, maxWidth, maxHeight);
            //Освобождаем ресурсы
            inputImg.Dispose();
            return resImage;
        }
        //Пропорциональное сжатие картинки Image по ширине и высоте
        public static Image ResizeImageByMaxWH(Image inputImg, int maxWidth, int maxHeight)
        {
            int sourceWidth = inputImg.Width;
            int sourceHeight = inputImg.Height;

            //Размеры генерируемой картинки
            int newWidth = maxWidth;
            int newHeight = maxHeight;

            //Коэффициент сжатия
            float nPercent = 0;

            //Если картинка по обоим размерам вписывается в ограничения - отдаем ее в оригинальном размере
            if (sourceWidth <= maxWidth && sourceHeight <= maxHeight)
            {
                //Сжимать исходную картинку в этом случае не будем
                nPercent = 1;
                //Просто отдаем картинку как есть
                newWidth = sourceWidth;
                newHeight = sourceHeight;
            }
            else
            {
                //Если хотя бы один из размеров больше максимальных - сжимаем по большему из коэффициентов сжатия сторон
                nPercent = Math.Min((float)newWidth / (float)sourceWidth, (float)newHeight / (float)sourceHeight);
                //Устанавливаем соответствующие сжатию размеры генерируемой картинки
                newWidth = (int)(nPercent * sourceWidth);
                newHeight = (int)(nPercent * sourceHeight);
            }
            //Заводим новую картинку требуемого размера
            Bitmap b = new Bitmap(newWidth, newHeight);
            Graphics g = Graphics.FromImage((Image)b);
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            //Сохраняем картинку со сжатием
            g.DrawImage(inputImg, 0, 0, newWidth, newHeight);
            //Освобождаем ресурсы
            inputImg.Dispose();
            g.Dispose();

            return (Image)b;
        }
    }
}