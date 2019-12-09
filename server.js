var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if (!port) {
    console.log('请指定端口号\nnode server.js 8888 像这样!')
    process.exit(1)
}

var server = http.createServer(function (request, response) {
    var parsedUrl = url.parse(request.url, true)
    var pathWithQuery = request.url
    var queryString = ''
    if (pathWithQuery.indexOf('?') >= 0) { queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
    var path = parsedUrl.pathname
    var query = parsedUrl.query
    var method = request.method

    /******** 从这里开始看，上面不要看 ************/
    console.log('有个请求过来啦！路径（带查询参数）为：' + pathWithQuery)
    if (path === '/sign_in' && method === 'POST') {
        response.setHeader('Content-Type', 'text/html;charset=utf-8')
        const userString = fs.readFileSync('./db/users.json').toString()
        const userArray = JSON.parse(userString)
        const array = []
        request.on('data', (chunk) => {
            array.push(chunk)
        })
        request.on('end', () => {
            const string = array.toString()
            const object = JSON.parse(string)
            const user = userArray.find((item) => {
                return item.name === object.name && item.password === object.password
            })
            console.log(user)
            if (user === undefined) {
                response.statusCode = 400
                //response.setHeader('Content-Type', 'text/json,utf-8')
                response.end(`{"error":4001}`)
            } else {
                response.statusCode = 200
                const random = Math.random()
                const session = JSON.parse(fs.readFileSync('./session.json').toString())
                session[random] = { "user_id": user.id }
                console.log(session)
                fs.writeFileSync('./session.json', JSON.stringify(session))
                response.setHeader('Set-Cookie', `session_id=${random};HttpOnly`)
                response.end()
            }
        })
    } else if (path === '/home.html') {
        const cookie = request.headers['cookie']
        let sessionId//拿到登录时生成的随机数random
        try {
            sessionId = cookie.split(';').filter(item => item.indexOf('session_id=') >= 0)[0].split('=')[1]
        } catch (error) { }
        console.log(typeof sessionId)
        const session = JSON.parse(fs.readFileSync('./session.json').toString())
        response.setHeader('Content-Type', 'text/html;charset=UTF-8')
        if (sessionId && session[sessionId]) {
            const userId = session[sessionId].user_id
            const userString = fs.readFileSync('./db/users.json').toString()
            const userArray = JSON.parse(userString)
            const user = userArray.find(item => item.id === userId)
            const homeHtml = fs.readFileSync('./public/home.html').toString()
            const string = homeHtml.replace('{{userName}}', `${user.name}`)
            response.write(string)
            response.end()
        } else {
            const homeHtml = fs.readFileSync('./public/home.html').toString()
            const string = homeHtml.replace('{{userName}}', '您还未登录,请<a href="./signIn.html">登录</a>')
            response.write(string)
            response.end()
        }

    } else if (path === '/sign_up' && method === 'POST') {
        response.setHeader('Content-Type', 'text/html,utf-8')
        const userString = fs.readFileSync('./db/users.json').toString()
        const userArray = JSON.parse(userString)
        const array = []
        request.on('data', (chunk) => {
            array.push(chunk)
            //将数据push到一个空数组里
        })
        request.on('end', () => {
            const string = array.toString()
            const object = JSON.parse(string)
            const result = userArray.find((item) =>
                item.name === object.name
            )
            if (result === undefined) {
                newUser = { "id": userArray.length + 1, "name": object.name, "password": object.password }
                userArray.push(newUser)
                fs.writeFileSync('./db/users.json', JSON.stringify(userArray))
                response.end('结束')
            } else {
                response.statusCode = 400
                response.end()
            }

        })
    } else {
        const filePath = (path === '/' ? '/index.html' : path)
        response.statusCode = 200
        const index = filePath.lastIndexOf('.')
        const suffix = filePath.substring(index)
        console.log(suffix)
        const hashMap = {
            ".html": "text/html",
            ".js": "text/javascript",
            ".css": "text/css",
            ".jpg": "image/jpeg",
            ".png": "image/png"
        }
        response.setHeader('Content-Type', `${hashMap[suffix]};charset=utf-8`)
        let content
        try {
            content = fs.readFileSync(`./public/${filePath}`)
        } catch (error) {
            response.statusCode = 404
            content = '此路径不存在'
        }
        response.write(content)
        response.end()
    }
    /******** 代码结束，下面不要看 ************/
})

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)
