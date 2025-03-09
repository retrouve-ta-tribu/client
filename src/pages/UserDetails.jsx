import { useParams } from 'react-router-dom'
import { getUserById } from '../services/groupService'
import PageContainer from '../components/layout/PageContainer'
import PageHeader from '../components/layout/PageHeader'
import UserProfile from '../components/users/UserProfile'
import ContactInfo from '../components/users/ContactInfo'
import NotFound from '../components/common/NotFound'

const UserDetails = () => {
    const { id } = useParams()
    const user = getUserById(id)

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