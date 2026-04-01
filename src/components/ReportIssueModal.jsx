import { useState } from 'react';
import { X, Upload, CheckCircle, MapPin } from 'lucide-react';
import './ReportIssueModal.css';

const geocodeAddress = async (area, city) => {
  const query = `${area}, ${city}`;
  const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
  const data = await res.json();
  if (data && data.length > 0) {
    return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  }
  return null;
};

const ReportIssueModal = ({ isOpen, onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [issueId, setIssueId] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Generate issue ID
    const id = '#' + Math.floor(10000 + Math.random() * 90000);
    setIssueId(id);

    // Try to geocode the area + city into coordinates
    let position = null;
    if (formData.area || formData.city) {
      position = await geocodeAddress(formData.area, formData.city);
    }

    // Fallback: parse Google Maps link for coordinates
    if (!position && formData.mapsLink) {
      const match = formData.mapsLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
      if (match) position = [parseFloat(match[1]), parseFloat(match[2])];
    }

    if (!position) {
      alert('Could not detect location. Please enter a valid Area/City or Google Maps link.');
      return;
    }

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('civicfix_issues') || '[]');
    const newIssue = {
      id,
      title: formData.issueType,
      description: formData.description,
      area: formData.area,
      city: formData.city,
      severity: formData.severity,
      status: 'Pending',
      position,
      submittedAt: new Date().toISOString(),
    };
    localStorage.setItem('civicfix_issues', JSON.stringify([...existing, newIssue]));

    setIsSubmitted(true);
  };

  const resetForm = () => {
    setIsSubmitted(false);
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
            <p className="text-muted mb-6">Your issue ID is: <strong>{issueId}</strong></p>
            <p className="text-sm text-muted mb-8">
              We have received your report and notified the relevant department. You will receive updates shortly.
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
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="John Doe" />
                  </div>
                  <div>
                    <label>Phone Number <span className="required">*</span></label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+1 234 567 8900" required />
                  </div>
                </div>
                <div className="form-group grid-2">
                  <div>
                    <label>Email ID</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" />
                  </div>
                  <div>
                    <label>Preferred Language</label>
                    <select name="language" value={formData.language} onChange={handleChange}>
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
                  <input type="url" name="mapsLink" value={formData.mapsLink} onChange={handleChange} placeholder="https://maps.google.com/..." />
                </div>
                <div className="form-group grid-2">
                  <div>
                    <label>Area / Locality Name</label>
                    <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Downtown" />
                  </div>
                  <div>
                    <label>City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="Metropolis" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Landmark (Optional)</label>
                  <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} placeholder="Near Central Park" />
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-heading">Issue Details</h3>
                <div className="form-group">
                  <label>Type of Issue</label>
                  <select name="issueType" value={formData.issueType} onChange={handleChange} required>
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
                  <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Describe what the issue is, how long it exists, and how it affects people..."></textarea>
                </div>
                <div className="form-group">
                  <label>Upload Photo(s) of the Issue</label>
                  <div className="file-upload-zone">
                    <input type="file" multiple accept="image/*" className="file-input" />
                    <div className="file-upload-content">
                      <Upload size={24} className="text-muted" />
                      <span>Click to upload images</span>
                      <small className="text-muted">Accepts images only</small>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-heading">Additional Context</h3>
                <div className="form-group">
                  <label>How serious is the issue?</label>
                  <div className="radio-group">
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
                  <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 2 weeks, 3 months" />
                </div>
                <div className="form-group grid-2 mb-4">
                  <div>
                    <label>Allow nearby volunteers to help?</label>
                    <div className="inline-radio-group">
                      <label><input type="radio" name="volunteer" value="yes" checked={formData.volunteer === 'yes'} onChange={handleChange} /> Yes</label>
                      <label><input type="radio" name="volunteer" value="no" checked={formData.volunteer === 'no'} onChange={handleChange} /> No</label>
                    </div>
                  </div>
                  <div>
                    <label>Want updates on this issue?</label>
                    <div className="inline-radio-group">
                      <label><input type="radio" name="updates" value="yes" checked={formData.updates === 'yes'} onChange={handleChange} /> Yes (SMS/WhatsApp)</label>
                      <label><input type="radio" name="updates" value="no" checked={formData.updates === 'no'} onChange={handleChange} /> No</label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <label className="consent-checkbox">
                  <input type="checkbox" required />
                  <span>I verify that the information provided is accurate and consent to its use for resolution purposes.</span>
                </label>
                <button type="submit" className="btn btn-primary btn-submit">Submit Report</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportIssueModal;