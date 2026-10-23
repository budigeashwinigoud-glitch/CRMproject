import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../common/Modal';
import { useCRM } from '../../context/CRMContext';
import { PIPELINE_STAGES, LEAD_SOURCES, PRIORITIES, EMPLOYEES } from '../../services/mockData';

export const LeadFormModal = ({ isOpen, onClose, leadToEdit = null }) => {
  const { addLead, updateLead } = useCRM();

  const isEditing = Boolean(leadToEdit);

  const initialFormState = useMemo(() => ({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    leadSource: 'Website',
    leadCategory: 'Fintech Platform',
    priority: 'Medium',
    pipelineStage: 'New',
    assignedEmployee: 'Pavan Kumar',
    expectedValue: '',
    notes: '',
    nextFollowUpDate: '',
    website: '',
    location: ''
  }), []);

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (leadToEdit) {
      setFormData({
        fullName: leadToEdit.fullName || '',
        company: leadToEdit.company || '',
        email: leadToEdit.email || '',
        phone: leadToEdit.phone || '',
        leadSource: leadToEdit.leadSource || 'Website',
        leadCategory: leadToEdit.leadCategory || 'Fintech Platform',
        priority: leadToEdit.priority || 'Medium',
        pipelineStage: leadToEdit.pipelineStage || 'New',
        assignedEmployee: leadToEdit.assignedEmployee || 'Pavan Kumar',
        expectedValue: leadToEdit.expectedValue !== undefined ? leadToEdit.expectedValue : '',
        notes: leadToEdit.notes || '',
        nextFollowUpDate: leadToEdit.nextFollowUpDate || '',
        website: leadToEdit.website || '',
        location: leadToEdit.location || ''
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [leadToEdit, isOpen, initialFormState]);

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full contact name is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (formData.expectedValue && (isNaN(formData.expectedValue) || Number(formData.expectedValue) < 0)) {
      newErrors.expectedValue = 'Value must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateLead(leadToEdit.id, formData);
      } else {
        await addLead(formData);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Lead: ${leadToEdit?.company || ''}` : 'Add New CRM Lead'}
      size="lg"
      footer={
        <>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
            id="lead-form-submit-btn"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Lead' : 'Create Lead'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className={`form-input ${errors.fullName ? 'error' : ''}`}
              placeholder="e.g. Rodrigo Sanchez"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <div className="form-error-text">{errors.fullName}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="company">
              Company Name <span className="required">*</span>
            </label>
            <input
              id="company"
              name="company"
              type="text"
              className={`form-input ${errors.company ? 'error' : ''}`}
              placeholder="e.g. Nubank Brasil"
              value={formData.company}
              onChange={handleChange}
            />
            {errors.company && <div className="form-error-text">{errors.company}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address <span className="required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="rodrigo@company.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="form-error-text">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phone">
              Phone Number <span className="required">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="+55 11 98765-4321"
              value={formData.phone}
              onChange={handleChange}
            />
            {errors.phone && <div className="form-error-text">{errors.phone}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="pipelineStage">
              Pipeline Stage
            </label>
            <select
              id="pipelineStage"
              name="pipelineStage"
              className="form-select"
              value={formData.pipelineStage}
              onChange={handleChange}
            >
              {PIPELINE_STAGES.map(stage => (
                <option key={stage.id} value={stage.id}>
                  {stage.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="priority">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              className="form-select"
              value={formData.priority}
              onChange={handleChange}
            >
              {PRIORITIES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="expectedValue">
              Expected Value ($ USD)
            </label>
            <input
              id="expectedValue"
              name="expectedValue"
              type="number"
              min="0"
              step="1000"
              className={`form-input ${errors.expectedValue ? 'error' : ''}`}
              placeholder="50000"
              value={formData.expectedValue}
              onChange={handleChange}
            />
            {errors.expectedValue && <div className="form-error-text">{errors.expectedValue}</div>}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="leadSource">
              Lead Source
            </label>
            <select
              id="leadSource"
              name="leadSource"
              className="form-select"
              value={formData.leadSource}
              onChange={handleChange}
            >
              {LEAD_SOURCES.map(source => (
                <option key={source} value={source}>{source}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="leadCategory">
              Lead Category / Industry
            </label>
            <input
              id="leadCategory"
              name="leadCategory"
              type="text"
              className="form-input"
              placeholder="e.g. Enterprise Banking"
              value={formData.leadCategory}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="assignedEmployee">
              Assigned Employee
            </label>
            <select
              id="assignedEmployee"
              name="assignedEmployee"
              className="form-select"
              value={formData.assignedEmployee}
              onChange={handleChange}
            >
              {EMPLOYEES.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="nextFollowUpDate">
              Next Follow-up Date
            </label>
            <input
              id="nextFollowUpDate"
              name="nextFollowUpDate"
              type="date"
              className="form-input"
              value={formData.nextFollowUpDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="location">
              Location / City
            </label>
            <input
              id="location"
              name="location"
              type="text"
              className="form-input"
              placeholder="e.g. São Paulo, Brazil"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="website">
              Website URL
            </label>
            <input
              id="website"
              name="website"
              type="url"
              className="form-input"
              placeholder="https://example.com"
              value={formData.website}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label" htmlFor="notes">
            Discovery Notes & Requirements
          </label>
          <textarea
            id="notes"
            name="notes"
            rows="3"
            className="form-textarea"
            placeholder="Record customer use-case, API endpoints requested, key decision makers..."
            value={formData.notes}
            onChange={handleChange}
          />
        </div>
      </form>
    </Modal>
  );
};

export default LeadFormModal;
