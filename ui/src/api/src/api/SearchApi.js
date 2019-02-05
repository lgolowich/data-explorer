/**
 * Data Explorer Service
 * API Service that reads from Elasticsearch.
 *
 * OpenAPI spec version: 0.0.1
 * 
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 *
 */


import ApiClient from "../ApiClient";
import SearchResponse from '../model/SearchResponse';

/**
* Search service.
* @module api/SearchApi
* @version 0.0.1
*/
export default class SearchApi {

    /**
    * Constructs a new SearchApi. 
    * @alias module:api/SearchApi
    * @class
    * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
    * default to {@link module:ApiClient#instance} if unspecified.
    */
    constructor(apiClient) {
        this.apiClient = apiClient || ApiClient.instance;
    }


    /**
     * Callback function to receive the result of the searchGet operation.
     * @callback module:api/SearchApi~searchGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/SearchResponse} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Free text search over dataset. If query is empty, this returns all dataset fields, to populate the search drop-down on initial page load. If query is set, this returns only dataset fields that match the query. 
     * @param {Object} opts Optional parameters
     * @param {String} opts.query What was typed into search box. Say user typed \&quot;foo\&quot;. query is \&quot;foo\&quot;; Elasticsearch will be searched for \&quot;foo*\&quot;. 
     * @param {module:api/SearchApi~searchGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/SearchResponse}
     */
    searchGet(opts, callback) {
      opts = opts || {};
      let postBody = null;


      let pathParams = {
      };
      let queryParams = {
        'query': opts['query']
      };
      let headerParams = {
      };
      let formParams = {
      };

      let authNames = [];
      let contentTypes = [];
      let accepts = [];
      let returnType = SearchResponse;

      return this.apiClient.callApi(
        '/search', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }


}
