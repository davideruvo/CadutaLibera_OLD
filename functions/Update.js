const { dynamoDb, dbUtils } = require("../lib/dyno-client")

exports.handler = async (event, context) => {
    try {
        let item = JSON.parse(event.body);
        let result = await replaceItem('0', item.qid);
        return {
            statusCode: 200,
            body: JSON.stringify({
                data: result
            }),
        };
    } catch (error) {
        return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify(error),
        };
    }
};
async function replaceItem(userid, qid) {
    const queryParams = {
        TableName: dbUtils.TableName,
        KeyConditionExpression: 'userid = :userid and qid = :qid',
        ExpressionAttributeValues: { ':userid': userid, ':qid': qid }
    };
    const queryResults = await dynamoDb.query(queryParams).promise();
    if (queryResults.Items && queryResults.Items.length > 0) {
        var item = queryResults.Items[0];
        const batchWriteParams = {
            RequestItems: {
                [dbUtils.TableName]: [
                    {
                        DeleteRequest: {
                            Key: {
                                'userid': item.userid,
                                'qid': item.qid
                            }
                        }
                    },
                    {
                        PutRequest: {
                            Item: {
                                userid: userid,
                                qid: dbUtils.GetQuestionId(0),
                                word: item.word,
                                question: item.question
                            }
                        }
                    }
                ]
            }
        };
        return await dynamoDb.batchWrite(batchWriteParams).promise();
    }
}