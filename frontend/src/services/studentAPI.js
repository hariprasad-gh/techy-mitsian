const API_URL = 'http://localhost:5000/api/students';

export const getStudents = async (token) => {
  const response = await fetch(`${API_URL}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch students list');
  }
  return data;
};

export const getStudentById = async (id, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch student profile');
  }
  return data;
};

export const updateStudentProfile = async (profileData, token) => {
  const response = await fetch(`${API_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }
  return data;
};
