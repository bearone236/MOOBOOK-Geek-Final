import React from 'react';

interface NextProps {
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const NextArrow: React.FC<NextProps> = ({ onClick }) => {
  return <div onClick={onClick}></div>;
};
