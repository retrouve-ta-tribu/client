import { FC, ReactNode } from 'react';

interface PageContainerProps {
  children: ReactNode;
}

const PageContainer: FC<PageContainerProps> = ({ children }) => {
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md h-screen flex flex-col overflow-hidden">
      {children}
    </div>
  );
};

export default PageContainer; 