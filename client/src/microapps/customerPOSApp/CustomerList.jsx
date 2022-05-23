import { AgGridReact } from 'ag-grid-react';
import React, { useState, useEffect, useContext } from 'react';
import { Button, Container, Row, Col, Breadcrumb } from 'react-bootstrap';
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


export default function CustomerList() {
    const [state, setState] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [loderStatus, setLoderStatus] = useState(null);
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

    const columns = [
        {
            headerName: '#', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <Button style={{ minWidth: "4rem", position: 'absolute', top: '50%', transform: 'translateY(-50%)' }} size="sm" as={Link} to={`/${rootPath}/customers/edit/${params.value}?mode=edit&stack=${stack}`}><BsBoxArrowInUpRight /></Button>
        },
        { headerName: 'Name', field: 'name' },
        { headerName: 'Address', field: 'address' },
        { headerName: 'Phone', field: `phone` },
        { headerName: 'Email', field: 'email' }
    ]

    const renderStatus = (value) => {
        switch (value) {
            case 'Nothing to Bill': {
                return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Waiting Bills': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Fully Billed': {
                return <div style={{ backgroundColor: '#2ECC71', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            default: {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '100%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
        }
    }

    useEffect(async () => {
        setLoderStatus("RUNNING");
        const response = await ApiService.get('customer');
        console.log(response.data.documents)
        setState(response.data.documents)
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


        if (stack === 'dashboard') navigate(`/${rootPath}`);
        if (stack === 'payment') navigate(`/${rootPath}/payment`);
        if (stack === 'refund') navigate(`/${rootPath}/refund`);
        // navigate("/${rootPath}");
        // history.goBack();
    }

    const handleBack = () => {
        // history.goBack();
        if (stack === 'dashboard') navigate(`/${rootPath}`);
        if (stack === 'payment') navigate(`/${rootPath}/payment`);
        if (stack === 'refund') navigate(`/${rootPath}/refund`);
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
                            <Breadcrumb.Item active> <div className='breadcrum-label-active'>CUSTOMERS</div></Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                </Row>
                <Row>
                    <div className="buttonGroup" style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <span style={{ display: 'flex', flexDirection: 'row', marginLeft: '-7px' }}>
                            <div className="buttonGroup__back"><Button variant='light' size='sm' onClick={handleBack}>BACK</Button></div>
                        </span>
                        <div className="buttonGroup__add">
                            <Button variant='primary' size='sm' as={Link} to={`/${rootPath}/customers/add?stack=${stack}`} >CREATE CUSTOMER</Button>
                        </div>
                        {isChangeCustomerBtnVisible && <div className="buttonGroup__add">
                            <Button variant='primary' size='sm' onClick={() => handleSetCustomer(selectedCustomer)}>SET CUSTOMER</Button>
                        </div>}
                        <div className='buttonGroup__search' style={{ marginRight: '-10px' }}><input type="text" className="search__panel" placeholder="Search here..." onChange={handleSearch}></input></div>
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
                    rowSelection="single"
                    onCellClicked={handleRowSelection}
                    defaultColDef={{
                        editable: false,
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
