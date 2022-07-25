const express = require("express");
const app = express();
const port = process.env.PORT;

const pg = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
// para ver o que vem do formulario do postman
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

const consStr = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString: consStr , ssl: {rejectUnauthorized: false} });


app.get('/usuarios',(req,res)=>{
  pool.connect((err,client)=>{
    if(err){
      return res.status(401).send({
        message: 'Erro ao conectar com a database'
      })
    }
    
    client.query('select * from usuario', (error, result)=>{
      if(error){
        res.send({
          message: 'Erro ao consultar dados',
          erro: error.message
        })
      }
      return res.status(200).send(result.rows)
    })
  })
})


app.post("/usuarios", (req, res) => {
  pool.connect((err, client) => {
    if (err) {
      return res.status(401).send({
        message: "Erro de conexão",
      });
    }
    client.query('select * from usuario where cnpj = $1 or email=$2', [req.body.cnpj,req.body.email], (error, result) => {
      if (result.rowCount > 0) {
        return res.status(400).send({ message: 'Esse usuário já está cadastrado no sistema' })
      } else {
        bcrypt.hash(req.body.senha, 10, (error, hash) => {
          if (error) {
            return res.status(500).send({ message: 'Falha na autenticação' })
          }
          var sql =
            "insert into usuario (razaosocial, cnpj, email, senha, telefone, celular, cep, rua, numeroendereco, complementoendereco, bairro, cidade, estado, logo, perfil)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)";
          var dados = [
            req.body.razaosocial,
            req.body.cnpj,
            req.body.email,
            hash,
            req.body.telefone,
            req.body.celular,
            req.body.cep,
            req.body.rua,
            req.body.numeroendereco,
            req.body.complementoendereco,
            req.body.bairro,
            req.body.cidade,
            req.body.estado,
            req.body.logo,
            req.body.perfil
          ];
          client.query(sql, dados, (error, result) => {
            if (error) {
              return res.status(500).send({
                message: "Erro ao inserir o usuário",
                error: error.message,
              });
            }
            return res.status(201).send({
              message: "Usuário cadastrado com sucesso",
            });
          });
        });
      }
    })

  });
});

app.post("/usuarios/login", (req, res) => {
  pool.connect((err, client) => {
    if (err) {
      return res.status(401).send({
        message: "Erro de conexão",
      });
    }
    client.query('select * from usuario where email = $1', [req.body.email], (error, result) => {
      if (error) {
        return res.status(500).send({ message: 'Usuario não encontrado' })
      }
      if (result.rowCount > 0) {
        bcrypt.compare(req.body.senha, result.rows[0].senha, (error, results) => {
          if (error) {
            return res.status(500).send({ message: 'Falha na autenticação' })
          }
          //Início do token
          if (results) {
            let token = jwt.sign({
              razaosocial: result.rows[0].razaosocial,
              cnpj: result.rows[0].cnpj,
              email: result.rows[0].email,
              perfil: result.rows[0].perfil
            },
              'segredo', { expiresIn: '1h' }
            )
            return res.status(200).send({
              message: 'Conectado com sucesso',
              token: token
            })
          }
          return res.status(401).send({
            message: 'Senha não confere'
          })
        })
      }
      else {
        return res.status(401).send({
          message: 'Usuário não encontrado'
        })
      }
    })
  })
})

app.put("/usuarios/:idusuario", (req, res) => {
  pool.connect((err, client) => {
    if (err) {
      return res.status(401).send({
        message: "Erro ao conectar no database",
        erro: err.message,
      });
    }
    bcrypt.hash(req.body.senha, 10, (error, hash) => {
      if (error) {
        return res.status(500).send({ message: 'Falha na autenticação' })
      }
      var sql =
        "UPDATE usuario SET email=$1, senha=$2, telefone=$3, celular=$4, cep=$5, rua=$6, numeroendereco=$7, complementoendereco=$8, bairro=$9, cidade=$10, estado=$11, logo=$12, perfil=$13  WHERE id = $14";
      var dados = [
        req.body.email,
        hash,
        req.body.telefone,
        req.body.celular,
        req.body.cep,
        req.body.rua,
        req.body.numeroendereco,
        req.body.complementoendereco,
        req.body.bairro,
        req.body.cidade,
        req.body.estado,
        req.body.logo,
        req.body.perfil,
        req.params.idusuario,
      ];
      client.query(sql, dados, (error, result) => {
        if (error) {
          res.send({
            message: "Erro ao consultar dados",
            error: error.message,
          });
        }
        return res.status(200).send({
          message: "Usuario alterado com sucesso!",
        });
      })

    });
  });
});



app.listen(port, () => {
  console.log(`executando em http://localhost/${port}`);
});
