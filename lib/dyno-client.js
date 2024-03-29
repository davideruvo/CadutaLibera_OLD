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
const dbUtils = {
    TableName: TABLE_NAME,
    ChunkData: function (inputArray, perChunk) {
        return inputArray.reduce((all, one, i) => {
            const ch = Math.floor(i / perChunk);
            all[ch] = [].concat((all[ch] || []), one);
            return all
        }, []);
    },
    GetQuestionId: function (n) {
        return new Date().toISOString().replace(/[-:.T]/g, '') + n.toString().padStart(3, '0');
    },
    MaxBatchRows: 1000
};
module.exports = { dynamoDb, dbUtils };