# static-server
1. 设置请求路径
~~~javascript
response.write(fs.readFileSync(./public${路径}))
~~~
代替了用（if...else...）手动输入请求文件路径(filePath)。

2. 设置Content-Type
~~~
response.setHeader('Content-Type', `text/${hashMap[文件类型]};charset=utf-8`)
~~~
用string.lastIndexOf(filePathath),再substring截取后缀（suffix），现在的后缀还带有“.”，利用哈希表得到对应不带“.”后缀。
