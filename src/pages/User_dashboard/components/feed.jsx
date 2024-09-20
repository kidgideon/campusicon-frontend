import React from 'react';


const Feeds = ({ feeds }) => {
  return (
    <div className="feeds">
      <ul>
        {feeds.map(feed => (
          <li key={feed.id}>
            <div>{feed.username}</div>
            <div>{feed.content}</div>
            <div>{new Date(feed.date.seconds * 1000).toLocaleDateString()}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Feeds;
