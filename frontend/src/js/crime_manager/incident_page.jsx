import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import { getIncidents, getLogEntries, getExhibits, getIncidentTypes, getIncidentTasks, getEmployeeShoulderNumbers } from "./api_management";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from "react-bootstrap/esm/Button";
import { useForm } from "react-hook-form";
import Form from 'react-bootstrap/Form'
import Cookies from 'js-cookie';
import { SlidingNavBar } from "./sliding_nav_bar";
import { IsUserLoggedIn } from "./auxillary_functions";
import { snakeCaseConverter } from "../main/general_functions";

async function submission(submission_type, data, parameter) {
    const csrftoken = Cookies.get('csrftoken');
    let response;
    let url;
    let method;
    switch(submission_type) {

        // POST Methods
        case "logEntry":
            url = `/police/api/${parameter}/set_log_entry/`
            method = "POST"
            break;
        case "createExhibit":
            url = `/police/api/${parameter}/set_exhibit/${data.seizing_officer}/`
            method = "POST"
            break;
        case "createMovement":
            url = `/police/api/${parameter}/set_movement/`
            method = "POST"
            break;
        case "createTask": 
            url = `/police/api/set_task/${parameter}/`
            method = "POST"
            break;

        // PATCH Methods
        case "updateExhibit":
            url = `/police/api/update_exhibit/${parameter}/`
            method = "PATCH"
            break;
        case "updateTask":
            url = `/police/api/update_task/${parameter}/`
            method = "PATCH"
        default:
            throw new Error ("Submission type cannot be found")
    }
    
    response = await fetch(url, {
        method: method,
        credentials: "include",
        headers: {"Content-Type": "application/json", 'X-CSRFToken': csrftoken},
        // Include body if data included: ...spreads objects properties into options, 
        // allowing to condtional addition of properties
        ...(data && {body:JSON.stringify(data)}),
    })
    
    const result = await response.json();
    if (!response.ok) {
        console.log("Backend validation error:", result);
        throw new Error(JSON.stringify(result));
    }
    return result;
}

// Main Function
export default function IncidentPage({user}) {
    const navigate = useNavigate();
    const [incident, setIncident] = useState({
                                            victim:[], 
                                            suspect:[], 
                                            witness:[], 
                                            reporting_person:{}});
    const { incidentReference } = useParams();
    const [isLogVisible, setIsLogVisible] = useState(false);
    const [logEntries, setLogEntries] = useState([]);
    const [isExhibitsVisible, setIsExhibitsVisible] = useState(false);
    const [exhibits, setExhibits] = useState([]); 
    const [editExhibit, setEditExhibit] = useState({"exhibit": false});
    const [isAddExhibitVisible, setIsAddExhibitVisible] = useState(false);
    const [preDeterminedLocations, setPreDeterminedLocations] = useState([]);
    const [isAddMovementVisible, setIsAddMovementVisible] = useState(false);
    const [isTasksVisible, setIsTasksVisible] = useState(false);
    const [isAddTasksVisible, setIsAddTasksVisible] = useState(false);
    const [tasks, setTasks] = useState([]);
    const people_types = ["victim", "suspect", "witness"];
    const [employeesShoulderNumbers, setEmployeesShoulderNUmbers] = useState([]);
    
    const exhibitSection = [
        {
            section: "exhibit_reference",
            length: 50
        }, 
        {
            section: "exhibit_description",
            length: 500
        }, 
        {   
            section: "current_location", 
        },
        {
            section: "seizure_location",
            length: 500,
            clickable: true,
            link: `/police/filter?filter=location&query=`
        }, 
        {
            section: "date_and_time_of_seizure", 
            clickable: true,
            link: `/police/filter?filter=date&query=`
        }, 
        {
            section: "seizing_officer", 
            clickable: true,
            link: `/police/profile/`
        }
    ]

    // Loading functions
    const loadLogEntries = async() => {
        const data = await(getLogEntries(incidentReference));
        setLogEntries(data.log_entries);
    }

    const loadExhibits = async() => {
        const data = await(getExhibits(incidentReference))
        const sortedData = data.exhibits.slice().sort((a,b)=>
            // localeCompare is alphabetical sort
            a.exhibit_reference.localeCompare(b.exhibit_reference))
        setExhibits(sortedData)
    }

    const loadIncidentTypes = async() => {
        const data = await(getIncidentTypes());
        setPreDeterminedLocations(data.pre_determined_locations);
    }

    const loadTasks = async() => {
        const data = await(getIncidentTasks(incidentReference));
        setTasks(data.tasks);
    }

    const loadEmployeeShoulderNumbers = async() => {
        const data = await(getEmployeeShoulderNumbers());
        setEmployeesShoulderNUmbers(data.employee);
    }

    useEffect(() => {
        async function loadIncident() {
            const data = await(getIncidents("incident_reference", incidentReference));
            setIncident(data.incident);
        }
        loadIncident();
        loadIncidentTypes();
    }, [])


    // Form makers
    const LogFormMaker = () => {

    // Unbelievably, we need a register for each form. 
        const {
            register: registerLog,
            handleSubmit: handleLogSubmit,
            control: controlLog,
            reset: resetLog,
            formState: { errors:logErrors, isSubmitSuccessful: isLogSubmitSuccessful}
        } = useForm({shouldUnregister: true});

        const onLogSubmit = async (data) => {
            try {
            const result = await submission("logEntry", data, incidentReference);
            console.log("Success:", result);
            } catch (err) {
                    console.log(err)
                    console.error("Error:", err.message);
            };
            loadLogEntries();
            resetLog();
        };

        return (
            <Form noValidate onSubmit={handleLogSubmit(onLogSubmit)}>
                <Form.Group controlId="title" className="log-entry">
                    <Form.Control 
                        type="text"
                        placeholder="Title"
                        {...registerLog("title", 
                            { required: "Title cannot be blank", 
                            maxLength: {
                                value: 50,
                                message: "Title must be less than 50 characters",
                            },
                            })}
                        isInvalid={!!logErrors.title}>
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {logErrors.title?.message}
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group controlId="content" className="log-entry">
                    <Form.Control 
                        type="textarea"
                        placeholder="Entry"
                        {...registerLog("content", 
                            { required: "Log entry cannot be blank" })}
                        as="textarea" rows={5}
                        isInvalid={!!logErrors.content}
                        >
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {logErrors.content?.message}
                    </Form.Control.Feedback>
                </Form.Group>
                <Button type='submit' id='log-entry-submission-button'>Submit</Button>
                <Button variant="secondary" onClick={()=>resetLog()}>Clear</Button>
            </Form>
        )
    }

    const MovementFormMaker = ({exhibit, j}) => {
        const today = new Date().toISOString().split("T")[0];
        const {
            register: registerMovement,
            handleSubmit: handleMovementSubmit,
            control: controlMovement,
            reset: resetMovement,
            formState: { errors:movementErrors, isSubmitSuccessful: isMovementSubmitSuccessful}
        } = useForm({shouldUnregister: true});

        const onMovementSubmit = async (data, index) => {
            try {
                const result = await submission("createMovement", data.movements[index], exhibit.id)
                console.log("Success:", result);
            } catch (err) {
                console.log(err)
                console.error("Error:", err.message);
            };
            loadExhibits();
            resetMovement();
            setIsAddMovementVisible(prev=>({...prev, [j]:!prev[j]}))
        }
        
        return (
            <Form noValidate onSubmit={(handleMovementSubmit((data)=>{onMovementSubmit(data, j)}))}>
                <Form.Group controlId = {`movements.${j}.to_location`}>
                    <Form.Label>To Location</Form.Label>
                    <Form.Select 
                        {...registerMovement(`movements.${j}.to_location`, 
                            { required: "To location required" }
                        )
                        }
                        isInvalid={!!movementErrors.movements?.[j]?.to_location}>
                        <option value="">Please select...</option>
                            {preDeterminedLocations.map((location) => (
                                <option value={location} key={location}>{location}</option>
                            ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {movementErrors.movements?.[j].to_location?.message}
                    </Form.Control.Feedback> 
                </Form.Group>
                <Form.Group controlId = {`movements.${j}.movement_date`}>
                    <Form.Label>Movement Date</Form.Label>
                    <Form.Control className="exhibit-input"
                        type = "date"
                        defaultValue={today}
                        {...registerMovement(`movements.${j}.movement_date`, 
                            { required: "To location required",
                                validate: userInput=> {
                                    const inputDate = new Date(userInput);
                                    const now = new Date();
                                    if (inputDate > now){
                                        return "Date and time of incident cannot be in the future";
                                    }
                                }
                            } 
                        )}
                        isInvalid={!!movementErrors.movements?.[j]?.movement_date}>
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {movementErrors.movements?.[j].movement_date?.message}
                    </Form.Control.Feedback> 
                </Form.Group>
                <Button type='submit' className="movement-submit-button">Add</Button>
            </Form>
        )
    }

    const ExhibitFormMaker = ({editMode, exhibit, j}) => {
        const {
            register: registerExhibit,
            handleSubmit: handleExhibitSubmit,
            control: controlExhibit,
            reset: resetExhibit,
            formState: { errors: exhibitErrors, isSubmitSuccessful: isExhibitSubmitSuccessful}
        } = useForm({shouldUnregister: true});

        const getDefaultValue = (exhibit, valueSection) => {

            // Specific cases for date and time of seizure and seizing officer due to formatting. 
            switch (valueSection) {
                case "date_and_time_of_seizure":
                    return `${exhibit?.[valueSection]}`.slice(0,16);
                case "seizing_officer":
                    return `${exhibit?.[valueSection].shoulder_number}`
                default:
                    return `${exhibit?.[valueSection]}`
            }
        }

        const onExhibitSubmit = async (data, index, exhibitID) => {
            try {
                const result = await (editMode ? submission("updateExhibit", data.exhibits[index], exhibitID)
                    :submission("createExhibit", data, incidentReference));
                console.log("Success:", result);
            } catch (err) {
                console.log(err)
                console.error("Error:", err.message)
            }
            loadExhibits();
            resetExhibit();
            if (editMode) {
                setEditExhibit(prev=>({...prev, [index]:!prev[index]}))
            }
            setIsAddExhibitVisible(false);
        }

        return (
          <Form noValidate className="exhibit-edit-form" onSubmit={handleExhibitSubmit((data)=>{onExhibitSubmit(data, j, exhibit?.id)})}>
                {Object.entries(exhibitSection).map(([key, value])=>(
                    <div className="shadow-table-row" key={key}>
                        {value.section === "current_location" ? <></>:
                            <Form.Group controlId={editMode ? `exhibits.${j}.${value.section}`:value.section}>
                                <Form.Control className="exhibit-input"
                                    type={value.section === "date_and_time_of_seizure" ? "datetime-local":"text"}
                                    defaultValue={editMode ? (getDefaultValue(exhibit, value.section)):
                                        undefined}
                                    placeholder={editMode ? undefined: snakeCaseConverter(value.section)}
                                    {...registerExhibit(editMode ? `exhibits.${j}.${value.section}`:`${value.section}`, 
                                        { required: `${snakeCaseConverter(value.section)} cannot be blank`, 
                                        maxLength: value.length ? {
                                            value: value.length,
                                            message: `${snakeCaseConverter(value.section)} must be less than ${value.length} characters`,
                                        }:undefined,
                                        validate: userInput => {
                                            if (userInput.trim() === ""){
                                                return `${snakeCaseConverter(value.section)} cannot be blank`
                                            }
                                            if (value.section === "exhibit_reference"){
                                                if (editMode) {
                                                    // Copy exhibits array
                                                    const exhibitsCopy = exhibits.slice()

                                                    // Remove current exhibit from array
                                                    if (j !== -1) {
                                                        exhibitsCopy.splice(j, 1)
                                                    }
                                                    for (let exhibit of exhibitsCopy) {
                                                        if (exhibit.exhibit_reference === userInput){
                                                            return "Exhibit references must be unique."
                                                        }
                                                    }
                                                }
                                                else {
                                                   for (let exhibit of exhibits){
                                                        if (exhibit.exhibit_reference === userInput) {
                                                            return "Exhibit references must be unique."
                                                        }
                                                    }
                                                }
                                            }
                                            if (value.section === "date_and_time_of_seizure") {
                                                const inputDate = new Date(userInput);
                                                const now = new Date();
                                                if (inputDate > now){
                                                    return "Date and time of incident cannot be in the future";
                                                }

                                            }
                                        }
                
                                    })}
                                    isInvalid={editMode ? !!exhibitErrors.exhibits?.[j]?.[value.section]: 
                                        !!exhibitErrors[value.section]}>
                                </Form.Control>
                                <Form.Control.Feedback type="invalid">
                                    {editMode ? exhibitErrors.exhibits?.[j]?.[value.section]?.message:
                                        exhibitErrors[value.section]?.message}
                                </Form.Control.Feedback>
                            </Form.Group>
                        }
                    </div>
                ))}            
                <Button type='submit' className='exhibit-submit-button'>Submit</Button>
            </Form>
        )
    }

    const TaskFormMaker = () => {
        const {
            register: registerTask,
            handleSubmit: handleTaskSubmit,
            control: controlTask,
            reset: resetTask,
            formState: { errors: taskErrors, isSubmitSuccessful: isTaskSubmitSuccessful}
        } = useForm({shouldUnregister: true});

        const onTaskSubmit = async (data) => {
            try {
                const result = await submission("createTask", data, incidentReference);
                console.log("Success:", result);
            } catch (err) {
                console.log(err)
                console.error("Error:", err.message);
            };
            loadTasks();
            resetTask();
            setIsAddTasksVisible(false);
        }

        return (
            <Form noValidate onSubmit={handleTaskSubmit(onTaskSubmit)}>
                <Form.Group className="task-form-group" controlId = "reciever_shoulder_number">
                    <Form.Label>To</Form.Label>
                    <Form.Select 
                        {...registerTask(`reciever_shoulder_number`, 
                            { required: "Receiver is required" }
                        )
                        }
                        isInvalid={!!taskErrors.reciever_shoulder_number}>
                        <option value="">Please select...</option>
                            {employeesShoulderNumbers?.map((shoulder_number) => (
                                <option value={shoulder_number} key={shoulder_number}>{shoulder_number}</option>
                            ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                        {taskErrors?.reciever_shoulder_number?.message}
                    </Form.Control.Feedback> 
                </Form.Group>
                <Form.Group className="task-form-group" controlId = "title">
                    <Form.Label>Title</Form.Label>
                    <Form.Control 
                        type="text"
                        placeholder="Title"
                        {...registerTask("title", 
                        { required: "Title cannot be blank" })}
                        isInvalid={!!taskErrors.title}
                        >
                    </Form.Control>
                    <Form.Control.Feedback type="invalid">
                        {taskErrors?.title?.message}
                    </Form.Control.Feedback> 
                </Form.Group>
                <Button type="submit">Submit</Button>
            </Form>
        )
    }

    const TaskCompletedFormMaker = ({task}) => {
        const [completed, setCompleted] = useState(false);

        return (
            <input
                type="checkbox"
                checked={completed}
                onChange={async() => {
                    try {
                        const result = await (submission("updateTask", null, task.id))
                        console.log("Success:", result);
                    }
                    catch (err) {
                        console.log(err)
                        console.error("Error:", err.message)
                    }
                    setCompleted(prev=>!prev);
                    loadTasks();
                }
                }
            />
        );
    };


    // Main return 
    return (
        <>
            <title>Incident: {incident.incident_reference}</title>
            <IsUserLoggedIn user={user}/>
            <SlidingNavBar user={user}/>
            <header>
                <h1>Incident: {incident.incident_reference}</h1>
            </header>
            <main>

                {/* Incident Table */}
                <section>
                    <table className="incident-page-table" id="incident-table">
                        <thead>
                            <tr>
                                <th>Incident Type</th>
                                <th>Date and Time of Incident</th>
                                <th>Location</th>
                                <th>Victim(s)</th>
                                <th>Suspect(s)</th>
                                <th>Witness(es)</th>
                            </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td className='clickable-text' onClick={()=>navigate(`/police/filter?filter=incident_type&query=${incident?.incident_type}`)}>{incident?.incident_type}</td>
                            <td className='clickable-text' onClick={()=>navigate(`/police/filter?filter=date&query=${incident.date_and_time_of_incident.split("T")[0]}`)}>{incident?.date_and_time_of_incident?.split("T").join(" ").slice(0,-1)}</td>
                            <td className='clickable-text' onClick={()=>navigate(`/police/filter?filter=location&query=${incident.location}`)}>{incident?.location}</td>
                            {people_types.map((person_type, i)=>(
                                <td key={i}>
                                {incident?.[person_type].map((person, j)=>(
                                    <ul key={j}>
                                        <li className='clickable-text' onClick={()=>navigate(`/police/profile/${person?.id}`)}>{person?.name}</li>
                                    </ul>
                                ))}
                                </td>
                            ))}
                        </tr>
                        </tbody>
                    </table>
                </section>

                {/* Log Display and Functionality */}
                <section className="display-section">
                    <div className="button-container">
                        {isLogVisible ?
                            <></>
                            :<Button id="view-log-button" 
                                onClick={()=>{loadLogEntries();
                                setIsLogVisible(prev=>!prev)}}>
                                    View Log
                            </Button>}
                    </div>
                    <div className="api-container">
                        {isLogVisible ? <>
                            <h2>Log Entries</h2>
                            <div className="log-container">
                                <div className="log-entries">
                                    {logEntries.map((logEntry, i) => (
                                        <Row key={i}>
                                                <Col md={true}>
                                                    <h4 className="log-entry"><b>{logEntry.title}</b></h4>
                                                    <h5 className="log-entry"><i>{logEntry.author}</i></h5>
                                                    <p className="log-entry">{logEntry.content}</p>
                                                </Col>
                                        </Row>
                                            ))}
                                </div>
                                <div className="hide-button-container">
                                    <Button className="hide-button" 
                                        variant="secondary" 
                                        onClick={()=>{setIsLogVisible(prev=>!prev)}}>
                                        Hide Log
                                    </Button>
                                </div>
                            </div>
                            <LogFormMaker/>
                        </>
                        :<></>}
                    </div>
                </section>

                {/* Exhibit Display and Functionality */}                            
                <section className="display-section">
                    <div className="button-container">
                        <Button variant={isExhibitsVisible ? "secondary":"primary"}
                            onClick={()=>{
                                if (!isExhibitsVisible) {
                                    loadExhibits();
                                }
                                setIsExhibitsVisible(prev=>!prev)}}>
                                {isExhibitsVisible ? <>Hide Exhibits</>:<>View Exhibits</>}
                        </Button>
                    </div>
                    <div className="api-container">
                        {isExhibitsVisible ? 
                            <table className="incident-page-table" id="exhibits-table">
                                <thead>
                                    <tr>
                                        {Object.entries(exhibitSection).map(([key, value])=>(
                                            <th className="exhibits-table-column" key={key}>{snakeCaseConverter(value.section)}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {exhibits.map((exhibit, j) => (
                                        <tr key={j}>
                                            {editExhibit[j] ?
                                                <td colSpan={Object.entries(exhibitSection).length+1}><ExhibitFormMaker editMode={true} j={j} exhibit={exhibit}/></td>:
                                            <>{Object.entries(exhibitSection).map(([key, value])=>(
                                                <td className={value.clickable === true ? "clickable-text":""} onClick={()=> {if (value.link) {
                                                    switch (value.section){
                                                        case "date_and_time_of_seizure":
                                                            navigate(`${value.link}${exhibit[value.section].split("T")[0]}`)
                                                            break;
                                                        case "seizing_officer":
                                                            navigate(`${value.link}${exhibit[value.section].id}`)
                                                            break;
                                                        case "seizure_location":
                                                            navigate(`${value.link}${exhibit[value.section]}`)
                                                            break;
                                                        default:
                                                            console.log("Something went wrong between lines 487 and 497")
                                                    }
                                                    }}} key={key}>{
                                                    value.section === "date_and_time_of_seizure" ? exhibit[value.section].split("T").join(" ").slice(0,-1)
                                                    :value.section === "seizing_officer" ? exhibit[value.section].shoulder_number:exhibit[value.section]}
                                                </td>
                                            ))}</>}
                                            <td>
                                                <Button className="edit-exhibit-button" onClick={()=>setEditExhibit(prev=>({...prev, [j]:!prev[j]}))} variant="secondary">
                                                    {editExhibit[j] ? <>Cancel Edit</>:<>Edit</>}</Button>
                                            </td>
                                             <td>
                                                <Button className="add-movement-button"
                                                    onClick={()=>setIsAddMovementVisible(prev=>({...prev, [j]:!prev[j]}))} 
                                                    variant={isAddMovementVisible[j] ? "secondary":"success"}>
                                                    {isAddMovementVisible[j] ? <>Cancel</>:<>Add Movement</>}
                                                </Button>
                                                {isAddMovementVisible[j] ? <MovementFormMaker j={j} exhibit={exhibit}/>:<></>} 
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                        </table>:<></>}
                    </div>
                </section>

                {/* Add New Exhibit */}
                {isExhibitsVisible ?                         
                    <section className="display-section">
                        <div className="button-container">
                            <Button onClick={()=>setIsAddExhibitVisible(prev=>!prev)}>
                                {isAddExhibitVisible ? <>Cancel</>:<>Add Exhibit</>}</Button>
                        </div>
                        <div className="form-container">
                            {isAddExhibitVisible ? <ExhibitFormMaker editMode={false} j={null} exhibit={null}/>:<></>}
                        </div>
                    </section>:<></>
                }

                {/* Task Display and Functionality */}
                <section className="display-section">
                    <div className="button-container">
                        <Button variant={isTasksVisible ? "secondary":"primary"}
                            onClick={()=>{
                                if (!isTasksVisible) {
                                    loadTasks();
                                }
                                setIsTasksVisible(prev=>!prev)}}>
                                {isTasksVisible ? <>Hide Tasks</>:<>View Tasks</>}
                        </Button>
                    </div>
                        {isTasksVisible ?
                            <>
                                <div className="api-container"> 
                                    <table className="incident-page-table" id="task-table">
                                        <thead>
                                            <tr>
                                                <th className="tasks-table-column">Sender</th>
                                                <th className="tasks-table-column">Receiver</th>
                                                <th className="tasks-table-column">Title</th>
                                                <th className="tasks-table-column checkbox-column">Mark as Complete</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tasks?.map((task, k) => (
                                                <tr key={k}>
                                                    {task.completed === true ? <></>:<>
                                                        <td>{task.sender.shoulder_number}</td>
                                                        <td>{task.reciever.shoulder_number}</td>
                                                        <td>{task.title}</td>
                                                        <td className="checkbox-column">
                                                            <TaskCompletedFormMaker task={task}/>
                                                        </td>
                                                    </>
                                                    }
                                                </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                    <div className="button-container" id="task-button-container">
                                        <Button onClick={()=>{
                                            setIsAddTasksVisible(prev=>!prev);
                                            loadEmployeeShoulderNumbers();
                                        }}>{isAddTasksVisible ? <>Cancel</>:<>Add Task</>}</Button>
                                    </div>
                                </div>
                                <div className="form-container" id="task-form-container">
                                    {isAddTasksVisible ?  
                                    <TaskFormMaker/>
                                    :
                                        <></>
                                    }
                                </div>
                        </>:<></>}
                </section>      
            </main>
    </>

    )
}