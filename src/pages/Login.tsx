import { FC } from 'react'
import PageContainer from '../components/layout/PageContainer'
import PageHeader from '../components/layout/PageHeader'
import { GoogleLogin } from '@react-oauth/google';

const Login: FC = () => {

    const responseMessage = (response) => {
        console.log(response);
    };
    const errorMessage = (error) => {
        console.log(error);
    };

    return (
        <PageContainer>
            <PageHeader title="Login" />
            <GoogleLogin onSuccess={responseMessage} onError={errorMessage} />

            
        </PageContainer>
    )
}

export default Login 