import React from 'react';
import { Grid, Box, Typography, FormGroup, FormControlLabel, Button, Alert } from '@material-ui/core';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import GoogleIcon from '@material-ui/icons/Google';
import FacebookIcon from '@material-ui/icons/Facebook';
import TwitterIcon from '@material-ui/icons/Twitter';
import { Formik, Form, Field } from 'formik';
import { useDispatch } from 'react-redux';
import CustomCheckbox from '../../components/forms/custom-elements/CustomCheckbox';
import CustomTextField from '../../components/forms/custom-elements/CustomTextField';
import CustomFormLabel from '../../components/forms/custom-elements/CustomFormLabel';
import PageContainer from '../../components/container/PageContainer';

import img1 from '../../assets/images/backgrounds/login-bg.svg';
import LogoIcon from '../../layouts/full-layout/logo/LogoIcon';
import { ADD_SNACKBAR_MSG, LOGIN } from '../../redux/constants';
import axiosInstance from '../../utils/axios';

const Login = () => {
    const [cookies, setCookie] = useCookies([]);
    console.log(cookies)
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const [showError, setShowError] = React.useState()

    const initialValues = {
        username: '',
        password: ''
    };

    const handleSubmit = (values, { setSubmitting }) => {
        // e.preventDefault();
        axiosInstance.post('/jwt-auth/v1/token', values).then(result => {
            if (result.data.token) {
                let AUTH_USER = result.data
                window.localStorage.setItem('AUTH_USER', JSON.stringify(AUTH_USER)); // set storage for token
                axiosInstance.get('/wp/v2/users/me').then(user => {
                    AUTH_USER = { ...AUTH_USER, ...user.data }
                    const expires = new Date(Date.now() + 1000 * 60 * 60)
                    setCookie('AUTH-SESSION', 'true', { path: '/', expires })
                    dispatch({
                        type: LOGIN,
                        payload: AUTH_USER
                    })
                    dispatch({
                        type: ADD_SNACKBAR_MSG,
                        payload: `LoggedIn successfully.`
                    })
                    navigate('/dashboard')
                })
            }
            setSubmitting(false);
        }).catch((error) => {
            console.log(error);
            setSubmitting(false);
            setShowError(error.response ? error.response.data.message : error.toString())
        });
    }

    return (
        <PageContainer title="Login" description="this is Login page">
            <Grid container spacing={0} sx={{ height: '100vh', justifyContent: 'center' }}>
                <Grid
                    item
                    xs={12}
                    sm={12}
                    lg={6}
                    sx={{
                        background: (theme) => `${theme.palette.mode === 'dark' ? '#1c1f25' : '#ffffff'}`,
                    }}
                >
                    <Box
                        sx={{
                            position: 'relative',
                        }}
                    >
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            sx={{
                                position: {
                                    xs: 'relative',
                                    lg: 'absolute',
                                },
                                height: { xs: 'auto', lg: '100vh' },
                                right: { xs: 'auto', lg: '-50px' },
                                margin: '0 auto',
                            }}
                        >
                            <img
                                src={img1}
                                alt="bg"
                                style={{
                                    width: '100%',
                                    maxWidth: '812px',
                                }}
                            />
                        </Box>

                        <Box
                            sx={{
                                p: 4,
                                position: 'absolute',
                                top: '0',
                            }}
                        >
                            <LogoIcon />
                        </Box>
                    </Box>
                </Grid>
                <Grid item xs={12} sm={8} lg={6} display="flex" alignItems="center">
                    <Grid container spacing={0} display="flex" justifyContent="center">
                        <Grid item xs={12} lg={9} xl={6}>
                            <Box
                                sx={{
                                    p: 4,
                                }}
                            >
                                <Typography fontWeight="700" variant="h2">
                                    Willkommen zum Golditor
                                </Typography>
                                <Box display="flex" alignItems="center">
                                    <Typography
                                        color="textSecondary"
                                        variant="h6"
                                        fontWeight="500"
                                        sx={{
                                            mr: 1,
                                        }}
                                    >
                                        Neu beim Golditor?
                                    </Typography>
                                    <Typography
                                        component={Link}
                                        to="/auth/register"
                                        fontWeight="500"
                                        sx={{
                                            display: 'block',
                                            textDecoration: 'none',
                                            color: 'primary.main',
                                        }}
                                    >
                                        Create an account
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        mt: 4,
                                    }}
                                >
                                    {showError &&
                                        <Alert variant="filled" severity="error" onClose={() => setShowError(null)}>{showError}</Alert>
                                    }
                                    <Formik
                                        initialValues={initialValues}
                                        validate={values => {
                                            const errors = {};
                                            if (!values.username) {
                                                errors.username = 'Required';
                                            }
                                            if (!values.password) {
                                                errors.password = 'Required';
                                            }
                                            return errors;
                                        }}
                                        onSubmit={handleSubmit}
                                    >
                                        {({ isSubmitting }) => (
                                            <Form>
                                                <CustomFormLabel htmlFor="username">Username</CustomFormLabel>
                                                <Field name="username" id="username" variant="outlined" fullWidth as={CustomTextField} placeholder="Username" />
                                                <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
                                                <Field name="password" type="password" id="password" variant="outlined" fullWidth as={CustomTextField} placeholder="Password" sx={{
                                                    mb: 3,
                                                }} />

                                                <Box
                                                    sx={{
                                                        display: {
                                                            xs: 'block',
                                                            sm: 'flex',
                                                            lg: 'flex',
                                                        },
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <FormGroup>
                                                        <FormControlLabel
                                                            control={<CustomCheckbox defaultChecked />}
                                                            label="Remeber this Device"
                                                            sx={{
                                                                mb: 2,
                                                            }}
                                                        />
                                                    </FormGroup>
                                                    <Box
                                                        sx={{
                                                            ml: 'auto',
                                                        }}
                                                    >
                                                        <Typography
                                                            component={Link}
                                                            to="/auth/reset-password"
                                                            fontWeight="500"
                                                            sx={{
                                                                display: 'block',
                                                                textDecoration: 'none',
                                                                mb: '16px',
                                                                color: 'primary.main',
                                                            }}
                                                        >
                                                            Forgot Password ?
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Button
                                                    color="secondary"
                                                    variant="contained"
                                                    size="large"
                                                    disabled={isSubmitting}
                                                    fullWidth
                                                    type="submit"
                                                    sx={{
                                                        pt: '10px',
                                                        pb: '10px',
                                                    }}
                                                >
                                                    Sign In
                                                </Button>
                                            </Form>
                                        )}
                                    </Formik>
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            textAlign: 'center',
                                            mt: '20px',
                                            mb: '20px',
                                            '&::before': {
                                                content: '""',
                                                background: (theme) =>
                                                    `${theme.palette.mode === 'dark' ? '#42464d' : '#ecf0f2'}`,
                                                height: '1px',
                                                width: '100%',
                                                position: 'absolute',
                                                left: '0',
                                                top: '13px',
                                            },
                                        }}
                                    >
                                        <Typography
                                            component="span"
                                            color="textSecondary"
                                            variant="h6"
                                            fontWeight="400"
                                            sx={{
                                                position: 'relative',
                                                padding: '0 12px',
                                                background: (theme) =>
                                                    `${theme.palette.mode === 'dark' ? '#282c34' : '#fff'}`,
                                            }}
                                        >
                                            or sign in with
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Button
                                            variant="outlined"
                                            size="large"
                                            display="flex"
                                            alignitems="center"
                                            justifycontent="center"
                                            sx={{
                                                width: '100%',
                                                borderColor: (theme) =>
                                                    `${theme.palette.mode === 'dark' ? '#42464d' : '#dde3e8'}`,
                                                borderWidth: '2px',
                                                textAlign: 'center',
                                                mt: 2,
                                                pt: '10px',
                                                pb: '10px',
                                                '&:hover': {
                                                    borderColor: (theme) =>
                                                        `${theme.palette.mode === 'dark' ? '#42464d' : '#dde3e8'}`,
                                                    borderWidth: '2px',
                                                },
                                            }}
                                        >
                                            <Box display="flex" alignItems="center">
                                                <GoogleIcon
                                                    sx={{
                                                        color: (theme) => theme.palette.error.main,
                                                    }}
                                                />
                                                <Typography
                                                    variant="h6"
                                                    sx={{
                                                        ml: 1,
                                                        color: (theme) =>
                                                            `${theme.palette.mode === 'dark' ? theme.palette.grey.A200 : '#13152a'
                                                            }`,
                                                    }}
                                                >
                                                    Google
                                                </Typography>
                                            </Box>
                                        </Button>
                                    </Box>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6} lg={6}>
                                            <Button
                                                variant="outlined"
                                                size="large"
                                                display="flex"
                                                alignitems="center"
                                                justifycontent="center"
                                                sx={{
                                                    width: '100%',
                                                    borderColor: (theme) =>
                                                        `${theme.palette.mode === 'dark' ? '#42464d' : '#dde3e8'}`,
                                                    borderWidth: '2px',
                                                    textAlign: 'center',
                                                    mt: 2,
                                                    pt: '10px',
                                                    pb: '10px',
                                                    '&:hover': {
                                                        borderColor: (theme) =>
                                                            `${theme.palette.mode === 'dark' ? '#42464d' : '#dde3e8'}`,
                                                        borderWidth: '2px',
                                                    },
                                                }}
                                            >
                                                <Box display="flex" alignItems="center">
                                                    <FacebookIcon
                                                        sx={{
                                                            color: (theme) => theme.palette.secondary.main,
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            ml: 1,
                                                            color: (theme) =>
                                                                `${theme.palette.mode === 'dark' ? theme.palette.grey.A200 : '#13152a'
                                                                }`,
                                                        }}
                                                    >
                                                        Facebook
                                                    </Typography>
                                                </Box>
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12} sm={6} lg={6}>
                                            <Button
                                                variant="outlined"
                                                size="large"
                                                display="flex"
                                                alignitems="center"
                                                justifycontent="center"
                                                sx={{
                                                    width: '100%',
                                                    borderColor: (theme) =>
                                                        `${theme.palette.mode === 'dark' ? '#42464d' : '#dde3e8'}`,
                                                    borderWidth: '2px',
                                                    textAlign: 'center',
                                                    mt: 2,
                                                    pt: '10px',
                                                    pb: '10px',
                                                    '&:hover': {
                                                        borderColor: (theme) =>
                                                            `${theme.palette.mode === 'dark' ? '#42464d' : '#dde3e8'}`,
                                                        borderWidth: '2px',
                                                    },
                                                }}
                                            >
                                                <Box display="flex" alignItems="center">
                                                    <TwitterIcon
                                                        sx={{
                                                            color: (theme) => theme.palette.primary.main,
                                                        }}
                                                    />
                                                    <Typography
                                                        variant="h6"
                                                        sx={{
                                                            ml: 1,
                                                            color: (theme) =>
                                                                `${theme.palette.mode === 'dark' ? theme.palette.grey.A200 : '#13152a'
                                                                }`,
                                                        }}
                                                    >
                                                        Twitter
                                                    </Typography>
                                                </Box>
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        </PageContainer>
    )
};

export default Login;
