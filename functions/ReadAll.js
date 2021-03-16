const { dynamoDb, dbUtils } = require("../lib/dyno-client")

exports.handler = async (event, context) => {
    try { 
    var params = {
        ExpressionAttributeValues: {
            ':u': '0'
        },
        KeyConditionExpression: 'userid = :u',
        ProjectionExpression: 'userid, qid, word, question',
        TableName: dbUtils.TableName
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