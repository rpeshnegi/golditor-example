/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
    Grid, Button, Stack, FormControl, RadioGroup, FormControlLabel, CircularProgress
} from '@material-ui/core';
import * as Yup from 'yup';
import { Formik, Form, ErrorMessage, Field } from 'formik';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import CustomErrorMessage from '../forms/custom-elements/CustomErrorMessage';
import CustomFormLabel from '../forms/custom-elements/CustomFormLabel';
import CustomSelect from '../forms/custom-elements/CustomSelect';
import CustomTextField from '../forms/custom-elements/CustomTextField';
import { ADD_SNACKBAR_MSG, FB_LOGIN, FB_LOGOUT, SHOW_SNACKBAR_ERROR } from '../../redux/constants';
import CustomRadio from '../forms/custom-elements/CustomRadio';
// import MediaUploader from './utils/MediaUploader';


const validations = Yup.object().shape({
    pageId: Yup.string().required('Required')
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

export default function FaceBookForm({ moduleData, mediaFiles }) {
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(null);
    const FB_AUTH = useSelector((state) => state.FBAuthReducer.FB_AUTH);
    const [pageList, setPageList] = useState([]);
    const [pageOptionList, setPageOptionList] = useState([]);
    const [fileFetcProcess, setFileFetcProcess] = useState(0);
    const [selectedPage, setSelectedPage] = useState(null);
    const [uploadVideoFile, setUploadVideoFile] = useState(null);

    const initialValues = {
        message: `${moduleData.title}\n${moduleData.content}${moduleData.acf['golditor-tags']}`,
        pageId: '',
        postType: 'MSG',
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

    const loadFBSdk = async () => {
        const script = document.createElement('script')
        script.src = 'https://connect.facebook.net/en_US/sdk.js'
        script.onload = () => {
            // console.log(window.FB)
            window.FB.init({
                appId: '2741494312807498',
                cookie: true,
                xfbml: true,
                version: 'v12.0'
            });

            window.FB.getLoginStatus((response) => {
                statusChangeCallback(response)
            });
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

    const addPost = (url) => {
        fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json'
                // 'Content-Type': 'application/x-www-form-urlencoded',
            }
        })
            .then(response => response.json())
            .then(data => {
                setIsSubmitting(false)
                console.log(data)
                dispatch({
                    type: ADD_SNACKBAR_MSG,
                    payload: `Post has been added successfully.`
                })
            })
            .catch((error) => {
                setIsSubmitting(false)
                console.error('Error:', error);
            });
    }

    const endUploadSession = (chunkData) => {
        const url = `${process.env.REACT_APP_FB_API_URL}/${selectedPage.id}/videos?upload_phase=finish&access_token=${selectedPage.access_token}&upload_session_id=${chunkData.upload_session_id}`
        fetch(url, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                setIsSubmitting(false)
                console.log(data)
                dispatch({
                    type: ADD_SNACKBAR_MSG,
                    payload: `Post has been added successfully.`
                })
            })
            .catch((error) => {
                setIsSubmitting(false)
                console.error('Error:', error);
            });
    }

    const uploadChunk = (data) => {
        // let content = uploadVideoFile;
        // let end = uploadVideoFile.size;

        // chunkSize=

        // if (this.offset || this.chunkSize) {
        //     // Only bother to slice the file if we're either resuming or uploading in chunks
        //     if (this.chunkSize) {
        //         end = Math.min(this.offset + this.chunkSize, this.file.size);
        //     }
        //     content = content.slice(this.offset, end);
        // }
        // const url = `${process.env.REACT_APP_FB_API_URL}/${selectedPage.id}/videos?upload_phase=transfer&access_token=${selectedPage.access_token}&upload_session_id=${data.upload_session_id}&start_offset=${data.start_offset}&video_file_chunk=...`
        // fetch(url, {
        //     method: 'POST'
        // })
        //     .then(response => response.json())
        //     .then(chunkData => {
        //         if (chunkData.start_offset === chunkData.end_offset) {
        //             endUploadSession(chunkData)
        //         } else {
        //             uploadChunk(chunkData)
        //         }
        //     })
        //     .catch((error) => {
        //         setIsSubmitting(false)
        //         console.error('Error:', error);
        //     });
    }

    const initVideoUpload = (file) => {
        const url = `${process.env.REACT_APP_FB_API_URL}/${selectedPage.id}/videos?upload_phase=start&access_token=${selectedPage.access_token}&file_size=${file.size}`
        fetch(url, {
            method: 'POST'
        })
            .then(response => response.json())
            .then(data => {
                console.log('initVideoUpload', data)
                uploadChunk(data)
            })
            .catch((error) => {
                setIsSubmitting(false)
                console.error('Error:', error);
            });
    }

    const uploadVideoUnResumable = (formData) => {
        const url = `https://graph-video.facebook.com/v12.0/${selectedPage.id}/videos?access_token=${selectedPage.access_token}&description=${encodeURIComponent(formData.message)}&file_url=${mediaFiles.filter(item => item.id === formData.video)[0].source_url}`
        axios.post(url, {}, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: data => {
                console.log(data)
                // Set the progress value to show the progress bar
            },
        }).then((response) => {
            console.log(response)
            setIsSubmitting(false)
            dispatch({
                type: ADD_SNACKBAR_MSG,
                payload: `Post has been added successfully.`
            })
        }).catch((error) => {
            console.log(error);
            dispatch({
                type: SHOW_SNACKBAR_ERROR,
                payload: { msg: 'Some error has been occured. Please try again.', error: true }
            })
        })
    }

    const fetchVideo = () => {
        axios({
            method: 'get',
            url: mediaFiles.video.source_url,
            responseType: 'blob',
            onDownloadProgress: (progressEvent) => {
                const bytesUploaded = progressEvent.loaded;
                const totalBytes = progressEvent.total;
                // eslint-disable-next-line radix
                const percentageComplete = parseInt((bytesUploaded * 100) / totalBytes);
                setFileFetcProcess(percentageComplete)
                if (percentageComplete === 100) {
                    setTimeout(() => setFileFetcProcess(0), 2000)
                }
            },
        }).then((blob) => {
            const file = new File([blob.data], `${mediaFiles.video.slug}.${mediaFiles.video.media_details.fileformat}`, { type: mediaFiles.video.mime_type });
            console.log(file);
            setUploadVideoFile(file);
            initVideoUpload(file)
            // uploadVideo.uploadFile(file, values, setProgress, setPollVideoStatus);
        });
    }

    const handleSubmit = (values) => {
        console.log(values)
        setIsSubmitting(true)
        console.log(selectedPage);
        let url = `${process.env.REACT_APP_FB_API_URL}/${selectedPage.id}`
        if (values.postType === 'MSG') {
            url += `/feed?message=${encodeURIComponent(values.message)}&access_token=${selectedPage.access_token}`
            addPost(url)
        } else if (values.postType === 'PHOTO') {
            url += `/photos?url=${mediaFiles.filter(item => item.id === values.image)[0].source_url}&message=${encodeURIComponent(values.message)}&access_token=${selectedPage.access_token}`
            addPost(url)
        } else if (values.postType === 'VIDEO') {
            console.log('calling start')
            // if (mediaFiles.video.media_details.filesize > 104857600)
            //     fetchVideo()
            // else
            uploadVideoUnResumable(values)

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
                        <Grid item lg={4} md={6} sm={12}>
                            <CustomFormLabel sx={{
                                mt: 0,
                            }}
                                htmlFor="fname-text">Pages:</CustomFormLabel>
                            <Field onChange={(event) => {
                                handleChange(event)
                                setSelectedPage(pageList.filter((page) => page.id === event.target.value)[0])
                            }} name="pageId" id="pageId" variant="outlined" fullWidth size="small" menuitems={pageOptionList} as={CustomSelect} />
                            <ErrorMessage name="pageId" component={CustomErrorMessage} />
                        </Grid>
                        <Grid item lg={6} md={12} sm={12}>
                            <CustomFormLabel sx={{
                                mt: 0,
                            }} htmlFor="content">Content</CustomFormLabel>
                            <Field multiline
                                rows={4} name="message" id="message" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Description" />
                            <ErrorMessage name="message" component={CustomErrorMessage} />
                        </Grid>
                        <Grid item lg={4} md={6} sm={12}>
                            <FormControl component="fieldset">
                                <RadioGroup
                                    aria-label="postType"
                                    name="postType"
                                    value={values.postType}
                                    onChange={handleChange}
                                >
                                    <FormControlLabel
                                        value="MSG"
                                        control={<CustomRadio />}
                                        label="Content"
                                    />
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
                            <Grid item lg={4} md={6} sm={6}>
                                <CustomFormLabel sx={{
                                    mt: 0,
                                }}
                                    htmlFor="fname-text">Image:</CustomFormLabel>
                                <Field name="image" id="image" variant="outlined" fullWidth size="small"
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
                            <Grid item lg={4} md={6} sm={6}>
                                <CustomFormLabel sx={{
                                    mt: 0,
                                }}
                                    htmlFor="fname-text">Video:</CustomFormLabel>
                                <Field name="video" id="video" variant="outlined" fullWidth size="small"
                                    menuitems={mediaFiles
                                        .filter((item) => item.mime_type.includes('video'))
                                        .map(item => ({ value: item.id, title: item.slug })
                                        )}
                                    as={CustomSelect}
                                />
                                <ErrorMessage name="video" component={CustomErrorMessage} />
                            </Grid>
                        }
                        <Grid item lg={4} md={6} sm={6} m='auto'>
                            <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }}>
                                {FB_AUTH ?
                                    <>
                                        <Button variant="contained" color="primary" type="submit"
                                            disabled={isSubmitting}
                                            sx={{
                                                mr: 1,
                                            }}>
                                            Share post
                                        </Button>
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
                    </Grid>
                </Form>
            )}
        </Formik>
    );
}