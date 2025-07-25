var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')

var states = {
    login: false,
    inGame: false
}

var mysql = require('mysql')

const app = express()

app.use(cors())
app.use(bodyParser.json())

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: 'project6'
})
con.connect((err) => {
    if (err) throw err
    console.log("connected");
})


app.get('/', (req, res) => {

    con.query("select * from homePage;", (err, result) => {
        if (err) {
            res.status(500).send()
            throw err
        }
        else {
            res.json(result)
        }
    })
})

app.post('/adminLogin', (req, res) => {
    if (req.body.username === "admin" && req.body.password === "admin123") {
        states.login = true
        res.status(200).send("okay")
    }
    else {
        res.status(500).send("wrong")
    }
})

app.post("/logout",(req, res) => {
    states.login = false
    res.status(200).send("success")
})

app.get('/getLogin', (req, res) => {
    res.status(200).send(states.login)
})

app.post('/blog', (req, res) => {
    con.query("insert into blogs (title,blog) values('"+req.body.title+"','"+req.body.blog+"')", (err, result) => {
        if (err) {
            res.status(500).send()
            throw err
        }
        else {
            res.status(200).send()
        }
    })
})

app.get('/blog', (req, res) => {
    con.query("select * from blogs;", (err, result) => {
        if (err) {
            res.status(500).send()
            throw err
        }
        else {
            res.json(result)
        }
    })
})

app.get('/blog/:id', (req, res) => {
    con.query("select * from blogs where id = "+ req.params.id, (err, result) => {
        if (err) {
            res.status(500).send()
            throw err
        }
        else {
            res.json(result)
        }
    })
})

app.post('/blogUp', (req, res) => {
    con.query("update blogs set title ='"+req.body.title+"', blog='"+req.body.blog+"' where id="+req.body.id, (err, result) => {
        if (err) {
            res.status(500).send()
            throw err
        }
        else {
            res.status(200).send()
        }
    })
})

app.post('/deleteBlog', (req, res) =>{
    con.query("delete from blogs where id="+req.body.id, (err, result) => {
        if (err) {
            res.status(500).send()
            throw err
        }
        else {
            res.json(result)
        }
    })
})

app.listen(3001, () => {
    console.log("start");
})