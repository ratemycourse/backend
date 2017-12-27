<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" />

  <xsl:template match="departments">
    <body>
      <xsl:apply-templates />
    </body>
  </xsl:template>

  <xsl:template match="department">
    <h3>
      <a>
        <xsl:attribute name="href">
          <xsl:value-of select="./href" />
        </xsl:attribute>
        <xsl:value-of select="./name" />
      </a>
    </h3>
    
  </xsl:template>
</xsl:stylesheet>