import { ActivityLogsModel } from "../../data/objects/activityLogs";
import { AutoActions, AutoAPI, getAuth, getServiceToken } from 'protonode'
import { API, Protofy, getLogger } from "protobase";
import { Application } from 'express';
import fs from 'fs'
import path from "path";

const root = path.join(process.cwd(), '..', '..')
const logger = getLogger()

Protofy("type", "AutoAPI")
Protofy("object", "activityLogs")
const {name, prefix} = ActivityLogsModel.getApiOptions()

const activityLogsAPI = AutoAPI({
    modelName: name,
    modelType: ActivityLogsModel,
    initialData: {},
    prefix: prefix
})

const activityLogsActions = AutoActions({
    modelName: name,
    modelType: ActivityLogsModel,
    prefix: prefix
})

export default Protofy("code", async (app:Application, context) => {
    activityLogsAPI(app, context)
    activityLogsActions(app, context)
    //you can add more apis here, like:
    /*
    app.get('/api/v1/test/activityLogs', (req, res) => {
        //you code goes here
        //reply with res.send(...)
    })
    */      
})