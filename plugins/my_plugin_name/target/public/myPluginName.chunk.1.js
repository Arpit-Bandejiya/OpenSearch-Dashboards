(window["myPluginName_bundle_jsonpfunction"] = window["myPluginName_bundle_jsonpfunction"] || []).push([[1],{

/***/ "./public/management_app/index.tsx":
/*!*****************************************!*\
  !*** ./public/management_app/index.tsx ***!
  \*****************************************/
/*! exports provided: mountManagementSection */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _mount_management_section__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./mount_management_section */ "./public/management_app/mount_management_section.tsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "mountManagementSection", function() { return _mount_management_section__WEBPACK_IMPORTED_MODULE_0__["mountManagementSection"]; });

/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */


/***/ }),

/***/ "./public/management_app/mount_management_section.tsx":
/*!************************************************************!*\
  !*** ./public/management_app/mount_management_section.tsx ***!
  \************************************************************/
/*! exports provided: mountManagementSection */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mountManagementSection", function() { return mountManagementSection; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-dom */ "react-dom");
/* harmony import */ var react_dom__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_dom__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_app__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../components/app */ "./public/components/app.tsx");
/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */



const mountManagementSection = async (_ref, _ref2, _ref3) => {
  let {
    notifications,
    http,
    savedObjects
  } = _ref;
  let {
    navigation,
    data
  } = _ref2;
  let {
    basePath,
    element
  } = _ref3;
  react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.render( /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_app__WEBPACK_IMPORTED_MODULE_2__["MyPluginNameApp"], {
    basename: basePath,
    notifications: notifications,
    http: http,
    navigation: navigation,
    savedObjects: savedObjects,
    data: data
  }), element);
  return () => {
    react_dom__WEBPACK_IMPORTED_MODULE_1___default.a.unmountComponentAtNode(element);
  };
};

/***/ })

}]);
//# sourceMappingURL=myPluginName.chunk.1.js.map