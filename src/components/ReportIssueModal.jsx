import { useState, useEffect } from 'react';
import { X, Upload, CheckCircle, MapPin } from 'lucide-react';
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

const ReportIssueModal = ({ isOpen, onClose, initialData }) => {
  const { token } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [issueId, setIssueId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(prev => ({
        ...prev,
        issueType: initialData.issueType || prev.issueType,
        area: initialData.area || prev.area,
        city: initialData.city || prev.city,
        duration: initialData.duration || prev.duration,
        description: initialData.description || prev.description,
        severity: initialData.severity || prev.severity,
        email: initialData.email || prev.email,
        phone: initialData.phone || prev.phone
      }));
    }
  }, [initialData, isOpen]);

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

      setIsSubmitted(true);
    } catch (err) {
      console.error('Submission Error:', err);
      // Specifically handle the "Load failed" type error
      const msg = err.message === 'Load failed' || err.message === 'Failed to fetch'
        ? "Network Error: Could not reach the server (Port 3000). Please ensure backend is running."
        : err.message;
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
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

        {isSubmitted ? (
          <div className="success-state text-center">
            <CheckCircle size={64} className="text-secondary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Thank you for reporting!</h2>
            <p className="text-muted mb-6">Your issue code is: <strong data-guide-id="issue-id-display" style={{ padding: '0 4px', background: '#e0f2fe', borderRadius: '4px' }}>{issueId}</strong></p>
            <p className="text-sm text-muted mb-8">
              Your complaint has been recorded and updated. Please copy the code above and visit the track page to check for updates.
            </p>
            <button className="btn btn-primary" onClick={resetForm}>Close Window</button>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default ReportIssueModal;