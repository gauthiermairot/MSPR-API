const express = require("express");
const router = express.Router();
const mysql = require('mysql');
const { nanoid } = require("nanoid");

const idLength = 8;

let con = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PWD,
	database: process.env.MYSQL_DB,
});

con.connect(function(error) {
	if (error) {
		res.send("error sql")
		return
	}
	else console.log("connected");
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Promo:
 *       type: object
 *       required:
 *         - title
 *         - author
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the promo
 *         title:
 *           type: string
 *           description: The promo title
 *         author:
 *           type: string
 *           description: The promo author
 *       example:
 *         id: d5fE_asz
 *         title: The New Turing Omnibus
 *         author: Alexander K. Dewdney
 */

 /**
  * @swagger
  * tags:
  *   name: Promos
  *   description: The promos managing API
  */

/**
 * @swagger
 * /promos:
 *   get:
 *     summary: Returns the list of all the promos
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
	con.query(`select * from QR_CODE`, function(error, rows, fields) {     
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
	con.query(`select * from QR_CODE WHERE ID = ${ req.params.id}`, function(error, rows, fields) {     
		if(error || Object.keys(rows).length === 0){
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
