<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" />

  <xsl:template match="course">
    <div class="bg-white p-4 m-4 rounded">
    	<h1 class="bg-primary rounded p-3 m-2 text-white d-flex align-items-center flex-wrap">
        <div class="courseName font-weight-bold float-left " >
	  		 <xsl:value-of select="./code" /> &#160;
        </div>
        <div class="">
          <xsl:value-of select="./name" />&#160;
        </div>
        <div className="avgRating"><xsl:value-of select="./score"/></div>
        <div class="d-flex ml-auto">
          <a class="btn btn-tetriary text-white font-weight-bold m-1">
            <xsl:attribute name="href">
              <xsl:value-of select="./href"/>
            </xsl:attribute>
            Kurshemsida
          </a>
          <a class="btn btn-tetriary text-white font-weight-bold m-1">
            <xsl:attribute name="href">
              <xsl:value-of select="./courseWebUrl"/>
            </xsl:attribute>
            Kurswebb
          </a>
      </div>
     	</h1>
     	<div class="d-block bg-light rounded p-3 m-2">
        <h3 class="font-weight-bold">INFO</h3>
      	<xsl:value-of select="./info" disable-output-escaping="yes" />
     	</div>
      <div class="d-flex flex-wrap p-3 align-items-center">
        <h4 class="rounded pt-1">Your rating:</h4>
        <div class="userRating">User rating didn't load...</div>
        <div class="submitButton ml-auto">Submit button didnt load...</div>
      </div>
    </div>
  </xsl:template>
</xsl:stylesheet>