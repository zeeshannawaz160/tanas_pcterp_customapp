import { React, useState, useEffect } from 'react'
import { useParams } from 'react-router';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Container, Form, Row, Tabs, Tab, Card, Table, Button, Col, ButtonGroup, Breadcrumb, DropdownButton, Dropdown, Modal } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from "axios";
import * as xlxs from "xlsx";
import ApiService from '../../helpers/ApiServices';
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import { errorMessage, infoNotification } from '../../helpers/Utils';

export default function PriceChart() {
    const [loderStatus, setLoderStatus] = useState("NOTHING");
    // let { path, url } = useRouteMatch();
    const [state, setState] = useState({});
    const [fileUpload, setfileUpload] = useState();
    const [xlfile, setxlfile] = useState();
    const [billtotal, setbilltotal] = useState(0);
    const [billsgsttotal, setbillsgsttotal] = useState(0);
    const [billcgsttotal, setbillcgsttotal] = useState(0);
    const [billsubtotal, setbillsubtotal] = useState(0);
    const [accountList, setAccountList] = useState([])
    const [journals, setJournals] = useState([])
    const [tabKey, setTabKey] = useState('invoiceLines');
    const [productList, setProductList] = useState([]);
    const [supplierList, setSupplierList] = useState([])
    const location = useLocation();
    const navigate = useNavigate();
    const rootPath = location?.pathname?.split('/')[1];

    // const history = useHistory();
    const { id } = useParams();
    const isAddMode = !id;

    const { register, handleSubmit, setValue, getValues, control, reset, setError, formState: { errors } } = useForm({
        defaultValues: {}
    });
    const { append: invoiceLineAppend, remove: invoiceLineRemove, fields: invoiceLineFields } = useFieldArray({ control, name: "invoiceLines" });
    const { append: journalItemAppend, remove: journalItemRemove, fields: journalItemFields } = useFieldArray({ control, name: "journalItems" });

    const onSubmit = async (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = async (data) => {
        console.log(xlfile);
        // const wb = xlxs.read(xlfile, { type: "buffer" })
        // const wbName = wb.SheetNames[0]
        // const ws = wb.Sheets[wbName]
        // const xlData = xlxs.utils.sheet_to_json(ws)
        const xlData = getxlData()
        console.log(xlData);

        try {
            ApiService.setHeader();

            const response = await ApiService.delete('/priceChartUpload/procedure')
            if (response.data.isSuccess) {
                const res = await ApiService.post('/priceChartUpload/procedure', xlData)
                if (res.data.isSuccess) {
                    console.log(res.data.documents);
                    navigate(`/${rootPath}/pricechartlist`);
                }
            }
        } catch (e) {
            errorMessage(e, null)
        }
    }

    const updateDocument = (id, data) => {
        if (state.status == "Posted") {
            infoNotification("you can'tupdate this document")
        } else {
            ApiService.setHeader();
            return ApiService.patch(`/bill/${id}`, data).then(response => {
                if (response.data.isSuccess) {
                    navigate("/purchase/vendorbills");
                }
            }).catch(e => {
                errorMessage(e, null)
            })
        }


    }

    const getxlData = () => {
        const wb = xlxs.read(xlfile, { type: "buffer" })
        const wbName = wb.SheetNames[0]
        const ws = wb.Sheets[wbName]
        const xlData = xlxs.utils.sheet_to_json(ws)

        return xlData;
    }


    return (<AppContentForm>
        <AppContentHeader>
            <Container fluid >
                <Row>
                    <Col className='p-0 ps-2'>
                        <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                            <Breadcrumb.Item active> <div className='breadcrum-label-active'>PRICE CHART UPLOAD</div></Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                </Row>
                <Row>
                    <Col className='p-0 ps-1'>
                        <Button type="submit" variant="primary" size="sm">SAVE</Button>
                        {/* <Button as={Link} to={`/${url?.split('/')[1]}/bills`} variant="light" size="sm">DISCARD</Button> */}
                        <Button as={Link} to={`/${rootPath}/pricechartlist`} variant="light" size="sm">DISCARD</Button>
                        {/* {!isAddMode && state.status !== "Posted" && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="Actions">

                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>} */}
                    </Col>
                </Row>
            </Container>
        </AppContentHeader>
        <AppContentBody>
            <Container fluid>
                <Row>
                    <Form.Group as={Col} md="4" className="mb-2">
                        <Form.Label className="m-0">Upload file</Form.Label>
                        <Form.Control
                            type="file"
                            id="file"
                            name="file"
                            {...register("file")}
                            onChange={(e) => {
                                console.log(e.target.files[0]);
                                setfileUpload(e.target.files[0])
                                let reader = new FileReader()
                                reader.readAsArrayBuffer(e.target.files[0])
                                reader.onload = (e => {
                                    setxlfile(e.target.result)

                                })
                            }}
                        />
                    </Form.Group>
                </Row>
            </Container>
        </AppContentBody>
    </AppContentForm>
    )
}

