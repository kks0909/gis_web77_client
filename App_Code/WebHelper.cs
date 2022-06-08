// 7.7.3.0
using System;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Web;

namespace ASL
{
    public enum AcceptedEncodingType
    {
        GZip,
        Deflate,
        NoCompression
    }

    public class WebHelper
    {
        public static void SendTextAsResponse( HttpRequest request, HttpResponse response, string text )
        {
            SendTextAsResponse( request, response, text, 200 );
        }

        public static void SendTextAsResponse( HttpRequest request, HttpResponse response, string text, int statusCode )
        {
            SendTextAsResponse( request, response, text, statusCode, "text/xml" );
        }

        public static void SendTextAsResponse( HttpRequest request, HttpResponse response, string text, int statusCode, string contentType )
        {
            AcceptedEncodingType encodingType = AcceptedEncodingType.NoCompression;

            try
            {
                string clientEncodings = request.Headers["Accept-Encoding"];
                if( clientEncodings != null )
                {
                    clientEncodings = clientEncodings.ToLower();
                    if( clientEncodings.Contains( "gzip" ) ) { encodingType = AcceptedEncodingType.GZip; }
                    if( clientEncodings.Contains( "deflate" ) ) { encodingType = AcceptedEncodingType.Deflate; }
                }
            }
            catch( Exception ) {}

            if( encodingType == AcceptedEncodingType.NoCompression )
            {
                response.Clear();
                response.ClearHeaders();

                response.StatusCode = statusCode;

                byte[] textBytes = Encoding.UTF8.GetBytes( text );

                response.BufferOutput = false;
                response.AppendHeader( "Content-Type", contentType );
                response.AppendHeader( "Content-Language", "ru" );
                response.AppendHeader( "Content-Length", textBytes.Length.ToString() );
                response.Charset = "UTF-8";
                response.ContentEncoding = Encoding.UTF8;

                response.OutputStream.Write( textBytes, 0, textBytes.Length );

                response.Flush();
                response.Close();
            }
            else
            {
                SendTextAsResponseCompressed( response, text, encodingType, statusCode, contentType );
            }
        }

        public static void SendTextAsResponseCompressed( HttpResponse response, string text, AcceptedEncodingType encodingType )
        {
            SendTextAsResponseCompressed( response, text, encodingType, 200, "text/xml" );
        }

        public static void SendTextAsResponseCompressed( HttpResponse response, string text, AcceptedEncodingType encodingType, int statusCode, string contentType )
        {
            response.Clear();
            response.ClearHeaders();

            response.StatusCode = statusCode;

            byte[] contentInBytes = UTF8Encoding.UTF8.GetBytes( text );
            byte[] compressedBytes = null;
            using( MemoryStream inputStream = new MemoryStream() )
            {
                inputStream.Write( contentInBytes, 0, contentInBytes.Length );
                inputStream.Seek( 0, SeekOrigin.Begin );

                compressedBytes = Compress( inputStream, encodingType );
            }

            response.BufferOutput = false;
            response.AppendHeader( "Content-Type", contentType );
            response.AppendHeader( "Content-Language", "ru" );
            response.AppendHeader( "Content-Length", compressedBytes.Length.ToString() );
            response.AppendHeader( "Content-Encoding", encodingType == AcceptedEncodingType.GZip ? "gzip" : "deflate" );
            response.Charset = "UTF-8";

            response.OutputStream.Write( compressedBytes, 0, compressedBytes.Length );


            response.Flush();
            response.Close();
        }

        public static byte[] Compress( Stream inputStream, AcceptedEncodingType encodingType )
        {
            using( MemoryStream outputStream = new MemoryStream() )
            {
                using( Stream compressionStream = encodingType == AcceptedEncodingType.GZip ? new GZipStream( outputStream, CompressionMode.Compress ) :
                                                                                     (Stream)new DeflateStream( outputStream, CompressionMode.Compress ) )
                {
                    byte[] buffer = new byte[4096];
                    int numRead;
                    while( (numRead = inputStream.Read( buffer, 0, buffer.Length )) != 0 )
                    {
                        compressionStream.Write( buffer, 0, numRead );
                    }
                }

                byte[] outputBytes = outputStream.ToArray();
                return outputBytes;
            }
        }

        public static void SendBytesAsResponse( HttpResponse response, byte[] bytes )
        {
            SendBytesAsResponse( response, bytes, 200 );
        }

        public static void SendBytesAsResponse( HttpResponse response, byte[] bytes, int statusCode )
        {
            response.Clear();

            response.StatusCode = statusCode;

            response.ContentType = "image/png";

            response.BufferOutput = false;
            response.AddHeader( "Content-Length", bytes.Length.ToString() );

            response.BinaryWrite( bytes );

            response.Flush();
            response.Close();
        }
    }
}