"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.default = applyRules;

var _react = require("react");

var _react2 = _interopRequireDefault(_react);

var _propTypes = require("prop-types");

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = require("react-jsonschema-form/lib/utils");

var _utils2 = require("./utils");

var _rulesRunner = require("./rulesRunner");

var _rulesRunner2 = _interopRequireDefault(_rulesRunner);

var _actions = require("./actions");

var _validateAction = require("./actions/validateAction");

var _validateAction2 = _interopRequireDefault(_validateAction);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function applyRules(schema, uiSchema, rules, Engine) {
  var extraActions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  if ((0, _utils2.isDevelopment)()) {
    var propTypes = {
      Engine: _propTypes2.default.func.isRequired,
      rules: _propTypes2.default.arrayOf(_propTypes2.default.shape({
        conditions: _propTypes2.default.object.isRequired,
        order: _propTypes2.default.number,
        event: _propTypes2.default.oneOfType([_propTypes2.default.shape({
          type: _propTypes2.default.string.isRequired
        }), _propTypes2.default.arrayOf(_propTypes2.default.shape({
          type: _propTypes2.default.string.isRequired
        }))])
      })).isRequired,
      extraActions: _propTypes2.default.object
    };

    _propTypes2.default.checkPropTypes(propTypes, { rules: rules, Engine: Engine, extraActions: extraActions }, "props", "react-jsonschema-form-manager");

    rules.reduce(function (agg, _ref) {
      var event = _ref.event;
      return agg.concat(event);
    }, []).forEach(function (_ref2) {
      var type = _ref2.type,
          params = _ref2.params;

      // Find associated action
      var action = extraActions[type] ? extraActions[type] : _actions.DEFAULT_ACTIONS[type];
      if (action === undefined) {
        (0, _utils2.toError)("Rule contains invalid action \"" + type + "\"");
        return;
      }

      (0, _validateAction2.default)(action, params, schema, uiSchema);
    });
  }

  var runRules = (0, _rulesRunner2.default)(schema, uiSchema, rules, Engine, extraActions);

  return function (FormComponent) {
    var FormWithConditionals = function (_Component) {
      _inherits(FormWithConditionals, _Component);

      function FormWithConditionals(props) {
        _classCallCheck(this, FormWithConditionals);

        var _this = _possibleConstructorReturn(this, (FormWithConditionals.__proto__ || Object.getPrototypeOf(FormWithConditionals)).call(this, props));

        _this.handleChange = _this.handleChange.bind(_this);
        _this.updateConf = _this.updateConf.bind(_this);
        var _this$props$formData = _this.props.formData,
            formData = _this$props$formData === undefined ? {} : _this$props$formData;


        _this.shouldUpdate = false;
        _this.state = { schema: schema, uiSchema: uiSchema };
        _this.updateConf(formData);
        return _this;
      }

      _createClass(FormWithConditionals, [{
        key: "componentWillReceiveProps",
        value: function componentWillReceiveProps(nextProps) {
          var formDataChanged = nextProps.formData && !(0, _utils.deepEquals)(nextProps.formData, this.formData);
          if (formDataChanged) {
            this.updateConf(nextProps.formData);
            this.shouldUpdate = true;
          } else {
            this.shouldUpdate = this.shouldUpdate || !(0, _utils.deepEquals)(nextProps, Object.assign({}, this.props, { formData: nextProps.formData }));
          }
        }
      }, {
        key: "updateConf",
        value: function updateConf(formData) {
          var _this2 = this;

          this.formData = formData;
          return runRules(formData).then(function (conf) {
            var dataChanged = !(0, _utils.deepEquals)(_this2.formData, conf.formData);
            _this2.formData = conf.formData;

            var newState = { schema: conf.schema, uiSchema: conf.uiSchema };
            var confChanged = !(0, _utils.deepEquals)(newState, _this2.state);
            if (dataChanged || confChanged) {
              _this2.shouldUpdate = true;
              _this2.setState(newState);
            }

            return conf;
          });
        }
      }, {
        key: "handleChange",
        value: function handleChange(change) {
          var formData = change.formData;

          var updTask = this.updateConf(formData);

          var onChange = this.props.onChange;

          if (onChange) {
            updTask.then(function (conf) {
              var updChange = Object.assign({}, change, conf);
              onChange(updChange);
            });
          }
        }
      }, {
        key: "shouldComponentUpdate",
        value: function shouldComponentUpdate() {
          if (this.shouldUpdate) {
            this.shouldUpdate = false;
            return true;
          }
          return false;
        }
      }, {
        key: "render",
        value: function render() {
          // Assignment order is important
          var formConf = Object.assign({}, this.props, this.state, {
            onChange: this.handleChange,
            formData: this.formData
          });
          return _react2.default.createElement(FormComponent, formConf);
        }
      }]);

      return FormWithConditionals;
    }(_react.Component);

    return FormWithConditionals;
  };
}