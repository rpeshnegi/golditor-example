/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import {
    Typography,
    Box,
    Table,
    TableBody,
    TableRow,
    TableCell,
    LinearProgress,
    IconButton,
    Avatar,
    Tooltip,
    Grid,
    Card,
    CardContent,
    Stack,
    Button,
} from '@material-ui/core';
import FeatherIcon from 'feather-icons-react';
import { Link, useLocation } from 'react-router-dom';
import DashboardCard from '../../components/base-card/DashboardCard';
import axiosInstance from '../../utils/axios';
import ListingAction from '../../components/listing/ListingAction';
import BaseCard from '../../components/base-card/BaseCard';

const PostList = ({ rows }) => {
    const [projects, setProjects] = React.useState([])
    const [init, setInit] = React.useState(false)
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const Capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    React.useEffect(async () => {
        // const getProjects = () => {
        //     axiosInstance.get('/wp/v2/golditor-projects').then((result) => {
        //         setProjects(result.data)
        //         console.log(result.data)
        //     })
        // }
        // getProjects()
        setInit(true)
        return () => { }
    }, [])
    
    const deleteHandler = (id) => {

    };
    return (
        init &&
        <DashboardCard title="Posts"
            action={
                <Link
                    to="/posts/add"
                    style={{
                        textDecoration: 'none',
                    }}
                >
                    <Button variant="contained" color="primary" type="submit">
                        Add new
                    </Button>
                </Link>
            }
        >
            <Table
                sx={{
                    whiteSpace: {
                        xs: 'nowrap',
                        sm: 'unset',
                    },
                }}
            >
                <TableBody>
                    {rows.length > 0 && rows.map((row) => (
                        <TableRow key={row.id}>
                            <TableCell
                                sx={{
                                    pl: 0,
                                }}
                            >
                                <Box display="flex" alignItems="center">
                                    <Box
                                        sx={{
                                            ml: 2,
                                        }}
                                    >
                                        <Typography variant="h5">{row.title.rendered.replace('Private: ', '')}</Typography>
                                    </Box>
                                </Box>
                            </TableCell>
                            <TableCell
                                sx={{
                                    pl: 0,
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 1,
                                    }}
                                >
                                    {projects.filter(project => project.id === row.customer[0])[0]?.name}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Box display="flex" alignItems="center">
                                    <Box
                                        sx={{
                                            backgroundColor:
                                                row.status === 'Active'
                                                    ? (theme) => theme.palette.success.main
                                                    : row.status === 'Pending'
                                                        ? (theme) => theme.palette.warning.main
                                                        : row.status === 'Completed'
                                                            ? (theme) => theme.palette.primary.main
                                                            : row.status === 'Cancel'
                                                                ? (theme) => theme.palette.error.main
                                                                : (theme) => theme.palette.secondary.main,
                                            borderRadius: '100%',
                                            height: '10px',
                                            width: '10px',
                                        }}
                                    />
                                    <Typography
                                        color="textSecondary"
                                        variant="body1"
                                        fontWeight="400"
                                        sx={{
                                            ml: 1,
                                        }}
                                    >
                                        {row.status}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Typography color="textSecondary" variant="body1" fontWeight="400">
                                    {row.date}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <ListingAction route="posts" row={row} />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </DashboardCard >
    );
};

export default PostList
