import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Dashboard from '../views/dashboard/Dashboard';
import WpPageView from '../views/wp-page-view/WpPageView';

/* ***Layouts**** */
const FullLayout = lazy(() => import('../layouts/full-layout/FullLayout'));
const BlankLayout = lazy(() => import('../layouts/blank-layout/BlankLayout'));
/* ***End Layouts**** */

const Error = lazy(() => import('../views/authentication/Error'));

/* ****Pages***** */
// const Dashboard = lazy(() => import('../views/dashboard/Dashboard'));
/* ****Routes***** */

const Login = lazy(() => import('../views/authentication/Login'));
const Register = lazy(() => import('../views/authentication/Register'));
const ResetPassword = lazy(() => import('../views/authentication/ResetPassword'));
const Post = lazy(() => import('../views/post/Post'));
const PostAdd = lazy(() => import('../views/post/PostAdd'));
const PostEdit = lazy(() => import('../views/post/PostEdit'));
const Project = lazy(() => import('../views/project/Project'));
const ProjectAdd = lazy(() => import('../views/project/ProjectAdd'));
const ProjectEdit = lazy(() => import('../views/project/ProjectEdit'));

const SocialMedia = lazy(() => import('../views/authentication/SocialMedia'));

const Router = (isAuthenticated) => [
    {
        path: '/',
        element: isAuthenticated ? <FullLayout /> : <Navigate to="/auth/login" />,
        children: [
            { path: '/', element: <Dashboard /> }
        ],
    },
    {
        path: '/posts',
        element: isAuthenticated ? <FullLayout /> : <Navigate to="/auth/login" />,
        children: [
            { path: '/posts', element: <Post /> },
            { path: '/posts/add', element: <PostAdd /> },
            { path: '/posts/edit/:id', element: <PostEdit /> },
        ],
    },
    {
        path: '/projects',
        element: isAuthenticated ? <FullLayout /> : <Navigate to="/auth/login" />,
        children: [
            { path: '/projects', element: <Project /> },
            { path: '/projects/add', element: <ProjectAdd /> },
            { path: '/projects/edit/:id', element: <ProjectEdit /> },
        ],
    },
    {
        path: '/:slug',
        element: isAuthenticated ? <FullLayout /> : <Navigate to="/auth/login" />,
        children: [
            { path: '/:slug', element: <WpPageView /> },
        ],
    },
    {
        path: '/auth',
        element: <BlankLayout />,
        children: [
            { path: '404', element: <Error /> },
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },
            { path: 'reset-password', element: <ResetPassword /> },
            { path: 'social-media', element: isAuthenticated ? <SocialMedia /> : <Navigate to="/auth/login" /> },
            { path: '*', element: <Navigate to="/auth/404" /> },
        ],
    },
];

export default Router;
