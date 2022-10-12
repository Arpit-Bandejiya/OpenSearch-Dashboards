(window["myPluginName_bundle_jsonpfunction"] = window["myPluginName_bundle_jsonpfunction"] || []).push([[0],{

/***/ "./components/point_in_time_flyout/index.ts":
/*!**************************************************!*\
  !*** ./components/point_in_time_flyout/index.ts ***!
  \**************************************************/
/*! exports provided: PointInTimeFlyout */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _point_in_time_flyout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./point_in_time_flyout */ "./components/point_in_time_flyout/point_in_time_flyout.tsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PointInTimeFlyout", function() { return _point_in_time_flyout__WEBPACK_IMPORTED_MODULE_0__["PointInTimeFlyout"]; });



/***/ }),

/***/ "./components/point_in_time_flyout/point_in_time_flyout.tsx":
/*!******************************************************************!*\
  !*** ./components/point_in_time_flyout/point_in_time_flyout.tsx ***!
  \******************************************************************/
/*! exports provided: getIndexPatterns, getPits, findByTitle, createSavedObject, PointInTimeFlyout */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getIndexPatterns", function() { return getIndexPatterns; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPits", function() { return getPits; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "findByTitle", function() { return findByTitle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createSavedObject", function() { return createSavedObject; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PointInTimeFlyout", function() { return PointInTimeFlyout; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _osd_i18n_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @osd/i18n/react */ "@osd/i18n/react");
/* harmony import */ var _osd_i18n_react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_osd_i18n_react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _src_plugins_opensearch_dashboards_react_public__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../../src/plugins/opensearch_dashboards_react/public */ "plugin/opensearchDashboardsReact/public");
/* harmony import */ var _src_plugins_opensearch_dashboards_react_public__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_src_plugins_opensearch_dashboards_react_public__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _common__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../common */ "./common/index.ts");





;
;
async function getIndexPatterns(savedObjectsClient) {
  return savedObjectsClient.find({
    type: 'index-pattern',
    fields: ['title', 'type'],
    perPage: 10000
  }).then(response => response.savedObjects.map(pattern => {
    const id = pattern.id;
    const title = pattern.get('title');
    return {
      id,
      title,
      // the prepending of 0 at the default pattern takes care of prioritization
      // so the sorting will but the default index on top
      // or on bottom of a the table
      sort: `${title}`
    };
  }).sort((a, b) => {
    if (a.sort < b.sort) {
      return -1;
    } else if (a.sort > b.sort) {
      return 1;
    } else {
      return 0;
    }
  })) || [];
}
async function getPits(client, title) {
  if (title) {
    const savedObjects = await client.find({
      type: 'point-in-time',
      perPage: 1000,
      fields: ['id']
    });
    return savedObjects.savedObjects;
  }
}
async function findByTitle(client, title) {
  if (title) {
    const savedObjects = await client.find({
      type: 'point-in-time',
      perPage: 1000,
      fields: ['id']
    });
    return savedObjects.savedObjects.find(obj => obj.attributes.id.toLowerCase() === title.toLowerCase());
  }
}
async function createSavedObject(pointintime, client, reference) {
  const dupe = await findByTitle(client, pointintime.id);
  console.log(dupe);

  if (dupe) {
    throw new Error(`Duplicate Point in time: ${pointintime.id}`);
  } // if (dupe) {
  //     if (override) {
  //         await this.delete(dupe.id);
  //     } else {
  //         throw new DuplicateIndexPatternError(`Duplicate index pattern: ${indexPattern.title}`);
  //     }
  // }


  const body = pointintime;
  const references = [{ ...reference
  }];
  const savedObjectType = "point-in-time";
  const response = await client.create(savedObjectType, body, {
    id: pointintime.id,
    references
  });
  console.log(response);
  pointintime.id = response.id;
  return pointintime;
}
const PointInTimeFlyout = () => {
  const [isFlyoutVisible, setIsFlyoutVisible] = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(false);
  const [showErrors, setShowErrors] = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(false);
  const [keepAlive, setKeepAlive] = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])('24');
  const [checked, setChecked] = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(false);
  const [loading, setLoading] = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])(true);
  const [indexPatterns, setIndexPatterns] = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])([]);
  const [selectedIndexPattern, setSelectedIndexPattern] = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])("");
  const [pitName, setPitName] = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])("");
  const {
    setBreadcrumbs,
    savedObjects,
    uiSettings,
    chrome,
    docLinks,
    application,
    http,
    data
  } = Object(_src_plugins_opensearch_dashboards_react_public__WEBPACK_IMPORTED_MODULE_3__["useOpenSearchDashboards"])().services;

  const onChange = e => {
    setKeepAlive(e.target.value);
  };

  const onDropDownChange = e => {
    setSelectedIndexPattern(e.target.value);
  };

  console.log(Object(_src_plugins_opensearch_dashboards_react_public__WEBPACK_IMPORTED_MODULE_3__["useOpenSearchDashboards"])().services);
  console.log(savedObjects);
  Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(() => {
    (async function () {
      const gettedIndexPatterns = await getIndexPatterns(savedObjects.client);
      var names = gettedIndexPatterns.map(function (item) {
        return item['title'];
      });
      setIndexPatterns(gettedIndexPatterns);
      setSelectedIndexPattern(gettedIndexPatterns[0].id);
      console.log(gettedIndexPatterns);
      setLoading(false);
    })();
  }, [savedObjects.client]);

  const createPointInTime = async () => {
    console.log('keep alive :' + keepAlive);
    console.log("name : " + pitName);
    console.log("index pattern : " + selectedIndexPattern);
    const pattern = indexPatterns.find(r => r.id); //setIsFlyoutVisible(false);

    const index = pattern.title;
    const response = await http.post(`${_common__WEBPACK_IMPORTED_MODULE_4__["CREATE_POINT_IN_TIME_PATH"]}/${index}`);
    const pit = {
      name: pitName,
      keepAlive: keepAlive,
      id: response.pit_id // Todo create pit and fill the pit id

    };
    const reference = {
      id: pattern.id,
      type: 'index-pattern',
      name: pattern.title
    };
    createSavedObject(pit, savedObjects.client, reference, http);
  }; // useEffect(() => {
  //     const gettedIndexPatterns: PointInTimeFlyoutItem[] = getIndexPatterns(
  //                     savedObjects.client
  //                 );
  //                 console.log(gettedIndexPatterns);
  // });


  const renderBody = _ref => {
    let {
      data,
      isLoading,
      hasPrivilegeToRead
    } = _ref;
    console.log(savedObjects);

    if (isLoading) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFlexGroup"], {
        justifyContent: "spaceAround"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFlexItem"], {
        grow: false
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiLoadingSpinner"], {
        size: "xl"
      })));
    }

    if (!hasPrivilegeToRead) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiCallOut"], {
        title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_osd_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
          id: "telemetry.callout.errorUnprivilegedUserTitle",
          defaultMessage: "Error displaying cluster statistics"
        }),
        color: "danger",
        iconType: "cross"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_osd_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
        id: "telemetry.callout.errorUnprivilegedUserDescription",
        defaultMessage: "You do not have access to see unencrypted cluster statistics."
      }));
    }

    if (data === null) {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiCallOut"], {
        title: /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_osd_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
          id: "telemetry.callout.errorLoadingClusterStatisticsTitle",
          defaultMessage: "Error loading cluster statistics"
        }),
        color: "danger",
        iconType: "cross"
      }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_osd_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
        id: "telemetry.callout.errorLoadingClusterStatisticsDescription",
        defaultMessage: "An unexpected error occured while attempting to fetch the cluster statistics. This can occur because OpenSearch failed, OpenSearch Dashboards failed, or there is a network error. Check OpenSearch Dashboards, then reload the page and try again."
      }));
    }

    const onButtonClick = () => {
      setShowErrors(!showErrors);
    }; // const button = (
    //     <EuiButton fill color="danger" onClick={onButtonClick}>
    //         Toggle errors
    //     </EuiButton>
    // );


    const onTextChange = e => {
      setPitName(e.target.value);
    };

    const onCheckboxChange = e => {
      setChecked(e.target.checked);
    };

    const onDropDownChange = e => {
      setSelectedIndexPattern(e.target.value);
    };

    let errors;
    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0__["Fragment"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiForm"], {
      isInvalid: showErrors,
      error: errors,
      component: "form"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFormRow"], {
      isInvalid: showErrors,
      fullWidth: true
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiText"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("p", null, "Create point in time search based on existing index pattern"))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFormRow"], {
      label: "Data source",
      isInvalid: showErrors,
      fullWidth: true
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiSelect"], {
      fullWidth: true,
      options: indexPatterns.map(option => {
        return {
          text: option.title,
          value: option.id
        };
      }),
      isInvalid: showErrors,
      isLoading: loading,
      value: selectedIndexPattern,
      onChange: onDropDownChange
    })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFormRow"], {
      label: "Custom Point in time name",
      isInvalid: showErrors,
      fullWidth: true
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFieldText"], {
      fullWidth: true,
      name: "name",
      isInvalid: showErrors,
      onChange: onTextChange
    })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFormRow"], {
      label: "Expiration in",
      isInvalid: showErrors,
      fullWidth: true
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiRange"] // min={100}
    , {
      max: 24,
      step: 0.05,
      fullWidth: true,
      value: keepAlive,
      onChange: onChange,
      showLabels: true,
      showValue: true,
      "aria-label": "An example of EuiRange with showLabels prop"
    })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFormRow"], {
      isInvalid: showErrors,
      fullWidth: true
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiCheckbox"], {
      id: "checkbox",
      label: "The PIT will be automatically deleted at the expiry time",
      checked: checked,
      onChange: e => onCheckboxChange(e)
    })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiSpacer"], null))); //return <EuiCodeBlock language="js">{JSON.stringify(data, null, 2)}</EuiCodeBlock>;
  };

  let flyout;

  if (isFlyoutVisible) {
    flyout = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFlyout"], {
      ownFocus: true,
      onClose: () => setIsFlyoutVisible(false),
      size: "m",
      paddingSize: "m"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFlyoutHeader"], {
      hasBorder: true
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiTitle"], {
      size: "m"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("h2", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_osd_i18n_react__WEBPACK_IMPORTED_MODULE_2__["FormattedMessage"], {
      id: "savedObjectsManagement.objectsTable.flyout.importSavedObjectTitle",
      defaultMessage: "Create point in time"
    })))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFlyoutBody"], null, renderBody({
      data: "",
      isLoading: false,
      hasPrivilegeToRead: true
    })), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFlyoutFooter"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFlexGroup"], {
      justifyContent: "spaceBetween"
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFlexItem"], {
      grow: false
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiButtonEmpty"], {
      iconType: "cross",
      onClick: () => setIsFlyoutVisible(false),
      flush: "left"
    }, "Close")), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiFlexItem"], {
      grow: false
    }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiButton"], {
      onClick: createPointInTime,
      fill: true
    }, "Save")))));
  }

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("div", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_1__["EuiButton"], {
    onClick: () => setIsFlyoutVisible(true),
    iconType: "plusInCircle",
    fill: true
  }, "Create point in time"), flyout);
};

function useGeneratedHtmlId(arg0) {
  throw new Error('Function not implemented.');
}

/***/ }),

/***/ "./components/point_in_time_table/index.ts":
/*!*************************************************!*\
  !*** ./components/point_in_time_table/index.ts ***!
  \*************************************************/
/*! exports provided: PointInTimeTableWithRouter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _point_in_time_table__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./point_in_time_table */ "./components/point_in_time_table/point_in_time_table.tsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "PointInTimeTableWithRouter", function() { return _point_in_time_table__WEBPACK_IMPORTED_MODULE_0__["PointInTimeTableWithRouter"]; });



/***/ }),

/***/ "./components/point_in_time_table/point_in_time_table.tsx":
/*!****************************************************************!*\
  !*** ./components/point_in_time_table/point_in_time_table.tsx ***!
  \****************************************************************/
/*! exports provided: getPits, PointInTimeTable, PointInTimeTableWithRouter */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getPits", function() { return getPits; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PointInTimeTable", function() { return PointInTimeTable; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PointInTimeTableWithRouter", function() { return PointInTimeTableWithRouter; });
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @elastic/eui */ "@elastic/eui");
/* harmony import */ var _elastic_eui__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_elastic_eui__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _osd_i18n_react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @osd/i18n/react */ "@osd/i18n/react");
/* harmony import */ var _osd_i18n_react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_osd_i18n_react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-router-dom */ "react-router-dom");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_router_dom__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _osd_i18n__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @osd/i18n */ "@osd/i18n");
/* harmony import */ var _osd_i18n__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_osd_i18n__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _src_plugins_opensearch_dashboards_react_public__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../src/plugins/opensearch_dashboards_react/public */ "plugin/opensearchDashboardsReact/public");
/* harmony import */ var _src_plugins_opensearch_dashboards_react_public__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_src_plugins_opensearch_dashboards_react_public__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _point_in_time_flyout__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../point_in_time_flyout */ "./components/point_in_time_flyout/index.ts");
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







const pagination = {
  initialPageSize: 10,
  pageSizeOptions: [5, 10, 25, 50]
};
const sorting = {
  sort: {
    field: 'title',
    direction: 'asc'
  }
};
const ariaRegion = _osd_i18n__WEBPACK_IMPORTED_MODULE_4__["i18n"].translate('indexPatternManagement.editIndexPatternLiveRegionAriaLabel', {
  defaultMessage: 'Point in time'
});
const title = _osd_i18n__WEBPACK_IMPORTED_MODULE_4__["i18n"].translate('indexPatternManagement.indexPatternTable.title', {
  defaultMessage: 'Point in time'
});
const item1 = {
  id: 'id1',
  title: 'pit1',
  default: false,
  sort: '0pit1'
};
const item2 = {
  id: 'id2',
  title: 'pit2',
  default: false,
  sort: '1pit2'
};
async function getPits(savedObjects) {
  return savedObjects.find({
    type: 'point-in-time',
    perPage: 10000
  }).then(response => response.savedObjects.map(pattern => {
    console.log(pattern);
    const id = pattern.id;
    const name = pattern.get('name');
    return {
      id,
      title: name,
      // the prepending of 0 at the default pattern takes care of prioritization
      // so the sorting will but the default index on top
      // or on bottom of a the table
      sort: `${name}`,
      default: false
    };
  }).sort((a, b) => {
    if (a.sort < b.sort) {
      return -1;
    } else if (a.sort > b.sort) {
      return 1;
    } else {
      return 0;
    }
  })) || [];
}
const PointInTimeTable = _ref => {
  let {
    canSave,
    history
  } = _ref;
  const [error, setError] = Object(react__WEBPACK_IMPORTED_MODULE_3__["useState"])();
  const tableRef = Object(react__WEBPACK_IMPORTED_MODULE_3__["useRef"])();
  const [pits, setPits] = Object(react__WEBPACK_IMPORTED_MODULE_3__["useState"])([item1, item2]);
  const [selection, setSelection] = Object(react__WEBPACK_IMPORTED_MODULE_3__["useState"])([]);
  const {
    setBreadcrumbs,
    savedObjects,
    uiSettings,
    chrome,
    docLinks,
    application,
    http,
    data
  } = Object(_src_plugins_opensearch_dashboards_react_public__WEBPACK_IMPORTED_MODULE_5__["useOpenSearchDashboards"])().services;
  Object(react__WEBPACK_IMPORTED_MODULE_3__["useEffect"])(() => {
    (async function () {
      const pits1 = await getPits(savedObjects.client);
      setPits(pits1);
      var names = gettedIndexPatterns.map(function (item) {
        return item['title'];
      });
      setIndexPatterns(gettedIndexPatterns);
      console.log(gettedIndexPatterns);
      setLoading(false);
    })();
  }, [savedObjects.client]); // const renderToolsLeft = () => {
  //     if (selection.length === 0) {
  //         return;
  //     }
  //     const onClick = () => {
  //         //store.deleteUsers(...selection.map((user) => user.id));
  //         for(const id of selection) {
  //             const findIndex = pits.findIndex(a => a.id === id.id)
  //             findIndex !== -1 && pits.splice(findIndex , 1)
  //             setPits(pits);
  //             console.log(id);
  //         }
  //         setSelection([]);
  //     };
  //     return (
  //         <EuiButton color="danger" iconType="trash" onClick={onClick}>
  //             Delete {selection.length} point in time searches
  //         </EuiButton>
  //     );
  // };

  const renderToolsRight = () => {
    const onClick = () => {
      //store.deleteUsers(...selection.map((user) => user.id));
      for (const id of selection) {
        const findIndex = pits.findIndex(a => a.id === id.id);
        findIndex !== -1 && pits.splice(findIndex, 1);
        setPits(pits);
        console.log(id);
      }

      setSelection([]);
    };

    return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_0__["EuiButton"], {
      color: "danger",
      iconType: "trash",
      onClick: onClick,
      isDisabled: selection.length === 0
    }, "Delete"); // return [
    //     <EuiButton
    //         key="loadUsers"
    //         onClick={() => {
    //             //loadUsers();
    //         }}
    //         isDisabled={selection.length === 0}
    //     >
    //         Load Users
    //     </EuiButton>,
    //     <EuiButton
    //         key="loadUsersError"
    //         onClick={() => {
    //             //loadUsersWithError();
    //         }}
    //         isDisabled={false}
    //     >
    //         Load Users (Error)
    //     </EuiButton>,
    // ];
  };

  const search = {
    toolsRight: renderToolsRight(),
    box: {
      incremental: true,
      schema: {
        fields: {
          title: {
            type: 'string'
          }
        }
      }
    }
  };
  const selectionValue = {
    selectable: () => true,
    selectableMessage: selectable => !selectable ? 'User is currently offline' : undefined,
    onSelectionChange: selection => setSelection(selection),
    initialSelected: []
  }; // const {
  //     savedObjects,
  //     uiSettings,
  //     chrome,
  //     docLinks,
  //     application,
  //     http,
  //     data,
  // } = useOpenSearchDashboards<PointInTimeManagmentContext>().services;
  // useEffect(() => {
  // }, []);
  // const loadSources = () => {
  // };
  // useEffect(() => {
  // }, []);

  const columns = [{
    field: 'title',
    name: 'Name',
    render: (title, object) => {
      return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement("span", null, object.title);
    },
    dataType: 'string',
    sortable: _ref2 => {
      let {
        sort
      } = _ref2;
      return sort;
    }
  }]; // return (
  //     <EuiPageContent data-test-subj="pointInTimeTable" role="region" aria-label={ariaRegion}>
  //       <EuiFlexGroup justifyContent="spaceBetween">
  //         <EuiFlexItem grow={false}>
  //           <EuiTitle>
  //             <h2>{title}</h2>
  //           </EuiTitle>
  //           <EuiSpacer size="s" />
  //           <EuiText>
  //             <p>
  //               <FormattedMessage
  //                 id="indexPatternManagement.indexPatternTable.indexPatternExplanation"
  //                 defaultMessage="Create and manage point in time."
  //               />
  //             </p>
  //           </EuiText>
  //         </EuiFlexItem>
  //         <EuiFlexItem grow={false}><PointInTimeFlyout/></EuiFlexItem>
  //       </EuiFlexGroup>
  //       <EuiSpacer />
  //       <EuiInMemoryTable
  //             allowNeutralSort={false}
  //             itemId="id"
  //             isSelectable={true}
  //             items={pits}
  //             columns={columns1}
  //             pagination={pagination}
  //             sorting={sorting}
  //             search={search}
  //             selection={selectionValue}
  //         />
  //     </EuiPageContent>
  //   );

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_0__["EuiPageContent"], {
    "data-test-subj": "pointInTimeTable",
    role: "region",
    "aria-label": ariaRegion
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_0__["EuiFlexGroup"], {
    justifyContent: "spaceBetween"
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_0__["EuiFlexItem"], {
    grow: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_0__["EuiTitle"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement("h2", null, title)), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_0__["EuiSpacer"], {
    size: "s"
  }), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_0__["EuiText"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement("p", null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(_osd_i18n_react__WEBPACK_IMPORTED_MODULE_1__["FormattedMessage"], {
    id: "indexPatternManagement.indexPatternTable.indexPatternExplanation",
    defaultMessage: "Create and manage the point in time searches that help you retrieve your data from OpenSearch."
  })))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_0__["EuiFlexItem"], {
    grow: false
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(_point_in_time_flyout__WEBPACK_IMPORTED_MODULE_6__["PointInTimeFlyout"], null))), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_0__["EuiSpacer"], null), /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_3___default.a.createElement(_elastic_eui__WEBPACK_IMPORTED_MODULE_0__["EuiInMemoryTable"], {
    allowNeutralSort: false,
    itemId: "id",
    isSelectable: true,
    items: pits,
    columns: columns,
    pagination: pagination,
    sorting: sorting,
    search: search,
    selection: selectionValue
  }));
};
const PointInTimeTableWithRouter = Object(react_router_dom__WEBPACK_IMPORTED_MODULE_2__["withRouter"])(PointInTimeTable);

/***/ }),

/***/ "./public/components/app.tsx":
/*!***********************************!*\
  !*** ./public/components/app.tsx ***!
  \***********************************/
/*! exports provided: MyPluginNameApp */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MyPluginNameApp", function() { return MyPluginNameApp; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _osd_i18n__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @osd/i18n */ "@osd/i18n");
/* harmony import */ var _osd_i18n__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_osd_i18n__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _osd_i18n_react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @osd/i18n/react */ "@osd/i18n/react");
/* harmony import */ var _osd_i18n_react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_osd_i18n_react__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-router-dom */ "react-router-dom");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_router_dom__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _components_point_in_time_table__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../components/point_in_time_table */ "./components/point_in_time_table/index.ts");
/* harmony import */ var _src_plugins_opensearch_dashboards_react_public__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../../../src/plugins/opensearch_dashboards_react/public */ "plugin/opensearchDashboardsReact/public");
/* harmony import */ var _src_plugins_opensearch_dashboards_react_public__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_src_plugins_opensearch_dashboards_react_public__WEBPACK_IMPORTED_MODULE_5__);






const MyPluginNameApp = _ref => {
  let {
    basename,
    notifications,
    http,
    navigation,
    savedObjects,
    data
  } = _ref;
  // Use React hooks to manage state.
  const [timestamp, setTimestamp] = Object(react__WEBPACK_IMPORTED_MODULE_0__["useState"])();

  const onClickHandler = () => {
    // Use the core http service to make a response to the server API.
    http.get('/api/my_plugin_name/example').then(res => {
      setTimestamp(res.time); // Use the core notifications service to display a success message.

      notifications.toasts.addSuccess(_osd_i18n__WEBPACK_IMPORTED_MODULE_1__["i18n"].translate('myPluginName.dataUpdated', {
        defaultMessage: 'Data updated'
      }));
    });
  };

  const deps = {
    savedObjects,
    notifications,
    http,
    data
  }; // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  // return (
  //   <Router basename={basename}>
  //     <I18nProvider>
  //       <>
  //         <navigation.ui.TopNavMenu
  //           appName={PLUGIN_ID}
  //           showSearchBar={true}
  //           useDefaultBehaviors={true}
  //         />
  //         <EuiPage restrictWidth="1000px">
  //           <EuiPageBody component="main">
  //             <EuiPageHeader>
  //               <EuiTitle size="l">
  //                 <h1>
  //                   <FormattedMessage
  //                     id="myPluginName.helloWorldText"
  //                     defaultMessage="{name}"
  //                     values={{ name: PLUGIN_NAME }}
  //                   />
  //                 </h1>
  //               </EuiTitle>
  //             </EuiPageHeader>
  //             <EuiPageContent>
  //               <EuiPageContentHeader>
  //                 <EuiTitle>
  //                   <h2>
  //                     <FormattedMessage
  //                       id="myPluginName.congratulationsTitle"
  //                       defaultMessage="Congratulations, you have successfully created a new OpenSearch Dashboards Plugin 11!"
  //                     />
  //                   </h2>
  //                 </EuiTitle>
  //               </EuiPageContentHeader>
  //               <EuiPageContentBody>
  //                 <EuiText>
  //                   <p>
  //                     <FormattedMessage
  //                       id="myPluginName.content"
  //                       defaultMessage="Look through the generated code and check out the plugin development documentation 1."
  //                     />
  //                   </p>
  //                   <EuiHorizontalRule />
  //                   <p>
  //                     <FormattedMessage
  //                       id="myPluginName.timestampText"
  //                       defaultMessage="Last timestamp: {time}"
  //                       values={{ time: timestamp ? timestamp : 'Unknown' }}
  //                     />
  //                   </p>
  //                   <EuiButton type="primary" size="s" onClick={onClickHandler}>
  //                     <FormattedMessage id="myPluginName.buttonText" defaultMessage="Get data" />
  //                   </EuiButton>
  //                 </EuiText>
  //               </EuiPageContentBody>
  //             </EuiPageContent>
  //           </EuiPageBody>
  //         </EuiPage>
  //       </>
  //     </I18nProvider>
  //   </Router>
  // );

  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react_router_dom__WEBPACK_IMPORTED_MODULE_3__["BrowserRouter"], {
    basename: basename
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_src_plugins_opensearch_dashboards_react_public__WEBPACK_IMPORTED_MODULE_5__["OpenSearchDashboardsContextProvider"], {
    services: deps
  }, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_osd_i18n_react__WEBPACK_IMPORTED_MODULE_2__["I18nProvider"], null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement(_components_point_in_time_table__WEBPACK_IMPORTED_MODULE_4__["PointInTimeTableWithRouter"], {
    canSave: true
  })))));
};

/***/ })

}]);
//# sourceMappingURL=myPluginName.chunk.0.js.map