const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
require('dotenv').config();
const promosRouter = require("./routes/promos");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API codes promos",
            version: "1.0.1",
            description: "Librairie des API utilisées dans le cadre du projet MSPR Application mobile codes promos",
        },
        servers: [{
                url: "https://mspr-epsi.tomco.tech",
                description: "Serveur de production"
            },
            {
                url: "http://localhost:443",
                description: "Serveur local"
            },
            {
                url: "https://mspr-epsi-preprod.tomco.tech",
                description: "Serveur de pré-production"
            },
            {
                url: "https://mspr-epsi-recette.tomco.tech",
                description: "Serveur de recette"
            },
            {
                url: "https://mspr-epsi-integration.tomco.tech",
                description: "Serveur d'intégration"
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

let server = app.listen(443, () => {
    console.log('Listening', server.address().port)
})