const RoutesMenu = [
    {
        navlabel: true,
        subheader: 'Dashboard',
        icon: 'mdi mdi-dots-horizontal',
    },
    {
        "title": "Dashboard",
        "slug": "dashboard",
        "componentPath": 'dashboard/Dashboard',
        icon: 'pie-chart',
        href: '/',
    },
    {
        title: 'Kampagnen',
        icon: 'list',
        collapse: true,
        children: [
          {
            title: 'Alle Einträge',
            icon: 'list',
            href: '/posts',
          },
          {
            title: 'Neu erstellen',
            icon: 'plus',
            href: '/posts/add',
          },
        ],
      },
      {
          "title": "Projekte",
          icon: 'users',
          children: [
            {
              title: 'Alle Projekte',
              icon: 'list',
              href: '/projects',
            }    
          ]
      },
    // {
    //     "title": "Social Uploader",
    //     "slug": "social-uploader",
    //     "path": 'social/Uploader',
    //     icon: 'pie-chart',
    //     href: '/social-uploader',
    // },
    {
        "title": "Sample page",
        "slug": "sample-page",
        "componentPath": 'dashboard/Dashboard',
        icon: 'pie-chart',
        href: '/sample-page',
    }
]

export default RoutesMenu