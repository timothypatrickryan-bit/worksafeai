import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import SidebarMinimal from '../../../components/Sidebar.minimal'

export default function ProjectEdit() {
  const router = useRouter()
  const { id } = router.query
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    progress: 0,
  })

  useEffect(() => {
    if (!id) return

    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/mission-control/projects?id=${id}`)
        if (!response.ok) throw new Error('Failed to fetch project')
        const data = await response.json()
        
        const proj = data.projects?.find(p => p.id === parseInt(id))
        if (!proj) throw new Error('Project not found')
        
        setProject(proj)
        setFormData({
          name: proj.name,
          description: proj.description,
          status: proj.status,
          progress: proj.progress,
        })
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'progress' ? parseInt(value) : value,
    }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // In a real app, this would save to a database
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 500))
      alert('Project updated successfully!')
      router.push(`/projects/${id}`)
    } catch (err) {
      setError('Failed to save project')
    } finally {
      setSaving(false)
    }
  }

  const [currentSection, setCurrentSection] = useState('unified-dashboard')

  if (loading) return <div className="p-8">Loading...</div>
  if (error && !project) return <div className="p-8 text-red-600">Error: {error}</div>
  if (!project) return <div className="p-8">Project not found</div>

  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarMinimal currentSection={currentSection} setCurrentSection={setCurrentSection} />
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="p-12">
          <div className="max-w-2xl mx-auto bg-white rounded border border-gray-200 p-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Edit Project: {project.name}</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option>Active</option>
              <option>In Progress</option>
              <option>Paused</option>
              <option>Completed</option>
              <option>Archived</option>
            </select>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Progress: {formData.progress}%</label>
            <input
              type="range"
              name="progress"
              min="0"
              max="100"
              value={formData.progress}
              onChange={handleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded hover:bg-blue-600 disabled:bg-gray-400 transition"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.push(`/projects/${id}`)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  )
}
