import React, { useState, useEffect } from 'react';
import './Message.css';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { getProfile, addComment, getProfileImageUrl } from '../services/api';

const Message = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile(id);
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addComment(id, {
        author: 'Anonymous',
        content: newMessage
      });
      const updatedProfile = await getProfile(id);
      setProfile(updatedProfile);
      setNewMessage('');
    } catch (error) {
      console.error('Error adding message:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="profile-container">
      <Link to="/" className="back-button">
        <i className="fas fa-arrow-left"></i> Back
      </Link>

      <div className="profile-image-container">
        <img src={getProfileImageUrl(profile.id)} alt={profile.name} />
      </div>

      <div className="messages-section">
        <h2 className="messages-title">{profile.name}</h2>
        <div className="messages-list">
          {profile.comments && profile.comments.map((comment, index) => (
            <div className="message-item" key={index}>
              <div className="message-content">
                <h3 className="profile-name">{comment.author}</h3>
                <p className="profile-message">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className='profile-message'>
          <div className="message-input-container">
            <input
              type="text"
              className="message-input"
              placeholder="Write your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button
              type="submit"
              className="send-button"
              disabled={!newMessage.trim()}
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Message;
