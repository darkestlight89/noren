# noren
A Crime Reporting and Management Website using React on the frontend and Django and PostgreSQL on the backend 

## Design & Features
### Design
This website allows the general public to report crimes using the crime_reporter app. These crimes can then be viewed and managed using the crime_manager app, which can only be accessed by valid employees. This all uses one system to allow for integration between the apps securely, rather than using seperate systems as many police forces currently do. Another app is Locard, which will deal with the forensic side of the reported crime (currently still in development).

### Features
#### Home Page
The website will automatically navigate here, showing all the latest news (currently just blank for demonstration purposes)

#### Report a Crime
Click on report an incident to access the form the report a crime. This allows you to add known details about a crime. React form provides instant user feedback for fields that are required or are invalid. On submission, this creates an incident model and person models on the backend. 

#### Police Log-in
Log in with authorised credentials. Accounts are valid employees which are linked to the Django User model. This will take you to the all incidents page.

#### All Incidents Page
Click on an incident/person to view it/them.  You can also click on a date, location or incident type to filter the results by these parameters.

#### Search bar
Sliding to the LHS of the page will bring up the search bar, which allows you to search for incidents, locations, people and vehicles.  

#### Incident Page
Shows overall information about information. Click on 'View Log' to see any and add case updates. These are currently uneditable for continuity. 'View Exhibits' shows any exhibits on the case and allows you to add and edit exhibits freely. 'View Tasks' shows all active tasks on the case and allows you to assign another task to an employee and mark tasks as completed, which will automatically hide them from view.

#### Profile Page
Shows overall information about person. Photos are blank for demonstration purposes.

#### Vehicle Page
Shows overall information about person. Photos are blank for demonstration purposes.


## Usage
### Navigate to project folder using cd:
    eg: cd ../my_downloads/noren

### use docker to run:
    eg: docker compose up

### to stop:
    eg: docker compose down




