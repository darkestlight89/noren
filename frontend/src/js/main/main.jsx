import ReactDOM from 'react-dom/client';
import URLLoader from './app.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../../css/crime_reporter_styles.css'
import '../../css/crime_manager_styles.css'
import '../../css/general_styles.css'

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);
root.render(<URLLoader />);