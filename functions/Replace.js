const { nanoid } = require("nanoid");
const { dynamoDb } = require("../lib/dyno-client")
const TABLE_NAME = process.env.TABLE_NAME;
const MAX_ROWS = 1000;

let autoId = 0;
exports.handler = async (event, context) => {
    try {
        let itemsToWrite = JSON.parse(event.body);
        itemsToWrite = itemsToWrite.filter(function (x) { return x.word !== '' && x.question !== ''; }).slice(0,MAX_ROWS);
        let result = await replaceItems(TABLE_NAME, '0', itemsToWrite);
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
async function replaceItems(tableName, userid, putItems) {
    const queryParams = {
        TableName: tableName,
        KeyConditionExpression: 'userid = :userid',
        ExpressionAttributeValues: { ':userid': userid },
    };
    const queryResults = await dynamoDb.query(queryParams).promise()
    if (queryResults.Items && queryResults.Items.length > 0) {
        const batchCalls = chunks(queryResults.Items, 25).map(async (chunk) => {
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
                    [tableName]: deleteRequests
                }
            }
            await dynamoDb.batchWrite(batchWriteParams).promise()
        })
        await Promise.all(batchCalls)
    }
    const batchCalls = chunks(putItems, 25).map(async (chunk) => {
        const putRequests = chunk.map(item => {
            return {
                PutRequest: {
                    Item: {
                        userid: userid,
                        qid: getQuestionId(),
                        word: item.word,
                        question: item.question
                    }
                }
            }
        })
        const batchWriteParams = {
            RequestItems: {
                [tableName]: putRequests
            }
        }
        var res = await dynamoDb.batchWrite(batchWriteParams).promise();
    })
    await Promise.all(batchCalls)
}

function chunks(inputArray, perChunk) {
    return inputArray.reduce((all, one, i) => {
        const ch = Math.floor(i / perChunk);
        all[ch] = [].concat((all[ch] || []), one);
        return all
    }, [])
}
function getQuestionId() {
    return new Date().toISOString() + (autoId++).toString().padStart(3,'0');
}