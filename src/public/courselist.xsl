<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" />

  <xsl:template match="course">
      <h2>
        <xsl:value-of select="@code"/>&#160;
        <a>
          <xsl:attribute name="href">
             <xsl:value-of select="./href"/>
          </xsl:attribute>
          <xsl:value-of select="./name"/>
        </a>
      </h2>
      <h2>
        <xsl:value-of select="./department" />
      </h2>
      <xsl:apply-templates select="info"/>
  </xsl:template>

  <xsl:template  match="info">
    <div style="width:35em;">
      <xsl:value-of select="current()" disable-output-escaping="yes" />
    </div>
  </xsl:template>

</xsl:stylesheet>