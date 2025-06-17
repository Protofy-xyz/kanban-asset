import { YStack, XStack, Text } from "@my/ui"
import { Briefcase, Text as TextIcon } from "@tamagui/lucide-icons"
import { TicketsModel } from "../../../data/objects/tickets"
import { Chip } from "protolib/components/Chip"
import { CollaboratorImage } from "./CollaboratorImage"

export const TicketsSequenceCard = ({ item, onSelectItem }) => {
    const ticketModel = new TicketsModel(item)

    return <YStack
        onPress={() => onSelectItem(item)}
        p="$3"
        py="$2.5"
        br="$4"
        bc="$backgroundStrong"
        boc="$gray4"
        bw="$0.5"
        hoverStyle={{ elevation: 5, scale: 1.01 }}
        pressStyle={{ elevation: 0.01 }}
        animation="bouncy"
        transition='all 0.2s'
        opacity={item.archived ? 0.6 : 1}
    >
        <XStack gap="$2" mb="$2" flexWrap='wrap' ai="center">
            {ticketModel?.get("tags")?.map((tag, i) => <Chip bc={tag.color} height="$1" br="$2" px="$2" key={i} text={tag.name} />)}
        </XStack>
        <Text fos="$4" lineHeight="$1">
            {ticketModel.get("title")}
        </Text>
        {ticketModel.get("description") && <div title={ticketModel.get("description")}><TextIcon mt="$1" color="$gray9" size={16} /></div>}
        {item.project?.name && <XStack gap="$2" mt="$2" ai="center">
            <Briefcase size={16} />
            <Text fos="$4">
                {ticketModel.get("project")?.name}
            </Text>
        </XStack>}
        {ticketModel.get("priority") && <XStack gap="$2" mt="$2" ai="center">
            <Text fos="$4">
                {ticketModel.getPriorityIcon() + " " + ticketModel.get("priority")}
            </Text>
        </XStack>}
        <XStack mt="$2" ai="center" jc="space-between">
            {item.points && <Chip height={"26px"} theme="purple" text={item.points} />}
            <XStack gap="$2" ai="center">
                {
                    ticketModel.get("collaborators")?.map(c => <CollaboratorImage key={c.id?.username ?? " "} username={c.id?.username ?? " "} />)
                }
            </XStack>
        </XStack>
    </YStack>
}