import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { getVehicle } from "./api_management";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import { SlidingNavBar } from "./sliding_nav_bar";
import { useNavigate } from "react-router-dom";
import { IsUserLoggedIn } from "./auxillary_functions";
import Card from 'react-bootstrap/Card';

export default function VehiclePage({user}) {
    const { vehicleReg } = useParams();
    const [vehicle, setVehicle] = useState({})
    const navigate = useNavigate();
    useEffect(()=>{
        if (!user?.employee) return;
            async function loadVehicle() {
                const data = await getVehicle(vehicleReg);
                setVehicle(data.vehicle);
            }
        loadVehicle();
        }, [user]);
    return (
        <> <title>Vehicle: {vehicle.vehicle_reg}</title>
            <IsUserLoggedIn user={user}/>
            <nav>
                <SlidingNavBar user={user}/>
            </nav>
            <main>
                <h1>Vehicle Reg: {vehicle?.vehicle_reg}</h1>
                <Card className="vehicle-card">
                    <div className="d-flex">
                        <Card.Img className="profile-card-image" variant="top" src="" alt={`Photo 1 of ${vehicle?.vehicle_reg}`}/>
                        <Card.Img className="profile-card-image" variant="top" src="" alt={`Photo 2 of ${vehicle?.vehicle_reg}`}/>
                        <Card.Img className="profile-card-image" variant="top" src="" alt={`Photo 3 of ${vehicle?.vehicle_reg}`}/>
                        <Card.Img className="profile-card-image" variant="top" src="" alt={`Photo 4 of ${vehicle?.vehicle_reg}`}/>
                        <Card.Img className="profile-card-image" variant="top" src="" alt={`Photo 5 of ${vehicle?.vehicle_reg}`}/>
                        <Card.Img className="profile-card-image" variant="top" src="" alt={`Photo 6 of ${vehicle?.vehicle_reg}`}/>
                    </div>
                    <Card.Body>
                        <p><b>Vehicle Make: </b>{vehicle?.make}</p>
                        <p><b>Vehicle Model: </b>{vehicle?.model}</p>
                        <p><b>Vin No. </b>{vehicle?.vin_number}</p>
                        <b>Involved Incidents:</b>
                        {vehicle?.incidents?.map((incident, key)=>(
                            <p key={key} className="clickable-text" onClick={()=>navigate(`/police/incident/${incident}`.split(":")[0])}>{incident}</p>
                        ))}
                    </Card.Body>
                </Card>
            </main>
        </>
    )
}