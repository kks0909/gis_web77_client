<?xml version="1.0" encoding="utf-8"?>
<!-- 7.7.3.0 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl grids columns" xmlns:grids="ru.corelight.grids.*" xmlns:columns="ru.corelight.grids.columns.*">
    <xsl:output method="xml" indent="yes"/>

    <xsl:template match="/">
        <root>
            <xsl:attribute name="dataProvider"><xsl:value-of select="//grids:Grid/@dataRequest"/></xsl:attribute>
            <xsl:apply-templates select="@* | node()"/>
        </root>
    </xsl:template>
  <xsl:template match="columns:GridColumn[@filterComparisionType='array']">
    <xsl:if test="@dataField!='LINE_ID'">
    <link>
      <xsl:attribute name="name"><xsl:value-of select="@headerText"/></xsl:attribute>
      <xsl:attribute name="dataProvider"><xsl:value-of select="@filterRequestId"/></xsl:attribute>
      <xsl:attribute name="dataField"><xsl:value-of select="@dataField"/></xsl:attribute>
      <xsl:if test="@dataField='ILI_INSPECTION_ID'">
        <xsl:attribute name="limit">10</xsl:attribute>
      </xsl:if>
      <xsl:if test="@dataField='PI_CP_EVENT_ID'">
        <xsl:attribute name="limit">10</xsl:attribute>
      </xsl:if>
	<xsl:if test="@dataField='ID'">
		<xsl:attribute name="limit">10</xsl:attribute>
	</xsl:if>
    </link>
      </xsl:if>
  </xsl:template>
  <xsl:template match="columns:GridColumn[@filterComparisionType='string']">
    <xsl:call-template name="scalar_prop"/>
  </xsl:template>
  <xsl:template match="columns:GridColumn[@filterComparisionType='number']">
    <xsl:call-template name="scalar_prop"/>
  </xsl:template>
  <!-- фильтр с датой вообще пока не показываем, они у нас плохо работают -->
  
  <xsl:template name="scalar_prop">
    <property>
      <xsl:attribute name="name"><xsl:value-of select="@headerText"/></xsl:attribute>
      <xsl:attribute name="dataField"><xsl:value-of select="@dataField"/></xsl:attribute>
      <xsl:attribute name="type"><xsl:value-of select="@filterComparisionType"/></xsl:attribute>
    </property>
  </xsl:template>
</xsl:stylesheet>
