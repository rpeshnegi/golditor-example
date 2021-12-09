import React, { useState, useCallback } from 'react';
import {
    Grid, Box, List
} from '@material-ui/core';

import { useDropzone } from 'react-dropzone'
import CustomFormLabel from '../forms/custom-elements/CustomFormLabel';
import MediaItem from './MediaItem';
import UploadMediaItem from './UploadMediaItem';

const MediaUploader = (props) => {
    const { mediaFiles, moduleData, setMediaFiles } = props
    const [toUploadFiles, setToUploadFiles] = useState([])

    const onDrop = useCallback(acceptedFiles => {
        setToUploadFiles((state) => [...state, ...acceptedFiles])
        // Do something with the files
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*, audio/*, video/*' })

    return (
        <>
            <Grid item lg={12} md={12} sm={12}>
                <CustomFormLabel htmlFor="fname-text">Media</CustomFormLabel>
                <Box {...getRootProps({ className: 'dropzone' })}>
                    <input {...getInputProps()}
                        id="video"
                        type="file"
                    />
                    {
                        isDragActive ?
                            <p>Drop the files here ...</p> :
                            <p>Drag and drop some files here, or click to select files</p>
                    }
                </Box>
            </Grid>
            <Grid item lg={12} md={12} sm={12}>
                {mediaFiles.length > 0 &&
                    <List sx={{ width: '100%', maxWidth: 560, bgcolor: 'background.paper' }}>
                        {mediaFiles.map((file, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <MediaItem key={`media_uploaded_${index}`} setMediaFiles={setMediaFiles} media={file} />
                        ))}
                    </List>
                }
                {toUploadFiles.length > 0 &&
                    <List sx={{ width: '100%', maxWidth: 560, bgcolor: 'background.paper' }}>
                        {toUploadFiles.map((file, index) => (
                            // eslint-disable-next-line react/no-array-index-key
                            <UploadMediaItem key={`media_item_${index}`} moduleData={moduleData} setToUploadFiles={setToUploadFiles} setMediaFiles={setMediaFiles} media={file} />
                        ))}
                    </List>
                }
            </Grid>
        </>
    );
};

export default MediaUploader;