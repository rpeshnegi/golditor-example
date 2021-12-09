import React, { useState, useCallback } from 'react';
import {
    Grid, Box, LinearProgress, Divider, Button
} from '@material-ui/core';
import { ErrorMessage } from 'formik';
import FeatherIcon from 'feather-icons-react';
import { useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone'
import CustomFormLabel from '../../components/forms/custom-elements/CustomFormLabel';
import CustomErrorMessage from '../../components/forms/custom-elements/CustomErrorMessage';
import axiosInstance from '../../utils/axios';
import { deleteRecord } from '../../utils/common';
import { SHOW_SNACKBAR_ERROR } from '../../redux/constants';

const PostMediaVideo = (props) => {
    const { mediaFiles, moduleData, setMediaFiles, setFieldValue } = props
    const dispatch = useDispatch();
    const [progress, setProgress] = useState({ video: 0, preview: 0 }) // handling files upload progress
    const onDrop = useCallback(acceptedFiles => {
        console.log(acceptedFiles)
        // Do something with the files
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

    const uploadHanlder = (event, type) => {
        if (!event.currentTarget.files.length > 0) {
            return
        }
        const uploadBody = new FormData();
        uploadBody.append('file', event.currentTarget.files[0]);
        if (moduleData && moduleData.id) uploadBody.append('post', moduleData.id);
        if (mediaFiles[type] && mediaFiles[type].id) {
            deleteRecord(mediaFiles[type].id)
            setMediaFiles((state) => ({ ...state, ...{ [type]: null } }))
        }
        axiosInstance.post("/wp/v2/media", uploadBody, {
            headers: { "Content-Type": "multipart/form-data" },
            onUploadProgress: data => {
                // Set the progress value to show the progress bar
                setProgress((state) => ({ ...state, ...{ [type]: Math.round((100 * data.loaded) / data.total) } }))
            },
        }).then((response) => {
            setMediaFiles((state) => ({ ...state, ...{ [type]: response.data } }))
            setFieldValue([type], response.data);
            setProgress((state) => ({ ...state, ...{ [type]: 0 } }))
        }).catch((error) => {
            console.log(error);
            dispatch({
                type: SHOW_SNACKBAR_ERROR,
                payload: { msg: 'Some error has been occured. Please try again.', error: true }
            })
        })
    }

    return (
        <>
            {mediaFiles.map((media) => (
                <>
                    <Grid item lg={6} md={12} sm={12}>
                        <CustomFormLabel htmlFor="fname-text">Video</CustomFormLabel>
                        <Box {...getRootProps({ className: 'dropzone' })}>
                            {media.video &&
                                <video width="250" height="150" controls>
                                    <source src={media.video.source_url} type={media.video.mime_type} />
                                    <track kind="captions" />
                                    Your browser does not support the video tag.
                                </video>
                            }
                            <input {...getInputProps()}
                                id="video"
                                type="file"
                                onChange={(event) => {
                                    uploadHanlder(event, 'video', setFieldValue)
                                }}
                            />
                            {
                                isDragActive ?
                                    <p>Drop the files here ...</p> :
                                    <p>Drag and drop some files here, or click to select files</p>
                            }
                        </Box>
                        <ErrorMessage name="video" component={CustomErrorMessage} />
                        {progress.video > 0 &&
                            <Box mt={2}>
                                <LinearProgress variant="determinate" value={progress.video} />
                            </Box>
                        }
                    </Grid>
                    <Grid item lg={6} md={12} sm={12}>
                        <CustomFormLabel htmlFor="fname-text">Preview Image
                            &nbsp;<a target="_blank" href="https://support.google.com/youtube/answer/72431" rel="noreferrer">
                                <FeatherIcon icon="info" />
                            </a>
                        </CustomFormLabel>
                        <Box {...getRootProps({ className: 'dropzone' })}>
                            {media.preview &&
                                <img src={media.preview.source_url} alt="Girl in a jacket" style={{ maxHeight: 150, maxWidth: 320 }} />
                            }
                            <br />
                            <input {...getInputProps()}
                                id="preview"
                                type="file"
                                onChange={(event) => {
                                    uploadHanlder(event, 'preview', setFieldValue)
                                }}
                            />
                            {
                                isDragActive ?
                                    <p>Drop the files here ...</p> :
                                    <p>Drag and drop some files here, or click to select files</p>
                            }
                        </Box>
                        <ErrorMessage name="preview" component={CustomErrorMessage} />
                        {progress.preview > 0 &&
                            <Box mt={2}>
                                <LinearProgress variant="determinate" value={progress.preview} />
                            </Box>
                        }
                    </Grid>
                </>
            ))}
            <Divider />
            <Grid item lg={6} md={12} sm={12}>
                <Button variant="contained" color="primary" onClick={() => {
                    setMediaFiles([...mediaFiles, ...[{ video: null, preivew: null }]])
                }}>
                    Add
                </Button>
            </Grid>
        </>
    );
};

export default PostMediaVideo;
