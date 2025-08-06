import { useEffect, useState } from 'react';

/**
 * [hookName] - Custom hook for [description of hook purpose]
 * 
 * This hook encapsulates [business logic description] and provides
 * a clean interface for components to use this functionality.
 * 
 * @param {any} initialValue - Initial value for the hook
 * @returns {Object} Hook return object with state and methods
 */
const useHookTemplate = (initialValue = null) => {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Example effect
  useEffect(() => {
    // Side effect logic here
  }, []);

  // Example function
  const exampleFunction = async (param) => {
    setLoading(true);
    setError(null);
    
    try {
      // Business logic here
      // Call service layer functions
      // const result = await ServiceTemplate.exampleMethod(param);
      setData({ message: `Hook called with: ${param}` });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    exampleFunction,
  };
};

export default useHookTemplate;
