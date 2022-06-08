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
   public System.Int32 getMaps(System.String path)
   {
    try {
    files = System.IO.Directory.GetFiles(path, "*_Layers.xml");
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
   public System.Int32 getMapId(System.Int32 num)
   {
    try {
    if (files != null && num < files.Length)
      return num;
    else
      return -1;
    }
    catch (Exception err) {return -2;}
   }
   
   public System.String getMapDescr(System.Int32 num)
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
        return getMapFile(num).Replace("_layers.xml", "");
      }
    }
    catch (Exception err) {return getMapFile(num);}
    finally { 
      if (reader != null) 
        reader.Close();
    }
    return getMapFile(num);
   }
   public System.String getMapFile(System.Int32 num)
   {
    try {
        string s = files[num];
        return s.Substring(basePath.Length+1);
    }
    catch (Exception err) {return err.ToString();}
   }
   
   
   public System.String getFilter(System.String curFilter)
   {
    try {
        return curFilter;
    }
    catch (Exception err) {return err.ToString();}
   }
   
   /* Проверка, находится ли переданное значение в переменной FILTER */
   public System.Boolean isValueInFilter(System.String attrName, System.String attrValue, System.String curFilter)
   {
    try {
        //Парсим фильтр - если он вида 1=1 или 8=8, значит сразу возвращаем true (значение в списке)
        if (curFilter.Length == 3 && curFilter.IndexOf("=") == 1) return true;
        //Иначе проверяем все условия AND фильтра
        string[] filterConditions = curFilter.Split(new string[] {" AND "}, StringSplitOptions.None);
        foreach (string curCondition in filterConditions)
        {
            //Если условие идет через LIKE, парсим строку вида "UPPER(DESCRIPTION) LIKE UPPER('%ADM_Layers.xml%')"
            if (curCondition.IndexOf(" LIKE ") > 0)
            {
              string[] leftLikeCond = curCondition.Split(new string[] {" LIKE "}, StringSplitOptions.None);
              //Если условие в фильтре есть, но значение не совпадает - не включаем в выборку
              if (leftLikeCond.Length==2 && leftLikeCond[0].IndexOf(attrName)==6 && leftLikeCond[1].IndexOf(attrValue)!=8) {
                  return false;
              }
            } else {
              //Здесь парсим конкретное условие (может быть =,>,<,>=,<=,!=)
              string[] filterValues = curCondition.Split(new string[] {"="}, StringSplitOptions.None);
              //Если условие в фильтре есть, но значение не совпадает - не включаем в выборку
              if (filterValues.Length==2 && filterValues[0]==attrName && filterValues[1]!=attrValue) {
                  return false;
              }
            }
        }
        //Если все условия прошли успешно - включаем в выборку
        return true;
    }
    catch (Exception err) {return false;}
   }
   
    ]]>
  </msxsl:script>

    <xsl:template match="@* | node()">
      <root>
        <xsl:variable name="pathQuery" select="//appSettings/add[@key='Query_Path']/@value"/>
        <xsl:variable name="mapCnt" select="user:getMaps($pathQuery)"/>
        <xsl:call-template name="addMap">
           <xsl:with-param name="mapNum" select="0"/>
        </xsl:call-template>
    </root>
    </xsl:template>
    <xsl:template name="addMap">
      <xsl:param name="mapNum"/>
      <xsl:variable name="mapId" select="user:getMapId($mapNum)"/>
      <xsl:variable name="mapDescr" select="user:getMapDescr($mapNum)"/>
      <xsl:variable name="mapFile" select="user:getMapFile($mapNum)"/>
      <xsl:if test="(($mapId >= 0) and (user:isValueInFilter('MAP_ID',$mapNum,$FILTER)) and (user:isValueInFilter('DESCRIPTION',$mapDescr,$FILTER)))">
      <data PROVIDER="Неизвестно" CTIME="26.05.2010 14:25:49" MTIME="26.05.2010 14:25:49">
        <xsl:attribute name="ID"><xsl:value-of select="$mapNum"/></xsl:attribute>
        <xsl:attribute name="MAP_ID"><xsl:value-of select="$mapNum"/></xsl:attribute>
        <xsl:attribute name="DESCRIPTION"><xsl:value-of select="$mapDescr"/></xsl:attribute>
        <xsl:attribute name="LAYERS_FILE_NAME"><xsl:value-of select="$mapFile"/></xsl:attribute>
        <!--<xsl:attribute name="CUR_FILTER"><xsl:value-of select="user:getFilter($FILTER)"/></xsl:attribute>-->
      </data>
      <xsl:call-template name="addMap">
        <xsl:with-param name="mapNum" select="$mapNum + 1"/>
      </xsl:call-template>
      </xsl:if>
    </xsl:template>
</xsl:stylesheet>