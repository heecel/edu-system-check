const API_URL = '/api';

export interface Discipline {
  id: number;
  name: string;
  groupId: number;
}

export interface Group {
  id: number;
  name: string;
  teacherId: number;
}

/**
 * Получить группу студента по groupId
 */
export const getGroupById = async (groupId: number): Promise<Group | null> => {
  try {
    const response = await fetch(`${API_URL}/groups/${groupId}`);
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch {
    return null;
  }
};

/**
 * Получить все дисциплины для группы
 */
export const getDisciplinesByGroupId = async (groupId: number): Promise<Discipline[]> => {
  try {
    const response = await fetch(`${API_URL}/disciplines?groupId=${groupId}`);
    
    if (!response.ok) {
      return [];
    }
    
    return await response.json();
  } catch {
    return [];
  }
};

/**
 * Получить дисциплины для студента (по его groupId)
 */
export const getDisciplinesForStudent = async (studentGroupId: number): Promise<Discipline[]> => {
  return getDisciplinesByGroupId(studentGroupId);
};