const { dynamoDb } = require("../lib/dyno-client")
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event, context) => {
    try { 
    var params = {
        ExpressionAttributeValues: {
            ':u': '0'
        },
        KeyConditionExpression: 'userId = :u',
        ProjectionExpression: 'userId, uid, word, def, createDate, useDate',
        TableName: TABLE_NAME
    };
    let result = await dynamoDb.query(params).promise();
    return {
        statusCode: 200,
        success: true,
        body: JSON.stringify(result)
        };
    } catch (error) {
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify(error),
        };
    }
};