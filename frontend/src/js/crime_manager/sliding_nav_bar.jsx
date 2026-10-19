import Nav from 'react-bootstrap/Nav';
import { useState, useEffect } from "react";
import { searchObjects } from './api_management';
import { useNavigate } from "react-router-dom";
import Form from 'react-bootstrap/Form'
import { useForm } from "react-hook-form";
import Button from 'react-bootstrap/esm/Button';
import Col from 'react-bootstrap/esm/Col';

export function SlidingNavBar({user}) {
    const [isShown, setIsShown] = useState(false);
    const [isSearchBarShown, setIsSearchBarShown] = useState({parameter:undefined, shown:false});
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors, isSubmitSuccessful},
    } = useForm({shouldUnregister: true});
    

    const handleShowSearchBar = (parameter) => {
        setIsSearchBarShown(prev=>({...prev, parameter, shown:!prev.shown}));
    }

    const SearchBar = ({parameter}) => {
        const onSubmit = async(data) => {
            const cleanedData = data.search_query.trim()
            const result = await(searchObjects(parameter, cleanedData))
            switch (parameter) {
                case "incident":
                    if (/^[0-9]{8}-[0-9]{4}$/.test(cleanedData)) {
                        if (result.objects.length === 1) {
                            navigate(`/police/incident/${cleanedData}`)
                            break;
                        }
                    }
                case "vehicle":
                    if (result.objects.length === 1 && result.objects[0].involved_vehicles[0].vehicle_reg === cleanedData.toUpperCase()) {
                        navigate(`/police/vehicle/${cleanedData.toUpperCase()}`)
                        break;
                    } 
                default:
                    if (result.objects.length === 1 && result.objects[0][parameter] === cleanedData) {
                        navigate(`/police/filter?filter=${parameter}&query=${cleanedData}`)
                        break;
                    }
                    navigate(`/police/search?filter=${parameter}&query=${cleanedData}`)
            }
        }   
        return(
            <Form noValidate className="sliding-nav-bar-search" onSubmit={handleSubmit(onSubmit)}>
                <Col md={12}>
                    <Form.Group controlId="search_query" className="sliding-nav-bar-item">
                        <Form.Control 
                            type="text"
                            placeholder=""
                                {...register("search_query", 
                                    { required: `${parameter[0].toUpperCase()+parameter.slice(1)} cannot be blank`, 
                                        validate: value => {
                                            switch (parameter) {
                                                case "incident":
                                                    if (/[a-z]/i.test(value)) {
                                                        return "Must contain numbers only"
                                                    }
                                                    break;
                                                case "person":
                                                    if (/[0-9]/i.test(value)) {
                                                        return "Must contain letters only"
                                                    }
                                                    break;
                                                case "vehicle":
                                                    if (/[^A-Z0-9 ]+/gi.test(value)) {
                                                        return "Must not contain any special characters"
                                                    }
                                                }
                                                return true;
                                            }
                                        },
                                    )}
                                isInvalid={!!errors.search_query}>
                        </Form.Control>
                        <Form.Control.Feedback type="invalid">
                            {errors.search_query?.message}
                        </Form.Control.Feedback>
                    </Form.Group>
                    <Button type='submit' id={`${parameter}-submission-button`}>Submit</Button>
                    <Button onClick={()=>reset()}>Clear</Button>
                </Col>
            </Form>
        )  
    }

    return (
        <>
            <Nav id='sliding-nav-bar' 
                className={`flex-column bg-dark ${isShown ? "slideIn" : ""}`} 
                onMouseEnter={() => setIsShown(true)}
                onMouseLeave={() => setIsShown(false)}
            >
                <h3 className='sliding-nav-bar-item'>{user?.employee?.shoulder_number}</h3>
                <h5 className='sliding-nav-bar-item' onClick={()=>navigate('/police')}>Home</h5>
                <h5 className='sliding-nav-bar-item' onClick={()=>navigate('/police/my_tasks/')}>My Tasks</h5>
                <h5 className='sliding-nav-bar-item' onClick={()=>handleShowSearchBar("incident")}>Search for Incident</h5>
                { isSearchBarShown.parameter === "incident" && isSearchBarShown.shown === true ? <SearchBar parameter="incident"></SearchBar>:<></> }
                <h5 className='sliding-nav-bar-item' onClick={()=>handleShowSearchBar("location")}>Search for Location</h5>
                { isSearchBarShown.parameter === "location" && isSearchBarShown.shown === true ? <SearchBar parameter="location"></SearchBar>:<></>}
                <h5 className='sliding-nav-bar-item' onClick={()=>handleShowSearchBar("person")}>Search for Person</h5>
                { isSearchBarShown.parameter === "person" && isSearchBarShown.shown === true ? <SearchBar parameter="person"></SearchBar>:<></>}
                <h5 className='sliding-nav-bar-item' onClick={()=>handleShowSearchBar("vehicle")}>Search for Vehicle</h5>
                { isSearchBarShown.parameter === "vehicle" && isSearchBarShown.shown === true ? <SearchBar parameter="vehicle"></SearchBar>:<></>}
            </Nav>
        </>
    );
}