import { useParams,  useNavigate } from "react-router-dom";
import { getPerson, getIncidents } from "./api_management";
import { useState, useEffect } from "react";
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import { IsUserLoggedIn } from "./auxillary_functions";
import { SlidingNavBar } from "./sliding_nav_bar";

export default function ProfilePage({user}) {
    const [person, setPerson] = useState({});
    const { profileID } = useParams();
    const [incidents, setIncidents] = useState({"incidents_as_reporting_person":[],
                                                "incidents_as_victim":[], 
                                                "incidents_as_suspect":[],
                                                "incidents_as_witness":[]
                                            });
    const formatKey = (key) => key.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
    const navigate = useNavigate();

    useEffect(() => {
        async function loadPerson() {
            const data = await(getPerson(profileID));
            setPerson(data.person);
        }
        loadPerson();
    }, [])

    useEffect(() => {
        async function loadIncidents() {
            // [key] - evaluate the expression inside and use its result as the object key
            for (const [key] of Object.entries(incidents)) {
                const data = await getIncidents(key, profileID);
                setIncidents((prev) => ({
                    ...prev,
                    [key]: data.incidents
                }));
            }
        }

        loadIncidents();
    }, [])

    return (
    <>
        <title>Profile: {person?.name}</title>
        <IsUserLoggedIn user={user}/>
        <nav>
            <SlidingNavBar user={user}/>
        </nav>
        <h1>Profile: {person?.name}</h1>
        <Card className="profile-card">
            <div className="d-flex">
                <Card.Img className="profile-card-image" variant="top" src="" alt={`Photo 1 of ${person.name}`}/>
                <Card.Img className="profile-card-image" variant="top" src="" alt={`Photo 2 of ${person.name}`}/>
                <Card.Img className="profile-card-image" variant="top" src="" alt={`Photo 3 of ${person.name}`}/>
                <Card.Img className="profile-card-image" variant="top" src="" alt={`Photo 4 of ${person.name}`}/>
            </div>
            <Card.Body>
                    <p><b>Full Name: </b>{person?.name}</p>
                    <p><b>Date of Birth: </b>{person?.date_of_birth}</p>
                    <p><b>Contact Number: </b>{person?.contact_number}</p>
                    <p><b>Email: </b>{person?.email}</p>
                    {Object.entries(incidents).map(([key, list]) => (
                        <Row key={key}>
                            <div className="incident-table-row"><strong>{formatKey(key)}</strong></div>
                            {list.length === 0 ? <p><i>None</i></p> : 
                                list.map((incident, i)=>(
                                    <Row key={i}>
                                        <Col sm={3} className='clickable-text profile-column' onClick={()=>navigate(`/police/incident/${incident.incident_reference}`)}><p>{incident.incident_reference}</p></Col>
                                        <Col sm={3} className='clickable-text profile-column' onClick={()=>navigate(`/police/filter?filter=incident_type&query=${incident.incident_type}`)}><p>{incident.incident_type}</p></Col>
                                        <Col sm={3} className='clickable-text profile-column' onClick={()=>navigate(`/police/filter?filter=location&query=${incident.location}`)}><p>{incident.location}</p></Col>
                                    </Row>
                            ))} 
                        </Row>
                    ))}
            </Card.Body>
        </Card>
    </>
    )
}