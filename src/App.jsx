import { useState, useEffect } from 'react'
import {
  Briefcase,
  Plus,
  Search,
  Calendar,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Clock,
  Star,
  FileText
} from 'lucide-react'

const STATUSES = ['wishlist', 'applied', 'interview', 'offer', 'rejected']

const COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
]

const getStatusLabel = (status) => {
  const labels = {
    wishlist: 'Wishlist',
    applied: 'Applied',
    interview: 'Interview',
    offer: 'Offer',
    rejected: 'Rejected'
  }
  return labels[status] || status
}

const getStatusCount = (applications, status) => {
  if (status === 'active') {
    return applications.filter(a => a.status === 'applied' || a.status === 'interview').length
  }
  return applications.filter(a => a.status === status).length
}

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2)

const getInitials = (name) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getColorFromString = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return COLORS[Math.abs(hash) % COLORS.length]
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// Toast Component
function Toast({ toast, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id)
    }, 3000)
    return () => clearTimeout(timer)
  }, [toast.id, onClose])

  return (
    <div className={`toast ${toast.type}`}>
      {toast.type === 'success' ? (
        <CheckCircle className="toast-icon" size={20} />
      ) : (
        <XCircle className="toast-icon" size={20} />
      )}
      <span className="toast-message">{toast.message}</span>
      <button onClick={() => onClose(toast.id)} style={{ background: 'none', border: 'none', color: '#a3a3a3', cursor: 'pointer' }}>
        <X size={16} />
      </button>
    </div>
  )
}

// Modal Component
function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Application Form Component
function ApplicationForm({ application, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    companyUrl: '',
    jobUrl: '',
    status: 'wishlist',
    salary: '',
    location: '',
    notes: '',
    dateApplied: new Date().toISOString().split('T')[0],
    interviewDate: ''
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (application) {
      setFormData({
        ...application,
        dateApplied: application.dateApplied || new Date().toISOString().split('T')[0]
      })
    }
  }, [application])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required'
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSave({
        ...formData,
        id: application?.id || generateId(),
        createdAt: application?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="form-group">
          <label>Job Title <span className="required">*</span></label>
          <input
            type="text"
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleChange}
            placeholder="e.g. Senior React Developer"
          />
          {errors.jobTitle && <span style={{ color: '#f87171', fontSize: '0.8rem' }}>{errors.jobTitle}</span>}
        </div>
        <div className="form-group">
          <label>Company Name <span className="required">*</span></label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="e.g. Google"
          />
          {errors.companyName && <span style={{ color: '#f87171', fontSize: '0.8rem' }}>{errors.companyName}</span>}
        </div>
        <div className="form-group">
          <label>Company URL</label>
          <input
            type="url"
            name="companyUrl"
            value={formData.companyUrl}
            onChange={handleChange}
            placeholder="https://company.com"
          />
        </div>
        <div className="form-group">
          <label>Job Listing URL</label>
          <input
            type="url"
            name="jobUrl"
            value={formData.jobUrl}
            onChange={handleChange}
            placeholder="https://jobs.company.com/..."
          />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            {STATUSES.map(status => (
              <option key={status} value={status}>{getStatusLabel(status)}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Salary Range</label>
          <input
            type="text"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="e.g. $120k - $150k"
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. San Francisco, CA (Remote)"
          />
        </div>
        <div className="form-group">
          <label>Date Applied</label>
          <input
            type="date"
            name="dateApplied"
            value={formData.dateApplied}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Interview Date</label>
          <input
            type="date"
            name="interviewDate"
            value={formData.interviewDate}
            onChange={handleChange}
          />
        </div>
        <div className="form-group full-width">
          <label>Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Add any notes about this application..."
          />
        </div>
      </div>
      <div className="modal-footer" style={{ padding: 0, border: 'none', marginTop: '24px' }}>
        <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary">Save Application</button>
      </div>
    </form>
  )
}

// Application Card Component
function ApplicationCard({ application, onEdit, onDelete, onStatusChange, index }) {
  return (
    <div 
      className="application-card" 
      style={{ animationDelay: `${index * 50}ms` }}
      onClick={() => onEdit(application)}
    >
      <div className="card-header">
        <div 
          className="company-avatar"
          style={{ backgroundColor: getColorFromString(application.companyName) }}
        >
          {getInitials(application.companyName)}
        </div>
        <div className="card-actions" onClick={e => e.stopPropagation()}>
          <button className="card-action-btn" onClick={() => onEdit(application)} title="Edit">
            <Edit2 size={16} />
          </button>
          <button className="card-action-btn delete" onClick={() => onDelete(application)} title="Delete">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <h3 className="job-title">{application.jobTitle}</h3>
      <p className="company-name">{application.companyName}</p>
      <div className="card-meta">
        <div className="date-info">
          <Calendar size={14} />
          <span>{formatDate(application.dateApplied)}</span>
        </div>
        <span 
          className={`status-badge ${application.status}`}
          onClick={(e) => {
            e.stopPropagation()
            const currentIndex = STATUSES.indexOf(application.status)
            const nextStatus = STATUSES[(currentIndex + 1) % STATUSES.length]
            onStatusChange(application.id, nextStatus)
          }}
          title="Click to change status"
        >
          {getStatusLabel(application.status)}
        </span>
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ onAddJob }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <FileText size={48} />
      </div>
      <h2>No applications yet</h2>
      <p>Start tracking your job applications to land your dream job!</p>
      <button className="btn-add" onClick={onAddJob}>
        <Plus size={20} />
        Add Your First Application
      </button>
    </div>
  )
}

// Main App Component
function App() {
  const [applications, setApplications] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [editingApplication, setEditingApplication] = useState(null)
  const [deletingApplication, setDeletingApplication] = useState(null)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [toasts, setToasts] = useState([])

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jobApplications')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setApplications(parsed)
        }
      }
    } catch (e) {
      console.error('Failed to load applications:', e)
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jobApplications', JSON.stringify(applications))
    } catch (e) {
      console.error('Failed to save applications:', e)
      showToast('Failed to save data', 'error')
    }
  }, [applications])

  const showToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  const handleSaveApplication = (application) => {
    if (editingApplication) {
      setApplications(prev => 
        prev.map(app => app.id === application.id ? application : app)
      )
      showToast('Application updated successfully!')
    } else {
      setApplications(prev => [...prev, application])
      showToast('Application added successfully!')
    }
    setIsModalOpen(false)
    setEditingApplication(null)
  }

  const handleDeleteApplication = () => {
    setApplications(prev => prev.filter(app => app.id !== deletingApplication.id))
    showToast('Application deleted', 'success')
    setIsDeleteModalOpen(false)
    setDeletingApplication(null)
  }

  const handleStatusChange = (id, newStatus) => {
    setApplications(prev =>
      prev.map(app => 
        app.id === id 
          ? { ...app, status: newStatus, updatedAt: new Date().toISOString() }
          : app
      )
    )
    showToast(`Status updated to ${getStatusLabel(newStatus)}`)
  }

  const openAddModal = () => {
    setEditingApplication(null)
    setIsModalOpen(true)
  }

  const openEditModal = (application) => {
    setEditingApplication(application)
    setIsModalOpen(true)
  }

  const openDeleteModal = (application) => {
    setDeletingApplication(application)
    setIsDeleteModalOpen(true)
  }

  // Filter and sort applications
  const filteredApplications = applications
    .filter(app => {
      const matchesFilter = activeFilter === 'all' || app.status === activeFilter
      const matchesSearch = 
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.companyName.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.dateApplied) - new Date(a.dateApplied)
      } else if (sortBy === 'company') {
        return a.companyName.localeCompare(b.companyName)
      } else if (sortBy === 'status') {
        return STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status)
      }
      return 0
    })

  const stats = {
    total: applications.length,
    active: getStatusCount(applications, 'active'),
    interview: getStatusCount(applications, 'interview'),
    offer: getStatusCount(applications, 'offer')
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">
              <Briefcase size={22} />
            </div>
            <h1>Job<span>Track</span></h1>
          </div>
          <button className="btn-add" onClick={openAddModal}>
            <Plus size={20} />
            Add Job
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Stats Dashboard */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FileText size={24} />
            </div>
            <div className="stat-info">
              <h3>Total Applications</h3>
              <div className="value">{stats.total}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon active">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <h3>Active</h3>
              <div className="value">{stats.active}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon interview">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <h3>Interviews</h3>
              <div className="value">{stats.interview}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon offer">
              <Star size={24} />
            </div>
            <div className="stat-info">
              <h3>Offers</h3>
              <div className="value">{stats.offer}</div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-bar">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All <span className="count">{applications.length}</span>
            </button>
            {STATUSES.map(status => (
              <button
                key={status}
                className={`filter-tab ${activeFilter === status ? 'active' : ''}`}
                onClick={() => setActiveFilter(status)}
              >
                {getStatusLabel(status)} <span className="count">{getStatusCount(applications, status)}</span>
              </button>
            ))}
          </div>
          <div className="filter-actions">
            <div className="search-input">
              <Search size={18} color="#a3a3a3" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date">Sort by Date</option>
              <option value="company">Sort by Company</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        {/* Applications Grid */}
        {filteredApplications.length > 0 ? (
          <div className="applications-grid">
            {filteredApplications.map((application, index) => (
              <ApplicationCard
                key={application.id}
                application={application}
                index={index}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <EmptyState onAddJob={openAddModal} />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Search size={48} />
            </div>
            <h2>No results found</h2>
            <p>Try adjusting your filters or search query</p>
            <button 
              className="btn-secondary" 
              onClick={() => { setActiveFilter('all'); setSearchQuery('') }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingApplication(null) }}
        title={editingApplication ? 'Edit Application' : 'Add New Application'}
      >
        <ApplicationForm
          application={editingApplication}
          onSave={handleSaveApplication}
          onCancel={() => { setIsModalOpen(false); setEditingApplication(null) }}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setDeletingApplication(null) }}
        title="Delete Application"
        footer={
          <>
            <button className="btn-secondary" onClick={() => { setIsDeleteModalOpen(false); setDeletingApplication(null) }}>
              Cancel
            </button>
            <button className="btn-danger" onClick={handleDeleteApplication}>
              Delete
            </button>
          </>
        }
      >
        <div className="confirm-dialog">
          <p>Are you sure you want to delete the application for <strong>{deletingApplication?.jobTitle}</strong> at <strong>{deletingApplication?.companyName}</strong>?</p>
          <p style={{ fontSize: '0.875rem', color: '#f87171' }}>This action cannot be undone.</p>
        </div>
      </Modal>

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </div>
  )
}

export default App