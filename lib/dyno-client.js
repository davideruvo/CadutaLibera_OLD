require('dotenv').config();
const { MY_AWS_ACCESS_KEY_ID, MY_AWS_SECRET_ACCESS_KEY, MY_AWS_REGION } = process.env;
const AWS = require("aws-sdk");

AWS.config.update({
    credentials: {
        accessKeyId: MY_AWS_ACCESS_KEY_ID,
        secretAccessKey: MY_AWS_SECRET_ACCESS_KEY
    },
    region: MY_AWS_REGION,
});
const TABLE_NAME = 'CadutaLibera';
const dynamoDb = new AWS.DynamoDB.DocumentClient();
module.exports = { dynamoDb, TABLE_NAME };