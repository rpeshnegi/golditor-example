/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import {
    Grid, Box, Button, CardActions, Card, CardHeader, CardContent, Divider, LinearProgress, IconButton
} from '@material-ui/core';
import { useParams, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import FeatherIcon from 'feather-icons-react';
import CustomTextField from '../../components/forms/custom-elements/CustomTextField';
import CustomSelect from '../../components/forms/custom-elements/CustomSelect';
import CustomFormLabel from '../../components/forms/custom-elements/CustomFormLabel';
import CustomErrorMessage from '../../components/forms/custom-elements/CustomErrorMessage';
import { ADD_SNACKBAR_MSG, SHOW_SNACKBAR_ERROR, UPDATE_SOCIAL_AUTH } from '../../redux/constants';
import axiosInstance from '../../utils/axios';
import { deleteRecord } from '../../utils/common';
import SocialMediaForm from './SocialMediaForm';
import ChunksUpload from '../../utils/ChunksUpload';
import MediaUploader from '../../components/MediaUploader/MediaUploader';

const validations = Yup.object().shape({
    title: Yup.string().required('Required'),
    content: Yup.string().required('Required'),
    fields: Yup.object().shape({
        "golditor-tags": Yup.string().required('Required'),
    }),
}).when((values, schema) => {
    if (!values.id) { // checked ID for validation of file, because presaved post surely has both files
        return schema.shape({
            // video: Yup.object().required('Required'),
            // preview: Yup.object().required('Required'),
        });
    }
    return schema.shape({});
});


const PostForm = () => {
    const AUTH_USER = useSelector((state) => state.UserReducer.user);
    const dispatch = useDispatch();
    const [projects, setProjects] = React.useState([]) // used for selectbox
    const [projectOptions, setProjectOptions] = React.useState([]) // used for selectbox
    const [moduleData, setModuleData] = React.useState() // post data
    const [mediaFiles, setMediaFiles] = React.useState([]) // mediaFiles uploaded file and used var to handle 
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [progress, setProgress] = useState({ video: 0, preview: 0 }) // handling files upload progress
    const [filesLinked, setFilesLinked] = useState(0) // handling files has been linked
    const navigate = useNavigate()
    const { id } = useParams()

    const initialValues = {
        id: moduleData?.id || undefined,
        title: moduleData?.title || '',
        content: moduleData?.content || '',
        video: mediaFiles?.video,
        preview: mediaFiles?.preview,
        fields: {
            "golditor-tags": moduleData?.acf['golditor-tags'] || '',
            "golditor-project": moduleData?.acf['golditor-project']?.ID || '',
            "youtube_data": moduleData?.acf.youtube_data || '',
        },
        status: 'private',
        author: AUTH_USER.id
    };

    useEffect(() => {
        axiosInstance.get('/wp/v2/golditor-projects').then((result) => {
            const tempProjects = result.data
            setProjects(result.data)
            setProjectOptions(result.data.map((item) => ({ value: item.id, title: item.title.rendered })))
            if (id) {
                axiosInstance.get(`/wp/v2/golditor-campaigns/${id}`).then((response) => {
                    const postRes = response.data
                    Object.assign(postRes, {
                        title: response.data.title.rendered.replace('Private: ', ''),
                        content: response.data.content.rendered.replace(/<(.|\n)*?>/g, '')
                    })
                    setModuleData(response.data)
                    const tmpModule = response.data
                    if (tempProjects.length > 0 && tmpModule) {
                        const projectData = tempProjects.filter((item) => item.id === +(tmpModule.acf['golditor-project']?.ID))
                        dispatch({
                            type: UPDATE_SOCIAL_AUTH,
                            payload: projectData[0]?.social_auth_details ? JSON.parse(projectData[0]?.social_auth_details) : {}
                        })
                    }
                })
                axiosInstance.get(`/wp/v2/media?parent=${id}`).then((response) => {
                    setMediaFiles(response.data)
                })
            }
        })
    }, [id])

    useEffect(() => {
        if (mediaFiles.length > 0 && filesLinked === mediaFiles.length) {
            setIsSubmitting(false);
            dispatch({
                type: ADD_SNACKBAR_MSG,
                payload: `Post has been ${id ? 'updated' : 'added'} successfully.`
            })
            navigate(`/posts/edit/${moduleData.id}`)
        }
    }, [filesLinked])

    const linkFile = (postId, media) => {
        // eslint-disable-next-line no-useless-concat
        axiosInstance.post('/wp/v2/media' + `/${media.id}`, { id: media.id, post: postId }).then(() => {
            setFilesLinked((state) => (state + 1))
        }).catch((error) => {
            console.log(error);
            dispatch({
                type: SHOW_SNACKBAR_ERROR,
                payload: { msg: 'Some error has been occured. Please try again.', error: true }
            })
        })
    }

    const handleSubmit = (values) => {
        // e.preventDefault();
        setIsSubmitting(true)
        // eslint-disable-next-line prefer-template
        axiosInstance.post('/wp/v2/golditor-campaigns' + (values.id !== undefined ? `/${values.id}` : ''), values).then((response) => {
            const postRes = response.data
            Object.assign(postRes, {
                title: response.data.title.rendered.replace('Private: ', ''),
                content: response.data.content.rendered.replace(/<(.|\n)*?>/g, '')
            })
            setModuleData(response.data)

            if (mediaFiles.length > 0) {
                mediaFiles.forEach((media) => {
                    linkFile(response.data.id, media)
                })
            } else {
                setIsSubmitting(false);
                dispatch({
                    type: ADD_SNACKBAR_MSG,
                    payload: `Post has been ${id ? 'updated' : 'added'} successfully.`
                })
                navigate(`/posts/edit/${response.data.id}`)
            }

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
            <Formik
                // eslint-disable-next-line react/jsx-boolean-value
                enableReinitialize={true}
                initialValues={initialValues}
                validationSchema={validations}
                onSubmit={handleSubmit}
            >
                {({ errors, setFieldValue }) => (
                    <Form>
                        <Card
                            sx={{
                                p: 0,
                            }}>
                            <CardHeader title="Add post" />
                            <Divider />
                            <CardContent>

                                <Grid container spacing={3}>
                                    <Grid item lg={6} md={12} sm={12}>
                                        <CustomFormLabel htmlFor="fname-text">Title</CustomFormLabel>
                                        <Field name="title" id="title" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Title" />
                                        <ErrorMessage name="title" component={CustomErrorMessage} />
                                    </Grid>
                                    <Grid item lg={6} md={12} sm={12}>
                                        <CustomFormLabel htmlFor="golditor-project">Project: </CustomFormLabel>
                                        <Field name="fields.golditor-project" id="golditor-project" variant="outlined" fullWidth size="small" menuitems={projectOptions} as={CustomSelect} />
                                    </Grid>
                                    <Grid item lg={6} md={12} sm={12}>
                                        <CustomFormLabel htmlFor="golditor-tags">Tags</CustomFormLabel>
                                        <Field multiline
                                            rows={4} name="fields.golditor-tags" id="golditor-tags" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Tags" />
                                        <ErrorMessage name="fields.golditor-tags" component={CustomErrorMessage} />
                                    </Grid>
                                    <Grid item lg={6} md={12} sm={12}>
                                        <CustomFormLabel htmlFor="content">Description</CustomFormLabel>
                                        <Field multiline
                                            rows={4} name="content" id="content" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Description" />
                                        <ErrorMessage name="content" component={CustomErrorMessage} />
                                    </Grid>
                                    <MediaUploader mediaFiles={mediaFiles} moduleData={moduleData} setMediaFiles={setMediaFiles}
                                        setFieldValue={setFieldValue} />
                                </Grid>

                            </CardContent>
                            <Divider />
                            <CardActions disableSpacing>
                                <Box p={1}>
                                    <Button variant="contained" color="primary" type="submit"
                                        disabled={Object.keys(errors).length > 0 || isSubmitting} sx={{
                                            mr: 1,
                                        }}>
                                        Submit
                                    </Button>
                                    <Link
                                        to="/posts"
                                        style={{
                                            textDecoration: 'none',
                                        }}
                                    >
                                        <Button
                                            disabled={isSubmitting}
                                            variant="contained"
                                            color="error"
                                            type="button"
                                        >
                                            Cancel
                                        </Button>
                                    </Link>
                                </Box>
                            </CardActions>
                        </Card>
                    </Form>
                )}
            </Formik >

            {moduleData && <SocialMediaForm moduleData={moduleData} setModuleData={setModuleData} mediaFiles={mediaFiles} projects={projects} />}
        </>
    );
};

export default PostForm;
