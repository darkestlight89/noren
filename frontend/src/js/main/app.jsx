import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NewsLoader from '../crime_reporter/home_page';
import ReportingForm from '../crime_reporter/reporting_page';
import LoginPage from '../crime_manager/login_page';
import NavbarMaker from './navbar_config';
import CrimeManagerPage from '../crime_manager/crime_manager_page';
import IncidentPage from '../crime_manager/incident_page';
import { useState, useEffect } from 'react';
import ProfilePage from '../crime_manager/profile_page';
import TaskPage from '../crime_manager/task_page';
import SearchResultsPage from '../crime_manager/search_results_page';
import VehiclePage from '../crime_manager/vehicle_page';
import ForensicsHomePage from '../Locard/forensics_home_page';

export default function URLLoader() {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    async function checkAuth() {
        try {
            const res = await fetch("/police/api/auth/current_user/", {
                credentials: "include",
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(false);
            }
        } catch {
            setUser(false);
        }
    }
      checkAuth();
    }, []);
  return (
    <>
    <main>
      <BrowserRouter>
      <nav>
        <NavbarMaker user={user} setUser={setUser}/>
      </nav>
        <section id="router-section">
          <Routes>
            <Route path="home" element={<NewsLoader user={user} setUser={setUser}/>} />
            <Route path="report" element={<ReportingForm setUser={setUser}/>} />
            <Route path="police" element={<CrimeManagerPage user={user} setUser={setUser}/>} />
            <Route path="police/my_tasks" element={<TaskPage user={user}/>}/>
            <Route path="police/profile/:profileID" element={<ProfilePage user={user}/>} />
            <Route path="police/filter" element={<CrimeManagerPage user={user} setUser={setUser}/>} />
            <Route path="police/login" element={<LoginPage user={user} setUser={setUser}/>} />
            <Route path="police/search" element={<SearchResultsPage user={user} />} />
            <Route path="police/incident/:incidentReference" element={<IncidentPage user={user}/>} />
            <Route path="police/vehicle/:vehicleReg" element={<VehiclePage user={user}/>} />
            <Route path="forensics/home" element={<ForensicsHomePage user={user} setUser={setUser}/>}/>
          </Routes>
        </section>
      </BrowserRouter>
    </main>
    </>
  );
}