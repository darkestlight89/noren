import Form from 'react-bootstrap/Form'
import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button'
import Cookies from 'js-cookie';
import { useForm, useFieldArray } from "react-hook-form";

async function submitReport(data) {
    const csrftoken = Cookies.get('csrftoken');
    const response = await fetch(`/report_submit`, {
        method: 'POST',
        credentials: "include",
        headers: {"Content-Type": "application/json", 'X-CSRFToken': csrftoken},
        body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) {
        console.log("Backend validation error:", result);
        throw new Error(JSON.stringify(result));
    }
    return result;
}
    
export default function ReportingForm({setUser}) {
    const [incidentTypes, setIncidentTypes] = useState([]);
    const [victimEnabled, setVictimEnabled] = useState(false);
    const [suspectEnabled, setSuspectEnabled] = useState(false);
    const [witnessEnabled, setWitnessEnabled] = useState(false);
    const [selfVictim, setSelfVictim] = useState(false);
    
    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitSuccessful },
    } = useForm({shouldUnregister: true});
    const victimArray = useFieldArray({
        control,
        name: "victim"
    });
    const suspectArray = useFieldArray({
        control,
        name: "suspect"
    });
    const witnessArray = useFieldArray({
        control,
        name: "witness"
    });

    //Conditional disabled states
    const isAddSuspectDisabled = suspectArray.fields.length >= 10; 
    const isRemoveSuspectDisabled = suspectArray.fields.length <= 1; 
    const isAddVictimDisabled = victimArray.fields.length >= 10; 
    const isRemoveVictimDisabled = victimArray.fields.length <= 1;
    const isAddWitnessDisabled = witnessArray.fields.length >= 10; 
    const isRemoveWitnessDisabled = witnessArray.fields.length <= 1;

    useEffect(() => {
        fetch("get_csrf", {
            credentials: "include",});
        setUser(false);
    }, [])

    const ensureAtLeastOnePerson = (fieldEnabled, fieldArray) => {
    if (fieldEnabled && fieldArray.fields.length === 0) {
        fieldArray.append({
            first_name: "",
            family_name: "",
            date_of_birth: ""
        });
    }
    };
    
    useEffect(() => {
        ensureAtLeastOnePerson(victimEnabled, victimArray)
        , [victimEnabled]})

    useEffect(() => {
        ensureAtLeastOnePerson(suspectEnabled, suspectArray)
        , [suspectEnabled]})

    useEffect(() => {
        ensureAtLeastOnePerson(witnessEnabled, witnessArray)
        , [witnessEnabled]})

    const getIncidentTypes = async() => {
        const response = await fetch(`get_incident_types`);
        const data = await response.json();
        setIncidentTypes(data.incident_types);
    }

    useEffect(() => {
        getIncidentTypes();
    }, []);
                       

    const onSubmit = async (data) => {
        try {
           const result = await submitReport(data);
           console.log("Success:", result);
           } catch (err) {
                console.log(err)
                console.error("Error:", err.message);
        };
    };

    // Create people sections to prevent dry
    const peopleSections = [
        {
            type: "victim",
            title: "Victim Details",
            enabled: victimEnabled,
            setEnabled: setVictimEnabled,
            isAddDisabled: isAddVictimDisabled,
            isRemoveDisabled: isRemoveVictimDisabled,
            label: selfVictim
            ? "Can you identify any other victims?"
            : "Can you identify any victims?",
            ...victimArray
        },
        {
            type: "suspect",
            title: "Suspect Details",
            enabled: suspectEnabled,
            setEnabled: setSuspectEnabled,
            isAddDisabled: isAddSuspectDisabled,
            isRemoveDisabled: isRemoveSuspectDisabled,
            label: "Can you identify any suspects?",
            ...suspectArray
        },
        {
            type: "witness",
            title: "Witness Details",
            enabled: witnessEnabled,
            setEnabled: setWitnessEnabled,
            isAddDisabled: isAddWitnessDisabled,
            isRemoveDisabled: isRemoveWitnessDisabled,
            label: "Can you indentify any witnesses?",
            ...witnessArray
        },
    ];

    return (
        <>
        <h1 id='reporting-form-title'>Report an Incident</h1>

        {isSubmitSuccessful ? (
            <h2 id='submit-successful-message'><strong>Thank you for submission. We will be in contact shortly.</strong></h2>
        ) : (
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            
            <Form.Group className="mb-3 reporting-form-field" controlId="reporting_person_family_name">
                <Form.Label>Family Name</Form.Label>

                {/* register value to submitted form, . allows for next-level json */}
                <Form.Control 
                    type="text"
                    placeholder="Enter Your Family Name"
                    {...register("reporting_person.family_name", 
                        { required: "Family Name is required" })}
                    isInvalid={!!errors.reporting_person?.family_name}>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                    {errors.reporting_person?.family_name?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3 reporting-form-field" controlId="reporting_person_first_name">
                <Form.Label>First Name</Form.Label>
                <Form.Control 
                    type="text" 
                    placeholder="Enter Your First Name"
                    {...register("reporting_person.first_name", 
                        { required: "First Name is required" })}
                    isInvalid={!!errors.reporting_person?.first_name}>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                    {errors.reporting_person?.first_name?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3 reporting-form-field" controlId="reporting_person_date_of_birth">
                <Form.Label>Date Of Birth</Form.Label>
                <Form.Control 
                    type="date" 
                    placeholder="dd/mm/yyyy"
                    {...register("reporting_person.date_of_birth", 
                        { required: "Correct date of birth is required", 
                          validate: value => {
                            const inputDate = new Date(value);
                            const now = new Date(); // current date
                            const eighteenYearsAgo = new Date(now); // clone current date
                            if (inputDate > now){
                                return "Birthdate cannot be in the future";
                            }
                            else if (inputDate > eighteenYearsAgo.setFullYear(now.getFullYear() - 18)) {
                                return "You must be at least 18 years old to report a crime.";
                            }
                            return true;
                          }
                    })}
                    isInvalid={!!errors.reporting_person?.date_of_birth}>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                    {errors.reporting_person?.date_of_birth?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3 reporting-form-field" controlId="reporting_person_contact_number">
                <Form.Label>Contact Number</Form.Label>
                <Form.Control 
                    type="number" 
                    placeholder="Enter the best contact number for yourself"
                    {...register("reporting_person.contact_number", 
                        {   required: "Please enter your phone-number", 
                            pattern: {
                                value: /^0[0-9]{10}$/,
                                message: "Please enter a valid phone-number"
                            }
                         })}
                    isInvalid={!!errors.reporting_person?.contact_number}>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                    {errors.reporting_person?.contact_number?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3 reporting-form-field" controlId="reporting_person_email">
                <Form.Label>Your Email address</Form.Label>
                <Form.Control 
                    type="email" 
                    placeholder="name@example.com"
                    {...register("reporting_person.email", 
                        {   required: "Please enter your email", 
                            pattern: {
                                value: /^\S+@\S+\.\S+$/,
                                message: "Please enter a valid email"
                            }
                         })}
                    isInvalid={!!errors.reporting_person?.email}>
                </Form.Control>
                <Form.Control.Feedback type="invalid">
                    {errors.reporting_person?.email?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3 reporting-form-field" controlId="incident_type">
                <Form.Label>Incident</Form.Label>
                <Form.Select 
                    {...register("incident_type", 
                        { required: "Incident type required" }
                    )
                    }
                    isInvalid={!!errors["incident_type"]}>
                    <option value="">Please select...</option>
                    {incidentTypes.map((incident, i) => (
                        <option value={incident} key={incident}>{incident}</option>
                    ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                    {errors["incident_type"]?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3 reporting-form-field" controlId="location">
                <Form.Label>Location</Form.Label>
                <Form.Control 
                    type="text" 
                    placeholder="Enter where the incident has occurred"
                    {...register("location", 
                        { required: "Location is required" })}
                    isInvalid={!!errors["location"]}>
                </Form.Control>
                 <Form.Control.Feedback type="invalid">
                    {errors["location"]?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3 reporting-form-field" controlId="date_and_time_of_incident">
                <Form.Label>Date and Time of Incident</Form.Label>
                <Form.Control 
                    type="datetime-local" 
                    placeholder="dd/mm/yyyy, hh:mm"
                    {...register("date_and_time_of_incident", 
                        { required: "Date and time of incident is required", 
                            validate: value => {
                                const inputDate = new Date(value);
                                const now = new Date();
                                if (inputDate > now){
                                    return "Date and time of incident cannot be in the future";
                                }
                                return true;
                            }
                        })}      
                    isInvalid={!!errors["date_and_time_of_incident"]}>
                </Form.Control>
                 <Form.Control.Feedback type="invalid">
                    {errors["date_and_time_of_incident"]?.message}
                </Form.Control.Feedback>
            </Form.Group>
            <Form.Check className="reporting-form-field" 
            type="switch" 
                id="victim_self_switch" 
                label="Are you a victim of this incident?"
                {...register("victim_self_switch" )}
                onChange={()=>setSelfVictim(prev => !prev)}>
            </Form.Check>

            
            {peopleSections.map((section) => (
                <div key={section.type}>
                    <Form.Check
                        className="reporting-form-field"
                        type="switch"
                        id={`${section.type}-switch`}
                        label={section.label}
                        checked={section.enabled}
                        onChange={() => section.setEnabled(prev => !prev)}>
                    </Form.Check>
                    {section.enabled && (
                        <div>
                            <h3 className='person-details-title'>{section.title}</h3>
                            {section.fields.map((field, index) => (
                                <div key={field.id}>

                                    {/* Family Name */}
                                    <Form.Group className="mb-3 reporting-form-field" controlId={`${section.type}_${index}_family_name`}>
                                        <Form.Label>{section.type}'s Family Name</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter their Family Name"
                                            {...register(`${section.type}.${index}.family_name`, {
                                                required: section.enabled && "Family Name is required",
                                            })}
                                            isInvalid={!!errors[`${section.type}.${index}.family_name`]}>
                                        </Form.Control>
                                        <Form.Control.Feedback type="invalid">
                                            {errors[`${section.type}.${index}.family_name`]?.message}
                                        </Form.Control.Feedback>
                                    </Form.Group>

                                    {/* First Name */}
                                    <Form.Group className="mb-3 reporting-form-field" controlId={`${section.type}_${index}_first_name`}>
                                    <Form.Label>{section.type}'s First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter their first name"
                                        {...register(`${section.type}.${index}.first_name`, {
                                            required: section.enabled && "First Name is required",
                                        })}
                                        isInvalid={!!errors[`${section.type}.${index}.first_name`]}>
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {errors[`${section.type}.${index}.first_name`]?.message}
                                    </Form.Control.Feedback>
                                    </Form.Group>

                                    {/* Date of Birth */}
                                    <Form.Group className="mb-3 reporting-form-field" controlId={`${section.type}_${index}_date_of_birth`}>
                                    <Form.Label>{section.type}'s Date of Birth</Form.Label>
                                    <Form.Control
                                        type="date"
                                        {...register(`${section.type}.${index}.date_of_birth`, {
                                            required: section.enabled && "Date of birth is required",
                                            validate: value => {
                                                if (new Date(value) > new Date()) {
                                                    return "Birthdate cannot be in the future";
                                                }
                                                return true;
                                            },
                                        })}
                                        isInvalid={!!errors[`${section.type}.${index}.date_of_birth`]}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors[`${section.type}.${index}.date_of_birth`]?.message}
                                    </Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                            ))}
                            <Button type="button" className='reporting-form-button' disabled={section.isAddDisabled} onClick={() => section.append({ first_name: "", family_name: "", date_of_birth: "" })}>
                                Add Another {section.type}
                            </Button>
                            <Button type="button" className='reporting-form-button' disabled={section.isRemoveDisabled} onClick={() => section.remove(section.fields.length - 1)}>
                                Remove {section.type}
                            </Button>
                        </div>
                    )}
                </div>
            ))}
            <Button type='submit' className='reporting-form-button' id='form-submission-button'>Submit</Button>
       </Form>
       )}
       </>
    )
}