/* @my/ui is wrapper for tamagui. Any component in tamagui can be imported through @my/ui
use result = await API.get(url) or result = await API.post(url, data) to send requests
API.get/API.post will return a PendingResult, with properties like isLoaded, isError and a .data property with the result
if you call paginated apis, you will need to wait for result.isLoaded and look into result.data.items, since result.data is an object with the pagination.
Paginated apis return an object like: {"itemsPerPage": 25, "items": [...], "total": 20, "page": 0, "pages": 1}
*/

import { Protofy, API } from 'protobase'
import { PaginatedDataSSR } from 'protolib/lib/SSR'
import { Objects } from '../bundles/objects'
import { DataView } from 'protolib/components/DataView'
import { AdminPage } from 'protolib/components/AdminPage'
import { Tag } from '@tamagui/lucide-icons'
import { context } from '../bundles/uiContext'
import { useRouter } from 'solito/navigation'

const Icons =  {}
const isProtected = Protofy("protected", true)
const permissions = isProtected?Protofy("permissions", ["admin"]):null
const {name, prefix} = Objects.activityLogs.getApiOptions()
const apiUrl = prefix + name

Protofy("object", "activitylogs")

export default {
    route: Protofy("route", "/activityLogs"),
    component: ({pageState, initialItems, pageSession, extraData}:any) => {
        return (<AdminPage title="ActivityLogs" pageSession={pageSession}>
            <DataView
                rowIcon={Tag}
                sourceUrl={apiUrl}
                initialItems={initialItems}
                numColumnsForm={1}
                hideAdd={true}
                name="ActivityLogs"
                model={Objects.activityLogs } 
                pageState={pageState}
                icons={Icons}
                hideFilters={false}
            />
        </AdminPage>)
    }
}