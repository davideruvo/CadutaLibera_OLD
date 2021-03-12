const { dynamoDb, dbUtils } = require("../lib/dyno-client")

let autoId = 0;
exports.handler = async (event, context) => {
    try {
        let items = JSON.parse(event.body);
        items = items.filter(function (x) { return x.word !== '' && x.question !== ''; });//.slice(0, dbUtils.MaxBatchRows);
        let result = await appendItems('0', items);
        console.log(result);
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
async function appendItems(userid, items) {
    const batchCalls = dbUtils.ChunkData(items, 25).map(async (chunk) => {
        const putRequests = chunk.map(item => {
            return {
                PutRequest: {
                    Item: {
                        userid: userid,
                        qid: dbUtils.GetQuestionId(autoId++),
                        word: item.word,
                        question: item.question
                    }
                }
            }
        })
        const batchWriteParams = {
            RequestItems: {
                [dbUtils.TableName]: putRequests
            }
        }
        return await dynamoDb.batchWrite(batchWriteParams).promise();
    })
    return await Promise.all(batchCalls);
}