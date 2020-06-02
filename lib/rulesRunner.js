"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.normRules = normRules;
exports.default = rulesRunner;

var _actions = require("./actions");

var _actions2 = _interopRequireDefault(_actions);

var _lodash = require("lodash.clonedeep");

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require("react-jsonschema-form/lib/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function doRunRules(engine, formData, schema, uiSchema) {
  var extraActions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  var schemaCopy = (0, _lodash2.default)(schema);
  var uiSchemaCopy = (0, _lodash2.default)(uiSchema);
  var formDataCopy = (0, _lodash2.default)(formData);

  var res = engine.run(formData).then(function (events) {
    events.forEach(function (event) {
      return (0, _actions2.default)(event, schemaCopy, uiSchemaCopy, formDataCopy, extraActions);
    });
  });

  return res.then(function () {
    return {
      schema: schemaCopy,
      uiSchema: uiSchemaCopy,
      formData: formDataCopy
    };
  });
}

function normRules(rules) {
  return rules.sort(function (a, b) {
    if (a.order === undefined) {
      return b.order === undefined ? 0 : 1;
    }
    return b.order === undefined ? -1 : a.order - b.order;
  });
}

function rulesRunner(schema, uiSchema, rules, engine, extraActions) {
  engine = typeof engine === "function" ? new engine([], schema) : engine;
  normRules(rules).forEach(function (rule) {
    return engine.addRule(rule);
  });

  return function (formData) {
    if (formData === undefined || formData === null) {
      return Promise.resolve({ schema: schema, uiSchema: uiSchema, formData: formData });
    }

    return doRunRules(engine, formData, schema, uiSchema, extraActions).then(function (conf) {
      if ((0, _utils.deepEquals)(conf.formData, formData)) {
        return conf;
      } else {
        return doRunRules(engine, conf.formData, schema, uiSchema, extraActions);
      }
    });
  };
}