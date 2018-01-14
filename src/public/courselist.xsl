<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" />

  <xsl:template match="courses">
    <div class="row p-2 m-0">
      <xsl:apply-templates />
    </div>
  </xsl:template>

  <xsl:template match="nofound">
    <div class="d-flex align-items-center justify-content-center w-100 h-100">
      <div class="d-block bg-secondary p-4 rounded m-auto text-white font-weight-bold">
        <h2>NO COURSES FOUND!</h2>
      </div>
    </div>
  </xsl:template>

  <xsl:template match="course">
    <div class="courseCard card m-2 p-2">
      <xsl:attribute name="code">
         <xsl:value-of select="@code"/>
      </xsl:attribute>
      <div class="card-title p-2">
        <h2 class="d-flex">
          <div class="code font-weight-bold">
            <xsl:value-of select="@code"/>&#160;
          </div>
          <div class="name">
            <xsl:value-of select="./name"/>
          </div>
        </h2>
      </div>
      <div class="card-body m-0 p-0">
        <div id="starRating">
          <div class="rating float-left">
            error loading rating bar
          </div>
          <div class="avgRatingContainer d-flex float-right d-inline-block bg-tetriary rounded p-2 m-2 text-white">
            AVERAGE RATING: &#160;
            <div class="avgRating font-weight-bold">
              <xsl:value-of select="./score"/>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xsl:template>

</xsl:stylesheet>