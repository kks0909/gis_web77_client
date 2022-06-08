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
   public System.Int32 getSems(System.String path)
   {
    try {
    files = System.IO.Directory.GetFiles(path, "*_SEM.xml");
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
   public System.Int32 getSemId(System.Int32 num)
   {
    try {
    if (files != null && num < files.Length)
      return num;
    else
      return -1;
    }
    catch (Exception err) {return -2;}
   }
   
   public System.String getSemDescr(System.Int32 num)
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
        return getSemFile(num).ToUpper().Replace("_SEM.XML", "");
      }
    }
    catch (Exception err) {return getSemFile(num);}
    finally { 
      if (reader != null) 
        reader.Close();
    }
    return getSemFile(num);
   }
   public System.String getSemFile(System.Int32 num)
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
        <xsl:variable name="semCnt" select="user:getSems($pathQuery)"/>
        <xsl:call-template name="addSem">
           <xsl:with-param name="semNum" select="0"/>
        </xsl:call-template>
    </root>
    </xsl:template>
    <xsl:template name="addSem">
      <xsl:param name="semNum"/>
      <xsl:variable name="semId" select="user:getSemId($semNum)"/>
      <xsl:variable name="semDescr" select="user:getSemDescr($semNum)"/>
      <xsl:variable name="semFile" select="user:getSemFile($semNum)"/>
      <xsl:if test="($semId >= 0)">
      <data >
        <xsl:attribute name="ID"><xsl:value-of select="$semNum"/></xsl:attribute>
        <xsl:attribute name="CODE"><xsl:value-of select="$semFile"/></xsl:attribute>
        <xsl:attribute name="DESCR"><xsl:value-of select="$semFile"/></xsl:attribute>
        <xsl:attribute name="FILE_NAME"><xsl:value-of select="$semFile"/></xsl:attribute>
      </data>
      <xsl:call-template name="addSem">
        <xsl:with-param name="semNum" select="$semNum + 1"/>
      </xsl:call-template>
      </xsl:if>
    </xsl:template>
</xsl:stylesheet>