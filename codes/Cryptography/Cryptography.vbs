With CreateObject("Scripting.FileSystemObject").openTextFile("Data.vbs", 1)
    ExecuteGlobal .ReadAll
    .Close
End With



'暗号化（パスワード＝対称キー方式）
b = GetBytes("Prince - Purple Rain (Official Video) | プリンス／パープル・レイン")
e = EncryptSymmetric(b, "PASSWORD")
t = ToBase64String(e)
msgbox t, vbOKOnly, "暗号化（パスワード＝対称キー方式）"

'復号
b = DecryptSymmetric(e, "PASSWORD")
t = GetString(b)
msgbox t, vbOKOnly, "復号（パスワード＝対称キー方式）"



'暗号化（非対称キー方式）
b = GetBytes("Prince - Purple Rain (Official Video) | プリンス／パープル・レイン")
Set key = CreateKey
e = EncryptAsymmetric(b, key("Public"))
t = ToBase64String(e)
msgbox t, vbOKOnly, "暗号化（非対称キー方式）"

'復号
b = DecryptAsymmetric(e, key("Private"))
t = GetString(b)
msgbox t, vbOKOnly, "復号（パスワード＝対称キー方式）"



'暗号化（ハイブリッド方式）
b = GetBytes("Prince - Purple Rain (Official Video) | プリンス／パープル・レイン")
Set e = Encrypt(b)
t = ToBase64String(e("Data"))
msgbox t, vbOKOnly, "暗号化（ハイブリッド方式）"

'復号
b = Decrypt(e("Data"), e("Key"), e("IV"))
t = GetString(b)
msgbox t, vbOKOnly, "復号（ハイブリッド方式）"



'----------------------------------------------------------------------------------------------------

'ファイルをバイト配列に
b = ReadAllBytes("test.txt")

'Base64に
t = ToBase64String(b)
msgbox t, vbOKOnly, "Base64"

'16進表記に
t = ToHexString(b)
msgbox t, vbOKOnly, "16進表記"

'SHA1ハッシュに
t = ToHexString(SHA1(b))
msgbox t, vbOKOnly, "SHA1ハッシュ"

'SHA256ハッシュに
t = ToHexString(SHA256(b))
msgbox t, vbOKOnly, "SHA256ハッシュ"

'別のファイルに保存
WriteAllBytes "test2.txt", b


'----------------------------------------------------------------------------------------------------

'テキストをバイト配列に
b = GetBytes("Prince - Purple Rain (Official Video) | プリンス／パープル・レイン")

'Base64に
t = ToBase64String(b)
msgbox t, vbOKOnly, "Base64"

'16進表記に
t = ToHexString(b)
msgbox t, vbOKOnly, "16進表記"

'SHA1ハッシュに
t = ToHexString(SHA1(b))
msgbox t, vbOKOnly, "SHA1ハッシュ"

'SHA256ハッシュに
t = ToHexString(SHA256(b))
msgbox t, vbOKOnly, "SHA256ハッシュ"


'----------------------------------------------------------------------------------------------------

msgbox "おしまい"

















































