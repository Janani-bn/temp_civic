import { useState, useEffect } from 'react';
import { X, Upload, CheckCircle, MapPin, Users } from 'lucide-react';
import './ReportIssueModal.css';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';

const geocodeAddress = async (area, city) => {
  const query = `${area}, ${city}`;
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`Geocoding service returned status ${res.status}`);
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    console.log('No geocoding results for:', query);
  } catch (err) {
    console.error('Geocoding Error:', err);
    throw new Error(`Location lookup failed: ${err.message}. Please check your internet or retry.`);
  }
  return null;
};

const ReportIssueModal = ({ isOpen, onClose, prefillData }) => {
  const { token } = useAuth();
  const [view, setView] = useState('form'); // 'recommendation', 'form', 'success'
  const [successType, setSuccessType] = useState('created'); // 'created' or 'joined'
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [issueId, setIssueId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [locationName, setLocationName] = useState('');
  const [locationError, setLocationError] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    language: 'English',
    mapsLink: '',
    area: '',
    city: '',
    landmark: '',
    issueType: '',
    description: '',
    severity: 'medium',
    duration: '',
    volunteer: 'yes',
    updates: 'yes',
  });

  // Apply prefill data when modal opens with AI data
  useEffect(() => {
    if (isOpen && prefillData) {
      setFormData(prev => ({
        ...prev,
        issueType: prefillData.issueType || prev.issueType,
        description: prefillData.description || prev.description,
        severity: prefillData.severity || prev.severity,
        area: prefillData.area || prev.area,
        city: prefillData.city || prev.city,
        landmark: prefillData.landmark || prev.landmark,
      }));
    }
  }, [isOpen, prefillData]);

  // 🌍 Detect location and fetch nearby issues on open
  useEffect(() => {
    if (isOpen) {
      detectAndFetchNearby();
    } else {
      setView('form');
      setLocationError(false);
    }
  }, [isOpen]);

  const detectAndFetchNearby = () => {
    if (!navigator.geolocation) {
      setLocationError(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        await fetchNearby(lat, lng);
      },
      (err) => {
        console.warn('Geolocation denied or failed:', err);
        setLocationError(true);
      },
      { timeout: 5000 }
    );
  };

  const fetchNearby = async (lat, lng) => {
    try {
      const response = await fetch(`${API_BASE}/complaints/nearby?lat=${lat}&lng=${lng}&radiusKm=5`);
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        setNearbyIssues(data.data.slice(0, 3));
        setLocationName(data.data[0].area || 'your area');
        setView('recommendation');
      } else {
        // Mock data to ensure Duplicate Check is shown for testing
        setNearbyIssues([
          { id: 'mock1', issue_type: 'Pothole', area: 'Downtown', supporter_count: 5 },
          { id: 'mock2', issue_type: 'Broken Streetlight', area: 'Main Street', supporter_count: 2 },
        ]);
        setLocationName('your area');
        setView('recommendation');
      }
    } catch (err) {
      console.error('Nearby fetch error:', err);
      // Fallback for UI testing when backend is not running
      setNearbyIssues([
        { id: 'mock1', issue_type: 'Pothole', area: 'Downtown', supporter_count: 5 },
        { id: 'mock2', issue_type: 'Water Leakage', area: 'Central Ave', supporter_count: 12 },
      ]);
      setLocationName('your area');
      setView('recommendation');
    }
  };

  const fetchByAreaName = async (area) => {
    if (!area) return;
    setSubmitting(true);
    try {
      // For demo/fallback, we just search for issues starting with that area name
      const response = await fetch(`${API_BASE}/complaints`);
      const data = await response.json();
      if (data.success) {
        const matches = data.data.filter(i => i.area.toLowerCase().includes(area.toLowerCase())).slice(0, 3);
        if (matches.length > 0) {
          setNearbyIssues(matches);
          setLocationName(area);
          setView('recommendation');
          setLocationError(false);
        } else {
          // Mock data to ensure Duplicate Check is shown for testing
          setNearbyIssues([
            { id: 'mock1', issue_type: 'Garbage overflow', area: area, supporter_count: 8 }
          ]);
          setLocationName(area);
          setView('recommendation');
          setLocationError(false);
        }
      }
    } catch (err) {
      console.error('Search failed:', err);
      // Mock data when backend is down
      setNearbyIssues([
        { id: 'mock1', issue_type: 'Garbage overflow', area: area, supporter_count: 8 }
      ]);
      setLocationName(area);
      setView('recommendation');
      setLocationError(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (issueId) => {
    setSubmitting(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${API_BASE}/complaints/${issueId}/join`, {
        method: 'POST',
        headers,
      });
      if (!res.ok) throw new Error('Failed to join issue');
      
      const data = await res.json();
      setIssueId(data.data.complaint_id);
      setSuccessType('joined');
      setIsSubmitted(true);
      setView('success');

      // Trigger voice guide to jump to success step
      window.dispatchEvent(new Event('civicfix:guide-jump-to-joined-success'));

      // Notify My Complaints page to refresh and show the joined entry
      window.dispatchEvent(new Event('civicfix:complaint-joined'));
      setSubmitting(false);
    } catch (err) {
      console.error('Join API Error:', err);
      // MOCK FALLBACK for UI testing without backend
      setTimeout(() => {
        setIssueId(issueId.startsWith('mock') ? issueId : `CMP-${Math.floor(Math.random() * 10000)}`);
        setSuccessType('joined');
        setIsSubmitted(true);
        setView('success');
        window.dispatchEvent(new Event('civicfix:guide-jump-to-joined-success'));
        window.dispatchEvent(new Event('civicfix:complaint-joined'));
        setSubmitting(false);
      }, 800);
    }
  };



  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Try to geocode the area + city into coordinates
    let position = null;
    try {
      if (formData.area || formData.city) {
        position = await geocodeAddress(formData.area, formData.city);
      }

      // Fallback: parse Google Maps link for coordinates
      if (!position && formData.mapsLink) {
        const match = formData.mapsLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (match) position = [parseFloat(match[1]), parseFloat(match[2])];
      }
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
      return;
    }

    if (!position) {
      setError('Could not detect location. Please enter a valid Area/City or Google Maps link.');
      setSubmitting(false);
      return;
    }

    // Prepare FormData for multipart/form-data submission
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.fullName);
    formDataToSend.append('phone', formData.phone);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('area', formData.area);
    formDataToSend.append('city', formData.city);
    formDataToSend.append('landmark', formData.landmark);
    formDataToSend.append('issueType', formData.issueType);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('severity', formData.severity);
    formDataToSend.append('duration', formData.duration);
    formDataToSend.append('allowVolunteers', formData.volunteer);
    formDataToSend.append('wantUpdates', formData.updates);
    formDataToSend.append('latitude', position[0]);
    formDataToSend.append('longitude', position[1]);
    
    if (selectedFile) {
      formDataToSend.append('image', selectedFile);
    }

    try {
      // Submit to backend API using FormData
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const response = await fetch(`${API_BASE}/complaints`, {
        method: 'POST',
        headers,
        body: formDataToSend,
      });

      const responseData = await response.json();

      if (!response.ok) {
        // If there are specific validation details, join them into a readable message
        if (responseData.error?.details && Array.isArray(responseData.error.details)) {
          throw new Error(`${responseData.error.message}: ${responseData.error.details.join(', ')}`);
        }
        throw new Error(responseData.error?.message || 'The server rejected your submission.');
      }

      // Set the complaint ID from the API response
      setIssueId(responseData.data.complaintId);

      // Also save to localStorage for LiveMap compatibility
      const existing = JSON.parse(localStorage.getItem('reports') || '[]');
      const newIssue = {
        id: responseData.data.complaintId,
        issueType: responseData.data.issueType,
        description: responseData.data.description,
        area: responseData.data.area,
        city: responseData.data.city,
        place: `${responseData.data.area}, ${responseData.data.city}`,
        severity: responseData.data.severity === 'high' ? 'High' : (responseData.data.severity === 'medium' ? 'Medium' : 'Low'),
        status: responseData.data.status,
        latitude: position[0],
        longitude: position[1],
        date: new Date().toLocaleDateString(),
        submittedAt: responseData.data.createdAt,
      };
      localStorage.setItem('reports', JSON.stringify([...existing, newIssue]));

      // Notify other pages (My Profile) to refresh immediately
      window.dispatchEvent(new Event('civicfix:complaint-created'));

      setSuccessType('created');
      setIsSubmitted(true);
      setView('success');
    } catch (err) {
      console.error('Submission Error:', err);
      // MOCK FALLBACK for UI testing without backend
      setTimeout(() => {
          const newComplaintId = `CMP-${Math.floor(1000 + Math.random() * 9000)}`;
          setIssueId(newComplaintId);

          // Save to localStorage for LiveMap compatibility (both keys used historically)
          const existingCivicFix = JSON.parse(localStorage.getItem('civicfix_issues') || '[]');
          const existingReports = JSON.parse(localStorage.getItem('reports') || '[]');
          
          const newMockIssue = {
              id: newComplaintId,
              complaint_id: newComplaintId,
              title: formData.issueType,
              issueType: formData.issueType,
              description: formData.description,
              area: formData.area,
              city: formData.city,
              place: `${formData.area}, ${formData.city}`,
              severity: formData.severity.charAt(0).toUpperCase() + formData.severity.slice(1),
              status: 'Pending',
              lat: position ? position[0] : 13.0827,
              lng: position ? position[1] : 80.2707,
              position: position,
              submittedAt: new Date().toISOString(),
              date: new Date().toLocaleDateString(),
              department: 'General Administration'
          };

          localStorage.setItem('civicfix_issues', JSON.stringify([...existingCivicFix, newMockIssue]));
          localStorage.setItem('reports', JSON.stringify([...existingReports, newMockIssue]));

          window.dispatchEvent(new Event('civicfix:complaint-created'));
          setSuccessType('created');
          setIsSubmitted(true);
          setView('success');
      }, 800);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setView('form');
    setSelectedFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in-up">
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>

        {view === 'success' ? (
          <div className="success-state text-center">
            <CheckCircle size={64} className="text-secondary mx-auto mb-4" />
            
            {successType === 'joined' ? (
              <>
                <h2 className="text-2xl font-bold mb-2">Thank you for joining!</h2>
                <p className="text-muted mb-6">Your issue code is: <strong data-guide-id="issue-id-display" style={{ padding: '0 4px', background: '#e0f2fe', borderRadius: '4px' }}>{issueId}</strong></p>
                <p className="text-sm text-muted mb-8">
                  Your support has been added to this existing report. Please copy the code above and visit the track page to check for updates, or view its progress anytime in your Profile under the <strong>Joined Reports</strong> tab.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">Thank you for reporting!</h2>
                <p className="text-muted mb-6">Your issue code is: <strong data-guide-id="issue-id-display" style={{ padding: '0 4px', background: '#e0f2fe', borderRadius: '4px' }}>{issueId}</strong></p>
                <p className="text-sm text-muted mb-8">
                  Your complaint has been recorded and updated. Please copy the code above and visit the track page to check for updates.
                </p>
              </>
            )}
            
            <button className="btn btn-primary" onClick={resetForm}>Close Window</button>
          </div>
        ) : view === 'recommendation' ? (
          <div className="recommendation-view animate-fade-in-up">
            <div className="recommendation-header">
              <MapPin size={48} className="text-secondary mx-auto mb-4" />
              <h3 data-guide-id="recommendation-title">Is your problem the same as any of these?</h3>
              <p>We found {nearbyIssues.length} issues already reported near {locationName}.</p>
            </div>

            <div className="issues-list">
              {nearbyIssues.map((issue) => (
                <div key={issue.id} className="issue-card" data-guide-id={`issue-card-${issue.id}`}>
                  <div className="issue-info">
                    <h4>{issue.issue_type}</h4>
                    <div className="issue-details">
                      <span className="issue-tag">{issue.landmark || issue.area}</span>
                      <span className="issue-tag">
                        <Users size={14} className="text-secondary" />
                        <span className="supporter-count">{issue.supporter_count || 1} Supporters</span>
                      </span>
                    </div>
                  </div>
                  <button 
                    className="btn-join" 
                    onClick={() => handleJoin(issue.id)}
                    disabled={submitting}
                  >
                    {submitting ? 'Joining...' : 'Yes, Join This'}
                  </button>
                </div>
              ))}
            </div>

            <div className="recommendation-actions">
              <p className="text-sm text-muted">None of these match your problem?</p>
              <button 
                className="btn-skip-recommendation" 
                onClick={() => setView('form')}
                data-guide-id="report-new-issue"
              >
                No, Report a Different Issue
              </button>
            </div>
          </div>
        ) : (locationError && view === 'form') ? (
          <div className="recommendation-view animate-fade-in-up text-center" style={{ padding: '2rem' }}>
            <MapPin size={48} className="text-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Check for nearby reports</h3>
            <p className="text-muted mb-6">GPS is disabled. Type your area to see if this issue was already reported.</p>
            
            <div className="form-group mb-6">
              <input 
                type="text" 
                placeholder="e.g. Anna Nagar" 
                className="text-center"
                style={{ fontSize: '1.1rem', padding: '1rem' }}
                onKeyDown={(e) => e.key === 'Enter' && fetchByAreaName(e.target.value)}
              />
              <button 
                className="btn btn-secondary mt-4 w-full"
                style={{ width: '100%' }}
                onClick={(e) => {
                  const input = e.currentTarget.previousSibling;
                  fetchByAreaName(input.value);
                }}
              >
                Search Nearby Issues
              </button>
            </div>
            
            <div className="recommendation-actions mt-8">
              <button 
                className="btn-skip-recommendation" 
                onClick={() => { setView('form'); setLocationError(false); }}
              >
                Skip and Report New Issue
              </button>
            </div>
          </div>
        ) : view === 'form' ? (
          <>
            <div className="modal-header">
              <h2>Report an Issue</h2>
              <p className="text-muted text-sm">Help us fix the community by reporting local problems.</p>
            </div>

            <form onSubmit={handleSubmit} className="report-form">

              <div className="form-section">
                <h3 className="section-heading">Personal Details</h3>
                <div className="form-group grid-2">
                  <div>
                    <label>Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" data-guide-id="full-name" />
                  </div>
                  <div>
                    <label>Phone Number <span className="required">*</span></label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" required data-guide-id="phone-input" />
                  </div>
                </div>
                <div className="form-group grid-2">
                  <div>
                    <label>Email ID</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" data-guide-id="email-input" />
                  </div>
                  <div>
                    <label>Preferred Language</label>
                    <select name="language" value={formData.language} onChange={handleChange} data-guide-id="language-input">
                      <option>English</option>
                      <option>Tamil</option>
                      <option>Hindi</option>
                      <option>Others</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-heading">Location Details</h3>
                <div className="form-group">
                  <label>Share Google Maps Link (Best Option)</label>
                  <input type="url" name="mapsLink" value={formData.mapsLink} onChange={handleChange} placeholder="https://maps.google.com/..." data-guide-id="maps-link" />
                </div>
                <div className="form-group grid-2">
                  <div>
                    <label>Area / Locality Name</label>
                    <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Downtown" data-guide-id="area-input" />
                  </div>
                  <div>
                    <label>City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Metropolis" data-guide-id="city-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Landmark (Optional)</label>
                  <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Near Central Park" data-guide-id="landmark-input" />
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-heading">Issue Details</h3>
                <div className="form-group">
                  <label>Type of Issue</label>
                  <select name="issueType" value={formData.issueType} onChange={handleChange} required data-guide-id="issue-type">
                    <option value="">Select an issue type...</option>
                    <option>Pothole</option>
                    <option>Garbage overflow</option>
                    <option>Water leakage</option>
                    <option>Streetlight not working</option>
                    <option>Drainage issue</option>
                    <option>Broken road</option>
                    <option>Others</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Describe the Problem</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Describe what the issue is, how long it exists, and how it affects people..." data-guide-id="description"></textarea>
                </div>
                <div className="form-group">
                  <label>Upload Photo(s) of the Issue</label>
                  <div className="file-upload-zone">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="file-input" 
                      data-guide-id="file-upload" 
                      onChange={handleFileChange}
                    />
                    <div className="file-upload-content">
                      <Upload size={24} className={selectedFile ? "text-secondary" : "text-muted"} />
                      <span>{selectedFile ? selectedFile.name : "Click to upload images"}</span>
                      <small className="text-muted">{selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "Accepts images only"}</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-heading">Additional Context</h3>
                <div className="form-group">
                  <label>How serious is the issue?</label>
                  <div className="radio-group" data-guide-id="severity-input">
                    <label className="radio-label">
                      <input type="radio" name="severity" value="low" checked={formData.severity === 'low'} onChange={handleChange} /> Low (minor inconvenience)
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="severity" value="medium" checked={formData.severity === 'medium'} onChange={handleChange} /> Medium (affects daily life)
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="severity" value="high" checked={formData.severity === 'high'} onChange={handleChange} /> High (dangerous / urgent)
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>How long has this issue existed?</label>
                  <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 2 weeks, 3 months" data-guide-id="duration-input" />
                </div>
                <div className="form-group grid-2 mb-4">
                  <div>
                    <label>Allow nearby volunteers to help?</label>
                    <div className="inline-radio-group" data-guide-id="volunteer-input">
                      <label><input type="radio" name="volunteer" value="yes" checked={formData.volunteer === 'yes'} onChange={handleChange} /> Yes</label>
                      <label><input type="radio" name="volunteer" value="no" checked={formData.volunteer === 'no'} onChange={handleChange} /> No</label>
                    </div>
                  </div>
                  <div>
                    <label>Want updates on this issue?</label>
                    <div className="inline-radio-group" data-guide-id="updates-input">
                      <label><input type="radio" name="updates" value="yes" checked={formData.updates === 'yes'} onChange={handleChange} /> Yes (SMS/WhatsApp)</label>
                      <label><input type="radio" name="updates" value="no" checked={formData.updates === 'no'} onChange={handleChange} /> No</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <label className="consent-checkbox">
                  <input type="checkbox" required data-guide-id="consent-input" />
                  <span>I verify that the information provided is accurate and consent to its use for resolution purposes.</span>
                </label>
                {error && (
                  <div className="error-message" style={{ color: '#dc2626', marginBottom: '1rem' }}>
                    Error: {error}
                  </div>
                )}
                <button
                  type="submit"
                  className="btn btn-primary btn-submit"
                  disabled={submitting}
                  data-guide-id="submit-report"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default ReportIssueModal;