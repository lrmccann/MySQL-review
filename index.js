const express = require('express');
const mysqlx = require('@mysql/xdevapi');
const config = { user: "logan-test", password: "Allison401", schema: "test", tables: ["users", "comments", "posts"] }


const app = express();

var allTableData = []

app.get('/users', (req, res) => {
    mysqlx.getSession({ user: config.user, password: config.password })
        .then(async session => {
            const schema = await session.getSchema(config.schema);
            return schema.existsInDatabase()
                .then(exists => {
                    if (exists) {
                        return schema;
                    }
                    return session.createSchema(config.schema);
                })
                .then(schema => {
                    // console.log(schema , "Schema options")
                    return schema.getTables(config.tables)
                })
                .then(async tables => {
                    tables.forEach(async (index) => {
                        const allTableNames = index.getName() // comments, posts, users
                        const getCollections = index.select()
                            .execute()
                            .then(async sendMe => {
                                const toArray = await sendMe.getResults()
                                const idk = await toArray.forEach(index => {
                                    index.forEach(async indexTwo => {
                                        var finalThing = indexTwo.decode()
                                        allTableData.push(finalThing)
                                    })
                                })
                            })
                    })
                })
        })
        .then(function thisFunc() {
            const newVar = allTableData
            // console.log(newVar.length)
            setTimeout(() => {
                if (newVar.length == 0) {
                    thisFunc()
                } else {
                    // console.log(newVar)
                    res.send(newVar)
                }
            }, 3 * 80)
        })
        .catch((error) => {
            console.log(error)
        })
})

app.listen(3310, () => console.log('Server started'));
// http://localhost:3310/users