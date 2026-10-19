


// Get functions
export async function getIncidents(filter, query) {
        const params = new URLSearchParams();
        if (filter){
            params.append("filter", filter);
        }
        if (query) {
            params.append("query", query);
        }
        const url = `/police/api/get_incidents/?${params.toString()}`;
        const response = await fetch(url);
        return response.json();
    }

export async function getPerson(id) {
    const response = await fetch (`/police/api/get_person/?id=${id}`)
    return response.json();
}

export async function getEmployeeTasks(shoulder_number) {
    const response = await fetch (`/police/api/get_tasks/?shoulder_number=${shoulder_number}`)
    return response.json()
}

export async function getIncidentTasks(incident_reference) {
    const response = await fetch (`/police/api/get_tasks/?incident_reference=${incident_reference}`)
    return response.json()
}

export async function getLogEntries(incident_reference) {
    const response = await fetch (`/police/api/get_log_entries/?incident_reference=${incident_reference}`)
    return response.json()
}

export async function getExhibits(incident_reference) {
    const response = await fetch (`/police/api/get_exhibits/${incident_reference}/`);
    return response.json();
}

export async function getEmployeeShoulderNumbers () {
    const response = await fetch (`/police/api/get_employee_shoulder_numbers/`);
    return response.json();
}

export async function getVehicle(vehicle_reg) {
    const response = await fetch (`/police/api/get_vehicle/${vehicle_reg}/`)
    return response.json()
}

export async function getIncidentTypes() {
        const response = await fetch("/police/api/get_pre_determined_locations/");
        return response.json();
    }

export async function searchObjects(filter, query) {
    const params = new URLSearchParams({filter, query});
    const url = `/police/api/search_objects/?${params}`;
    const response = await fetch(url);
    return response.json();
}
