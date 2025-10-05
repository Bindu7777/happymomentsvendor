import React from "react";

function TestPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f0f0f0', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <h1>Test Page Works!</h1>
        <p>If you can see this, React is working.</p>
      </div>
    </div>
  );
}

export default TestPage;
