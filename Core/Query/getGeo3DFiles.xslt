<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl" xmlns:user="urn:my-scripts"
>
  <!-- version 7.7.3.0 -->
    <xsl:output method="xml" indent="yes"/>
  <msxsl:script language="C#" implements-prefix="user">
    <![CDATA[
    string[] files;
    string basePath;
   public System.Int32 getGeo3Ds(System.String path)
   {
    try {
    files = System.IO.Directory.GetFiles(path, "*_GEO3D.xml");
    basePath = path;
    string result = "<data>";
    foreach (string s in files)
    {
      result += s;
    }
    return files.Length;
    }
    catch (Exception err) {return -1;}
   }
   public System.Int32 getGeo3DId(System.Int32 num)
   {
    try {
    if (files != null && num < files.Length)
      return num;
    else
      return -1;
    }
    catch (Exception err) {return -2;}
   }
   
   public System.String getGeo3DDescr(System.Int32 num)
   {
    XmlReader reader = null;
    try {
      reader = XmlReader.Create(files[num]);
      reader.ReadToFollowing("root");
      string descr = reader.GetAttribute("descr");
      if (descr != null && descr != "" )
      {
        return descr;
      }
      else
      {
        // нет такого атрибута, возвращаем имя файла
        return getGeo3DFile(num).ToUpper().Replace("_GEO3D.XML", "");
      }
    }
    catch (Exception err) {return getGeo3DFile(num);}
    finally { 
      if (reader != null) 
        reader.Close();
    }
    return getGeo3DFile(num);
   }
   public System.String getGeo3DFile(System.Int32 num)
   {
    try {
        string s = files[num];
        return s.Substring(basePath.Length+1);
    }
    catch (Exception err) {return err.ToString();}
   }
   
    ]]>
  </msxsl:script>

    <xsl:template match="@* | node()">
      <root>
        <xsl:variable name="pathQuery" select="//appSettings/add[@key='Query_Path']/@value"/>
        <xsl:variable name="geo3DCnt" select="user:getGeo3Ds($pathQuery)"/>
        <xsl:call-template name="addGeo3D">
           <xsl:with-param name="geo3DNum" select="0"/>
        </xsl:call-template>
    </root>
    </xsl:template>
    <xsl:template name="addGeo3D">
      <xsl:param name="geo3DNum"/>
      <xsl:variable name="geo3DId" select="user:getGeo3DId($geo3DNum)"/>
      <xsl:variable name="geo3DDescr" select="user:getGeo3DDescr($geo3DNum)"/>
      <xsl:variable name="geo3DFile" select="user:getGeo3DFile($geo3DNum)"/>
      <xsl:if test="($geo3DId >= 0)">
      <data >
        <xsl:attribute name="ID"><xsl:value-of select="$geo3DNum"/></xsl:attribute>
        <xsl:attribute name="CODE"><xsl:value-of select="$geo3DFile"/></xsl:attribute>
        <xsl:attribute name="DESCR"><xsl:value-of select="$geo3DFile"/></xsl:attribute>
        <xsl:attribute name="FILE_NAME"><xsl:value-of select="$geo3DFile"/></xsl:attribute>
      </data>
      <xsl:call-template name="addGeo3D">
        <xsl:with-param name="geo3DNum" select="$geo3DNum + 1"/>
      </xsl:call-template>
      </xsl:if>
    </xsl:template>
</xsl:stylesheet>