import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ApiService from '../../../helpers/ApiServices';

export const SecondCategoryList = () => {
    const [secondCategoryList, setSecondCategoryList] = useState([])
    useEffect(() => {
        const getAllSecondCategory = async () => {
            await ApiService.get('/itemCategory/search?type=secondCategory')
                .then(response => {
                    if (response.data.isSuccess) {
                        setSecondCategoryList(response.data.document)
                    }
                })
        }
        getAllSecondCategory()
    }, [])
    return (
        <div>
            <Container className="pct-app-content-container p-0 m-0" fluid>
                <Container className="pct-app-content" fluid>
                    <Container className="pct-app-content-header p-0 m-0 mt-2 pb-2" fluid>
                        <Row>
                            <Col>
                                <h3>Second Category List</h3>
                                {/* <Breadcrumb style={{ fontSize: '24px' }}>
                                <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/purchase' }} active>Purchase Orders</Breadcrumb.Item>
                            </Breadcrumb> */}
                            </Col>
                        </Row>
                        <Row>
                            <Col><Button as={Link} to={`/itemcategory/secondcategory`} variant="primary" size="sm">Create</Button></Col>
                        </Row>
                    </Container>
                    <Container className="pct-app-content-body p-0 m-0" fluid>
                        <Table striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>ID</th >
                                    <th>Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {
                                    secondCategoryList && secondCategoryList.map((element, index) => {
                                        return <tr id={element.id} key={index} onClick={(e) => { }}>
                                            <td >
                                                <Button style={{ minWidth: "4rem" }} as={Link} to={`/itemcategory/secondcategory/${element.id}`} size="sm">Edit</Button>
                                            </td>

                                            <td>{element.id}</td>
                                            <td>{element.name}</td>
                                        </tr>
                                    })
                                }
                            </tbody>
                        </Table>
                    </Container>
                </Container >
            </Container >
        </div>
    )
}
