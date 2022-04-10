import React from 'react';
import { Card, CardContent, Grid, Typography } from '@material-ui/core';
import FeatherIcon from 'feather-icons-react';
import { Link } from 'react-router-dom';
import PageContainer from '../../components/container/PageContainer';
import axiosInstance from '../../utils/axios';
import ProjectBox from './dashboard-components/ProjectBox';


const Dashboard = () => {
	const [rows, setRows] = React.useState([]);

	React.useEffect(async () => {
		axiosInstance.get('/wp/v2/golditor-projects').then((result) => {
			setRows(result.data)
		})
	}, [])

	return (
		<PageContainer title="Analytical Dashboard" description="this is Analytical Dashboard">
			<Grid container spacing={0}>
				{rows.map((row) => (
					<Grid key={`projectBox_${row.id}`} item xs={4} lg={3} sm={3}>
						<ProjectBox row={row} />
					</Grid>
				))}
				<Grid item xs={4} lg={3} sm={3}>
					<Card sx={{
							backgroundColor: (theme) => theme.palette.secondary.main,
							color: 'white',
							cursor: 'pointer'
						}}
					>
						<Link
							to="/projects/add"
							style={{
								textDecoration: 'none',
							}}
						>
							<CardContent sx={{
								padding: '0',
								paddingBottom: '0 !important'
							}}>
								<Typography
									fontWeight="500"
									textAlign="center"
									sx={{
										color: (theme) => theme.palette.primary.main,
									}}
								>
									<FeatherIcon size="70" icon="plus" />
								</Typography>
							</CardContent>
						</Link>
					</Card>
				</Grid>
			</Grid>
		</PageContainer>
	)
};

export default Dashboard;
