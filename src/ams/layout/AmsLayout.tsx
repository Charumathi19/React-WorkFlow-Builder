import { Outlet } from 'react-router-dom';
import AmsSidebar from './AmsSidebar';
import '../ams.css';

export default function AmsLayout() {
    return (
        <div className="ams-root">
            <AmsSidebar />
            <main className="ams-main">
                <Outlet />
            </main>
        </div>
    );
}
