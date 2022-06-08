<?xml version="1.0" encoding="utf-8"?>
<!-- VERSION: 4.3.1.1 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt">

    <xsl:output method="text"  encoding="utf-8" indent="yes"/>
    <xsl:param name="protos" select="string('file:///C:/Program%20Files/Common%20Files/ParallelGraphics/Cortona/protos')"/>
    <xsl:param name="geocoord"/>
    <xsl:template match="/">
        <xsl:apply-templates select="*"/>
    </xsl:template>

    <xsl:template match="root">
        <!--xsl:if test="ROW/@layer_name"-->
        EXTERNPROTO GeoElevationGrid [
        field	SFNode   geoOrigin
        field	MFString geoSystem
        field	SFString geoGridOrigin
        field	SFInt32  xDimension
        field	SFString xSpacing
        field	SFInt32  zDimension
        field	SFString zSpacing
        field	MFFloat  height
        field	SFFloat  yScale
        exposedField SFNode   color
        exposedField SFNode   texCoord
        exposedField SFNode   normal
        field	SFBool   normalPerVertex
        field	SFBool   ccw
        field	SFBool   colorPerVertex
        field	SFFloat  creaseAngle
        field	SFBool   solid
        ] [
        "urn:web3d:geovrml:1.0/protos/GeoElevationGrid.wrl"
        "http://www.parallelgraphics.com/vrml/proto/GeoVRML/1.0/protos/GeoElevationGrid.wrl"
        "<xsl:value-of select="$protos"/>/GeoElevationGrid.wrl" ]

        EXTERNPROTO GeoLocation [
        field    SFNode    geoOrigin          # NULL
        field    MFString  geoSystem          # [ "GDC" ]
        field    SFString  geoCoords          # ""
        eventIn  SFString  set_geoCoords
        eventOut SFString  geoCoords_changed
        field    MFNode    children           # []
        ] [
        "urn:web3d:geovrml:1.0/protos/GeoLocation.wrl"
        "http://www.parallelgraphics.com/vrml/proto/GeoVRML/1.0/protos/GeoLocation.wrl"
        "<xsl:value-of select="$protos"/>/GeoLocation.wrl" ]

        EXTERNPROTO GeoViewpoint [
        field	SFNode	   geoOrigin
        field	MFString   geoSystem
        field	SFString   position
        field	SFRotation orientation
        field	SFString   description
        exposedField SFFloat	   fieldOfView
        exposedField SFBool	   jump
        exposedField MFString   navType
        exposedField SFBool      headlight
        field    SFFloat     speed
        ] [
        "urn:web3d:geovrml:1.0/protos/GeoViewpoint.wrl"
        "http://www.parallelgraphics.com/vrml/proto/GeoVRML/1.0/protos/GeoViewpoint.wrl"
        "<xsl:value-of select="$protos"/>/GeoViewpoint.wrl" ]

        EXTERNPROTO GeoOrigin [
        exposedField MFString geoSystem
        exposedField SFString geoCoords
        ] [
        "urn:web3d:geovrml:1.0/protos/GeoOrigin.wrl"
        "http://www.parallelgraphics.com/vrml/proto/GeoVRML/1.0/protos/GeoOrigin.wrl"
        "<xsl:value-of select="$protos"/>/GeoOrigin.wrl" ]

        EXTERNPROTO GeoTouchSensor [
        field        SFNode   geoOrigin
        field        MFString geoSystem
        exposedField SFBool   enabled
        eventOut     SFVec3f  hitNormal_changed
        eventOut     SFVec3f  hitPoint_changed
        eventOut     SFVec2f  hitTexCoord_changed
        eventOut     SFBool   isActive
        eventOut     SFBool   isOver
        eventOut     SFTime   touchTime
        eventOut     SFString hitGeoCoord_changed
        ] [
        "urn:web3d:geovrml:1.0/protos/GeoTouchSensor.wrl"
        "http://www.parallelgraphics.com/vrml/proto/GeoVRML/1.0/protos/GeoTouchSensor.wrl"
        "<xsl:value-of select="$protos"/>/GeoTouchSensor.wrl" ]

        EXTERNPROTO GeoCoordinate [
        field  SFNode    geoOrigin
        field  MFString  geoSystem
        field  MFString  point
        ]
        [	"urn:web3d:geovrml:1.0/protos/GeoCoordinate.wrl"
        "http://www.parallelgraphics.com/vrml/proto/GeoVRML/1.0/protos/GeoCoordinate.wrl"
        "<xsl:value-of select="$protos"/>/GeoCoordinate.wrl" ]

        EXTERNPROTO GeoMetadata [
        exposedField MFString url        # []
        exposedField MFString summary    # []
        exposedField MFNode   data       # []
        ] [ "urn:web3d:geovrml:1.0/protos/GeoMetadata.wrl"
        "http://www.parallelgraphics.com/vrml/proto/GeoVRML/1.0/protos/GeoMetadata.wrl"
        "<xsl:value-of select="$protos"/>/GeoMetadata.wrl" ]

        DEF ORIGIN GeoOrigin
        {
        geoSystem
        [
        "GCC", "KA"
        ]
        geoCoords "<xsl:value-of select="$geocoord"/>" <!--2638092.344703 2440597.628266 5251723.911371-->
        }

        DEF BASE FontStyle
        {
        family "TYPEWRITER"
        size 0.5
        style "BOLD"
        }
    </xsl:template>

    </xsl:stylesheet> 
