// importou o pacote express
const express = require('express')
const app = express()
// importou o pacote body parser (que processa requisiçoes body)
const bodyParser = require('body-parser')

const sqlite = require('sqlite')
const dbConnection = sqlite.open('banco.sqlite', {Promise}) 

const port = process.env.PORT || 3000


app.set('view engine', 'ejs') 
app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', async(request,response) => {
    const db = await dbConnection
    const categoriasDb = await db.all('select * from categorias;')
    const vagas = await db.all('select * from vagas;')
    
    const categorias = categoriasDb.map(cat => {
        return {
            ...cat,
            vagas: vagas.filter(vaga => vaga.categoria === cat.id)
        }
    })    
    response.render('home',{
        categorias
    })
})

//usar dois pontos : significa que é parametro
app.get('/vaga/:id', async(request,response) => {
    const db = await dbConnection
    const vaga = await db.get('select * from vagas where id= ' + request.params.id) //use get para pegar só 1 elemento
    response.render('vaga',{
        vaga
    })
})

app.get('/admin', (req, res) => {
    res.render('admin/home')        
})

app.get('/admin/vagas', async(req, res) => {
    const db = await dbConnection    
    const vagas = await db.all('select * from vagas;')    
    res.render('admin/vagas',{ vagas })
})

app.get('/admin/vagas/delete/:id', async(req,res) => {
    const db = await dbConnection
    await db.run('DELETE FROM vagas WHERE id = ' + req.params.id + '') //use get para pegar só 1 elemento
    res.redirect('/admin/vagas') //redirect devolve pra pagina especificada
})

app.get('/admin/vagas/nova', async(req,res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    res.render('admin/nova-vaga', { categorias })    
})

app.get('/admin/vagas/editar/:id', async(req,res) => {
    const db = await dbConnection
    const categorias = await db.all('select * from categorias')
    const vaga = await db.get('select * from vagas where id = '+req.params.id)
    res.render('admin/editar-vaga', {categorias, vaga})    
})


app.get('/admin/categorias', async(req,res) => {    
    res.render('admin/categorias')
    //CONSTRUIR TODA PARTE DE CATEGORIAS
})

app.post('/admin/vagas/nova', async(req,res) =>{
    const {titulo, descricao, categoria} = req.body
    const db = await dbConnection
    await db.run(`insert into vagas(categoria, titulo, descricao) values(${categoria},'${titulo}', '${descricao}')`)
    res.redirect('/admin/vagas')
})

app.post('/admin/vagas/editar/:id', async(req,res) =>{
    const {titulo, descricao, categoria} = req.body
    const { id } = req.params
    const db = await dbConnection
    await db.run(`update vagas set categoria = ${categoria}, titulo = '${titulo}', descricao = '${descricao}' where id = ${id}`)
    res.redirect('/admin/vagas')
})

const init = async() =>{
    const db = await dbConnection
    await db.run('create table if not exists categorias (id INTEGER PRIMARY KEY, categoria TEXT)')
    await db.run('create table if not exists vagas (id INTEGER PRIMARY KEY, categoria INTEGER, titulo TEXT, descricao TEXT)')
    //const categoria = 'Marketing team' 
    // await db.run(`insert into categorias(categoria) values('${categoria}')`)
    //const vaga = 'Social Media' 
    //const descricao = 'Vaga para Social Media' 
    //await db.run(`insert into vagas(categoria, titulo, descricao) values(3,'${vaga}', '${descricao}')`)
    //await db.run('DELETE FROM vagas WHERE id = 2')
}//ver o que eh async await
// usar crase na string significa que eh uma template string

init()

app.listen(port,(err) =>{
    if (err) {
        console.log('nao foi possivel iniciar o jobify')
    }
    else{
        console.log('servidor do jobify rodando')
    }
})

//passe o mouse em cada funçao pra entender como funciona

//estudar arrow function

