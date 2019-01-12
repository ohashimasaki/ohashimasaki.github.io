<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:output method="xml" encoding="UTF-8" indent="yes" />


<xsl:template match="/">
    <xsl:apply-templates select="*" />
</xsl:template>


<xsl:template match="/*">
    <div id="editor">
        <xsl:apply-templates select="*" />
        <textarea id="category"><xsl:value-of select="/*/@category" /></textarea>
    </div>
</xsl:template>


<xsl:template match="/*/h1">
    <section class="title" id="{@id}" tabindex="-1">
        <div class="view" tabindex="0"><xsl:copy-of select="." /></div>
        <textarea class="write"><xsl:apply-templates select="text()|br" /></textarea>
    </section>
</xsl:template>

<xsl:template match="/*/p">
    <section class="paragraph" id="{@id}" tabindex="-1">
        <div class="view" tabindex="0"><xsl:copy-of select="." /></div>
        <textarea class="write"><xsl:apply-templates select="text()|br" /></textarea>
    </section>
</xsl:template>

<xsl:template match="/*/blockquote">
    <section class="quote" id="{@id}" tabindex="-1">
        <div class="view" tabindex="0"><xsl:copy-of select="." /></div>
        <textarea class="write"><xsl:apply-templates select="text()|br" /></textarea>
    </section>
</xsl:template>

<xsl:template match="/*/pre">
    <section class="preformatted" id="{@id}" tabindex="-1">
        <div class="view" tabindex="0"><xsl:copy-of select="." /></div>
        <textarea class="write"><xsl:value-of select="." /></textarea>
    </section>
</xsl:template>


<xsl:template match="/*/div">
    <section class="note" id="{@id}" tabindex="-1">
        <div class="view" tabindex="0"><xsl:copy-of select="." /></div>
        <textarea class="write"><xsl:apply-templates select="small" /></textarea>
    </section>
</xsl:template>

<xsl:template match="small">
    <xsl:apply-templates select="text()|br" />
</xsl:template>


<xsl:template match="/*/ul">
    <section class="list" id="{@id}" tabindex="-1">
        <ul class="view" tabindex="0">
            <xsl:copy-of select="li" />
        </ul>
        <textarea class="write"><xsl:apply-templates select="li" mode="text" /></textarea>
    </section>
</xsl:template>

<xsl:template match="/*/figure[img]">
    <section class="image" id="{@id}" tabindex="-1">
        <xsl:apply-templates select="img" />
        <xsl:apply-templates select="figcaption" />
    </section>
</xsl:template>

<xsl:template match="/*/figure[table]">
    <section class="table" id="{@id}" tabindex="-1">
        <xsl:apply-templates select="table" />
        <xsl:apply-templates select="figcaption" />
    </section>
</xsl:template>




<xsl:template match="li" mode="text"><xsl:apply-templates /><xsl:if test="position()!=last()"><xsl:text>&#xD;&#xA;</xsl:text></xsl:if></xsl:template>

<xsl:template match="li" mode="list">
<li><xsl:apply-templates select="text()|br" /></li>
</xsl:template>


<xsl:template match="/*/figure/figcaption">
    <div class="caption" tabindex="-1">
        <div class="view" tabindex="0"><xsl:copy-of select="." /></div>
        <textarea class="write"><xsl:apply-templates select="text()|br" /></textarea>
    </div>
</xsl:template>

<xsl:template match="/*/figure/img">
    <div class="figure" tabindex="-1">
        <img src="{@src}" onerror="this.className='noimage'" tabindex="0" />
        <button type="button" class="remove-image" tabindex="0"></button>
    </div>
</xsl:template>



<xsl:template match="figure/table">
    <div class="figure" tabindex="-1">
        <table class="view" tabindex="0"><xsl:copy-of select="*" /></table>
        <textarea class="write">
<xsl:apply-templates select="thead/tr" mode="text" />
<xsl:apply-templates select="tbody/tr" mode="text" />
        </textarea>
    </div>
</xsl:template>


<xsl:template match="thead/tr" mode="text">
    <xsl:apply-templates select="th|td" mode="text-thead" /><xsl:text>&#xD;&#xA;</xsl:text>
</xsl:template>
<xsl:template match="tbody/tr" mode="text">
    <xsl:apply-templates select="th|td" mode="text-tbody" /><xsl:text>&#xD;&#xA;</xsl:text>
</xsl:template>

<xsl:template match="th" mode="text-thead"><xsl:apply-templates />:<xsl:text>&#x9;</xsl:text></xsl:template>
<xsl:template match="td" mode="text-thead"><xsl:apply-templates />:<xsl:text>&#x9;</xsl:text></xsl:template>

<xsl:template match="th" mode="text-tbody"><xsl:apply-templates />:<xsl:text>&#x9;</xsl:text></xsl:template>
<xsl:template match="td" mode="text-tbody"><xsl:apply-templates /><xsl:text>&#x9;</xsl:text></xsl:template>


<xsl:template match="text()">
    <xsl:value-of select="translate(., '&#xD;&#xA;', '')" />
</xsl:template>

<xsl:template match="br">
    <xsl:text>&#xD;&#xA;</xsl:text>
</xsl:template>





</xsl:stylesheet>



























