import { TagsModel } from "../../data/objects/tags";
import { AutoActions, AutoAPI, getAuth, getServiceToken } from 'protonode'
import { API, Protofy, getLogger } from "protobase";
import { Application } from 'express';
import fs from 'fs'
import path from "path";

const root = path.join(process.cwd(), '..', '..')
const logger = getLogger()

Protofy("type", "AutoAPI")
Protofy("object", "tags")
const {name, prefix} = TagsModel.getApiOptions()

const initialData = {
    "202504-031251-01251-6599d856": {
        "name": "bug",
        "color": "#eb9091",
        "id": "202504-031251-01251-6599d856"
    },
    "202504-031251-27956-226322f2": {
        "name": "hu",
        "color": "#5eb0ef",
        "id": "202504-031251-27956-226322f2"
    },
    "202504-031252-05649-15828e7e": {
        "name": "task",
        "color": "#5bb98c",
        "id": "202504-031252-05649-15828e7e"
    }
}

const tagsAPI = AutoAPI({
    modelName: name,
    modelType: TagsModel,
    initialData: initialData,
    prefix: prefix
})

const tagsActions = AutoActions({
    modelName: name,
    modelType: TagsModel,
    prefix: prefix
})

export default Protofy("code", async (app:Application, context) => {
    tagsAPI(app, context)
    tagsActions(app, context)
    //you can add more apis here, like:
    /*
    app.get('/api/v1/test/tags', (req, res) => {
        //you code goes here
        //reply with res.send(...)
    })
    */      
})