import { React, useContext, useState, useEffect } from 'react'
import { Col, Row, Button, Container, Breadcrumb } from 'react-bootstrap'
import { PropagateLoader } from "react-spinners";
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { UserContext } from '../../components/states/contexts/UserContext'
import ApiService from '../../helpers/ApiServices'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import AppLoader from '../../pcterp/components/AppLoader';
import { errorMessage, formatNumber } from '../../helpers/Utils';
const moment = require('moment')

export default function BillPaymentList() {
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { dispatch, user } = useContext(UserContext)
    const [loderStatus, setLoderStatus] = useState(null);
    const [state, setstate] = useState(null);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);


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


    const findAllDocument = async () => {
        try {
            ApiService.setHeader();
            const response = await ApiService.get('billPayment');
            if (response.data.isSuccess) {
                console.log(response.data.documents)
                setstate(response.data.documents)
                setLoderStatus("SUCCESS");

            }
        } catch (error) {
            errorMessage(error, dispatch)
        }
    }

    const renderStatus = (value) => {

        switch (value) {
            case 'Draft': {
                return <div style={{ backgroundColor: '#B2BABB', borderRadius: '20px', color: 'white', width: '50%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Posted': {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '50%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Paid': {
                return <div style={{ backgroundColor: 'green', borderRadius: '20px', color: 'white', width: '50%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            case 'Not Paid': {
                return <div style={{ backgroundColor: 'red', borderRadius: '20px', color: 'white', width: '50%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
            default: {
                return <div style={{ backgroundColor: 'royalblue', borderRadius: '20px', color: 'white', width: '50%', height: '60%', maxHeight: '2rem', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{value}</div>
                </div>
            }
        }
    }

    const columns = [
        {
            headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem", position: 'absolute', top: '50%', transform: 'translateY(-50%)' }} size="sm" as={Link} to={`/${rootPath}/billpayment/edit/${params.value}`}><BsBoxArrowInUpRight /></Button>
                    {/* <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/employees/employee/${params.value}?mode=view`}><BsEyeFill /></Button> */}
                </>
        },
        { headerName: 'Bill Payment#', field: 'name' },
        { headerName: 'Journal Type', field: 'journalType' },
        { headerName: 'Payment Date', field: 'paymentDate', valueGetter: (params) => params.data?.paymentDate ? moment(params.data?.paymentDate).format("DD/MM/YYYY HH:mm:ss") : "Not Available" },
        { headerName: 'Amount', field: 'amount', valueGetter: (params) => formatNumber(params.data?.amount) }
    ]


    useEffect(() => {
        setLoderStatus("RUNNING");
        findAllDocument();
    }, []);


    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }


    return (
        <AppContentForm>
            <AppContentHeader>
                <Container fluid >
                    <Row>
                        <Col className='p-0 ps-2'>
                            <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                                <Breadcrumb.Item active> <div className='breadcrum-label-active'>VENDOR BILL PAYMENTS</div></Breadcrumb.Item>
                                {/* <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: '/purchase/purchases/list' }}>   <div className='breadcrum-label'>Purchase Orders</div></Breadcrumb.Item> */}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row>
                        <div className="buttonGroup" style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', flexDirection: 'row', marginLeft: '-7px' }}>
                                <div className="buttonGroup__back"></div>
                            </span>
                            <span style={{ display: 'flex', flexDirection: 'row', marginRight: '-12px' }}>
                                <div><input type="text" className="search__panel" placeholder="Search here..." onChange={handleSearch}></input></div>
                                <div><Button size="sm" onClick={handleExportAsCsv}>Export CSV</Button></div>
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
    )
}
