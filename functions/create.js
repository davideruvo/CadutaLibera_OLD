const { nanoid } = require("nanoid");
const { dynamoDb } = require("../lib/dyno-client")
const TABLE_NAME = process.env.TABLE_NAME;

exports.handler = async (event, context) => {
    try {
        const body = JSON.parse(event.body);
        const params = {
            TableName: TABLE_NAME,
            Item: {
                userId: '0',
                uid: nanoid(10),
                word: body.word,
                def: body.def,
                createDate: new Date().toISOString(),
                useDate: new Date().toISOString()
            }
        };
        let result = await dynamoDb.put(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                data: result,
            }),
        };
    } catch (error) {
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify(error),
        };
    }

};