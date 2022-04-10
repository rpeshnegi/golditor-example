import * as React from 'react';
import { useLocation } from 'react-router';
import Breadcrumb from '../../layouts/full-layout/breadcrumb/Breadcrumb';
import PageContainer from '../../components/container/PageContainer';
import axiosInstance from '../../utils/axios';
import PostList from './PostList';

const BCrumb = [
    {
        to: '/',
        title: 'Home',
    },
    {
        title: 'Kampagnen',
    },
];

const Post = () => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const [rows, setRows] = React.useState([]);

    React.useEffect(async () => {
        // eslint-disable-next-line prefer-template
        axiosInstance.get('/wp/v2/golditor-campaigns?status=private' + ((query.get('project_id')) ? '&project=' + query.get('project_id') : '')).then(posts => {
            setRows(posts.data)
        })
    }, [])

    return (
        <PageContainer title="Enhanced Table" description="this is Enhanced Table page">
            {/* breadcrumb */}
            <Breadcrumb title="" items={BCrumb} />
            {/* end breadcrumb */}
            <PostList rows={rows} />
        </PageContainer >
    );
};

export default Post;
