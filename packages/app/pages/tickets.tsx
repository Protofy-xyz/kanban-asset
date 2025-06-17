import { useEffect, useState } from 'react'
import { Protofy, API, z } from 'protobase'
import { DataView } from 'protolib/components/DataView'
import { AdminPage } from 'protolib/components/AdminPage'
import { Tag } from '@tamagui/lucide-icons'
import { context } from '../bundles/uiContext'
import { TicketsModel } from '../../../data/objects/tickets'
import { Button, Text, TextArea, useToastController, XStack, Circle } from '@my/ui'
import { Tinted } from 'protolib/components/Tinted'
import { usePageParams } from 'protolib/next'
import { EditableText } from 'app/components/ContentEditable'
import { TicketsSequenceCard } from 'app/components/TicketsSequenceCard'
import { TicketsSequenceBottom } from 'app/components/TicketsSequenceBottom'
import { TicketsTagsSelect } from 'app/components/TicketsTagsSelect'
import { useSearchParams, useRouter } from 'next/navigation'
import { DataTable2 } from 'protolib/components/DataTable2'
import { Chip } from 'protolib/components/Chip'
import { ActivityLogs } from 'app/components/ActivityLogs'
import { CollaboratorsSelector } from 'app/components/CollaboratorsSelector'
import { CollaboratorImage } from 'app/components/CollaboratorImage'
import { MultiSelectListPopover } from 'app/components/MultiSelectListPopover'
import { SelectList } from 'protolib/components/SelectList'
import Editable from 'react-contenteditable';

const Icons = {}
const isProtected = Protofy("protected", true)
const permissions = isProtected ? Protofy("permissions", ["admin"]) : null
const { name, prefix } = TicketsModel.getApiOptions()
const apiUrl = prefix + name

Protofy("object", "tickets")
// Protofy("pageType", "admin")

const ContentEditable = ({ ...props }: any) => <Editable
    style={{ border: '2px dashed var(--blue8)' }}
    {...props}
/>

const textComponent = ({ placeholder = "Text here", ...props }) => (path, data, setData, mode, originalData, setFormData) => {
    const [initialText, setInitialText] = useState(data)

    return <Text fos="$4" fow="400" f={1} {...props}>
        <EditableText
            style={{ boxShadow: "0px 0px 0px 0px var(--color)", flex: 1, padding: "8px" }}
            placeholder={placeholder}
            placeholderStyle={{ fontWeight: "500" }}
            onFocus={e => {
                e.currentTarget.style.boxShadow = "0px 0px 0px 1px var(--color)"
                e.currentTarget.style.borderRadius = "5px"
            }}
            onBlur={e => {
                const newText = e.target.textContent
                if (!newText || !(newText.length > 0)) {
                    setData(initialText)
                } else {
                    setInitialText(newText)
                    setData(newText)
                }
                e.currentTarget.style.boxShadow = "0px 0px 0px 0px var(--color)"
            }}
            editable={true}
            onChange={e => setData(e.target.value)}
        >
            {data ?? ''}
        </EditableText>
    </Text>
}

export default {
    route: Protofy("route", "/admin/tickets"),
    component: ({ pageState, initialItems, pageSession, extraData }: any) => {

        const [addCardVisible, setAddCardVisible] = useState("")
        const [tagsList, setTagsList] = useState([])
        const [collaboratorsList, setCollaboratorsList] = useState([])

        const router = useRouter()
        const toast = useToastController()
        const { query, push, removePush, mergePush } = usePageParams(pageState)
        const searchParams = useSearchParams()
        const queryTags = searchParams.getAll('tags')
        const selectedTagsData = tagsList.filter(p => queryTags.includes(p.name))

        const onToggleTag = (tag: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (queryTags.includes(tag)) { // remove tag
                const updatedTags = queryTags.filter(t => t !== tag)
                params.delete('tags')
                updatedTags.forEach(t => params.append('tags', t))
            } else { // add tag
                params.append('tags', tag)
            }

            router.push(`?${params.toString()}`)
        }

        const getData = async () => {
            try {
                const tagsRes = await API.get("/api/v1/tags")
                const tags = tagsRes?.data?.items ?? []
                setTagsList(tags)
            } catch (e) {
                console.error(e)
                toast.show("Error getting tags", { tint: "red" })
            }
            try {
                const accountsRes = await API.get("/api/core/v1/accounts")
                const accounts = accountsRes?.data?.items ?? []
                setCollaboratorsList(accounts)
            } catch (e) {
                console.error(e)
                toast.show("Error getting tags", { tint: "red" })
            }
        }

        useEffect(() => {
            getData()
        }, [])

        return (<AdminPage title="Tickets" pageSession={pageSession}>
            <DataView
                rowIcon={Tag}
                sourceUrl={apiUrl}
                sourceUrlParams={query}
                initialItems={initialItems}
                numColumnsForm={2}
                name="Tickets"
                model={TicketsModel}
                defaultView='sequence'
                disableViews={["grid", "raw"]}
                objectProps={{ title: "" }}
                pageState={pageState}
                icons={Icons}
                hideFilters={false}
                extraFieldsForms={{
                    "activity": z.array(z.any()).optional().size(2).after("priority"),
                }}
                customFieldsForms={{
                    "title": {
                        hideLabel: true,
                        component: textComponent({ placeholder: "Title here...", fos: "$6", fow: "600" })
                    },
                    "tags": {
                        hideLabel: false,
                        component: (path, data, setData, mode, originalData, setFormData) => {
                            return <TicketsTagsSelect data={data} setData={setData} tagsList={tagsList} />
                        }
                    },
                    "description": {
                        hideLabel: false,
                        component: textComponent({ placeholder: "Description here..." })
                    },
                    "collaborators": {
                        hideLabel: false,
                        component: (path, data, setData, mode, originalData, setFormData) => {
                            return <CollaboratorsSelector data={data} setData={setData} list={collaboratorsList} />
                        }
                    },
                    "status": {
                        hideLabel: true,
                        component: (path, data, setData, mode, originalData, setFormData) => {
                            const onArchive = () => {
                                setFormData("archived", !originalData.archived)
                            }

                            return <XStack jc="space-between" ai="center" f={1}>
                                <XStack gap="$2" ai="center" f={1}>
                                    {TicketsModel.getStatusList().map((status) => <Tinted tint={TicketsModel.getStatusTheme(status) ?? "gray"}>
                                        <Button
                                            size="$1"
                                            br="100px"
                                            hoverStyle={{ elevation: 5, scale: 1.01 }} pressStyle={{ elevation: 0.01 }}
                                            onPress={() => setData(status)}
                                            bc={data == status ? "$color6" : "transparent"}
                                            gap="$0"
                                            px="$2"
                                        >
                                            <Circle size={10} bc={"$color8"} />{status}
                                        </Button></Tinted>)}
                                </XStack>
                            </XStack>
                        }
                    },
                    "priority": {
                        hideLabel: false,
                        component: (path, data, setData, mode, originalData, setFormData) => {
                            const isSelected = (p) => {
                                return data == p
                            }
                            const onSelect = (p) => {
                                if (isSelected(p)) {
                                    setData(undefined)
                                } else {
                                    setData(p)
                                }
                            }

                            return <Tinted>
                                <XStack gap="$2" ai="center" f={1}>
                                    {TicketsModel.getPriorityList().map((p) => <div title={p}><Button
                                        hoverStyle={{ elevation: 5, scale: 1.01 }} pressStyle={{ elevation: 0.01 }}
                                        onPress={() => onSelect(p)}
                                        bc={isSelected(p) ? "$color7" : "$color4"}
                                        circular
                                    >
                                        {TicketsModel.getPriorityIcon(p)}
                                    </Button></div>)}
                                </XStack>
                            </Tinted>
                        }
                    },
                    "points": {
                        hideLabel: false,
                        component: (path, data, setData, mode, originalData, setFormData) => {
                            const isSelected = (p) => {
                                return data == p
                            }
                            const onSelect = (p) => {
                                if (isSelected(p)) {
                                    setData(undefined)
                                } else {
                                    setData(p)
                                }
                            }

                            return <Tinted>
                                <XStack gap="$2" ai="center" pt="$3" f={1}>
                                    {TicketsModel.getFibonacciList().map((p) => <Button
                                        hoverStyle={{ elevation: 5, scale: 1.01 }} pressStyle={{ elevation: 0.01 }}
                                        onPress={() => onSelect(p)}
                                        bc={isSelected(p) ? "$color7" : "$color4"}
                                        height={30}
                                        br="100px"
                                    >
                                        {p}
                                    </Button>)}
                                </XStack>
                            </Tinted>
                        }
                    },
                    "activity": {
                        hideLabel: false,
                        component: (path, data, setData, mode, originalData, setFormData) => <ActivityLogs ticketId={originalData.id} ticket={originalData} pageSession={pageSession} />
                    }
                }}
                dataSequenceProps={{
                    getCard: (item) => <TicketsSequenceCard item={item} onSelectItem={(item) => push("item", item.id)} />,
                    onDragEnd: (data) => {
                        if (data.error) {
                            return toast.show(data.message, { tint: "red" })
                        }
                    },
                    getStageContainerProps: (stage) => ({ theme: TicketsModel.getStatusTheme(stage) }),
                    getStageBottom: (stage) => {
                        const onCreateTicket = async (ticketTitle) => {
                            if (ticketTitle == "") return setAddCardVisible("")

                            let newTicket = {
                                title: ticketTitle,
                                status: stage,
                                tags: [],
                                collaborators: [],
                            }

                            if (selectedTagsData.length > 0) {
                                newTicket["tags"] = selectedTagsData
                            }

                            await API.post(apiUrl, newTicket)
                            setAddCardVisible("")
                        }

                        return <TicketsSequenceBottom
                            stage={stage}
                            cardVisible={addCardVisible == stage}
                            onChangeCardVisible={setAddCardVisible}
                            onCreate={onCreateTicket}
                        />
                    },
                }}
                columns={DataTable2.columns(
                    DataTable2.column("title", row => <Text>{row.title}</Text>, "title", null, true, "300px"),
                    DataTable2.column("description", row => <Text numberOfLines={3} my="5px">{row.description}</Text>, "description", null, true, "400px"),
                    DataTable2.column("status", row => <Chip bc="$color6" theme={TicketsModel.getStatusTheme(row.status)} text={row.status} />, "status"),
                    DataTable2.column("tags", row => <XStack gap="$1.5">{row.tags
                        ? <>
                            {row.tags?.map(t => <Chip bc={t.color} text={t.name} />)}
                        </>
                        : null}</XStack>
                        , "tags", null, null, "200px"),
                    DataTable2.column("points", row => row.points ? <Chip theme="purple" text={row.points} /> : null, "points"),
                    DataTable2.column("collaborators", row => <XStack gap="$1.5">{row.collaborators
                        ? <>
                            {row.collaborators?.map(c => <CollaboratorImage username={c.id?.username} />)}
                        </>
                        : null}</XStack>
                        , "collaborators", null, null, "200px")
                )}
                extraFilters={
                    [
                        {
                            component: (value, setFilter) => {
                                return <SelectList
                                    title={"Collaborator"}
                                    value={value ?? "no_selected"}
                                    elements={[{ caption: "All collaborators", value: "no_selected" }].concat(collaboratorsList.map(p => ({ caption: p.username, value: p.username })))}
                                    onValueChange={val => {
                                        if (val === "no_selected") {
                                            setFilter(undefined)
                                        } else {
                                            setFilter(val)
                                        }
                                    }}
                                />
                            },
                            queryParam: "collaborator"
                        },
                        {
                            component: (value, setFilter) => {
                                return <MultiSelectListPopover
                                    list={tagsList.map(t => t.name) ?? []}
                                    values={queryTags}
                                    onToggle={onToggleTag}
                                    triggerProps={{ height: "36px" }}
                                />
                            },
                            queryParam: "tags"
                        }
                    ]
                }
            />
        </AdminPage>)
    }
}