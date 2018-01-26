<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml">
  <xsl:output method="html" />

    <xsl:template match="course">
      <div class="bg-white rounded p-1 mt-5 mr-5 ml-5 mb-2">

      <div class="row p-5">
        <div class="col-lg-8">
          <div class="d-flex flex-wrap w-100">
            <xsl:apply-templates select="code" />
            <xsl:apply-templates select="name" />
          </div>
          <div>
            <h3>INFO:</h3>
            <xsl:apply-templates select="info" />
          </div>
          <div>
            <xsl:apply-templates select="level" />
          </div>
        </div>
        <div class="col align-self-center ml-auto mr-auto mt-3 mb-3">

          <div class="row justify-content-center bg-primary rounded no-gutters m-1">
            <div class="d-flex flex-wrap-reverse justify-content-center align-items-center">
              <div class="avgRating m p-1">
                <xsl:attribute name="score">
                  <xsl:value-of select="./score"/>
                </xsl:attribute>
                Average rating...
              </div>
                <xsl:apply-templates select="score" />
            </div>
          </div>

          <div class="row no-gutters align-items-center justify-content-center">
            <div class="col p-1">
              <div class="d-flex flex-wrap align-items-center p-1">
                Rate this course:
                <div class="userRating m">
                  User rating...
                </div>
              </div>
            </div>
            <div class="col-auto ml-auto p-1">
              <div class="submitButton">
                Submit button...
              </div>
            </div>
          </div>

          <div class="row no-gutters">
            <div class="col p-1">
              <xsl:apply-templates select="href"/>
            </div>
            <div class="col p-1">
              <xsl:apply-templates select="courseWebUrl"/>
            </div>
          </div>
        </div>
      </div>
            <div class="addCommentButton d-flex justify-content-end m-0 pb-1 ml-auto"> 
                Add Comment button....
            </div>
      </div>
      <div class="commentsComponent pl-5 pr-5">Add Comments Component</div>
        <xsl:apply-templates select="comments" />
    </xsl:template>
    
    <xsl:template match="code">
      <h2 class="font-weight-bold mr-2"><xsl:value-of select="current()"/></h2>
    </xsl:template>

    <xsl:template match="name">
      <h2><xsl:value-of select="current()"/></h2>
    </xsl:template>

    <xsl:template match="href">
      <a class="btn btn-sm btn-block btn-secondary" style="flex: auto">
        <xsl:attribute name="href">
          <xsl:value-of select="current()"/>
        </xsl:attribute>
        Course site
      </a>
    </xsl:template>
    
    <xsl:template match="courseWebUrl">
      <a class="btn btn-sm btn-block btn-secondary" style="flex: auto">
        <xsl:attribute name="href">
          <xsl:value-of select="current()"/>
        </xsl:attribute>
        Course web
      </a>
    </xsl:template>

    <xsl:template match="info">
      <blockquote class="blockquote">
        <xsl:value-of select="current()" disable-output-escaping="yes"/>
      </blockquote>
    </xsl:template>

     <xsl:template match="level">
      <xsl:choose>
        <xsl:when test="current() = 'Grundnivå'">
           <div class="text-tetriary font-weight-bold"><xsl:value-of select="current()"/></div>
        </xsl:when>
        <xsl:otherwise>
          <div class="text-danger font-weight-bold"><xsl:value-of select="current()"/></div>
        </xsl:otherwise>
      </xsl:choose>
      
    </xsl:template>

     <xsl:template match="score">
      <xsl:choose>
        <xsl:when test="current() = 'No rating'">
          <h7 class="m-1 text-white"><xsl:value-of select="current()"/></h7>
        </xsl:when>
        <xsl:otherwise>
          <h2 class="m-1 text-white"><xsl:value-of select="current()"/></h2>
        </xsl:otherwise>
      </xsl:choose>
    </xsl:template>

    <xsl:template match="comments">
      <xsl:apply-templates />
    </xsl:template>

    <xsl:template match="comment">
      <xsl:choose>
        <xsl:when test="./commentText">
          <xsl:apply-templates select="commentText" />
        </xsl:when>
      </xsl:choose>
    </xsl:template>

    <xsl:template match="commentText">
      <div class="commentCard bg-white mt-2 mb-2 ml-5 mr-5 rounded">
      <xsl:attribute name="userId">
        <xsl:value-of select="../userID"/>
      </xsl:attribute>
      <xsl:attribute name="commentId">
        <xsl:value-of select="../commentId"/>
      </xsl:attribute>
        <div class="pb-0 pr-5 pl-5 pt-5">
          <div class="col">
            <div class="row">
              <div class="mr-1 font-weight-bold text-secondary"><xsl:value-of select="../userName"/></div>
              commented:
            </div>
            <div class="row p-1">
              <xsl:value-of select="current()" disable-output-escaping="yes"/>
              <div class="font-italic font-weight-bold text-tetriary mt-3 ml-auto">
               <xsl:value-of select="../timeCreated"/>
              </div>
            </div>
          </div>
        </div>
        <div class="editButtons">Edit buttons</div>
      </div>
    </xsl:template>
</xsl:stylesheet>

