import { React, useState, useEffect } from 'react'
import { Button, ButtonGroup, Tabs, Tab, Col, Container, Form, Row, Card, Table, DropdownButton, Dropdown, Breadcrumb, FormSelect } from 'react-bootstrap';
import { useForm, useFieldArray } from 'react-hook-form';
// import { useHistory, useParams } from 'react-router';
// import { Link, useLocation } from 'react-router-dom';
import { PropagateLoader } from "react-spinners";
import { BsTrash } from 'react-icons/bs';
import ApiService from '../../helpers/ApiServices';
// import { isAfter } from 'date-fns';
// import PCTCustomer from '../../components/form/searchAndSelect/PCTCustomer';
import PCTCustomer from '../../components/form/searchAndSelect/PCTCustomer';
import PCTEmployee from '../../components/form/searchAndSelect/PCTEmployee';
import PCTProduct from '../../components/form/searchAndSelect/PCTProduct';
import OrdersGeneralLedger from './OrdersGeneralLedger';
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import AppLoader from '../../pcterp/components/AppLoader';
import AppContentForm from '../../pcterp/builder/AppContentForm';
import AppContentHeader from '../../pcterp/builder/AppContentHeader';
import AppContentBody from '../../pcterp/builder/AppContentBody';
// import PCTEmployee from '../../components/form/searchAndSelect/PCTEmployee';
// import PCTProduct from '../../components/form/searchAndSelect/PCTProduct';
// import ApiService from '../../../helpers/ApiServices';

export default function Order() {
    // const [state, setstate] = useState({})
    const [loderStatus, setLoderStatus] = useState(null);
    const [state, setstate] = useState({ total: 0 });
    const [tabKey, setTabKey] = useState('products');
    const [ordersGLData, setOrdersGLData] = useState([])
    const [isShippingTick, setIsShippingTick] = useState([]);
    const [isShippingTickAdd, setIsShippingTickAdd] = useState(false);
    const [customerList, setCustomerList] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [productList, setProductList] = useState([]);
    // const history = useHistory();
    // const { id } = useParams();
    // const isAddMode = !id;

    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const useQuery = () => new URLSearchParams(useLocation().search);
    let query = useQuery();
    const stack = query.get('stack');

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm({
    });

    // const { append, remove, fields } = useFieldArray({ control, name: "productses" });
    const { append: itemAppend, remove: itemRemove, fields: itemFields } = useFieldArray({ control, name: "products" });



    const onSubmit = (formData) => {
        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        console.log(data)
        return ApiService.post('/cashSale', data).then(response => {
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/orders`);
            }
        }).catch(e => {
            console.log(e);
        })
    }

    const updateDocument = (id, data) => {
        console.log(data)
        ApiService.setHeader();
        return ApiService.patch(`cashSale/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/orders`);
            }
        }).catch(e => {
            console.log(e);
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/cashSale/${id}`).then(response => {
            console.log(response.data)
            navigate(`/${rootPath}/orders`);
        }).catch(e => {
            console.log(e);
        })

    }

    useEffect(() => {
        setLoderStatus("RUNNING");

        if (isAddMode) {
            setLoderStatus("SUCCESS");
        }

        ApiService.get(`/customer`).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                setCustomerList(response.data.documents);
            }
        }).catch(e => {
            console.log(e);
        })

        ApiService.get(`/employee`).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                setEmployeeList(response.data.documents)
            }
        }).catch(e => {
            console.log(e);
        })

        ApiService.get(`/product`).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                setProductList(response.data.documents)
            }
        }).catch(e => {
            console.log(e);
        })

        if (!isAddMode) {
            ApiService.setHeader();
            ApiService.get(`/cashSale/${id}`).then(response => {
                setLoderStatus("SUCCESS");
                console.log(response.data.document)
                setstate(response.data.document)
                reset(response.data.document);
                setValue('date', response.data.document.date.split("T")[0])

            }).catch(e => {
                console.log(e)
            })

            ApiService.get(`/cashSale/generalLedger/${id}`,).then(response => {
                if (response?.data?.isSuccess) {
                    console.log(response.data.documents);
                    setOrdersGLData(response.data.documents);
                }
            }).catch(e => {
                console.log(e)
            })
        }
    }, [])


    // if (loderStatus === "RUNNING") {
    //     return (
    //         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20%', }}><PropagateLoader color="#009999" style={{ height: 15 }} /></div>
    //     )
    // }

    if (loderStatus === "RUNNING") {
        return (
            <AppLoader />
        )
    }


    return (
        <AppContentForm onSubmit={handleSubmit(onSubmit)}>
            <AppContentHeader>
                <Container fluid >
                    <Row>
                        <Col className='p-0 ps-2'>
                            <Breadcrumb style={{ fontSize: '24px', marginBottom: '0 !important' }}>
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: `/${rootPath}/orders` }}>   <div className='breadcrum-label'>CASH SALES</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {state?.name}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row>
                        <Col className='p-0 ps-1'>
                            {<Button type="submit" variant="primary" size="sm">SAVE</Button>}
                            <Button as={Link} to={`/${rootPath}/orders`} variant="secondary" size="sm">DISCARD</Button>
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>
            </AppContentHeader >
            <AppContentBody>
                {/* BODY FIELDS */}
                <Container fluid>
                    <Row>
                        <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">Cash Sale ID</Form.Label>
                            <Form.Control
                                type="text"
                                id="cashSaleId"
                                name="cashSaleId"
                                disabled
                                {...register("cashSaleId")}
                            />
                        </Form.Group>
                        <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">Customer</Form.Label>
                            <PCTCustomer control={control} name={"customer"} />
                        </Form.Group>
                        <Form.Group as={Col} md="3" className="mb-2">
                            <Form.Label className="m-0">Employee</Form.Label>
                            <PCTEmployee control={control} name={"salesRep"} />
                        </Form.Group>
                    </Row>
                    <Row>
                        <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">Date</Form.Label>
                            <Form.Control
                                type="date"
                                id="date"
                                name="date"
                                {...register("date")}
                            />
                        </Form.Group>
                    </Row>
                </Container>

                {/* SUBTABS */}

            </AppContentBody>
        </AppContentForm >
    )
}


