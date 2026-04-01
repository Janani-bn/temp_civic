import { useState } from 'react';
import { X, Upload, CheckCircle, MapPin } from 'lucide-react';
import './ReportIssueModal.css';

const ReportIssueModal = ({ isOpen, onClose }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
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
            <p className="text-muted mb-6">Your issue ID is: <strong>#12345</strong></p>
            <p className="text-sm text-muted mb-8">We have received your report and notified the relevant department. You will receive updates shortly.</p>
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
                    <input type="text" placeholder="John Doe" />
                  </div>
                  <div>
                    <label>Phone Number <span className="required">*</span></label>
                    <input type="tel" placeholder="+1 234 567 8900" required />
                  </div>
                </div>
                
                <div className="form-group grid-2">
                  <div>
                    <label>Email ID</label>
                    <input type="email" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label>Preferred Language</label>
                    <select>
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
                <div className="form-group mt-2">
                  <div className="location-toggle">
                    <button type="button" className="btn-location active"><MapPin size={16}/> Auto Detect</button>
                    <button type="button" className="btn-location">Manual Entry</button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Share Google Maps Link (Best Option)</label>
                  <input type="url" placeholder="https://maps.google.com/..." />
                </div>
                
                <div className="form-group grid-2">
                  <div>
                    <label>Area / Locality Name</label>
                    <input type="text" placeholder="Downtown" />
                  </div>
                  <div>
                    <label>City</label>
                    <input type="text" placeholder="Metropolis" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Landmark (Optional)</label>
                  <input type="text" placeholder="Near Central Park" />
                </div>
              </div>

              <div className="form-section">
                <h3 className="section-heading">Issue Details</h3>
                <div className="form-group">
                  <label>Type of Issue</label>
                  <select required>
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
                  <textarea rows="4" placeholder="Describe what the issue is, how long it exists, and how it affects people..."></textarea>
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
                      <input type="radio" name="severity" value="low" /> Low (minor inconvenience)
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="severity" value="medium" defaultChecked /> Medium (affects daily life)
                    </label>
                    <label className="radio-label">
                      <input type="radio" name="severity" value="high" /> High (dangerous / urgent)
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>How long has this issue existed?</label>
                  <input type="text" placeholder="e.g., 2 weeks, 3 months" />
                </div>

                <div className="form-group grid-2 mb-4">
                  <div>
                    <label>Allow nearby volunteers to help?</label>
                    <div className="inline-radio-group">
                      <label><input type="radio" name="volunteer" value="yes" defaultChecked /> Yes</label>
                      <label><input type="radio" name="volunteer" value="no" /> No</label>
                    </div>
                  </div>
                  <div>
                    <label>Want updates on this issue?</label>
                     <div className="inline-radio-group">
                      <label><input type="radio" name="updates" value="yes" defaultChecked /> Yes (SMS/WhatsApp)</label>
                      <label><input type="radio" name="updates" value="no" /> No</label>
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
