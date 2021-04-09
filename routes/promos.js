const express = require("express");
const router = express.Router();
const mysql = require('mysql');
const { nanoid } = require("nanoid");

const idLength = 8;
const table = "QR_CODE";

let db = mysql.createConnection({
    // host: "localhost",
    host: "mspr-epsi.tomco.tech",
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PWD,
    database: process.env.MYSQL_DB,
});

db.connect(function(error) {
    if (error) throw error;
    console.log("Connecté à la base de données MySQL!");
});

/**
 * @swagger
 * components:
 *   securitySchemes:
 *    oAuthPassword:
 *     type: oauth2
 *     description: Cette API utilise l'authentification OAuth 2.0
 *     flows:
 *       password:
 *         tokenUrl: http://localhost:443/api-docs/oauth2/token
 *         scopes:
 *           admin: créer, modifier ou supprimer un code promo
 *   schemas:
 *     Promo:
 *       type: object
 *       required:
 *         - ID
 *         - DATA
 *       properties:
 *         ID:
 *           type: integer
 *           description: L'identifiant automatiquement généré par la base de données
 *         DATA:
 *           type: string
 *           description: Le code promotionnel
 *         LIBELLE:
 *           type: string
 *           description: Le contenue que contient le code promotionnel
 *         MONTANT:
 *           type: string
 *           description: Le montant de la promotion
 *       example:
 *         ID: 5
 *         DATA: CodePromo1
 *         LIBELLE: Mon Code Promo
 *         MONTANT: 10
 */

/**
 * @swagger
 * tags:
 *   name: Promos
 *   description: API de gestion des codes promotionnels
 */

/**
 * @swagger
 * /promos:
 *   get:
 *     summary: Retourne la liste des codes promotionnels
 *     tags: [Promos]
 *     responses:
 *       200:
 *         description: Succès, Liste des codes promotionnels
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promo'
 */

router.get("/", (req, res) => {
    db.query(`select * from ${table}`, function(error, rows, fields) {
        if (error) throw error;
        res.send(rows);
    });
});

/**
 * @swagger
 * /promos/{DATA}:
 *   get:
 *     summary: Retourne un code promotionnel à l'aide de son code data
 *     tags: [Promos]
 *     parameters:
 *       - in: path
 *         name: DATA
 *         schema:
 *           type: string
 *         required: true
 *         description: Donnée du code promo
 *     responses:
 *       200:
 *         description: La description du code promotionnel par DATA
 *         contens:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promo'
 *       404:
 *         description: Erreur, le code promo n'a pas été trouvé
 */

router.get("/:data", (req, res) => {
    db.query(`select * from ${table} WHERE DATA = '${ req.params.data}'`, function(error, rows, fields) {
        if (error) throw error;
        if (error || Object.keys(rows).length === 0) {
            res.status(404).send({ error: "Error" });
            return;
        }
        res.send(rows);
    });
});

/**
 * @swagger
 * /promos:
 *   post:
 *     summary: Création d'un code promotionnel
 *     security:
 *       oAuthSample: [admin]
 *     tags: [Promos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Promo'
 *     responses:
 *       200:
 *         description: Le code promotionnel a été enregistré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promo'
 *       500:
 *         description: Erreur, Le serveur a rencontré un problème
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
 * /promos/{DATA}:
 *  put:
 *    summary: Mise à jour du code promotionnel
 *    security:
 *       oAuthSample: [admin]
 *    tags: [Promos]
 *    parameters:
 *      - in: path
 *        name: DATA
 *        schema:
 *          type: string
 *        required: true
 *        description: DATA du code promo
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/Promo'
 *    responses:
 *      200:
 *        description: Succès, le code promotionnel a bien été mis à jour
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Promo'
 *      404:
 *        description: Erreur, le code promotionnel est introuvable
 *      500:
 *        description: Erreur, Le serveur a rencontré un problème
 */

router.put("/:DATA", (req, res) => {
    try {
        req.app.db
            .get("promos")
            .find({ DATA: req.params.DATA })
            .assign(req.body)
            .write();

        res.send(req.app.db.get("promos").find({ DATA: req.params.DATA }));
    } catch (error) {
        return res.status(500).send(error);
    }
});

/**
 * @swagger
 * /promos/{DATA}:
 *   delete:
 *     summary: Suppression d'un code promotionnel avec son code DATA
 *     security:
 *       oAuthSample: [admin]
 *     tags: [Promos]
 *     parameters:
 *       - in: path
 *         name: DATA
 *         schema:
 *           type: string
 *         required: true
 *         description: DATA du code promotionnel
 * 
 *     responses:
 *       200:
 *         description: Succès, Le code promo a bien été supprimé
 *       404:
 *         description: Erreur, Le code promo est introuvable dans la base de données
 */

router.delete("/:DATA", (req, res) => {
    db.query(`DELETE * from ${table} WHERE DATA = '${ req.params.DATA}'`, function(error, rows, fields) {
        if (error) {
            throw error;
        } else {
            res.sendStatus(200);
        }
    });
});

module.exports = router;