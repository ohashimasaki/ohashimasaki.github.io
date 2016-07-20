Attribute VB_Name = "GEO"
Function DMS2DEC(r As Range, p As Integer)

    t = r.Text

    Set regex = CreateObject("VBscript.RegExp")
    regex.Global = True
    regex.IgnoreCase = True

    regex.Pattern = "\s"
    t = regex.Replace(t, "")

    t = Replace(t, "�O", "0")
    t = Replace(t, "�P", "1")
    t = Replace(t, "�Q", "2")
    t = Replace(t, "�R", "3")
    t = Replace(t, "�S", "4")
    t = Replace(t, "�T", "5")
    t = Replace(t, "�U", "6")
    t = Replace(t, "�V", "7")
    t = Replace(t, "�W", "8")
    t = Replace(t, "�X", "9")

    regex.Pattern = "\u00B0|\u00BA|\u02DA|\u030A|\u2070|\u2218|\u309A|\u309C|\uFF9F"
    t = regex.Replace(t, "��")

    regex.Pattern = "\u2032|\u0027|\u02B9|\u02BC|\u02C8|\u0301|\u2018|\u2019|\u201B|\u2035|\u05F3|\uA78C|\uFF07|\uFF40|\u301D|\u301E|\u3099|\u309B"
    t = regex.Replace(t, "��")

    regex.Pattern = "\u2033|\u0022|\u201C|\u201D|\u201F|\u2036|\u05F4|\u02BA|\u030B|\u030E|\u3003|\uFF02|\uFF9E"
    t = regex.Replace(t, "��")

    regex.Pattern = "^(\d+)\��(?:(\d+)\��(?:(\d+)\��)?)?$"
    Set a = regex.Execute(t)

    d = CInt(a(0).Submatches(0))
    m = CInt(a(0).Submatches(1)) / 60
    s = CInt(a(0).Submatches(2)) / 3600

    If Not IsNumeric(p) Then
        p = 6
    End If

    DMS2DEC = Fix((d + m + s) * (10 ^ p)) / (10 ^ p)

End Function



