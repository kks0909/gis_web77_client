// 7.7.3.0
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.ServiceModel;
using Common.Spatial.Cache;
using Common.Spatial.Geometry;
using Common.Spatial.Layers;
using X3M.Core.Common.Database;
using X3M.Core.Common.DataStructures;

namespace ASL
{
    [ServiceContract]
    public interface IMapGenService
    {
        [OperationContract]
        string Test(string s);

        
        void GenerateTiles(string queryStringArgumentsDictionarySerialized, string queryFolderPath, DatabaseType databaseType, string connectionString);

        
        string WmsGetCapabilities(string queryFolderPath, string wmsServiceTitle, string gisUrl, string wmsBaseUrl);

        /// <summary>
        /// Пока воспринимает координаты всегда в системе GoogleMercator
        /// даже если вдруг придёт в запросе другая система (прийти не может)
        /// </summary>
        
        byte[] WmsGetMapHandlingContour(string queryStringArgumentsDictionarySerialized, string queryFolderPath, DatabaseType databaseType, string connectionString, string outOfContourTilesSerialized, bool deleteBeforeStart);
        
        byte[] WmsGetMap(string queryStringArgumentsDictionarySerialized, string queryFolderPath, DatabaseType databaseType, string connectionString);


        
        string PrepareFastCache(string layerQueryId, string queryData, int pointsDispersion, string queryFolderPath, DatabaseType databaseType, string connectionString);


        
        byte[] HandleGetMapRequestUsingTiles(int tileTreeId, string[] layerIds, double latlongCoordinate1X, double latlongCoordinate1Y, double latlongCoordinate2X, double latlongCoordinate2Y, int zoomLevel, int width, int height, string queryFolderPath, DatabaseType databaseType, string connectionString, List<Point> outOfContourTiles, bool deleteBeforeStart);
        
        string[] GetTilesTreeLayers(int tileTreeId, string queryFolderPath, int zoomLevel);

        
        byte[] GetTile(string queryFolderPath, int tileTreeId, int zoomLevel, int tileX, int tileY);
        [OperationContract]
        int GetTilesTreeIdByName(string tilesTreeName);


        
        void DeleteTiles(int tileTreeId, string queryFolderPath, int zoomLevel);
        
        void DeleteTransparentTiles(int tileTreeId, string queryFolderPath, int zoomLevel);
        
        void DeleteTemporaryTiles(int tileTreeId, string queryFolderPath, int zoomLevel);
        [OperationContract]
        string DrawLayersWMS(string queryStringArgumentsDictionarySerialized, string queryFolderPath, string publicFolderPath, DatabaseType databaseType, string connectionString, string sessionId);
        
        string GetLayersWMSCapabilities(string queryFolderPath, string wmsServiceTitle, string gisUrl, string wmsBaseUrl);
       /*
        string DrawLayers(string session_id, string connStr, DatabaseType srcType, double min_x, double min_y, double max_x, double max_y,
            int width, int height, string imageFile, string layers);*/
        
        string DrawLayers(string session_id, string connStr, DatabaseType srcType, double min_x, double min_y, double max_x, double max_y,
            int width, int height, string imageFile, string layers, string userMask);

        /// <summary> Орудует координатами в системе градусов Крассовского </summary>
        //byte[] DrawLayersToBitmap( string session_id, string connStr, DatabaseType srcType, double min_x, double min_y, double max_x, double max_y, int width, int height, List<GeoLayer> layers, out int drawnObjectsCount, bool doSmoothing, int backgroundOpaque );
        
        byte[] DrawLayersToBitmap(string session_id, X3M.Core.Common.DataStructures.Tuple<DataCache, List<GeoLayer>>[] cachesAndLayers, string connStr, DatabaseType srcType, double min_x, double min_y, double max_x, double max_y, int width, int height, out int drawnObjectsCount, bool doSmoothing, int backgroundOpaque);


        //string[] GetLayerIds();
        [OperationContract]
        string GetObjectsInfo(string session_id, double x, double y, double radius, string layers, string userMask);
        
        string GetObjectFrame(string session_id, long obj_id, double distance, string layers, string userMask);
        
        string GetConnectionString(string session_id);
        
        string ConnectTo(string connStr, DatabaseType srcType);
        
        void Disconnect(string session_id);
        
        GeoObjBounds GetMapBounds(string session_id);
        
        string GetMapBoundsStr(string session_id);
        
        void SetMinMaxBounds(double minX, double minY, double maxX, double maxY);
        
        void GetMinMaxBounds(ref double minX, ref double minY, ref double maxX, ref double maxY);
        
        void UpdateCosmetic(string session_id, GeoObject obj);
        
        void SetDefaultWSPID(int wsp_id);
        
        int GetDefaultWSPID();
        
        void ForceMemFree();



        int LogLevel { get; set; }
        int PointsDispersion { get; set; }
        bool FullLog { get; set; }
        bool UseAntiAlias { get; set; }

        //DatabaseType DataSrcType { get; }
        TextRenderingHint TextRenderHint { get; set; }
        InterpolationMode RasterInterpolationMode { get; set; }
        SmoothingMode AntiAliasMode { get; set; }
        RectangleD WorkingArea { get; set; }
        int ActiveSessionLimit { get; set; }
        string MsgNoLayersToDraw { get; set; }
        string MsgNoObjectsToDraw { get; set; }
        //GeometryFormatType GeometryFormat { get; set; }
        int SessionTimeout { get; set; }
        Color MapBgColor { get; set; }
        byte MapBgAlpha { get; set; }
        int InterpolationQuality { get; set; }
        [OperationContract]
        string GenerateZoneAroundTileInOneRequest(string databaseTypeStr, string connectionString,
                                                  string queryFolderPath, int tilesTreeId, int zoomLevel, int tileX, int tileY, int howManyTilesAround);
    }
}
