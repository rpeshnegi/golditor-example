import React from 'react';
import { Grid } from '@material-ui/core';
import {
	WelcomeCard,
	Earnings,
	MonthlySales,
	SalesOverview
} from './dashboard-components';
import PageContainer from '../../components/container/PageContainer';


const Dashboard = () => (
	// 2

	<PageContainer title="Analytical Dashboard" description="this is Analytical Dashboard">
		<Grid container spacing={0}>
			{/* ------------------------- row 1 ------------------------- */}
			<Grid item xs={12} lg={6}>
				<WelcomeCard />
				<Grid container spacing={0}>
					<Grid item xs={12} lg={6} sm={6}>
						<Earnings />
					</Grid>
					<Grid item xs={12} lg={6} sm={6}>
						<MonthlySales />
					</Grid>
				</Grid>
			</Grid>
			<Grid item xs={12} lg={6}>
				<SalesOverview />
			</Grid>
		</Grid>
	</PageContainer>
);

export default Dashboard;
