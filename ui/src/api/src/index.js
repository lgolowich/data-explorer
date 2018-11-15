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

import ApiClient from "./ApiClient";
import DatasetResponse from "./model/DatasetResponse";
import ExportUrlRequest from "./model/ExportUrlRequest";
import ExportUrlResponse from "./model/ExportUrlResponse";
import Facet from "./model/Facet";
import FacetValue from "./model/FacetValue";
import FacetsResponse from "./model/FacetsResponse";
import SearchResponse from "./model/SearchResponse";
import SearchResult from "./model/SearchResult";
import DatasetApi from "./api/DatasetApi";
import ExportUrlApi from "./api/ExportUrlApi";
import FacetsApi from "./api/FacetsApi";
import SearchApi from "./api/SearchApi";

/**
 * API_Service_that_reads_from_Elasticsearch_.<br>
 * The <code>index</code> module provides access to constructors for all the classes which comprise the public API.
 * <p>
 * An AMD (recommended!) or CommonJS application will generally do something equivalent to the following:
 * <pre>
 * var DataExplorerService = require('index'); // See note below*.
 * var xxxSvc = new DataExplorerService.XxxApi(); // Allocate the API class we're going to use.
 * var yyyModel = new DataExplorerService.Yyy(); // Construct a model instance.
 * yyyModel.someProperty = 'someValue';
 * ...
 * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
 * ...
 * </pre>
 * <em>*NOTE: For a top-level AMD script, use require(['index'], function(){...})
 * and put the application logic within the callback function.</em>
 * </p>
 * <p>
 * A non-AMD browser application (discouraged) might do something like this:
 * <pre>
 * var xxxSvc = new DataExplorerService.XxxApi(); // Allocate the API class we're going to use.
 * var yyy = new DataExplorerService.Yyy(); // Construct a model instance.
 * yyyModel.someProperty = 'someValue';
 * ...
 * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
 * ...
 * </pre>
 * </p>
 * @module index
 * @version 0.0.1
 */
export {
  /**
   * The ApiClient constructor.
   * @property {module:ApiClient}
   */
  ApiClient,
  /**
   * The DatasetResponse model constructor.
   * @property {module:model/DatasetResponse}
   */
  DatasetResponse,
  /**
   * The ExportUrlRequest model constructor.
   * @property {module:model/ExportUrlRequest}
   */
  ExportUrlRequest,
  /**
   * The ExportUrlResponse model constructor.
   * @property {module:model/ExportUrlResponse}
   */
  ExportUrlResponse,
  /**
   * The Facet model constructor.
   * @property {module:model/Facet}
   */
  Facet,
  /**
   * The FacetValue model constructor.
   * @property {module:model/FacetValue}
   */
  FacetValue,
  /**
   * The FacetsResponse model constructor.
   * @property {module:model/FacetsResponse}
   */
  FacetsResponse,
  /**
   * The SearchResponse model constructor.
   * @property {module:model/SearchResponse}
   */
  SearchResponse,
  /**
   * The SearchResult model constructor.
   * @property {module:model/SearchResult}
   */
  SearchResult,
  /**
   * The DatasetApi service constructor.
   * @property {module:api/DatasetApi}
   */
  DatasetApi,
  /**
   * The ExportUrlApi service constructor.
   * @property {module:api/ExportUrlApi}
   */
  ExportUrlApi,
  /**
   * The FacetsApi service constructor.
   * @property {module:api/FacetsApi}
   */
  FacetsApi,
  /**
   * The SearchApi service constructor.
   * @property {module:api/SearchApi}
   */
  SearchApi
};
