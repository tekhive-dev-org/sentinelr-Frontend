import React, { useState } from "react";
import styles from "./DevicesAndUsers.module.css";
import CloseIcon from "@mui/icons-material/Close";
import { familyService } from "../../../../services/familyService";

export default function AddMemberModal({
  isOpen,
  onClose,
  onSubmit,
  familyId,
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+1",
    phone: "",
    countryCode: "+1",
    relationship: "",
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
      setError("No family selected. Please create or select a family first.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Create the child/user first
      const formattedPhone = `${formData.countryCode}${formData.phone}`;
      // console.log("Creating child user...", {
      //   userName: formData.name,
      //   email: formData.email,
      //   phone: formattedPhone,
      // });

      const createResponse = await familyService.createChild({
        userName: formData.name,
        email: formData.email,
        phone: formattedPhone,
      });

      if (!createResponse || !createResponse.user?.id) {
        throw new Error(createResponse?.message || "Failed to create user");
      }

      const userId = createResponse.user.id;
      // console.log("User created with ID:", userId);

      // Step 2: Add the created user to the family
      const addResponse = await familyService.addFamilyMember({
        familyId,
        userId,
        relationship: formData.relationship,
        // Role is handled by service or backend default for added members
      });

      // Check API response for success
      if (!addResponse || addResponse.error) {
        throw new Error(addResponse?.message || "Failed to add family member");
      }

      // Only call parent callback if API was successful
      const member = addResponse?.member || {};
      onSubmit(
        {
          ...formData,
          id: member.id || member.userId || userId,
          phone: formattedPhone,
          status: "offline",
        },
        addResponse,
      );

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        countryCode: "+1",
        relationship: "",
      });
      onClose();
    } catch (err) {
      // console.error("Failed to add family member:", err);
      setError(err.message || "Failed to add family member. Please try again.");
      // Don't call onSubmit - UI should not update on failure
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Add New Family Member</h2>
          <button className={styles.modalClose} onClick={onClose}>
            <CloseIcon style={{ fontSize: 20 }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
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
              <div style={{ display: "flex", gap: "8px" }}>
                <select
                  name="countryCode"
                  className={styles.formSelect}
                  style={{ width: "100px" }}
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
                  className={styles.formInput}
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Relationship */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Relationship</label>
              <select
                name="relationship"
                className={styles.formSelect}
                value={formData.relationship}
                onChange={handleChange}
                required
              >
                <option value="">Select a relationship...</option>
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
                <option value="Member">Member</option>
              </select>
            </div>

            {error && (
              <div
                style={{
                  padding: "12px",
                  marginBottom: "20px",
                  borderRadius: "8px",
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  fontSize: "14px",
                }}
              >
                {error}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.btnPrimary}
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
