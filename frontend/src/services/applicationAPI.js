const API_URL = 'http://localhost:5000/api/applications';

export const applyForJob = async (jobId, token) => {
  const response = await fetch(`${API_URL}/apply/${jobId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit application');
  }
  return data;
};

export const getMyApplications = async (token) => {
  const response = await fetch(`${API_URL}/my`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve applications');
  }
  return data;
};

export const getJobApplications = async (jobId, token) => {
  const response = await fetch(`${API_URL}/job/${jobId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to retrieve job applications');
  }
  return data;
};

export const updateApplicationStatus = async (applicationId, status, token) => {
  const response = await fetch(`${API_URL}/${applicationId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update application status');
  }
  return data;
};
