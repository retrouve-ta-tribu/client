import { Link } from 'react-router-dom';

const NotFound = ({ type = 'Item', backLink = '/' }) => {
  return (
    <div className="text-center py-10">
      <h2 className="text-xl font-semibold text-gray-800">{type} not found</h2>
      <Link to={backLink} className="text-blue-500 hover:text-blue-700 mt-4 inline-block">
        &larr; Go back
      </Link>
    </div>
  );
};

export default NotFound; 