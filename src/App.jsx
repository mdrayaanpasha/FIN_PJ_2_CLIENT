import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import QuantivaDashboard from './pages/analysis/main';
import QuantivaHome from './pages/home/main';

export default function App() {
    return (
        <Router>
            <Routes>
                <Route path='/dashboard' element={<QuantivaDashboard />} />
                <Route path='/' element={<QuantivaHome />} />
            </Routes>
        </Router>
    )
}