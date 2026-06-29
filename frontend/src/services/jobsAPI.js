const API_URL = 'http://localhost:5000/api/jobs';

export const getJobs = async (token, companyOnly = false) => {
  const url = companyOnly ? `${API_URL}?companyOnly=true` : API_URL;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch jobs');
  }
  return data;
};

export const getJobById = async (id, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch job details');
  }
  return data;
};

export const createJob = async (jobData, token) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(jobData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create job posting');
  }
  return data;
};

export const updateJob = async (id, jobData, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(jobData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update job posting');
  }
  return data;
};

export const deleteJob = async (id, token) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete job posting');
  }
  return data;
};
