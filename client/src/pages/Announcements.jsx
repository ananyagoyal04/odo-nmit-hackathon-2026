import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Pin,
  Tag,
  Search,
  Trash2,
  Calendar,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import announcementsApi from '../services/announcementsApi';
import Modal from '../components/Modal';
import Tilt3DCard from '../components/Tilt3DCard';

export default function Announcements() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General',
    pinned: false,
    tags: ''
  });

  const isAdminOrHR = ['SUPER_ADMIN', 'HR'].includes(user?.role);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementsApi.getAnnouncements({
        category: selectedCategory,
        search
      });
      if (res.success) {
        setAnnouncements(res.announcements);
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to load announcements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [selectedCategory, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreateBusy(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean) : []
      };
      const res = await announcementsApi.createAnnouncement(payload);
      if (res.success) {
        success('Announcement published to company board!');
        setIsCreateOpen(false);
        setFormData({ title: '', content: '', category: 'General', pinned: false, tags: '' });
        fetchAnnouncements();
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to publish announcement');
    } finally {
      setCreateBusy(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      const res = await announcementsApi.deleteAnnouncement(id);
      if (res.success) {
        success('Announcement removed.');
        fetchAnnouncements();
      }
    } catch (err) {
      error(err?.data?.message || err.message || 'Failed to delete announcement');
    }
  };

  const categories = ['all', 'General', 'Townhall', 'Product', 'Policy', 'Celebration', 'Tech'];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Company Notice Board</h1>
          <p className="page-subtitle">
            Stay updated with townhalls, technical releases, culture celebrations, and company policies.
          </p>
        </div>

        {isAdminOrHR && (
          <button className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
            <Plus size={16} /> Publish Announcement
          </button>
        )}
      </div>

      {/* Category Pills Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}
            onClick={() => setSelectedCategory(cat)}
          >
            {cat === 'all' ? 'All Updates' : cat}
          </button>
        ))}

        <div style={{ marginLeft: 'auto', minWidth: '220px' }}>
          <input
            type="text"
            placeholder="Search announcements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem' }}
          />
        </div>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <Bell size={36} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
          <h3>No Announcements Found</h3>
          <p style={{ marginTop: '0.25rem' }}>Check back soon for new updates from leadership.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {announcements.map((item) => (
            <Tilt3DCard
              key={item._id}
              style={{
                borderColor: item.pinned ? 'var(--border-rose)' : 'var(--border-color)',
                background: item.pinned
                  ? 'linear-gradient(135deg, rgba(133, 46, 78, 0.25), var(--bg-card))'
                  : 'var(--bg-card)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', transform: 'translateZ(12px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  {item.pinned && (
                    <span className="badge badge-rose" style={{ gap: '0.25rem' }}>
                      <Pin size={11} /> PINNED
                    </span>
                  )}
                  <span className="badge badge-copper">{item.category}</span>
                  <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>
                    {item.title}
                  </h2>
                </div>

                {isAdminOrHR && (
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--danger)', padding: '0.3rem 0.6rem' }}
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem', transform: 'translateZ(8px)' }}>
                {item.content}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', transform: 'translateZ(10px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div
                    className="avatar"
                    style={{
                      backgroundImage: item.authorId?.avatarUrl ? `url(${item.authorId.avatarUrl})` : 'none',
                      backgroundColor: item.authorId?.avatarColor || 'var(--rose)',
                      width: 28,
                      height: 28,
                      fontSize: '0.75rem'
                    }}
                  >
                    {!item.authorId?.avatarUrl && item.authorId?.firstName?.[0]}
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--peach)' }}>
                    {item.authorId?.fullName || 'Administrator'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                    · {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {item.tags.map((t, idx) => (
                      <span key={idx} style={{ fontSize: '0.7rem', color: 'var(--text-dim)', backgroundColor: 'var(--bg-surface)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-pill)' }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Tilt3DCard>
          ))}
        </div>
      )}

      {/* Publish Announcement Modal */}
      {isCreateOpen && (
        <Modal
          title="Publish New Announcement"
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
        >
          <form onSubmit={handleCreate}>
            <div className="field">
              <label>Title *</label>
              <input
                type="text"
                placeholder="e.g. Q3 Townhall Meeting & Retrospective"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="field">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="General">General</option>
                  <option value="Townhall">Townhall</option>
                  <option value="Product">Product</option>
                  <option value="Policy">Policy</option>
                  <option value="Celebration">Celebration</option>
                  <option value="Tech">Tech</option>
                </select>
              </div>

              <div className="field">
                <label>Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="Roadmap, Product, AllHands"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>

            <div className="field">
              <label>Content *</label>
              <textarea
                rows={5}
                placeholder="Write the announcement message details..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <input
                type="checkbox"
                id="pinned-check"
                checked={formData.pinned}
                onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                style={{ width: 'auto', accentColor: 'var(--rose)' }}
              />
              <label htmlFor="pinned-check" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', cursor: 'pointer', margin: 0 }}>
                Pin this announcement to top of the board
              </label>
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0 0' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={createBusy}>
                {createBusy ? <span className="spinner" /> : 'Publish to Board'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
