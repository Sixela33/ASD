import React from 'react';

export default function NumberInputWithNoScroll({ type = 'number', onWheel, ...props }) {
  return (
    <input
      type={'number'}
      onWheel={event => event.currentTarget.blur()}
      {...props}
    />
  );
}