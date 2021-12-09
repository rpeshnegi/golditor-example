import React, { useEffect, useState } from 'react';
import {
    Grid, Button, Stack, IconButton, Collapse, LinearProgress, Box, CircularProgress
} from '@material-ui/core';
import * as Yup from 'yup';
import Alert from '@material-ui/lab/Alert';
import FeatherIcon from 'feather-icons-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
// import parse from 'html-react-parser';
import axios from 'axios';
import CustomFormLabel from '../forms/custom-elements/CustomFormLabel';
import CustomSelect from '../forms/custom-elements/CustomSelect';
import GoogleLogin from '../GoogleLogin/GoogleLogin';
import UploadVideo from './utils/upload';
import { ADD_SNACKBAR_MSG, SHOW_SNACKBAR_ERROR } from '../../redux/constants';
import CustomErrorMessage from '../forms/custom-elements/CustomErrorMessage';
import CustomTextField from '../forms/custom-elements/CustomTextField';

// preview information
// <a target="_blank" href="https://support.google.com/youtube/answer/72431" rel="noreferrer">
// <FeatherIcon icon="info" /> </a>

const validations = Yup.object().shape({
    title: Yup.string().required('Required'),
    description: Yup.string().required('Required'),
    channelId: Yup.string().required('Required'),
    video: Yup.string().required('Required'),
})

const uploadVideo = new UploadVideo();

export default function YouTubeForm(props) {
    const GOOGLE_AUTH = useSelector((state) => state.YTAuthReducer.GOOGLE_AUTH);
    const dispatch = useDispatch();
    const { moduleData, mediaFiles, updatePost } = props
    const youtubeData = moduleData.acf.youtube_data
    const statuses = [{ value: 'private', title: 'private' }, { value: 'public', title: 'public' }, { value: 'unlisted', title: 'unlisted' }]
    const [channelList, setChannelList] = useState([])
    const [gapiLoaded, setGapiLoaded] = useState(false)
    const [openYtInfo, setOpenYtInfo] = useState(false);
    const [progress, setProgress] = useState(0);
    const [pollVideoStatus, setPollVideoStatus] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(null);
    const [fileFetcProcess, setFileFetcProcess] = useState(0);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [selectedPreview, setSelectedPreview] = useState(null);

    const initialValues = {
        title: moduleData.title,
        description: moduleData.content,
        "privacy-status": "private",
        channelId: '',
        video: '',
        image: ''
    };

    const thumbnailsUploaded = (response) => {
        console.log(response)
        setIsSubmitting(false)
        setProgress(0)
        dispatch({
            type: ADD_SNACKBAR_MSG,
            payload: `Post has been added successfully.`
        })
        if (pollVideoStatus) {
            Object.assign(pollVideoStatus, { preview: response })
            updatePost(pollVideoStatus, 'youtube_data')
        }
    }

    const uploadThumbnail = () => {
        axios({
            method: 'get',
            url: selectedPreview.source_url,
            responseType: 'blob',
            onDownloadProgress: () => { },
        }).then((blob) => {
            const file = new File([blob.data], `${selectedPreview.slug}.${selectedPreview.media_details.fileformat}`, { type: selectedPreview.mime_type });
            uploadVideo.setThumbnails(pollVideoStatus, file, thumbnailsUploaded)
        });

    }

    useEffect(() => {
        if (pollVideoStatus && pollVideoStatus.status.uploadStatus === 'processed') {
            if (selectedPreview)
                uploadThumbnail()
            else {
                setIsSubmitting(false)
                dispatch({
                    type: ADD_SNACKBAR_MSG,
                    payload: `Post has been added successfully.`
                })
            }
        }
        return () => { };
    }, [pollVideoStatus])

    const loadYoutubeApi = () => {
        const script = document.createElement('script')
        script.src = 'https://apis.google.com/js/client:plusone.js'
        script.onload = () => {
            window.gapi.load('client', () => {
                window.gapi.client.setApiKey(process.env.REACT_APP_GAPI_API_KEY);
                setGapiLoaded(true)
            })
        }
        document.body.appendChild(script)
    }

    useEffect(() => {
        loadYoutubeApi()
        return () => { };
    }, [])

    const channelListResponse = (response) => {
        if (response.items.length > 0) {
            setChannelList(response.items.map(item => ({ value: item.id, title: item.snippet.title })))
        }
    }

    const signinCallback = async (result) => {
        if (result.access_token) {
            uploadVideo.ready(result.access_token, channelListResponse);
        }
    };

    const videoUpdateComplete = (res) => {
        if (!res.error) {
            Object.assign(youtubeData, res)
            updatePost(youtubeData, 'youtube_data')
        } else {
            dispatch({
                type: SHOW_SNACKBAR_ERROR,
                payload: { msg: res.error.message, error: true }
            })
        }
    }

    const updateVideo = (event) => {
        if (youtubeData && youtubeData.id) {
            const data = {
                "id": youtubeData.id,
                snippet: {
                    title: youtubeData.snippet.title,
                    categoryId: youtubeData.snippet.categoryId
                },
                "status": {
                    "privacyStatus": event.target.value
                }
            }
            uploadVideo.updateVideo(data, videoUpdateComplete)
        }
    }

    const handleSubmit = (values) => {
        setIsSubmitting(true)
        axios({
            method: 'get',
            url: selectedVideo.source_url,
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
            const file = new File([blob.data], `${selectedVideo.slug}.${selectedVideo.media_details.fileformat}`, { type: selectedVideo.mime_type });
            uploadVideo.uploadFile(file, values, setProgress, setPollVideoStatus);
        });
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
                        <Grid item lg={4} md={6} sm={12}>
                            <CustomFormLabel sx={{
                                mt: 0,
                            }}
                                htmlFor="fname-text">Channels:</CustomFormLabel>
                            <Field name="channelId" id="channelId" variant="outlined" fullWidth size="small" menuitems={channelList} as={CustomSelect} />
                            <ErrorMessage name="channelId" component={CustomErrorMessage} />
                        </Grid>
                        <Grid item lg={4} md={6} sm={12} >
                            <CustomFormLabel
                                sx={{
                                    mt: 0,
                                }}
                                htmlFor="title">Title</CustomFormLabel>
                            <Field name="title" id="title" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Title" />
                            <ErrorMessage name="title" component={CustomErrorMessage} />
                        </Grid>
                        <Grid item lg={4} md={6} sm={12} >
                            <CustomFormLabel
                                sx={{
                                    mt: 0,
                                }}
                                htmlFor="fname-text">Privacy Status:</CustomFormLabel>
                            <Field onChange={(value) => updateVideo(value)} name="privacy-status" id="privacy-status" variant="outlined" fullWidth size="small" menuitems={statuses} as={CustomSelect} />
                        </Grid>
                        <Grid item lg={4} md={6} sm={6}>
                            <CustomFormLabel sx={{
                                mt: 0,
                            }}
                                htmlFor="fname-text">Video:</CustomFormLabel>
                            <Field name="video" id="video" variant="outlined" fullWidth size="small"
                                onChange={(event) => {
                                    handleChange(event)
                                    setSelectedVideo(null)
                                    setTimeout(() => {
                                        setSelectedVideo(mediaFiles.filter((item) => item.id === event.target.value)[0])
                                    }, 50)
                                }}
                                menuitems={mediaFiles
                                    .filter((item) => item.mime_type.includes('video'))
                                    .map(item => ({ value: item.id, title: item.slug })
                                    )}
                                as={CustomSelect}
                            />
                            <ErrorMessage name="video" component={CustomErrorMessage} />
                        </Grid>
                        <Grid item lg={4} md={6} sm={6} >
                            <CustomFormLabel sx={{
                                mt: 0,
                            }}
                                htmlFor="fname-text">Preview:</CustomFormLabel>
                            <Field name="image" id="image" variant="outlined" fullWidth size="small"
                                onChange={(event) => {
                                    handleChange(event)
                                    setSelectedPreview(null)
                                    setTimeout(() => {
                                        setSelectedPreview(mediaFiles.filter((item) => item.id === event.target.value)[0])
                                    }, 50)
                                }}
                                menuitems={mediaFiles
                                    .filter((item) => item.mime_type.includes('image'))
                                    .map(item => ({ value: item.id, title: item.slug })
                                    )}
                                as={CustomSelect}
                            />
                            <ErrorMessage name="image" component={CustomErrorMessage} />
                        </Grid>
                        <Grid item lg={4} md={6} sm={12}>
                            {selectedVideo &&
                                <video width="300" height="150" poster={selectedPreview?.source_url} controls>
                                    <source src={selectedVideo.source_url} type={selectedVideo.mime_type} />
                                    <track kind="captions" />
                                    Your browser does not support the video tag.
                                </video>
                            }
                        </Grid>

                        <Grid item lg={4} md={6} sm={6}>
                            <Stack spacing={1} direction={{ xs: 'column', sm: 'row' }}>
                                {GOOGLE_AUTH &&
                                    <>
                                        <Button variant="contained" color="primary" type="submit"
                                            disabled={isSubmitting}
                                            sx={{
                                                mr: 1,
                                            }}>
                                            Upload now
                                        </Button>
                                        <IconButton
                                            aria-label="close"
                                            color="inherit"
                                            size="small"
                                        >
                                            {isSubmitting && <CircularProgress />}
                                        </IconButton>
                                        <Button
                                            disabled={openYtInfo}
                                            onClick={() => {
                                                setOpenYtInfo(true);
                                            }}
                                        >
                                            <FeatherIcon icon="info" />
                                        </Button>
                                    </>
                                }
                                {gapiLoaded &&
                                    <Box>
                                        <GoogleLogin signinCallback={signinCallback} />
                                    </Box>
                                }
                            </Stack>
                            {fileFetcProcess > 0 && <Box mt={2}>
                                <LinearProgress variant="determinate" value={fileFetcProcess} />
                            </Box>}
                            <Box mt={2}>
                                <LinearProgress variant="determinate" value={progress} />
                            </Box>
                        </Grid>
                        <Grid item md={12}>
                            <Collapse in={openYtInfo}>
                                <Alert
                                    icon={false}
                                    variant="filled"
                                    severity="info"
                                    action={
                                        <IconButton
                                            aria-label="close"
                                            color="inherit"
                                            size="small"
                                            onClick={() => {
                                                setOpenYtInfo(false);
                                            }}
                                        >
                                            <FeatherIcon icon="x" width="20" />
                                        </IconButton>
                                    }
                                >
                                    <p id="disclaimer">By uploading a video, you certify that you own all rights to the content or that you are
                                        authorized by the owner to make the content publicly available on YouTube, and that it otherwise
                                        complies with the YouTube Terms of Service located at <a href="http://www.youtube.com/t/terms"
                                            target="_blank" rel="noreferrer">http://www.youtube.com/t/terms</a></p>
                                </Alert>
                            </Collapse>
                        </Grid>
                        { // moduleData && moduleData.acf.youtube_data &&
                            // <Grid item md={6}>
                            //     <p>Uploaded video</p>
                            //     <Grid item md={6}>
                            //         {parse(moduleData.acf.youtube_data.player.embedHtml)}
                            //     </Grid>
                            // {/* {pollVideoStatus && pollVideoStatus.status.uploadStatus === 'uploaded' &&
                            //     <>
                            //         <ul id="post-upload-status"><li>Upload status: {pollVideoStatus.status.uploadStatus}</li></ul>
                            //         <div id="player">{parse(pollVideoStatus.player.embedHtml)}</div>
                            //     </>
                            // }
                            // {pollVideoStatus && pollVideoStatus.status.uploadStatus === 'processed' &&
                            //     <>
                            //         <ul id="post-upload-status"><li>Final status: {pollVideoStatus.status.uploadStatus}</li></ul>
                            //         <div id="player">{parse(pollVideoStatus.player.embedHtml)}</div>
                            //     </>
                            // }
                            // {pollVideoStatus && pollVideoStatus.status.uploadStatus !== 'processed' && pollVideoStatus.status.uploadStatus !== 'uploaded' &&
                            //     <ul id="post-upload-status"><li>Transcoding failed</li></ul>
                            // } */}
                            // </Grid>
                        }

                    </Grid>
                </Form>
            )}
        </Formik>
    );
}