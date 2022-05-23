import { React, useEffect, useState } from 'react';
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { BsTrash, BsEyeFill, BsPencil } from 'react-icons/bs';
import { PropagateLoader } from "react-spinners";
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { useHistory, useParams } from 'react-router';
import ApiService from '../../helpers/ApiServices';
import AppContentForm from '../../pcterp/builder/AppContentForm';
import AppContentHeader from '../../pcterp/builder/AppContentHeader';
import AppContentBody from '../../pcterp/builder/AppContentBody';
const moment = require('moment');

export default function ProductMaster() {
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
        {
            headerName: 'Delete', field: 'id', sortable: false, filter: false, cellRendererFramework: (params) =>
                <>
                    <Button style={{ minWidth: "4rem", position: 'absolute', top: '50%', transform: 'translateY(-50%)' }} size="sm" onClick={() => handleDeleteList(params)} ><BsTrash /></Button>
                    {/* <Button style={{ minWidth: "4rem" }} size="sm" onClick={() => handleEditList(params)} ><BsPencil /></Button> */}
                </>
        },
        { headerName: 'Name', field: 'name' },
        { headerName: 'Created At', field: 'createdAt', valueGetter: (params) => params.data?.createdAt ? moment(params.data?.createdAt).format("MM/DD/YYYY") : "Not Available" },

    ]

    const onSubmit = (formData) => {
        let newData = { ...formData }
        newData['schemaId'] = 'productMaster';
        createRecord(newData)

    }

    const createRecord = (data) => {
        console.log(data)
        ApiService.post('/itemCategory', data).then(res => {
            ApiService.get('/itemCategory/search?type=productMaster').then(res => {
                console.log(res.data.document)
                setstate(res.data.document)
                setValue("name", "")
            });
        }).catch(err => console.log(err))
    }

    const deleteDocument = (id) => {
        ApiService.setHeader();
        return ApiService.delete(`/itemCategory/${id}`).then(response => {
            console.log(response)
            if (response.status == 204) {
                ApiService.get('/itemCategory/search?type=productMaster').then(res => {
                    console.log(res.data.document)
                    setstate(res.data.document)
                });
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const handleDeleteList = (params) => {
        deleteDocument(params.value)
    }


    useEffect(async () => {
        setLoderStatus("RUNNING");
        const response = await ApiService.get('/itemCategory/search?type=productMaster');
        console.log(response.data.document)
        setstate(response.data.document)
        setLoderStatus("SUCCESS");
    }, [])



    return (<AppContentForm>
        <AppContentHeader>
            <Container fluid >
                <Row>
                    <Col className='p-0 ps-2'>
                        <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                            <Breadcrumb.Item active> <div className='breadcrum-label-active'>PRODUCT MASTER</div></Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                </Row>
                <Form onSubmit={handleSubmit(onSubmit)}  >
                    <Row >
                        <Form.Group as={Col} md="4">
                            <Form.Label className="m-0">NAME</Form.Label>
                            <Form.Control
                                type="text"
                                id="name"
                                name="name"
                                {...register("name")}
                            />
                        </Form.Group>
                        <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">{" "}</Form.Label> <br />
                            <Button variant="primary" size="md" type='submit'>ADD</Button>
                        </Form.Group>
                    </Row>
                </Form>
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
    </AppContentForm>)
}
