import { Navigate} from 'react-router-dom';

export function IsUserLoggedIn({user}) {
    if (user === undefined) {
        return <div>Loading...</div>;
    }
    if (!user) {
        return <Navigate to="/police/login" replace />;
    }
}