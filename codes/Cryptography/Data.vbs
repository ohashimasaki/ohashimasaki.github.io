'----------------------------------------------------------------------------------------------------
Function ToBase64String(bytes)

    If IsNull(bytes) Then
        ToBase64String = ""
        Exit Function
    End If

    Dim xml, e
    Set xml = CreateObject("MSXML2.DOMDocument.6.0")
    Set e = xml.createElement("data")
    e.DataType = "bin.base64"
    e.nodeTypedValue = bytes
    ToBase64String = Trim(e.Text)

End Function
'----------------------------------------------------------------------------------------------------
Function FromBase64String(t)

    Dim xml, e
    Set xml = CreateObject("MSXML2.DOMDocument.6.0")
    Set e = xml.createElement("data")
    e.DataType = "bin.base64"
    e.Text = Trim(t)
    FromBase64String = e.nodeTypedValue

End Function
'----------------------------------------------------------------------------------------------------
Function ToHexString(bytes)

    If IsNull(bytes) Then
        ToHexString = ""
        Exit Function
    End If

    Dim xml, e
    Set xml = CreateObject("MSXML2.DOMDocument.6.0")
    Set e = xml.createElement("data")
    e.DataType = "bin.hex"
    e.nodeTypedValue = bytes
    ToHexString = LCase(Trim(e.Text))

End Function
'----------------------------------------------------------------------------------------------------
Function FromHexString(t)

    Dim xml, e
    Set xml = CreateObject("MSXML2.DOMDocument.6.0")
    Set e = xml.createElement("data")
    e.DataType = "bin.hex"
    e.Text = Trim(t)
    FromHexString = e.nodeTypedValue

End Function
'----------------------------------------------------------------------------------------------------
Function ReadAllBytes(path)

    Set stream = CreateObject("ADODB.Stream")
    stream.Type = 1
    stream.Open
    stream.LoadFromFile path
    ReadAllBytes = stream.Read

End Function
'----------------------------------------------------------------------------------------------------
Function WriteAllBytes(path, bytes)

    If IsNull(bytes) Then
        Set fso = CreateObject("Scripting.FileSystemObject")
        With fso.CreateTextFile(path, 2, True)
            .Close
        End With
        Exit Function
    End If

    Set stream = CreateObject("ADODB.Stream")
    stream.Type = 1
    stream.Open
    stream.Write bytes
    stream.SaveToFile path, 2

End Function
'----------------------------------------------------------------------------------------------------
Function GetByteCount(t)

    GetByteCount = CreateObject("System.Text.UTF8Encoding").GetByteCount_2(t)

End Function
'----------------------------------------------------------------------------------------------------
Function GetBytes(t)

    GetBytes = CreateObject("System.Text.UTF8Encoding").GetBytes_4(t)

End Function
'----------------------------------------------------------------------------------------------------
Function GetString(bytes)

    GetString = CreateObject("System.Text.UTF8Encoding").GetString((bytes))

End Function
'----------------------------------------------------------------------------------------------------
Function SHA1(bytes)

    SHA1 = CreateObject("System.Security.Cryptography.SHA1CryptoServiceProvider").ComputeHash_2((bytes))

End Function
'----------------------------------------------------------------------------------------------------
Function SHA256(bytes)

    SHA256 = CreateObject("System.Security.Cryptography.SHA256Managed").ComputeHash_2((bytes))

End Function
'----------------------------------------------------------------------------------------------------
Function SHA512(bytes)

    SHA512 = CreateObject("System.Security.Cryptography.SHA512Managed").ComputeHash_2((bytes))

End Function
'----------------------------------------------------------------------------------------------------
Function EncryptAsymmetric(bytes, key)

    Set rsa = CreateObject("System.Security.Cryptography.RSACryptoServiceProvider")
    rsa.PersistKeyInCsp = False
    rsa.FromXmlString key
    e = rsa.Encrypt((bytes), True)
    rsa.Clear
    EncryptAsymmetric = e

End Function
'----------------------------------------------------------------------------------------------------
Function DecryptAsymmetric(bytes, key)

    Set rsa = CreateObject("System.Security.Cryptography.RSACryptoServiceProvider")
    rsa.PersistKeyInCsp = False
    rsa.FromXmlString key
    e = rsa.Decrypt((bytes), True)
    rsa.Clear
    DecryptAsymmetric = e

End Function
'----------------------------------------------------------------------------------------------------
Function EncryptSymmetric(bytes, password)

    key = SHA256(GetBytes(password)) '256bits = 32Bytes
    Set a = CreateObject("System.Security.Cryptography.RijndaelManaged")
    a.KeySize = 256  '256bits = 32Bytes
    a.BlockSize = 128  '128bits = 16Bytes
    a.Key = key
    a.GenerateIV
    e = a.CreateEncryptor.TransformFinalBlock((bytes), 0, Count(bytes))
    data = FromHexString(ToHexString(a.IV) + ToHexString(e))
    a.Clear
    EncryptSymmetric = data

End Function
'----------------------------------------------------------------------------------------------------
Function DecryptSymmetric(bytes, password)

    key = SHA256(GetBytes(password))  '256bits = 32Bytes
    Set a = CreateObject("System.Security.Cryptography.RijndaelManaged")
    a.KeySize = 256  '256bits = 32Bytes
    a.BlockSize = 128  '128bits = 16Bytes
    a.Key = key
    h = ToHexString(bytes)
    iv = FromHexString(Mid(h, 1, 32))
    b = FromHexString(Mid(h, 33))
    a.IV = iv
    e = a.CreateDecryptor.TransformFinalBlock((b), 0, Count(b))
    a.Clear
    DecryptSymmetric = e

End Function
'----------------------------------------------------------------------------------------------------
Function Encrypt(bytes)

    Dim a, Data

    Set a = CreateObject("System.Security.Cryptography.RijndaelManaged")
    a.KeySize = 256
    a.BlockSize = 128
    a.GenerateKey
    a.GenerateIV

    Set e = CreateObject("Scripting.Dictionary")
    e.Add "Key", a.Key
    e.Add "IV", a.IV
    e.Add "Data", a.CreateEncryptor.TransformFinalBlock((bytes), 0, Count(bytes))
    a.Clear

    Set Encrypt = e

End Function
'----------------------------------------------------------------------------------------------------
Function Decrypt(bytes, key, iv)

    Set a = CreateObject("System.Security.Cryptography.RijndaelManaged")
    a.KeySize = 256
    a.BlockSize = 128
    a.Key = key
    a.IV = iv
    e = a.CreateDecryptor.TransformFinalBlock((bytes), 0, Count(bytes))
    a.Clear
    Decrypt = e

End Function
'----------------------------------------------------------------------------------------------------
Function Unzip(path)

    Set fso = CreateObject("Scripting.FileSystemObject")
    path = fso.GetAbsolutePathName(path)

    If LCase(fso.GetExtensionName(path)) <> "zip" Then
        Unzip = Null
        Exit Function
    End If

    Set sh = CreateObject("Shell.Application")
    Set entries = sh.NameSpace(path).items

    folder = fso.GetParentFolderName(path)
    name = fso.GetBaseName(path)

    If entries.Count = 1 Then
        sh.NameSpace(folder).CopyHere entries, 20
    Else
        folder = folder & "\" & name
        If fso.FolderExists(folder) = False Then
            fso.CreateFolder folder
        End If
        sh.NameSpace(folder).CopyHere entries, 20
    End If

    Unzip = folder


End Function
'----------------------------------------------------------------------------------------------------
Function CreateKey()

    Set rsa = CreateObject("System.Security.Cryptography.RSACryptoServiceProvider")
    rsa.PersistKeyInCsp = False
    Set Key = CreateObject("Scripting.Dictionary")
    key.Add "Private", rsa.ToXmlString(true)
    key.Add "Public", rsa.ToXmlString(false)
    rsa.Clear
    Set CreateKey = key

End Function
'----------------------------------------------------------------------------------------------------
Function GetKey(path)

    Dim xml
    Set xml = CreateObject("MSXML2.DOMDocument.6.0")
    If xml.Load(path) Then
        GetKey = xml.xml
    Else
        GetKey = Null
    End If

End Function
'----------------------------------------------------------------------------------------------------
Function Count(bytes)

    Count = Len(ToHexString(bytes)) / 2

End Function
'----------------------------------------------------------------------------------------------------
Function GetGuid()

    GetGuid = LCase(Replace(Mid(CreateObject("Scriptlet.TypeLib").Guid, 2, 36), "-", ""))

End Function
'----------------------------------------------------------------------------------------------------
Function GetTimestamp()

    dt = Now
    t = Year(dt)
    t = t & "-" & Right("00" & Month(dt), 2)
    t = t & "-" & Right("00" & Day(dt), 2)
    t = t & "T" & Right("00" & Hour(dt), 2)
    t = t & ":" & Right("00" & Minute(dt), 2)
    t = t & ":" & Right("00" & Second(dt), 2)
    GetDate = t

End Function
'----------------------------------------------------------------------------------------------------

