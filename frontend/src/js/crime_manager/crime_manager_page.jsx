import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import { getIncidents } from './api_management';
import { SlidingNavBar } from './sliding_nav_bar';
import { IsUserLoggedIn } from './auxillary_functions';
import { snakeCaseConverter } from "../main/general_functions";


export default function CrimeManagerPage({user, setUser}) {
    const [incidents, setIncidents] = useState([]);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (!user) return;
        async function loadIncidents() {
            const filter = searchParams.get("filter");
            const query = searchParams.get("query");
            const data = await(getIncidents(filter, query));
            setIncidents(data.incidents);
        }
        loadIncidents();
    }, [user, searchParams])

    return (
        <>
            <title>Crime Scene Manager</title>
            <IsUserLoggedIn user={user}/>
            <nav>
                <SlidingNavBar user={user}/>
            </nav>
            <header>
                {searchParams.get("filter") !== null ? <h1>Incidents - Filtered by {snakeCaseConverter(searchParams.get("filter"))}</h1>:<h1>All Incidents</h1>}
            </header>
            <main>
                <table id='crime-manager-page-table'>
                        <thead>
                            <tr>
                                <th>Incident Reference</th>
                                <th>Date and Time</th>
                                <th>Incident Type</th>
                                <th>Incident Location</th>
                                <th>Reporting Person</th>
                            </tr>
                        </thead>
                        <tbody>
                            {incidents.map((incident, i) => (
                                <tr key={i}>
                                        <td className='clickable-text' onClick={()=>navigate(`/police/incident/${incident.incident_reference}`)}>{incident.incident_reference}</td>

                                        <td className='clickable-text' onClick={()=>navigate(`/police/filter?filter=date&query=${incident.date_and_time_of_incident.split("T")[0]}`)}>{incident.date_and_time_of_incident.split("T").join(" ").slice(0,-1)}</td>    

                                        <td className='clickable-text' onClick={()=>navigate(`/police/filter?filter=incident_type&query=${incident.incident_type}`)}>{incident.incident_type}</td>

                                        <td className='clickable-text' onClick={()=>navigate(`/police/filter?filter=location&query=${incident.location}`)}>{incident.location}</td>

                                        <td className='clickable-text' onClick={()=>navigate(`/police/profile/${incident.reporting_person.id}`)}>{incident.reporting_person.name}</td>
                                </tr>
                            ))}
                        </tbody>
                </table>
            </main>
        </>)
}