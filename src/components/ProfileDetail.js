import React, { useState, useEffect } from 'react';
import './ProfileDetail.css';
import { useParams } from 'react-router-dom';
import { getProfile, addComment, getProfileImageUrl } from '../services/api';
import { Spinner, Alert, Button } from 'react-bootstrap';

const ProfileDetail = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(id);
        setProfile(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const comment = {
        author: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).displayName : 'Anonymous',
        content: newComment
      };
      await addComment(id, comment);
      const updatedProfile = await getProfile(id);
      setProfile(updatedProfile);
      setNewComment('');
      setError(null);
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );

  if (!profile && !error) return <div className="text-center p-5">Profile not found</div>;
  if (error) return <Alert variant="danger" className="m-3">{error}</Alert>;

  return (
    <div className="profile-detail-content">
      <div className="profile-header d-flex flex-column flex-md-row align-items-center mb-4">
        <img
          src={getProfileImageUrl(profile.id)}
          alt={profile.name}
          className="profile-detail-img mb-3 mb-md-0"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
          }}
        />
        <div className="profile-info ms-md-4">
          <h2 className="profile-name">{profile.name}</h2>
          <p className="degree"><i className="fas fa-graduation-cap me-2"></i>{profile.designation}</p>
          <p className="description">{profile.description}</p>
        </div>
      </div>

      <div className="comments-section">
        <h3 className="comments-title">Messages</h3>
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="comments-list">
          {profile.comments && profile.comments.length > 0 ? (
            profile.comments.map((comment, index) => (
              <div className="comment" key={index}>
                <p className="comment-author"><strong>{comment.author}</strong></p>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))
          ) : (
            <p className="no-comments">No messages yet. Be the first to leave a message!</p>
          )}
        </div>

        <form onSubmit={handleAddComment} className="comment-form mt-4">
          <div className="input-group">
            <input
              type="text"
              placeholder="Write a message..."
              className="form-control message-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={submitting}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!newComment.trim() || submitting}
              className="send-button"
            >
              {submitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileDetail;
