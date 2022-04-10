import React from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

const ProjectBox = ({ row }) => (
    <Card
        sx={{
            backgroundColor: (theme) => theme.palette.secondary.main,
            color: 'white',
        }}
    >
        <Link
            to={`/posts?project_id=${row.id}`}
            style={{
                textDecoration: 'none',
            }}
        >
            <CardContent sx={{
                paddingLeft: '0',
                paddingRight: '0',
                paddingBottom: '16px !important'
            }}>
                <Typography
                    variant="h1"
                    fontWeight="500"
                    textAlign="center"
                    sx={{
                        color: (theme) => theme.palette.primary.main,
                    }}
                >
                    {row.title.rendered}
                </Typography>
            </CardContent>
        </Link>
    </Card>
);

export default ProjectBox;
