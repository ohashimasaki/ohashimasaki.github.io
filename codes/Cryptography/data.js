//----------------------------------------------------------------------------------------------------
var Convert = {

    ToBase64String: function(bytes) {
        if(bytes == null) {
            return "";
        }
        var xml = new ActiveXObject("MSXML2.DOMDocument.6.0");
        var e = xml.createElement("data");
        e.dataType = "bin.base64";
        e.nodeTypedValue = bytes;
        return trim(e.text);
    },
    FromBase64String: function(t) {
        var xml = new ActiveXObject("MSXML2.DOMDocument.6.0");
        var e = xml.createElement("data");
        e.dataType = "bin.base64";
        e.text = trim(t);
        return e.nodeTypedValue;
    },
    ToHexString: function(bytes) {
        if(bytes == null) {
            return "";
        }
        var xml = new ActiveXObject("MSXML2.DOMDocument.6.0");
        var e = xml.createElement("data");
        e.dataType = "bin.hex";
        e.nodeTypedValue = bytes;
        return trim(e.text).toLowerCase();
    },
    FromHexString: function(t) {
        var xml = new ActiveXObject("MSXML2.DOMDocument.6.0");
        var e = xml.createElement("data");
        e.dataType = "bin.hex";
        e.text = trim(t);
        return e.nodeTypedValue;
    }

};
//----------------------------------------------------------------------------------------------------
var File = {

    ReadAllBytes: function(path) {
        var stream = new ActiveXObject("ADODB.Stream");
        stream.Type = 1;
        stream.Open();
        stream.LoadFromFile(path);
        return stream.Read();
    },
    WriteAllBytes: function(path, bytes) {
        if(bytes == null) {
            var fso = new ActiveXObject("Scripting.FileSystemObject");
            var f = fso.CreateTextFile(path, 2, true);
            f.Close();
            return;
        }
        var stream = new ActiveXObject("ADODB.Stream");
        stream.Type = 1;
        stream.Open();
        stream.Write(bytes);
        stream.SaveToFile(path, 2);
    }

};
//----------------------------------------------------------------------------------------------------
var Encoding = {

    //adTypeText = 2
    //adTypeBinary = 1

    GetByteCount: function(t) {
        var utf8 = new ActiveXObject("System.Text.UTF8Encoding");
        return utf8.GetByteCount_2(t);
    },
    GetBytes: function(t) {
        var utf8 = new ActiveXObject("System.Text.UTF8Encoding");
        return utf8.GetBytes_4(t);
    },
    GetString: function(bytes) {
        var utf8 = new ActiveXObject("System.Text.UTF8Encoding");
        return utf8.GetString((bytes));
    }

};
//----------------------------------------------------------------------------------------------------
var Cryptography = {

    SHA1: function(bytes) {
        var crypto = new ActiveXObject("System.Security.Cryptography.SHA1CryptoServiceProvider");
        return crypto.ComputeHash_2((bytes));
    },
    SHA256: function(bytes) {
        var crypto = new ActiveXObject("System.Security.Cryptography.SHA256Managed");
        return crypto.ComputeHash_2((bytes));
    },
    SHA512: function(bytes) {
        var crypto = new ActiveXObject("System.Security.Cryptography.SHA512Managed");
        return crypto.ComputeHash_2((bytes));
    },
    Asymmetric: {
        Encrypt: function(bytes, key) {
            var rsa = new ActiveXObject("System.Security.Cryptography.RSACryptoServiceProvider");
            rsa.PersistKeyInCsp = false;
            rsa.FromXmlString(key);
            e = rsa.Encrypt((bytes), true);
            rsa.Clear();
            return e;
        },
        Decrypt: function(bytes, key) {
            var rsa = new ActiveXObject("System.Security.Cryptography.RSACryptoServiceProvider");
            rsa.PersistKeyInCsp = false;
            rsa.FromXmlString(key);
            e = rsa.Decrypt((bytes), true);
            rsa.Clear();
            return e;
        }
    },
    Sign: function(hash, privatekey) {
        var rsa = new ActiveXObject("System.Security.Cryptography.RSACryptoServiceProvider");
        rsa.PersistKeyInCsp = false;
        rsa.FromXmlString(privatekey);

        var formatter = new ActiveXObject("System.Security.Cryptography.RSAPKCS1SignatureFormatter");
        formatter.SetHashAlgorithm("SHA256");
        formatter.SetKey(rsa);
        var signature = formatter.CreateSignature_2((hash));
        rsa.Clear();
        return signature;
    },
    Verify: function(hash, signature, publickey) {
        var rsa = new ActiveXObject("System.Security.Cryptography.RSACryptoServiceProvider");
        rsa.PersistKeyInCsp = false;
        rsa.FromXmlString(publickey);

        var deformatter = new ActiveXObject("System.Security.Cryptography.RSAPKCS1SignatureDeformatter");
        deformatter.SetHashAlgorithm("SHA256");
        deformatter.SetKey(rsa);
        var result = deformatter.VerifySignature_2((hash), (signature));
        rsa.Clear();
        return result;
    },
    Symmetric: {
        Encrypt: function(bytes, password) {
            var key = Cryptography.SHA256(Encoding.GetBytes(password));  // 256bits = 32Bytes
            var a = new ActiveXObject("System.Security.Cryptography.RijndaelManaged");
            a.KeySize = 256; // 256bits = 32Bytes
            a.BlockSize = 128; // 128bits = 16Bytes
            a.Key = key;
            a.GenerateIV();
            //a.Padding = PaddingMode.Zeros; // Default = PaddingMode.PKCS7
            var e = a.CreateEncryptor().TransformFinalBlock((bytes), 0, Count(bytes));
            var data = Convert.FromHexString(Convert.ToHexString(a.IV) + Convert.ToHexString(e));
            a.Clear();
            return data;
        },
        Decrypt: function(bytes, password) {
            var key = Cryptography.SHA256(Encoding.GetBytes(password));  // 256bits = 32Bytes
            var a = new ActiveXObject("System.Security.Cryptography.RijndaelManaged");
            a.KeySize = 256; // 256bits = 32Bytes
            a.BlockSize = 128; // 128bits = 16Bytes
            a.Key = key;
            var data = Convert.ToHexString(bytes);
            var iv = Convert.FromHexString(data.substr(0, 32));
            var b = Convert.FromHexString(data.substr(32));
            a.IV = iv;
            //a.Padding = PaddingMode.Zeros; // Default = PaddingMode.PKCS7
            var e = a.CreateDecryptor().TransformFinalBlock((b), 0, Count(b));
            a.Clear();
            return e;
        }
    },
    Encrypt: function(bytes) {
        var a = new ActiveXObject("System.Security.Cryptography.RijndaelManaged");
        a.KeySize = 256;
        a.BlockSize = 128;
        a.GenerateKey();
        a.GenerateIV();
        var key = a.Key;
        var iv = a.IV;
        var data = a.CreateEncryptor().TransformFinalBlock((bytes), 0, Count(bytes));
        a.Clear();
        return {
            Key: key,
            IV: iv,
            Data: data
        };
    },
    Decrypt: function(bytes, key, iv) {
        var a = new ActiveXObject("System.Security.Cryptography.RijndaelManaged");
        a.KeySize = 256;
        a.BlockSize = 128;
        a.Key = key;
        a.IV = iv;
        var e = a.CreateDecryptor().TransformFinalBlock((bytes), 0, Count(bytes));
        a.Clear();
        return e;
    }


}
//----------------------------------------------------------------------------------------------------
var Compression = {

    Unzip: function(path) {
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        path = fso.GetAbsolutePathName(path);
        if( ! /^zip$/i.test(fso.GetExtensionName(path))) {
            return null;
        }
        var sh = new ActiveXObject("Shell.Application");
        var entries = sh.NameSpace(path).Items();
        var folder = fso.GetParentFolderName(path);
        var name = fso.GetBaseName(path);
        if(entries.Count == 1) {
            sh.NameSpace(folder).CopyHere(entries, 20);
        } else {
            folder = folder + "/" + name
            if( ! fso.FolderExists(folder)) {
                fso.CreateFolder(folder);
            }
            sh.NameSpace(folder).CopyHere(entries, 20);
        }
        return folder;
    }

}
//----------------------------------------------------------------------------------------------------
function CreateKey(path) {

    var rsa = new ActiveXObject("System.Security.Cryptography.RSACryptoServiceProvider");
    rsa.PersistKeyInCsp = false;
    var key = {
        Private: rsa.ToXmlString(true),
        Public: rsa.ToXmlString(false)
    };
    rsa.Clear();
    return key;

}
//----------------------------------------------------------------------------------------------------
function GetKey(path) {

    var xml = new ActiveXObject("MSXML2.DOMDocument.6.0");
    if(xml.load(path)) {
        return trim(xml.xml);
    } else {
        return null;
    }

}
//----------------------------------------------------------------------------------------------------
function Count(bytes) {

    return Convert.ToHexString(bytes).length / 2;

}
//----------------------------------------------------------------------------------------------------
function GetGuid() {

    var typelib = new ActiveXObject("Scriptlet.TypeLib");
    return typelib.Guid.substr(1, 36).replace(/\-/g, "").toLowerCase();

}
//----------------------------------------------------------------------------------------------------
function GetTimestamp() {

    var date = new Date;
    var t = date.getFullYear();
    t += "-" + ("00" + (date.getMonth() + 1)).slice(-2);
    t += "-" + ("00" + date.getDate()).slice(-2);
    t += "T" + ("00" + date.getHours()).slice(-2);
    t += ":" + ("00" + date.getMinutes()).slice(-2);
    t += ":" + ("00" + date.getSeconds()).slice(-2);
    return t;

}
//----------------------------------------------------------------------------------------------------
function trim(t) {

    if( ! t || typeof t != "string") {
        return t;
    }

    return t.replace(/^\s+|\s+$/g, "");

}
//----------------------------------------------------------------------------------------------------


























