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
        <div class="avgRating s">
          <xsl:attribute name="score">
            <xsl:value-of select="./score"/>
          </xsl:attribute>
        </div>
      </h1>
      <div class="d-block bg-light rounded p-3 m-2">
        <div class="d-flex align-items-center">
          <h3 class="font-weight-bold m-1">INFO</h3>
          <a class="btn btn-tetriary text-white font-weight-bold m-1 ml-auto">
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
      <div>
        <xsl:apply-templates />
      </div>
     	</div>
      <div class="d-flex align-items-center flex-wrap align-items-center p-2">
        <div class="d-block d-flex text-white bg-primary rounded">
          <div class="userRating l d-flex align-items-center pl-1 pr-1">User rating didn't load...</div>
          <div class="submitButton">Submit button didnt load...</div>
        </div>
      </div>
    </div>
    <apply-templates />
  </xsl:template>
</xsl:stylesheet>