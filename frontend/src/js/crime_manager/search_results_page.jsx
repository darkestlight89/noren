import { useEffect, useState } from 'react';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchObjects } from './api_management';
import { SlidingNavBar } from './sliding_nav_bar';
import { Navigate } from 'react-router-dom';
import { IsUserLoggedIn } from "./auxillary_functions";

export default function SearchResultsPage({user}) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const filter = searchParams.get("filter");
    const query = searchParams.get("query");
    const [searchResults, setSearchResults] = useState([]);

    const resultTableSection = {
        incident:
            {incident_reference:"Incident Reference",
            date_and_time_of_incident:"Date and Time",
            incident_type:"Incident Type", 
            location:"Incident Location", 
            reporting_person:"Reporting Person"},
        location: 
            {location:"Incident Location",
            date_and_time_of_incident:"Date and Time",
            incident_type:"Incident Type", 
            incident_reference:"Incident Reference", 
            reporting_person:"Reporting Person"},
        person:
            {reporting_person:"Reporting Person",
            incident_reference:"Incident Reference",  
            incident_type:"Incident Type",
            date_and_time_of_incident:"Date and Time",
            location:"Incident Location"
            },
        vehicle:
            {involved_vehicles:"Involved Vehicles",
            incident_reference:"Incident Reference",  
            incident_type:"Incident Type",
            date_and_time_of_incident:"Date and Time",
            location:"Incident Location"
            }
        }

    useEffect(() => {
        async function loadSearchResults() {
            const data = await(searchObjects(filter, query));
            setSearchResults(data.objects);
        }
        loadSearchResults();
    }, [])

    const handleLinkClick = (key, result, vehicle) => {
        switch (key) {
            case "incident_reference":
                navigate(`/police/incident/${result.incident_reference}`)
                break;
            case "location":
                navigate(`/police/filter?filter=location&query=${result.location}`)
                break;
            case "date_and_time_of_incident":
                navigate(`/police/filter?filter=date&query=${result.date_and_time_of_incident.split("T")[0]}`)
                break;
            case "incident_type":
                navigate(`/police/filter?filter=incident_type&query=${result.incident_type}`)
                break;
            case "reporting_person":
                navigate(`/police/profile/${result.reporting_person.id}`)
                break;
            case "involved_vehicles":
                navigate(`/police/vehicle/${vehicle.vehicle_reg}`)
        }
    }

    const ResultsTableHeadingMaker = () => {
        return(
            <thead>
                <tr>
                    {Object.entries(resultTableSection[filter]).map(([key, value]) => (
                        <th key={key} className="search-results-table-data">
                            <b>{value}</b>
                        </th>
                    ))}
                </tr>
            </thead>
        )
    }

    const ResultsTableMaker = () => {
        const displayValue = (key, result, vehicle) => {
            switch (key) {
                case "reporting_person": 
                    return result[key].name;
                case "involved_vehicles":
                    return vehicle.vehicle_reg;
                case "date_and_time_of_incident":
                    return result[key].split("T").join(" ").slice(0,-1)
                default:
                    return result[key]
            }
        }
        return (
            <tbody>
                {searchResults.map((result, i)=>(
                    result.involved_vehicles.map((vehicle, vehicleIndex) => (
                    <tr key={i-vehicleIndex} className='results-table-row'>
                        {Object.entries(resultTableSection[filter]).map(([key, value]) => (
                            <td key={key} className='clickable-text search-results-table-data' onClick={()=>handleLinkClick(key, result, vehicle)}>
                                {displayValue(key, result, vehicle)}
                            </td>
                        ))}
                    </tr>
                    ))
                ))}
            </tbody>
        )
    }

    return (
        <>  <title>Search Results</title>
            <IsUserLoggedIn user={user}/>
            <nav>
                <SlidingNavBar user={user}/>
            </nav>
            <main>
                <section className="results-table-section">
                    <Row>
                        <Col md={1}/>
                        <Col md={10}>
                            <h1>Search Results:</h1>
                                <table id='search-results-table'>
                                    <ResultsTableHeadingMaker/>
                                    <ResultsTableMaker/>
                                </table>
                        </Col>
                        <Col md={1}/>
                    </Row>
                </section>
            </main>
        </>
    )
}