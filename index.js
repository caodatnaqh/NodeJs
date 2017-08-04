const body_parser = require(`body-parser`);
const express = require("express");
const fs = require("fs");
const lodash = require("lodash");
const hbs = require("hbs");
var path = require("path");
const jsonstream = require("JSONStream");
var engine = require("consolidate");

const index = express();
index.engine(hbs, engine.handlebars);
// index.set('view engine', 'hbs');
index.use(express.static('dist'));
index.use(body_parser.json());
index.set('view engine', 'ejs');
index.set('views', './views');
index.use('/profilepics', express.static('images'));
index.use(body_parser.urlencoded({ extended: true }));


//get
index.get(`/`,(req, res)=>{
    // res.send("<div style=\"text-align:center\"><p style=\"padding:3px 5px ;color: white; background-color:blue; display:inline-block; border-radius:3px\">Nguyen Thanh Don</p></div>");
    let users = [];
    user = fs.readdir('users',(err, files)=>{
        if(err) throw err
        files.forEach(function file(file){
            fs.readFile(path.join(__dirname,'users', file), {encoding : 'utf-8'}, (err, data)=>{
                if(err) throw err
                const user = JSON.parse(data);
                user.name.fullname = lodash.startCase(user.name.first + ' ' +user.name.last);
                users.push(user);
                if(users.length == files.length){
                    // res.send(users);
                    res.render('index', {users:users});
                }
            });
        })
    });
}).listen(8088, console.log('server is started'))

//truyen para
index.get('/:username', (req, res)=>{
    var username = req.params.username
    var user = getUser(username)
    // res.send(user);
    res.render('user', {
        user : user,
        address : user.location
    })
})

function getUser(username){
    var user = JSON.parse(fs.readFileSync(getUserFilePath(username),{encoding:'utf-8'}))
    user.name.full = lodash.startCase(user.name.first + ' ' + user.name.last)
    lodash.keys(user.location).forEach((key)=>{
        user.location[key] = lodash.startCase(user.location[key])
    })
    return user
}

function getUserFilePath(username){
    return path.join(__dirname, 'users', username) + '.json'
}

//put

index.put('/:username',(req, res)=>{
    var username = req.params.username
    var user = getUser(username)
    user.location = req.body
    saveUser(username, user)
    res.end()
})

index.delete('/:username',(req, res)=>{
    var username = req.params.username
    var user = getUser(username)
    user.location = ''
    saveUser(username, user)
    res.end()
})

function saveUser(username, data){
    var fp = getUserFilePath(username)
    fs.unlink(fp)
    fs.writeFileSync(fp, JSON.stringify(data, null, 2), {encoding : 'utf-8'})
}