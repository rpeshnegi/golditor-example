/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { Box, Container, Typography } from '@material-ui/core';
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import { useDispatch } from 'react-redux';
import PageContainer from '../../components/container/PageContainer';
import axiosInstance from '../../utils/axios';
import { SHOW_SNACKBAR_ERROR } from '../../redux/constants';

export default function SocialMedia() {
    const location = useLocation();
    const dispatch = useDispatch();
    const query = new URLSearchParams(location.search);
    const navigate = useNavigate()
    const [authType, setAuthType] = useState('');

    useEffect(() => {
        if (localStorage.getItem('TIKTOK_STATE') === query.get('state')) {
            setAuthType('TikTok')
            axiosInstance.get(`/custom_api/tiktok/access_token_url?code=${query.get('code')}`).then((result) => {
                console.log(result)
                if (JSON.stringify(result.data.success)) {
                    localStorage.removeItem('TIKTOK_STATE')
                    localStorage.setItem('TIKTOK_AUTH', JSON.stringify(result.data.data))
                } else {
                    dispatch({
                        type: SHOW_SNACKBAR_ERROR,
                        payload: { msg: 'Some error has been occured. Please try again.', error: true }
                    })
                }
                navigate(localStorage.getItem('FALLBACK_URL'))
            })
        } else if (query.get('oauth_token')) {
            setAuthType('Twitter')
            axiosInstance.get(`/custom_api/twitter/access_token?oauth_token=${query.get('oauth_token')}&oauth_verifier=${query.get('oauth_verifier')}`).then((result) => {
                console.log(result)
                localStorage.setItem('TWITTER_AUTH', JSON.stringify(result.data.data))
                navigate(localStorage.getItem('FALLBACK_URL'))
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
