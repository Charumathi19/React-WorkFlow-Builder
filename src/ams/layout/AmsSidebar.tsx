import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    FileSearch,
    FilePlus,
    Globe,
    Tag,
    ScrollText,
    BarChart3,
    Shield,
} from 'lucide-react';
import '../ams.css';

const NAV_ITEMS = [
    { label: 'Dashboard', to: '/ams', icon: LayoutDashboard, end: true },
    { label: 'Cases', to: '/ams/cases', icon: FileSearch },
    { label: 'New Case', to: '/ams/cases/new', icon: FilePlus },
    { label: 'Domains', to: '/ams/domains', icon: Globe },
    { label: 'Keywords', to: '/ams/keywords', icon: Tag },
    { label: 'Audit Log', to: '/ams/audit', icon: ScrollText },
    { label: 'Analytics', to: '/ams/analytics', icon: BarChart3 },
];

export default function AmsSidebar() {
    const location = useLocation();

    return (
        <aside className="ams-sidebar">
            {/* Logo */}
            <div className="ams-sidebar-logo">
                <div className="ams-sidebar-logo-icon">
                    <Shield size={18} color="#fff" />
                </div>
                <div>
                    <div className="ams-sidebar-logo-text">AMS Platform</div>
                    <div className="ams-sidebar-logo-sub">Adverse Media</div>
                </div>
            </div>

            {/* Navigation */}
            <div className="ams-nav-section">
                <div className="ams-nav-section-label">Navigation</div>
                {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
                    <NavLink
                        key={to}
                        to={to}
                        end={end}
                        className={({ isActive }) =>
                            `ams-nav-item${isActive ? ' active' : ''}`
                        }
                    >
                        <Icon size={15} />
                        {label}
                    </NavLink>
                ))}
            </div>
        </aside>
    );
}
