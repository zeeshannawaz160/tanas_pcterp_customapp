import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomersData from './CustomersData';

export default function CustomersDataUploadApp() {

    return (
        <Routes>
            <Route path={`/`} element={< CustomersData />} />
            <Route path={`/list`} element={<CustomersData />} />
            <Route path={`/add`} element={< CustomersData />} />
            <Route path={`/edit/:id`} element={< CustomersData />} />
        </Routes>
    )
}