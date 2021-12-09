import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@material-ui/core/styles';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Toolbar,
    IconButton,
    Tooltip,
    Typography,
} from '@material-ui/core';
import { visuallyHidden } from '@material-ui/utils';
import FeatherIcon from 'feather-icons-react';
// import CustomCheckbox from '../../components/forms/custom-elements/CustomCheckbox';
import Breadcrumb from '../../layouts/full-layout/breadcrumb/Breadcrumb';
import PageContainer from '../../components/container/PageContainer';
import axiosInstance from '../../utils/axios';
import BaseCard from '../../components/base-card/BaseCard';
import ListingAction from '../../components/listing/ListingAction';

function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

const headCells = [
    {
        id: 'title',
        numeric: false,
        disablePadding: false,
        label: 'Titel',
    },
    {
        id: 'customer',
        numeric: false,
        disablePadding: false,
        label: 'Kunde',
    },
    // {
    //     id: 'author',
    //     numeric: false,
    //     disablePadding: false,
    //     label: 'Author',
    // },
    {
        id: 'status',
        numeric: false,
        disablePadding: false,
        label: 'Status',
    },
    {
        id: 'date',
        numeric: false,
        disablePadding: false,
        label: 'Datum',
    },
    {
        id: 'action',
        numeric: false,
        disablePadding: false,
        label: 'Action',
    }
];

function EnhancedTableHead(props) {
    // const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const { order, orderBy, onRequestSort } = props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {/* <TableCell padding="checkbox">
                    <CustomCheckbox
                        color="primary"
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputprops={{
                            'aria-label': 'select all desserts',
                        }}
                    />
                </TableCell> */}
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            <Typography variant="subtitle1" fontWeight="500">
                                {headCell.label}
                            </Typography>
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    // numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    // onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    // rowCount: PropTypes.number.isRequired,
};

const EnhancedTableToolbar = (props) => {
    const { numSelected } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                }),
            }}
        >
            {numSelected > 0 ? (
                <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle2" component="div">
                    {numSelected} selected
                </Typography>
            ) : (''
                // <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
                //     Filter
                // </Typography>
            )}

            {numSelected > 0 ? (
                <Tooltip title="Delete">
                    <IconButton>
                        <FeatherIcon icon="trash-2" width="18" />
                    </IconButton>
                </Tooltip>
            ) : (''
                // <Tooltip title="Filter list">
                //     <IconButton>
                //         <FeatherIcon icon="filter" width="18" />
                //     </IconButton>
                // </Tooltip>
            )}
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
};

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
    const [order, setOrder] = React.useState('asc');
    const [rows, setRows] = React.useState([]);
    const [customers, setCustomers] = React.useState([])
    const [orderBy, setOrderBy] = React.useState('calories');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    React.useEffect(async () => {
        axiosInstance.get('/wp/v2/customer').then((result) => {
            setCustomers(result.data)
        })
        axiosInstance.get('/wp/v2/golditor-campaigns?status=private').then(posts => {
            setRows(posts.data)
        })
    }, [])

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelecteds = rows.map((n) => n.name);
            setSelected(newSelecteds);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isSelected = (name) => selected.indexOf(name) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    return (
        <PageContainer title="Enhanced Table" description="this is Enhanced Table page">
            {/* breadcrumb */}
            <Breadcrumb title="" items={BCrumb} />
            {/* end breadcrumb */}
            <BaseCard title="All posts">
                <Box>
                    {selected.length > 0 && <EnhancedTableToolbar numSelected={selected.length} />}
                    <TableContainer>
                        <Table
                            sx={{ minWidth: 750 }}
                            aria-labelledby="tableTitle"
                            size='small'
                        >
                            <EnhancedTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick}
                                onRequestSort={handleRequestSort}
                                rowCount={rows.length}
                            />
                            <TableBody>
                                {stableSort(rows, getComparator(order, orderBy))
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row) => {
                                        const isItemSelected = isSelected(row.name);
                                        // const labelId = `enhanced-table-checkbox-${index}`;

                                        return (
                                            <TableRow
                                                hover
                                                onClick={(event) => handleClick(event, row.name)}
                                                role="checkbox"
                                                aria-checked={isItemSelected}
                                                tabIndex={-1}
                                                key={row.id}
                                                selected={isItemSelected}
                                            >
                                                {/* <TableCell padding="checkbox">
                                                        <CustomCheckbox
                                                            color="primary"
                                                            checked={isItemSelected}
                                                            inputprops={{
                                                                'aria-labelledby': labelId,
                                                            }}
                                                        />
                                                    </TableCell> */}
                                                <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        <Box
                                                            sx={{
                                                                ml: 2,
                                                            }}
                                                        >
                                                            <Typography variant="h6" fontWeight="600">
                                                                {row.title.rendered.replace('Private: ', '')}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography color="textSecondary" variant="h6" fontWeight="400">
                                                        {customers.filter(customer => customer.id === row.customer[0])[0]?.name}
                                                    </Typography>
                                                </TableCell>
                                                {/* <TableCell>
                                                    <Box display="flex" alignItems="center">
                                                        ffff
                                                    </Box>
                                                </TableCell> */}
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
                                        );
                                    })}
                                {emptyRows > 0 && (
                                    <TableRow
                                        style={{
                                            height: 33 * emptyRows,
                                        }}
                                    >
                                        <TableCell colSpan={6} />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Box>
            </BaseCard>
        </PageContainer >
    );
};

export default Post;