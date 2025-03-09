import { Link } from 'react-router-dom';

const PageHeader = ({ title, subtitle, backLink, backText }) => {
  return (
    <div className="border-b border-gray-200 p-4">
      {backLink && (
        <div className="flex items-center mb-2">
          <Link to={backLink} className="text-blue-500 hover:text-blue-700 mr-2">
            &larr; {backText || 'Back'}
          </Link>
        </div>
      )}
      {title && <h1 className="text-xl font-semibold text-gray-800">{title}</h1>}
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
};

export default PageHeader; 