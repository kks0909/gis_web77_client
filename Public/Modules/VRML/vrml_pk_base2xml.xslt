<?xml version="1.0" encoding="utf-8"?>
<!-- Version: 4.3.1.1 -->
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt" xmlns:user="urn:my-scripts">
  <msxsl:script language="JavaScript" implements-prefix="user">
    <![CDATA[
      function mi_style2color_rgb(value){
      var result;
      result=" "+(( value >> 16 ) & 255)/255+" "+(( value >> 8 ) & 255)/255+" "+(value  & 255)/255;
      return result; 
    }
/*
	public System.String Geo2Dekart(double x, double y,double z)
		{
			double a1 = 6378137;
			double e1 = 0.00669438;
			double b1 = x * System.Math.PI / 180;
			double l1 = y * System.Math.PI / 180;
			double h1 = z;
			double N1 = a1 / System.Math.Sqrt(1 - e1 * System.Math.Sin(b1) * System.Math.Sin(b1));
			x = (N1 + h1) * System.Math.Cos(b1) * System.Math.Cos(l1);
      y = (N1 + h1) * System.Math.Cos(b1) * System.Math.Sin(l1);
      z = ((1 - e1) * N1 + h1) * System.Math.Sin(b1);
      System.String coord = x+"#"+y+"#"+z;
      return coord;
		}*/
  function Geo2Dekart(x,y,z)
    {
          
	        var a1 = 6378137;
	        var e1 = 0.00669438;
	        ////смотреть здесь возможно перепутаны x и y c b и l
	        var b1 = Number(x) * Math.PI/180.0;
	        var l1 = Number(y) * Math.PI/180.0;
	        var h1 = Number(z);
	        //Параметры эллипсоида WGS
        	var N1 = a1/Math.sqrt(1-e1*Math.sin(b1)*Math.sin(b1));
	       // var dekCoord = new Array();
	        //Геоцентрические прямоугольные координаты в CK-42
	        x = (N1+h1)*Math.cos(b1)*Math.cos(l1);
	        y = (N1+h1)*Math.cos(b1)*Math.sin(l1);
	        z = ((1-e1)*N1+h1)*Math.sin(b1);
	
	      return x+"#"+y+"#"+z;
}
  ]]>
  </msxsl:script>
  <xsl:output method="xml"  encoding="windows-1251" indent="yes"/>
  <xsl:param name="pipeline_file" />
 
  <xsl:template match="/ROOT">
    <PIKETS>
       <xsl:for-each select="ROW">
         <xsl:variable name="ROUTE" select="ROUTE_ID"/>
         <xsl:variable name="diameter" select="document($pipeline_file)/ROOT/ROW[ROUTE_ID = $ROUTE]/DIAMETER"/>
         <PIKET>
           <xsl:attribute name="RADIUS">
             <xsl:choose>
               <xsl:when test="$diameter > 0">
                 <xsl:value-of select="$diameter div 2000"/>
               </xsl:when>
               <xsl:otherwise>
                 <xsl:value-of select="0.2"/>
               </xsl:otherwise>
             </xsl:choose>
           </xsl:attribute>
           <xsl:choose>
             <xsl:when test="$diameter = 0">
               <xsl:variable name="Z" select="LAND_LEVEL + TUBE_HEIGHT"/>
               <xsl:variable name="decart" select="user:Geo2Dekart(Y,X,$Z)"/>
               <xsl:variable name="decX" select="translate(substring-before($decart,'#'),',','.')"/>
               <xsl:variable name="decY" select="translate(substring-before(substring-after($decart,'#'),'#'),',','.')"/>
               <xsl:variable name="decZ" select="translate(substring-after(substring-after($decart,'#'),'#'),',','.')"/>
               <xsl:attribute name="geoX"><xsl:value-of select="Y"/></xsl:attribute>
               <xsl:attribute name="geoY"><xsl:value-of select="X"/></xsl:attribute>
               <xsl:attribute name="geoZ"><xsl:value-of select="$Z"/></xsl:attribute>
               <xsl:attribute name="decX"><xsl:value-of select="$decX"/></xsl:attribute>
               <xsl:attribute name="decY"><xsl:value-of select="$decY"/></xsl:attribute>
               <xsl:attribute name="decZ"><xsl:value-of select="$decZ"/></xsl:attribute>
             </xsl:when>
             <xsl:otherwise>
               <xsl:variable name="RADIUS" select="$diameter div 2000"/>
               <!--xsl:variable name="Z" select="LAND_LEVEL + TUBE_HEIGHT - $RADIUS"/-->
               <xsl:variable name="Z" select="LAND_LEVEL + TUBE_HEIGHT"/>

               <xsl:variable name="decart" select="user:Geo2Dekart(number(Y),number(X),$Z)"/>
               <xsl:variable name="decX" select="translate(substring-before($decart,'#'),',','.')"/>
               <xsl:variable name="decY" select="translate(substring-before(substring-after($decart,'#'),'#'),',','.')"/>
               <xsl:variable name="decZ" select="translate(substring-after(substring-after($decart,'#'),'#'),',','.')"/>
               <xsl:attribute name="geoX"><xsl:value-of select="Y"/></xsl:attribute>
               <xsl:attribute name="geoY"><xsl:value-of select="X"/></xsl:attribute>
               <xsl:attribute name="geoZ"><xsl:value-of select="$Z"/></xsl:attribute>
               <xsl:attribute name="decX"><xsl:value-of select="$decX"/></xsl:attribute>
               <xsl:attribute name="decY"><xsl:value-of select="$decY"/></xsl:attribute>
               <xsl:attribute name="decZ"><xsl:value-of select="$decZ"/></xsl:attribute>
             </xsl:otherwise>
           </xsl:choose>

           <xsl:attribute name="ROUTE_ID"><xsl:value-of select="ROUTE_ID"/></xsl:attribute>
           <xsl:attribute name="OBJ_CLS_ID"><xsl:value-of select="OBJ_CLS_ID"/></xsl:attribute>
           <xsl:attribute name="FACILITY_CLS_DESCR"><xsl:value-of select="FACILITY_CLS_DESCR"/></xsl:attribute>
           <xsl:attribute name="DESCR"><xsl:value-of select="translate(DESCR,'&quot;','')"/></xsl:attribute>
           <xsl:attribute name="LINE_COORD"><xsl:value-of select="LINE_COORD"/></xsl:attribute>
           <xsl:attribute name="KM_NUMBER"><xsl:value-of select="KM_NUMBER"/></xsl:attribute>
           <xsl:attribute name="ID"><xsl:value-of select="FACILITY_ID"/></xsl:attribute>
           <xsl:if test="MI_STYLE">
           <xsl:attribute name="COLOR_RGB">
             <xsl:value-of select="user:mi_style2color_rgb(number(normalize-space(substring-before(substring-after(MI_STYLE,','),','))))"/>
           </xsl:attribute>
           </xsl:if>
           </PIKET>
         </xsl:for-each>
    </PIKETS>
  </xsl:template>
</xsl:stylesheet>
