/* API REST dos clientes */
import express from 'express'
import { connectToDatabase } from '../utils/mongodb.js'
import { check, validationResult } from 'express-validator'

const router = express.Router()
const {db, ObjectId} = await connectToDatabase()
const nomeCollection = 'clientes'

const validaCliente = [
    check('cpf')
    .not().isEmpty().trim().withMessage('É obrigatório informar o CPF')
    .isNumeric().withMessage('O CPF só deve conter números')
    .isLength({min: 11, max:11}).withMessage('O CPF deve conter 11 nºs'),
    check('nome')
    .not().isEmpty().trim().withMessage('É obrigatório informar o nome')
    .isAlphanumeric('pt-BR', {ignore: '/. '})
    .withMessage('O nome não deve ter caracteres especiais'),
    check('dtNasc')
    .not().isEmpty().trim().withMessage('É obrigatório informar a Data de nascimento'),
    check('moradores_residencia').not().isEmpty().trim().withMessage('Devem ser infomrados a quantidade de moradores em sua residencia')
    .isNumeric().withMessage('O numero de moradores deve ser um numero'),
    check('telefone').not().isEmpty().trim().withMessage('É obrigatório informar o Telefone')
    .isLength({min: 11, max:11}).withMessage('O telefone deve conter 11 nºs')
    
    
]

/**
 * GET /api/clientes
 * Lista todos os clientes de serviço
 */
router.get('/', async(req, res) => {
    try{
        db.collection(nomeCollection).find().sort({nome: 1}).toArray((err, docs) => {
            if(!err){
                res.status(200).json(docs)
            }
        })
    } catch (err) {
        res.status(500).json({
            errors: [{
                value: `${err.message}`,
                msg: 'Erro ao obter a listagem dos clientes',
                param: '/'
            }]
        })
    }
})

/**
 * GET /api/clientes/id/:id
 * Lista todos os clientes de serviço
 */
router.get('/id/:id', async(req, res)=> {
    try{
        db.collection(nomeCollection).find({'_id': {$eq: ObjectId(req.params.id)}})
        .toArray((err, docs) => {
            if(err){
                res.status(400).json(err) // bad request
            } else {
                res.status(200).json(docs) // retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
})

/**
 * GET /api/clientes/nome/:nome
 * Lista os clientes de serviço pela nome 
 */
router.get('/nome/:nome', async(req, res)=> {
    try{
        db.collection(nomeCollection)
        .find({'nome': {$regex: req.params.nome, $options: "i"}})
        .toArray((err, docs) => {
            if(err){
                res.status(400).json(err) // bad request
            } else {
                res.status(200).json(docs) // retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
})

/**
 * GET /api/clientes/medSalario/:salario
 * Lista os clientes de serviço pela media Salario menor que o valor digitado
 */
router.get('/medSalario/:medSalario,:moradores_residencia', async(req, res)=> {
    try{
        db.collection(nomeCollection)
        .find({$and: [{'medSalario': {$lt: {$regex: req.params.medSalario }}},{'moradores_residencia':{$eq: {$regex: req.params.moradores_residencia }}}]})
        .toArray((err, docs) => {
            if(err){
                res.status(400).json(err) // bad request
            } else {
                res.status(200).json(docs) // retorna o documento
            }
        })
    } catch (err) {
        res.status(500).json({"error": err.message})
    }
})

/**
 * DELETE /api/clientes/:id
 * Apaga o Cliente de serviço pelo id
 */

router.delete('/:id', async(req, res) => {
    await db.collection(nomeCollection)
    .deleteOne({"_id": { $eq: ObjectId(req.params.id)}})
    .then(result => res.status(200).send(result))
    .catch(err => res.status(400).json(err))
})
/**
 * POST /api/clientes
 * Insere um novo Cliente de serviço
 */
router.post('/', validaCliente, async(req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .insertOne(req.body)
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})

/**
 * PUT /api/clientes
 * Altera um Cliente de serviço
 */
router.put('/', validaCliente, async(req, res) => {
    let idDocumento = req.body._id //armazenando o id do documento
    delete req.body._id //iremos remover o id do body
    const errors = validationResult(req)
    if (!errors.isEmpty()){
        return res.status(400).json(({
            errors: errors.array()
        }))
    } else {
        await db.collection(nomeCollection)
        .updateOne({'_id': {$eq : ObjectId(idDocumento)}},
                   { $set: req.body})
        .then(result => res.status(200).send(result))
        .catch(err => res.status(400).json(err))
    }
})
export default router