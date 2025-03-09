import { useParams } from 'react-router-dom'
import { getGroupById } from '../services/groupService'
import PageContainer from '../components/layout/PageContainer'
import PageHeader from '../components/layout/PageHeader'
import MemberList from '../components/groups/MemberList'
import NotFound from '../components/common/NotFound'

const GroupDetails = () => {
    const { id } = useParams()
    const group = getGroupById(id)

    if (!group) {
        return (
            <PageContainer>
                <PageHeader backLink="/" />
                <NotFound type="Group" />
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <PageHeader 
                title={group.name}
                subtitle={`${group.members.length} members`}
                backLink="/"
            />

            <div className="p-4">
                <MemberList members={group.members} />
            </div>
        </PageContainer>
    )
}

export default GroupDetails 