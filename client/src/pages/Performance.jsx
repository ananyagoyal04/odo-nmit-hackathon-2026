import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Award,
  Calendar,
  Layers,
  Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import goalsApi from '../services/goalsApi';
import Modal from '../components/Modal';
import StatCard from '../components/StatCard';
import Tilt3DCard from '../components/Tilt3DCard';

export default function Performance() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuarter, setSelectedQuarter] = useState('Q3 2026');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quarter: 'Q3 2026',
    category: 'Engineering',
    dueDate: '2026-09-30'
  });

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await goalsApi.getGoals({ quarter: selectedQuarter });
      if (res.success) {
        setGoals(res.goals);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to load performance goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [selectedQuarter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateBusy(true);
    try {
      const res = await goalsApi.createGoal(formData);
      if (res.success) {
        success('Quarterly objective added!');
        setIsCreateOpen(false);
        setFormData({ title: '', description: '', quarter: 'Q3 2026', category: 'Engineering', dueDate: '2026-09-30' });
        fetchGoals();
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to add objective');
    } finally {
      setCreateBusy(false);
    }
  };

  const handleProgressChange = async (id, newProgress) => {
    try {
      const p = Number(newProgress);
      const status = p === 100 ? 'completed' : p >= 50 ? 'on_track' : 'behind';
      await goalsApi.updateProgress(id, p, status);
      setGoals((prev) =>
        prev.map((g) => (g._id === id ? { ...g, progress: p, status } : g))
      );
    } catch {
      // Handled silently
    }
  };

  const quarters = ['all', 'Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];
  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length) : 0;
  const completedCount = goals.filter((g) => g.status === 'completed' || g.progress === 100).length;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Performance & OKRs</h1>
          <p className="page-subtitle">
            Track key results, quarterly deliverables, and milestones across engineering, design, and growth.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          <Plus size={16} /> Add Key Objective
        </button>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
        <StatCard
          title="Average Goal Completion"
          value={`${avgProgress}%`}
          subtext={`Across ${goals.length} tracked OKRs`}
          icon={TrendingUp}
          variant="copper"
        />
        <StatCard
          title="Completed Deliverables"
          value={completedCount}
          subtext="100% milestone achieved"
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="Active Quarter Cycle"
          value={selectedQuarter === 'all' ? 'All Cycles' : selectedQuarter}
          subtext="Company OKR timeline"
          icon={Target}
          variant="rose"
        />
      </div>

      {/* Quarter Filter Pills */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {quarters.map((q) => (
          <button
            key={q}
            className={`btn btn-sm ${selectedQuarter === q ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedQuarter(q)}
          >
            {q === 'all' ? 'All Quarters' : q}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      ) : goals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Target size={36} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3>No Objectives Found for {selectedQuarter}</h3>
          <p style={{ marginTop: '0.25rem' }}>Create a key result or quarterly goal to track performance.</p>
        </div>
      ) : (
        <div className="grid-2">
          {goals.map((goal) => (
            <Tilt3DCard key={goal._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', transform: 'translateZ(12px)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span className="badge badge-copper">{goal.category}</span>
                    <span className={`badge ${goal.status === 'completed' ? 'badge-success' : goal.status === 'behind' ? 'badge-danger' : 'badge-warning'}`}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)' }}>{goal.title}</h3>
                </div>

                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: goal.progress === 100 ? 'var(--success)' : 'var(--peach)' }}>
                  {goal.progress}%
                </div>
              </div>

              {goal.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', transform: 'translateZ(8px)' }}>
                  {goal.description}
                </p>
              )}

              {/* Progress Slider */}
              <div style={{ marginBottom: '1.25rem', transform: 'translateZ(15px)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.35rem' }}>
                  <span>Update Progress Slider</span>
                  <span>{goal.progress}% Completed</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={goal.progress}
                  onChange={(e) => handleProgressChange(goal._id, e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-dim)', transform: 'translateZ(10px)' }}>
                <span>Quarter: <b>{goal.quarter}</b></span>
                <span>Due: {goal.dueDate ? new Date(goal.dueDate).toLocaleDateString() : 'End of Quarter'}</span>
              </div>
            </Tilt3DCard>
          ))}
        </div>
      )}

      {/* Add Objective Modal */}
      {isCreateOpen && (
        <Modal
          title="Add Key Objective / OKR"
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        >
          <form onSubmit={handleCreate}>
            <div className="field">
              <label>Objective Title *</label>
              <input
                type="text"
                placeholder="e.g. Launch React 3D Design Tokens 2.0"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="field">
                <label>Quarter</label>
                <select
                  value={formData.quarter}
                  onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                >
                  <option value="Q1 2026">Q1 2026</option>
                  <option value="Q2 2026">Q2 2026</option>
                  <option value="Q3 2026">Q3 2026</option>
                  <option value="Q4 2026">Q4 2026</option>
                </select>
              </div>

              <div className="field">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="Sales & Growth">Sales & Growth</option>
                  <option value="Leadership">Leadership</option>
                  <option value="Personal Development">Personal Development</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label>Target Target Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="field">
              <label>Description & Success Metrics</label>
              <textarea
                rows={3}
                placeholder="Define key results and tangible metrics for this objective..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={createBusy}>
                {createBusy ? <span className="spinner" /> : 'Create Objective'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
