import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@material-ui/core';
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';
import PageContainer from '../../components/container/PageContainer';
import axiosInstance from '../../utils/axios';
import { SHOW_SNACKBAR_ERROR } from '../../redux/constants';

export default function SocialMedia() {
    const location = useLocation();
    const dispatch = useDispatch();
    const query = new URLSearchParams(location.search);
    const AUTH_USER = useSelector((state) => state.UserReducer.user);
    const navigate = useNavigate()
    const [authType, setAuthType] = useState('');

    const saveSocialAuthData = (type, data) => {
        axiosInstance.get(`/wp/v2/golditor-projects/${query.get('project_id')}`).then((result) => {
            const project = result.data
            const projectSocialAuthData = { ...JSON.parse(project.social_auth_details), ...{ [type]: data } }
            const postData = {
                id: project.id,
                title: project.title.rendered,
                author: AUTH_USER.id,
                fields: { social_auth_details: JSON.stringify(projectSocialAuthData) },
            };
            axiosInstance.post(`/wp/v2/golditor-projects/${project.id}`, postData).then(() => {
                navigate(localStorage.getItem('FALLBACK_URL'))
            }).catch((error) => {
                console.log(error);
            })
        })

    }

    useEffect(() => {
        if (query.get('state') && localStorage.getItem('TIKTOK_STATE') === query.get('state')) {
            setAuthType('TikTok')
            axiosInstance.get(`/custom_api/tiktok/access_token_url?code=${query.get('code')}`).then((result) => {
                if (JSON.stringify(result.data.success)) {
                    localStorage.removeItem('TIKTOK_STATE')
                    saveSocialAuthData('tiktok', result.data.data)
                } else {
                    dispatch({
                        type: SHOW_SNACKBAR_ERROR,
                        payload: { msg: 'Some error has been occured. Please try again.', error: true }
                    })
                }
            })
        } else if (query.get('oauth_token')) {
            setAuthType('Twitter')
            axiosInstance.get(`/custom_api/twitter/access_token?oauth_token=${query.get('oauth_token')}&oauth_verifier=${query.get('oauth_verifier')}`).then((result) => {
                saveSocialAuthData('twitter', result.data.data)
            })
        } else if (query.get('auth_type') === 'telegram') {
            setAuthType('Telegram')
            saveSocialAuthData('telegram', {
                id: query.get('id'),
                first_name: query.get('first_name'),
                last_name: query.get('last_name'),
                username: query.get('username'),
                photo_url: query.get('photo_url'),
                auth_date: query.get('auth_date'),
                hash: query.get('hash'),
            })
        }
        return () => { }
    }, [])

    return (
        <PageContainer title="Error" description="this is Error page">
            <Box
                display="flex"
                flexDirection="column"
                height="100vh"
                textAlign="center"
                justifyContent="center"
                sx={{ backgroundColor: '#e4f5ff' }}
            >
                <Container maxWidth="md">
                    <Typography
                        align="center"
                        variant="h4"
                        sx={{
                            pt: 1,
                            pb: 3,
                            color: (theme) =>
                                `${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(0, 0, 0, 0.87)'}`,
                        }}
                    >
                        {`Authenticating with ${authType}. Please wait......`}
                    </Typography>
                </Container>
            </Box>
        </PageContainer>
    )
}
