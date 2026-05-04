import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AddMember from './pages/AddMember';
import ViewMembers from './pages/ViewMembers';
import MemberDetails from './pages/MemberDetails';

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === 'Admin' ? '/admin' : '/student'} />} />
          <Route path="/admin" element={user && user.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
          <Route path="/admin/add-member" element={user && user.role === 'Admin' ? <AddMember /> : <Navigate to="/login" />} />
          <Route path="/admin/view-members" element={user && user.role === 'Admin' ? <ViewMembers /> : <Navigate to="/login" />} />
          <Route path="/admin/member/:id" element={user && user.role === 'Admin' ? <MemberDetails /> : <Navigate to="/login" />} />
          <Route path="/student" element={user && user.role === 'Student' ? <StudentDashboard /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to={!user ? '/login' : (user.role === 'Admin' ? '/admin' : '/student')} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
