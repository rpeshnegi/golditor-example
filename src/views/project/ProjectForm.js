import React, { useEffect } from 'react';
import {
    Grid, Box, Button, CardActions, Card, CardHeader, CardContent, Divider
} from '@material-ui/core';
import { useParams, Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import CustomTextField from '../../components/forms/custom-elements/CustomTextField';
import CustomFormLabel from '../../components/forms/custom-elements/CustomFormLabel';
import CustomErrorMessage from '../../components/forms/custom-elements/CustomErrorMessage';
import { SHOW_SNACKBAR_ERROR } from '../../redux/constants';
import axiosInstance from '../../utils/axios';

const validations = Yup.object().shape({
    title: Yup.string().required('Required')
}).when((values, schema) => {
    if (!values.id) { // checked ID for validation of file, because presaved post surely has both files
        return schema.shape({
            // video: Yup.object().required('Required'),
            // preview: Yup.object().required('Required'),
        });
    }
    return schema.shape({});
});


const ProjectForm = () => {
    const AUTH_USER = useSelector((state) => state.UserReducer.user);
    const dispatch = useDispatch();
    const [moduleData, setModuleData] = React.useState() // post data
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const navigate = useNavigate()
    const { id } = useParams()

    const initialValues = {
        id: moduleData?.id || undefined,
        title: moduleData?.title.rendered || '',
        author: AUTH_USER.id,
        fields: {
            "social_auth_details": moduleData?.social_auth_details || ''
        }
    };

    useEffect(() => {
        if (id) {
            axiosInstance.get(`/wp/v2/golditor-projects/${id}`).then((result) => {
                setModuleData(result.data)
            })
        }
    }, [id])

    const handleSubmit = (values) => {
        // e.preventDefault();
        setIsSubmitting(true)
        // eslint-disable-next-line prefer-template
        axiosInstance.post('/wp/v2/golditor-projects' + (values.id !== undefined ? `/${values.id}` : ''), values).then(() => {
            navigate(`/`)
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
                {({ errors }) => (
                    <Form>
                        <Card
                            sx={{
                                p: 0,
                            }}>
                            <CardHeader title="Add customer" />
                            <Divider />
                            <CardContent>
                                <Grid container spacing={3}>
                                    <Grid item lg={6} md={12} sm={12}>
                                        <CustomFormLabel htmlFor="title">Title</CustomFormLabel>
                                        <Field name="title" id="title" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Title" />
                                        <ErrorMessage name="title" component={CustomErrorMessage} />
                                    </Grid>
                                    <Grid item lg={6} md={12} sm={12}>
                                        <CustomFormLabel htmlFor="social_auth_details">Details</CustomFormLabel>
                                        <Field multiline
                                            rows={4} name="fields.social_auth_details" id="social_auth_details" variant="outlined" fullWidth size="small" as={CustomTextField} placeholder="Tags" />
                                        <ErrorMessage name="fields.social_auth_details" component={CustomErrorMessage} />
                                    </Grid>
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
        </>
    );
};

export default ProjectForm;
