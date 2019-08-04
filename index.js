const express = require('express')
const bodyParser = require('body-parser')
const expressJwt = require('express-jwt')
const jwt = require('jsonwebtoken')
require('express-group-routes')
const app = express()

app.use(bodyParser.json())


const mysql = require('mysql')
const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database: 'instagram_db'
})

app.group("/api/v1", (router) => {
    router.post('/login', (req, res) =>{
        const email = req.body.email
        const password = req.body.password

        connection.query('SELECT * FROM accounts where email="'+email+'" and password="'+password+'"', (err, rows, fields)=>{
            if(rows.length == 1){
                const token = jwt.sign({email:email}, 'key')
                res.send({email, token})
            }else{
                res.send(401, "Wrong email or password")
            }            
        })
        
    })
    router.get('/posts', expressJwt({secret: 'key'}), (req, res) =>{
        connection.query('SELECT * FROM posts ORDER BY id DESC', function(err, rows, fields){
            if(err) throw err

            res.send(rows)
        })
    })
    router.post('/post', (req, res) => {
        const url = req.body.url
        const caption = req.body.caption

        connection.query('INSERT INTO posts (url, caption) values("'+url+'", "'+caption+'")', function(err, rows, fields){
            if(err) throw err

            res.send(rows)
        })
    })
    // router.get('/account/:email', (req, res) =>{
    //     const email = req.params.email
    //     const password = req.params.password

    //     // connection.query('SELECT * FROM accounts where email="'+email+'" and password="'+password+'"', function(err, rows){
    //         connection.query('SELECT * FROM accounts where email="'+email+'"', function(err, rows){
    //             if(err) throw err

    //         res.send(rows)
    //     })
    // })
    router.patch('/post/:id', (req, res)=>{
        const id = req.params.id
        const url = req.body.url
        const caption = req.body.caption
        connection.query('UPDATE posts SET url="'+url+'", caption="'+caption+'" WHERE id = '+id+' ', function(err, rows, fields){
            if(err)throw err

            res.send(rows)
        })
    })
    router.delete('/post/:id', (req, res)=>{
        const id = req.params.id
        connection.query('DELETE FROM posts WHERE id = '+id+' ', function(err, rows, fields){
            if(err)throw err

            res.send(rows)
        })
    })

})

app.listen('3500', () => {console.log("App Running!")})