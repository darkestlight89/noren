import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import { useForm } from "react-hook-form";
import Button from 'react-bootstrap/Button'
import Cookies from 'js-cookie';
import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import { Navigate} from 'react-router-dom';


export default function ForensicsHomePage ({user, setUser}) {
    if (user === undefined) {
        return <div>Loading...</div>;
    }

    if (!user || !user.forensic_employee) {
        return <Navigate to="/police/login" replace />;
    }

    return (
    <> 
        <h1>
            Hello
        </h1>
    </>
    )
}