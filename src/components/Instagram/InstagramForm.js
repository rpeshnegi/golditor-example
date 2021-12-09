import React, { useEffect, useState } from 'react';
import {
    Grid, Button, Stack, Box, CircularProgress, FormControl, RadioGroup, FormControlLabel
} from '@material-ui/core';
import * as Yup from 'yup';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import CustomErrorMessage from '../forms/custom-elements/CustomErrorMessage';
import CustomFormLabel from '../forms/custom-elements/CustomFormLabel';
import CustomSelect from '../forms/custom-elements/CustomSelect';
import CustomTextField from '../forms/custom-elements/CustomTextField';
import { ADD_SNACKBAR_MSG, FB_LOGIN, FB_LOGOUT, SHOW_SNACKBAR_ERROR } from '../../redux/constants';
import CustomRadio from '../forms/custom-elements/CustomRadio';

const validations = Yup.object().shape({
    fbPageId: Yup.string().required('Required')
}).when((values, schema) => {
    if (values.postType === 'PHOTO') {
        return schema.shape({
            image: Yup.number().required('Required'),
        });
    }
    if (values.postType === 'VIDEO') {
        return schema.shape({
            video: Yup.number().required('Required'),
        });
    }
    return schema.shape({});
});

export default function InstagramForm({ moduleData, mediaFiles }) {
    const dispatch = useDispatch();
    const FB_AUTH = useSelector((state) => state.FBAuthReducer.FB_AUTH);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mediaToShare, setMediaToShare] = useState(null);
    const [pageList, setPageList] = useState([]);
    const [pageOptionList, setPageOptionList] = useState([]);
    const [instaUser, setInstaUser] = useState(null);

    const initialValues = {
        fbPageId: '',
        caption: `${moduleData.title}`,
        postType: 'PHOTO',
        image: '',
        video: ''
    };

    const getFbPages = () => {
        window.FB.api('/me/accounts', (response) => {
            setPageList(response.data)
            setPageOptionList(response.data.map(item => ({ value: item.id, title: item.name })))
        });
    }
    useEffect(() => {
        if (FB_AUTH) { getFbPages() }
        return () => { }
    }, [FB_AUTH])

    // useEffect(() => {
    //     console.log(mediaToShare)
    //     return () => { }
    // }, [mediaToShare])

    const statusChangeCallback = (response) => {  // Called with the results from FB.getLoginStatus().
        if (response.status === 'connected') {   // Logged into your webpage and Facebook.
            dispatch({
                type: FB_LOGIN,
                payload: response.authResponse
            })
        } else {                                 // Not logged into your webpage or we are unable to tell.
            dispatch({
                type: FB_LOGOUT,
            })
        }
    }

    // commented in this component because FB JS  loaded in another component 
    // const loadFBSdk = async () => {
    //     const script = document.createElement('script')
    //     script.src = 'https://connect.facebook.net/en_US/sdk.js'
    //     script.onload = () => {
    //         // console.log(window.FB)
    //         window.FB.init({
    //             appId: '2741494312807498',
    //             cookie: true,
    //             xfbml: true,
    //             version: 'v12.0'
    //         });

    //         window.FB.getLoginStatus((response) => {
    //             statusChangeCallback(response)
    //         });
    //     }
    //     document.body.appendChild(script)
    // }

    // useEffect(() => {
    //     loadFBSdk()
    //     return () => { };
    // }, [])

    const login = () => {
        window.FB.login((response) => {
            if (response.authResponse) {
                console.log(response)
                console.log('Welcome! ');
                statusChangeCallback(response)
            } else {
                console.log('User cancelled login or did not fully authorize.');
            }
        }, { scope: process.env.REACT_APP_FB_SCOPE });
    }

    const logout = () => {
        window.FB.logout((response) => {
            console.log('FB-logout', response)
            dispatch({
                type: FB_LOGOUT,
            })
        });
    }

    const publishPost = (mediaRes) => {
        fetch(`${process.env.REACT_APP_FB_API_URL}/${instaUser}/media_publish?creation_id=${mediaRes.id}&access_token=${FB_AUTH.accessToken}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(publishRes => {
                setIsSubmitting(false)
                console.log(publishRes)
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

    const getVideoStatus = (mediaRes) => {
        fetch(`${process.env.REACT_APP_FB_API_URL}/${mediaRes.id}?fields=status_code&access_token=${FB_AUTH.accessToken}`)
            .then(response => response.json())
            .then(statusRes => {
                console.log(statusRes)
                if (statusRes.status_code === 'FINISHED') {
                    publishPost(mediaRes)
                } else if (statusRes.status_code === 'ERROR') {
                    setIsSubmitting(false)
                    dispatch({
                        type: SHOW_SNACKBAR_ERROR,
                        payload: 'Some error has been occured! Please read all requirements.'
                    })
                } else {
                    setTimeout(() => {
                        getVideoStatus(mediaRes)
                    }, 20000)
                }
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const uploadVideoMedia = (values) => {
        fetch(`${process.env.REACT_APP_FB_API_URL}/${instaUser}/media?media_type=VIDEO&video_url=${mediaToShare.source_url}&caption=${values.caption}&access_token=${FB_AUTH.accessToken}`, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(mediaRes => {
                console.log(mediaRes)
                if (!mediaRes.error) getVideoStatus(mediaRes)
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    }

    const getIGAccount = (event) => {
        const selectedPage = pageList.filter((page) => page.id === event.target.value)[0]
        // console.log(selectedPage);
        window.FB.api(
            `/${selectedPage.id}?fields=instagram_business_account&access_token=${selectedPage.access_token}`,
            (response) => {
                if (response && !response.error) {
                    console.log(response)
                    setInstaUser(response.instagram_business_account.id)
                }
            }
        );
    }

    const handleSubmit = (values) => {
        setIsSubmitting(true)
        if (values.postType === 'PHOTO') {
            fetch(`${process.env.REACT_APP_FB_API_URL}/${instaUser}/media?image_url=${mediaToShare.source_url}&caption=${values.caption}&access_token=${FB_AUTH.accessToken}`, {
                method: 'POST'
            })
                .then(response => response.json())
                .then(mediaRes => {
                    console.log(mediaRes)
                    if (!mediaRes.error) publishPost(mediaRes)
                    else {
                        setIsSubmitting(false)
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
        } else {
            uploadVideoMedia(values)
        }
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
                            <Field rows={4} name="caption" id="caption" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Caption" />
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
                        <Grid item lg={3} md={6} sm={12}>
                            <FormControl component="fieldset">
                                <RadioGroup
                                    aria-label="postType"
                                    name="postType"
                                    value={values.postType}
                                    onChange={(event) => {
                                        handleChange(event)
                                        setMediaToShare(null)
                                        setFieldValue('image', '')
                                        setFieldValue('video', '')
                                    }}
                                >
                                    <FormControlLabel
                                        value="PHOTO"
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
                        {values.postType === 'PHOTO' &&
                            <Grid item lg={3} md={6} sm={6} xs={12}>
                                <CustomFormLabel sx={{
                                    mt: 0,
                                }}
                                    htmlFor="fname-text">Image:</CustomFormLabel>
                                <Field name="image" id="image" variant="outlined" fullWidth size="small"
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
                                <ErrorMessage name="image" component={CustomErrorMessage} />
                            </Grid>
                        }
                        {values.postType === 'VIDEO' &&
                            <Grid item lg={3} md={6} sm={6}>
                                <CustomFormLabel sx={{
                                    mt: 0,
                                }}
                                    htmlFor="fname-text">Video:</CustomFormLabel>
                                <Field name="video" id="video" variant="outlined" fullWidth size="small"
                                    onChange={(event) => {
                                        handleChange(event)
                                        setMediaToShare(null)
                                        setTimeout(()=>{
                                            setMediaToShare(mediaFiles.filter((item) => item.id === event.target.value)[0])
                                        },50)
                                    }}
                                    menuitems={mediaFiles
                                        .filter((item) => item.mime_type.includes('video'))
                                        .map(item => ({ value: item.id, title: item.slug })
                                        )}
                                    as={CustomSelect}
                                />
                                <ErrorMessage name="video" component={CustomErrorMessage} />
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
                        <Grid item lg={2} md={4} sm={6}>
                            <Stack spacing={1} direction={{ xs: 'column', sm: 'column' }}>
                                {(FB_AUTH && values.postType === 'PHOTO') &&
                                    <Button variant="contained" color="primary" type="submit"
                                        disabled={isSubmitting}
                                        sx={{
                                            mr: 1,
                                        }}>
                                        Share
                                    </Button>
                                }
                                {(FB_AUTH && values.postType === 'VIDEO') &&
                                    <>
                                        <Button variant="contained" color="primary" type="submit"
                                            disabled={isSubmitting}
                                            sx={{
                                                mr: 1,
                                            }}>
                                            Share
                                        </Button>
                                        {isSubmitting && <CircularProgress />}
                                        <a href="https://developers.facebook.com/docs/instagram-api/reference/ig-user/media" target="_blank" rel="noreferrer" >
                                            IG video requirements
                                        </a>
                                    </>
                                }
                            </Stack>
                        </Grid>
                    </Grid>
                </Form>
            )
            }
        </Formik >
    );
}