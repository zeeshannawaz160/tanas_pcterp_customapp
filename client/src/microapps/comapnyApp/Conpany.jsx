import { React, useState, useEffect } from 'react'
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tabs, Tab, Breadcrumb, Form } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import ApiService from '../../helpers/ApiServices'
import { errorMessage, infoNotification } from '../../helpers/Utils'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import LogHistories from '../../pcterp/components/LogHistories'
import NumberField from '../../pcterp/field/NumberField'
import EmailField from '../../pcterp/field/EmailField'
import SelectField from '../../pcterp/field/SelectField'
import TextArea from '../../pcterp/field/TextArea'
import TextField from '../../pcterp/field/TextField'
import AppLoader from '../../pcterp/components/AppLoader'

export default function Company() {
    const [loderStatus, setLoderStatus] = useState(null);
    const [state, setState] = useState(null)
    const [Files, setFiles] = useState()
    const [name, setname] = useState()
    const [phone, setphone] = useState()
    const [address, setaddress] = useState()
    const [email, setemail] = useState()
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1]; // path of the module
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm();



    // Functions

    const onSubmit = (formData) => {

        console.log(formData);
        return isAddMode
            ? createDocument(formData)
            : updateDocument(id, formData);
    }


    const onInputChange = (e) => {
        console.log(e.target.files);
        setFiles(e.target.files[0]);
    };

    const createDocument = async (data) => {
        ApiService.setHeader();
        await ApiService.get("company").then(res => {
            if (res.data.documents.length >= 1) {
                infoNotification("You can only create one company information!")
            } else {
                return ApiService.post('/company', data).then(response => {
                    if (response.data.isSuccess) {
                        navigate(`/${rootPath}/company/list`)
                    }
                }).catch(e => {
                    console.log(e.response?.data.message);
                    errorMessage(e, null)
                })
            }
        })

        // return ApiService.post('/company', data).then(response => {
        //     if (response.data.isSuccess) {
        //         navigate(`/${rootPath}/company/list`)
        //     }
        // }).catch(e => {
        //     console.log(e.response?.data.message);
        //     errorMessage(e, null)
        // })
    }

    const updateDocument = (id, data) => {
        ApiService.setHeader();
        return ApiService.patch(`/company/${id}`, data).then(response => {
            console.log(response.data)
            if (response.data.isSuccess) {
                navigate(`/${rootPath}/company/list`)
            }
        }).catch(e => {
            console.log(e.response?.data.message);
            //errorMessage(e, dispatch)
        })

    }

    const deleteDocument = () => {
        ApiService.setHeader();
        return ApiService.delete(`/company/${id}`).then(response => {
            if (response.status == 204) {
                navigate(`/${rootPath}/company/list`)
            }
        }).catch(e => {
            console.log(e.response.data.message);
            //errorMessage(e, dispatch)
        })
    }

    const findOneDocument = async () => {
        ApiService.setHeader();
        return ApiService.get(`company/${id}`).then(async response => {
            const document = response?.data.document;
            console.log(document);
            reset(document)
            setLoderStatus("SUCCESS");


        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })

    }



    useEffect(() => {

        if (!isAddMode) {
            setLoderStatus("RUNNING");
            findOneDocument()
        }

    }, []);

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
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: `/${rootPath}/customers/list` }}>   <div className='breadcrum-label'>CUSTOMERS</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >
                                    {state?.name}
                                </Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row style={{ marginTop: '-10px' }}>
                        <Col className='p-0 ps-1'>
                            {<Button type="submit" variant="primary" size="sm">SAVE</Button>}
                            <Button as={Link} to={`/${rootPath}/company/list`} variant="secondary" size="sm">DISCARD</Button>
                            {!isAddMode && <DropdownButton size="sm" as={ButtonGroup} variant="light" title="ACTION">
                                <Dropdown.Item onClick={deleteDocument} eventKey="4">Delete</Dropdown.Item>
                            </DropdownButton>}
                        </Col>
                    </Row>
                </Container>

            </AppContentHeader>
            <AppContentBody>
                {/* BODY FIELDS */}
                <Container fluid>
                    <Row>

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "Name of the sipplier.",
                                label: "NAME",
                                fieldId: "name",
                                placeholder: "",
                                required: true,
                                validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => setname(e.target.value)}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: ".",
                                label: "PHONE",
                                fieldId: "phone",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => setphone(e.target.value)}
                        />

                        <EmailField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "EMAIL",
                                fieldId: "email",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the vendor name!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => setemail(e.target.value)}
                        />
                        <TextArea
                            register={register}
                            errors={errors}
                            field={{
                                description: "Address",
                                label: "ADDRESS",
                                fieldId: "address",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the address name!"
                            }}
                            changeHandler={null}
                            blurHandler={(e) => setaddress(e.target.value)}
                        />

                        {/* <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">Logo</Form.Label>
                            <Form.Control
                                type="file"
                                id="file"
                                name="file"
                                // onChange={onInputChange}
                                {...register("file")}
                            />
                        </Form.Group> */}




                    </Row>
                </Container>

                {/* SUBTABS */}
                <Tabs defaultActiveKey='auditTrail'>
                    {!isAddMode && <Tab eventKey="auditTrail" title="AUDIT TRAIL">
                        <Container className="mt-2" fluid>
                            <Row>

                            </Row>
                            {!isAddMode && <LogHistories documentPath={"customer"} documentId={id} />}
                        </Container>
                    </Tab>}
                </Tabs>

            </AppContentBody>
        </AppContentForm>
    )
}
