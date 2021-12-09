import React from 'react';
import { Grid, Card, CardContent, Typography, Divider, Box } from '@material-ui/core';
import { useSelector } from 'react-redux';

import Breadcrumb from '../../layouts/full-layout/breadcrumb/Breadcrumb';
import PageContainer from '../../components/container/PageContainer';
import YouTubeForm from '../../components/YouTube/YouTubeForm';

const Uploader = (props) => {
	const AUTH_USER = useSelector((state) => state.UserReducer.user);
	const { pageData } = props

	return (
		<PageContainer title="Dashboard" description="">
			{/* breadcrumb */}
			<Breadcrumb title={pageData && pageData.title.rendered} subtitle={`Welcome ${AUTH_USER.user_display_name}`} />
			{/* end breadcrumb */}
			<Grid container spacing={0}>
				{/* ------------------------- row 1 ------------------------- */}
				<Grid item xs={12} lg={12}>
					<Card>
						<Box
							sx={{
								padding: '15px 30px',
							}}
							display="flex"
							alignItems="center"
						>
							<Typography fontWeight="500" variant="h4">
								Media uploader
							</Typography>
						</Box>
						<Divider />

						<CardContent>
							<YouTubeForm />
						</CardContent>
					</Card>
				</Grid>
			</Grid>
		</PageContainer>
	);
}

export default Uploader;
