import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import { getEmployeeTasks } from './api_management';
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { SlidingNavBar } from './sliding_nav_bar';
import { IsUserLoggedIn } from "./auxillary_functions";

export default function TaskPage({user}) {
    const [tasks, setTasks] = useState([]);
    const navigate = useNavigate();
    
    useEffect(()=>{
        if (!user?.employee) return;
            async function loadTasks() {
                const data = await getEmployeeTasks(user.employee.shoulder_number);
                setTasks(data.tasks);
                console.log(data.tasks)
            }
            loadTasks();
        }, [user]);

    return (
        <>
            <title>My Tasks</title>
            <IsUserLoggedIn user={user}/>
            <nav>
                <SlidingNavBar user={user}/>
            </nav>
            <main>
                <h1>My Tasks:</h1>
                {tasks?.length === 0 ? <h4>Nothing here</h4>:
                <Container>
                    <Row>
                        <Col md={3}>
                            <h2><b>Task</b></h2>
                        </Col>
                        <Col md={3}>
                            <h2><b>Incident</b></h2>
                        </Col>
                    </Row>
                    {tasks?.map((task)=>
                        task.completed === true ? <></>:
                            <Row className="task-page-row" key={task.id}>
                                <Col md={3}>
                                    <h3 className="clickable-text" 
                                        onClick={()=>navigate(`/police/incident/${task.incident}`.replace(/: .*$/gm, ''))}>
                                        {task?.title}</h3>
                                </Col>
                                <Col md={3}>
                                    <h3 className="clickable-text" 
                                        onClick={()=>navigate(`/police/incident/${task.incident}`.replace(/: .*$/gm, ''))}>
                                        {task?.incident}
                                    </h3>
                                </Col>
                            </Row> )}
                </Container>}
            </main>
        </>
    )
}