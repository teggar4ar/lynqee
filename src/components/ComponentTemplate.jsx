import React from 'react';
import PropTypes from 'prop-types';

/**
 * [ComponentName] - [Brief description of what this component does]
 * 
 * @param {Object} props - Component props
 * @param {string} props.exampleProp - Description of the prop
 */
const ComponentTemplate = ({ exampleProp }) => {
  return (
    <div className="mobile-padding">
      {/* Mobile-first JSX structure */}
      <h2 className="text-lg font-semibold mb-4 md:text-xl">
        {exampleProp}
      </h2>
    </div>
  );
};

ComponentTemplate.propTypes = {
  exampleProp: PropTypes.string.isRequired,
};

export default ComponentTemplate;
