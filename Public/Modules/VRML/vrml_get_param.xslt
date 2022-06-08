<?xml version="1.0" encoding="utf-8"?>
<!-- Version: 4.3.1.1 -->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
                xmlns:msxsl="urn:schemas-microsoft-com:xslt">

  <xsl:output method="text"  encoding="windows-1251" indent="yes"/>

  <xsl:param name="check_name" select="string('cls_id')"/>
  <xsl:param name="check_value" select="string('C00050')"/>
  <xsl:param name="get_name" select="string('style')"/>
  <xsl:param name="default_check_value" select="DOT_DEFAULT_STYLE"/>

  <xsl:template match="/library_style">
    <xsl:variable name="count" select="count(//@*[name()=$check_name and .=$check_value])"/>
    <xsl:choose>
      <xsl:when test="$count>0">
        <xsl:for-each select="//*">
          <xsl:variable name="root" select="."/>
          <xsl:for-each select="@*">
            <xsl:if test="string(name())=string($check_name) and string(.)=$check_value">
              <xsl:for-each select="$root/@*">
                <xsl:if test="string(name())=string($get_name)">
                  <xsl:value-of select="."/>
                </xsl:if>
              </xsl:for-each>
            </xsl:if>
          </xsl:for-each>
        </xsl:for-each>
      </xsl:when>
      <xsl:otherwise>
        <xsl:for-each select="//*">
          <xsl:variable name="root" select="."/>
          <xsl:for-each select="@*">
            <xsl:if test="string(name())=string($check_name) and string(.)=$default_check_value">
              <xsl:for-each select="$root/@*">
                <xsl:if test="string(name())=string($get_name)">
                  <xsl:value-of select="."/>
                </xsl:if>
              </xsl:for-each>
            </xsl:if>
          </xsl:for-each>
        </xsl:for-each>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
</xsl:stylesheet>
