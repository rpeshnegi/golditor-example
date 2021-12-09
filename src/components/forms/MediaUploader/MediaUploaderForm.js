import React, { useState } from 'react';
import {
    Grid, Box, Button, Typography
} from '@material-ui/core';
import { Formik, Form, Field } from 'formik';
import CustomTextField from '../custom-elements/CustomTextField';
import CustomFormLabel from '../custom-elements/CustomFormLabel';
import { convertToFormData } from '../../../utils/common';
import axiosInstance from '../../../utils/axios';

const MediaUploaderForm = () => {
    // const [savedFile, setSavedFile] = React.useState(null)
    const [progress, setProgress] = useState()

    const initialValues = {
        title: '',
        description: ''
    };

    const handleSubmit = (values) => {
        // e.preventDefault();
        const body = convertToFormData(values);
        const file = document.getElementById('media-file');
        if (file && file.files.length > 0) body.append('file', file.files[0]);

        axiosInstance.post("/wp/v2/media", body, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress: data => {
                // Set the progress value to show the progress bar
                setProgress(Math.round((100 * data.loaded) / data.total))
            },
        })
    }

    return (
        <>
            <Formik
                initialValues={initialValues}
                // validate={values => {
                //     const errors = {};
                //     if (!values.username) {
                //         errors.username = 'Required';
                //     }
                //     if (!values.password) {
                //         errors.password = 'Required';
                //     }
                //     return errors;
                // }}
                onSubmit={handleSubmit}
            >
                {() => (
                    <Form>
                        <Grid container spacing={3}>
                            <Grid item lg={6} md={12} sm={12}>
                                <CustomFormLabel htmlFor="fname-text">Media File</CustomFormLabel>
                                <input
                                    id="media-file"
                                    type="file"
                                />

                                <CustomFormLabel htmlFor="fname-text">Title</CustomFormLabel>
                                <Field name="title" id="title" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Title" />
                            </Grid>
                            <Grid item lg={6} md={12} sm={12}>
                                <CustomFormLabel htmlFor="lname-text">Description</CustomFormLabel>
                                <Field name="description" id="description" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Description" />
                            </Grid>
                        </Grid>
                        <Box p={3}>
                            <Button variant="contained" color="primary" type="submit"
                                // disabled={isSubmitting} 
                                sx={{
                                    mr: 1,
                                }}>
                                Submit
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                type="button"
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Form>
                )}
            </Formik>
            <Typography variant="h4">Saved media</Typography>
            <Typography variant="body1">
                {progress && progress}
                {/* {savedFile && JSON.stringify(savedFile)} */}
            </Typography>
        </>
    );
};

export default MediaUploaderForm;
