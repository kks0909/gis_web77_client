<?xml version="1.0" encoding="utf-8"?>
<!-- Version: 4.3.1.1 -->

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt" xmlns:user="urn:my-scripts">
  <!--msxsl:script language="C#" implements-prefix="user">
    <![CDATA[
    public System.String replace(System.String inStr, System.String name, System.String value){
      if (inStr.Contains(name))      return inStr.Replace(name,value);
      else                           return inStr;
    }

    public Double RoundCoord(Double val)
    {
      return System.Math.Round(val,6);
    }
    
    public System.String ReEncodeText(System.Text.Encoding fromEncoding, System.Text.Encoding toEncoding, string text)
    {
            return fromEncoding.GetString(System.Text.Encoding.Convert(fromEncoding, toEncoding, fromEncoding.GetBytes(text)));
    }
    
    public System.String ReEncode(System.String text)
    {
      return    ReEncodeText(Encoding.GetEncoding("windows-1251"),Encoding.UTF8,text);

    }
    
    public System.String make_text_sign(double num, System.String text)
    {
      System.String outStr = new System.Text.StringBuilder("").ToString();
      outStr += "\n  Shape \n{ \nappearance Appearance\n{\n	material Material \n{\n	diffuseColor 1 1 1\n}\n}\n geometry Extrusion  \n{\n crossSection	[";
     
     double x,y,z;
     num=num;
     if(num>4)  num=num/5;
     else 
     if(num==1) num= num/2;
     else     num = num/3;
     x = num* 0.5; //sin(30)
     y = num;
     z = num * 0.866025;//sin(60)
     
     System.String text_utf=text;
     //text.
     
   //  byte[] arr;
     ///arr = System.Text.Encoding.GetEncoding("UTF-8").GetBytes(text);
     text_utf = ReEncodeText(Encoding.GetEncoding("windows-1251"),Encoding.UTF8,text);
     
     //Byte arr  = new System.Text.Encoding.GetEncoding("UTF-8").GetBytes(text);
     //System.String text_utf = new System.String(SupportClass.ToCharArray(SupportClass.ToByteArray(SupportClass.ToSByteArray(System.Text.Encoding.GetEncoding("UTF-8").GetBytes(text)))));
     
     outStr += "-"+System.Convert.ToString(x)+" -"+System.Convert.ToString(z)+", "+System.Convert.ToString(num)+" 0, -"+System.Convert.ToString(x)+" "+System.Convert.ToString(z)+" ,-"+System.Convert.ToString(x)+" -"+System.Convert.ToString(z)+" ]\nspine [0 0 0, 0 "+System.Convert.ToString(y)+" 0] \nscale [ 1 1, .001 .001]\nbeginCap TRUE\n	endCap  TRUE \n	solid	FALSE\n	}	}  \n";
              
     outStr +="	Transform \n{\ntranslation  -"+System.Convert.ToString(x)+" 0.05 -"+System.Convert.ToString(z)+"  rotation 0 1 0 4.712388 \n children\n	[\n	Transform \n{ \n	rotation 1 0 0 -0.45 \n	children	\n[\n	Shape \n{ \nappearance Appearance \n{\n	material Material \n{\n	diffuseColor 1 0 0\n}	\n}\n	geometry Text  { string \" "+text_utf+"\" fontStyle USE BASE }\n}\n]\n	}\n]\n}\n";
     outStr +="	Transform \n{\ntranslation  -"+System.Convert.ToString(x)+" 0.05 "+System.Convert.ToString(z)+"  rotation 0 1 0 0.5235 \n children\n	[\n	Transform \n{ \n	rotation 1 0 0 -0.45 \n	children	\n[\n	Shape \n{ \nappearance Appearance \n{\n	material Material \n{\n	diffuseColor 1 0 0\n}	\n}\n	geometry Text  { string \" "+text_utf+"\" fontStyle USE BASE }\n}\n]\n	}\n]\n}\n";
     outStr +="	Transform \n{\ntranslation   "+System.Convert.ToString(y)+" 0.05 0  rotation 0 1 0 2.617895 \n children\n	[\n	Transform \n{ \n	rotation 1 0 0 -0.45 \n	children	\n[\n	Shape \n{ \nappearance Appearance \n{\n	material Material \n{\n	diffuseColor 1 0 0\n}	\n}\n	geometry Text  { string \" "+text_utf+"\" fontStyle USE BASE }\n}\n]\n	}\n]}";
    return outStr;
   }

]]>
  </msxsl:script-->
  <msxsl:script language="JavaScript" implements-prefix="user">
    <![CDATA[
    function replace(inStr,  name,  value){
      var res = inStr;
      while (res.indexOf(name) > 0)
      {
        res = res.replace(name, value);
      }
      return res;
    }
    

    function RoundCoord( val)
    {
      return val;
      /*return Math.round(val*1000000)/1000000;  */
    }
    
    function ReEncodeText( fromEncoding,  toEncoding,  text)
    {
      return text;
    }
    
    function ReEncode( text)
    {
         return text;
    }
    
    function make_text_sign( num,  text)
    {
      var outStr;
      outStr = "\n  Shape \n{ \nappearance Appearance\n{\n	material Material \n{\n	diffuseColor 1 1 1\n}\n}\n geometry Extrusion  \n{\n crossSection	[";
     
     var x,y,z;
  

     if(num>4)  num=num/5.;
     else 
     if(num==1) num= num/2.;
     else     num = num/3.;
     x = num* 0.5; //sin(30)
     y = num;
     z = num * 0.866025;//sin(60)
     
     var text_utf=text;
     //text_utf = ReEncodeText(Encoding.GetEncoding("windows-1251"),Encoding.UTF8,text);
 
     
     outStr = outStr + "-"+x+" -"+z+", "+num+" 0, -"+x+" "+z+" ,-"+x+" -"+z+" ]\nspine [0 0 0, 0 "+y+" 0] \nscale [ 1 1, .001 .001]\nbeginCap TRUE\n	endCap  TRUE \n	solid	FALSE\n	}	}  \n";
              
     outStr = outStr +"	Transform \n{\ntranslation  -"+x+" 0.05 -"+z+"  rotation 0 1 0 4.712388 \n children\n	[\n	Transform \n{ \n	rotation 1 0 0 -0.45 \n	children	\n[\n	Shape \n{ \nappearance Appearance \n{\n	material Material \n{\n	diffuseColor 1 0 0\n}	\n}\n	geometry Text  { string \" "+text_utf+"\" fontStyle USE BASE }\n}\n]\n	}\n]\n}\n";
     outStr = outStr +"	Transform \n{\ntranslation  -"+x+" 0.05 "+z+"  rotation 0 1 0 0.5235 \n children\n	[\n	Transform \n{ \n	rotation 1 0 0 -0.45 \n	children	\n[\n	Shape \n{ \nappearance Appearance \n{\n	material Material \n{\n	diffuseColor 1 0 0\n}	\n}\n	geometry Text  { string \" "+text_utf+"\" fontStyle USE BASE }\n}\n]\n	}\n]\n}\n";
     outStr = outStr +"	Transform \n{\ntranslation   "+y+" 0.05 0  rotation 0 1 0 2.617895 \n children\n	[\n	Transform \n{ \n	rotation 1 0 0 -0.45 \n	children	\n[\n	Shape \n{ \nappearance Appearance \n{\n	material Material \n{\n	diffuseColor 1 0 0\n}	\n}\n	geometry Text  { string \" "+text_utf+"\" fontStyle USE BASE }\n}\n]\n	}\n]}";
     return outStr;
   }

]]>
  </msxsl:script>
  
  <!--xsl:output method="text"  encoding="windows-1251" indent="yes"/-->
  <xsl:output method="text"  encoding="utf-8" indent="yes"/>
  <xsl:param name="style"/>
  <xsl:param name="layer_name"/>
  <xsl:param name="descr_name"/>
  <xsl:param name="viewpoint"/>
  <xsl:param name="table"/>
  <xsl:param name="id_name"/>
  <xsl:param name="radius_pipeline"/>

  <xsl:template match="/PIKETS">
    <xsl:if test="$viewpoint = 1" xml:space="preserve">
    <xsl:for-each select="PIKET">
      GeoViewpoint { geoOrigin USE ORIGIN
            geoSystem ["GDC"]
            fieldOfView     0.785398
            jump    TRUE
            orientation   0 0 1 0
            position    " <xsl:value-of select="@geoX - 0.0002"/><xsl:value-of select="string(' ')"/><xsl:value-of select="@geoY"/><xsl:value-of select="string(' ')"/><xsl:value-of select="@geoZ"/>"
            description    "<xsl:value-of select="user:ReEncode(string(@FACILITY_CLS_DESCR))"/>: <xsl:value-of select="user:ReEncode(string(@DESCR))"/>"
            }
            </xsl:for-each>
          </xsl:if>
 
      Group
      {
      children
      [
      GeoMetadata
      {
      summary [ "#layer_group", "<xsl:value-of select="user:ReEncode($layer_name)"/>","#layer_name","<xsl:value-of select="user:ReEncode(string($table))"/>" ]
    }

    <xsl:for-each select="PIKET">
      Group
      {
        children
        [
          
          GeoMetadata
          {
            summary ["table" "<xsl:value-of select="user:ReEncode(string($table))"/>" , "field" "<xsl:value-of select="user:ReEncode($id_name)"/>", "title" "<xsl:value-of select="user:ReEncode(string(@DESCR))"/>", "id" "<xsl:value-of select="user:ReEncode(string(@ID))"/>", "class" "<xsl:value-of select="user:ReEncode(string(@FACILITY_CLS_DESCR))"/>"]
          }
      GeoLocation { geoOrigin USE ORIGIN
      geoCoords  " <xsl:value-of select="@geoX"/><xsl:value-of select="string(' ')"/><xsl:value-of select="@geoY"/><xsl:value-of select="string(' ')"/><xsl:value-of select="@geoZ"/> "
      children [         
          <xsl:variable name="after_radius" select="user:replace($style,'$RADIUS$',string(user:RoundCoord(@RADIUS)))"/>
          <xsl:variable name="after_radius2" select="user:replace($after_radius,'$RADIUS_2$',string(user:RoundCoord(@RADIUS*2)))"/>
          <xsl:variable name="after_radius3" select="user:replace($after_radius2,'$RADIUS_3$',string(user:RoundCoord(@RADIUS*3)))"/>
          <xsl:variable name="after_radius4" select="user:replace($after_radius3,'$RADIUS_4$',string(user:RoundCoord(@RADIUS*4)))"/>
          <xsl:variable name="after_radius5" select="user:replace($after_radius4,'$RADIUS_5$',string(user:RoundCoord(@RADIUS*5)))"/>
          <xsl:variable name="after_radius6" select="user:replace($after_radius5,'$RADIUS_6$',string(user:RoundCoord(@RADIUS*6)))"/>
          <xsl:variable name="after_radius7" select="user:replace($after_radius6,'$RADIUS_7$',string(user:RoundCoord(@RADIUS*7)))"/>
          <xsl:variable name="after_radius_1_15" select="user:replace($after_radius7,'$RADIUS_1_15$',string(user:RoundCoord(@RADIUS*1.15)))"/>
          <xsl:variable name="after_radius_0_8" select="user:replace($after_radius_1_15,'$RADIUS_0_8$',string(user:RoundCoord(@RADIUS*0.8)))"/>
          <xsl:variable name="after_radius_2_1" select="user:replace($after_radius_0_8,'$RADIUS_2_1$',string(user:RoundCoord(@RADIUS*2.1)))"/>
          <xsl:variable name="descr_value" select="@*[name() = $descr_name]"/>
      <!--xsl:variable name="text_sign"  select="user:make_text_sign(string-length(@KM_NUMBER),@RADIUS*5,string(@KM_NUMBER))"/-->
          <!--xsl:variable name="text_sign"  select="user:make_text_sign(number(string-length(@DESCR)),string(@DESCR))"/-->
          <xsl:variable name="text_sign"  select="user:make_text_sign(number(string-length($descr_value)),string($descr_value))"/>
      <!--xsl:value-of select="$text_sign"/-->
          <xsl:variable name="after_descr" select="user:replace($after_radius_2_1,'$TEXT_SIGN$',string($text_sign))"/>
          <xsl:variable name="after_color" select="user:replace($after_descr,'$COLOR_RGB$',string(@COLOR_RGB))"/>
          <xsl:value-of select="$after_color"/>

      ]#children
      }#GeoLocation
      ]#children
      }#group
    </xsl:for-each>
      ]}
    </xsl:template>
</xsl:stylesheet>
