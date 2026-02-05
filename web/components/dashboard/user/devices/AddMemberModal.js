import React, { useState } from 'react';
import styles from './DevicesAndUsers.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { familyService } from '../../../../services/familyService';

export default function AddMemberModal({ isOpen, onClose, onSubmit, familyId }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    countryCode: '+1',
    role: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    // Require familyId for API call
    if (!familyId) {
      setError('No family selected. Please create or select a family first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Call the API to add family member
      const apiResponse = await familyService.addFamilyMember({
        familyId,
        userId: null, // New user will be created
        relationship: formData.role,
      });
      
      // Check API response for success
      if (!apiResponse || apiResponse.error) {
        throw new Error(apiResponse?.message || 'Failed to add family member');
      }
      
      // Only call parent callback if API was successful
      onSubmit({
        ...formData,
        id: apiResponse?.memberId || `user_${Date.now()}`,
        phone: `${formData.countryCode}${formData.phone}`,
        status: 'offline',
      }, apiResponse);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        countryCode: '+1',
        role: '',
      });
      onClose();
    } catch (err) {
      console.error('Failed to add family member:', err);
      setError(err.message || 'Failed to add family member. Please try again.');
      // Don't call onSubmit - UI should not update on failure
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add New Family Member</h2>
          <button className={styles.modalCloseBtn} onClick={onClose}>
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Name</label>
            <input
              type="text"
              name="name"
              className={styles.formInput}
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Email</label>
            <input
              type="email"
              name="email"
              className={styles.formInput}
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          {/* Phone Number */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Phone Number</label>
            <div className={styles.phoneInputGroup}>
              <select
                name="countryCode"
                className={styles.countryCodeSelect}
                value={formData.countryCode}
                onChange={handleChange}
              >
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+234">🇳🇬 +234</option>
                <option value="+91">🇮🇳 +91</option>
                <option value="+49">🇩🇪 +49</option>
              </select>
              <input
                type="tel"
                name="phone"
                className={styles.phoneInput}
                placeholder="(555) 000-0000"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Role */}
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Role</label>
            <select
              name="role"
              className={styles.formSelect}
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select a role...</option>
              <option value="Parent">Parent</option>
              <option value="Child">Child</option>
            </select>
          </div>

          {/* Actions */}
          <div className={styles.modalActions}>
            {error && (
              <p className={styles.errorText} style={{ color: '#EF4444', fontSize: '14px', marginBottom: '12px', width: '100%' }}>
                {error}
              </p>
            )}
            <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={isLoading}>
              Cancel
            </button>
            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
