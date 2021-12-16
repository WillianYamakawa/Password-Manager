const express = require("express");
const mongoose = require('mongoose');
const userModel = require("./models/user");
const md5 = require("md5")
const CryptoJS = require("crypto-js");
const pwdModel = require("./models/pwd");
const app = express();

mongoose.connect(`MONGODB URL`, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(express.json())
app.use(express.static(__dirname + "/public"))

app.get("/", (req, res) => {
   res.sendFile(__dirname + "/public/index.html")
})

app.get("/home", (req, res) => {
   res.sendFile(__dirname + "/public/home.html")
})

app.get("/api/content", checkLogin, async (req, res) => {

  try{
    res.json(decryptData(await pwdModel.find({owner: req.login.user}).exec(), req.login.password));
  }catch{
    res.status(400).json({status: "Erro!"})
  }
  

});

app.patch("/api/content", checkLogin, async (req, res) => {

  try{

    if(req.body.owner != req.login.user) throw 'Not Allowed!';

    await pwdModel.findByIdAndUpdate(req.body._id, encryptData(req.body, req.login.password));

    res.json(decryptData(await pwdModel.find({owner: req.login.user}).exec(), req.login.password));

  }catch{
    res.status(400).json({status: "Erro!"})
  }
  
})

app.post("/api/content", checkLogin, async (req, res) => {

  try{

    if(req.body.owner != req.login.user) throw 'Not Allowed!';

    await pwdModel.create(encryptData(req.body, req.login.password));

    res.json(decryptData(await pwdModel.find({owner: req.login.user}).exec(), req.login.password));

  }catch{
    res.status(400).json({status: "Erro!"})
  }
  
})

app.delete("/api/content", checkLogin, async (req, res) => {

  try{

    await pwdModel.findByIdAndRemove(req.body._id);

    res.json(decryptData(await pwdModel.find({owner: req.login.user}).exec(), req.login.password));

  }catch{
    res.status(400).json({status: "Erro!"})
  }
  
})

app.get("/api/validatelogin", checkLogin, (req, res) =>{
  res.json({status: "ok"})
})

app.listen(80,() => {console.log("[!] Server up and running!")});

async function checkLogin(req, res, next){
  let user = req.query.user;
  let pwd = req.query.pwd;
  if(!user || !pwd){
    res.status(401).json({status: "Usuario ou senha inválidos!"});
    return;
  }

  
  let result = await userModel.findOne({user: user, password: md5(pwd)}).exec();


  if(result == null) {
    res.status(401).json({status: "Usuario ou senha inválidos!"});
    return;
  }
  req.login = result;
  next();
}

function decryptData(data, pwd){
  let response = {status: "ok", data: []};

  for(let i = 0; i < data.length ; i++){

    response.data.push({
      _id: data[i]._id,
      owner: data[i].owner,
      name: aesDecrypt(data[i].name, pwd),
      login: aesDecrypt(data[i].login, pwd),
      password: aesDecrypt(data[i].password, pwd),
      comment: aesDecrypt(data[i].comment, pwd)
    })
  }
  return response
}

function encryptData(data, pwd){

  return {
    owner: data.owner,
    name: aesEncrypt(data.name, pwd),
    login: aesEncrypt(data.login, pwd),
    password: aesEncrypt(data.password, pwd),
    comment: aesEncrypt(data.comment, pwd)
  }
  
}


function aesEncrypt(content, key) {
const parsedkey = CryptoJS.enc.Utf8.parse(key);

const iv = CryptoJS.enc.Utf8.parse(process.env['iv']);

const encrypted = CryptoJS.AES.encrypt(content, parsedkey, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });

return encrypted.toString();
};


function aesDecrypt(word, key) {
var keys = CryptoJS.enc.Utf8.parse(key);

const iv = CryptoJS.enc.Utf8.parse(process.env['iv']);

let base64 = CryptoJS.enc.Base64.parse(word);
let src = CryptoJS.enc.Base64.stringify(base64);

var decrypt = CryptoJS.AES.decrypt(src, keys,{ iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });

return decrypt.toString(CryptoJS.enc.Utf8);
};
