import React, { useEffect, useState } from 'react';
import {
    Grid, Button, Stack, CircularProgress
} from '@material-ui/core';
import * as Yup from 'yup';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import CustomErrorMessage from '../forms/custom-elements/CustomErrorMessage';
import CustomFormLabel from '../forms/custom-elements/CustomFormLabel';
import CustomSelect from '../forms/custom-elements/CustomSelect';
import axiosInstance from '../../utils/axios';
import { SHOW_SNACKBAR_ERROR } from '../../redux/constants';

const validations = Yup.object().shape({
    video: Yup.number().required('Required'),
});

export default function TikTokForm({ moduleData, mediaFiles, saveSocialAuthData }) {
    const [isSubmitting, setIsSubmitting] = useState(null);
    // const [TIKTOK_AUTH, setTiktokAuth] = useState(JSON.parse(localStorage.getItem('TIKTOK_AUTH')));
    const TIKTOK_AUTH = useSelector((state) => state.SocialAuthReducer.tiktok);
    const [mediaToShare, setMediaToShare] = useState(null);
    const dispatch = useDispatch();

    const initialValues = {
        post_id: moduleData.id,
        video: ''
    };

    useEffect(() => {
        return () => { };
    }, [])

    const login = () => {
        localStorage.setItem('FALLBACK_URL', window.location.pathname + window.location.hash)
        axiosInstance.get(`/custom_api/tiktok/get_oauth_url?project_id=${moduleData.acf['golditor-project'].ID}`).then((result) => {
            localStorage.setItem('TIKTOK_STATE', result.data.data.state)
            window.location.href = result.data.data.url
        })
    }

    const logout = () => {
        // localStorage.removeItem('TIKTOK_AUTH')
        // setTiktokAuth(null)
        saveSocialAuthData('tiktok', null)
    }

    const handleSubmit = (values) => {
        setIsSubmitting(true)
        axiosInstance.post(`/custom_api/tiktok/upload_media?open_id=${TIKTOK_AUTH.open_id}&access_token=${TIKTOK_AUTH.access_token}`, values).then(() => {
            // setIsSubmitting(false)
            // dispatch({
            //     type: ADD_SNACKBAR_MSG,
            //     payload: `Post has been publsihed successfully.`
            // })
        }).catch((error) => {
            console.log(error.response);
            dispatch({
                type: SHOW_SNACKBAR_ERROR,
                payload: { msg: error.response.data.data.data.message, error: true }
            })
        })
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validations}
            onSubmit={handleSubmit}
        >
            {({ handleChange }) => (
                <Form>
                    <Grid container spacing={3}>
                        <Grid item lg={3} md={6} sm={6}>
                            <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }}>
                                {TIKTOK_AUTH ?
                                    <>
                                        {isSubmitting && <CircularProgress />}
                                        <Button variant="contained" color="primary" type="button"
                                            onClick={logout}
                                            sx={{
                                                mr: 1,
                                            }}>
                                            Logout
                                        </Button>
                                    </> :
                                    <Button variant="contained" color="primary" type="button"
                                        onClick={login}
                                        sx={{
                                            mr: 1,
                                        }}>
                                        Login
                                    </Button>
                                }
                            </Stack>
                        </Grid>
                        <Grid item lg={4} md={6} sm={6}>
                            <CustomFormLabel sx={{
                                mt: 0,
                            }}
                                htmlFor="fname-text">Video:</CustomFormLabel>
                            <Field name="video" id="video" variant="outlined" fullWidth size="small"
                                onChange={(event) => {
                                    handleChange(event)
                                    setMediaToShare(null)
                                    setTimeout(() => {
                                        setMediaToShare(mediaFiles.filter((item) => item.id === event.target.value)[0])
                                    }, 50)
                                }}
                                menuitems={mediaFiles
                                    .filter((item) => item.mime_type.includes('video') || item.mime_type.includes('audio'))
                                    .map(item => ({ value: item.id, title: item.slug })
                                    )}
                                as={CustomSelect}
                            />
                            <ErrorMessage name="video" component={CustomErrorMessage} />
                        </Grid>
                        {mediaToShare &&
                            <>
                                <Grid item lg={3} md={6} sm={12}>
                                    <CustomFormLabel sx={{
                                        mt: 0,
                                    }}
                                        htmlFor="fname-text">Preview:</CustomFormLabel>
                                    <video width="250" height="150" controls>
                                        <source src={mediaToShare?.source_url} type={mediaToShare?.mime_type} />
                                        <track kind="captions" />
                                        Your browser does not support the video tag.
                                    </video>
                                </Grid>
                                <Grid item lg={2} md={4} sm={6}>
                                    <Button variant="contained" color="primary" type="submit"
                                        // disabled={isSubmitting}
                                        sx={{
                                            mr: 1,
                                        }}>
                                        Share
                                    </Button>
                                </Grid>
                            </>
                        }
                    </Grid>
                </Form>
            )}
        </Formik>
    );
}