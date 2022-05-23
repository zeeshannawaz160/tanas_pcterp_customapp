import { React, useEffect, useState } from 'react';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { BsBoxArrowInUpRight, BsEyeFill } from 'react-icons/bs';
// import { PropagateLoader } from "react-spinners";
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { useHistory, useParams } from 'react-router';
import ApiService from '../../helpers/ApiServices';
import AppContentForm from '../../pcterp/builder/AppContentForm';
import AppContentHeader from '../../pcterp/builder/AppContentHeader';
import AppContentBody from '../../pcterp/builder/AppContentBody';
const moment = require('moment');

export default function PriceChartList() {
    const [loderStatus, setLoderStatus] = useState("");
    const [value, setvalue] = useState();
    const [state, setstate] = useState([]);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    // let { path, url } = useRouteMatch();
    const { id } = useParams();

    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {
        }
    });

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

    const getSupervisorValue = (params) => params.data?.supervisor?.name ? params.data?.supervisor?.name : "Not Available";

    const columns = [
        // {
        //     headerName: ' ', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
        //         <>
        //             <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/product/${params.value}`}><BsBoxArrowInUpRight /></Button>
        //             <Button style={{ minWidth: "4rem" }} size="sm" as={Link} to={`/${url?.split('/')[1]}/product/${params.value}`}><BsEyeFill /></Button>
        //         </>
        // },
        { headerName: 'Range0', field: 'range0' },
        { headerName: 'Range1', field: 'range1' },
        { headerName: 'Other Percentage', field: 'otherPercentage' },
        { headerName: 'Profit Percentage', field: 'profitPercentage' },
        { headerName: 'GST Percentage', field: 'gstPercentage' },
        { headerName: 'Basic Calculation', field: 'basicCalculation' },
        { headerName: 'Old System Calculation', field: 'oldSystemCalculation' },
        { headerName: 'Difference', field: 'difference' },
        { headerName: 'Other Difference', field: 'otherDifference' },
        { headerName: 'MRP', field: 'MRP' },
    ]

    const findMRP = async () => {
        if (value) {
            const response = await ApiService.patch(`priceChartUpload/findMRP?search=${value}`);
            if (response.data.isSuccess) {
                setValue("mrp", response.data.document.MRP)
                setValue("range", " ")
                document.getElementById("range").focus();
            }
        }

    }

    useEffect(async () => {
        setLoderStatus("RUNNING");
        console.log("hi")
        const response = await ApiService.get('priceChartUpload');
        if (response.data.isSuccess) {
            console.log(response.data.documents)
            setstate(response.data.documents)
            setLoderStatus("SUCCESS");
        }
    }, [])

    // if (loderStatus === "RUNNING") {
    //     return (
    //         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
    //     )
    // }
    return (
        <AppContentForm>
            <AppContentHeader>
                <Container fluid >
                    <Row>
                        <Col className='p-0 ps-2'>
                            <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                                <Breadcrumb.Item active> <div className='breadcrum-label-active'>PRICE CHART</div></Breadcrumb.Item>
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row >
                        <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">Cost</Form.Label>
                            <Form.Control
                                type="text"
                                id="range"
                                name="range"
                                {...register("range")}
                                onBlur={async (e) => {
                                    console.log(e.target.value);
                                    if (e.target.value) {
                                        setvalue(e.target.value)
                                    } else {
                                        setValue("mrp", " ")
                                    }

                                }}
                            />
                        </Form.Group>
                        <Form.Group as={Col} md="4" className="mb-2">
                            <Button variant="primary" size="md" onClick={findMRP} style={{ marginTop: 24 }}>Calculate</Button>
                        </Form.Group>
                        <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">MRP</Form.Label>
                            <Form.Control
                                disabled
                                type="text"
                                id="mrp"
                                name="mrp"
                                {...register("mrp")}
                            />
                        </Form.Group>
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
