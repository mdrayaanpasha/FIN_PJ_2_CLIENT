import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import QuantivaDashboard from './pages/analysis/main';
import QuantivaHome from './pages/home/main';
import Links from './pages/links/main';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path='/dashboard' element={<QuantivaDashboard />} />
                <Route path='/' element={<QuantivaHome />} />
                <Route path='/links' element={<Links />} />
            </Routes>
        </Router>
    )
}