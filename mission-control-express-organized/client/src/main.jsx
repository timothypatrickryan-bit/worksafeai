import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Dashboard from './pages/Dashboard';
import ProjectDetail from './pages/ProjectDetail';
import ProjectEdit from './pages/ProjectEdit';
import GapAnalysis from './pages/GapAnalysis';
import Team from './pages/Team';
import Contacts from './pages/Contacts';
import Calendar from './pages/Calendar';
import Memory from './pages/Memory';
import Docs from './pages/Docs';
import SkillsManagement from './pages/SkillsManagement';
import Improvements from './pages/Improvements';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="projects/:id" element={<ProjectDetail />} />
          <Route path="projects/:id/edit" element={<ProjectEdit />} />
          <Route path="gap-analysis" element={<GapAnalysis />} />
          <Route path="team" element={<Team />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="memory" element={<Memory />} />
          <Route path="docs" element={<Docs />} />
          <Route path="skills" element={<SkillsManagement />} />
          <Route path="improvements" element={<Improvements />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
