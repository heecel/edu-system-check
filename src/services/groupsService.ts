const API_URL = '/api';

export interface Group {
  id: number;
  name: string;
  teacherId: number;
}

export interface Discipline {
  id: number;
  name: string;
  groupId: number;
}

export interface Student {
  id: string;
  login: string;
  password: string;
  fullName: string;
  groupId: number;
}

/**
 * Получить все группы преподавателя по его ID
 */
export const getGroupsByTeacherId = async (teacherId: string): Promise<Group[]> => {
  try {
    const response = await fetch(`${API_URL}/groups?teacherId=${teacherId}`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch {
    return [];
  }
};

/**
 * Получить количество дисциплин в группе
 */
export const getDisciplinesCountByGroupId = async (groupId: number): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/disciplines?groupId=${groupId}`);
    if (!response.ok) {
      return 0;
    }
    const disciplines: Discipline[] = await response.json();
    return disciplines.length;
  } catch {
    return 0;
  }
};

/**
 * Получить количество студентов в группе
 */
export const getStudentsCountByGroupId = async (groupId: number): Promise<number> => {
  try {
    const response = await fetch(`${API_URL}/students?groupId=${groupId}`);
    if (!response.ok) {
      return 0;
    }
    const students: Student[] = await response.json();
    return students.length;
  } catch {
    return 0;
  }
};

/**
 * Получить все группы преподавателя с количеством дисциплин и студентов
 */
export const getFullGroupsInfo = async (teacherId: string): Promise<{
  id: number;
  name: string;
  disciplinesCount: number;
  studentsCount: number;
}[]> => {
  try {
    const groups = await getGroupsByTeacherId(teacherId);
    
    const fullInfo = await Promise.all(
      groups.map(async (group) => {
        const [disciplinesCount, studentsCount] = await Promise.all([
          getDisciplinesCountByGroupId(group.id),
          getStudentsCountByGroupId(group.id),
        ]);
        return {
          id: group.id,
          name: group.name,
          disciplinesCount,
          studentsCount,
        };
      })
    );
    
    return fullInfo;
  } catch {
    return [];
  }
};