/**
 * [ServiceName] - Service layer for [description of service purpose]
 * 
 * This service abstracts all API calls related to [domain].
 * Components should not call Supabase directly, but use these service functions.
 */

// Import the centralized Supabase client
// import { supabase } from './supabase';

class ServiceTemplate {
  /**
   * Example service method
   * @param {string} param - Description of parameter
   * @returns {Promise<Object>} Description of return value
   * @throws {Error} When operation fails
   */
  static async exampleMethod(param) {
    try {
      // Perform API operation here
      // const { data, error } = await supabase.from('table').select();
      
      // if (error) throw error;
      // return data;
      
      return { message: `Service method called with: ${param}` };
    } catch (error) {
      console.error('[ServiceTemplate] exampleMethod error:', error);
      throw new Error(`Failed to perform operation: ${error.message}`);
    }
  }
}

export default ServiceTemplate;
