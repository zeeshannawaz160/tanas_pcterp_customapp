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

export default function DepartmentList() {
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
        ApiService.setHeader();
        const response = await ApiService.get('department');
        console.log(response.data.documents)
        setstate(response.data.documents)
        setLoderStatus("SUCCESS");
    }

    const columns = [
        {
            headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem", position: 'absolute', top: '50%', transform: 'translateY(-50%)' }} size="sm" as={Link} to={`/${rootPath}/departments/edit/${params.value}`}><BsBoxArrowInUpRight /></Button>
                    {/* <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/employees/employee/${params.value}?mode=view`}><BsEyeFill /></Button> */}
                </>
        },
        { headerName: 'NAME', field: 'name' },
        { headerName: 'SUPERVISOR', field: 'supervisor', valueGetter: (params) => params.data?.supervisor ? params.data?.supervisor[0]?.name : "Not Available" },
        { headerName: 'PARENT DEPARTMENT', field: 'parentDepartment', valueGetter: (params) => params.data?.parentDepartment ? params.data?.parentDepartment[0]?.name : "Not Available" },

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
                                <Breadcrumb.Item active> <div className='breadcrum-label-active'>DEPARTMENTS</div></Breadcrumb.Item>
                                {/* <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: '/purchase/purchases/list' }}>   <div className='breadcrum-label'>Purchase Orders</div></Breadcrumb.Item> */}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row >
                        {/* <Col className='p-0 ps-1'>
                            <Button size="sm" as={Link} to={`/${rootPath}/departments/add`}>CREATE</Button>{" "}
                        </Col>
                        <Col md="4" sm="6">
                            <Row>
                                <Col md="8"><input type="text" className="openning-cash-control__amount--input" placeholder="Search here..." onChange={handleSearch}></input></Col>
                                <Col md="4"><Button onClick={handleExportAsCsv} variant="primary" size="sm"><span>Export CSV</span></Button></Col>
                            </Row>
                        </Col> */}

                        <div className="buttonGroup" style={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ display: 'flex', flexDirection: 'row', marginLeft: '-7px' }}>
                                <div className="buttonGroup__back"><Button as={Link} to={`/${rootPath}/departments/add`} variant="primary" size="sm">CREATE</Button></div>
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
