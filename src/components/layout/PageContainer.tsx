import { FC, ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer: FC<PageContainerProps> = ({ children }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white shadow-sm min-h-screen">
      {children}
    </div>
  );
};

export default PageContainer; 