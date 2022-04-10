/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
    Grid, Button, Stack, Box, CircularProgress, FormControl, RadioGroup, FormControlLabel, Checkbox, Avatar, IconButton
} from '@material-ui/core';
import * as Yup from 'yup';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import CustomErrorMessage from '../forms/custom-elements/CustomErrorMessage';
import CustomFormLabel from '../forms/custom-elements/CustomFormLabel';
import CustomSelect from '../forms/custom-elements/CustomSelect';
import CustomTextField from '../forms/custom-elements/CustomTextField';
import { ADD_SNACKBAR_MSG, SHOW_SNACKBAR_ERROR } from '../../redux/constants';
import CustomCheckbox from '../forms/custom-elements/CustomCheckbox';

const validations = Yup.object().shape({
    fbPageId: Yup.string().required('Required')
}).when((values, schema) => {
    // if (values.postType === 'PHOTO') {
    //     return schema.shape({
    //         image: Yup.number().required('Required'),
    //     });
    // }
    // if (values.postType === 'VIDEO') {
    //     return schema.shape({
    //         video: Yup.number().required('Required'),
    //     });
    // }
    // return schema.shape({});
});

export default function InstagramForm({ moduleData, mediaFiles, saveSocialAuthData }) {
    const dispatch = useDispatch();
    const FB_AUTH = useSelector((state) => state.SocialAuthReducer.fb);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mediaToShare, setMediaToShare] = useState([]);
    const [pageList, setPageList] = useState([]);
    const [pageOptionList, setPageOptionList] = useState([]);
    const [instaUser, setInstaUser] = useState(null);
    const [formData, setFormData] = useState(null);
    const [mediaUploaded, setMediaUploaded] = useState([]);
    const [mediaUploadError, setMediaUploadError] = useState([]);

    const initialValues = {
        fbPageId: '',
        caption: `${moduleData.title}\n${moduleData.content}${moduleData.acf['golditor-tags']}`,
        selectedMedia: [],
    };

    const getFbPages = () => {
        const url = `${process.env.REACT_APP_FB_API_URL}/me/accounts?access_token=${FB_AUTH.accessToken}`
        fetch(url)
            .then(response => response.json())
            .then(response => {
                if (!response.error) {
                    setPageList(response.data)
                    setPageOptionList(response.data.map(item => ({ value: item.id, title: item.name })))
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }
    useEffect(() => {
        if (FB_AUTH) { getFbPages() }
        return () => { }
    }, [FB_AUTH])

    const loadFBSdk = async () => {
        if (document.getElementById('fb-api')) return
        const script = document.createElement('script')
        script.src = 'https://connect.facebook.net/en_US/sdk.js'
        script.id = 'fb-api'
        script.onload = () => {
            window.FB.init({
                appId: process.env.REACT_APP_FB_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v12.0'
            });
            // window.FB.getLoginStatus((response) => {
            //     statusChangeCallback(response)
            // });
        }
        document.body.appendChild(script)
    }

    useEffect(() => {
        loadFBSdk()
        return () => { };
    }, [])

    const login = () => {
        window.FB.login((response) => {
            if (response.authResponse) {
                if (response.status === 'connected') {   // Logged into your webpage and Facebook.
                    saveSocialAuthData('fb', response.authResponse)
                } else {                                 // Not logged into your webpage or we are unable to tell.
                    saveSocialAuthData('fb', null)
                }
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, { scope: process.env.REACT_APP_FB_SCOPE });
    }

    const logout = () => {
        saveSocialAuthData('fb', null) // used FB user 
        window.FB.logout((response) => {
            console.log('FB-logout', response)
        });
    }

    const publishPost = (mediaRes) => {
        fetch(`${process.env.REACT_APP_FB_API_URL}/${instaUser}/media_publish?creation_id=${mediaRes.id}&access_token=${FB_AUTH.accessToken}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(publishRes => {
                setIsSubmitting(false)
                setFormData(null)
                if (publishRes.error) {
                    dispatch({
                        type: SHOW_SNACKBAR_ERROR,
                        payload: publishRes.error.message
                    })
                } else {
                    dispatch({
                        type: ADD_SNACKBAR_MSG,
                        payload: `Post has been publsihed successfully.`
                    })
                }
            })
            .catch((error) => {
                setIsSubmitting(false)
                console.error('Error:', error);
            });
    }

    const getCarousalStatus = (mediaRes) => {
        fetch(`${process.env.REACT_APP_FB_API_URL}/${mediaRes.id}?fields=status_code&access_token=${FB_AUTH.accessToken}`)
            .then(response => response.json())
            .then(statusRes => {
                if (statusRes.status_code === 'FINISHED') {
                    publishPost(mediaRes)
                } else if (statusRes.status_code === 'ERROR') {
                    dispatch({
                        type: SHOW_SNACKBAR_ERROR,
                        payload: 'Some error has been occured! Please read all requirements.'
                    })
                } else {
                    setTimeout(() => {
                        getCarousalStatus(mediaRes)
                    }, 20000)
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const getVideoStatus = (mediaRes, carousel) => {
        fetch(`${process.env.REACT_APP_FB_API_URL}/${mediaRes.id}?fields=status_code&access_token=${FB_AUTH.accessToken}`)
            .then(response => response.json())
            .then(statusRes => {
                if (statusRes.status_code === 'FINISHED') {
                    if (carousel) setMediaUploaded((state) => ([...state, ...[mediaRes]]))
                    else publishPost(mediaRes)
                } else if (statusRes.status_code === 'ERROR') {
                    if (carousel) setMediaUploadError((state) => ([...state, ...[statusRes]]))
                    else {
                        dispatch({
                            type: SHOW_SNACKBAR_ERROR,
                            payload: 'Some error has been occured! Please read all requirements.'
                        })
                    }
                } else {
                    setTimeout(() => {
                        getVideoStatus(mediaRes, carousel)
                    }, 20000)
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const uploadVideoMedia = (values, media, carousel = false) => {
        let url = `${process.env.REACT_APP_FB_API_URL}/${instaUser}/media?media_type=VIDEO&video_url=${media.source_url}&access_token=${FB_AUTH.accessToken}`
        url += carousel ? `&is_carousel_item=true` : `&caption=${values.caption}`
        fetch(url, { method: 'POST' })
            .then(response => response.json())
            .then(mediaRes => {
                if (!mediaRes.error) getVideoStatus(mediaRes, carousel)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const getIGAccount = (event) => {
        const selectedPage = pageList.filter((page) => page.id === event.target.value)[0]
        window.FB.api(
            `/${selectedPage.id}?fields=instagram_business_account&access_token=${selectedPage.access_token}`,
            (response) => {
                if (response && !response.error) {
                    setInstaUser(response.instagram_business_account.id)
                }
            }
        );
    }

    const makeCarouselPost = () => {
        const containerID = mediaUploaded.map((media) => media.id)
        fetch(`${process.env.REACT_APP_FB_API_URL}/${instaUser}/media?media_type=CAROUSEL&caption=${formData.caption}&access_token=${FB_AUTH.accessToken}&children=${containerID}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(mediaRes => {
                if (!mediaRes.error) getCarousalStatus(mediaRes)
                else {
                    dispatch({
                        type: SHOW_SNACKBAR_ERROR,
                        payload: { msg: mediaRes.error.message, error: true }
                    })
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    useEffect(() => {
        if (mediaUploadError > 0) {
            dispatch({
                type: SHOW_SNACKBAR_ERROR,
                payload: 'Some error has been occured on media upload.'
            })
        }
    }, [mediaUploadError])

    useEffect(() => {
        if (mediaUploaded.length > 0 && mediaUploaded.length === mediaToShare.length) {
            makeCarouselPost(mediaUploaded)
        }
    }, [mediaUploaded])

    const uploadImageMedia = (values, media, carousel = false) => {
        let url = `${process.env.REACT_APP_FB_API_URL}/${instaUser}/media?image_url=${media.source_url}&access_token=${FB_AUTH.accessToken}`
        url += carousel ? `&is_carousel_item=true` : `&caption=${values.caption}`
        fetch(url, { method: 'POST' })
            .then(response => response.json())
            .then(mediaRes => {
                if (!mediaRes.error) {
                    if (carousel) setMediaUploaded((state) => ([...state, ...[mediaRes]]))
                    else publishPost(mediaRes)
                } else if (carousel)
                    setMediaUploadError((state) => ([...state, ...[mediaRes.error]]))
                else if (!carousel) {
                    dispatch({
                        type: SHOW_SNACKBAR_ERROR,
                        payload: { msg: mediaRes.error.message, error: true }
                    })
                }
            })
            .catch((error) => {
                setIsSubmitting(false)
                console.error('Error:', error);
            });
    }

    const handleSubmit = (values) => {
        setMediaUploaded([])
        setIsSubmitting(true)
        setFormData(values)
        if (mediaToShare.length === 1) {
            if (mediaToShare[0].mime_type.includes('video')) uploadVideoMedia(values, mediaToShare[0])
            else uploadImageMedia(values, mediaToShare[0])
        } else {
            mediaToShare.forEach((media) => {
                if (media.mime_type.includes('image')) {
                    uploadImageMedia(values, media, true)
                } else {
                    uploadVideoMedia(values, media, true)
                }
            })
        }
    }

    const handleMediaSelect = (media, event) => {
        if (event.target.checked)
            setMediaToShare((state) => ([...state, ...[media]]))
        else
            setMediaToShare((state) => state.filter(item => item.id !== media.id))
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validations}
            onSubmit={handleSubmit}
        >
            {({ values, handleChange, setFieldValue }) => (
                <Form>
                    <Grid container spacing={3}>
                        <Grid item lg={3} md={6} sm={12} xs={12}>
                            <CustomFormLabel sx={{
                                mt: 0,
                            }}
                                htmlFor="fbPageId">FB Pages:</CustomFormLabel>
                            <Field onChange={(value) => {
                                handleChange(value)
                                getIGAccount(value)
                            }} name="fbPageId" id="fbPageId" variant="outlined" fullWidth size="small" menuitems={pageOptionList} as={CustomSelect} />
                            <ErrorMessage name="fbPageId" component={CustomErrorMessage} />
                        </Grid>
                        <Grid item lg={3} md={6} sm={6} xs={12}>
                            <Box>
                                Instagram Account ID:
                            </Box>
                            <Box>
                                {instaUser}
                            </Box>
                        </Grid>
                        <Grid item lg={4} md={6} sm={6}>
                            <CustomFormLabel sx={{
                                mt: 0,
                            }} htmlFor="caption">caption</CustomFormLabel>
                            <Field multiline rows={4} name="caption" id="caption" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Caption" />
                            <ErrorMessage name="caption" component={CustomErrorMessage} />
                        </Grid>
                        <Grid item lg={2} md={6} sm={12}>
                            {FB_AUTH ?
                                <Button variant="contained" color="primary" type="button"
                                    onClick={logout}
                                    sx={{
                                        mr: 1,
                                    }}>
                                    Logout
                                </Button> :
                                <Button variant="contained" color="primary" type="button"
                                    onClick={login}
                                    sx={{
                                        mr: 1,
                                    }}>
                                    Login
                                </Button>
                            }
                        </Grid>
                        <Grid item lg={6} md={6} sm={12}>
                            <FormControl component="fieldset">
                                {mediaFiles
                                    .filter(media => media.mime_type.includes('video') || media.mime_type.includes('image'))
                                    .map(item => (
                                        <FormControlLabel key={item.id}
                                            control={
                                                <Field onClick={(event) => {
                                                    handleChange(event)
                                                    handleMediaSelect(item, event)
                                                }} checked={values.selectedMedia.includes(item.id.toString())} type="checkbox" value={item.id} name="selectedMedia" id="selectedMedia" variant="outlined" as={CustomCheckbox} />
                                            }
                                            label={item.slug}
                                        />
                                    ))}
                            </FormControl>
                        </Grid>
                        <Grid item lg={4} md={6} sm={12}>
                            <CustomFormLabel sx={{
                                mt: 0,
                            }}
                                htmlFor="fname-text">Preview:</CustomFormLabel>
                            <Grid container spacing={3} sx={{
                                ml: 0,
                            }}>
                                {mediaToShare.map((media) => (
                                    <Grid key={media.id} item lg={6} md={6} sm={12}>
                                        {media && media.mime_type.includes('video') ?
                                            <video width="140" height="100" controls>
                                                <source src={media.source_url} type={media.mime_type} />
                                                <track kind="captions" />
                                                Your browser does not support the video tag.
                                            </video>
                                            :
                                            <Avatar
                                                src={media.source_url}
                                                alt={media.source_url}
                                                sx={{
                                                    borderRadius: '10px',
                                                    height: '100px',
                                                    width: '140px',
                                                }}
                                            />
                                        }
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                        <Grid item lg={2} md={4} sm={6}>
                            <Stack spacing={1} direction={{ xs: 'column', sm: 'column' }}>
                                {(FB_AUTH && mediaToShare.length > 0) &&
                                    <Button variant="contained" color="primary" type="submit"
                                        disabled={isSubmitting}
                                        sx={{
                                            mr: 1,
                                        }}>
                                        Share
                                    </Button>
                                }
                                {isSubmitting && <IconButton
                                    aria-label="close"
                                    color="inherit"
                                    size="small"
                                >
                                    <CircularProgress />
                                </IconButton>
                                }
                            </Stack>
                        </Grid>
                    </Grid>
                </Form>
            )}
        </Formik >
    );
}