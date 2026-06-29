const API_URL = 'http://localhost:5000/api/auth'; // Company profiles are associated with Auth/Users

export const getCompanies = async (token) => {
  const response = await fetch(`${API_URL}/companies`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch companies list');
  }
  return data;
};

export const updateCompanyProfile = async (profileData, token) => {
  const response = await fetch(`${API_URL}/company-profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update company profile');
  }
  return data;
};
