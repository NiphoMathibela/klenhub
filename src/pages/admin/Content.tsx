import React from 'react';
import { useLocation } from 'react-router-dom';

export const Content: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.split('/').pop();
  const title = path === 'pages' ? 'Pages' : 
                path === 'blog' ? 'Blog Posts' : 
                path === 'media' ? 'Media Library' :
                'Content Management';

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl font-semibold mb-6">{title}</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">This feature is coming soon...</p>
      </div>
    </div>
  );
};
