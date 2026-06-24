import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

import Login from '../components/pages/login/login';
import { MainStudent } from '../components/pages/mainStudent/mainStudent';
import { MainTeacher } from '../components/pages/mainTeacher/mainTeacher';
import { StudentDiscipline } from '../components/pages/studentDiscipline/studentDiscipline';
import { TeacherGroups } from '../components/pages/teacherGroups/teacherGroups';
import { isAuthenticated, getUserRole } from '../utils/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  role: 'student' | 'teacher';
}

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (getUserRole() !== role) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const Router = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <MainStudent />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/student/discipline/:disciplineId"
        element={
          <ProtectedRoute role="student">
            <StudentDiscipline />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <MainTeacher />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/teacher/group/:groupId"
        element={
          <ProtectedRoute role="teacher">
            <TeacherGroups />
          </ProtectedRoute>
        }
      />
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default Router;