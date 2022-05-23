import { AgGridReact } from 'ag-grid-react';
import React, { useState, useEffect, useContext } from 'react';
import { Button, Container, Row, Col, Form, Breadcrumb } from 'react-bootstrap';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
// import { useHistory } from 'react-router-dom';
// import { Link, useLocation } from 'react-router-dom';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { formatNumber } from '../../helpers/Utils';
import { CustomerContext } from '../../components/states/contexts/CustomerContext';
import ApiService from '../../helpers/ApiServices';
import AppLoader from '../../pcterp/components/AppLoader';
import AppContentForm from '../../pcterp/builder/AppContentForm';
import AppContentHeader from '../../pcterp/builder/AppContentHeader';
import AppContentBody from '../../pcterp/builder/AppContentBody';
const moment = require('moment');


export default function CustomersReport() {
    const [state, setState] = useState([]);
    const [columns, setColumns] = useState([]);
    const [loderStatus, setLoderStatus] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isChangeCustomerBtnVisible, setIsChangeCustomerBtnVisible] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState({});
    // const history = useHistory();

    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const useQuery = () => new URLSearchParams(useLocation().search);
    let query = useQuery();
    const stack = query.get('stack');

    const { addCustomer, removeCustomer, clearCustomer, updateCustomer, customer } = useContext(CustomerContext);

    function onGridReady(params) {
        setGridApi(params.api);
        setGridColumnApi(params.columnApi);
    }

    const handleSearch = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const handleExportAsCsv = (e) => {
        gridApi.exportDataAsCsv();
    }

    const columnsTopCustomersToWorstCustomer = [
        { headerName: 'Customer', field: 'customer', valueGetter: (params) => params?.data?._id?.customer ? params?.data?._id?.customer[0]?.name : 'Walk-In Customer', flex: 1 },
        { headerName: 'Product Name', field: 'productName', valueGetter: (params) => params.data?._id?.productName ? params.data?._id?.productName : 'Not Available', flex: 1 },
        { headerName: 'Total Quantity Sold', field: 'totalSoldQuantity', valueGetter: (params) => params.data?.totalSoldQuantity ? params.data?.totalSoldQuantity : 'Not Available', flex: 1 },
    ]

    useEffect(async () => {
        setLoderStatus("RUNNING");
        const response = await ApiService.get('cashSale/report?type=customer');
        console.log(response.data.document)
        setState(response.data.document);
        setColumns(columnsTopCustomersToWorstCustomer);
        setLoderStatus("SUCCESS");
    }, [])

    const handleRowSelection = e => {
        setIsChangeCustomerBtnVisible(true)
        console.log(e.data);
        // addCustomer(e.data);
        setSelectedCustomer(e.data);
        console.log(customer);
        // clearCustomer();
        console.log(customer);
        // addCustomer(e.data);
        // console.log(customer)
    }

    const handleSetCustomer = (currentCustomer) => {
        console.log(customer);
        console.log(currentCustomer);
        console.log(selectedCustomer);
        updateCustomer(currentCustomer);
        console.log(customer);


        if (stack === 'dashboard') navigate('/pos');
        if (stack === 'payment') navigate('/pos/payment');
        if (stack === 'refund') navigate('/pos/refund');
        //navigate("/pos");
        // history.goBack();
    }

    const handleBack = () => {
        // history.goBack();
        // if (stack === 'dashboard')navigate('/pos');
        // if (stack === 'payment')navigate('/pos/payment');
        // if (stack === 'refund')navigate('/pos/refund');
        navigate('/pos');
    }

    const handleReportsTable = async (option) => {
        console.log(option);

        if (option === 'topSellingToWorstSelling') {
            const response = await ApiService.get('product/report?type=customer');
            console.log(response.data.documents)
            setState(response.data.documents);
            setColumns(columnsTopCustomersToWorstCustomer)
        }
    }


    console.log(customer);

    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }

    return <AppContentForm>
        <AppContentHeader>
            <Container fluid >
                <Row>
                    <Col className='p-0 ps-2'>
                        <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                            <Breadcrumb.Item active> <div className='breadcrum-label-active'>CUSTOMERS REPORT</div></Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                </Row>
                <Row>
                    <div className="buttonGroup" style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ display: 'flex', flexDirection: 'row', marginLeft: '-7px' }}>
                            <div className="buttonGroup__back">
                                <Button variant='light' size='sm' onClick={handleBack}>Back</Button>
                            </div>
                            <Form.Group>
                                <Form.Select size='sm' onChange={e => handleReportsTable(e.target.value)}>
                                    <option value="topCustomersToWorstCustomer" selected>Top Customers</option>
                                </Form.Select>
                            </Form.Group>
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'row', marginRight: '-12px' }}>
                            <div>
                                <input type="text" className="search__panel" placeholder="Search here..." onChange={handleSearch}></input>
                            </div>
                            <div>
                                <Button size='sm' onClick={handleExportAsCsv}>Export CSV</Button>
                            </div>
                        </span>
                    </div>
                </Row>
            </Container>
        </AppContentHeader>
        <AppContentBody>
            <div className="ag-theme-alpine" style={{ padding: "5px 10px 10px", height: '100%', width: '100%' }}>
                <AgGridReact
                    onGridReady={onGridReady}
                    rowData={state}
                    columnDefs={columns}
                    defaultColDef={{
                        editable: true,
                        sortable: true,
                        flex: 1,
                        minWidth: 100,
                        filter: true,
                        resizable: true,
                        minWidth: 200
                    }}
                    pagination={true}
                    paginationPageSize={50}
                    // overlayNoRowsTemplate="No Purchase Order found. Let's create one!"
                    overlayNoRowsTemplate='<span style="color: rgb(128, 128, 128); font-size: 2rem; font-weight: 100;">No Records Found!</span>'
                />
            </div>

        </AppContentBody>
    </AppContentForm>
}
