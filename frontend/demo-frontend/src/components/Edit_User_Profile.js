import React, { useState , useEffect } from 'react';
import {
  Box, Button, TextField, Typography, IconButton, Chip, Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const UserProfileForm = () => {
const email = useSelector((state) => state.user.email);
const userId = useSelector((state) => state.user.username);
const [selectedFile, setSelectedFile] = useState(null);
const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: '', bio: '', address: '', phone: '', email: email ? email : '',
    linkedInUrl: '', githubUrl: '', portfolioUrl: '',
    skills: [], skillInput: '',
    additionalLinks: [''],
    education: [{ degree: '', branch: '', college: '', startYear: '', endYear: '' }],
    experience: [],
    resumeFile: null
  });


  // Fetch initial profile data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/users/get-profile', {
          params: { username: userId }
        });
        const data = response.data;
        
        // Map the response data to your form structure
        setForm(prev => ({
          ...prev,
          fullName: data.fullName || '',
          bio: data.bio || '',
          address: data.address || '',
          phone: data.phone || '',
          email: data.email || email || '',
          linkedInUrl: data.linkedInUrl || '',
          githubUrl: data.githubUrl || '',
          portfolioUrl: data.portfolioUrl || '',
          skills: data.skills || [],
          skillInput: '',
          additionalLinks: data.additionalLinks && data.additionalLinks.length > 0 ? data.additionalLinks : [''],
          education: data.education && data.education.length > 0 ? data.education : [{ degree: '', branch: '', college: '', startYear: '', endYear: '' }],
          experience: data.experience || [],
          resumeFile : data.resumeFileName || ""
        }));
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId, email]);


  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' && form.skillInput.trim()) {
      e.preventDefault();
      setForm(prev => ({
        ...prev,
        skills: [...prev.skills, prev.skillInput.trim()],
        skillInput: ''
      }));
    }
  };

  const removeSkill = (index) => {
    const updated = [...form.skills];
    updated.splice(index, 1);
    setForm(prev => ({ ...prev, skills: updated }));
  };

  const handleEducationChange = (i, field, value) => {
    const updated = [...form.education];
    updated[i][field] = value;
    setForm(prev => ({ ...prev, education: updated }));
  };

  const handleExperienceChange = (i, field, value) => {
    const updated = [...form.experience];
    updated[i][field] = value;
    setForm(prev => ({ ...prev, experience: updated }));
  };

  const addEducation = () => {
    setForm(prev => ({
      ...prev,
      education: [...prev.education, { degree: '', branch: '', college: '', startYear: '', endYear: '' }]
    }));
  };

  const removeEducation = (i) => {
    const updated = [...form.education];
    updated.splice(i, 1);
    setForm(prev => ({ ...prev, education: updated }));
  };

  const addExperience = () => {
    setForm(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', title: '', startDate: '', endDate: '', description: '' }]
    }));
  };

  const removeExperience = (i) => {
    const updated = [...form.experience];
    updated.splice(i, 1);
    setForm(prev => ({ ...prev, experience: updated }));
  };

  const addLink = () => {
    setForm(prev => ({
      ...prev,
      additionalLinks: [...prev.additionalLinks, '']
    }));
  };

  const handleLinkChange = (i, value) => {
    const updated = [...form.additionalLinks];
    updated[i] = value;
    setForm(prev => ({ ...prev, additionalLinks: updated }));
  };

  const removeLink = (i) => {
    const updated = [...form.additionalLinks];
    updated.splice(i, 1);
    setForm(prev => ({ ...prev, additionalLinks: updated }));
  };


const handleSubmit = async () => {
  const profileJson = {
    username: userId,
    fullName: form.fullName,
    bio: form.bio,
    address: form.address,
    phone: form.phone,
    email: form.email,
    education: form.education,
    experience: form.experience,
    linkedInUrl: form.linkedInUrl,
    githubUrl: form.githubUrl,
    portfolioUrl: form.portfolioUrl,
    additionalLinks: form.additionalLinks,
    skills: form.skills,
    resumeFileName: selectedFile ? `${userId}_${selectedFile.name}` : ""
  };

  try {
    // Save profile first
    const res1 = await axios.post(
      'http://localhost:8080/api/users/save-profile',
      profileJson,
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('Profile data saved:', res1.data);

    // If resume file selected, try upload
    if (selectedFile) {
      try {
        const resumeData = new FormData();
        resumeData.append('resume', selectedFile);
        resumeData.append('username', userId);

        const res2 = await axios.post(
          'http://localhost:8080/api/users/upload-resume',
          resumeData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        console.log('Resume uploaded:', res2.data);

        alert("Profile and resume uploaded successfully.");
      } catch (resumeErr) {
        console.error('Resume upload failed:', resumeErr);
        alert("Profile uploaded successfully, but resume upload failed. Please retry resume upload.");
      }
    } else {
      // No resume file selected, only profile
      alert("Profile uploaded successfully.");
    }
  } catch (profileErr) {
    console.error('Profile upload failed:', profileErr);
    alert("Profile submission failed.");
  }

  // Navigate after any submission attempt
  navigate('/Client-dashboard');
};

const handleDownloadResume = async () => {
    try {
      const response = await axios.post(
        'http://localhost:8080/api/users/download-resume',
        userId,
        { responseType: 'blob' }
      );
  
      // Check status explicitly
      if (response.status !== 200) {
        throw new Error('Resume not found or error downloading');
      }
  
      const blob = response.data;
  
      // Axios headers are case-insensitive and keys are normalized lowercase
      const disposition = response.headers['content-disposition'];
      let filename = 'resume.pdf';
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const filenameMatch = disposition.match(/filename="?(.+)"?/);
        if (filenameMatch.length === 2) filename = filenameMatch[1];
      }
  
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert('Failed to download resume.');
    }
  };
  

  

  return (
    <Box component="form" sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom>User Profile</Typography>

      <TextField label="Full Name" fullWidth required value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} margin="normal" />
      <TextField label="Bio" fullWidth required multiline value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} margin="normal" />
      <TextField label="Address" fullWidth required value={form.address} onChange={(e) => handleChange('address', e.target.value)} margin="normal" />
      <TextField label="Phone" fullWidth required value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} margin="normal" />
      <TextField label="Email" fullWidth disabled required value={form.email} onChange={(e) => handleChange('email', e.target.value)} margin="normal" />

      <Box mt={2}>
        <TextField label="Add Skill" value={form.skillInput} onChange={(e) => handleChange('skillInput', e.target.value)} onKeyDown={handleSkillKeyDown} fullWidth />
        <Box mt={1}>
          {form.skills.map((skill, index) => (
            <Chip key={index} label={skill} onDelete={() => removeSkill(index)} sx={{ mr: 1, mb: 1 }} />
          ))}
        </Box>
      </Box>

      <Typography variant="h6" mt={3}>Education</Typography>
      {form.education.map((edu, index) => (
        <Box key={index} sx={{ border: '1px solid #ccc', p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField label="Degree" fullWidth required value={edu.degree} onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} /></Grid>
            <Grid item xs={6}><TextField label="Branch" fullWidth required value={edu.branch} onChange={(e) => handleEducationChange(index, 'branch', e.target.value)} /></Grid>
            <Grid item xs={6}><TextField label="College" fullWidth required value={edu.college} onChange={(e) => handleEducationChange(index, 'college', e.target.value)} /></Grid>
            <Grid item xs={3}><TextField label="Start Year" fullWidth required value={edu.startYear} onChange={(e) => handleEducationChange(index, 'startYear', e.target.value)} /></Grid>
            <Grid item xs={3}><TextField label="End Year" fullWidth required value={edu.endYear} onChange={(e) => handleEducationChange(index, 'endYear', e.target.value)} /></Grid>
          </Grid>
          <Button variant="outlined" color="error" onClick={() => removeEducation(index)} sx={{ mt: 1 }}>Remove</Button>
        </Box>
      ))}
      <Button variant="contained" onClick={addEducation}>Add Education</Button>

      <Typography variant="h6" mt={3}>Experience (Optional)</Typography>
      {form.experience.map((exp, index) => (
        <Box key={index} sx={{ border: '1px solid #ccc', p: 2, mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}><TextField label="Company" fullWidth required value={exp.company} onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} /></Grid>
            <Grid item xs={6}><TextField label="Title" fullWidth required value={exp.title} onChange={(e) => handleExperienceChange(index, 'title', e.target.value)} /></Grid>
            <Grid item xs={6}><TextField label="Start Date" fullWidth required value={exp.startDate} onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)} /></Grid>
            <Grid item xs={6}><TextField label="End Date" fullWidth required value={exp.endDate} onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)} /></Grid>
            <Grid item xs={12}><TextField label="Description" fullWidth required multiline value={exp.description} onChange={(e) => handleExperienceChange(index, 'description', e.target.value)} /></Grid>
          </Grid>
          <Button variant="outlined" color="error" onClick={() => removeExperience(index)} sx={{ mt: 1 }}>Remove</Button>
        </Box>
      ))}
      <Button variant="contained" onClick={addExperience}>Add Experience</Button>

      <Typography variant="h6" mt={3}>Additional Links (Optional)</Typography>
      {form.additionalLinks.map((link, index) => (
        <Box key={index} display="flex" alignItems="center" mt={1}>
          <TextField fullWidth label={`Link ${index + 1}`} value={link} onChange={(e) => handleLinkChange(index, e.target.value)} />
          <IconButton color="error" onClick={() => removeLink(index)}><DeleteIcon /></IconButton>
        </Box>
      ))}
      <Button variant="contained" onClick={addLink} sx={{ mt: 1 }}>Add Link</Button>

      <Typography variant="h6" mt={3}>Social Links</Typography>
      <TextField label="LinkedIn URL" fullWidth value={form.linkedInUrl} onChange={(e) => handleChange('linkedInUrl', e.target.value)} margin="normal" />
      <TextField label="GitHub URL" fullWidth value={form.githubUrl} onChange={(e) => handleChange('githubUrl', e.target.value)} margin="normal" />
      <TextField label="Portfolio URL" fullWidth value={form.portfolioUrl} onChange={(e) => handleChange('portfolioUrl', e.target.value)} margin="normal" />

      <Typography variant="h6" mt={3}>Upload Resume</Typography>
      <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                setSelectedFile(file);
                }
            }}
     />

{form.resumeFile && (
  <Box mt={2}>
    <Typography variant="subtitle1">Uploaded Resume:</Typography>
    <Button
      variant="outlined"
      onClick={handleDownloadResume}
    >
      {form.resumeFile}
    </Button>
  </Box>
)}



      <Button type="button" variant="contained" color="primary" onClick={handleSubmit} sx={{ mt: 3 }}>Submit Profile</Button>
    </Box>
  );
};

export default UserProfileForm;
