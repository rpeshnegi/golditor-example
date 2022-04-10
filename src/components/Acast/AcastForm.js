import React, { useEffect, useState } from 'react';
import {
    Grid, Button, IconButton, CircularProgress, Stack
} from '@material-ui/core';
import * as Yup from 'yup';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import CustomErrorMessage from '../forms/custom-elements/CustomErrorMessage';
import CustomFormLabel from '../forms/custom-elements/CustomFormLabel';
import CustomSelect from '../forms/custom-elements/CustomSelect';
import axiosInstance from '../../utils/axios';
import { ADD_SNACKBAR_MSG, SHOW_SNACKBAR_ERROR } from '../../redux/constants';
import CustomTextField from '../forms/custom-elements/CustomTextField';

const validations = Yup.object().shape({
    audio: Yup.number().required('Required'),
    api_key: Yup.string().required('Required'),
    title: Yup.string().required('Required')
});
// Buffer.from(str, 'base64') andbuf.toString('base64')
export default function AcastForm({ moduleData, mediaFiles, saveSocialAuthData }) {
    const [isSubmitting, setIsSubmitting] = useState(null);
    const ACAST_AUTH = useSelector((state) => state.SocialAuthReducer.acast);
    const [mediaToShare, setMediaToShare] = useState(null);
    const [showsList, setShowsList] = useState([]);
    const dispatch = useDispatch();

    const initialValues = {
        post_id: moduleData.id,
        api_key: '',
        show_id: '',
        title: moduleData.title,
        subtitle: moduleData.content,
        audio: ''
    };

    const getShows = (apiKey) => {
        axiosInstance.get(`/custom_api/acast/get_shows?api_key=${apiKey}`).then((result) => {
            setShowsList(result.data.data.data)
            if (!ACAST_AUTH) saveSocialAuthData('acast', { api_key: apiKey })
            // setAcastAuth(apiKey)
        }).catch((error) => {
            console.log(error.response);
            saveSocialAuthData('acast', null)
            // setAcastAuth(null)
            // localStorage.removeItem('ACAST_AUTH')
            dispatch({
                type: SHOW_SNACKBAR_ERROR,
                payload: { msg: error.response.data?.data?.data, error: true }
            })
        })
    }

    useEffect(() => {
        if (ACAST_AUTH) {
            getShows(ACAST_AUTH.api_key)
        }
        return () => { };
    }, [ACAST_AUTH])

    const handleSubmit = (values) => {
        setIsSubmitting(true)
        axiosInstance.post(`/custom_api/acast/upload_show`, values).then(() => {
            setIsSubmitting(false)
            dispatch({
                type: ADD_SNACKBAR_MSG,
                payload: `Podcast has been publsihed successfully.`
            })
        }).catch((error) => {
            console.log(error.response);
            setIsSubmitting(false)
            dispatch({
                type: SHOW_SNACKBAR_ERROR,
                payload: { msg: error.response.data.data.data.message, error: true }
            })
        })
    }

    const saveKey = (values) => {
        if (!values.api_key) {
            alert('Please enter API key.')
        } else {
            getShows(values.api_key)
        }
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validations}
            onSubmit={handleSubmit}
        >
            {({ values, handleChange }) => (
                <Form>
                    {!ACAST_AUTH &&
                        <Grid container spacing={3}>
                            <Grid item lg={2} md={4} sm={4}>
                                <CustomFormLabel htmlFor="api_key" sx={{
                                    mt: 0,
                                }}>API key</CustomFormLabel>
                                <Field name="api_key" type="password" id="api_key" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="API key" />
                                <ErrorMessage name="api_key" component={CustomErrorMessage} />
                            </Grid>
                            <Grid item lg={2} md={4} sm={4}>
                                <Button variant="contained" color="primary" type="button"
                                    onClick={() => saveKey(values)}
                                    sx={{
                                        mr: 1,
                                        mt: 3
                                    }}>
                                    Save key
                                </Button>
                            </Grid>
                        </Grid>
                    }
                    <Grid container spacing={3} sx={{
                        mt: 0,
                    }}>
                        <Grid item lg={4} md={6} sm={6}>
                            <CustomFormLabel sx={{
                                mt: 0,
                            }}
                                htmlFor="show_id">Shows:</CustomFormLabel>
                            <Field name="show_id" id="show_id" variant="outlined" fullWidth size="small"
                                menuitems={showsList
                                    // eslint-disable-next-line no-underscore-dangle
                                    .map(item => ({ value: item._id, title: item.title })
                                    )}
                                as={CustomSelect}
                            />
                            <ErrorMessage name="show_id" component={CustomErrorMessage} />
                        </Grid>
                        <Grid item lg={4} md={6} sm={12} >
                            <CustomFormLabel
                                sx={{
                                    mt: 0,
                                }}
                                htmlFor="title">Title</CustomFormLabel>
                            <Field name="title" id="acast_title" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Title" />
                            <ErrorMessage name="title" component={CustomErrorMessage} />
                        </Grid>
                        <Grid item lg={4} md={6} sm={12} >
                            <CustomFormLabel
                                sx={{
                                    mt: 0,
                                }}
                                htmlFor="subtitle">Subtitle</CustomFormLabel>
                            <Field name="subtitle" id="subtitle" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="subtitle" />
                            <ErrorMessage name="subtitle" component={CustomErrorMessage} />
                        </Grid>
                        <Grid item lg={4} md={6} sm={6}>
                            <CustomFormLabel sx={{
                                mt: 0,
                            }}
                                htmlFor="fname-text">Podcast:</CustomFormLabel>
                            <Field name="audio" id="audio" variant="outlined" fullWidth size="small"
                                onChange={(event) => {
                                    handleChange(event)
                                    setMediaToShare(null)
                                    setTimeout(() => {
                                        setMediaToShare(mediaFiles.filter((item) => item.id === event.target.value)[0])
                                    }, 50)
                                }}
                                menuitems={mediaFiles
                                    .filter((item) => item.mime_type.includes('audio'))
                                    .map(item => ({ value: item.id, title: item.slug })
                                    )}
                                as={CustomSelect}
                            />
                            <ErrorMessage name="audio" component={CustomErrorMessage} />
                        </Grid>
                        {ACAST_AUTH &&
                            <>
                                <Grid item lg={4} md={6} sm={12}>
                                    <CustomFormLabel sx={{
                                        mt: 0,
                                    }}
                                        htmlFor="fname-text">Preview:</CustomFormLabel>
                                    <audio controls>
                                        <source src={mediaToShare?.source_url} type={mediaToShare?.mime_type} />
                                        <track kind="captions" />
                                        Your browser does not support the audio tag.
                                    </audio>
                                </Grid>
                                {mediaToShare &&
                                    <Grid item lg={2} md={2} sm={6}>
                                        <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }}>
                                            <Button variant="contained" color="primary" type="submit"
                                                disabled={isSubmitting}
                                                sx={{
                                                    mr: 1,
                                                    mt: 4
                                                }}>
                                                Share
                                            </Button>
                                            <IconButton
                                                aria-label="close"
                                                color="inherit"
                                                size="small"
                                            >
                                                {isSubmitting && <CircularProgress />}
                                            </IconButton>
                                        </Stack>
                                    </Grid>
                                }
                                <Grid item lg={2} md={2} sm={6}>
                                    <Button variant="contained" color="primary" type="button"
                                        onClick={() => {
                                            saveSocialAuthData('acast', null)
                                            setMediaToShare(null)
                                            setShowsList([])
                                        }}
                                        sx={{
                                            mt: 4,
                                        }}>
                                        Remove key
                                    </Button>
                                </Grid>
                            </>
                        }
                    </Grid>
                </Form>
            )
            }
        </Formik >
    );
}