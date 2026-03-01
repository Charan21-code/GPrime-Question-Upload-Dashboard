import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import UploadQuestion from './pages/UploadQuestion';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload-question" element={<UploadQuestion />} />
        </Routes>
    );
}
