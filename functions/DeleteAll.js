const { dynamoDb, dbUtils } = require("../lib/dyno-client")

exports.handler = async (event, context) => {
    try {
        let result = await deleteItems('0');
        return {
            statusCode: 200,
            body: JSON.stringify({
                data: result
            }),
        };
    } catch (error) {
        console.log(error);
          return {
            statusCode: error.statusCode || 500,
            body: JSON.stringify(error),
        };
    } 
};
async function deleteItems(userid) {
    const queryParams = {
        TableName: dbUtils.TableName,
        KeyConditionExpression: 'userid = :userid',
        ExpressionAttributeValues: { ':userid': userid },
    };
    const queryResults = await dynamoDb.query(queryParams).promise()
    if (queryResults.Items && queryResults.Items.length > 0) {
        const batchCalls = dbUtils.ChunkData(queryResults.Items, 25).map(async (chunk) => {
            const deleteRequests = chunk.map(item => {
                return {
                    DeleteRequest: {
                        Key: {
                            'userid': item.userid,
                            'qid': item.qid,
                        }
                    }
                }
            })
            const batchWriteParams = {
                RequestItems: {
                    [dbUtils.TableName]: deleteRequests
                }
            }
            await dynamoDb.batchWrite(batchWriteParams).promise()
        })
        await Promise.all(batchCalls)
    }
}