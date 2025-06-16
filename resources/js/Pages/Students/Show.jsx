import React from 'react';

export default function Show({ student }) {
  return (
    <div>
      <h1>Student Details</h1>
      <pre>{JSON.stringify(student, null, 2)}</pre>
    </div>
  );
} 