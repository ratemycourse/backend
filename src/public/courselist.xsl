<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" />

  <xsl:template match="courses">
    <div class="row p-2 m-0">
      <xsl:apply-templates />
    </div>
  </xsl:template>

  <xsl:template match="course">
    <a class="coursecard" style="text-decoration: none;">
      <xsl:attribute name="href">
        <xsl:value-of select="./href"/>
      </xsl:attribute>
      <div class="coursecard card m-2 p-2">
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
                <xsl:value-of select="./rating"/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a>
  </xsl:template>

</xsl:stylesheet>