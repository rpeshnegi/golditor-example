import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import {
    LinearProgress, Button, Card, CardActions, Typography
} from '@material-ui/core';
import FeatherIcon from 'feather-icons-react';
import ChunksUpload from '../../utils/ChunksUpload';
import axiosInstance from '../../utils/axios';
import { SHOW_SNACKBAR_ERROR } from '../../redux/constants';

const UploadMediaItem = ({ media, moduleData, setMediaFiles, setToUploadFiles }) => {

    const dispatch = useDispatch();
    const [progress, setProgress] = useState(0) // handling files upload progress
    const [uploading, setUploading] = useState(false)

    let renderComp = ''
    if (media.type.includes('image')) renderComp = <Image media={media} />
    else if (media.type.includes('video')) renderComp = <Video media={media} />
    else if (media.type.includes('audio')) renderComp = <Audio media={media} />
    else renderComp = <File media={media} />

    const onVideoUploadComplate = (res) => {
        if (moduleData && moduleData.id) {
            const uploadBody = {
                id: res.data.data.id,
                post: moduleData.id
            };
            axiosInstance.post(`/wp/v2/media/${res.data.data.id}`, uploadBody).then((result) => {
                setMediaFiles((state) => [...state, ...[result.data]])

                // removing uploaded file
                setToUploadFiles((state) => state.filter((item) => (item.name !== media.name && item.size !== media.size)))
                setUploading(false)
            })
        } else {
            axiosInstance.get(`/wp/v2/media/${res.data.data.id}`).then((result) => {
                setMediaFiles((state) => [...state, ...[result.data]])

                // removing uploaded file
                setToUploadFiles((state) => state.filter((item) => (item.name !== media.name && item.size !== media.size)))
                setUploading(false)
            })
        }
    }

    const onUploadError = () => {
        setUploading(false)
        setProgress(0)
        dispatch({
            type: SHOW_SNACKBAR_ERROR,
            payload: { msg: 'Some error has been occured. Please try again.', error: true }
        })
    }

    const uploadHanlder = () => {
        setUploading(true)
        if (media.type.includes('video')) {
            setProgress(1) // set 1, that progress bar start showing
            const uploadData = {
                file: media
            }
            ChunksUpload(uploadData, setProgress, onVideoUploadComplate, onUploadError)
        } else {
            const uploadBody = new FormData();
            uploadBody.append('file', media);
            if (moduleData && moduleData.id) uploadBody.append('post', moduleData.id);
            axiosInstance.post("/wp/v2/media", uploadBody, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: data => {
                    // Set the progress value to show the progress bar
                    setProgress(Math.round((100 * data.loaded) / data.total))
                },
            }).then((response) => {
                setMediaFiles((state) => [...state, ...[response.data]])

                // removing uploaded file
                setToUploadFiles((state) => state.filter((item) => (item.name !== media.name && item.size !== media.size)))
                setUploading(false)
            }).catch((error) => {
                console.log(error);
                dispatch({
                    type: SHOW_SNACKBAR_ERROR,
                    payload: { msg: 'Some error has been occured. Please try again.', error: true }
                })
            })
        }
    }

    const removeMedia = () => {
        setToUploadFiles((state) => state.filter((item) => (item.name !== media.name && item.size !== media.size)))
    }

    return (
        <><Card
            sx={{
                textAlign: 'center',
                height: '250px'
            }}
        >
            {renderComp}
            <CardActions disableSpacing sx={{ padding: 0, display: 'block' }}>
                <>
                    {progress > 0 && <LinearProgress variant="determinate" value={progress} />}
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        type="button"
                        disabled={uploading}
                        onClick={uploadHanlder}
                    >
                        upload
                    </Button>
                    <Button sx={{ ml: 1 }}
                        variant="contained"
                        color="error"
                        size="small"
                        type="button"
                        disabled={uploading}
                        onClick={removeMedia}
                    >
                        Remove
                    </Button>
                </>
            </CardActions>
        </Card>
        </>
    );
}

export default UploadMediaItem;


const File = ({ media }) => {
    return (
        <>
            <FeatherIcon size="150px" icon="file" />
            <Typography
                color="textSecondary"
                sx={{
                    fontSize: '14px',
                    mt: '10px',
                }}
            >
                {media.name}
            </Typography>
        </>
    )
}
const Image = ({ media }) => (<img style={{ width: 'auto', height: '85%' }} alt={media.name} src={URL.createObjectURL(media)} />)
const Video = ({ media }) => {
    return (
        <video width="250" height="150" controls>
            <source src={URL.createObjectURL(media)} type={media.mime_type} />
            <track kind="captions" />
            Your browser does not support the video tag.
        </video>
    )
}
const Audio = ({ media }) => {
    return (
        <audio controls>
            <source src={URL.createObjectURL(media)} type={media.mime_type} />
            <track kind="captions" />
            Your browser does not support the audio element.
        </audio>
    )
}