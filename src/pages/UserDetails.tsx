import { useParams } from 'react-router-dom'
import { FC } from 'react'
import { getUserById } from '../services/groupService'
import PageContainer from '../components/layout/PageContainer'
import PageHeader from '../components/layout/PageHeader'
import UserProfile from '../components/users/UserProfile'
import ContactInfo from '../components/users/ContactInfo'
import NotFound from '../components/common/NotFound'

interface ExtendedUser {
    id: string;
    name: string;
    email: string;
    groupId: string;
    groupName: string;
}

const UserDetails: FC = () => {
    const params = useParams();
    const id = params.id || '';
    const user = getUserById(id) as ExtendedUser | null

    if (!user) {
        return (
            <PageContainer>
                <PageHeader backLink="/" />
                <NotFound type="User" />
            </PageContainer>
        )
    }

    return (
        <PageContainer>
            <PageHeader 
                backLink={`/group/${user.groupId}`}
                backText={`Back to ${user.groupName}`}
            />

            <div className="p-6">
                <UserProfile user={user} />
                <ContactInfo email={user.email} />
            </div>
        </PageContainer>
    )
}

export default UserDetails 