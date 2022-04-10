import React from 'react';
import { Grid } from '@material-ui/core';

import Breadcrumb from '../../layouts/full-layout/breadcrumb/Breadcrumb';
import PageContainer from '../../components/container/PageContainer';
import ProjectForm from './ProjectForm';

const BCrumb = [
	{
		to: '/',
		title: 'Home',
	},
	{
		title: 'Kunden',
		to: '/'
	},
	{
		title: 'Edit',
	}
];

const ProjectEdit = () => {

	return (
		<PageContainer title="Dashboard" description="">
			{/* breadcrumb */}
			<Breadcrumb title="" items={BCrumb} />
			{/* end breadcrumb */}
			<Grid container spacing={0}>
				{/* ------------------------- row 1 ------------------------- */}
				<Grid item lg={12} md={12} xs={12}>
					<ProjectForm />
				</Grid>
			</Grid>
		</PageContainer>
	);
}

export default ProjectEdit