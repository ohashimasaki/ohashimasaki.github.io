With CreateObject("Scripting.FileSystemObject").openTextFile("Data.vbs", 1)
    ExecuteGlobal .ReadAll
    .Close
End With



'�Í����i�p�X���[�h���Ώ̃L�[�����j
b = GetBytes("Prince - Purple Rain (Official Video) | �v�����X�^�p�[�v���E���C��")
e = EncryptSymmetric(b, "PASSWORD")
t = ToBase64String(e)
msgbox t, vbOKOnly, "�Í����i�p�X���[�h���Ώ̃L�[�����j"

'����
b = DecryptSymmetric(e, "PASSWORD")
t = GetString(b)
msgbox t, vbOKOnly, "�����i�p�X���[�h���Ώ̃L�[�����j"



'�Í����i��Ώ̃L�[�����j
b = GetBytes("Prince - Purple Rain (Official Video) | �v�����X�^�p�[�v���E���C��")
Set key = CreateKey
e = EncryptAsymmetric(b, key("Public"))
t = ToBase64String(e)
msgbox t, vbOKOnly, "�Í����i��Ώ̃L�[�����j"

'����
b = DecryptAsymmetric(e, key("Private"))
t = GetString(b)
msgbox t, vbOKOnly, "�����i�p�X���[�h���Ώ̃L�[�����j"



'�Í����i�n�C�u���b�h�����j
b = GetBytes("Prince - Purple Rain (Official Video) | �v�����X�^�p�[�v���E���C��")
Set e = Encrypt(b)
t = ToBase64String(e("Data"))
msgbox t, vbOKOnly, "�Í����i�n�C�u���b�h�����j"

'����
b = Decrypt(e("Data"), e("Key"), e("IV"))
t = GetString(b)
msgbox t, vbOKOnly, "�����i�n�C�u���b�h�����j"



'----------------------------------------------------------------------------------------------------

'�t�@�C�����o�C�g�z���
b = ReadAllBytes("test.txt")

'Base64��
t = ToBase64String(b)
msgbox t, vbOKOnly, "Base64"

'16�i�\�L��
t = ToHexString(b)
msgbox t, vbOKOnly, "16�i�\�L"

'SHA1�n�b�V����
t = ToHexString(SHA1(b))
msgbox t, vbOKOnly, "SHA1�n�b�V��"

'SHA256�n�b�V����
t = ToHexString(SHA256(b))
msgbox t, vbOKOnly, "SHA256�n�b�V��"

'�ʂ̃t�@�C���ɕۑ�
WriteAllBytes "test2.txt", b


'----------------------------------------------------------------------------------------------------

'�e�L�X�g���o�C�g�z���
b = GetBytes("Prince - Purple Rain (Official Video) | �v�����X�^�p�[�v���E���C��")

'Base64��
t = ToBase64String(b)
msgbox t, vbOKOnly, "Base64"

'16�i�\�L��
t = ToHexString(b)
msgbox t, vbOKOnly, "16�i�\�L"

'SHA1�n�b�V����
t = ToHexString(SHA1(b))
msgbox t, vbOKOnly, "SHA1�n�b�V��"

'SHA256�n�b�V����
t = ToHexString(SHA256(b))
msgbox t, vbOKOnly, "SHA256�n�b�V��"


'----------------------------------------------------------------------------------------------------

msgbox "�����܂�"

















































