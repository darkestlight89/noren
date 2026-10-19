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

async function userLogin(data) {
    const csrftoken = Cookies.get('csrftoken');
    const response = await fetch('/police/api/auth/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json', 'X-CSRFToken': csrftoken},
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
        console.log("Backend validation error:", result);
        throw result;
    }
    return result;
}

export default function LoginPage({user, setUser}) {
    const [userMessage, setUserMessage] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({shouldUnregister: true});

    const onSubmit = async(data) => {
        try {
            const result = await userLogin(data);
            console.log("Success:", result);
            setUser(result);
            setUserMessage("")
        } 
        catch (err) {
            console.log(err)
            console.error("Error:", err.errors);
            setUserMessage(err.errors.non_field_errors[0])
        };
    }

    return (
    <>
        <title>Log In Page</title>
        <main>
            <Container>
                <Row>
                    <Col md={3}/>
                    <Col md={6}>
                        {user ? <Navigate to="/police" replace />:<>
                        <div className="heading">
                            <h1 className='reporting-form-field'>Log In</h1>
                        </div>
                        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
                            <div className="form-container">
                                <Form.Group className="mb-3 reporting-form-field" controlId="shoulder_number">
                                    <Form.Label><strong>Shoulder Number</strong></Form.Label>
                                    <Form.Control 
                                        type="text"
                                        placeholder="Shoulder Number"
                                        {...register("shoulder_number", 
                                            { required: "Shoulder Number is required" })}
                                        isInvalid={!!errors.shoulder_number}>
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.shoulder_number?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                                <Form.Group className="mb-3 reporting-form-field" controlId="password">
                                    <Form.Label><strong>Password</strong></Form.Label>
                                    <Form.Control 
                                        type="password"
                                        placeholder="Password"
                                        {...register("password", 
                                            { required: "Password is required" })}
                                        isInvalid={!!errors.password}>
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors.password?.message}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </div>
                            <div className="button-container">
                                <Button type='submit' id='log-in-button'>Submit</Button>
                            </div>
                        </Form>
                        </>}
                        {userMessage === "" ? <></>: <Alert className='reporting-form-field' variant='warning'>{userMessage}</Alert>}
                    </Col>
                    <Col md={3}/>
                </Row>
            </Container>
        </main>
    </>
    )
}