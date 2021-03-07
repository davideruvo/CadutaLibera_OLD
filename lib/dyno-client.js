require('dotenv').config();
const { ACCESS_KEY_ID, SECRET_ACCESS_KEY, REGION, TABLE_NAME } = process.env;
const AWS = require("aws-sdk");

AWS.config.update({
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY
    },
    region: REGION,
});
const dynamoDb = new AWS.DynamoDB.DocumentClient();
module.exports = { dynamoDb, TABLE_NAME };