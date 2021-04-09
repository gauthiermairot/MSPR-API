const express = require("express");
const router = express.Router();
const mysql = require('mysql');
const { nanoid } = require("nanoid");

const idLength = 8;

let db = mysql.createConnection({
    // host: "localhost",
    host: "mspr-epsi.tomco.tech",
    user: "rsilwzqw_MSPR-EPSI21",
    password: "fc9l60L*",
    database: "rsilwzqw_MSPR-EPSI2021",
});

db.connect(function(error) {
    if (error) throw error;
    console.log("Connecté à la base de données MySQL!");
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Promo:
 *       type: object
 *       required:
 *         - id
 *         - data
 *       properties:
 *         id:
 *           type: integer
 *           description: Identifiant généré automatiquement
 *         data:
 *           type: string
 *           description: Le code promotionnel
 *         libelle:
 *           type: string
 *           description: La description du code promotionnel
 * 		   montant:
 * 			 type: integer
 * 			 description: Le montant de la réduction du code promotionnel
 *       example:
 *         id:1
 *         data:codepromo1
 *         libelle:Marque ou description du code promotionnel
 */

/**
 * @swagger
 * tags:
 *   name: Promos
 *   description: Api des codes promotionnels
 */

/**
 * @swagger
 * /promos:
 *   get:
 *     summary: Retourne la liste des codes promotionnels
 *     tags: [Promos]
 *     responses:
 *       200:
 *         description: The list of the promos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promo'
 */

router.get("/", (req, res) => {
    db.query(`select * from QR_CODE`, function(error, rows, fields) {
        if (error) throw error;
        res.send(rows);
    });
});

/**
 * @swagger
 * /promos/{id}:
 *   get:
 *     summary: Get the promo by id
 *     tags: [Promos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The promo id
 *     responses:
 *       200:
 *         description: The promo description by id
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promo'
 *       404:
 *         description: The promo was not found
 */

router.get("/:id", (req, res) => {
    //const promo = req.app.db.get("promos").find({ id: req.params.id }).value();
    db.query(`select * from QR_CODE WHERE ID = ${ req.params.id}`, function(error, rows, fields) {
        if (error) throw error;
        if (error || Object.keys(rows).length === 0) {
            res.status(404).send({ error: "Error" });
            return;
        }
        res.send(rows);
    });

    // if(!promo){
    // 	res.sendStatus(404)
    // }

    // res.send(promo);
});

/**
 * @swagger
 * /promos:
 *   post:
 *     summary: Create a new promo
 *     tags: [Promos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Promo'
 *     responses:
 *       200:
 *         description: The promo was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promo'
 *       500:
 *         description: Some server error
 */

router.post("/", (req, res) => {
    try {
        const promo = {
            id: nanoid(idLength),
            ...req.body,
        };

        req.app.db.get("promos").push(promo).write();

        res.send(promo)
    } catch (error) {
        return res.status(500).send(error);
    }
});

/**
 * @swagger
 * /promos/{id}:
 *  put:
 *    summary: Update the promo by the id
 *    tags: [Promos]
 *    parameters:
 *      - in: path
 *        name: id
 *        schema:
 *          type: string
 *        required: true
 *        description: The promo id
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Promo'
 *    responses:
 *      200:
 *        description: The promo was updated
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Promo'
 *      404:
 *        description: The promo was not found
 *      500:
 *        description: Some error happened
 */

router.put("/:id", (req, res) => {
    try {
        req.app.db
            .get("promos")
            .find({ id: req.params.id })
            .assign(req.body)
            .write();

        res.send(req.app.db.get("promos").find({ id: req.params.id }));
    } catch (error) {
        return res.status(500).send(error);
    }
});

/**
 * @swagger
 * /promos/{id}:
 *   delete:
 *     summary: Remove the promo by id
 *     tags: [Promos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The promo id
 * 
 *     responses:
 *       200:
 *         description: The promo was deleted
 *       404:
 *         description: The promo was not found
 */

router.delete("/:id", (req, res) => {
    req.app.db.get("promos").remove({ id: req.params.id }).write();

    res.sendStatus(200);
});

module.exports = router;