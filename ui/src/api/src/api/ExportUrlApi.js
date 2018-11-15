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
import ExportUrlRequest from "../model/ExportUrlRequest";
import ExportUrlResponse from "../model/ExportUrlResponse";

/**
 * ExportUrl service.
 * @module api/ExportUrlApi
 * @version 0.0.1
 */
export default class ExportUrlApi {
  /**
   * Constructs a new ExportUrlApi.
   * @alias module:api/ExportUrlApi
   * @class
   * @param {module:ApiClient} [apiClient] Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  constructor(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;
  }

  /**
   * Callback function to receive the result of the exportUrlPost operation.
   * @callback module:api/ExportUrlApi~exportUrlPostCallback
   * @param {String} error Error message, if any.
   * @param {module:model/ExportUrlResponse} data The data returned by the service call.
   * @param {String} response The complete HTTP response.
   */

  /**
   * Creates and returns a signed URL to a GCS zip file of JSON files. The JSON files represent entities to be exported to a Terra workspace. https://bvdp-saturn-prod.appspot.com/#import-data may be called with the url parameter set to this url. For each JSON file, https://rawls.dsde-prod.broadinstitute.org/#!/entities/create_entity may be called with the JSON as the POST body.
   * @param {Object} opts Optional parameters
   * @param {module:model/ExportUrlRequest} opts.exportUrlRequest
   * @param {module:api/ExportUrlApi~exportUrlPostCallback} callback The callback function, accepting three arguments: error, data, response
   * data is of type: {@link module:model/ExportUrlResponse}
   */
  exportUrlPost(opts, callback) {
    opts = opts || {};
    let postBody = opts["exportUrlRequest"];

    let pathParams = {};
    let queryParams = {};
    let headerParams = {};
    let formParams = {};

    let authNames = [];
    let contentTypes = [];
    let accepts = [];
    let returnType = ExportUrlResponse;

    return this.apiClient.callApi(
      "/exportUrl",
      "POST",
      pathParams,
      queryParams,
      headerParams,
      formParams,
      postBody,
      authNames,
      contentTypes,
      accepts,
      returnType,
      callback
    );
  }
}
