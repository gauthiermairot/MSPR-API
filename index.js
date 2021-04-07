const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
require('dotenv').config();
const promosRouter = require("./routes/promos");
const mysql = require('mysql');

// const PORT = process.env.PORT || 80;

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Library API",
			version: "1.0.0",
			description: "A simple Express Library API",
		},
		servers: [
			{
				//url: "http://localhost",
				url: "https://mspr-epsi.tomco.tech",
			},
		],
	},
	apis: ["./routes/*.js"],
};

const specs = swaggerJsDoc(options);
const app = express();
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/promos", promosRouter);
// app.listen('/');


app.get('/a', (req, res) => {
  res.send('Hello blog reader!')
})

let con = mysql.createConnection({
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PWD,
	database: process.env.MYSQL_DB,
});

con.connect(function(error) {
	if (error) {
		res.send('Error mySQL' + error)
	}
	else console.log("connected");
});
app.get("/test", (req, res) => {
	con.query(`select * from QR_CODE`, function(error, rows, fields) {     
		res.send(rows);
    });
});


app.listen(0, () => {
  console.log('Listening')
})

