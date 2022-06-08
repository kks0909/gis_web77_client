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
   public System.Int32 getStyles(System.String path)
   {
    try {
    files = System.IO.Directory.GetFiles(path, "*_STYLE.xml");
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
   public System.Int32 getStyleId(System.Int32 num)
   {
    try {
    if (files != null && num < files.Length)
      return num;
    else
      return -1;
    }
    catch (Exception err) {return -2;}
   }
   
   public System.String getStyleDescr(System.Int32 num)
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
        return getStyleFile(num).ToUpper().Replace("_STYLE.XML", "");
      }
    }
    catch (Exception err) {return getStyleFile(num);}
    finally { 
      if (reader != null) 
        reader.Close();
    }
    return getStyleFile(num);
   }
   public System.String getStyleFile(System.Int32 num)
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
        <xsl:variable name="styleCnt" select="user:getStyles($pathQuery)"/>
        <xsl:call-template name="addStyle">
           <xsl:with-param name="styleNum" select="0"/>
        </xsl:call-template>
    </root>
    </xsl:template>
    <xsl:template name="addStyle">
      <xsl:param name="styleNum"/>
      <xsl:variable name="styleId" select="user:getStyleId($styleNum)"/>
      <xsl:variable name="styleDescr" select="user:getStyleDescr($styleNum)"/>
      <xsl:variable name="styleFile" select="user:getStyleFile($styleNum)"/>
      <xsl:if test="($styleId >= 0)">
      <data >
        <xsl:attribute name="ID"><xsl:value-of select="$styleNum"/></xsl:attribute>
        <xsl:attribute name="CODE"><xsl:value-of select="$styleFile"/></xsl:attribute>
        <xsl:attribute name="DESCR"><xsl:value-of select="$styleFile"/></xsl:attribute>
        <xsl:attribute name="FILE_NAME"><xsl:value-of select="$styleFile"/></xsl:attribute>
      </data>
      <xsl:call-template name="addStyle">
        <xsl:with-param name="styleNum" select="$styleNum + 1"/>
      </xsl:call-template>
      </xsl:if>
    </xsl:template>
</xsl:stylesheet>