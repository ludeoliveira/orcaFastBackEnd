const express  = require('express') 
const app = express() 
const port = process.env.PORT 

const pg = require('pg')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cors = require('cors')
// para ver o que vem do formulario do postman
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())



const consStr =  process.env.DATABASE_URL
const pool = new pg.Pool({ connectionString: consStr })

app.post('/usuarios', (req, res)=>{
    pool.connect((err, client)=>{
        if(err){
            return res.status(401).send({
                message: 'Erro de conexão'
            })
        }
        var sql = 'insert into usuario (razaosocial, cnpj, email, senha, telefone, celular, cep, rua, numeroendereco, complementoendereco, bairro, cidade, estado, logo)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)'
        var dados = [req.body.razaosocial, req.body.cnpj, req.body.email, req.body.senha, req.body.telefone, req.body.celular, req.body.cep, req.body.rua, req.body.numeroendereco, req.body.complementoendereco, req.body.bairro, req.body.cidade, req.body.estado, req.body.logo]
        client.query(sql,dados, (error, result)=>{
            if(error){
                return res.status(500).send({
                    message: 'Erro ao inserir o usuário'
                })
            }
            return res.status(201).send({
                message: 'Usuário cadastrado com sucesso'
            })
        })
    
    })
})




app.listen(port, () => {
    console.log(`executando em http://localhost/${port}`)
})

