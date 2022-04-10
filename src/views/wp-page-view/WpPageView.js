import React, { lazy, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import axiosInstance from '../../utils/axios';
import RoutesMenu from '../../layouts/full-layout/RoutesMenu';



const WpPageView = () => {
	const { slug } = useParams()
	const [Component, setComponent] = useState(null)
	const [pageData, setPageData] = useState(null)

	// console.log('Component', slug)

	useEffect(() => {
		if (slug) {
			let componentPath = RoutesMenu.filter(route => (route.slug === slug))
			componentPath = componentPath.length > 0 ? componentPath[0].componentPath : 'authentication/Error'
			axiosInstance.get(`/wp/v2/pages/?slug=${slug}`).then((res) => {
				setPageData(res.data.length > 0 ? res[0] : null)
				const LazyCompo = lazy(() => import(`../../views/${componentPath}`));
				setComponent(LazyCompo)
			})
		} else {
			setComponent(null)
		}
	}, [slug])

	return (
		<div>
			{Component ? <Component pageData={pageData} /> : ''}
		</div>
	)
};

export default WpPageView;
