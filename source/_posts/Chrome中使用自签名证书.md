---
title: Chrome中使用自签名证书
date: 2023-03-19 15:09:30
tags: [Chrome, ssl, Certificate]
---



## Chrome 中使用自签名证书

### 如何生成自签名证书
#### ssl相关命令简介
* ``openssl genrsa``: 生成 Private Key
* ``openssl req``: 用Key生成CSR
* ``openssl x509``: 根据 x509 规范，将CA证书和私钥将CSR文件加密成使用的证书

#### 生成CA证书
根密钥
> openssl genrsa -des3 -out myroot.key 4096

* -des3 是加密方式，也可以换其他的加密方式。
* 4096 密钥的长度

根自签名证书
> openssl req -x509 -sha256 -new -key root.key -sha256 -days 1024 -out myroot.crt

服务端密钥
> openssl genrsa -out myserver.key 2048

证书请求文件
> openssl req -new -key myserver.key -out myserver.csr

使用根自签名证书对CSR签名
> openssl x509 -req -sha256 -in myserver.csr -CA root.crt -CAkey root.key -CAcreateserial -out myserver.crt -days 365


### 如何导入证书
windows直接将根证书导入到受信任的根证书中即可
### chrome 使用证书问题
通过上面的步骤生成的服务端证书使用对时候，通过chrome浏览器访问浏览器会发现地址栏的锁是红的提示链接不安全 
![chrome不受信](/images/posts/chrome_ssl_errors.jpeg) 
#### 原因
在 Chrome 58 之前，Chrome 会根据 CN 来检查访问的域名是不是和证书的域名一致，但是在 Chrome 58 之后，改为使用 SAN(Subject Alternative Name) 而不是 CN 检查域名的一致性。
而 SAN 属于 x509 扩展里面的内容，所以我们需要通过 -extfile 参数来指定存放扩展内容的文件。
所以可以通过制定SAN属性即可
#### 解决方式
额外创建一个ext文件,内容少的也可以直接跟在后面
``subjectAltName = DNS: myserver.com``
```
subjectAltName = @alt_names

[alt_names]
DNS.1 = myserver.com
```


> openssl x509 -req -sha256 -in myserver.csr -CA root.crt -CAkey root.key -CAcreateserial -out myserver.crt -days 365 -extfile myext.ext

在服务端使用新生成的`myserver.crt`文件重启，重新在chrome中访问发现地址栏中有小锁了
![chrome受信](/images/posts/chrome_ssl.jpeg)


参考内容  
[Fixing-Chrome-missing_subjectAltName-selfsigned-cert-openssl](https://alexanderzeitler.com/articles/Fixing-Chrome-missing_subjectAltName-selfsigned-cert-openssl/)  
[如何使用自签名 CA 和证书来保护个人在公网上的内容](https://juejin.cn/post/6844903965499342855#heading-4)

