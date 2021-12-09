/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
    Grid, Button, Stack, Box, FormControl, RadioGroup, FormControlLabel, CircularProgress
} from '@material-ui/core';
import * as Yup from 'yup';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import { useDispatch } from 'react-redux';
import CustomErrorMessage from '../forms/custom-elements/CustomErrorMessage';
import CustomFormLabel from '../forms/custom-elements/CustomFormLabel';
import CustomTextField from '../forms/custom-elements/CustomTextField';
import axiosInstance from '../../utils/axios';
import { ADD_SNACKBAR_MSG, SHOW_SNACKBAR_ERROR } from '../../redux/constants';
import CustomRadio from '../forms/custom-elements/CustomRadio';
import CustomSelect from '../forms/custom-elements/CustomSelect';

const validations = Yup.object().shape({
    message: Yup.string().required('Required')
}).when((values, schema) => {
    if (values.postType === 'IMAGE' || values.postType === 'VIDEO') {
        return schema.shape({
            media: Yup.number().required('Required'),
        });
    }
    return schema.shape({});
});

export default function TwitterForm({ moduleData, mediaFiles }) {
    const TWITTER_AUTH = JSON.parse(localStorage.getItem('TWITTER_AUTH'))
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(null);
    const [mediaToShare, setMediaToShare] = useState(null);

    // console.log(mediaFiles)

    const initialValues = {
        message: `${moduleData.title}\n${moduleData.content}${moduleData.acf['golditor-tags']}`,
        postType: 'MSG',
        media: ''
    };

    useEffect(() => {
        return () => { };
    }, [])

    const makeTweet = (values, mediaIds = null) => {
        // eslint-disable-next-line no-param-reassign
        values.media_ids = mediaIds
        axiosInstance.post(`/custom_api/twitter/tweets?oauth_token=${TWITTER_AUTH.oauth_token}&oauth_token_secret=${TWITTER_AUTH.oauth_token_secret}`, values).then((result) => {
            setIsSubmitting(false)
            dispatch({
                type: ADD_SNACKBAR_MSG,
                payload: `Post has been publsihed successfully.`
            })
        }).catch((error) => {
            console.log(error.response);
            dispatch({
                type: SHOW_SNACKBAR_ERROR,
                payload: { msg: error.response.data.data.data.detail, error: true }
            })
        })
    }

    const checkVideoStatus = (data, formData) => {
        const postData = { media_id: data.media_id_string }
        axiosInstance.post(`/custom_api/twitter/check_media_status?oauth_token=${TWITTER_AUTH.oauth_token}&oauth_token_secret=${TWITTER_AUTH.oauth_token_secret}`, postData).then((result) => {
            if (result.data.data.processing_info && result.data.data.processing_info.check_after_secs) {
                setTimeout(() => {
                    checkVideoStatus(result.data.data, formData)
                }, (result.data.data.processing_info.check_after_secs * 1000))
            } else {
                makeTweet(formData, result.data.data.media_id_string)
            }
        }).catch((error) => {
            console.log(error.response);
        })
    }

    const uploadMedia = (values) => {
        axiosInstance.post(`/custom_api/twitter/upload_media?oauth_token=${TWITTER_AUTH.oauth_token}&oauth_token_secret=${TWITTER_AUTH.oauth_token_secret}`, values).then((result) => {
            if (result.data.data.processing_info && result.data.data.processing_info.check_after_secs) {
                setTimeout(() => {
                    checkVideoStatus(result.data.data, values)
                }, (result.data.data.processing_info.check_after_secs * 1000))
            } else {
                makeTweet(values, result.data.data.media_id_string)
            }
        }).catch((error) => {
            console.log(error.response);
            dispatch({
                type: SHOW_SNACKBAR_ERROR,
                payload: { msg: error.response.data.data.data.detail, error: true }
            })
        })
    }

    const handleSubmit = (values) => {
        setIsSubmitting(true)
        if (values.media && values.media !== '') {
            uploadMedia(values)
        } else {
            makeTweet(values)
        }

    }

    const getRequestToken = () => {
        localStorage.setItem('FALLBACK_URL', window.location.pathname + window.location.hash)
        const callBackUrl = encodeURIComponent(`${window.location.origin}/auth/social-media`)
        axiosInstance.get(`/custom_api/twitter/request_token?oauth_callback=${callBackUrl}`).then((result) => {
            console.log(result)
            window.location.href = result.data.data.oauth_url
        })
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validations}
            onSubmit={handleSubmit}
        >
            {({ values, setFieldValue, handleChange }) => (
                <Form>
                    <Grid container spacing={3}>
                        <Grid item lg={2} md={6} sm={6}>
                            {TWITTER_AUTH ?
                                <>
                                    <CustomFormLabel sx={{
                                        mt: 0,
                                    }} htmlFor="content">User</CustomFormLabel>
                                    <Box>
                                        {TWITTER_AUTH.screen_name}
                                    </Box>
                                </>
                                :
                                <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }}>
                                    <Button variant="contained" color="primary" type="button"
                                        onClick={getRequestToken}
                                        sx={{
                                            mr: 1,
                                        }}>
                                        Login
                                    </Button>
                                </Stack>
                            }
                        </Grid>
                        <Grid item lg={4} md={12} sm={12}>
                            <CustomFormLabel sx={{
                                mt: 0,
                            }} htmlFor="content">Content</CustomFormLabel>
                            <Field multiline
                                rows={4} name="message" id="message" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Description" />
                            <ErrorMessage name="message" component={CustomErrorMessage} />
                        </Grid>
                        <Grid item lg={4} md={12} sm={12}>
                            {/* <CustomFormLabel sx={{
                                mt: 0,
                            }} htmlFor="hashtags">Tags</CustomFormLabel>
                            <Field multiline
                                rows={4} name="hashtags" id="hashtags" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Tags" />
                            <ErrorMessage name="hashtags" component={CustomErrorMessage} /> */}
                        </Grid>
                        <Grid item lg={3} md={6} sm={12}>
                            <FormControl component="fieldset">
                                <RadioGroup
                                    aria-label="postType"
                                    name="postType"
                                    value={values.postType}
                                    onChange={(event) => {
                                        handleChange(event)
                                        setMediaToShare(null)
                                        setFieldValue('media', '')
                                    }}
                                >
                                    <FormControlLabel
                                        value="MSG"
                                        control={<CustomRadio />}
                                        label="Content"
                                    />
                                    <FormControlLabel
                                        value="IMAGE"
                                        control={<CustomRadio />}
                                        label="Photo with Content"
                                    />
                                    <FormControlLabel
                                        value="VIDEO"
                                        control={<CustomRadio />}
                                        label="Video with Content"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                        {values.postType === 'IMAGE' &&
                            <Grid item lg={3} md={6} sm={6} xs={12}>
                                <CustomFormLabel sx={{
                                    mt: 0,
                                }}
                                    htmlFor="fname-text">Image:</CustomFormLabel>
                                <Field name="media" id="media" variant="outlined" fullWidth size="small"
                                    onChange={(event) => {
                                        handleChange(event)
                                        setMediaToShare(mediaFiles.filter((item) => item.id === event.target.value)[0])
                                    }}
                                    menuitems={mediaFiles
                                        .filter((item) => item.mime_type.includes('image'))
                                        .map(item => ({ value: item.id, title: item.slug })
                                        )}
                                    as={CustomSelect}
                                />
                                <ErrorMessage name="media" component={CustomErrorMessage} />
                            </Grid>
                        }
                        {values.postType === 'VIDEO' &&
                            <Grid item lg={3} md={6} sm={6}>
                                <CustomFormLabel sx={{
                                    mt: 0,
                                }}
                                    htmlFor="fname-text">Video:</CustomFormLabel>
                                <Field name="media" id="media" variant="outlined" fullWidth size="small"
                                    onChange={(event) => {
                                        handleChange(event)
                                        setMediaToShare(null)
                                        setTimeout(() => {
                                            setMediaToShare(mediaFiles.filter((item) => item.id === event.target.value)[0])
                                        }, 50)
                                    }}
                                    menuitems={mediaFiles
                                        .filter((item) => item.mime_type.includes('video'))
                                        .map(item => ({ value: item.id, title: item.slug })
                                        )}
                                    as={CustomSelect}
                                />
                                <ErrorMessage name="media" component={CustomErrorMessage} />
                            </Grid>
                        }
                        <Grid item lg={4} md={6} sm={12}>
                            <CustomFormLabel sx={{
                                mt: 0,
                            }}
                                htmlFor="fname-text">Preview:</CustomFormLabel>
                            {mediaToShare && mediaToShare.mime_type.includes('video') ?
                                <video width="250" height="150" controls>
                                    <source src={mediaToShare.source_url} type={mediaToShare.mime_type} />
                                    <track kind="captions" />
                                    Your browser does not support the video tag.
                                </video>
                                :
                                <img style={{ width: '100%', maxWidth: 180 }} alt={mediaToShare?.title.raw} src={mediaToShare?.source_url} />
                            }
                        </Grid>
                        {TWITTER_AUTH &&
                            <Grid item lg={2} md={6} sm={6} m='auto'>
                                <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }}>
                                    <Button variant="contained" color="primary" type="submit"
                                        disabled={isSubmitting}
                                        sx={{
                                            mr: 1,
                                        }}>
                                        Tweet
                                    </Button>
                                    {isSubmitting && <CircularProgress />}
                                    {/* <Button variant="contained" color="primary" type="button"
                                    sx={{
                                        mr: 1,
                                    }}>
                                    <a className="twitter-share-button"
                                        target="_blank" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(values.message)}&hashtags=${values.hashtags.replaceAll('#', '')}`} rel="noreferrer">
                                        Tweet</a>
                                </Button> */}
                                </Stack>
                            </Grid>
                        }
                    </Grid>
                </Form>
            )}
        </Formik>
    );
}