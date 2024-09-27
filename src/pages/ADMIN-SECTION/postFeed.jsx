import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../../config/firebase_config'; // Ensure paths are correct
import './postFeed.css'; // Updated CSS file name for clarity

const AdminFeedPostInterface = () => {
  const [feeds, setFeeds] = useState([]);
  const [content, setContent] = useState(''); // For writeups
  const [media, setMedia] = useState(null); // Can be image or video

  // Helper function to check if the media is a video
  const isVideo = (url) => {
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']; // Common video file formats
    const urlExtension = url.split('.').pop().toLowerCase();
    return videoExtensions.includes(urlExtension);
  };

  // Fetch feeds function
  const fetchFeeds = async () => {
    try {
      const feedsRef = collection(db, 'feeds');
      const q = query(feedsRef, orderBy('createdAt', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      const feedsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeeds(feedsList);
    } catch (error) {
      console.error('Error fetching feeds:', error);
    }
  };

  useEffect(() => {
    fetchFeeds(); // Fetch feeds when component mounts
  }, []);

  const handleCreateFeed = async () => {
    try {
      let mediaUrl = '';
      if (media) {
        const mediaRef = ref(storage, `feeds/${media.name}`);
        await uploadBytes(mediaRef, media);
        mediaUrl = await getDownloadURL(mediaRef);
      }

      await addDoc(collection(db, 'feeds'), {
        content: content,
        mediaUrl: mediaUrl, // Can be either an image or video URL
        likes: [], // Initialize as empty arrays
        comments: [],
        shares: [],
        createdAt: new Date(),
      });

      setContent('');
      setMedia(null);
      fetchFeeds(); // Refresh the list
    } catch (error) {
      console.error('Error creating feed:', error);
    }
  };

  const handleDeleteFeed = async (id) => {
    try {
      await deleteDoc(doc(db, 'feeds', id));
      fetchFeeds(); // Refresh the list
    } catch (error) {
      console.error('Error deleting feed:', error);
    }
  };

  return (
    <div className="admin-feed-interface-page">
      <h1 className="admin-feed-interface-title">Create Feed Post</h1>
      <form className="admin-feed-interface-form" onSubmit={e => e.preventDefault()}>
        <label className="admin-feed-interface-label">
          Writeup:
          <textarea 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            required 
            className="admin-feed-interface-textarea"
          />
        </label>
        <label className="admin-feed-interface-label">
          Media (Image or Video):
          <input 
            type="file" 
            accept="image/*, video/*" 
            onChange={e => setMedia(e.target.files[0])} 
            className="admin-feed-interface-media-input"
          />
        </label>
        <button 
          type="button" 
          onClick={handleCreateFeed} 
          className="admin-feed-interface-submit-btn"
        >
          Create Feed
        </button>
      </form>
      <div className="admin-feed-interface-feeds-list">
        <h2 className="admin-feed-interface-feeds-title">Recent Feeds</h2>
        {feeds.map(feed => (
          <div key={feed.id} className="admin-feed-interface-feed-item">
            <p className="admin-feed-interface-feed-content">{feed.content}</p>
            {feed.mediaUrl && (
              <>
                {isVideo(feed.mediaUrl) ? (
                  <video controls src={feed.mediaUrl} className="admin-feed-interface-feed-video" />
                ) : (
                  <img src={feed.mediaUrl} alt="Feed Media" className="admin-feed-interface-feed-image" />
                )}
              </>
            )}
            <button 
              onClick={() => handleDeleteFeed(feed.id)} 
              className="admin-feed-interface-delete-btn"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminFeedPostInterface;
