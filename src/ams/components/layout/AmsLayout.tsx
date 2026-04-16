import { Outlet } from 'react-router-dom';
import AmsSidebar from './AmsSidebar';
import { CasesProvider } from '../../contexts/CasesContext';
import { DomainsProvider } from '../../contexts/DomainsContext';
import { KeywordsProvider } from '../../contexts/KeywordsContext';
import { AnalyticsProvider } from '../../contexts/AnalyticsContext';
import { AuditProvider } from '../../contexts/AuditContext';
import '../../ams.css';

/**
 * AmsLayout wraps all AMS pages with:
 *  - The left sidebar
 *  - All data contexts (so any child page can call useXxx() hooks)
 */
export default function AmsLayout() {
    return (
        <CasesProvider>
            <DomainsProvider>
                <KeywordsProvider>
                    <AnalyticsProvider>
                        <AuditProvider>
                            <div className="ams-root">
                                <AmsSidebar />
                                <main className="ams-main">
                                    <Outlet />
                                </main>
                            </div>
                        </AuditProvider>
                    </AnalyticsProvider>
                </KeywordsProvider>
            </DomainsProvider>
        </CasesProvider>
    );
}
