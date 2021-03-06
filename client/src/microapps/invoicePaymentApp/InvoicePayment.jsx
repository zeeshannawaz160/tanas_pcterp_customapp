
import { React, useState, useEffect } from 'react'
import { BsTrash } from 'react-icons/bs';
import { Container, Button, Col, Row, DropdownButton, Dropdown, ButtonGroup, Tab, Tabs, Table, Breadcrumb, Form } from 'react-bootstrap'
import { useForm, useFieldArray } from 'react-hook-form'
import { Link, useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import ApiService from '../../helpers/ApiServices'
import { errorMessage } from '../../helpers/Utils'
import AppContentBody from '../../pcterp/builder/AppContentBody'
import AppContentForm from '../../pcterp/builder/AppContentForm'
import AppContentHeader from '../../pcterp/builder/AppContentHeader'
import SelectField from '../../pcterp/field/SelectField'
import TextField from '../../pcterp/field/TextField'
import TextArea from '../../pcterp/field/TextArea'
import DateField from '../../pcterp/field/DateField'
import NumberField from '../../pcterp/field/NumberField'
import AppLoader from '../../pcterp/components/AppLoader'
import LogHistories from '../../pcterp/components/LogHistories'
import AppContentLine from '../../pcterp/builder/AppContentLine'
import LineSelectField from '../../pcterp/field/LineSelectField';
import LineTextField from '../../pcterp/field/LineTextField';
import LineNumberField from '../../pcterp/field/LineNumberField';
import LineDecimal128Field from '../../pcterp/field/LineDecimal128Field';
import { PurchaseOrderPDF } from '../../helpers/PDF';
import Decimal128Field from '../../pcterp/field/Decimal128Field';

export default function BillPayment() {
    const [loderStatus, setLoderStatus] = useState(null);
    const [state, setState] = useState(null)
    const navigate = useNavigate();
    const location = useLocation();
    const rootPath = location?.pathname?.split('/')[1];
    const { id } = useParams();
    const isAddMode = !id;
    const [searchParams] = useSearchParams();

    const { register, control, reset, handleSubmit, getValues, setValue, watch, formState: { errors } } = useForm();

    const { append: invoiceLineAppend, remove: invoiceLineRemove, fields: invoiceLineFields } = useFieldArray({ control, name: "invoiceLines" });
    const { append: journalItemAppend, remove: journalItemRemove, fields: journalItemFields } = useFieldArray({ control, name: "journalItems" });



    // Functions

    const onSubmit = (formData) => {
        return createDocument(formData)
    }

    const createDocument = (data) => {
        ApiService.setHeader();
        return ApiService.patch('/invoicePayment/updateInvoicePayment/' + state.id, data).then(response => {
            if (response.data.isSuccess) {

                navigate(`/${rootPath}/customerpayments/list`)
            }
        }).catch(e => {
            console.log(e);
        })

    }




    const findOneDocument = () => {
        ApiService.setHeader();
        return ApiService.get(`/invoicePayment/${id}`).then(response => {
            const document = response?.data.document;
            setState(document)
            reset(document);
            if (document.billDate) {
                setValue('invoiceDate', document.billDate.split("T")[0])
            }

            // setValue('bill', document.id);
            // setValue('journalType', document.journalType);
            // setValue('amount', document.amount);
            // setValue('memo', document.name);
            // setValue('bankAccount', document.bankAccount);
            // setValue('referenceNumber', document.referenceNumber);
            setValue('paymentDate', document.paymentDate.split("T")[0]);
            setLoderStatus("SUCCESS");
        }).catch(e => {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        })

    }

    const handleConfirmButton = async () => {
        console.log(state)
        try {
            const response = await ApiService.patch('bill/' + state.id, { status: "Posted", referenceNumber: getValues('referenceNumber') });
            console.log(response)
            if (response.data.isSuccess) {
                const itemReceipt = response.data.document;
                setState(itemReceipt)
                reset(itemReceipt);
                if (itemReceipt.billDate) {
                    setValue('billDate', itemReceipt.billDate.split("T")[0]);
                }
            }
        } catch (e) {
            console.log(e.response?.data.message);
            errorMessage(e, null)
        }
    }

    const handleRegisterPaymentButton = async () => {
        ApiService.setHeader();
        await ApiService.post("/billPayment", state).then((res) => {
            if (res.data.isSuccess) {
                console.log(res.data.document.id);
                navigate('/purchase/billpayment/' + res.data.document.id)
            }
        });
    }

    // handle Print
    const handlePrintOrder = async () => {
        console.log(state)
        PurchaseOrderPDF.generateBillPaymentPDF(state.id);
        return;
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
                                <Breadcrumb.Item className='breadcrumb-item' linkAs={Link} linkProps={{ to: '/accounting/customerpayments/list' }}>   <div className='breadcrum-label'>CUSTOMER PAYMENTS</div></Breadcrumb.Item>
                                {isAddMode ? <Breadcrumb.Item active>NEW</Breadcrumb.Item> : <Breadcrumb.Item active >{state?.name}</Breadcrumb.Item>}
                            </Breadcrumb>
                        </Col>
                    </Row>
                    <Row >
                        <Col className='p-0 ps-1'>
                            {
                                state?.invoice?.paymentStatus !== "Paid" && <Button type="submit" variant="primary" size="sm">CREATE PAYMENT</Button>
                            }
                            <Button as={Link} to={`/${rootPath}/customerpayments/list`} variant="light" size="sm">DISCARD</Button>
                        </Col>
                    </Row>
                </Container>


            </AppContentHeader>
            <AppContentBody>
                {/* STATUS BAR */}

                <Row className="p-0 mt-0 m-0">
                    <Col>
                        <ButtonGroup size="sm">

                            {state?.status == "Draft" ? <Button onClick={handleConfirmButton} type="button" variant="primary">CONFIRM</Button> : ""}
                            {state?.status == "Posted" && state?.paymentStatus == "Not Paid" ? <Button onClick={handleRegisterPaymentButton} type="button" variant="primary">REGISTER PAYMENT</Button> : ""}
                            {!isAddMode && <Button variant="light" onClick={handlePrintOrder}>PRINT Bill</Button>}
                        </ButtonGroup>
                    </Col>

                </Row>


                {/* BODY FIELDS */}
                <Container fluid>
                    <Row>
                        <Form.Group as={Col} md="4" className="mb-2">
                            <Form.Label className="m-0">Journal Type</Form.Label>
                            <Form.Select style={{ maxWidth: '400px' }} size='sm' id="journalType" name="journalType" {...register("journalType", { required: true })}>
                                <option value="Bank">Bank</option>
                                <option value="Cash">Cash</option>

                            </Form.Select>
                        </Form.Group>

                        <Decimal128Field
                            register={register}
                            errors={errors}
                            field={{

                                description: "",
                                label: "Amount",
                                fieldId: "amount",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />
                        <SelectField
                            control={control}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Bank",
                                fieldId: "bankAccount",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the department name!",
                                selectRecordType: "account"

                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <DateField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Payment Date",
                                fieldId: "paymentDate",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the bill's created date!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Memo",
                                fieldId: "memo",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the bill's created date!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />

                        <TextField
                            register={register}
                            errors={errors}
                            field={{
                                description: "",
                                label: "Reference Number",
                                fieldId: "referenceNumber",
                                placeholder: "",
                                // required: true,
                                // validationMessage: "Please enter the Account Number!"
                            }}
                            changeHandler={null}
                            blurHandler={null}
                        />



                    </Row>
                </Container>

                {/* SUBTABS */}


            </AppContentBody>
        </AppContentForm>
    )
}
