const { nanoid } = require("nanoid");
const { dynamoDb } = require("../lib/dyno-client")

exports.handler = async (event, context) => {
    const TABLE_NAME = 'CadutaLibera';
    try {
        //const body = JSON.parse(event.body);
        let result = await deleteItems(TABLE_NAME, '0');
        const itemsToWrite = [
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' },
            { word: 'aa%a', def: 'aaaaaaa aaaaa' }
        ];
        result = await writeItems(TABLE_NAME, '0', itemsToWrite);
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

async function deleteItems(tableName, userId) {

    const queryParams = {
        TableName: tableName,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: { ':userId': userId },
    };

    const queryResults = await dynamoDb.query(queryParams).promise()
    if (queryResults.Items && queryResults.Items.length > 0) {

        const batchCalls = chunks(queryResults.Items, 25).map(async (chunk) => {
            const deleteRequests = chunk.map(item => {
                return {
                    DeleteRequest: {
                        Key: {
                            'userId': item.userId,
                            'uid': item.uid,

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
}

async function writeItems(tableName, userId, putItems) {
    const batchCalls = chunks(putItems, 25).map(async (chunk) => {
        const putRequests = chunk.map(item => {
            return {
                PutRequest: {
                    Item: {
                        userId: userId,
                        uid: nanoid(10),
                        word: item.word,
                        def: item.def,
                        createDate: new Date().toISOString(),
                        useDate: new Date().toISOString()
                    }
                }
            }
        })
        const batchWriteParams = {
            RequestItems: {
                [tableName]: putRequests
            }
        }
        await dynamoDb.batchWrite(batchWriteParams).promise()
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