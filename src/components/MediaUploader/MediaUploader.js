/* eslint-disable react/no-array-index-key */
import React, { useState, useCallback } from 'react';
import {
    Grid, Box
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
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

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
            {mediaFiles.length > 0 &&
                <Grid container spacing={0}>
                    {mediaFiles.map((file) => (
                        <Grid item xs={12} sm={4} lg={3} key={file.id}>
                            <MediaItem key={file.id} setMediaFiles={setMediaFiles} media={file} />
                        </Grid>
                    ))}
                </Grid>
            }
            {toUploadFiles.length > 0 &&
                <Grid container spacing={0}>
                    {toUploadFiles.map((file, index) => (
                        <Grid item xs={12} sm={4} lg={3} key={`media_grid_${index}`}>
                            <UploadMediaItem key={`media_item_${index}`} moduleData={moduleData} setToUploadFiles={setToUploadFiles} setMediaFiles={setMediaFiles} media={file} />
                        </Grid>
                    ))}
                </Grid>
            }
        </>
    );
};

export default MediaUploader;