
import { useState, useCallback } from 'react';
import { Project } from '../types';
import { useStorage } from './useStorage';

export function useProjects() {
  const [projects, setProjects, isLoading] = useStorage<Project[]>('projects', []);

  const addProject = useCallback(async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setProjects(prev => [...prev, newProject]);
    return newProject;
  }, [setProjects]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
    await setProjects(prev => 
      prev.map(project => 
        project.id === id 
          ? { ...project, ...updates, updatedAt: new Date() }
          : project
      )
    );
  }, [setProjects]);

  const deleteProject = useCallback(async (id: string) => {
    await setProjects(prev => prev.filter(project => project.id !== id));
  }, [setProjects]);

  const getProject = useCallback((id: string) => {
    return projects.find(project => project.id === id);
  }, [projects]);

  const getProjectsByClient = useCallback((clientId: string) => {
    return projects.filter(project => project.clientId === clientId);
  }, [projects]);

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
    getProject,
    getProjectsByClient,
    isLoading,
  };
}
